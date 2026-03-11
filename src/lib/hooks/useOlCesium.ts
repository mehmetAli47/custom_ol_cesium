/**
 * useOlCesium.ts
 * Hooks for synchronizing OpenLayers ↔ Cesium camera, layers, and interactions
 */
import { useEffect, useRef, useCallback } from "react";
import {
  Math as CesiumMath,
  Cartesian2,
  Cartesian3,
  Cartographic,
  Ellipsoid,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  defined,
} from "cesium";
import type { Viewer as CesiumViewer } from "cesium";
import type OlMap from "ol/Map.js";
import TileLayer from "ol/layer/Tile.js";
import ImageLayer from "ol/layer/Image.js";
import VectorLayer from "ol/layer/Vector.js";
import VectorTileLayer from "ol/layer/VectorTile.js";
import TileWMS from "ol/source/TileWMS.js";
import ImageWMS from "ol/source/ImageWMS.js";
import { toLonLat, fromLonLat } from "ol/proj.js";
import { unByKey } from "ol/Observable.js";
import type { EventsKey } from "ol/events.js";

import type {
  ViewState,
  CameraSyncOptions,
  InteractionSyncOptions,
  LayerMapping,
  VectorOptions,
} from "../types/adapter";
import {
  convertLayerToCesium,
  syncVisibility,
  type ConvertedResult,
} from "../utils/layerConverters";
import {
  olResolutionToCesiumHeightMeters,
  cesiumHeightMetersToOlResolution,
} from "../utils/cameraMath";

/* ─────────────────────────────────────────────
 *  useCameraSync
 * ───────────────────────────────────────────── */

