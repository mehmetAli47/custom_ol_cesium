/**
 * Bu dosya ne yapiyor?
 * OpenLayers overlay/popup'larini (HTML element) Cesium canvas uzerinde dogru yere tasiyor.
 * Yani 3D moddayken de popup ekranda dogru koordinatta dursun diye her frame sonunda (postRender)
 * ekrandaki piksel konumunu hesaplayip elementin style'ini guncelliyoruz.
 */
import type OlMap from "ol/Map.js";
import { toLonLat } from "ol/proj.js";

import { Cartesian3, SceneTransforms, type Viewer } from "cesium";

export class OverlaySync {
  private map: OlMap;
  private viewer: Viewer;
  private postRenderRemove: (() => void) | null = null;

  constructor(args: { map: OlMap; viewer: Viewer }) {
    this.map = args.map;
    this.viewer = args.viewer;
  }

  attach() {
    if (this.postRenderRemove) return;
    this.postRenderRemove = this.viewer.scene.postRender.addEventListener(() =>
      this.syncOverlays(),
    );
  }

  detach() {
    if (this.postRenderRemove) {
      this.postRenderRemove();
      this.postRenderRemove = null;
    }
  }

  private syncOverlays() {
    const overlays = this.map.getOverlays().getArray();
    const scene = this.viewer.scene;
    const camera = this.viewer.camera;
    const view = this.map.getView();

    for (const overlay of overlays) {
      const element = overlay.getElement();
      if (!element) continue;

      const position = overlay.getPosition();
      if (!position) {
        (element as HTMLElement).style.display = "none";
        continue;
      }

      const [lon, lat] = toLonLat(position, view.getProjection());
      const cartesian = Cartesian3.fromDegrees(lon, lat);
      const canvasCoord = SceneTransforms.worldToWindowCoordinates(
        scene,
        cartesian,
      );

      if (!canvasCoord) {
        (element as HTMLElement).style.display = "none";
        continue;
      }

      // Hide if behind the camera
      const cameraToPos = Cartesian3.subtract(
        cartesian,
        camera.position,
        new Cartesian3(),
      );
      const dot = Cartesian3.dot(cameraToPos, camera.direction);
      if (dot <= 0) {
        (element as HTMLElement).style.display = "none";
        continue;
      }

      const el = element as HTMLElement;
      el.style.display = "block";
      el.style.position = "absolute";
      el.style.left = `${canvasCoord.x}px`;
      el.style.top = `${canvasCoord.y}px`;
      el.style.transform = "translate(-50%, -100%)";
      el.style.pointerEvents = "auto";
    }
  }
}
