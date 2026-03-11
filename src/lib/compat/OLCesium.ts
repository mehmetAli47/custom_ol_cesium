import type OlMap from "ol/Map.js";
import type { Viewer } from "cesium";

import {
  OlCesium,
  type OlCesiumOptions as CoreOptions,
} from "../core/OlCesium";

export type OLCesiumOptions = {
  map: OlMap;
  /**
   * ol-cesium compatibility option. In original ol-cesium this controlled the base imagery provider.
   * We already remove Cesium default imagery and convert OL layers, so `false` is a no-op here.
   */
  imageryProvider?: unknown;
  /**
   * Optional explicit Cesium container. If omitted, an overlay div is created inside OL map target.
   */
  target?: HTMLElement | string;
  enableTerrain?: boolean;
};

/**
 * Compatibility wrapper for code written against `ol-cesium`'s OLCesium API.
 * Exposes: `viewer_`, `canvas_`, `resolutionScale_`, `getCesiumScene()`, `setEnabled()`, `setResolutionScale()`.
 */
export default class OLCesium {
  private core: OlCesium;
  private overlayDiv: HTMLDivElement | null = null;

  // Public fields expected by legacy code.
  viewer_: Viewer;
  canvas_: HTMLCanvasElement;

  constructor(options: OLCesiumOptions) {
    const map = options.map;

    const target =
      options.target ??
      this.createOverlayContainer(map, {
        pointerEvents: "auto",
      });

    const coreOptions: CoreOptions = {
      map,
      target,
      enabled: false,
      enableTerrain: options.enableTerrain ?? false,
      // Keep default behavior close to ol-cesium: don't destroy layers on disable.
      clearOnDisable: false,
    };

    this.core = new OlCesium(coreOptions);
    this.viewer_ = this.core.getCesiumViewer();
    this.canvas_ = this.viewer_.scene.canvas;
  }

  getEnabled(): boolean {
    return this.core.isEnabled();
  }

  setEnabled(enabled: boolean) {
    this.core.setEnabled(enabled);
  }

  getCesiumScene() {
    return this.viewer_.scene;
  }

  setResolutionScale(scale: number) {
    this.viewer_.resolutionScale = scale;
    this.viewer_.scene.requestRender();
  }

  get resolutionScale_(): number {
    return this.viewer_.resolutionScale;
  }

  set resolutionScale_(scale: number) {
    this.setResolutionScale(scale);
  }

  destroy() {
    this.core.destroy();
    if (this.overlayDiv?.parentElement) {
      this.overlayDiv.parentElement.removeChild(this.overlayDiv);
    }
    this.overlayDiv = null;
  }

  private createOverlayContainer(
    map: OlMap,
    style: Partial<CSSStyleDeclaration>,
  ): HTMLDivElement {
    const targetEl = map.getTargetElement?.();
    if (!targetEl) {
      throw new Error(
        "OLCesium: map.getTargetElement() is missing. Provide options.target explicitly.",
      );
    }

    // Ensure the map container can host an absolute overlay.
    const computed = window.getComputedStyle(targetEl);
    if (!computed.position || computed.position === "static") {
      (targetEl as HTMLElement).style.position = "relative";
    }

    const div = document.createElement("div");
    div.className = "olcesium-container";
    Object.assign(div.style, {
      position: "absolute",
      inset: "0",
      width: "100%",
      height: "100%",
      overflow: "hidden",
      ...style,
    });

    targetEl.appendChild(div);
    this.overlayDiv = div;
    return div;
  }
}
