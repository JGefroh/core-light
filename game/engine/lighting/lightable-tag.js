import { default as Tag } from '@core/tag';

export default class Lightable extends Tag {
    static tagType = 'Lightable';

    constructor() {
        super();
        this.tagType = 'Lightable';
    }

    static isAssignableTo(entity) {
        return entity.hasComponent('PositionComponent') && entity.hasComponent('LightSourceComponent');
    }

    getXPosition() {
        return this.entity.getComponent('PositionComponent').xPosition;
    }

    getYPosition() {
        return this.entity.getComponent('PositionComponent').yPosition;
    }

    getAngleDegrees() {
        return this.entity.getComponent('PositionComponent').angleDegrees
    }

    setRays(rays = []) {
        this.entity.getComponent('LightSourceComponent').rays = rays;
    }

    getRays() {
        return this.entity.getComponent('LightSourceComponent').rays;
    }

    getMaxDistance() {
        return this.entity.getComponent('LightSourceComponent').maxDistance;
    }

    getLightRefresh() {
        return this.entity.getComponent('LightSourceComponent').lightRefresh;
    }

    setMaxDistance(maxDistance) {
        this.entity.getComponent('LightSourceComponent').maxDistance = maxDistance;
    }

    getLightType() {
        return this.entity.getComponent('LightSourceComponent').lightType;
    }

    setLightType(lightType) {
        this.entity.getComponent('LightSourceComponent').lightType = lightType;
    }

    getLightStyle() {
        return this.entity.getComponent('LightSourceComponent').lightStyle;
    }

    setLightStyle(lightStyle) {
        this.entity.getComponent('LightSourceComponent').lightStyle = lightStyle;
    }

    isOn() {
        return this.entity.getComponent('LightSourceComponent').isOn;
    }

    setOn(isOn) {
        this.entity.getComponent('LightSourceComponent').isOn = isOn;
    }

    // For lightType == 'cone'
    getConeDegrees() {
        return this.entity.getComponent('LightSourceComponent').coneDegrees;
    }

    isDisableOverride() {
        return this.entity.getComponent('LightSourceComponent').disableOverride;
    }

    getPadding() {
        return this.entity.getComponent('LightSourceComponent').padding
    }

    shouldFlickerOff(dryRun) {
        if (this.getLightStyle() == 'off') {
            return true;
        }

        if (this.getLightStyle() != 'flicker') {
            return false;
        }

        let lightComponent = this.entity.getComponent('LightSourceComponent')

        let lastFlickerAt = lightComponent.lastFlickerAt
        let nextFlickerAt = lightComponent.nextFlickerAt
        let flickerOnMinimumLengthMs = lightComponent.flickerOnMinimumLengthMs;
        let flickerOffMinimumLengthMs = lightComponent.flickerOffMinimumLengthMs;
        let flickerOffRandomMs = lightComponent.flickerOffRandomMs;
        let flickerOnRandomMs = lightComponent.flickerOnRandomMs;

        if (!dryRun && (!lastFlickerAt || Date.now() >= nextFlickerAt)) {
            lightComponent.lastFlickerAt = Date.now()

            lightComponent.flickerStateOn = !lightComponent.flickerStateOn;

            if (lightComponent.flickerStateOn) {
                lightComponent.nextFlickerAt = Date.now() + (Math.random() * flickerOffRandomMs) + (flickerOffMinimumLengthMs)
            }
            else {
                lightComponent.nextFlickerAt = Date.now() + (Math.random() * flickerOnRandomMs) + (flickerOnMinimumLengthMs)
            }
        }
        else if (dryRun) {
            return (!lastFlickerAt || Date.now() >= nextFlickerAt);
        }
        return lightComponent.flickerStateOn;
    }

    getColors() {
        return this.entity.getComponent('LightSourceComponent').colors;
    }
} 