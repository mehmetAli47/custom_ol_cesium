/**
 * layerConverters.ts
 * OpenLayers Layer → Cesium ImageryLayer / DataSource conversion
 */
import {
  ImageryLayer,
  UrlTemplateImageryProvider,
  WebMapServiceImageryProvider,
  WebMapTileServiceImageryProvider,
  SingleTileImageryProvider,
  CustomDataSource,
  Rectangle,
} from "cesium";

import type OlBaseLayer from "ol/layer/Base.js";
import TileLayer from "ol/layer/Tile.js";
import ImageLayer from "ol/layer/Image.js";
import VectorLayer from "ol/layer/Vector.js";
import XYZ from "ol/source/XYZ.js";
import OSM from "ol/source/OSM.js";
import TileWMS from "ol/source/TileWMS.js";
import WMTS from "ol/source/WMTS.js";
import ImageWMS from "ol/source/ImageWMS.js";
import VectorSource from "ol/source/Vector.js";
import { getUid } from "ol/util.js";

import { convertFeaturesToDataSource } from "./vectorConverters";
import type { VectorOptions, LayerMapping } from "../types/adapter";

/* ─── XYZ / OSM → UrlTemplateImageryProvider ─── */

function convertXYZLayer(layer: TileLayer<XYZ | OSM>): ImageryLayer | null {
  const source = layer.getSource();
  if (!source) return null;

  let url: string | undefined;

  if (source instanceof OSM) {
    url = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
  } else {
    const urls = (source as any).getUrls?.() || [];
    url = urls.length > 0 ? urls[0] : (source as any).getUrl?.();
  }

  if (!url) return null;

  // OpenLayers uses {x}, {y}, {z}. Cesium expects {x}, {y}, {z} too.
  // Also handle subdomain patterns like {a-c} or {0-3} by picking the first option.
  const cleanUrl = url
    .replace(/\{x\}/g, "{x}")
    .replace(/\{y\}/g, "{y}")
    .replace(/\{z\}/g, "{z}")
    .replace(/\{([a-z0-9])-[a-z0-9]\}/g, "$1");

  const provider = new UrlTemplateImageryProvider({
    url: cleanUrl,
    minimumLevel: 0,
    maximumLevel: 19,
  });

  const imageryLayer = new ImageryLayer(provider, {
    alpha: layer.getOpacity(),
    show: layer.getVisible(),
  });

  return imageryLayer;
}

/* ─── TileWMS → WebMapServiceImageryProvider ─── */

function convertWMSLayer(layer: TileLayer<TileWMS>): ImageryLayer | null {
  const source = layer.getSource();
  if (!source) return null;

  const urls = (source as any).getUrls?.() || [];
  let url = urls.length > 0 ? urls[0] : (source as any).getUrl?.();

  if (!url) return null;

  // Remove query params from base URL for Cesium provider
  const baseUrl = url.split("?")[0];
  const params = source.getParams();

  const provider = new WebMapServiceImageryProvider({
    url: baseUrl,
    layers: params.LAYERS ?? params.layers ?? "",
    parameters: {
      transparent: true,
      format: params.FORMAT ?? params.format ?? "image/png",
      VERSION: params.VERSION ?? "1.1.1", // Add VERSION as default
      // Filter out layers/LAYERS from params to avoid duplication in query string
      ...Object.fromEntries(
        Object.entries(params).filter(([k]) => k.toUpperCase() !== "LAYERS"),
      ),
    },
    enablePickFeatures: false,
  });

  return new ImageryLayer(provider, {
    alpha: layer.getOpacity(),
    show: layer.getVisible(),
  });
}

/* ─── WMTS → WebMapTileServiceImageryProvider ─── */

function convertWMTSLayer(layer: TileLayer<WMTS>): ImageryLayer | null {
  const source = layer.getSource();
  if (!source) return null;

  const urls = source.getUrls?.() || [];
  if (urls.length === 0) return null;

  try {
    const provider = new WebMapTileServiceImageryProvider({
      url: urls[0],
      layer: (source as any).getLayer?.() ?? "",
      style: (source as any).getStyle?.() ?? "default",
      tileMatrixSetID: (source as any).getMatrixSet?.() ?? "default",
      format: (source as any).getFormat?.() ?? "image/png",
    });

    return new ImageryLayer(provider, {
      alpha: layer.getOpacity(),
      show: layer.getVisible(),
    });
  } catch (e) {
    console.warn("[layerConverters] Failed to convert WMTS layer:", e);
    return null;
  }
}

