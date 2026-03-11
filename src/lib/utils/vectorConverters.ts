/**
 * vectorConverters.ts
 * OpenLayers Feature/Geometry → Cesium Entity conversion
 */
import {
  Cartesian3,
  Color,
  Entity,
  PolygonHierarchy,
  HeightReference,
  ColorMaterialProperty,
  ConstantProperty,
  PolylineDashMaterialProperty,
  CustomDataSource,
  ConstantPositionProperty,
  NearFarScalar,
} from "cesium";

import { toLonLat } from "ol/proj.js";
import type OlFeature from "ol/Feature.js";
import type { Geometry as OlGeometry } from "ol/geom.js";
import Point from "ol/geom/Point.js";
import LineString from "ol/geom/LineString.js";
import Polygon from "ol/geom/Polygon.js";
import MultiPoint from "ol/geom/MultiPoint.js";
import MultiLineString from "ol/geom/MultiLineString.js";
import MultiPolygon from "ol/geom/MultiPolygon.js";
import Circle from "ol/geom/Circle.js";
import Style from "ol/style/Style.js";
import { getUid } from "ol/util.js";

import {
  mapStyleToCesiumStyle,
  olColorToCesiumColor,
  type CesiumStyleDescriptor,
} from "./styleConverters";
import type { VectorOptions } from "../types/adapter";

/* ─── Coordinate helpers ─── */

/**
 * Transforms OL coordinates (usually EPSG:3857) to Cartesian3 (WGS84)
 */
function olToCartesian3(coord: number[], h = 0): Cartesian3 {
  const [lon, lat] = toLonLat(coord);
  return Cartesian3.fromDegrees(lon, lat, coord[2] ?? h);
}

function olArrayToCartesian3Array(
  coords: number[][],
  height = 0,
): Cartesian3[] {
  return coords.map((c) => olToCartesian3(c, height));
}

/* ─── Point → Entity ─── */

function convertPoint(
  coord: number[],
  style: CesiumStyleDescriptor,
  opts: VectorOptions,
): Partial<Entity.ConstructorOptions> {
  const [lon, lat, z] = coord;
  const position = olToCartesian3(coord, z ?? 0);

  const entityOpts: Partial<Entity.ConstructorOptions> = {
    position,
  };

  // Circle / Point style
  if (style.circle) {
    entityOpts.point = {
      color: style.circle.color,
      pixelSize: style.circle.pixelSize,
      outlineColor: style.circle.outlineColor,
      outlineWidth: style.circle.outlineWidth,
      heightReference: HeightReference.CLAMP_TO_GROUND,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    } as any;
  }

  // Billboard (icon)
  if (style.billboard?.image) {
    entityOpts.billboard = {
      image: style.billboard.image,
      scale: style.billboard.scale,
      rotation: style.billboard.rotation,
      heightReference: HeightReference.CLAMP_TO_GROUND,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    } as any;
  }

  // Label
  if (style.label && opts.label) {
    entityOpts.label = {
      text: style.label.text,
      font: style.label.font,
      fillColor: style.label.fillColor,
      outlineColor: style.label.outlineColor,
      outlineWidth: style.label.outlineWidth,
      style: style.label.style,
      scale: style.label.scale,
      pixelOffset: style.label.pixelOffset,
      heightReference: HeightReference.CLAMP_TO_GROUND,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
      scaleByDistance: style.label.scaleByDistance,
    } as any;
  }

  return entityOpts;
}

/* ─── LineString → Polyline Entity ─── */

function convertLineString(
  coords: number[][],
  style: CesiumStyleDescriptor,
): Partial<Entity.ConstructorOptions> {
  const positions = olArrayToCartesian3Array(coords);
  const stroke = style.stroke;

  return {
    polyline: {
      positions,
      width: stroke?.width ?? 2,
      material: stroke
        ? new ColorMaterialProperty(stroke.color)
        : new ColorMaterialProperty(Color.WHITE),
      clampToGround: true,
    } as any,
  };
}

/* ─── Polygon → Polygon Entity ─── */

function convertPolygon(
  coords: number[][][],
  style: CesiumStyleDescriptor,
  opts: VectorOptions,
): Partial<Entity.ConstructorOptions> {
  const outerRing = olArrayToCartesian3Array(coords[0]);
  const holes = coords.slice(1).map((ring) => ({
    positions: olArrayToCartesian3Array(ring),
  }));

  const fill = style.fill;
  const stroke = style.stroke;

  const polygonOpts: any = {
    hierarchy: new PolygonHierarchy(outerRing, holes as any),
    material: fill
      ? new ColorMaterialProperty(fill.color)
      : new ColorMaterialProperty(Color.WHITE.withAlpha(0.5)),
  };

  // Extrusion support
  if (opts.extrude) {
    polygonOpts.extrudedHeight = opts.extrudeHeight ?? 100;
    polygonOpts.heightReference = HeightReference.RELATIVE_TO_GROUND;
  }

  const entityOpts: Partial<Entity.ConstructorOptions> = {
    polygon: polygonOpts,
  };

  // Outline
  if (stroke) {
    entityOpts.polyline = {
      positions: outerRing,
      width: stroke.width,
      material: new ColorMaterialProperty(stroke.color),
      clampToGround: true,
    } as any;
  }

  return entityOpts;
}

