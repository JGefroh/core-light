import { default as System } from '@core/system';
import { default as Entity } from '@core/entity.js';


import PositionComponent from '@game/engine/position/position-component';
import ParticleEmitterComponent from './particle-emitter-component';


export default class ParticleSystem extends System {
    constructor() {
        super();

        this.particles = [];
        this.emitters = [];

        this.addHandler('EMIT_PARTICLES', (payload) => {
            this._createEmitter(payload);
        });

        this.send("REGISTER_RENDER_LAYER", {
            layer: 'PARTICLES_BEFORE_LIGHTING',
            render: (renderOptions) => {
                this._render(this.particles, renderOptions)
            }
        })
    }

    _createEmitter(payload) {
        const now = Date.now();

        let entity = new Entity()
        entity.addComponent(new PositionComponent(
            {
                width: 1,
                height: 1,
                xPosition: payload.xPosition,
                yPosition: payload.yPosition,
            }
        ));

        entity.addComponent(new ParticleEmitterComponent({
            nextEmissionTime: now,
            lastEmissionTime: now,
            ...payload
        }));
      
        this._core.addEntity(entity);
    }

    _emitParticles(emitter) {
        const {
            particleCount,
            xPosition,
            yPosition,
            particleLifetimeMin,
            particleLifetimeMax,
            particleHeightMin,
            particleHeightMax,
            particleWidthMin,
            particleWidthMax,
            particleShape,
            particleColors,
            particleSpeedMin,
            particleSpeedMax,
            particleEmissionAngleDegreesMin,
            particleEmissionAngleDegreesMax,
            particleSpawnRadius = 0,
        } = emitter;

        for (let i = 0; i < particleCount; i++) {
            const lifetime = this._rand(particleLifetimeMin, particleLifetimeMax);
            const width = this._rand(particleWidthMin, particleWidthMax);
            const height = this._rand(particleHeightMin, particleHeightMax);
            const angleDeg = this._rand(particleEmissionAngleDegreesMin, particleEmissionAngleDegreesMax);
            const angleRad = angleDeg * Math.PI / 180;
            const speed = this._rand(particleSpeedMin, particleSpeedMax);
    
            const velocityX = Math.cos(angleRad) * speed;
            const velocityY = Math.sin(angleRad) * speed;
            const color = Array.isArray(particleColors)
                ? particleColors[Math.floor(Math.random() * particleColors.length)]
                : particleColors;
    
            // Apply spawn radius offset
            const theta = Math.random() * 2 * Math.PI;
            const radius = Math.sqrt(Math.random()) * particleSpawnRadius;
            const offsetX = Math.cos(theta) * radius;
            const offsetY = Math.sin(theta) * radius;
    
            this.particles.push({
                xPosition: xPosition + offsetX,
                yPosition: yPosition + offsetY,
                vx: velocityX,
                vy: velocityY,
                width,
                height,
                shape: particleShape,
                color,
                age: 0,
                lifetime,
            });
        }
    }

    work() {
        const now = Date.now();
        let deltaMs = now - this.lastRanTimestamp;

        // Emit particles from emitters if due
        this.workForTag('ParticleEmitter', (tag) => {
            let emitter = tag.getEmitterDetails();
            if (now >= emitter.nextEmissionTime) {
                if (!emitter.particleEmissionCyclesMax || emitter.particleEmissionCyclesCurrent < emitter.particleEmissionCyclesMax) {
                    this._emitParticles(emitter);
                    tag.incrementParticleEmissionCyclesCurrent();
                    emitter.nextEmissionTime = now + (emitter.particleEmitFrequencyInMs || 1000);
                }
            }
        });

        // Update particles
        this.particles = this.particles.filter(p => {
            p.age += deltaMs;
            if (p.age >= p.lifetime) return false;

            p.xPosition += p.vx * (deltaMs / 1000);
            p.yPosition += p.vy * (deltaMs / 1000);
            return true;
        });

    }

    _render(particles, renderOptions) {
        const viewport = renderOptions.viewport;
        const ctx = renderOptions.layerCanvasCtx;
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        if (!ctx) return;

        ctx.save();

        for (const particle of particles) {
            ctx.fillStyle = particle.color;
            const screenX = (particle.xPosition * viewport.scale) - viewport.xPosition;
            const screenY = (particle.yPosition * viewport.scale) - viewport.yPosition;

            if (particle.shape === 'circle') {
                ctx.beginPath();
                ctx.arc(
                    screenX,
                    screenY,
                    particle.width / 2, // assume width == height for circle
                    0,
                    2 * Math.PI
                );
                ctx.fill();
            } else { // default to rectangle
                ctx.fillRect(
                    screenX - particle.width / 2,
                    screenY - particle.height / 2,
                    particle.width,
                    particle.height
                );
            }
        }

        ctx.restore();
    }

    _rand(min, max) {
        return Math.random() * (max - min) + min;
    }
}