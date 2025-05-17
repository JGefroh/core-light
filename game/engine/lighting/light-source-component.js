import { default as Component } from '@core/component';

export default class LightSourceComponent extends Component {
    constructor(payload = {}) {
        super();
        this.componentType = 'LightSourceComponent';

        // Light properties
        this.lightType = payload.lightType || 'point' // point, cone, self, null
        this.lightStyle = payload.lightStyle || 'normal'; // normal, flicker
        this.lightRefresh = payload.lightRefresh || 'static'; // static, dynamic
        this.maxDistance = payload.maxDistance || 400;
        this.disableOverride = payload.disableOverride; // Disable whether other entities can control light state
        this.isOn = payload.isOn == undefined ? true : payload.isOn;

        // Flicker
        this.flickerStateOn = true;
        this.flickerOnMinimumLengthMs = payload.flickerOnMinimumLengthMs || 10; // The minimum amount of time to remain on
        this.flickerOffMinimumLengthMs = payload.flickerOffMinimumLengthMs || 10; // The minimum amount of time to remain off
        this.flickerOffRandomMs = payload.flickerOffRandomMs || 100;  // The maximum amount to remain off after the minimum
        this.flickerOnRandomMs = payload.flickerOnRandomMs || 3000;  // The maximum amount of time to remain on after the minimum
        // For lightType == 'cone'
        this.coneDegrees = payload.coneDegrees || 45;

        // For lightType == 'self'
        this.padding = payload.padding || 0; // If self-illuminated, how far the light goes out



        // Cache for light
        this.rays = [];
    }
} 