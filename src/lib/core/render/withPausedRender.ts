/**
 * Bu dosya ne yapiyor?
 * Cesium bazen render ederken layer ekleyip cikarirsan "render ortasinda state degisti" diye hata verebiliyor.
 * Buradaki helper, kisa bir an icin Cesium render loop'unu durdurup isini yaptiriyor, sonra eski haline geri aliyor.
 */
import type { Viewer } from "cesium";

export function withPausedRender<T>(viewer: Viewer, fn: () => T): T {
  const prev = viewer.useDefaultRenderLoop;
  viewer.useDefaultRenderLoop = false;
  try {
    return fn();
  } finally {
    viewer.useDefaultRenderLoop = prev;
  }
}