/* ─── ImageWMS → SingleTileImageryProvider ─── */

function convertImageWMSLayer(
  layer: ImageLayer<ImageWMS>,
): ImageryLayer | null {
  const source = layer.getSource();
  if (!source) return null;

  const url = source.getUrl?.();
  if (!url) return null;

  const params = source.getParams();

  const fullUrl = `${url}?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&LAYERS=${
    params.LAYERS ?? ""
  }&STYLES=&FORMAT=image/png&TRANSPARENT=true&SRS=EPSG:4326&BBOX=-180,-90,180,90&WIDTH=1024&HEIGHT=512`;

  try {
    const provider = new SingleTileImageryProvider({
      url: fullUrl,
      rectangle: Rectangle.fromDegrees(-180, -90, 180, 90),
    });

    return new ImageryLayer(provider, {
      alpha: layer.getOpacity(),
      show: layer.getVisible(),
    });
  } catch (e) {
    console.warn("[layerConverters] Failed to convert ImageWMS layer:", e);
    return null;
  }
}

/* ─── VectorLayer → CustomDataSource ─── */

function convertVectorLayer(
  layer: VectorLayer<any>,
  opts: VectorOptions = {},
): CustomDataSource | null {
  const source = layer.getSource();
  if (!source) return null;

  const features = source.getFeatures();
  const name =
    (layer.get("title") as string) ??
    (layer.get("name") as string) ??
    `vector_${getUid(layer)}`;

  const layerStyle = (layer as any).getStyle();
  const ds = convertFeaturesToDataSource(features, name, opts, layerStyle);
  ds.show = layer.getVisible();

  return ds;
}

/* ─── Master converter ─── */

export type ConvertedResult = {
  type: "imagery" | "vector";
  imagery?: ImageryLayer;
  dataSource?: CustomDataSource;
};

export function convertLayerToCesium(
  layer: OlBaseLayer,
  vectorOpts: VectorOptions = {},
): ConvertedResult | null {
  const anyLayer = layer as any;
  const title = anyLayer?.get?.("title") || "unnamed";
  const layerType = anyLayer?.getType?.() || "unknown";

  // TileLayer
  if (layer instanceof TileLayer || layerType === "TILE") {
    const source = (layer as any).getSource();
    if (!source) return null;

    // IMPORTANT: detect WMS before generic XYZ/getUrls checks.
    if (source instanceof TileWMS || typeof source.getParams === "function") {
      const result = convertWMSLayer(layer as any);
      return result ? { type: "imagery", imagery: result } : null;
    }

    if (
      source instanceof OSM ||
      source instanceof XYZ ||
      typeof source.getUrls === "function" ||
      typeof source.getUrl === "function"
    ) {
      const result = convertXYZLayer(layer as any);
      return result ? { type: "imagery", imagery: result } : null;
    }

    if (source instanceof WMTS) {
      const result = convertWMTSLayer(layer as any);
      return result ? { type: "imagery", imagery: result } : null;
    }
  }

  // ImageLayer
  if (layer instanceof ImageLayer || layerType === "IMAGE") {
    const source = (layer as any).getSource();
    if (source instanceof ImageWMS || (source.getParams && source.getUrl)) {
      const result = convertImageWMSLayer(layer as any);
      return result ? { type: "imagery", imagery: result } : null;
    }
  }

  // VectorLayer
  if (layer instanceof VectorLayer || layerType === "VECTOR") {
    const result = convertVectorLayer(layer as any, vectorOpts);
    return result ? { type: "vector", dataSource: result } : null;
  }

  console.warn(
    "[layerConverters] Unsupported layer type or source:",
    layer.constructor.name,
    title,
    layerType,
  );
  return null;
}

/* ─── Sync layer visibility ─── */

export function syncVisibility(
  olLayer: OlBaseLayer,
  mapping: LayerMapping,
): void {
  const visible = olLayer.getVisible();
  const opacity = olLayer.getOpacity();

  if (mapping.cesiumLayer) {
    if ("show" in mapping.cesiumLayer) {
      (mapping.cesiumLayer as any).show = visible;
    }
    if ("alpha" in mapping.cesiumLayer) {
      (mapping.cesiumLayer as any).alpha = opacity;
    }
  }

  mapping.visible = visible;
  mapping.opacity = opacity;
}
