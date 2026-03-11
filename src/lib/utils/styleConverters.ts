/**
 * styleConverters.ts
 * OpenLayers Style → Cesium visual properties mapping
 */
import {
  Color,
  HeightReference,
  HorizontalOrigin,
  VerticalOrigin,
  LabelStyle as CesiumLabelStyle,
  NearFarScalar,
  Cartesian2,
} from "cesium";

import type Style from "ol/style/Style.js";
import type Fill from "ol/style/Fill.js";
import type Stroke from "ol/style/Stroke.js";
import type CircleStyle from "ol/style/Circle.js";
import type IconStyle from "ol/style/Icon.js";
import type TextStyle from "ol/style/Text.js";

/* ─── Color Conversion ─── */

/**
 * Convert an OL color string or array to a Cesium Color.
 * Supports: 'rgba(r,g,b,a)', '#rrggbb', '#rrggbbaa', [r,g,b,a]
 */
export function olColorToCesiumColor(
  olColor: string | number[] | undefined,
): Color {
  if (!olColor) return Color.WHITE;

  if (Array.isArray(olColor)) {
    const [r, g, b, a = 1] = olColor;
    return new Color(r / 255, g / 255, b / 255, a);
  }

  if (typeof olColor === "string") {
    // Try Cesium's built-in CSS color parsing
    try {
      return Color.fromCssColorString(olColor);
    } catch {
      return Color.WHITE;
    }
  }

  return Color.WHITE;
}

/* ─── Fill → Cesium Material Color ─── */

export interface CesiumFillStyle {
  color: Color;
}

export function convertFill(
  fill: Fill | null | undefined,
): CesiumFillStyle | null {
  if (!fill) return null;
  const c = fill.getColor();
  return {
    color: olColorToCesiumColor(c as string | number[] | undefined),
  };
}

/* ─── Stroke → Cesium Polyline Style ─── */

export interface CesiumStrokeStyle {
  color: Color;
  width: number;
}

export function convertStroke(
  stroke: Stroke | null | undefined,
): CesiumStrokeStyle | null {
  if (!stroke) return null;
  return {
    color: olColorToCesiumColor(
      stroke.getColor() as string | number[] | undefined,
    ),
    width: stroke.getWidth() ?? 1,
  };
}

/* ─── Circle Style → Billboard descriptor ─── */

export interface CesiumCircleStyle {
  color: Color;
  outlineColor: Color;
  outlineWidth: number;
  pixelSize: number;
}

export function convertCircleStyle(
  circle: CircleStyle | null | undefined,
): CesiumCircleStyle | null {
  if (!circle) return null;

  const fill = circle.getFill();
  const stroke = circle.getStroke();

  return {
    color: fill
      ? olColorToCesiumColor(fill.getColor() as string | number[] | undefined)
      : Color.WHITE,
    outlineColor: stroke
      ? olColorToCesiumColor(stroke.getColor() as string | number[] | undefined)
      : Color.BLACK,
    outlineWidth: stroke?.getWidth() ?? 1,
    pixelSize: circle.getRadius() * 2,
  };
}

/* ─── Icon Style → Billboard descriptor ─── */

export interface CesiumBillboardStyle {
  image: string | HTMLCanvasElement | undefined;
  scale: number;
  rotation: number;
  horizontalOrigin: typeof HorizontalOrigin.CENTER;
  verticalOrigin: typeof VerticalOrigin.CENTER;
  heightReference: typeof HeightReference.CLAMP_TO_GROUND;
}

export function convertIconStyle(
  icon: IconStyle | null | undefined,
): CesiumBillboardStyle | null {
  if (!icon || typeof icon.getSrc !== "function") return null;
  return {
    image: icon.getSrc() ?? undefined,
    scale: (icon.getScale() as number) ?? 1,
    rotation: -(icon.getRotation() ?? 0),
    horizontalOrigin: HorizontalOrigin.CENTER,
    verticalOrigin: VerticalOrigin.CENTER,
    heightReference: HeightReference.CLAMP_TO_GROUND,
  };
}

/* ─── Text Style → Label descriptor ─── */

export interface CesiumLabelDescriptor {
  text: string;
  font: string;
  fillColor: Color;
  outlineColor: Color;
  outlineWidth: number;
  style: typeof CesiumLabelStyle.FILL_AND_OUTLINE;
  scale: number;
  horizontalOrigin: typeof HorizontalOrigin.CENTER;
  verticalOrigin: typeof VerticalOrigin.BOTTOM;
  pixelOffset: Cartesian2;
  heightReference: typeof HeightReference.CLAMP_TO_GROUND;
  disableDepthTestDistance: number;
  scaleByDistance: NearFarScalar;
}

export function convertTextStyle(
  text: TextStyle | null | undefined,
): CesiumLabelDescriptor | null {
  if (!text) return null;
  const t = text.getText();
  if (!t) return null;

  const fill = text.getFill();
  const stroke = text.getStroke();

  return {
    text: Array.isArray(t) ? t.join("") : t,
    font: text.getFont() ?? "14px sans-serif",
    fillColor: fill
      ? olColorToCesiumColor(fill.getColor() as string | number[] | undefined)
      : Color.WHITE,
    outlineColor: stroke
      ? olColorToCesiumColor(stroke.getColor() as string | number[] | undefined)
      : Color.BLACK,
    outlineWidth: stroke?.getWidth() ?? 2,
    style: CesiumLabelStyle.FILL_AND_OUTLINE,
    scale: (text.getScale() as number) ?? 1,
    horizontalOrigin: HorizontalOrigin.CENTER,
    verticalOrigin: VerticalOrigin.BOTTOM,
    pixelOffset: new Cartesian2(
      text.getOffsetX() ?? 0,
      -(text.getOffsetY() ?? 0),
    ),
    heightReference: HeightReference.CLAMP_TO_GROUND,
    disableDepthTestDistance: Number.POSITIVE_INFINITY,
    scaleByDistance: new NearFarScalar(1000, 1, 5_000_000, 0.4),
  };
}

/* ─── Master converter: OL Style → all Cesium descriptors ─── */

export interface CesiumStyleDescriptor {
  fill: CesiumFillStyle | null;
  stroke: CesiumStrokeStyle | null;
  circle: CesiumCircleStyle | null;
  billboard: CesiumBillboardStyle | null;
  label: CesiumLabelDescriptor | null;
}

export function mapStyleToCesiumStyle(
  olStyle: Style | null | undefined,
): CesiumStyleDescriptor {
  if (!olStyle) {
    return {
      fill: null,
      stroke: null,
      circle: null,
      billboard: null,
      label: null,
    };
  }

  const image = olStyle.getImage();
  let circle: CesiumCircleStyle | null = null;
  let billboard: CesiumBillboardStyle | null = null;

  if (image) {
    // Distinguish between Circle and Icon styles
    if (typeof (image as any).getRadius === "function") {
      circle = convertCircleStyle(image as any);
    } else if (typeof (image as any).getSrc === "function") {
      billboard = convertIconStyle(image as any);
    }
  }

  return {
    fill: convertFill(olStyle.getFill()),
    stroke: convertStroke(olStyle.getStroke()),
    circle,
    billboard,
    label: convertTextStyle(olStyle.getText()),
  };
}
