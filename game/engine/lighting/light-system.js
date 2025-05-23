import { default as System } from '@core/system';

export default class LightSystem extends System {
    constructor() {
        super();
        this.shadowColor = 'rgba(0, 0, 0, 1)';
        this.trigonometryCache = {}
        this.forceRecalculateLight = false;
    }

    initialize() {
        if (window.location.href.indexOf('nolight') == -1) {
            this.send("REGISTER_RENDER_LAYER", {
                layer: 'LIGHTING',
                layerRenderLibrary: 'webgl2', 
                applyOptions: {
                    globalCompositeOperation: 'multiply',
                    filter: 'blur(4px)'
                },
                render: this._render.bind(this)
            })
        }
        
        this._initializeTrigCache();
        this.addHandler('FORCE_RECALCULATE_LIGHT', (payload) => {
            this.forceRecalculateLight = true;
        });
    }

    _initializeTrigCache() {
        this.TWO_PI = Math.PI * 2;
        this.ANGLE_STEP = this.TWO_PI / 720; // half-degree resolution
        this.COS = []
        this.SIN = []
        for (let i = 0; i < 720; i++) {
            this.SIN[i] = Math.sin(i * this.ANGLE_STEP);
            this.COS[i] = Math.cos(i * this.ANGLE_STEP);
        }
    }

    work() {
    }

    _render(renderOptions) {
        this._updateLighting(renderOptions.layerCanvasCtx, renderOptions.viewport, renderOptions.renderer);
    }

    _updateLighting(layerCtx, viewport, renderer) {
        let sounds = [
            'switch-1.mp3',
            'switch-2.mp3',
            'switch-3.mp3',
            'switch-4.mp3',
        ]
        this.workForTag('Lightable', (lightable, entity) => {
            if (!lightable.isOn() && !this.forceRecalculateLight) {
                return;
            }
            if (lightable.shouldFlickerOff(true) && !this.forceRecalculateLight) {
                this.send("PLAY_AUDIO", {
                    audioKey: this._randomFrom(sounds),
                    volume: 0.2
                });
            }
            if (lightable.shouldFlickerOff() && !this.forceRecalculateLight) {
                return;
            }
            this._calculateLightRays(lightable)
            this._renderLightMask(layerCtx, viewport, renderer, lightable); 
        })

        this.forceRecalculateLight = false;
    }


    /////
    // Calculate Light Rays for each kind of light
    ////
    
    _calculateLightRays(lightable) {
        if (lightable.getRays().length > 0 && lightable.getLightRefresh() == 'static' && !this.forceRecalculateLight) {
            return;
        }
    
        if (lightable.getLightType() === 'self') {
            this._calculateRaysForSelfIllumination(lightable);
            return;
        }
    
        let params = this._getParametersForLightType(lightable);
    
        const renderable = this.getTag('Renderable');
        const shadowableEdges = [];
    
        // Collect shadowable edges once
        this.workForTag('Shadowable', (shadowable, entity) => {
            if (shadowable.getEntity() === lightable.getEntity()) return;
            if (this._shouldIgnoreShadowable(lightable, shadowable)) return;
    
            renderable.setEntity(entity);
            let edges = this._getCacheEdges(shadowable, renderable);
            shadowableEdges.push(edges);
        });
    
        const rays = [];
    
        for (let i = 0; i < params.rayCount; i++) {
            let angle = this._generateRayAngle(i, params.rayCount, params.startAngle, params.endAngle);
            const cacheIndex = Math.floor((angle % (this.TWO_PI)) / this.ANGLE_STEP);
    
            let dirX = this.COS[cacheIndex];
            let dirY = this.SIN[cacheIndex];
    
            let hit = this._castRay(lightable.getXPosition(), lightable.getYPosition(), dirX, dirY, lightable.getMaxDistance(), shadowableEdges);
    
            rays.push({
                x: hit.x,
                y: hit.y,
                angle: angle,
            });
        }
    
        lightable.setRays(rays);
    }
    

