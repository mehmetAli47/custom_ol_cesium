/**
 * Bu dosya ne yapiyor?
 * 2D OpenLayers kamerasi ile 3D Cesium kamerasi birbirini takip etsin diye burada senkron kuruyoruz.
 * Yani 2D'de pan/zoom/rotate yapinca 3D de ayni yere geliyor, 3D'de hareket edince 2D de guncelleniyor.
 * Sonsuz loop olmamasi icin debounce + requestAnimationFrame ile yavaslatiyoruz.
 */
import type OlMap from "ol/Map.js";
import { unByKey } from "ol/Observable.js";
import type { EventsKey } from "ol/events.js";
import { toLonLat, fromLonLat } from "ol/proj.js";

import { Cartesian3, Ellipsoid, Math as CesiumMath, type Viewer } from "cesium";

import {
  olResolutionToCesiumHeightMeters,
  cesiumHeightMetersToOlResolution,
} from "../../utils/cameraMath";
import type { CameraSyncOptions, ViewState } from "../../types/adapter";

export class CameraSync {
  private map: OlMap;
  private viewer: Viewer;
  private opts: CameraSyncOptions;
  private onCameraChange?: (vs: ViewState) => void;

  private syncing: "ol" | "cesium" | null = null;
  private syncTimer: ReturnType<typeof setTimeout> | null = null;
  private rafOlToCesium: number | null = null;
  private rafCesiumToOl: number | null = null;
  private lastCesiumToOlTs = 0;
  private lastApplied: {
    lon: number;
    lat: number;
    zoom: number;
    rotation: number;
  } | null = null;

  private viewKeys: EventsKey[] = [];
  private cameraChangedRemove: (() => void) | null = null;

  constructor(args: {
    map: OlMap;
    viewer: Viewer;
    options?: CameraSyncOptions;
    onCameraChange?: (vs: ViewState) => void;
  }) {
    this.map = args.map;
    this.viewer = args.viewer;
    this.opts = args.options ?? {};
    this.onCameraChange = args.onCameraChange;
  }

  attach() {
    const view = this.map.getView();
    this.viewKeys = [
      view.on("change:center", () => this.scheduleOlToCesium()),
      view.on("change:resolution", () => this.scheduleOlToCesium()),
      view.on("change:rotation", () => this.scheduleOlToCesium()),
    ];

    this.viewer.camera.percentageChanged = 0.01;
    this.cameraChangedRemove = this.viewer.camera.changed.addEventListener(() =>
      this.scheduleCesiumToOl(),
    );
  }

  detach() {
    if (this.viewKeys.length) {
      unByKey(this.viewKeys);
    }
    this.viewKeys = [];

    if (this.cameraChangedRemove) {
      this.cameraChangedRemove();
      this.cameraChangedRemove = null;
    }
    if (this.rafOlToCesium != null) {
      cancelAnimationFrame(this.rafOlToCesium);
      this.rafOlToCesium = null;
    }
    if (this.rafCesiumToOl != null) {
      cancelAnimationFrame(this.rafCesiumToOl);
      this.rafCesiumToOl = null;
    }
    if (this.syncTimer) {
      clearTimeout(this.syncTimer);
      this.syncTimer = null;
    }
    this.syncing = null;
  }

  getViewKeys() {
    return this.viewKeys;
  }

  syncOnce() {
    this.syncOlToCesium();
  }

  scheduleOlToCesium() {
    if (this.rafOlToCesium != null) return;
    this.rafOlToCesium = requestAnimationFrame(() => {
      this.rafOlToCesium = null;
      this.syncOlToCesium();
    });
  }

  scheduleCesiumToOl() {
    const now =
      typeof performance !== "undefined" ? performance.now() : Date.now();
    if (now - this.lastCesiumToOlTs < 33) return;
    this.lastCesiumToOlTs = now;

    if (this.rafCesiumToOl != null) return;
    this.rafCesiumToOl = requestAnimationFrame(() => {
      this.rafCesiumToOl = null;
      this.syncCesiumToOl();
    });
  }

