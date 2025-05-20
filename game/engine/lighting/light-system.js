import { default as System } from '@core/system';

export default class LightSystem extends System {
    constructor() {
        super();
        this.shadowColor = 'rgba(0, 0, 0, 1)';
        this.trigonometryCache = {}
    }

    initialize() {

        
        if (window.location.href.indexOf('nolight') == -1) {
            this.send("REGISTER_RENDER_LAYER", {
                layer: 'LIGHTING',
                layerRenderLibrary: 'webgl2', // 2d is interestingly faster than canvas
                applyOptions: {
                    globalCompositeOperation: 'multiply',
                },
                render: this._render.bind(this)
            })
        }
        

        this._initializeTrigCache();
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
        this.workForTag('Lightable', (lightable, entity) => {
            if (!lightable.isOn()) {
                return;
            }
            if (lightable.shouldFlickerOff()) {
                return;
            }
            this._calculateLightRays(lightable)
            this._renderLightMask(layerCtx, viewport, renderer, lightable); 
        })
    }


    /////
    // Calculate Light Rays for each kind of light
    ////
    
    _calculateLightRays(lightable) {
        if (lightable.getRays().length > 0 && lightable.getLightRefresh() == 'static') {
            return;
        }

        if (lightable.getLightType() === 'self') {
            this._calculateRaysForSelfIllumination(lightable);
            return;
        }

        let params = this._getParametersForLightType(lightable);
        
        const rays = [];
        const renderable = this.getTag('Renderable');
    
        for (let i = 0; i < params.rayCount; i++) {
            let angle = this._generateRayAngle(i, params.rayCount, params.startAngle, params.endAngle);
            const cacheIndex = Math.floor((angle % (this.TWO_PI)) / this.ANGLE_STEP);

            let results = this._castRay(lightable.getXPosition(), lightable.getYPosition(), this.COS[cacheIndex], this.SIN[cacheIndex], lightable.getMaxDistance(), renderable, lightable)
    
            rays.push({
                x: results.x, 
                y: results.y, 
                angle: angle
            });
        }
    
        lightable.setRays(rays);
    }

    _getConsistentJitter(lightable, index, jitterAmount = 0.01) {
        return ((((lightable.getXPosition() * 73856093 + lightable.getYPosition() * 19349663 + index * 83492791) % 1000) / 1000) - 0.5) * 2 * jitterAmount;
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
    
    _castRay(sourceX, sourceY, destinationX, destinationY, maxDistance, renderable, lightable) {
        let intersections = [];
    
        this.workForTag('Shadowable', (shadowable, entity) => {
            if (shadowable.getEntity() === lightable.getEntity()) return;
            
            renderable.setEntity(entity);

            let edges = this._getCacheEdges(shadowable, renderable);

            for (const [edgePoint1, edgePoint2] of edges) {
                const hit = this._rayIntersectSegment(sourceX, sourceY, destinationX, destinationY, edgePoint1, edgePoint2);
                if (hit && hit.distance <= maxDistance) {
                    intersections.push(hit);
                }
            }
        });

        intersections.sort((a, b) => a.distance - b.distance);

        let finalX = sourceX + destinationX * maxDistance;
        let finalY = sourceY + destinationY * maxDistance;

        if (intersections.length >= 2) {
            const second = intersections[1];
            const backNudge = this._calculateDirectionNudge(-destinationX, -destinationY, 0.1);
            finalX = second.x + backNudge.x;
            finalY = second.y + backNudge.y;
        }

        return {x: finalX, y: finalY};
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
        renderer.drawLightPath(renderCtx, viewport, 
            lightable.getXPosition(), 
            lightable.getYPosition(), 
            lightable.getRays(), 
            {
                returnToOrigin: lightable.getLightType() == 'cone' ? false : true,
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
} 