    _calculateRaysForSelfIllumination(lightable) {
        const sourceX = lightable.getXPosition();
        const sourceY = lightable.getYPosition();
        const renderable = this.getTag('Renderable');
        renderable.setEntity(lightable.getEntity());

        const padding = lightable.getPadding();
        const rotation = lightable.getAngleDegrees() || 0;

        const edges = this._getRectangleEdges(renderable, rotation);
        const rays = [];

        for (const [p1, _] of edges) {
            const dx = p1.x - sourceX;
            const dy = p1.y - sourceY;
            const dist = Math.hypot(dx, dy);
            const scale = (dist + padding) / dist || 1;

            rays.push({
                x: sourceX + dx * scale,
                y: sourceY + dy * scale,
                angle: Math.atan2(dy, dx)
            });
        }

        lightable.setRays(rays);
    }

    _generateRayAngle(i, rayCount, startAngle, endAngle) {
        let angle = startAngle + (i / (rayCount - 1)) * (endAngle - startAngle);
        return (angle + this.TWO_PI) % (this.TWO_PI);
    }
        
    _castRay(sourceX, sourceY, destinationX, destinationY, maxDistance, shadowableEdges) {
        let intersections = [];
    
        for (const edges of shadowableEdges) {
            for (const [edgePoint1, edgePoint2] of edges) {
                const hit = this._rayIntersectSegment(
                    sourceX,
                    sourceY,
                    destinationX,
                    destinationY,
                    edgePoint1,
                    edgePoint2
                );
                if (hit && hit.distance <= maxDistance) {
                    intersections.push(hit);
                }
            }
        }
    
        intersections.sort((a, b) => a.distance - b.distance);
    
        let finalX = sourceX + destinationX * maxDistance;
        let finalY = sourceY + destinationY * maxDistance;
    
        if (intersections.length >= 2) {
            const second = intersections[1];
            const backNudge = this._calculateDirectionNudge(-destinationX, -destinationY, 0.1);
            finalX = second.x + backNudge.x;
            finalY = second.y + backNudge.y;
        }
    
        return { x: finalX, y: finalY };
    }

    _shouldIgnoreShadowable(lightable, shadowable) {
        const dx = shadowable.getXPosition() - lightable.getXPosition();
        const dy = shadowable.getYPosition() - lightable.getYPosition();
        const entityRadius = Math.hypot(shadowable.getWidth(), shadowable.getHeight()) / 2;
        const maxReach = lightable.getMaxDistance() + entityRadius;

        if ((dx * dx + dy * dy) > (maxReach * maxReach)) {
            return true;
        }
    }

    _getCacheEdges(shadowable, renderable) {
        let edges = shadowable.getRectangleEdgesCache();
        if (!edges) {
            edges = this._getRectangleEdges(renderable)
            shadowable.setRectangleEdgesCache(edges)
        }
        return edges;
    }

    _getParametersForLightType(lightable) {
        if (lightable.getLightType() === 'cone') {
            const angleRadians = lightable.getAngleDegrees() * Math.PI / 180;
            const coneRadians = lightable.getConeDegrees() * Math.PI / 360;
    
            let startAngle = (angleRadians - coneRadians) % this.TWO_PI;
            let endAngle = (angleRadians + coneRadians) % this.TWO_PI;
    
            if (endAngle < startAngle) {
                endAngle += this.TWO_PI;
            }

            let rayCount = lightable.getConeDegrees() + 100
            return {rayCount: rayCount, startAngle: startAngle, endAngle: endAngle};
        }
        else {
            return {rayCount: Math.floor(400), startAngle: 0, endAngle: this.TWO_PI};
        }
    }

    /////
    // Render Light Mask Layer
    /////

    _renderLightMask(renderCtx, viewport, renderer, lightable) {
        if (lightable.getLightType() == 'cone') {
            this._renderLightMaskForCone(renderCtx, viewport, renderer, lightable);
        }
        else {
            this._renderLightMaskForNonCone(renderCtx, viewport, renderer, lightable);
        }
    }

    _renderLightMaskForCone(renderCtx, viewport, renderer, lightable) {
        if (!lightable.getRays().length) {
            return;
        }

        let rays = lightable.getRays();

        const startAngleRadians = rays[0].angle;
        const endAngleRadians = rays[rays.length - 1].angle;
        const softnessRadians = 10 * Math.PI / 180; // 10 degrees in radians
        
        renderer.drawLightPath(renderCtx, viewport, 
            lightable.getXPosition(), 
            lightable.getYPosition(), 
            lightable.getRays(), 
            {
                returnToOrigin: false,
                arcSize: lightable.getMaxDistance(),
                startAngleRadians: startAngleRadians,
                endAngleRadians: endAngleRadians,
                softnessRadians: softnessRadians,
                fill: [
                    [0.0, 'rgba(255, 250, 230, 1.0)'],
                    [0.1, 'rgba(255, 245, 200, 1.0)'],
                    [0.8, 'rgba(255, 220, 150, 0.5)'],
                    [1.0,  'rgba(255, 220, 150, 0)'],
                ]
            }
        );
    }

