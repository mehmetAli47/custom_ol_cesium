/**
 * Bu dosya ne yapiyor?
 * Cesium tarafindaki mouse etkileisimlerini OpenLayers tarafina "custom event" olarak iletiyor.
 * Ornek:
 * - Cesium'da tikla -> OL map'e "cesium:click" eventi
 * - Cesium'da hover -> OL map'e "cesium:hover" eventi
 *
 * Boylece sen uygulama tarafinda OL event mantigi ile devam edebiliyorsun.
 */
import type OlMap from "ol/Map.js";
import { fromLonLat } from "ol/proj.js";

import {
  Cartesian2,
  Ellipsoid,
  Math as CesiumMath,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  defined,
  type Viewer,
} from "cesium";

import type { InteractionSyncOptions } from "../../types/adapter";

export class InteractionSync {
  private map: OlMap;
  private viewer: Viewer;
  private opts: InteractionSyncOptions;
  private handler: ScreenSpaceEventHandler | null = null;

  constructor(args: {
    map: OlMap;
    viewer: Viewer;
    options: InteractionSyncOptions | boolean;
  }) {
    this.map = args.map;
    this.viewer = args.viewer;
    this.opts =
      typeof args.options === "boolean"
        ? { click: true, hover: true, select: true }
        : args.options;
  }

  attach() {
    if (this.handler) return;
    this.handler = new ScreenSpaceEventHandler(this.viewer.scene.canvas);

    if (this.opts.click) {
      this.handler.setInputAction(
        (movement: { position: { x: number; y: number } }) => {
          const pick = this.viewer.scene.pick(
            new Cartesian2(movement.position.x, movement.position.y),
          );
          if (defined(pick) && (pick as any).id) {
            const cart = this.viewer.scene.globe.pick(
              this.viewer.camera.getPickRay(
                new Cartesian2(movement.position.x, movement.position.y),
              )!,
              this.viewer.scene,
            );
            if (cart) {
              const cartographic =
                Ellipsoid.WGS84.cartesianToCartographic(cart);
              const lon = CesiumMath.toDegrees(cartographic.longitude);
              const lat = CesiumMath.toDegrees(cartographic.latitude);
              this.map.dispatchEvent({
                type: "cesium:click",
                coordinate: fromLonLat(
                  [lon, lat],
                  this.map.getView().getProjection(),
                ),
                entity: (pick as any).id,
              } as any);
            }
          }
        },
        ScreenSpaceEventType.LEFT_CLICK,
      );
    }

    if (this.opts.hover) {
      this.handler.setInputAction(
        (movement: { endPosition: { x: number; y: number } }) => {
          const pick = this.viewer.scene.pick(
            new Cartesian2(movement.endPosition.x, movement.endPosition.y),
          );
          this.map.dispatchEvent({
            type: "cesium:hover",
            entity: defined(pick) ? (pick as any).id : null,
          } as any);
        },
        ScreenSpaceEventType.MOUSE_MOVE,
      );
    }
  }

  detach() {
    if (this.handler) {
      this.handler.destroy();
      this.handler = null;
    }
  }
}
