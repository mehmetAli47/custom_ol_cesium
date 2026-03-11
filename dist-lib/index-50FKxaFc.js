var Ie = Object.defineProperty;
var xe = (t, e, n) => e in t ? Ie(t, e, { enumerable: !0, configurable: !0, writable: !0, value: n }) : t[e] = n;
var O = (t, e, n) => xe(t, typeof e != "symbol" ? e + "" : e, n);
import A, { forwardRef as he, useRef as R, useState as ie, useImperativeHandle as me, useEffect as x, lazy as Me, useCallback as F, Suspense as Ae } from "react";
import Pe from "ol/Map.js";
import De from "ol/View.js";
import re from "ol/layer/Tile.js";
import oe from "ol/source/OSM.js";
import { fromLonLat as B, toLonLat as V } from "ol/proj.js";
import { Ion as We, Viewer as ge, createWorldTerrainAsync as de, Color as E, HeightReference as k, VerticalOrigin as pe, HorizontalOrigin as ye, NearFarScalar as Fe, Cartesian2 as z, LabelStyle as ke, CustomDataSource as ze, Entity as Ze, ColorMaterialProperty as Z, PolygonHierarchy as Ne, Cartesian3 as W, WebMapServiceImageryProvider as _e, ImageryLayer as Q, UrlTemplateImageryProvider as Ke, WebMapTileServiceImageryProvider as He, SingleTileImageryProvider as Ue, Rectangle as Ge, Math as I, ScreenSpaceEventHandler as ve, defined as $, Ellipsoid as q, ScreenSpaceEventType as Y, SceneTransforms as Be } from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import { unByKey as D } from "ol/Observable.js";
import Te from "ol/layer/Image.js";
import Oe from "ol/layer/Vector.js";
import je from "ol/source/XYZ.js";
import te from "ol/source/TileWMS.js";
import Ve from "ol/source/WMTS.js";
import Se from "ol/source/ImageWMS.js";
import { getUid as we } from "ol/util.js";
import $e from "ol/layer/VectorTile.js";
const Ce = he(
  ({
    center: t = [29, 41],
    zoom: e = 6,
    className: n = "",
    style: i,
    layers: r,
    visible: o = !0,
    onMapReady: s
  }, c) => {
    const a = R(null), f = R(null), [h, m] = ie(null);
    return me(c, () => ({ map: h }), [h]), x(() => {
      if (!a.current || f.current) return;
      const g = [new re({ source: new oe() })], d = new Pe({
        target: a.current,
        layers: r ?? g,
        view: new De({
          center: B(t),
          zoom: e,
          maxZoom: 22,
          minZoom: 1
        })
      });
      return f.current = d, m(d), s == null || s(d), () => {
        d.setTarget(void 0), f.current = null, m(null);
      };
    }, []), x(() => {
      const g = f.current;
      if (!g || !r) return;
      const d = g.getLayers(), l = d.getArray();
      r.forEach((y) => {
        l.includes(y) || d.push(y);
      }), l.forEach((y) => {
        const v = y.get("title") === "External Drawings" || y.get("isInternal");
        !r.includes(y) && !v && d.remove(y);
      });
    }, [r]), x(() => {
      const g = f.current;
      g && setTimeout(() => g.updateSize(), 50);
    }, [o]), x(() => {
      f.current && f.current.updateSize();
    }, []), /* @__PURE__ */ A.createElement(
      "div",
      {
        ref: a,
        className: `ol-map-container ${n}`,
        style: {
          width: "100%",
          height: "100%",
          position: "absolute",
          top: 0,
          left: 0,
          visibility: o ? "visible" : "hidden",
          ...i
        }
      }
    );
  }
);
Ce.displayName = "OlMap";
const ee = {}, ae = ee == null ? void 0 : ee.VITE_CESIUM_ION_TOKEN;
ae && (We.defaultAccessToken = ae);
const qe = he(
  ({
    className: t = "",
    style: e,
    visible: n = !0,
    enableTerrain: i = !1,
    onViewerReady: r
  }, o) => {
    const s = R(null), c = R(null), [a, f] = ie(!1);
    return me(o, () => ({ viewer: c.current }), [a]), x(() => {
      if (!s.current || c.current) return;
      const h = new ge(s.current, {
        animation: !1,
        baseLayerPicker: !1,
        fullscreenButton: !1,
        geocoder: !1,
        homeButton: !1,
        infoBox: !1,
        sceneModePicker: !1,
        selectionIndicator: !1,
        timeline: !1,
        navigationHelpButton: !1,
        navigationInstructionsInitiallyVisible: !1,
        scene3DOnly: !0
      });
      return h.imageryLayers.removeAll(), h.scene.globe.enableLighting = !1, h.scene.fog.enabled = !1, h.scene.skyAtmosphere && (h.scene.skyAtmosphere.show = !0), h.scene.globe.showGroundAtmosphere = !0, i && de().then((m) => {
        h.isDestroyed() || (h.terrainProvider = m);
      }), c.current = h, f(!0), r == null || r(h), () => {
        h.isDestroyed() || h.destroy(), c.current = null, f(!1);
      };
    }, []), x(() => {
      const h = c.current;
      !h || h.isDestroyed() || n && (h.resize(), h.scene.requestRender());
    }, [n]), /* @__PURE__ */ A.createElement(
      "div",
      {
        ref: s,
        className: `cesium-scene-container ${t}`,
        style: {
          width: "100%",
          height: "100%",
          position: "absolute",
          top: 0,
          left: 0,
          visibility: n ? "visible" : "hidden",
          ...e
        }
      }
    );
  }
);
qe.displayName = "CesiumScene";
const Ye = Me(() => import("./CesiumAdapterCore-DoNbrI7i.js")), Mt = ({
  map: t,
  enable3D: e,
  cameraSyncOptions: n,
  vectorOptions: i = {},
  styleOptions: r = {},
  interactionSync: o = !1,
  autoOrderLayers: s = !0,
  splitMode: c = !1,
  onCameraChange: a,
  on3DToggle: f
}) => {
  const h = R(null), [m, g] = ie(null), d = t ?? m;
  x(() => {
    f == null || f(e);
  }, [e, f]);
  const l = F((u) => {
    g(u);
  }, []), y = e || c, v = !e || c;
  return /* @__PURE__ */ A.createElement(
    "div",
    {
      className: `ol-cesium-adapter ${c ? "split-view" : ""}`,
      style: {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
        pointerEvents: "none"
      }
    },
    /* @__PURE__ */ A.createElement(
      "div",
      {
        style: {
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          width: c ? "50%" : "100%",
          visibility: v ? "visible" : "hidden",
          pointerEvents: v && !t ? "auto" : "none",
          zIndex: 1,
          borderRight: c ? "2px solid var(--accent)" : "none"
        }
      },
      !t && /* @__PURE__ */ A.createElement(
        Ce,
        {
          ref: h,
          onMapReady: l,
          visible: v
        }
      )
    ),
    y && d && /* @__PURE__ */ A.createElement(
      "div",
      {
        className: "cesium-view-container",
        style: {
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          left: c ? "50%" : 0,
          width: c ? "50%" : "100%",
          zIndex: 2,
          pointerEvents: "auto"
        }
      },
      /* @__PURE__ */ A.createElement(
        Ae,
        {
          fallback: /* @__PURE__ */ A.createElement("div", { className: "loading-overlay" }, /* @__PURE__ */ A.createElement("div", { className: "loading-spinner" }))
        },
        /* @__PURE__ */ A.createElement(
          Ye,
          {
            map: d,
            enable3D: e,
            splitMode: c,
            cameraSyncOptions: n,
            vectorOptions: i,
            interactionSync: o,
            autoOrderLayers: s,
            onCameraChange: a
          }
        )
      )
    ),
    y && d && /* @__PURE__ */ A.createElement(
      "div",
      {
        id: "cesium-overlay-container",
        style: {
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          left: c ? "50%" : 0,
          width: c ? "50%" : "100%",
          zIndex: 10,
          pointerEvents: "none"
        }
      }
    )
  );
};
function _(t) {
  if (!t) return E.WHITE;
  if (Array.isArray(t)) {
    const [e, n, i, r = 1] = t;
    return new E(e / 255, n / 255, i / 255, r);
  }
  if (typeof t == "string")
    try {
      return E.fromCssColorString(t);
    } catch {
      return E.WHITE;
    }
  return E.WHITE;
}
function Xe(t) {
  if (!t) return null;
  const e = t.getColor();
  return {
    color: _(e)
  };
}
function Qe(t) {
  return t ? {
    color: _(
      t.getColor()
    ),
    width: t.getWidth() ?? 1
  } : null;
}
function Je(t) {
  if (!t) return null;
  const e = t.getFill(), n = t.getStroke();
  return {
    color: e ? _(e.getColor()) : E.WHITE,
    outlineColor: n ? _(n.getColor()) : E.BLACK,
    outlineWidth: (n == null ? void 0 : n.getWidth()) ?? 1,
    pixelSize: t.getRadius() * 2
  };
}
function et(t) {
  return !t || typeof t.getSrc != "function" ? null : {
    image: t.getSrc() ?? void 0,
    scale: t.getScale() ?? 1,
    rotation: -(t.getRotation() ?? 0),
    horizontalOrigin: ye.CENTER,
    verticalOrigin: pe.CENTER,
    heightReference: k.CLAMP_TO_GROUND
  };
}
function tt(t) {
  if (!t) return null;
  const e = t.getText();
  if (!e) return null;
  const n = t.getFill(), i = t.getStroke();
  return {
    text: Array.isArray(e) ? e.join("") : e,
    font: t.getFont() ?? "14px sans-serif",
    fillColor: n ? _(n.getColor()) : E.WHITE,
    outlineColor: i ? _(i.getColor()) : E.BLACK,
    outlineWidth: (i == null ? void 0 : i.getWidth()) ?? 2,
    style: ke.FILL_AND_OUTLINE,
    scale: t.getScale() ?? 1,
    horizontalOrigin: ye.CENTER,
    verticalOrigin: pe.BOTTOM,
    pixelOffset: new z(
      t.getOffsetX() ?? 0,
      -(t.getOffsetY() ?? 0)
    ),
    heightReference: k.CLAMP_TO_GROUND,
    disableDepthTestDistance: Number.POSITIVE_INFINITY,
    scaleByDistance: new Fe(1e3, 1, 5e6, 0.4)
  };
}
function nt(t) {
  if (!t)
    return {
      fill: null,
      stroke: null,
      circle: null,
      billboard: null,
      label: null
    };
  const e = t.getImage();
  let n = null, i = null;
  return e && (typeof e.getRadius == "function" ? n = Je(e) : typeof e.getSrc == "function" && (i = et(e))), {
    fill: Xe(t.getFill()),
    stroke: Qe(t.getStroke()),
    circle: n,
    billboard: i,
    label: tt(t.getText())
  };
}
function se(t, e = 0) {
  const [n, i] = V(t);
  return W.fromDegrees(n, i, t[2] ?? e);
}
function ne(t, e = 0) {
  return t.map((n) => se(n, e));
}
function le(t, e, n) {
  var a;
  const [i, r, o] = t, c = {
    position: se(t, o ?? 0)
  };
  return e.circle && (c.point = {
    color: e.circle.color,
    pixelSize: e.circle.pixelSize,
    outlineColor: e.circle.outlineColor,
    outlineWidth: e.circle.outlineWidth,
    heightReference: k.CLAMP_TO_GROUND,
    disableDepthTestDistance: Number.POSITIVE_INFINITY
  }), (a = e.billboard) != null && a.image && (c.billboard = {
    image: e.billboard.image,
    scale: e.billboard.scale,
    rotation: e.billboard.rotation,
    heightReference: k.CLAMP_TO_GROUND,
    disableDepthTestDistance: Number.POSITIVE_INFINITY
  }), e.label && n.label && (c.label = {
    text: e.label.text,
    font: e.label.font,
    fillColor: e.label.fillColor,
    outlineColor: e.label.outlineColor,
    outlineWidth: e.label.outlineWidth,
    style: e.label.style,
    scale: e.label.scale,
    pixelOffset: e.label.pixelOffset,
    heightReference: k.CLAMP_TO_GROUND,
    disableDepthTestDistance: Number.POSITIVE_INFINITY,
    scaleByDistance: e.label.scaleByDistance
  }), c;
}
function ue(t, e) {
  const n = ne(t), i = e.stroke;
  return {
    polyline: {
      positions: n,
      width: (i == null ? void 0 : i.width) ?? 2,
      material: i ? new Z(i.color) : new Z(E.WHITE),
      clampToGround: !0
    }
  };
}
function fe(t, e, n) {
  const i = ne(t[0]), r = t.slice(1).map((f) => ({
    positions: ne(f)
  })), o = e.fill, s = e.stroke, c = {
    hierarchy: new Ne(i, r),
    material: o ? new Z(o.color) : new Z(E.WHITE.withAlpha(0.5))
  };
  n.extrude && (c.extrudedHeight = n.extrudeHeight ?? 100, c.heightReference = k.RELATIVE_TO_GROUND);
  const a = {
    polygon: c
  };
  return s && (a.polyline = {
    positions: i,
    width: s.width,
    material: new Z(s.color),
    clampToGround: !0
  }), a;
}
function it(t, e, n) {
  const i = n.fill, r = n.stroke;
  return {
    position: se(t),
    ellipse: {
      semiMajorAxis: e,
      semiMinorAxis: e,
      material: i ? new Z(i.color) : new Z(E.WHITE.withAlpha(0.5)),
      outline: !!r,
      outlineColor: (r == null ? void 0 : r.color) ?? E.BLACK,
      outlineWidth: (r == null ? void 0 : r.width) ?? 1,
      heightReference: k.CLAMP_TO_GROUND
    }
  };
}
function rt(t, e = {}, n) {
  var m;
  const i = t.getGeometry();
  if (!i) return null;
  let r = t.getStyle() || n;
  if (typeof r == "function") {
    const g = e.resolution ?? 1;
    r = r(t, g);
  }
  const o = Array.isArray(r) ? r[0] : r, s = nt(o), c = ((m = t.getId()) == null ? void 0 : m.toString()) ?? `feature_${we(t)}`, a = t.getProperties();
  delete a.geometry;
  const f = (g, d = "") => new Ze({
    id: c + d,
    name: a.name ?? c + d,
    ...g,
    properties: a
  }), h = i.getType();
  switch (h) {
    case "Point": {
      const g = i.getCoordinates();
      return f(le(g, s, e));
    }
    case "LineString": {
      const g = i.getCoordinates();
      return f(ue(g, s));
    }
    case "Polygon": {
      const g = i.getCoordinates();
      return f(fe(g, s, e));
    }
    case "Circle": {
      const g = i;
      return f(
        it(g.getCenter(), g.getRadius(), s)
      );
    }
    case "MultiPoint":
      return i.getPoints().map(
        (d, l) => f(le(d.getCoordinates(), s, e), `_${l}`)
      );
    case "MultiLineString":
      return i.getLineStrings().map(
        (d, l) => f(ue(d.getCoordinates(), s), `_${l}`)
      );
    case "MultiPolygon":
      return i.getPolygons().map(
        (d, l) => f(fe(d.getCoordinates(), s, e), `_${l}`)
      );
    default:
      return console.warn(`[vectorConverters] Unsupported geometry type: ${h}`), null;
  }
}
function ot(t, e, n = {}, i) {
  const r = new ze(e), o = n.extent;
  for (const s of t) {
    const c = s.getGeometry();
    if (!c || o && !c.intersectsExtent(o))
      continue;
    const a = rt(s, n, i);
    a && (Array.isArray(a) ? a.forEach((f) => r.entities.add(f)) : r.entities.add(a));
  }
  return r;
}
function st(t) {
  var s, c;
  const e = t.getSource();
  if (!e) return null;
  let n;
  if (e instanceof oe)
    n = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
  else {
    const a = ((s = e.getUrls) == null ? void 0 : s.call(e)) || [];
    n = a.length > 0 ? a[0] : (c = e.getUrl) == null ? void 0 : c.call(e);
  }
  if (!n) return null;
  const i = n.replace(/\{x\}/g, "{x}").replace(/\{y\}/g, "{y}").replace(/\{z\}/g, "{z}").replace(/\{([a-z0-9])-[a-z0-9]\}/g, "$1"), r = new Ke({
    url: i,
    minimumLevel: 0,
    maximumLevel: 19
  });
  return new Q(r, {
    alpha: t.getOpacity(),
    show: t.getVisible()
  });
}
function ct(t) {
  var c, a;
  const e = t.getSource();
  if (!e) return null;
  const n = ((c = e.getUrls) == null ? void 0 : c.call(e)) || [];
  let i = n.length > 0 ? n[0] : (a = e.getUrl) == null ? void 0 : a.call(e);
  if (!i) return null;
  const r = i.split("?")[0], o = e.getParams(), s = new _e({
    url: r,
    layers: o.LAYERS ?? o.layers ?? "",
    parameters: {
      transparent: !0,
      format: o.FORMAT ?? o.format ?? "image/png",
      VERSION: o.VERSION ?? "1.1.1",
      // Add VERSION as default
      // Filter out layers/LAYERS from params to avoid duplication in query string
      ...Object.fromEntries(
        Object.entries(o).filter(([f]) => f.toUpperCase() !== "LAYERS")
      )
    },
    enablePickFeatures: !1
  });
  return new Q(s, {
    alpha: t.getOpacity(),
    show: t.getVisible()
  });
}
function at(t) {
  var i, r, o, s, c;
  const e = t.getSource();
  if (!e) return null;
  const n = ((i = e.getUrls) == null ? void 0 : i.call(e)) || [];
  if (n.length === 0) return null;
  try {
    const a = new He({
      url: n[0],
      layer: ((r = e.getLayer) == null ? void 0 : r.call(e)) ?? "",
      style: ((o = e.getStyle) == null ? void 0 : o.call(e)) ?? "default",
      tileMatrixSetID: ((s = e.getMatrixSet) == null ? void 0 : s.call(e)) ?? "default",
      format: ((c = e.getFormat) == null ? void 0 : c.call(e)) ?? "image/png"
    });
    return new Q(a, {
      alpha: t.getOpacity(),
      show: t.getVisible()
    });
  } catch (a) {
    return console.warn("[layerConverters] Failed to convert WMTS layer:", a), null;
  }
}
function lt(t) {
  var o;
  const e = t.getSource();
  if (!e) return null;
  const n = (o = e.getUrl) == null ? void 0 : o.call(e);
  if (!n) return null;
  const i = e.getParams(), r = `${n}?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&LAYERS=${i.LAYERS ?? ""}&STYLES=&FORMAT=image/png&TRANSPARENT=true&SRS=EPSG:4326&BBOX=-180,-90,180,90&WIDTH=1024&HEIGHT=512`;
  try {
    const s = new Ue({
      url: r,
      rectangle: Ge.fromDegrees(-180, -90, 180, 90)
    });
    return new Q(s, {
      alpha: t.getOpacity(),
      show: t.getVisible()
    });
  } catch (s) {
    return console.warn("[layerConverters] Failed to convert ImageWMS layer:", s), null;
  }
}
function ut(t, e = {}) {
  const n = t.getSource();
  if (!n) return null;
  const i = n.getFeatures(), r = t.get("title") ?? t.get("name") ?? `vector_${we(t)}`, o = t.getStyle(), s = ot(i, r, e, o);
  return s.show = t.getVisible(), s;
}
function X(t, e = {}) {
  var o, s;
  const n = t, i = ((o = n == null ? void 0 : n.get) == null ? void 0 : o.call(n, "title")) || "unnamed", r = ((s = n == null ? void 0 : n.getType) == null ? void 0 : s.call(n)) || "unknown";
  if (t instanceof re || r === "TILE") {
    const c = t.getSource();
    if (!c) return null;
    if (c instanceof te || typeof c.getParams == "function") {
      const a = ct(t);
      return a ? { type: "imagery", imagery: a } : null;
    }
    if (c instanceof oe || c instanceof je || typeof c.getUrls == "function" || typeof c.getUrl == "function") {
      const a = st(t);
      return a ? { type: "imagery", imagery: a } : null;
    }
    if (c instanceof Ve) {
      const a = at(t);
      return a ? { type: "imagery", imagery: a } : null;
    }
  }
  if (t instanceof Te || r === "IMAGE") {
    const c = t.getSource();
    if (c instanceof Se || c.getParams && c.getUrl) {
      const a = lt(t);
      return a ? { type: "imagery", imagery: a } : null;
    }
  }
  if (t instanceof Oe || r === "VECTOR") {
    const c = ut(t, e);
    return c ? { type: "vector", dataSource: c } : null;
  }
  return console.warn(
    "[layerConverters] Unsupported layer type or source:",
    t.constructor.name,
    i,
    r
  ), null;
}
function G(t, e) {
  const n = t.getVisible(), i = t.getOpacity();
  e.cesiumLayer && ("show" in e.cesiumLayer && (e.cesiumLayer.show = n), "alpha" in e.cesiumLayer && (e.cesiumLayer.alpha = i)), e.visible = n, e.opacity = i;
}
function be(t) {
  var i;
  const e = (i = t == null ? void 0 : t.camera) == null ? void 0 : i.frustum, n = e && typeof e.fovy == "number" ? e.fovy : e && typeof e.fov == "number" ? e.fov : void 0;
  return typeof n == "number" && isFinite(n) && n > 0 ? n : Math.PI / 3;
}
function Le(t, e) {
  var o;
  const n = t == null ? void 0 : t[1];
  if (typeof n == "number" && isFinite(n) && n > 0)
    return n;
  const i = (o = e == null ? void 0 : e.scene) == null ? void 0 : o.canvas, r = (i == null ? void 0 : i.clientHeight) ?? (i == null ? void 0 : i.height);
  return typeof r == "number" && isFinite(r) && r > 0 ? r : 800;
}
function Re(t) {
  const { resolution: e, latDeg: n, olSize: i, viewer: r, isWebMercator: o = !0 } = t, s = be(r), c = Le(i, r), a = I.toRadians(n), h = (o ? e * Math.cos(a) : e) * (c / 2) / Math.tan(s / 2);
  return Math.max(1, isFinite(h) ? h : 1);
}
function Ee(t) {
  const { heightMeters: e, latDeg: n, olSize: i, viewer: r, isWebMercator: o = !0 } = t, s = be(r), c = Le(i, r), f = 2 * Math.max(1, e) * Math.tan(s / 2) / c, h = I.toRadians(n), m = o ? f / Math.max(1e-6, Math.cos(h)) : f;
  return Math.max(1e-9, isFinite(m) ? m : 1);
}
class ft {
  constructor(e) {
    O(this, "map");
    O(this, "viewer");
    O(this, "enabled", !1);
    O(this, "clearOnDisable");
    O(this, "cameraSyncOptions");
    O(this, "vectorOptions");
    O(this, "interactionSync");
    O(this, "autoOrderLayers");
    O(this, "overlaySync");
    O(this, "onCameraChange");
    O(this, "syncing", null);
    O(this, "syncTimer", null);
    O(this, "rafOlToCesium", null);
    O(this, "rafCesiumToOl", null);
    O(this, "lastCesiumToOlTs", 0);
    O(this, "lastApplied", null);
    O(this, "layerMappings", []);
    O(this, "layerKeys", /* @__PURE__ */ new WeakMap());
    O(this, "sourceKeys", /* @__PURE__ */ new WeakMap());
    O(this, "vectorRefreshTimers", /* @__PURE__ */ new WeakMap());
    O(this, "viewKeys", []);
    O(this, "layersCollectionKeys", []);
    O(this, "cameraChangedRemove", null);
    O(this, "overlayPostRenderRemove", null);
    O(this, "interactionHandler", null);
    this.map = e.map, this.cameraSyncOptions = e.cameraSyncOptions ?? {}, this.vectorOptions = e.vectorOptions ?? {}, this.interactionSync = e.interactionSync ?? !1, this.autoOrderLayers = e.autoOrderLayers ?? !0, this.overlaySync = e.overlaySync ?? !0, this.onCameraChange = e.onCameraChange, this.clearOnDisable = e.clearOnDisable ?? !1;
    const n = typeof e.target == "string" ? document.getElementById(e.target) : e.target;
    if (!n)
      throw new Error("OlCesium: target element not found");
    this.viewer = new ge(n, {
      animation: !1,
      baseLayerPicker: !1,
      fullscreenButton: !1,
      geocoder: !1,
      homeButton: !1,
      infoBox: !1,
      sceneModePicker: !1,
      selectionIndicator: !1,
      timeline: !1,
      navigationHelpButton: !1,
      navigationInstructionsInitiallyVisible: !1,
      scene3DOnly: !0
    }), this.viewer.imageryLayers.removeAll(), this.viewer.scene.globe.enableLighting = !1, this.viewer.scene.fog.enabled = !1, this.viewer.scene.skyAtmosphere && (this.viewer.scene.skyAtmosphere.show = !0), this.viewer.scene.globe.showGroundAtmosphere = !0, e.enableTerrain && de().then((i) => {
      this.viewer.isDestroyed() || (this.viewer.terrainProvider = i);
    }), this.setEnabled(e.enabled ?? !0);
  }
  getOlMap() {
    return this.map;
  }
  getCesiumViewer() {
    return this.viewer;
  }
  isEnabled() {
    return this.enabled;
  }
  setTarget(e) {
    const n = typeof e == "string" ? document.getElementById(e) : e;
    if (!n) throw new Error("OlCesium: target element not found");
    n.appendChild(this.viewer.container), this.viewer.resize(), this.viewer.scene.requestRender();
  }
  setEnabled(e) {
    if (this.enabled === e) return;
    this.enabled = e;
    const n = this.viewer.container;
    n && (n.style.visibility = e ? "visible" : "hidden", n.style.pointerEvents = e ? "auto" : "none"), e ? (this.attach(), this.syncOnce()) : (this.detach(), this.clearOnDisable && this.clearCesiumLayers());
  }
  syncOnce() {
    this.enabled && (this.syncOlToCesium(), this.syncLayers(), this.viewer.scene.requestRender());
  }
  destroy() {
    this.detach(), this.clearCesiumLayers(), this.viewer.isDestroyed() || this.viewer.destroy();
  }
  attach() {
    const e = this.map.getView();
    this.viewKeys = [
      e.on("change:center", () => this.scheduleOlToCesium()),
      e.on("change:resolution", () => this.scheduleOlToCesium()),
      e.on("change:rotation", () => this.scheduleOlToCesium())
    ], this.viewer.camera.percentageChanged = 0.01, this.cameraChangedRemove = this.viewer.camera.changed.addEventListener(
      () => this.scheduleCesiumToOl()
    );
    const n = this.map.getLayers(), i = (o) => this.addLayerToCesium(o.element), r = (o) => this.removeLayerFromCesium(o.element);
    if (this.layersCollectionKeys = [
      n.on("add", i),
      n.on("remove", r)
    ], this.interactionSync) {
      const o = typeof this.interactionSync == "boolean" ? { click: !0, hover: !0 } : this.interactionSync;
      this.interactionHandler = new ve(
        this.viewer.scene.canvas
      ), o.click && this.interactionHandler.setInputAction(
        (s) => {
          const c = this.viewer.scene.pick(
            new z(s.position.x, s.position.y)
          );
          if ($(c) && c.id) {
            const a = this.viewer.scene.globe.pick(
              this.viewer.camera.getPickRay(
                new z(s.position.x, s.position.y)
              ),
              this.viewer.scene
            );
            if (a) {
              const f = q.WGS84.cartesianToCartographic(a), h = I.toDegrees(f.longitude), m = I.toDegrees(f.latitude);
              this.map.dispatchEvent({
                type: "cesium:click",
                coordinate: B([h, m]),
                entity: c.id
              });
            }
          }
        },
        Y.LEFT_CLICK
      ), o.hover && this.interactionHandler.setInputAction(
        (s) => {
          const c = this.viewer.scene.pick(
            new z(s.endPosition.x, s.endPosition.y)
          );
          this.map.dispatchEvent({
            type: "cesium:hover",
            entity: $(c) ? c.id : null
          });
        },
        Y.MOUSE_MOVE
      );
    }
    this.overlaySync && (this.overlayPostRenderRemove = this.viewer.scene.postRender.addEventListener(
      () => this.syncOverlays()
    ));
  }
  detach() {
    this.viewKeys.length && (D(this.viewKeys), this.viewKeys = []), this.layersCollectionKeys.length && (D(this.layersCollectionKeys), this.layersCollectionKeys = []), this.cameraChangedRemove && (this.cameraChangedRemove(), this.cameraChangedRemove = null), this.overlayPostRenderRemove && (this.overlayPostRenderRemove(), this.overlayPostRenderRemove = null), this.interactionHandler && (this.interactionHandler.destroy(), this.interactionHandler = null), this.rafOlToCesium != null && (cancelAnimationFrame(this.rafOlToCesium), this.rafOlToCesium = null), this.rafCesiumToOl != null && (cancelAnimationFrame(this.rafCesiumToOl), this.rafCesiumToOl = null);
    for (const e of this.layerMappings)
      this.cleanupLayerListeners(e.olLayer);
  }
  clearCesiumLayers() {
    for (const e of this.layerMappings)
      this.removeCesiumObject(e);
    this.layerMappings = [], this.viewer.imageryLayers.removeAll(), this.viewer.dataSources.removeAll();
  }
  scheduleOlToCesium() {
    this.enabled && this.rafOlToCesium == null && (this.rafOlToCesium = requestAnimationFrame(() => {
      this.rafOlToCesium = null, this.syncOlToCesium();
    }));
  }
  scheduleCesiumToOl() {
    if (!this.enabled) return;
    const e = typeof performance < "u" ? performance.now() : Date.now();
    e - this.lastCesiumToOlTs < 33 || (this.lastCesiumToOlTs = e, this.rafCesiumToOl == null && (this.rafCesiumToOl = requestAnimationFrame(() => {
      this.rafCesiumToOl = null, this.syncCesiumToOl();
    })));
  }
  syncOlToCesium() {
    var v, u, T;
    if (!this.enabled || this.syncing === "cesium") return;
    const e = this.map.getView(), n = e.getCenter();
    if (!n) return;
    const {
      animate: i = !0,
      animationDuration: r = 0.5,
      debounceMs: o = 100
    } = this.cameraSyncOptions, [s, c] = V(n, e.getProjection()), a = e.getZoom() ?? 2, f = -(e.getRotation() ?? 0), h = e.getResolution() ?? (typeof e.getResolutionForZoom == "function" ? e.getResolutionForZoom(a) : void 0) ?? 2e7 / Math.pow(2, a - 1), m = ((u = (v = e.getProjection()) == null ? void 0 : v.getCode) == null ? void 0 : u.call(v)) === "EPSG:3857", g = Re({
      resolution: h,
      latDeg: c,
      olSize: this.map.getSize() ?? void 0,
      viewer: this.viewer,
      isWebMercator: m
    }), d = W.fromDegrees(s, c, g), l = !i || this.syncing === "ol", y = {
      heading: f,
      pitch: this.viewer.camera.pitch,
      roll: this.viewer.camera.roll
    };
    l ? (this.viewer.camera.cancelFlight(), this.viewer.camera.setView({ destination: d, orientation: y })) : this.viewer.camera.flyTo({
      destination: d,
      orientation: y,
      duration: r
    }), this.syncing = "ol", (T = this.onCameraChange) == null || T.call(this, {
      center: [s, c],
      zoom: a,
      rotation: e.getRotation() ?? 0,
      tilt: 0
    }), this.syncTimer && clearTimeout(this.syncTimer), this.syncTimer = setTimeout(() => {
      this.syncing = null;
    }, o);
  }
  syncCesiumToOl() {
    var v, u, T;
    if (!this.enabled || this.syncing === "ol") return;
    const e = this.viewer.camera, n = q.WGS84.cartesianToCartographic(e.position);
    if (!n) return;
    const { debounceMs: i = 100 } = this.cameraSyncOptions;
    this.syncing = "cesium";
    const r = I.toDegrees(n.longitude), o = I.toDegrees(n.latitude), s = n.height, c = -e.heading, a = this.map.getView(), f = ((u = (v = a.getProjection()) == null ? void 0 : v.getCode) == null ? void 0 : u.call(v)) === "EPSG:3857", h = Ee({
      heightMeters: s,
      latDeg: o,
      olSize: this.map.getSize() ?? void 0,
      viewer: this.viewer,
      isWebMercator: f
    }), m = typeof a.getZoomForResolution == "function" ? a.getZoomForResolution(h) : Math.log2(2e7 / Math.max(s, 1)) + 1, g = Math.max(0, Math.min(28, m)), d = this.lastApplied;
    (!d || Math.abs(d.lon - r) > 1e-7 || Math.abs(d.lat - o) > 1e-7 || Math.abs(d.zoom - g) > 0.02 || Math.abs(d.rotation - c) > 1e-4) && (a.setCenter(B([r, o], a.getProjection())), (!d || Math.abs(d.zoom - g) > 0.02) && a.setZoom(g), (!d || Math.abs(d.rotation - c) > 1e-4) && a.setRotation(c), this.lastApplied = { lon: r, lat: o, zoom: g, rotation: c });
    const y = I.toDegrees(e.pitch) + 90;
    (T = this.onCameraChange) == null || T.call(this, {
      center: [r, o],
      zoom: m,
      rotation: -c,
      tilt: y
    }), this.syncTimer && clearTimeout(this.syncTimer), this.syncTimer = setTimeout(() => {
      this.syncing = null;
    }, i);
  }
  syncLayers() {
    if (!this.enabled) return;
    const e = this.map.getLayers().getArray(), n = [];
    for (const i of this.layerMappings)
      e.includes(i.olLayer) ? n.push(i) : (this.removeCesiumObject(i), this.cleanupLayerListeners(i.olLayer));
    this.layerMappings = n;
    for (const i of e)
      this.layerMappings.find((r) => r.olLayer === i) || this.addLayerToCesium(i);
    this.autoOrderLayers && this.applyDefaultZIndex(), this.updateCesiumZOrder();
  }
  addLayerToCesium(e) {
    var s, c;
    if (!this.enabled) return;
    const n = this.map.getView(), i = {
      ...this.vectorOptions,
      resolution: n.getResolution() ?? this.vectorOptions.resolution ?? 1,
      extent: this.vectorOptions.extent ?? n.calculateExtent()
    }, r = X(e, i);
    if (!r) return;
    const o = {
      olLayer: e,
      cesiumLayer: r.imagery || r.dataSource || null,
      type: r.type,
      visible: ((s = e.getVisible) == null ? void 0 : s.call(e)) ?? !0,
      opacity: ((c = e.getOpacity) == null ? void 0 : c.call(e)) ?? 1
    };
    r.type === "imagery" && r.imagery ? this.viewer.imageryLayers.add(r.imagery) : r.type === "vector" && r.dataSource && this.viewer.dataSources.add(r.dataSource), this.layerMappings.push(o), this.attachLayerListeners(e), r.type === "vector" && this.attachSourceListeners(e), this.updateCesiumZOrder(), this.viewer.scene.requestRender();
  }
  removeLayerFromCesium(e) {
    const n = this.layerMappings.find((i) => i.olLayer === e);
    n && (this.removeCesiumObject(n), this.cleanupLayerListeners(e), this.layerMappings = this.layerMappings.filter((i) => i !== n), this.viewer.scene.requestRender());
  }
  removeCesiumObject(e) {
    if (e.cesiumLayer)
      try {
        e.type === "imagery" ? this.viewer.imageryLayers.remove(e.cesiumLayer, !0) : e.type === "vector" && this.viewer.dataSources.remove(e.cesiumLayer, !0);
      } catch {
      }
  }
  attachLayerListeners(e) {
    if (!e || typeof e.on != "function" || this.layerKeys.has(e)) return;
    const n = () => {
      const s = this.layerMappings.find((c) => c.olLayer === e);
      s && G(e, s), this.viewer.scene.requestRender();
    }, i = () => {
      const s = this.layerMappings.find((c) => c.olLayer === e);
      s && G(e, s), this.viewer.scene.requestRender();
    }, r = () => {
      this.updateCesiumZOrder(), this.viewer.scene.requestRender();
    }, o = [
      e.on("change:visible", n),
      e.on("change:opacity", i),
      e.on("change:zIndex", r)
    ];
    this.layerKeys.set(e, o);
  }
  attachSourceListeners(e) {
    var o;
    const n = (o = e == null ? void 0 : e.getSource) == null ? void 0 : o.call(e);
    if (!n || typeof n.on != "function" || this.sourceKeys.has(n)) return;
    const i = () => {
      const s = this.vectorRefreshTimers.get(e);
      s && clearTimeout(s);
      const c = setTimeout(() => {
        if (!this.enabled) return;
        const a = this.layerMappings.find((g) => g.olLayer === e);
        if (!a || a.type !== "vector") return;
        try {
          this.viewer.dataSources.remove(a.cesiumLayer, !0);
        } catch {
        }
        const f = this.map.getView(), h = {
          ...this.vectorOptions,
          resolution: f.getResolution() ?? this.vectorOptions.resolution ?? 1,
          extent: this.vectorOptions.extent ?? f.calculateExtent()
        }, m = X(e, h);
        m && m.dataSource && (this.viewer.dataSources.add(m.dataSource), a.cesiumLayer = m.dataSource, this.updateCesiumZOrder(), this.viewer.scene.requestRender());
      }, 100);
      this.vectorRefreshTimers.set(e, c);
    }, r = [
      n.on("addfeature", i),
      n.on("removefeature", i),
      n.on("clear", i)
    ];
    this.sourceKeys.set(n, r);
  }
  cleanupLayerListeners(e) {
    var o;
    const n = this.layerKeys.get(e);
    n && (D(n), this.layerKeys.delete(e));
    const i = (o = e == null ? void 0 : e.getSource) == null ? void 0 : o.call(e);
    if (i) {
      const s = this.sourceKeys.get(i);
      s && (D(s), this.sourceKeys.delete(i));
    }
    const r = this.vectorRefreshTimers.get(e);
    r && (clearTimeout(r), this.vectorRefreshTimers.delete(e));
  }
  updateCesiumZOrder() {
    const e = this.map.getLayers().getArray();
    this.layerMappings.filter((r) => r.type === "imagery" && r.cesiumLayer).sort((r, o) => {
      var a, f, h, m;
      const s = ((f = (a = r.olLayer).getZIndex) == null ? void 0 : f.call(a)) || 0, c = ((m = (h = o.olLayer).getZIndex) == null ? void 0 : m.call(h)) || 0;
      return s !== c ? s - c : e.indexOf(r.olLayer) - e.indexOf(o.olLayer);
    }).forEach((r) => {
      this.viewer.imageryLayers.raiseToTop(r.cesiumLayer);
    }), this.layerMappings.filter((r) => r.type === "vector" && r.cesiumLayer).sort((r, o) => {
      var a, f, h, m;
      const s = ((f = (a = r.olLayer).getZIndex) == null ? void 0 : f.call(a)) || 0, c = ((m = (h = o.olLayer).getZIndex) == null ? void 0 : m.call(h)) || 0;
      return s !== c ? s - c : e.indexOf(r.olLayer) - e.indexOf(o.olLayer);
    }).forEach((r) => {
      try {
        this.viewer.dataSources.raiseToTop(r.cesiumLayer);
      } catch {
      }
    });
  }
  applyDefaultZIndex() {
    var e, n, i, r, o, s, c, a, f, h;
    for (const m of this.map.getLayers().getArray()) {
      if (!m || typeof m.getZIndex != "function" || m.getZIndex() > 0) continue;
      const g = (e = m.getSource) == null ? void 0 : e.call(m), d = ((r = (i = (n = m == null ? void 0 : m.constructor) == null ? void 0 : n.name) == null ? void 0 : i.includes) == null ? void 0 : r.call(i, "Tile")) ?? !1, l = ((c = (s = (o = m == null ? void 0 : m.constructor) == null ? void 0 : o.name) == null ? void 0 : s.includes) == null ? void 0 : c.call(s, "Vector")) ?? !1, y = ((h = (f = (a = g == null ? void 0 : g.constructor) == null ? void 0 : a.name) == null ? void 0 : f.includes) == null ? void 0 : h.call(f, "WMS")) ?? !1;
      d && !y ? m.setZIndex(0) : y ? m.setZIndex(10) : l && m.setZIndex(20);
    }
  }
  syncOverlays() {
    if (!this.enabled) return;
    const e = this.map.getOverlays().getArray(), n = this.viewer.scene, i = this.viewer.camera, r = this.map.getView();
    for (const o of e) {
      const s = o.getElement();
      if (!s) continue;
      const c = o.getPosition();
      if (!c) {
        s.style.display = "none";
        continue;
      }
      const [a, f] = V(c, r.getProjection()), h = W.fromDegrees(a, f), m = Be.worldToWindowCoordinates(
        n,
        h
      );
      if (!m) {
        s.style.display = "none";
        continue;
      }
      const g = W.subtract(
        h,
        i.position,
        new W()
      );
      if (W.dot(g, i.direction) <= 0) {
        s.style.display = "none";
        continue;
      }
      const l = s;
      l.style.display = "block", l.style.position = "absolute", l.style.left = `${m.x}px`, l.style.top = `${m.y}px`, l.style.transform = "translate(-50%, -100%)", l.style.pointerEvents = "auto";
    }
  }
}
class At {
  constructor(e) {
    O(this, "core");
    O(this, "overlayDiv", null);
    // Public fields expected by legacy code.
    O(this, "viewer_");
    O(this, "canvas_");
    const n = e.map, i = e.target ?? this.createOverlayContainer(n, {
      pointerEvents: "auto"
    }), r = {
      map: n,
      target: i,
      enabled: !1,
      enableTerrain: e.enableTerrain ?? !1,
      // Keep default behavior close to ol-cesium: don't destroy layers on disable.
      clearOnDisable: !1
    };
    this.core = new ft(r), this.viewer_ = this.core.getCesiumViewer(), this.canvas_ = this.viewer_.scene.canvas;
  }
  getEnabled() {
    return this.core.isEnabled();
  }
  setEnabled(e) {
    this.core.setEnabled(e);
  }
  getCesiumScene() {
    return this.viewer_.scene;
  }
  setResolutionScale(e) {
    this.viewer_.resolutionScale = e, this.viewer_.scene.requestRender();
  }
  get resolutionScale_() {
    return this.viewer_.resolutionScale;
  }
  set resolutionScale_(e) {
    this.setResolutionScale(e);
  }
  destroy() {
    var e;
    this.core.destroy(), (e = this.overlayDiv) != null && e.parentElement && this.overlayDiv.parentElement.removeChild(this.overlayDiv), this.overlayDiv = null;
  }
  createOverlayContainer(e, n) {
    var s;
    const i = (s = e.getTargetElement) == null ? void 0 : s.call(e);
    if (!i)
      throw new Error(
        "OLCesium: map.getTargetElement() is missing. Provide options.target explicitly."
      );
    const r = window.getComputedStyle(i);
    (!r.position || r.position === "static") && (i.style.position = "relative");
    const o = document.createElement("div");
    return o.className = "olcesium-container", Object.assign(o.style, {
      position: "absolute",
      inset: "0",
      width: "100%",
      height: "100%",
      overflow: "hidden",
      ...n
    }), i.appendChild(o), this.overlayDiv = o, o;
  }
}
function Pt(t, e, n = {}, i) {
  const { debounceMs: r = 100, animate: o = !0, animationDuration: s = 0.5 } = n, c = R(null), a = R(null), f = R(null), h = R(null), m = R(0), g = R(null), d = F(() => {
    var P, U;
    if (!t || !e || c.current === "cesium") return;
    const u = t.getView(), T = u.getCenter();
    if (!T) return;
    const [p, S] = V(T), C = -(u.getRotation() ?? 0), w = u.getZoom() ?? 2, b = u.getResolution() ?? (typeof u.getResolutionForZoom == "function" ? u.getResolutionForZoom(w) : void 0) ?? 2e7 / Math.pow(2, w - 1), L = ((U = (P = u.getProjection()) == null ? void 0 : P.getCode) == null ? void 0 : U.call(P)) === "EPSG:3857", K = Re({
      resolution: b,
      latDeg: S,
      olSize: t.getSize() ?? void 0,
      viewer: e,
      isWebMercator: L
    }), H = W.fromDegrees(p, S, K), N = !o || c.current === "ol", M = e.camera.pitch, ce = e.camera.roll, j = {
      heading: C,
      pitch: M,
      roll: ce
    };
    N ? (e.camera.cancelFlight(), e.camera.setView({
      destination: H,
      orientation: j
    })) : e.camera.flyTo({
      destination: H,
      orientation: j,
      duration: s
    }), c.current = "ol";
    const J = {
      center: [p, S],
      zoom: w,
      rotation: u.getRotation() ?? 0,
      tilt: 0
    };
    i == null || i(J), a.current && clearTimeout(a.current), a.current = setTimeout(() => {
      c.current = null;
    }, r);
  }, [
    t,
    e,
    o,
    s,
    r,
    i
  ]), l = F(() => {
    f.current == null && (f.current = requestAnimationFrame(() => {
      f.current = null, d();
    }));
  }, [d]), y = F(() => {
    var P, U;
    if (!t || !e || c.current === "ol") return;
    const u = e.camera, T = q.WGS84.cartesianToCartographic(u.position);
    if (!T) return;
    c.current = "cesium";
    const p = I.toDegrees(T.longitude), S = I.toDegrees(T.latitude), C = T.height, w = -u.heading, b = t.getView(), L = ((U = (P = b.getProjection()) == null ? void 0 : P.getCode) == null ? void 0 : U.call(P)) === "EPSG:3857", K = Ee({
      heightMeters: C,
      latDeg: S,
      olSize: t.getSize() ?? void 0,
      viewer: e,
      isWebMercator: L
    }), H = typeof b.getZoomForResolution == "function" ? b.getZoomForResolution(K) : Math.log2(2e7 / Math.max(C, 1)) + 1, N = Math.max(0, Math.min(28, H)), M = g.current;
    (!M || Math.abs(M.lon - p) > 1e-7 || Math.abs(M.lat - S) > 1e-7 || Math.abs(M.zoom - N) > 0.02 || Math.abs(M.rotation - w) > 1e-4) && (b.setCenter(B([p, S])), (!M || Math.abs(M.zoom - N) > 0.02) && b.setZoom(N), (!M || Math.abs(M.rotation - w) > 1e-4) && b.setRotation(w), g.current = {
      lon: p,
      lat: S,
      zoom: N,
      rotation: w
    });
    const j = I.toDegrees(u.pitch) + 90, J = {
      center: [p, S],
      zoom: H,
      rotation: -w,
      tilt: j
    };
    i == null || i(J), a.current && clearTimeout(a.current), a.current = setTimeout(() => {
      c.current = null;
    }, r);
  }, [t, e, r, i]), v = F(() => {
    const u = typeof performance < "u" ? performance.now() : Date.now();
    u - m.current < 33 || (m.current = u, h.current == null && (h.current = requestAnimationFrame(() => {
      h.current = null, y();
    })));
  }, [y]);
  return x(() => {
    if (!t) return;
    const u = t.getView();
    return u.on("change:center", l), u.on("change:resolution", l), u.on("change:rotation", l), () => {
      u.un("change:center", l), u.un("change:resolution", l), u.un("change:rotation", l), f.current != null && (cancelAnimationFrame(f.current), f.current = null);
    };
  }, [t, l]), x(() => {
    if (!e) return;
    const u = e.camera.changed.addEventListener(v);
    return e.camera.percentageChanged = 0.01, () => {
      u(), h.current != null && (cancelAnimationFrame(h.current), h.current = null);
    };
  }, [e, v]), { syncOlToCesium: l, syncCesiumToOl: v };
}
function Dt(t, e, n = {}) {
  const i = R([]), r = R(/* @__PURE__ */ new WeakMap()), o = R(/* @__PURE__ */ new WeakMap()), s = R(/* @__PURE__ */ new WeakMap()), c = F(() => {
    if (!t || !e) return;
    const l = t.getLayers().getArray(), y = i.current, v = [];
    for (const u of y)
      l.includes(u.olLayer) ? v.push(u) : a(u);
    i.current = v;
    for (const u of l)
      i.current.find((T) => T.olLayer === u) || f(u);
    h();
  }, [t, e, n]), a = (l) => {
    !e || !l.cesiumLayer || (l.type === "imagery" ? e.imageryLayers.remove(l.cesiumLayer, !0) : l.type === "vector" && e.dataSources.remove(l.cesiumLayer, !0));
  }, f = (l) => {
    if (!t || !e) return;
    const y = t.getView(), v = {
      ...n,
      resolution: y.getResolution() ?? n.resolution ?? 1,
      extent: n.extent ?? y.calculateExtent()
    }, u = X(l, v);
    if (!u) return;
    const T = {
      olLayer: l,
      cesiumLayer: u.imagery || u.dataSource || null,
      type: u.type,
      visible: l.getVisible(),
      opacity: l.getOpacity()
    };
    u.type === "imagery" && u.imagery ? e.imageryLayers.add(u.imagery) : u.type === "vector" && u.dataSource && e.dataSources.add(u.dataSource), i.current.push(T), m(l), u.type === "vector" && g(l);
  }, h = () => {
    if (!t || !e) return;
    const l = t.getLayers().getArray();
    i.current.filter((u) => u.type === "imagery" && u.cesiumLayer).sort((u, T) => {
      const p = u.olLayer.getZIndex() || 0, S = T.olLayer.getZIndex() || 0;
      return p !== S ? p - S : l.indexOf(u.olLayer) - l.indexOf(T.olLayer);
    }).forEach((u) => {
      e.imageryLayers.raiseToTop(u.cesiumLayer);
    }), i.current.filter((u) => u.type === "vector" && u.cesiumLayer).sort((u, T) => {
      const p = u.olLayer.getZIndex() || 0, S = T.olLayer.getZIndex() || 0;
      return p !== S ? p - S : l.indexOf(u.olLayer) - l.indexOf(T.olLayer);
    }).forEach((u) => {
      try {
        e.dataSources.raiseToTop(u.cesiumLayer);
      } catch {
      }
    });
  }, m = (l) => {
    if (!l || typeof l.on != "function" || r.current.has(l)) return;
    const y = () => {
      const p = i.current.find((S) => S.olLayer === l);
      p && G(l, p);
    }, v = () => {
      const p = i.current.find((S) => S.olLayer === l);
      p && G(l, p);
    }, u = () => h(), T = [
      l.on("change:visible", y),
      l.on("change:opacity", v),
      l.on("change:zIndex", u)
    ];
    r.current.set(l, T);
  }, g = (l) => {
    var T;
    const y = (T = l.getSource) == null ? void 0 : T.call(l);
    if (!y || typeof y.on != "function" || o.current.has(y)) return;
    const v = () => {
      if (!e || !t) return;
      const p = s.current.get(l);
      p && clearTimeout(p);
      const S = setTimeout(() => {
        const C = i.current.find((K) => K.olLayer === l);
        if (!C || C.type !== "vector") return;
        try {
          e.dataSources.remove(C.cesiumLayer, !0);
        } catch {
        }
        const w = t.getView(), b = {
          ...n,
          resolution: w.getResolution() ?? n.resolution ?? 1,
          extent: n.extent ?? w.calculateExtent()
        }, L = X(l, b);
        L && L.dataSource && (e.dataSources.add(L.dataSource), C.cesiumLayer = L.dataSource);
      }, 100);
      s.current.set(l, S);
    }, u = [
      y.on("addfeature", v),
      y.on("removefeature", v),
      y.on("clear", v)
    ];
    o.current.set(y, u);
  }, d = F(() => {
    for (const l of i.current)
      G(l.olLayer, l);
  }, []);
  return x(() => {
    if (!t || !e) return;
    c();
    const l = t.getLayers(), y = (u) => f(u.element), v = (u) => {
      var b;
      const T = i.current.find(
        (L) => L.olLayer === u.element
      );
      T && (a(T), i.current = i.current.filter((L) => L !== T));
      const p = u.element, S = r.current.get(p);
      S && (D(S), r.current.delete(p));
      const C = (b = p == null ? void 0 : p.getSource) == null ? void 0 : b.call(p);
      if (C) {
        const L = o.current.get(C);
        L && (D(L), o.current.delete(C));
      }
      const w = s.current.get(p);
      w && (clearTimeout(w), s.current.delete(p));
    };
    return l.on("add", y), l.on("remove", v), () => {
      var u;
      l.un("add", y), l.un("remove", v);
      for (const T of i.current) {
        const p = T.olLayer, S = r.current.get(p);
        S && D(S), r.current.delete(p);
        const C = (u = p == null ? void 0 : p.getSource) == null ? void 0 : u.call(p);
        if (C) {
          const b = o.current.get(C);
          b && D(b), o.current.delete(C);
        }
        const w = s.current.get(p);
        w && clearTimeout(w), s.current.delete(p);
      }
    };
  }, [t, e, c]), { syncLayers: c, syncAllVisibility: d, mappings: i };
}
function Wt(t, e, n = !1) {
  x(() => {
    if (!t || !e || !n) return;
    const i = typeof n == "boolean" ? { click: !0, hover: !0 } : n, r = new ve(e.scene.canvas);
    return i.click && r.setInputAction(
      (o) => {
        const s = e.scene.pick(
          new z(o.position.x, o.position.y)
        );
        if ($(s) && s.id) {
          const c = e.scene.globe.pick(
            e.camera.getPickRay(
              new z(o.position.x, o.position.y)
            ),
            e.scene
          );
          if (c) {
            const a = q.WGS84.cartesianToCartographic(c), f = I.toDegrees(a.longitude), h = I.toDegrees(a.latitude);
            t.dispatchEvent({
              type: "cesium:click",
              coordinate: B([f, h]),
              entity: s.id
            });
          }
        }
      },
      Y.LEFT_CLICK
    ), i.hover && r.setInputAction(
      (o) => {
        const s = e.scene.pick(
          new z(o.endPosition.x, o.endPosition.y)
        );
        t.dispatchEvent({
          type: "cesium:hover",
          entity: $(s) ? s.id : null
        });
      },
      Y.MOUSE_MOVE
    ), () => {
      r.destroy();
    };
  }, [t, e, n]);
}
function Ft(t, e = !1) {
  x(() => {
    if (!t || !e) return;
    const n = (o) => {
      var h;
      if (o.getZIndex() > 0) return;
      const s = (h = o.getSource) == null ? void 0 : h.call(o), c = o instanceof re && !(s instanceof te), a = s instanceof te || s instanceof Se || o instanceof Te, f = o instanceof Oe || o instanceof $e;
      c ? o.setZIndex(0) : a ? o.setZIndex(10) : f && o.setZIndex(20);
    }, i = t.getLayers();
    i.forEach(n);
    const r = (o) => {
      n(o.element);
    };
    return i.on("add", r), () => {
      i.un("add", r);
    };
  }, [t, e]);
}
export {
  qe as C,
  At as O,
  Dt as a,
  Wt as b,
  Ft as c,
  ft as d,
  Mt as e,
  Ce as f,
  Je as g,
  rt as h,
  ot as i,
  Xe as j,
  et as k,
  X as l,
  Qe as m,
  tt as n,
  nt as o,
  _ as p,
  G as s,
  Pt as u
};
//# sourceMappingURL=index-50FKxaFc.js.map