export function useCameraSync(
  olMap: OlMap | null,
  cesiumViewer: CesiumViewer | null,
  options: CameraSyncOptions = {},
  onCameraChange?: (vs: ViewState) => void,
) {
  const { debounceMs = 100, animate = true, animationDuration = 0.5 } = options;

  const syncingRef = useRef<"ol" | "cesium" | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafOlToCesiumRef = useRef<number | null>(null);
  const rafCesiumToOlRef = useRef<number | null>(null);
  const lastCesiumToOlTsRef = useRef<number>(0);
  const lastAppliedRef = useRef<{
    lon: number;
    lat: number;
    zoom: number;
    rotation: number;
  } | null>(null);

  // OL View → Cesium Camera
  const syncOlToCesiumNow = useCallback(() => {
    if (!olMap || !cesiumViewer || syncingRef.current === "cesium") return;

    const view = olMap.getView();
    const center = view.getCenter();
    if (!center) return;

    const [lon, lat] = toLonLat(center);
    const rotation = -(view.getRotation() ?? 0);

    const zoom = view.getZoom() ?? 2;
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
      olSize: olMap.getSize() ?? undefined,
      viewer: cesiumViewer,
      isWebMercator,
    });
    const destination = Cartesian3.fromDegrees(lon, lat, height);

    // For live synchronization during interaction, flyTo is too slow and overhead-heavy.
    // We use flyTo ONLY for the initial sync call if animate is true,
    // and switch to setView for subsequent rapid updates while syncingRef is active.
    const useInstantSync = !animate || syncingRef.current === "ol";

    const currentPitch = cesiumViewer.camera.pitch;
    const currentRoll = cesiumViewer.camera.roll;

    const orientation = {
      heading: rotation,
      pitch: currentPitch,
      roll: currentRoll,
    };

    if (!useInstantSync) {
      cesiumViewer.camera.flyTo({
        destination,
        orientation,
        duration: animationDuration,
      });
    } else {
      cesiumViewer.camera.cancelFlight();
      cesiumViewer.camera.setView({
        destination,
        orientation,
      });
    }

    syncingRef.current = "ol";

    // Fire callback
    const vs: ViewState = {
      center: [lon, lat],
      zoom,
      rotation: view.getRotation() ?? 0,
      tilt: 0,
    };
    onCameraChange?.(vs);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      syncingRef.current = null;
    }, debounceMs);
  }, [
    olMap,
    cesiumViewer,
    animate,
    animationDuration,
    debounceMs,
    onCameraChange,
  ]);

  const syncOlToCesium = useCallback(() => {
    if (rafOlToCesiumRef.current != null) return;
    rafOlToCesiumRef.current = requestAnimationFrame(() => {
      rafOlToCesiumRef.current = null;
      syncOlToCesiumNow();
    });
  }, [syncOlToCesiumNow]);

  // Cesium Camera → OL View
  const syncCesiumToOlNow = useCallback(() => {
    if (!olMap || !cesiumViewer || syncingRef.current === "ol") return;

    const camera = cesiumViewer.camera;
    const carto = Ellipsoid.WGS84.cartesianToCartographic(camera.position);
    if (!carto) return;

    syncingRef.current = "cesium";

    const lon = CesiumMath.toDegrees(carto.longitude);
    const lat = CesiumMath.toDegrees(carto.latitude);
    const height = carto.height;

    const rotation = -camera.heading;

    const view = olMap.getView();
    const isWebMercator = view.getProjection()?.getCode?.() === "EPSG:3857";
    const resolution = cesiumHeightMetersToOlResolution({
      heightMeters: height,
      latDeg: lat,
      olSize: olMap.getSize() ?? undefined,
      viewer: cesiumViewer,
      isWebMercator,
    });

    const zoom =
      typeof (view as any).getZoomForResolution === "function"
        ? (view as any).getZoomForResolution(resolution)
        : Math.log2(20_000_000 / Math.max(height, 1)) + 1;

    const clampedZoom = Math.max(0, Math.min(28, zoom));
    const prev = lastAppliedRef.current;
    const shouldUpdate =
      !prev ||
      Math.abs(prev.lon - lon) > 1e-7 ||
      Math.abs(prev.lat - lat) > 1e-7 ||
      Math.abs(prev.zoom - clampedZoom) > 0.02 ||
      Math.abs(prev.rotation - rotation) > 1e-4;

    if (shouldUpdate) {
      view.setCenter(fromLonLat([lon, lat]));
      if (!prev || Math.abs(prev.zoom - clampedZoom) > 0.02) {
        view.setZoom(clampedZoom);
      }
      if (!prev || Math.abs(prev.rotation - rotation) > 1e-4) {
        view.setRotation(rotation);
      }
      lastAppliedRef.current = {
        lon,
        lat,
        zoom: clampedZoom,
        rotation,
      };
    }

    const tilt = CesiumMath.toDegrees(camera.pitch) + 90;

    const vs: ViewState = {
      center: [lon, lat],
      zoom,
      rotation: -rotation,
      tilt,
    };
    onCameraChange?.(vs);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      syncingRef.current = null;
    }, debounceMs);
  }, [olMap, cesiumViewer, debounceMs, onCameraChange]);

  const syncCesiumToOl = useCallback(() => {
    const now =
      typeof performance !== "undefined" ? performance.now() : Date.now();
    if (now - lastCesiumToOlTsRef.current < 33) return;
    lastCesiumToOlTsRef.current = now;

    if (rafCesiumToOlRef.current != null) return;
    rafCesiumToOlRef.current = requestAnimationFrame(() => {
      rafCesiumToOlRef.current = null;
      syncCesiumToOlNow();
    });
  }, [syncCesiumToOlNow]);

  // Subscribe to OL view changes
  useEffect(() => {
    if (!olMap) return;
    const view = olMap.getView();
    const key = view.on("change:center", syncOlToCesium);
    const key2 = view.on("change:resolution", syncOlToCesium);
    const key3 = view.on("change:rotation", syncOlToCesium);

    return () => {
      view.un("change:center", syncOlToCesium);
      view.un("change:resolution", syncOlToCesium);
      view.un("change:rotation", syncOlToCesium);
      if (rafOlToCesiumRef.current != null) {
        cancelAnimationFrame(rafOlToCesiumRef.current);
        rafOlToCesiumRef.current = null;
      }
    };
  }, [olMap, syncOlToCesium]);

  // Subscribe to Cesium camera changes
  useEffect(() => {
    if (!cesiumViewer) return;
    const removeListener =
      cesiumViewer.camera.changed.addEventListener(syncCesiumToOl);
    // Lower the percentage threshold so it fires more often
    cesiumViewer.camera.percentageChanged = 0.01;

    return () => {
      removeListener();
      if (rafCesiumToOlRef.current != null) {
        cancelAnimationFrame(rafCesiumToOlRef.current);
        rafCesiumToOlRef.current = null;
      }
    };
  }, [cesiumViewer, syncCesiumToOl]);

  return { syncOlToCesium, syncCesiumToOl };
}

