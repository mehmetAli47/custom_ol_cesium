import { Math as CesiumMath } from "cesium";

type SizeLike = number[] | undefined;

function getFovyRad(viewer: any): number {
  const frustum = viewer?.camera?.frustum;
  const fovy =
    frustum && typeof frustum.fovy === "number"
      ? frustum.fovy
      : frustum && typeof frustum.fov === "number"
        ? frustum.fov
        : undefined;
  return typeof fovy === "number" && isFinite(fovy) && fovy > 0
    ? fovy
    : Math.PI / 3;
}

function getCanvasHeightPx(olSize: SizeLike, viewer: any): number {
  const fromOl = olSize?.[1];
  if (typeof fromOl === "number" && isFinite(fromOl) && fromOl > 0)
    return fromOl;
  const canvas = viewer?.scene?.canvas;
  const h = canvas?.clientHeight ?? canvas?.height;
  return typeof h === "number" && isFinite(h) && h > 0 ? h : 800;
}

export function olResolutionToCesiumHeightMeters(args: {
  resolution: number;
  latDeg: number;
  olSize?: SizeLike;
  viewer: any;
  isWebMercator?: boolean;
}): number {
  const { resolution, latDeg, olSize, viewer, isWebMercator = true } = args;
  const fovy = getFovyRad(viewer);
  const canvasH = getCanvasHeightPx(olSize, viewer);

  const latRad = CesiumMath.toRadians(latDeg);
  const groundMetersPerPixel = isWebMercator
    ? resolution * Math.cos(latRad)
    : resolution;

  // distance = (ground_mpp * pixels/2) / tan(fovy/2)
  const distance = (groundMetersPerPixel * (canvasH / 2)) / Math.tan(fovy / 2);

  return Math.max(1, isFinite(distance) ? distance : 1);
}

export function cesiumHeightMetersToOlResolution(args: {
  heightMeters: number;
  latDeg: number;
  olSize?: SizeLike;
  viewer: any;
  isWebMercator?: boolean;
}): number {
  const { heightMeters, latDeg, olSize, viewer, isWebMercator = true } = args;
  const fovy = getFovyRad(viewer);
  const canvasH = getCanvasHeightPx(olSize, viewer);
  const h = Math.max(1, heightMeters);

  // ground_mpp = 2 * distance * tan(fovy/2) / pixels
  const groundMetersPerPixel = (2 * h * Math.tan(fovy / 2)) / canvasH;
  const latRad = CesiumMath.toRadians(latDeg);
  const resolution = isWebMercator
    ? groundMetersPerPixel / Math.max(1e-6, Math.cos(latRad))
    : groundMetersPerPixel;

  return Math.max(1e-9, isFinite(resolution) ? resolution : 1);
}
