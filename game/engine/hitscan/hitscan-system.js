import { default as System } from '@core/system';
import { areRectanglesColliding, isCircleCollidingWithRotatedRect } from '@game/engine/collision/collision-util';

export default class HitscanSystem extends System {
  constructor() {
    super();

    this.addHandler('HITSCAN_REQUESTED', (payload) => {
      const { originX, originY, angleDegrees, range } = payload;
      const result = this.performHitscan(originX, originY, angleDegrees, range);
      if (result) {
          payload.callback(result)
      }
    });
  }

  performHitscan(originX, originY, angleDegrees, range) {
    const radians = angleDegrees * (Math.PI / 180);
    const dx = Math.cos(radians);
    const dy = Math.sin(radians);
    const endX = originX + dx * range;
    const endY = originY + dy * range;
  
    let closest = null;
    let closestDistance = Infinity;

    this.workForTag('HitscanTarget', (tag) => {   
      let target = tag;
      const centerX = target.getXPosition();
      const centerY = target.getYPosition();
      const width = target.getWidth();
      const height = target.getHeight();
  
      const hit = this._intersectLineWithAABB(
        originX, originY, endX, endY,
        centerX, centerY, width, height
      );
  
      if (hit) {
        const dist = Math.hypot(hit.x - originX, hit.y - originY);
        if (dist < closestDistance) {
          closest = { entity: target.getEntity(), xPosition: hit.x, yPosition: hit.y, distance: dist };
          closestDistance = dist;
        }
      }
    });

    return closest;
  }

  _intersectLineWithAABB(x1, y1, x2, y2, rectCenterX, rectCenterY, width, height) {
    const dx = x2 - x1;
    const dy = y2 - y1;
  
    const minX = rectCenterX - width / 2;
    const maxX = rectCenterX + width / 2;
    const minY = rectCenterY - height / 2;
    const maxY = rectCenterY + height / 2;
  
    let tmin = 0;
    let tmax = 1;
  
    const invDx = 1 / dx;
    const invDy = 1 / dy;
  
    // X slab
    const tx1 = (minX - x1) * invDx;
    const tx2 = (maxX - x1) * invDx;
    const t1x = Math.min(tx1, tx2);
    const t2x = Math.max(tx1, tx2);
    tmin = Math.max(tmin, t1x);
    tmax = Math.min(tmax, t2x);
  
    // Y slab
    const ty1 = (minY - y1) * invDy;
    const ty2 = (maxY - y1) * invDy;
    const t1y = Math.min(ty1, ty2);
    const t2y = Math.max(ty1, ty2);
    tmin = Math.max(tmin, t1y);
    tmax = Math.min(tmax, t2y);
  
    if (tmax >= tmin && tmin <= 1 && tmin >= 0) {
      return {
        x: x1 + dx * tmin,
        y: y1 + dy * tmin
      };
    }
  
    return null;
  }

  work() {
  }
}