/**
 * Bu dosya ne yapiyor?
 * Bu, "ana kumanda" dosyasi.
 * Burada tek bir sinif var: OlCesium.
 *
 * OlCesium'in gorevi:
 * - Cesium Viewer'i kurmak
 * - Kamera sync'i (CameraSync), layer sync'i (LayerSync), overlay sync'i (OverlaySync) ve interaction sync'i (InteractionSync)
 *   modullerini bir araya getirmek
 * - 3D'yi ac/kapat (setEnabled) yapinca dogru sirayla attach/detach etmek
 *
 * Yani detayli islerin hepsi alt modullerde; burasi sadece "orchestrator".
 */
import type OlMap from "ol/Map.js";

import type { Viewer } from "cesium";

import { createViewer } from "./viewer/createViewer";
import { CameraSync } from "./camera/CameraSync";
import { LayerSync } from "./layers/LayerSync";
import { OverlaySync } from "./overlays/OverlaySync";
import { InteractionSync } from "./interactions/InteractionSync";

import type {
  CameraSyncOptions,
  InteractionSyncOptions,
  VectorOptions,
  ViewState,
} from "../types/adapter";

export type OlCesiumOptions = {
  map: OlMap;
  target: HTMLElement | string;
  enabled?: boolean;
  enableTerrain?: boolean;
  /**
   * If true, removing 3D mode will also remove converted Cesium layers/dataSources.
   * Defaults to false to preserve state across enable/disable (closer to ol-cesium behavior).
   */
  clearOnDisable?: boolean;
  cameraSyncOptions?: CameraSyncOptions;
  vectorOptions?: VectorOptions;
  interactionSync?: boolean | InteractionSyncOptions;
  autoOrderLayers?: boolean;
  overlaySync?: boolean;
  onCameraChange?: (vs: ViewState) => void;
};

export class OlCesium {
  private map: OlMap;
  private viewer: Viewer;
  private enabled = false;
  private attached = false;
  private clearOnDisable: boolean;

  private cameraSync: CameraSync;
  private layerSync: LayerSync;
  private overlaySync: OverlaySync | null;
  private interactionSync: InteractionSync | null;

  constructor(options: OlCesiumOptions) {
    this.map = options.map;
    this.clearOnDisable = options.clearOnDisable ?? false;

    const target =
      typeof options.target === "string"
        ? (document.getElementById(options.target) as HTMLElement | null)
        : options.target;
    if (!target) throw new Error("OlCesium: target element not found");

    this.viewer = createViewer({
      target,
      enableTerrain: options.enableTerrain ?? false,
    });

    this.cameraSync = new CameraSync({
      map: this.map,
      viewer: this.viewer,
      options: options.cameraSyncOptions ?? {},
      onCameraChange: options.onCameraChange,
    });

    this.layerSync = new LayerSync({
      map: this.map,
      viewer: this.viewer,
      vectorOptions: options.vectorOptions ?? {},
      autoOrderLayers: options.autoOrderLayers ?? true,
    });

    const overlayEnabled = options.overlaySync ?? true;
    this.overlaySync = overlayEnabled
      ? new OverlaySync({ map: this.map, viewer: this.viewer })
      : null;

    this.interactionSync = options.interactionSync
      ? new InteractionSync({
          map: this.map,
          viewer: this.viewer,
          options: options.interactionSync,
        })
      : null;

    this.setEnabled(options.enabled ?? true);
  }

  getOlMap(): OlMap {
    return this.map;
  }

  getCesiumViewer(): Viewer {
    return this.viewer;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  setTarget(target: HTMLElement | string) {
    const el =
      typeof target === "string"
        ? (document.getElementById(target) as HTMLElement | null)
        : target;
    if (!el) throw new Error("OlCesium: target element not found");
    // Cesium Viewer does not allow changing `container` after creation.
    // Move the existing container DOM node instead.
    el.appendChild(this.viewer.container);
    this.viewer.resize();
    this.viewer.scene.requestRender();
  }

  setEnabled(enabled: boolean) {
    if (this.enabled === enabled) return;
    this.enabled = enabled;

    const container = this.viewer.container as HTMLElement | undefined;
    if (container) {
      container.style.visibility = enabled ? "visible" : "hidden";
      container.style.pointerEvents = enabled ? "auto" : "none";
    }

    if (enabled) {
      // Keep rendering paused while we attach listeners and sync initial state.
      this.viewer.useDefaultRenderLoop = false;
      this.layerSync.beginEnableTransaction();
      if (!this.attached) this.attach();
      try {
        this.viewer.resize();
      } catch {
        // ignore
      }
      this.syncOnce();

      // Start render loop (requestRenderMode keeps it mostly idle).
      this.viewer.useDefaultRenderLoop = true;
      this.layerSync.endEnableTransaction();
      this.viewer.scene.requestRender();
    } else {
      this.viewer.useDefaultRenderLoop = false;
      if (this.attached) this.detach();
      if (this.clearOnDisable) {
        this.layerSync.clearCesiumLayers(true);
      }
    }
  }

  syncOnce() {
    if (!this.enabled) return;
    this.cameraSync.syncOnce();
    this.layerSync.syncOnce();
    this.viewer.scene.requestRender();
  }

  destroy() {
    if (this.attached) this.detach();
    this.layerSync.clearCesiumLayers(true);
    if (!this.viewer.isDestroyed()) this.viewer.destroy();
  }

  private attach() {
    this.attached = true;
    this.cameraSync.attach();
    this.layerSync.attach();
    if (this.overlaySync) this.overlaySync.attach();
    if (this.interactionSync) this.interactionSync.attach();
  }

  private detach() {
    this.attached = false;
    this.cameraSync.detach();
    this.layerSync.detach();
    if (this.overlaySync) this.overlaySync.detach();
    if (this.interactionSync) this.interactionSync.detach();
  }
}