  private syncOlToCesium() {
    if (this.syncing === "cesium") return;

    const view = this.map.getView();
    const center = view.getCenter();
    if (!center) return;

    const {
      animate = true,
      animationDuration = 0.5,
      debounceMs = 100,
    } = this.opts;

    const [lon, lat] = toLonLat(center, view.getProjection());
    const zoom = view.getZoom() ?? 2;
    const rotation = -(view.getRotation() ?? 0);

    const resolution =
      view.getResolution() ??
      (typeof (view as any).getResolutionForZoom === "function"
        ? (view as any).getResolutionForZoom(zoom)
        : undefined) ??
      20_000_000 / Math.pow(2, zoom - 1);
    const isWebMercator = view.getProjection()?.getCode?.() === "EPSG:3857";
    const height = olResolutionToCesiumHeightMeters({
      resolution,
      latDeg: lat,
      olSize: this.map.getSize() ?? undefined,
      viewer: this.viewer,
      isWebMercator,
    });
    const destination = Cartesian3.fromDegrees(lon, lat, height);

    // If the render loop is paused (e.g. during enable/layer transactions), avoid flyTo.
    const useInstantSync =
      !animate || this.syncing === "ol" || !this.viewer.useDefaultRenderLoop;
    const orientation = {
      heading: rotation,
      pitch: this.viewer.camera.pitch,
      roll: this.viewer.camera.roll,
    };

    if (!useInstantSync) {
      this.viewer.camera.flyTo({
        destination,
        orientation,
        duration: animationDuration,
      });
    } else {
      this.viewer.camera.cancelFlight();
      this.viewer.camera.setView({ destination, orientation });
    }

    this.syncing = "ol";
    this.onCameraChange?.({
      center: [lon, lat],
      zoom,
      rotation: view.getRotation() ?? 0,
      tilt: 0,
    });

    if (this.syncTimer) clearTimeout(this.syncTimer);
    this.syncTimer = setTimeout(() => {
      this.syncing = null;
    }, debounceMs);
  }

  private syncCesiumToOl() {
    if (this.syncing === "ol") return;

    const camera = this.viewer.camera;
    const carto = Ellipsoid.WGS84.cartesianToCartographic(camera.position);
    if (!carto) return;

    const { debounceMs = 100 } = this.opts;
    this.syncing = "cesium";

    const lon = CesiumMath.toDegrees(carto.longitude);
    const lat = CesiumMath.toDegrees(carto.latitude);
    const height = carto.height;
    const rotation = -camera.heading;

    const view = this.map.getView();
    const isWebMercator = view.getProjection()?.getCode?.() === "EPSG:3857";
    const resolution = cesiumHeightMetersToOlResolution({
      heightMeters: height,
      latDeg: lat,
      olSize: this.map.getSize() ?? undefined,
      viewer: this.viewer,
      isWebMercator,
    });
    const zoom =
      typeof (view as any).getZoomForResolution === "function"
        ? (view as any).getZoomForResolution(resolution)
        : Math.log2(20_000_000 / Math.max(height, 1)) + 1;

    const clampedZoom = Math.max(0, Math.min(28, zoom));
    const prev = this.lastApplied;
    const shouldUpdate =
      !prev ||
      Math.abs(prev.lon - lon) > 1e-7 ||
      Math.abs(prev.lat - lat) > 1e-7 ||
      Math.abs(prev.zoom - clampedZoom) > 0.02 ||
      Math.abs(prev.rotation - rotation) > 1e-4;

    if (shouldUpdate) {
      view.setCenter(fromLonLat([lon, lat], view.getProjection()));
      if (!prev || Math.abs(prev.zoom - clampedZoom) > 0.02) {
        view.setZoom(clampedZoom);
      }
      if (!prev || Math.abs(prev.rotation - rotation) > 1e-4) {
        view.setRotation(rotation);
      }
      this.lastApplied = { lon, lat, zoom: clampedZoom, rotation };
    }

    const tilt = CesiumMath.toDegrees(camera.pitch) + 90;
    this.onCameraChange?.({
      center: [lon, lat],
      zoom,
      rotation: -rotation,
      tilt,
    });

    if (this.syncTimer) clearTimeout(this.syncTimer);
    this.syncTimer = setTimeout(() => {
      this.syncing = null;
    }, debounceMs);
  }
}
