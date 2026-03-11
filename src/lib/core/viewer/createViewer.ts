/**
 * Bu dosya ne yapiyor?
 * Cesium Viewer'i tek bir yerde, standart ayarlarla kuruyoruz.
 * Amacimiz:
 * - GPU gereksiz yere %100 olmasin (requestRenderMode)
 * - Default Cesium imagery/layer temizligi render'i patlatmasin
 * - Terrain ac/kapat gibi opsiyonlari buradan yonetelim
 */
import {
  Viewer,
  createWorldTerrainAsync,
  ImageryLayer,
  UrlTemplateImageryProvider,
} from "cesium";

export type CreateViewerOptions = {
  target: HTMLElement;
  enableTerrain?: boolean;
};

export function createViewer({ target, enableTerrain }: CreateViewerOptions) {
  const viewer = new Viewer(target, {
    animation: false,
    baseLayerPicker: false,
    fullscreenButton: false,
    geocoder: false,
    homeButton: false,
    infoBox: false,
    sceneModePicker: false,
    selectionIndicator: false,
    timeline: false,
    navigationHelpButton: false,
    navigationInstructionsInitiallyVisible: false,
    scene3DOnly: true,
    // Stability: avoid Cesium's OIT translucent rendering path which has caused fatal
    // render errors in our toggle/sync flows.
    orderIndependentTranslucency: false,
    // Render only on demand; critical for keeping GPU usage low when idle.
    requestRenderMode: true,
    maximumRenderTimeChange: Infinity,
  });

  // Surface render-loop fatal errors with extra context. Cesium stops rendering on these.
  (viewer.scene as any).renderError?.addEventListener?.(
    (scene: any, error: any) => {
      // eslint-disable-next-line no-console
      console.error("[OlCesium] Cesium renderError:", error);
    },
  );

  // IMPORTANT: prevent Cesium from rendering while we are still wiring up the OL sync.
  // We only enable the render loop when 3D mode is enabled.
  viewer.useDefaultRenderLoop = false;

  // Clear default imagery. We drive imagery from OL layers.
  // DO NOT destroy here: destroying imagery layers during/around initial frames can
  // crash the render loop with "This object was destroyed" errors.
  viewer.imageryLayers.removeAll(false);

  // Default base imagery (OSM) — always present at bottom so the globe is never blank.
  const defaultBase = new ImageryLayer(
    new UrlTemplateImageryProvider({
      url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
      minimumLevel: 0,
      maximumLevel: 19,
    }),
  );
  (defaultBase as any)._isDefaultBase = true;
  viewer.imageryLayers.add(defaultBase);

  // Reasonable defaults for perf and visuals
  viewer.scene.globe.enableLighting = false;
  viewer.scene.fog.enabled = false;
  try {
    // Optional: reduce post-process variability and GPU load.
    (viewer.scene.postProcessStages as any).fxaa.enabled = false;
  } catch {
    // ignore
  }
  viewer.clock.shouldAnimate = false;
  (viewer as any).targetFrameRate = 30;
  if (viewer.scene.skyAtmosphere) viewer.scene.skyAtmosphere.show = true;
  viewer.scene.globe.showGroundAtmosphere = true;

  if (enableTerrain) {
    createWorldTerrainAsync().then((terrain) => {
      if (!viewer.isDestroyed()) {
        viewer.terrainProvider = terrain;
      }
    });
  }

  return viewer;
}
