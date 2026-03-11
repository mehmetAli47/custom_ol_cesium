/**
 * Bu dosya ne yapiyor?
 * OpenLayers tarafindaki layer listesini dinliyor ve Cesium tarafinda karsiligini olusturuyor.
 * Ornek:
 * - OL'de WMS acilirsa Cesium'a imagery layer ekler
 * - OL'de vector layer varsa Cesium'a dataSource/entity cevirir
 * - visible/opacity/zIndex degisince Cesium tarafini aninda gunceller
 *
 * Not: Daha once yasadigimiz "3D'ye ilk geciste vector acikken Cesium render patliyor" problemini
 * cozmek icin, ilk enable aninda vector dataSource eklemeyi 1 frame sonrasina (postRender) erteliyoruz.
 */
import type OlMap from "ol/Map.js";
import type BaseLayer from "ol/layer/Base.js";
import { unByKey } from "ol/Observable.js";
import type { EventsKey } from "ol/events.js";

import type { Viewer } from "cesium";

import {
  convertLayerToCesium,
  syncVisibility,
} from "../../utils/layerConverters";
import type { LayerMapping, VectorOptions } from "../../types/adapter";
import { withPausedRender } from "../render/withPausedRender";

export class LayerSync {
  private map: OlMap;
  private viewer: Viewer;
  private vectorOptions: VectorOptions;
  private autoOrderLayers: boolean;

  private layerMappings: LayerMapping[] = [];
  private layerKeys = new WeakMap<any, EventsKey[]>();
  private sourceKeys = new WeakMap<any, EventsKey[]>();
  private vectorRefreshTimers = new WeakMap<
    any,
    ReturnType<typeof setTimeout>
  >();

  // Collection listeners (add/remove)
  private layersCollectionKeys: EventsKey[] = [];

  // First-enable stability: defer attaching vector sources until after first frame.
  private deferVectorAttachOnce = false;
  private pendingVectorAttach: LayerMapping[] = [];
  private pendingVectorAttachRemove: (() => void) | null = null;

  constructor(args: {
    map: OlMap;
    viewer: Viewer;
    vectorOptions?: VectorOptions;
    autoOrderLayers?: boolean;
  }) {
    this.map = args.map;
    this.viewer = args.viewer;
    this.vectorOptions = args.vectorOptions ?? {};
    this.autoOrderLayers = args.autoOrderLayers ?? true;
  }

  attach() {
    const layers = this.map.getLayers();
    const onAdd = (event: any) => this.addLayerToCesium(event.element);
    const onRemove = (event: any) => this.removeLayerFromCesium(event.element);
    this.layersCollectionKeys = [
      layers.on("add", onAdd),
      layers.on("remove", onRemove),
    ];

    // When 3D is disabled we detach per-layer listeners. If 3D is enabled again,
    // we must re-attach listeners for existing layers/mappings; otherwise toggles
    // like `setVisible(false)` won't be observed while 3D is active.
    for (const olLayer of layers.getArray() as any[]) {
      this.attachLayerListeners(olLayer);
      const source = olLayer?.getSource?.();
      // Only vector sources have feature events; guard to avoid useless listeners.
      if (source && typeof source.getFeatures === "function") {
        this.attachSourceListeners(olLayer);
      }
    }
  }

  detach() {
    if (this.layersCollectionKeys.length) {
      unByKey(this.layersCollectionKeys);
      this.layersCollectionKeys = [];
    }

    for (const mapping of this.layerMappings) {
      this.cleanupLayerListeners(mapping.olLayer as any);
    }

    if (this.pendingVectorAttachRemove) {
      this.pendingVectorAttachRemove();
      this.pendingVectorAttachRemove = null;
    }
    this.deferVectorAttachOnce = false;
    this.pendingVectorAttach.splice(0, this.pendingVectorAttach.length);
  }

  beginEnableTransaction() {
    this.deferVectorAttachOnce = true;
    this.pendingVectorAttach = [];
  }

  endEnableTransaction() {
    // One-time: attach vector layers after the first frame is rendered.
    if (this.pendingVectorAttachRemove) return;
    this.pendingVectorAttachRemove =
      this.viewer.scene.postRender.addEventListener(() => {
        const batch = this.pendingVectorAttach.splice(
          0,
          this.pendingVectorAttach.length,
        );
        for (const mapping of batch) {
          if (!mapping?.visible) continue;
          if (mapping.type !== "vector") continue;
          const ds: any = mapping.cesiumLayer;
          if (!ds) continue;
          try {
            if (!this.hasDataSource(ds)) this.viewer.dataSources.add(ds);
          } catch {
            // ignore
          }
        }
        this.deferVectorAttachOnce = false;
        if (this.pendingVectorAttachRemove) {
          this.pendingVectorAttachRemove();
          this.pendingVectorAttachRemove = null;
        }
        this.viewer.scene.requestRender();
      });
  }