/* ─────────────────────────────────────────────
 *  useLayerSync
 * ───────────────────────────────────────────── */

export function useLayerSync(
  olMap: OlMap | null,
  cesiumViewer: CesiumViewer | null,
  vectorOpts: VectorOptions = {},
) {
  const mappingsRef = useRef<LayerMapping[]>([]);
  const layerKeysRef = useRef<WeakMap<any, EventsKey[]>>(new WeakMap());
  const sourceKeysRef = useRef<WeakMap<any, EventsKey[]>>(new WeakMap());
  // NOTE: We avoid manually calling `.destroy()` on Cesium objects during normal
  // operation. Incorrect timing can destroy WebGL resources still in use and
  // stop rendering ("This object was destroyed" errors). Prefer Cesium-managed
  // lifecycle by using collection `remove(obj, true)`.
  const pendingDestroyRef = useRef<any[]>([]);
  const vectorRefreshTimerRef = useRef<
    WeakMap<any, ReturnType<typeof setTimeout>>
  >(new WeakMap());

  // Master sync: convert all OL layers → Cesium
  const syncLayers = useCallback(() => {
    if (!olMap || !cesiumViewer) return;

    const layers = olMap.getLayers().getArray();
    const currentMappings = mappingsRef.current;

    // 1. Remove layers that are no longer in OL
    const finalMappings: LayerMapping[] = [];
    for (const mapping of currentMappings) {
      if (layers.includes(mapping.olLayer)) {
        finalMappings.push(mapping);
      } else {
        removeCesiumObject(mapping);
      }
    }
    mappingsRef.current = finalMappings;

    // 2. Add missing layers
    for (const olLayer of layers) {
      if (!mappingsRef.current.find((m) => m.olLayer === olLayer)) {
        addLayerToCesium(olLayer);
      }
    }

    // 3. Update ordering
    reconcileAllLayerAttachments();
    updateCesiumZOrder();
  }, [olMap, cesiumViewer, vectorOpts]);

  const reconcileAllLayerAttachments = () => {
    if (!olMap || !cesiumViewer) return;
    for (const mapping of mappingsRef.current) {
      const layer: any = mapping.olLayer as any;
      const visible =
        typeof layer?.getVisible === "function" ? layer.getVisible() : true;
      mapping.visible = visible;

      if (visible) addToCesiumViewer(mapping);
      else removeFromCesiumViewer(mapping);

      try {
        syncVisibility(layer, mapping);
      } catch {
        // ignore
      }
    }
  };

  const queueDestroy = (obj: any) => {
    if (!obj) return;
    // Keep references only to prevent accidental re-use; cleared on cleanup.
    pendingDestroyRef.current.push(obj);
  };

  const removeCesiumObject = (mapping: LayerMapping, destroy = true) => {
    if (!cesiumViewer || !mapping.cesiumLayer) return;
    const obj = mapping.cesiumLayer as any;
    try {
      if (mapping.type === "imagery") {
        cesiumViewer.imageryLayers.remove(obj, !!destroy);
      } else if (mapping.type === "vector") {
        cesiumViewer.dataSources.remove(obj, !!destroy);
      }
    } catch {
      // ignore
    }
    if (destroy) queueDestroy(obj);
    if (destroy) {
      // Never reuse destroyed handles.
      mapping.cesiumLayer = null as any;
    }
    cesiumViewer.scene.requestRender();
  };

  const removeFromCesiumViewer = (mapping: LayerMapping) => {
    // Detach only; keep the object for reuse when toggled visible again.
    removeCesiumObject(mapping, false);
  };

  const hasImageryLayer = (layer: any) => {
    const c: any = cesiumViewer?.imageryLayers;
    try {
      if (!c) return false;
      if (typeof c.contains === "function") return !!c.contains(layer);
      if (typeof c.indexOf === "function") return c.indexOf(layer) !== -1;
    } catch {
      // ignore
    }
    return false;
  };

  const hasDataSource = (ds: any) => {
    const c: any = cesiumViewer?.dataSources;
    try {
      if (!c) return false;
      if (typeof c.contains === "function") return !!c.contains(ds);
      if (typeof c.indexOf === "function") return c.indexOf(ds) !== -1;
    } catch {
      // ignore
    }
    return false;
  };

  const reconvertLayer = (mapping: LayerMapping) => {
    if (!olMap || !cesiumViewer) return;
    const view = olMap.getView();
    const resolvedVectorOpts: VectorOptions = {
      ...vectorOpts,
      resolution: view.getResolution() ?? vectorOpts.resolution ?? 1,
      extent: vectorOpts.extent ?? view.calculateExtent(),
    };
    const result = convertLayerToCesium(
      mapping.olLayer as any,
      resolvedVectorOpts,
    );
    if (!result) {
      mapping.cesiumLayer = null;
      return;
    }
    mapping.type = result.type;
    mapping.cesiumLayer = (result.imagery || result.dataSource || null) as any;
  };

  const addToCesiumViewer = (mapping: LayerMapping) => {
    if (!cesiumViewer) return;
    if (!mapping.cesiumLayer) reconvertLayer(mapping);
    if (!mapping.cesiumLayer) return;

    try {
      if (mapping.type === "imagery") {
        const layer = mapping.cesiumLayer as any;
        if (!hasImageryLayer(layer)) cesiumViewer.imageryLayers.add(layer);
      } else if (mapping.type === "vector") {
        const ds = mapping.cesiumLayer as any;
        if (!hasDataSource(ds)) cesiumViewer.dataSources.add(ds);
      }
    } catch {
      // ignore
    }
    cesiumViewer.scene.requestRender();
  };

  const addLayerToCesium = (olLayer: any) => {
    if (!olMap || !cesiumViewer) return;
    const view = olMap.getView();
    const resolvedVectorOpts: VectorOptions = {
      ...vectorOpts,
      resolution: view.getResolution() ?? vectorOpts.resolution ?? 1,
      extent: vectorOpts.extent ?? view.calculateExtent(),
    };
    const result = convertLayerToCesium(olLayer, resolvedVectorOpts);
    if (!result) return;

    const mapping: LayerMapping = {
      olLayer,
      cesiumLayer: result.imagery || result.dataSource || null,
      type: result.type,
      visible: olLayer.getVisible(),
      opacity: olLayer.getOpacity(),
    };

    if (mapping.visible) addToCesiumViewer(mapping);

    mappingsRef.current.push(mapping);
    attachPropertyListeners(olLayer);
    if (result.type === "vector") {
      attachFeatureListeners(olLayer);
    }
  };

  const updateCesiumZOrder = () => {
    if (!olMap || !cesiumViewer) return;
    const olLayers = olMap.getLayers().getArray();

    // Imagery layers order
    const imageryMappings = mappingsRef.current
      .filter((m) => m.type === "imagery" && m.cesiumLayer)
      .sort((a, b) => {
        const zA = a.olLayer.getZIndex() || 0;
        const zB = b.olLayer.getZIndex() || 0;
        if (zA !== zB) return zA - zB;
        return olLayers.indexOf(a.olLayer) - olLayers.indexOf(b.olLayer);
      });

    // Raise in sorted order so the last element ends up on top.
    imageryMappings.forEach((m) => {
      try {
        const layer = m.cesiumLayer as any;
        if (hasImageryLayer(layer))
          cesiumViewer.imageryLayers.raiseToTop(layer);
      } catch {
        // ignore
      }
    });

    const vectorMappings = mappingsRef.current
      .filter((m) => m.type === "vector" && m.cesiumLayer)
      .sort((a, b) => {
        const zA = a.olLayer.getZIndex() || 0;
        const zB = b.olLayer.getZIndex() || 0;
        if (zA !== zB) return zA - zB;
        return olLayers.indexOf(a.olLayer) - olLayers.indexOf(b.olLayer);
      });

    vectorMappings.forEach((m) => {
      try {
        const ds = m.cesiumLayer as any;
        if (hasDataSource(ds)) cesiumViewer.dataSources.raiseToTop(ds);
      } catch {
        // Some DataSourceCollection implementations may not support ordering.
      }
    });
  };

  const attachPropertyListeners = (layer: any) => {
    if (!layer || typeof layer.on !== "function") return;
    if (layerKeysRef.current.has(layer)) return;

    const onVis = () => {
      const mapping = mappingsRef.current.find((m) => m.olLayer === layer);
      if (!mapping) return;

      mapping.visible = layer.getVisible();
      if (mapping.visible) addToCesiumViewer(mapping);
      else removeFromCesiumViewer(mapping);

      syncVisibility(layer, mapping);
      updateCesiumZOrder();
    };
    const onOpacity = () => {
      const mapping = mappingsRef.current.find((m) => m.olLayer === layer);
      if (mapping) syncVisibility(layer, mapping);
    };
    const onZ = () => updateCesiumZOrder();

    const keys: EventsKey[] = [
      layer.on("change:visible", onVis),
      layer.on("change:opacity", onOpacity),
      layer.on("change:zIndex", onZ),
    ];
    layerKeysRef.current.set(layer, keys);
  };

  const attachFeatureListeners = (layer: any) => {
    const source = layer.getSource?.();
    if (!source || typeof source.on !== "function") return;

    if (sourceKeysRef.current.has(source)) return;

    const scheduleRefresh = () => {
      if (!cesiumViewer || !olMap) return;

      const existing = vectorRefreshTimerRef.current.get(layer);
      if (existing) clearTimeout(existing);

      const timer = setTimeout(() => {
        const mapping = mappingsRef.current.find((m) => m.olLayer === layer);
        if (!mapping || mapping.type !== "vector") return;
        if (!mapping.visible) return;

        // Full refresh for correctness; debounced to avoid thrash on bulk edits.
        try {
          if (mapping.cesiumLayer) {
            cesiumViewer.dataSources.remove(mapping.cesiumLayer as any, true);
            queueDestroy(mapping.cesiumLayer as any);
          }
        } catch {
          // ignore
        }

        const view = olMap.getView();
        const resolvedVectorOpts: VectorOptions = {
          ...vectorOpts,
          resolution: view.getResolution() ?? vectorOpts.resolution ?? 1,
          extent: vectorOpts.extent ?? view.calculateExtent(),
        };
        const result = convertLayerToCesium(layer, resolvedVectorOpts);
        if (result && result.dataSource) {
          cesiumViewer.dataSources.add(result.dataSource);
          mapping.cesiumLayer = result.dataSource;
        }
      }, 100);

      vectorRefreshTimerRef.current.set(layer, timer);
    };

    const keys: EventsKey[] = [
      source.on("addfeature", scheduleRefresh),
      source.on("removefeature", scheduleRefresh),
      source.on("clear", scheduleRefresh),
    ];
    sourceKeysRef.current.set(source, keys);
  };

  const syncAllVisibility = useCallback(() => {
    for (const mapping of mappingsRef.current) {
      syncVisibility(mapping.olLayer, mapping);
    }
  }, []);

  // Listen for layer collection changes
  useEffect(() => {
    if (!olMap || !cesiumViewer) return;

    // Initial sync
    syncLayers();
    reconcileAllLayerAttachments();

    const layers = olMap.getLayers();
    const onAdd = (event: any) => addLayerToCesium(event.element);
    const onRemove = (event: any) => {
      const mapping = mappingsRef.current.find(
        (m) => m.olLayer === event.element,
      );
      if (mapping) {
        removeCesiumObject(mapping, true);
        mappingsRef.current = mappingsRef.current.filter((m) => m !== mapping);
      }

      const layer = event.element;

      const layerKeys = layerKeysRef.current.get(layer);
      if (layerKeys) {
        unByKey(layerKeys);
        layerKeysRef.current.delete(layer);
      }

      const source = layer?.getSource?.();
      if (source) {
        const sourceKeys = sourceKeysRef.current.get(source);
        if (sourceKeys) {
          unByKey(sourceKeys);
          sourceKeysRef.current.delete(source);
        }
      }

      const timer = vectorRefreshTimerRef.current.get(layer);
      if (timer) {
        clearTimeout(timer);
        vectorRefreshTimerRef.current.delete(layer);
      }
    };

    layers.on("add", onAdd);
    layers.on("remove", onRemove);

    return () => {
      layers.un("add", onAdd);
      layers.un("remove", onRemove);

      for (const mapping of mappingsRef.current) {
        const layer = mapping.olLayer as any;
        const layerKeys = layerKeysRef.current.get(layer);
        if (layerKeys) unByKey(layerKeys);
        layerKeysRef.current.delete(layer);

        const source = layer?.getSource?.();
        if (source) {
          const sourceKeys = sourceKeysRef.current.get(source);
          if (sourceKeys) unByKey(sourceKeys);
          sourceKeysRef.current.delete(source);
        }

        const timer = vectorRefreshTimerRef.current.get(layer);
        if (timer) clearTimeout(timer);
        vectorRefreshTimerRef.current.delete(layer);
      }

      // Drop refs only; no manual destroy.
      pendingDestroyRef.current.splice(0, pendingDestroyRef.current.length);
    };
  }, [olMap, cesiumViewer, syncLayers]);

  return { syncLayers, syncAllVisibility, mappings: mappingsRef };
}

