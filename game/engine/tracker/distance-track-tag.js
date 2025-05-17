import { default as Tag } from '@core/tag'

export default class DistanceTrack extends Tag{
  static tagType = 'DistanceTrack'

    constructor() {
        super()
        this.tagType = 'DistanceTrack'
    }

    static isAssignableTo(entity) {
      return entity.hasComponent('PositionComponent') && entity.hasComponent('VectorComponent') && entity.hasComponent('DistanceTrackerComponent');;
    };


    incrementTotalDistance(amount) {
      return this.entity.getComponent('DistanceTrackerComponent').totalDistance += amount
    }

    getTotalDistanceMax() {
      return this.entity.getComponent('DistanceTrackerComponent').totalDistanceMax
    }

    onMaxExceeded() {
      this.entity.getComponent('DistanceTrackerComponent').onMaxExceeded()
    }
  }
  