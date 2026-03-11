import S, { useEffect as p, useState as b, useCallback as L } from "react";
import { u as O, a as T, b as x, c as A, C as P } from "./index-50FKxaFc.js";
import { Cartesian3 as u, SceneTransforms as R } from "cesium";
import { toLonLat as h } from "ol/proj.js";
function w(e, r, c) {
  p(() => {
    if (!e || !r || !c) return;
    const f = () => {
      const l = e.getOverlays().getArray(), n = r.scene, i = r.camera;
      l.forEach((o) => {
        const t = o.getElement();
        if (!t) return;
        const s = o.getPosition();
        if (!s) {
          t.style.display = "none";
          return;
        }
        const [y, m] = h(s, e.getView().getProjection()), a = u.fromDegrees(y, m), C = R.worldToWindowCoordinates(
          n,
          a
        );
        if (C) {
          const g = i.position, v = u.subtract(
            a,
            g,
            new u()
          ), E = i.direction;
          u.dot(v, E) > 0 ? (t.style.display = "block", t.style.position = "absolute", t.style.left = `${C.x}px`, t.style.top = `${C.y}px`, t.style.transform = "translate(-50%, -100%)", t.style.pointerEvents = "auto") : t.style.display = "none";
        } else
          t.style.display = "none";
      });
    }, d = r.scene.postRender.addEventListener(f);
    return () => {
      d(), e.getOverlays().forEach((l) => {
        const n = l.getElement();
        n && (n.style.display = "", n.style.position = "", n.style.left = "", n.style.top = "", n.style.transform = "");
      });
    };
  }, [e, r, c]);
}
function W({
  map: e,
  enable3D: r,
  splitMode: c = !1,
  cameraSyncOptions: f,
  vectorOptions: d = {},
  interactionSync: l = !1,
  autoOrderLayers: n = !0,
  onCameraChange: i
}) {
  const [o, t] = b(null), s = r || c, { syncOlToCesium: y } = O(
    e,
    s ? o : null,
    f,
    i
  );
  T(e, s ? o : null, d), x(
    e,
    s ? o : null,
    s ? l : !1
  ), A(e, n), w(e, s ? o : null, s), p(() => {
    if (!s || !e || !o) return;
    const a = setTimeout(() => y(), 0);
    return () => clearTimeout(a);
  }, [s, e, o, y]);
  const m = L((a) => {
    t(a);
  }, []);
  return /* @__PURE__ */ S.createElement(P, { visible: s, onViewerReady: m });
}
export {
  W as default
};
//# sourceMappingURL=CesiumAdapterCore-DoNbrI7i.js.map