  syncOnce() {
    this.syncLayers();
    // Vector katmanları için ek senkronizasyon
    this.refreshVectorLayers();
  }

  private refreshVectorLayers() {
    for (const mapping of this.layerMappings) {
      if (mapping.type === "vector" && mapping.visible) {
        const source = (mapping.olLayer as any)?.getSource?.();
        if (source && typeof source.getFeatures === "function") {
          // Mevcut dataSource'yı kaldır ve yeniden oluştur
          if (mapping.cesiumLayer) {
            try {
              this.viewer.dataSources.remove(mapping.cesiumLayer as any, true);
            } catch {
              // ignore
            }
          }

          const view = this.map.getView();
          const resolvedVectorOpts: VectorOptions = {
            ...this.vectorOptions,
            resolution:
              view.getResolution() ?? this.vectorOptions.resolution ?? 1,
            extent: this.vectorOptions.extent ?? view.calculateExtent(),
          };

          const result = convertLayerToCesium(
            mapping.olLayer as any,
            resolvedVectorOpts,
          );
          if (result && result.dataSource) {
            this.viewer.dataSources.add(result.dataSource);
            mapping.cesiumLayer = result.dataSource;
          }
        }
      }
    }
    this.updateCesiumZOrder();
    this.viewer.scene.requestRender();
  }

  clearCesiumLayers(destroy = true) {
    for (const mapping of this.layerMappings) {
      this.removeCesiumObject(mapping, destroy);
    }
    this.layerMappings = [];

    // Default base imagery'yi koru, sadece OL'den sync edilenleri temizle
    const ilc = this.viewer.imageryLayers;
    for (let i = ilc.length - 1; i >= 0; i--) {
      const layer = ilc.get(i);
      if ((layer as any)._isDefaultBase) continue;
      ilc.remove(layer, false);
    }
    this.viewer.dataSources.removeAll(false);
  }

  private syncLayers() {
    const layers = this.map.getLayers().getArray();

    // Remove mappings for layers no longer present
    const remaining: LayerMapping[] = [];
    for (const mapping of this.layerMappings) {
      if (layers.includes(mapping.olLayer)) {
        remaining.push(mapping);
      } else {
        withPausedRender(this.viewer, () =>
          this.removeCesiumObject(mapping, true),
        );
        this.cleanupLayerListeners(mapping.olLayer as any);
      }
    }
    this.layerMappings = remaining;

    // Add missing layers
    for (const olLayer of layers) {
      // isDefaultBase olan katmanlari atla
      if ((olLayer as any).get?.("isDefaultBase")) continue;
      if (!this.layerMappings.find((m) => m.olLayer === (olLayer as any))) {
        this.addLayerToCesium(olLayer as any);
      }
    }

    if (this.autoOrderLayers) this.applyDefaultZIndex();
    this.reconcileAllLayerAttachments();
    this.updateCesiumZOrder();
  }

  private addLayerToCesium(olLayer: BaseLayer) {
    // isDefaultBase isaretli katmanlari atla — Cesium tarafinda zaten default base var.
    if ((olLayer as any).get?.("isDefaultBase")) return;

    const view = this.map.getView();
    const resolvedVectorOpts: VectorOptions = {
      ...this.vectorOptions,
      resolution: view.getResolution() ?? this.vectorOptions.resolution ?? 1,
      extent: this.vectorOptions.extent ?? view.calculateExtent(),
    };

    const result = convertLayerToCesium(olLayer, resolvedVectorOpts);
    if (!result) return;

    const mapping: LayerMapping = {
      olLayer,
      cesiumLayer: (result.imagery || result.dataSource || null) as any,
      type: result.type,
      visible: (olLayer as any).getVisible?.() ?? true,
      opacity: (olLayer as any).getOpacity?.() ?? 1,
    };

    if (mapping.visible) {
      if (result.type === "imagery" && result.imagery) {
        this.viewer.imageryLayers.add(result.imagery);
      } else if (result.type === "vector" && result.dataSource) {
        if (this.deferVectorAttachOnce) this.pendingVectorAttach.push(mapping);
        else this.viewer.dataSources.add(result.dataSource);
      }
    }

    this.layerMappings.push(mapping);
    this.attachLayerListeners(olLayer as any);
    if (result.type === "vector") this.attachSourceListeners(olLayer as any);
    this.updateCesiumZOrder();
    this.viewer.scene.requestRender();
  }

