import { default as Component} from '@core/component'

export default class VectorComponent extends Component {
    constructor(payload = {}) {
        super();
        this.vectors = []
        this.componentType = "VectorComponent"
        this.accelerationMagnitude = payload.accelerationMagnitude || 0;
        this.maxMagnitude = payload.maxMagnitude;
        this.turnSpeed = payload.turnSpeed || 3;
        this.turnMagnitude = payload.turnMagnitude || 0;
        this.bleedAmount = payload.bleedAmount || 0;

        if (payload.xDelta && payload.yDelta) {
            this.addVectorUsingDeltas(payload.xDelta, payload.yDelta, payload.magnitude)
        }
        else if (payload.magnitude && payload.angle) {
            this.addVector(payload.magnitude, payload.angle)
        }

    }

    removeAllVectors() {
        this.vectors = []
    }

    addVector(magnitude, angleDegrees) {
        let coordinates = this._calculateCoordinates(magnitude, angleDegrees);
        this.vectors.push({
            xDelta: coordinates.xDelta,
            yDelta: coordinates.yDelta,
            angleDegrees: angleDegrees,
            magnitude: magnitude,
        });
    }

    addVectorUsingDeltas(xDelta, yDelta, magnitude) {
        if (magnitude) {
            this.addVector(magnitude, this._calculateAngleDegrees(xDelta, yDelta));
        }
        else {
            this.vectors.push({
                xDelta: xDelta,
                yDelta: yDelta,
                angleDegrees: this._calculateAngleDegrees(xDelta, yDelta),
                magnitude: this._calculateMagnitude(xDelta, yDelta),
            });
        }
    }

    hasVector() {
        return this.vectors.length > 0 && this.vectors[0].magnitude > 0;
    }

    calculateTotalVector() {
        let totalVector = {
            xDelta: 0,
            yDelta: 0,
            magnitude: 0,
            angleDegrees: 0,
        }
        if (!this.vectors.length) {
            return totalVector;
        }
        this.vectors.forEach((vector) => {
            totalVector.xDelta += vector.xDelta;
            totalVector.yDelta += vector.yDelta;
        });

        totalVector.angleDegrees = this._calculateAngleDegrees(totalVector.xDelta, totalVector.yDelta);
        totalVector.magnitude = this._calculateMagnitude(totalVector.xDelta, totalVector.yDelta);

        if (this.vectors.length > 5) {
            this.vectors = [totalVector]
        }

        if (this.maxMagnitude) {
            //If max magnitude, we will need to re-calculate the actual coordinate change.
            totalVector.magnitude = Math.min(totalVector.magnitude, this.maxMagnitude)
            let deltas = this._calculateCoordinates(totalVector.magnitude, totalVector.angleDegrees);
            totalVector.xDelta = deltas.xDelta;
            totalVector.yDelta = deltas.yDelta;
        }

        return totalVector;
    }

    _calculateCoordinates(magnitude, angleDegrees) {
        let angleRadians = angleDegrees * Math.PI / 180;
        return {
            xDelta: Math.cos(angleRadians) * magnitude,
            yDelta: Math.sin(angleRadians) * magnitude
        }
    }

    _calculateAngleDegrees(xDelta, yDelta) {
        if (xDelta === 0 && yDelta === 0) {
            return 0;
        }
        let angle = Math.atan2(yDelta, xDelta) * 180 / Math.PI;
        angle = (angle >= 0) ? angle : (360 + angle);
        return angle % 360; 
    }

    _calculateMagnitude(xDelta, yDelta) {
        return Math.sqrt(xDelta*xDelta + yDelta*yDelta)
    }

    getAccelerationMagnitude() {
        return this.accelerationMagnitude;
    }

    setAccelerationMagnitude(magnitude) {
        this.accelerationMagnitude = magnitude;
    }

    bleedVector() {
        // Reduces the vector by a specific amount until it reaches 0.
        // This is useful for momentum.
        if (!this.bleedAmount) {
            return;
        }

        let totalVector = this.calculateTotalVector();
        if (totalVector.magnitude < 0.00001) {
            this.vectors = [] // Clear it out instead of infinitely bleeding.
        }
        else {
            const bleedMagnitude = this.bleedAmount * totalVector.magnitude;
            const oppositeAngle = (totalVector.angleDegrees + 180) % 360;
    
            this.addVector(bleedMagnitude, oppositeAngle);
        }

    }

    bleedAngle() {
        if (!this.bleedAmount || !this.turnMagnitude) {
            return;
        }

        this.turnMagnitude = this.turnMagnitude - (this.bleedAmount * this.turnMagnitude);
        if (this.turnMagnitude < 0.00001) {
            this.turnMagnitude = 0;
        }
    }
}