/* ─────────────────────────────────────────────
 *  useInteractionSync
 * ───────────────────────────────────────────── */

export function useInteractionSync(
  olMap: OlMap | null,
  cesiumViewer: CesiumViewer | null,
  options: InteractionSyncOptions | boolean = false,
) {
  useEffect(() => {
    if (!olMap || !cesiumViewer || !options) return;

    const opts: InteractionSyncOptions =
      typeof options === "boolean"
        ? { click: true, hover: true, select: true }
        : options;

    const handler = new ScreenSpaceEventHandler(cesiumViewer.scene.canvas);

    // Click sync: Cesium click → OL
    if (opts.click) {
      handler.setInputAction(
        (movement: { position: { x: number; y: number } }) => {
          const pick = cesiumViewer.scene.pick(
            new Cartesian2(movement.position.x, movement.position.y),
          );
          if (defined(pick) && pick.id) {
            // Dispatch a synthetic event on OL map
            const carto = cesiumViewer.scene.globe.pick(
              cesiumViewer.camera.getPickRay(
                new Cartesian2(movement.position.x, movement.position.y),
              )!,
              cesiumViewer.scene,
            );
            if (carto) {
              const cartographic =
                Ellipsoid.WGS84.cartesianToCartographic(carto);
              const lon = CesiumMath.toDegrees(cartographic.longitude);
              const lat = CesiumMath.toDegrees(cartographic.latitude);
              // Could dispatch a custom event on the OL map target
              olMap.dispatchEvent({
                type: "cesium:click",
                coordinate: fromLonLat([lon, lat]),
                entity: pick.id,
              } as any);
            }
          }
        },
        ScreenSpaceEventType.LEFT_CLICK,
      );
    }

    // Hover sync
    if (opts.hover) {
      handler.setInputAction(
        (movement: { endPosition: { x: number; y: number } }) => {
          const pick = cesiumViewer.scene.pick(
            new Cartesian2(movement.endPosition.x, movement.endPosition.y),
          );
          olMap.dispatchEvent({
            type: "cesium:hover",
            entity: defined(pick) ? pick.id : null,
          } as any);
        },
        ScreenSpaceEventType.MOUSE_MOVE,
      );
    }
    return () => {
      handler.destroy();
    };
  }, [olMap, cesiumViewer, options]);
}

