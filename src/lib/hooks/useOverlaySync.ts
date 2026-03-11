/**
 * useOverlaySync.ts
 * Synchronizes OpenLayers Overlays to Cesium Screen Coordinates
 */
import { useEffect } from "react";
import type OlMap from "ol/Map.js";
import type { Viewer as CesiumViewer } from "cesium";
import { SceneTransforms, Cartesian3 } from "cesium";
import { toLonLat } from "ol/proj.js";

export function useOverlaySync(
  olMap: OlMap | null,
  cesiumViewer: CesiumViewer | null,
  active: boolean,
) {
  useEffect(() => {
    if (!olMap || !cesiumViewer || !active) return;

    const syncOverlays = () => {
      const overlays = olMap.getOverlays().getArray();
      const scene = cesiumViewer.scene;
      const camera = cesiumViewer.camera;

      overlays.forEach((overlay) => {
        const element = overlay.getElement();
        if (!element) return;

        const position = overlay.getPosition();
        if (!position) {
          element.style.display = "none";
          return;
        }

        // Convert OL coordinate (EPSG:3857) to LonLat
        const [lon, lat] = toLonLat(position, olMap.getView().getProjection());

        // Convert LonLat to Cartesian3
        const cartesian = Cartesian3.fromDegrees(lon, lat);

        // Project Cartesian3 to Window Coordinates
        const canvasCoord = SceneTransforms.worldToWindowCoordinates(
          scene,
          cartesian,
        );

        if (canvasCoord) {
          // Check if point is behind the globe (occlusion)
          const cameraPos = camera.position;
          const cameraToPos = Cartesian3.subtract(
            cartesian,
            cameraPos,
            new Cartesian3(),
          );
          const cameraDir = camera.direction;
          const dot = Cartesian3.dot(cameraToPos, cameraDir);

          if (dot > 0) {
            element.style.display = "block";
            element.style.position = "absolute";
            element.style.left = `${canvasCoord.x}px`;
            element.style.top = `${canvasCoord.y}px`;
            element.style.transform = "translate(-50%, -100%)"; // Default anchor behavior
            element.style.pointerEvents = "auto"; // Ensure clicks work
          } else {
            element.style.display = "none";
          }
        } else {
          element.style.display = "none";
        }
      });
    };

    // Tie overlay updates to Cesium's render loop.
    const removeListener =
      cesiumViewer.scene.postRender.addEventListener(syncOverlays);

    return () => {
      removeListener();
      // Reset overlay styles when disabled
      olMap.getOverlays().forEach((overlay) => {
        const element = overlay.getElement();
        if (element) {
          element.style.display = "";
          element.style.position = "";
          element.style.left = "";
          element.style.top = "";
          element.style.transform = "";
        }
      });
    };
  }, [olMap, cesiumViewer, active]);
}