    _renderLightMaskForNonCone(renderCtx, viewport, renderer, lightable) {
        renderer.drawLightPath(renderCtx, viewport, 
            lightable.getXPosition(), 
            lightable.getYPosition(), 
            lightable.getRays(), 
            {
                returnToOrigin: true,
                arcSize: lightable.getMaxDistance(),
                fill: [
                    [0.0, 'rgba(255, 250, 230, 1.0)'],
                    [0.1, 'rgba(255, 245, 200, 1.0)'],
                    [0.8, 'rgba(255, 220, 150, 0.5)'],
                    [1.0,  'rgba(255, 220, 150, 0)'],
                ]
            }
        );
    }

    ////
    // Helpers
    ////
    _getRectangleEdges(renderable, rotationDegrees = 0) {
        const hw = renderable.getWidth() / 2;
        const hh = renderable.getHeight() / 2;
        const cx = renderable.getXPosition();
        const cy = renderable.getYPosition();
    
        if (rotationDegrees === 0) {
            const topLeft = { x: cx - hw, y: cy - hh };
            const topRight = { x: cx + hw, y: cy - hh };
            const bottomRight = { x: cx + hw, y: cy + hh };
            const bottomLeft = { x: cx - hw, y: cy + hh };
            return [
                [topLeft, topRight],
                [topRight, bottomRight],
                [bottomRight, bottomLeft],
                [bottomLeft, topLeft]
            ];
        }
    
        const angleRad = rotationDegrees * (Math.PI / 180);
        const localCorners = [
            { x: -hw, y: -hh },
            { x: hw, y: -hh },
            { x: hw, y: hh },
            { x: -hw, y: hh }
        ];
    
        const worldCorners = localCorners.map(corner => {
            const xRot = corner.x * Math.cos(angleRad) - corner.y * Math.sin(angleRad);
            const yRot = corner.x * Math.sin(angleRad) + corner.y * Math.cos(angleRad);
            return {
                x: cx + xRot,
                y: cy + yRot
            };
        });
    
        return [
            [worldCorners[0], worldCorners[1]],
            [worldCorners[1], worldCorners[2]],
            [worldCorners[2], worldCorners[3]],
            [worldCorners[3], worldCorners[0]]
        ];
    }

    _rayIntersectSegment(rayOriginX, rayOriginY, rayDirectionX, rayDirectionY, edgePoint1, edgePoint2) {
        const segmentDeltaX = edgePoint2.x - edgePoint1.x;
        const segmentDeltaY = edgePoint2.y - edgePoint1.y;
    
        const denominator = rayDirectionX * segmentDeltaY - rayDirectionY * segmentDeltaX;
        if (denominator === 0) {
            // Lines are parallel; no intersection
            return null;
        }
    
        const originToSegmentX = edgePoint1.x - rayOriginX;
        const originToSegmentY = edgePoint1.y - rayOriginY;
    
        const rayDistanceFactor = (originToSegmentX * segmentDeltaY - originToSegmentY * segmentDeltaX) / denominator;
        const segmentIntersectionFactor = (originToSegmentX * rayDirectionY - originToSegmentY * rayDirectionX) / denominator;
    
        const isIntersectionOnRay = rayDistanceFactor >= 0;
        const isIntersectionOnSegment = segmentIntersectionFactor >= 0 && segmentIntersectionFactor <= 1;
    
        if (isIntersectionOnRay && isIntersectionOnSegment) {
            return {
                x: rayOriginX + rayDistanceFactor * rayDirectionX,
                y: rayOriginY + rayDistanceFactor * rayDirectionY,
                distance: rayDistanceFactor
            };
        }
    
        return null;
    }
    
    _calculateDirectionNudge(dx, dy, amount) {
        const length = Math.hypot(dx, dy);
        if (length === 0) return { x: 0, y: 0 };
    
        return {
            x: (dx / length) * amount,
            y: (dy / length) * amount
        };
    }
    _randomFrom(array) {
        return array[Math.floor(Math.random() * array.length)];
    }
} 