  private removeLayerFromCesium(olLayer: BaseLayer) {
    const mapping = this.layerMappings.find((m) => m.olLayer === olLayer);
    if (!mapping) return;
    withPausedRender(this.viewer, () => this.removeCesiumObject(mapping, true));
    this.cleanupLayerListeners(olLayer as any);
    this.layerMappings = this.layerMappings.filter((m) => m !== mapping);
    this.viewer.scene.requestRender();
  }

  private hasImageryLayer(layer: any): boolean {
    const c: any = this.viewer.imageryLayers;
    try {
      if (typeof c.contains === "function") return !!c.contains(layer);
      if (typeof c.indexOf === "function") return c.indexOf(layer) !== -1;
    } catch {
      // ignore
    }
    return false;
  }

  private hasDataSource(ds: any): boolean {
    const c: any = this.viewer.dataSources;
    try {
      if (typeof c.contains === "function") return !!c.contains(ds);
      if (typeof c.indexOf === "function") return c.indexOf(ds) !== -1;
    } catch {
      // ignore
    }
    return false;
  }

  private removeCesiumObject(mapping: LayerMapping, destroy = true) {
    if (!mapping.cesiumLayer) return;
    const obj = mapping.cesiumLayer as any;
    try {
      if (mapping.type === "imagery") {
        this.viewer.imageryLayers.remove(obj, !!destroy);
      } else if (mapping.type === "vector") {
        this.viewer.dataSources.remove(obj, !!destroy);
      }
    } catch {
      // ignore
    }
    if (destroy) mapping.cesiumLayer = null;
  }

