import { default as System } from '@core/system';
import { default as assetManifest} from './asset-manifest.js'
import { default as mapWarehouse } from '@game/specifics/maps/map-warehouse';
import { default as mapParking } from '@game/specifics/maps/map-parking';

export default class AssetConfigurationSystem extends System {
    constructor(config = {}) {
      super()

      this.send('LOAD_ASSETS', {assetManifest: assetManifest})
      if (config.skipMapLoad) {
        return;
      }
      this.send('LOAD_MAP', mapWarehouse)
      this.send('LOAD_MAP', {...mapParking, xPosition: 310, yPosition: -740})
    }
}