/* ─── Circle → Ellipse Entity ─── */

function convertCircleGeom(
  center: number[],
  radius: number,
  style: CesiumStyleDescriptor,
): Partial<Entity.ConstructorOptions> {
  const fill = style.fill;
  const stroke = style.stroke;

  return {
    position: olToCartesian3(center),
    ellipse: {
      semiMajorAxis: radius,
      semiMinorAxis: radius,
      material: fill
        ? new ColorMaterialProperty(fill.color)
        : new ColorMaterialProperty(Color.WHITE.withAlpha(0.5)),
      outline: !!stroke,
      outlineColor: stroke?.color ?? Color.BLACK,
      outlineWidth: stroke?.width ?? 1,
      heightReference: HeightReference.CLAMP_TO_GROUND,
    } as any,
  };
}

/* ─── Feature → Entity (main entry point) ─── */

export function convertFeatureToEntity(
  feature: OlFeature<OlGeometry>,
  opts: VectorOptions = {},
  layerStyle?: Style | ((feature: any, res: number) => Style | Style[]),
): Entity | Entity[] | null {
  const geom = feature.getGeometry();
  if (!geom) return null;

  // Resolve Style
  let olStyle = feature.getStyle() || layerStyle;
  if (typeof olStyle === "function") {
    const resolution = opts.resolution ?? 1;
    olStyle = (olStyle as any)(feature, resolution);
  }

  // Handle array of styles (pick first for now)
  const resolvedStyle = Array.isArray(olStyle) ? olStyle[0] : (olStyle as any);
  const style = mapStyleToCesiumStyle(resolvedStyle);

  const id = feature.getId()?.toString() ?? `feature_${getUid(feature)}`;
  // IMPORTANT: never mutate `feature.getProperties()` result in-place.
  // Depending on OL version this may be a live reference to internal values_.
  const properties: Record<string, any> = {
    ...(feature.getProperties() as any),
  };
  // Remove geometry from properties to avoid circular refs / huge payloads
  delete (properties as any).geometry;

  const createEntity = (
    partialOpts: Partial<Entity.ConstructorOptions>,
    suffix = "",
  ): Entity => {
    return new Entity({
      id: id + suffix,
      name: (properties.name as string) ?? id + suffix,
      ...partialOpts,
      properties: properties as any,
    });
  };

  const type = geom.getType();

  switch (type) {
    case "Point": {
      const coord = (geom as Point).getCoordinates();
      if (!coord || coord.length < 2) return null;
      return createEntity(convertPoint(coord, style, opts));
    }

    case "LineString": {
      const coords = (geom as LineString).getCoordinates();
      if (!coords || coords.length < 2) return null;
      return createEntity(convertLineString(coords, style));
    }

    case "Polygon": {
      const coords = (geom as Polygon).getCoordinates();
      if (!coords || coords.length === 0 || !coords[0] || coords[0].length < 3)
        return null;
      return createEntity(convertPolygon(coords, style, opts));
    }

    case "Circle": {
      const c = geom as Circle;
      return createEntity(
        convertCircleGeom(c.getCenter(), c.getRadius(), style),
      );
    }

    case "MultiPoint": {
      const points = (geom as MultiPoint).getPoints();
      if (!points || points.length === 0) return null;
      return points.map((p, i) =>
        createEntity(convertPoint(p.getCoordinates(), style, opts), `_${i}`),
      );
    }

    case "MultiLineString": {
      const lines = (geom as MultiLineString).getLineStrings();
      if (!lines || lines.length === 0) return null;
      return lines.map((l, i) =>
        createEntity(convertLineString(l.getCoordinates(), style), `_${i}`),
      );
    }

    case "MultiPolygon": {
      const polys = (geom as MultiPolygon).getPolygons();
      if (!polys || polys.length === 0) return null;
      return polys.map((p, i) =>
        createEntity(convertPolygon(p.getCoordinates(), style, opts), `_${i}`),
      );
    }

    default:
      console.warn(`[vectorConverters] Unsupported geometry type: ${type}`);
      return null;
  }
}

/* ─── Batch convert: OL features → Cesium CustomDataSource ─── */

export function convertFeaturesToDataSource(
  features: OlFeature<OlGeometry>[],
  name: string,
  opts: VectorOptions = {},
  layerStyle?: any,
): CustomDataSource {
  const ds = new CustomDataSource(name);
  const extent = opts.extent;

  for (const feature of features) {
    const geom = feature.getGeometry();
    if (!geom) continue;

    // Simple extent check if provided
    if (extent && !geom.intersectsExtent(extent)) {
      continue;
    }

    const result = convertFeatureToEntity(feature, opts, layerStyle);
    if (!result) continue;

    if (Array.isArray(result)) {
      result.forEach((e) => ds.entities.add(e));
    } else {
      ds.entities.add(result);
    }
  }

  return ds;
}