  private reconvertLayer(mapping: LayerMapping) {
    const view = this.map.getView();
    const resolvedVectorOpts: VectorOptions = {
      ...this.vectorOptions,
      resolution: view.getResolution() ?? this.vectorOptions.resolution ?? 1,
      extent: this.vectorOptions.extent ?? view.calculateExtent(),
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
  }

  private addToCesiumViewer(mapping: LayerMapping) {
    if (!mapping.cesiumLayer) this.reconvertLayer(mapping);
    if (!mapping.cesiumLayer) return;

    try {
      if (mapping.type === "imagery") {
        const layer = mapping.cesiumLayer as any;
        if (!this.hasImageryLayer(layer)) this.viewer.imageryLayers.add(layer);
      } else if (mapping.type === "vector") {
        const ds = mapping.cesiumLayer as any;
        if (this.deferVectorAttachOnce) {
          if (!this.pendingVectorAttach.includes(mapping))
            this.pendingVectorAttach.push(mapping);
        } else {
          if (!this.hasDataSource(ds)) this.viewer.dataSources.add(ds);
        }
      }
    } catch {
      // ignore
    }
    this.viewer.scene.requestRender();
  }

  private removeFromCesiumViewer(mapping: LayerMapping) {
    if (!mapping.cesiumLayer) return;
    // Detach only; keep object for reuse when toggled visible again.
    this.removeCesiumObject(mapping, false);
    this.viewer.scene.requestRender();
  }

  private reconcileAllLayerAttachments() {
    for (const mapping of this.layerMappings) {
      const layer: any = mapping.olLayer as any;
      const visible =
        typeof layer?.getVisible === "function" ? layer.getVisible() : true;
      mapping.visible = visible;

      if (visible) this.addToCesiumViewer(mapping);
      else this.removeFromCesiumViewer(mapping);

      try {
        syncVisibility(layer, mapping);
      } catch {
        // ignore
      }
    }
  }

  private attachLayerListeners(layer: any) {
    if (!layer || typeof layer.on !== "function") return;
    if (this.layerKeys.has(layer)) return;

    const onVis = () => {
      const mapping = this.layerMappings.find((m) => m.olLayer === layer);
      if (!mapping) return;

      mapping.visible = layer.getVisible();
      withPausedRender(this.viewer, () => {
        if (mapping.visible) this.addToCesiumViewer(mapping);
        else this.removeFromCesiumViewer(mapping);
      });

      syncVisibility(layer, mapping);
      this.updateCesiumZOrder();
    };
    const onOpacity = () => {
      const mapping = this.layerMappings.find((m) => m.olLayer === layer);
      if (mapping) syncVisibility(layer, mapping);
      this.viewer.scene.requestRender();
    };
    const onZ = () => {
      this.updateCesiumZOrder();
      this.viewer.scene.requestRender();
    };

    const keys: EventsKey[] = [
      layer.on("change:visible", onVis),
      layer.on("change:opacity", onOpacity),
      layer.on("change:zIndex", onZ),
    ];
    this.layerKeys.set(layer, keys);
  }

  private attachSourceListeners(layer: any) {
    const source = layer?.getSource?.();
    if (!source || typeof source.on !== "function") return;
    if (this.sourceKeys.has(source)) return;

    const scheduleRefresh = () => {
      const existing = this.vectorRefreshTimers.get(layer);
      if (existing) clearTimeout(existing);

      const timer = setTimeout(() => {
        const mapping = this.layerMappings.find((m) => m.olLayer === layer);
        if (!mapping || mapping.type !== "vector") return;
        if (!mapping.visible) return;

        try {
          if (mapping.cesiumLayer) {
            this.viewer.dataSources.remove(mapping.cesiumLayer as any, true);
          }
        } catch {
          // ignore
        }

        const view = this.map.getView();
        const resolvedVectorOpts: VectorOptions = {
          ...this.vectorOptions,
          resolution:
            view.getResolution() ?? this.vectorOptions.resolution ?? 1,
          extent: this.vectorOptions.extent ?? view.calculateExtent(),
        };
        const result = convertLayerToCesium(layer, resolvedVectorOpts);
        if (result && result.dataSource) {
          this.viewer.dataSources.add(result.dataSource);
          mapping.cesiumLayer = result.dataSource;
          this.updateCesiumZOrder();
          this.viewer.scene.requestRender();
        }
      }, 50); // 100 yerine 50ms ile daha hızlı güncelleme

      this.vectorRefreshTimers.set(layer, timer);
    };

    const keys: EventsKey[] = [
      source.on("addfeature", scheduleRefresh),
      source.on("removefeature", scheduleRefresh),
      source.on("clear", scheduleRefresh),
      source.on("changefeature", scheduleRefresh), // Feature değişikliklerini de izle
    ];
    this.sourceKeys.set(source, keys);
  }

  private cleanupLayerListeners(layer: any) {
    const layerKeys = this.layerKeys.get(layer);
    if (layerKeys) {
      unByKey(layerKeys);
      this.layerKeys.delete(layer);
    }

    const source = layer?.getSource?.();
    if (source) {
      const sourceKeys = this.sourceKeys.get(source);
      if (sourceKeys) {
        unByKey(sourceKeys);
        this.sourceKeys.delete(source);
      }
    }

    const timer = this.vectorRefreshTimers.get(layer);
    if (timer) {
      clearTimeout(timer);
      this.vectorRefreshTimers.delete(layer);
    }
  }

  private updateCesiumZOrder() {
    const olLayers = this.map.getLayers().getArray();

    const imageryMappings = this.layerMappings
      .filter((m) => m.type === "imagery" && m.cesiumLayer)
      .sort((a, b) => {
        const zA = (a.olLayer as any).getZIndex?.() || 0;
        const zB = (b.olLayer as any).getZIndex?.() || 0;
        if (zA !== zB) return zA - zB;
        return olLayers.indexOf(a.olLayer) - olLayers.indexOf(b.olLayer);
      });
    imageryMappings.forEach((m) => {
      try {
        const layer = m.cesiumLayer as any;
        if (this.hasImageryLayer(layer))
          this.viewer.imageryLayers.raiseToTop(layer);
      } catch {
        // ignore
      }
    });

    const vectorMappings = this.layerMappings
      .filter((m) => m.type === "vector" && m.cesiumLayer)
      .sort((a, b) => {
        const zA = (a.olLayer as any).getZIndex?.() || 0;
        const zB = (b.olLayer as any).getZIndex?.() || 0;
        if (zA !== zB) return zA - zB;
        return olLayers.indexOf(a.olLayer) - olLayers.indexOf(b.olLayer);
      });
    vectorMappings.forEach((m) => {
      try {
        const ds = m.cesiumLayer as any;
        if (
          (this.viewer.dataSources as any).raiseToTop &&
          this.hasDataSource(ds)
        ) {
          (this.viewer.dataSources as any).raiseToTop(ds);
        }
      } catch {
        // ignore
      }
    });
  }

  private applyDefaultZIndex() {
    for (const layer of this.map.getLayers().getArray() as any[]) {
      if (!layer || typeof layer.getZIndex !== "function") continue;
      if (layer.getZIndex() > 0) continue;

      const source = layer.getSource?.();
      const isTile = layer?.constructor?.name?.includes?.("Tile") ?? false;
      const isVector = layer?.constructor?.name?.includes?.("Vector") ?? false;
      const isWms = source?.constructor?.name?.includes?.("WMS") ?? false;

      if (isTile && !isWms) layer.setZIndex(0);
      else if (isWms) layer.setZIndex(10);
      else if (isVector) layer.setZIndex(20);
    }
  }
}