/* ─────────────────────────────────────────────
 *  useAutoLayerOrder
 * ───────────────────────────────────────────── */

export function useAutoLayerOrder(
  olMap: OlMap | null,
  enabled: boolean = false,
) {
  useEffect(() => {
    if (!olMap || !enabled) return;

    const updateZIndex = (layer: any) => {
      // Respect user-defined zIndex if > 0
      if (layer.getZIndex() > 0) return;

      const source = layer.getSource?.();
      const isBase = layer instanceof TileLayer && !(source instanceof TileWMS); // XYZ, OSM, etc.

      const isWMS =
        source instanceof TileWMS ||
        source instanceof ImageWMS ||
        layer instanceof ImageLayer;

      const isVector =
        layer instanceof VectorLayer || layer instanceof VectorTileLayer;

      if (isBase) {
        layer.setZIndex(0);
      } else if (isWMS) {
        layer.setZIndex(10);
      } else if (isVector) {
        layer.setZIndex(20);
      }
    };

    const layers = olMap.getLayers();

    // Initial check
    layers.forEach(updateZIndex);

    const onAdd = (event: any) => {
      updateZIndex(event.element);
    };
    layers.on("add", onAdd);

    // Cleanup (Note: we don't necessarily want to remove zIndexes on cleanup,
    // but we should stop listening to additions)
    return () => {
      layers.un("add", onAdd);
    };
  }, [olMap, enabled]);
}
