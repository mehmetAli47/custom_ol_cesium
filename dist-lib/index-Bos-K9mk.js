var De = Object.defineProperty;
var Pe = (i, e, t) => e in i ? De(i, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : i[e] = t;
var v = (i, e, t) => Pe(i, typeof e != "symbol" ? e + "" : e, t);
import W, { forwardRef as ge, useRef as I, useState as se, useImperativeHandle as ye, useEffect as D, lazy as Fe, useCallback as N, Suspense as Ve } from "react";
import We from "ol/Map.js";
import ke from "ol/View.js";
import oe from "ol/layer/Tile.js";
import ce from "ol/source/OSM.js";
import { fromLonLat as $, toLonLat as J } from "ol/proj.js";
import { Ion as ze, Viewer as pe, createWorldTerrainAsync as ve, ImageryLayer as Y, UrlTemplateImageryProvider as Se, Math as P, Cartesian3 as _, Ellipsoid as ee, Color as M, HeightReference as U, VerticalOrigin as we, HorizontalOrigin as Le, NearFarScalar as Ze, Cartesian2 as G, LabelStyle as Ne, CustomDataSource as _e, Entity as Ke, ColorMaterialProperty as H, PolygonHierarchy as Be, WebMapServiceImageryProvider as Ue, WebMapTileServiceImageryProvider as Ge, SingleTileImageryProvider as He, Rectangle as qe, SceneTransforms as je, ScreenSpaceEventHandler as Oe, defined as X, ScreenSpaceEventType as Q } from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import { unByKey as z } from "ol/Observable.js";
import Te from "ol/layer/Image.js";
import be from "ol/layer/Vector.js";
import $e from "ol/source/XYZ.js";
import ie from "ol/source/TileWMS.js";
import Ye from "ol/source/WMTS.js";
import Ce from "ol/source/ImageWMS.js";
import { getUid as ae } from "ol/util.js";
import Xe from "ol/layer/VectorTile.js";
const Re = ge(
  ({
    center: i = [29, 41],
    zoom: e = 6,
    className: t = "",
    style: n,
    layers: r,
    visible: s = !0,
    onMapReady: o
  }, c) => {
    const a = I(null), f = I(null), [u, d] = se(null);
    return ye(c, () => ({ map: u }), [u]), D(() => {
      if (!a.current || f.current) return;
      const h = [new oe({ source: new ce() })], m = new We({
        target: a.current,
        layers: r ?? h,
        view: new ke({
          center: $(i),
          zoom: e,
          maxZoom: 22,
          minZoom: 1
        })
      });
      return f.current = m, d(m), o == null || o(m), () => {
        m.setTarget(void 0), f.current = null, d(null);
      };
    }, []), D(() => {
      const h = f.current;
      if (!h || !r) return;
      const m = h.getLayers(), w = m.getArray();
      r.forEach((T) => {
        w.includes(T) || m.push(T);
      }), w.forEach((T) => {
        const C = T.get("title") === "External Drawings" || T.get("isInternal"), S = !!T.get("isDefaultBase");
        !r.includes(T) && !C && !S && m.remove(T);
      });
    }, [r]), D(() => {
      const h = f.current;
      h && setTimeout(() => h.updateSize(), 50);
    }, [s]), D(() => {
      f.current && f.current.updateSize();
    }, []), /* @__PURE__ */ W.createElement(
      "div",
      {
        ref: a,
        className: `ol-map-container ${t}`,
        style: {
          width: "100%",
          height: "100%",
          position: "absolute",
          top: 0,
          left: 0,
          visibility: s ? "visible" : "hidden",
          ...n
        }
      }
    );
  }
);
Re.displayName = "OlMap";
const te = {}, ue = te == null ? void 0 : te.VITE_CESIUM_ION_TOKEN;
ue && (ze.defaultAccessToken = ue);
const Qe = ge(
  ({
    className: i = "",
    style: e,
    visible: t = !0,
    enableTerrain: n = !1,
    onViewerReady: r
  }, s) => {
    const o = I(null), c = I(null), [a, f] = se(!1);
    return ye(s, () => ({ viewer: c.current }), [a]), D(() => {
      if (!o.current || c.current) return;
      const u = new pe(o.current, {
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
        scene3DOnly: !0,
        requestRenderMode: !0,
        maximumRenderTimeChange: 1 / 0
      });
      return u.imageryLayers.removeAll(), u.scene.globe.enableLighting = !1, u.scene.fog.enabled = !1, u.clock.shouldAnimate = !1, u.targetFrameRate = 30, u.scene.skyAtmosphere && (u.scene.skyAtmosphere.show = !0), u.scene.globe.showGroundAtmosphere = !0, n && ve().then((d) => {
        u.isDestroyed() || (u.terrainProvider = d);
      }), c.current = u, f(!0), r == null || r(u), () => {
        u.isDestroyed() || u.destroy(), c.current = null, f(!1);
      };
    }, []), D(() => {
      const u = c.current;
      !u || u.isDestroyed() || t && (u.resize(), u.scene.requestRender());
    }, [t]), /* @__PURE__ */ W.createElement(
      "div",
      {
        ref: o,
        className: `cesium-scene-container ${i}`,
        style: {
          width: "100%",
          height: "100%",
          position: "absolute",
          top: 0,
          left: 0,
          visibility: t ? "visible" : "hidden",
          ...e
        }
      }
    );
  }
);
Qe.displayName = "CesiumScene";
const Je = Fe(() => import("./CesiumAdapterCore-CiMqqamI.js")), kt = ({
  map: i,
  enable3D: e,
  cameraSyncOptions: t,
  vectorOptions: n = {},
  styleOptions: r = {},
  interactionSync: s = !1,
  autoOrderLayers: o = !0,
  splitMode: c = !1,
  onCameraChange: a,
  on3DToggle: f
}) => {
  const u = I(null), [d, h] = se(null), m = i ?? d;
  D(() => {
    f == null || f(e);
  }, [e, f]);
  const w = N((S) => {
    h(S);
  }, []), T = e || c, C = !e || c;
  return /* @__PURE__ */ W.createElement(
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
    /* @__PURE__ */ W.createElement(
      "div",
      {
        style: {
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          width: c ? "50%" : "100%",
          visibility: C ? "visible" : "hidden",
          pointerEvents: C && !i ? "auto" : "none",
          zIndex: 1,
          borderRight: c ? "2px solid var(--accent)" : "none"
        }
      },
      !i && /* @__PURE__ */ W.createElement(
        Re,
        {
          ref: u,
          onMapReady: w,
          visible: C
        }
      )
    ),
    T && m && /* @__PURE__ */ W.createElement(
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
      /* @__PURE__ */ W.createElement(
        Ve,
        {
          fallback: /* @__PURE__ */ W.createElement("div", { className: "loading-overlay" }, /* @__PURE__ */ W.createElement("div", { className: "loading-spinner" }))
        },
        /* @__PURE__ */ W.createElement(
          Je,
          {
            map: m,
            enable3D: e,
            splitMode: c,
            cameraSyncOptions: t,
            vectorOptions: n,
            interactionSync: s,
            autoOrderLayers: o,
            onCameraChange: a
          }
        )
      )
    ),
    T && m && /* @__PURE__ */ W.createElement(
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
function et({ target: i, enableTerrain: e }) {
  var r, s;
  const t = new pe(i, {
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
    scene3DOnly: !0,
    // Stability: avoid Cesium's OIT translucent rendering path which has caused fatal
    // render errors in our toggle/sync flows.
    orderIndependentTranslucency: !1,
    // Render only on demand; critical for keeping GPU usage low when idle.
    requestRenderMode: !0,
    maximumRenderTimeChange: 1 / 0
  });
  (s = (r = t.scene.renderError) == null ? void 0 : r.addEventListener) == null || s.call(
    r,
    (o, c) => {
      console.error("[OlCesium] Cesium renderError:", c);
    }
  ), t.useDefaultRenderLoop = !1, t.imageryLayers.removeAll(!1);
  const n = new Y(
    new Se({
      url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
      minimumLevel: 0,
      maximumLevel: 19
    })
  );
  n._isDefaultBase = !0, t.imageryLayers.add(n), t.scene.globe.enableLighting = !1, t.scene.fog.enabled = !1;
  try {
    t.scene.postProcessStages.fxaa.enabled = !1;
  } catch {
  }
  return t.clock.shouldAnimate = !1, t.targetFrameRate = 30, t.scene.skyAtmosphere && (t.scene.skyAtmosphere.show = !0), t.scene.globe.showGroundAtmosphere = !0, e && ve().then((o) => {
    t.isDestroyed() || (t.terrainProvider = o);
  }), t;
}
function Ee(i) {
  var n;
  const e = (n = i == null ? void 0 : i.camera) == null ? void 0 : n.frustum, t = e && typeof e.fovy == "number" ? e.fovy : e && typeof e.fov == "number" ? e.fov : void 0;
  return typeof t == "number" && isFinite(t) && t > 0 ? t : Math.PI / 3;
}
function xe(i, e) {
  var s;
  const t = i == null ? void 0 : i[1];
  if (typeof t == "number" && isFinite(t) && t > 0)
    return t;
  const n = (s = e == null ? void 0 : e.scene) == null ? void 0 : s.canvas, r = (n == null ? void 0 : n.clientHeight) ?? (n == null ? void 0 : n.height);
  return typeof r == "number" && isFinite(r) && r > 0 ? r : 800;
}
function Ie(i) {
  const { resolution: e, latDeg: t, olSize: n, viewer: r, isWebMercator: s = !0 } = i, o = Ee(r), c = xe(n, r), a = P.toRadians(t), u = (s ? e * Math.cos(a) : e) * (c / 2) / Math.tan(o / 2);
  return Math.max(1, isFinite(u) ? u : 1);
}
function Ae(i) {
  const { heightMeters: e, latDeg: t, olSize: n, viewer: r, isWebMercator: s = !0 } = i, o = Ee(r), c = xe(n, r), f = 2 * Math.max(1, e) * Math.tan(o / 2) / c, u = P.toRadians(t), d = s ? f / Math.max(1e-6, Math.cos(u)) : f;
  return Math.max(1e-9, isFinite(d) ? d : 1);
}
class tt {
  constructor(e) {
    v(this, "map");
    v(this, "viewer");
    v(this, "opts");
    v(this, "onCameraChange");
    v(this, "syncing", null);
    v(this, "syncTimer", null);
    v(this, "rafOlToCesium", null);
    v(this, "rafCesiumToOl", null);
    v(this, "lastCesiumToOlTs", 0);
    v(this, "lastApplied", null);
    v(this, "viewKeys", []);
    v(this, "cameraChangedRemove", null);
    this.map = e.map, this.viewer = e.viewer, this.opts = e.options ?? {}, this.onCameraChange = e.onCameraChange;
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
  }
  detach() {
    this.viewKeys.length && z(this.viewKeys), this.viewKeys = [], this.cameraChangedRemove && (this.cameraChangedRemove(), this.cameraChangedRemove = null), this.rafOlToCesium != null && (cancelAnimationFrame(this.rafOlToCesium), this.rafOlToCesium = null), this.rafCesiumToOl != null && (cancelAnimationFrame(this.rafCesiumToOl), this.rafCesiumToOl = null), this.syncTimer && (clearTimeout(this.syncTimer), this.syncTimer = null), this.syncing = null;
  }
  getViewKeys() {
    return this.viewKeys;
  }
  syncOnce() {
    this.syncOlToCesium();
  }
  scheduleOlToCesium() {
    this.rafOlToCesium == null && (this.rafOlToCesium = requestAnimationFrame(() => {
      this.rafOlToCesium = null, this.syncOlToCesium();
    }));
  }
  scheduleCesiumToOl() {
    const e = typeof performance < "u" ? performance.now() : Date.now();
    e - this.lastCesiumToOlTs < 33 || (this.lastCesiumToOlTs = e, this.rafCesiumToOl == null && (this.rafCesiumToOl = requestAnimationFrame(() => {
      this.rafCesiumToOl = null, this.syncCesiumToOl();
    })));
  }
  syncOlToCesium() {
    var C, S, R;
    if (this.syncing === "cesium") return;
    const e = this.map.getView(), t = e.getCenter();
    if (!t) return;
    const {
      animate: n = !0,
      animationDuration: r = 0.5,
      debounceMs: s = 100
    } = this.opts, [o, c] = J(t, e.getProjection()), a = e.getZoom() ?? 2, f = -(e.getRotation() ?? 0), u = e.getResolution() ?? (typeof e.getResolutionForZoom == "function" ? e.getResolutionForZoom(a) : void 0) ?? 2e7 / Math.pow(2, a - 1), d = ((S = (C = e.getProjection()) == null ? void 0 : C.getCode) == null ? void 0 : S.call(C)) === "EPSG:3857", h = Ie({
      resolution: u,
      latDeg: c,
      olSize: this.map.getSize() ?? void 0,
      viewer: this.viewer,
      isWebMercator: d
    }), m = _.fromDegrees(o, c, h), w = !n || this.syncing === "ol" || !this.viewer.useDefaultRenderLoop, T = {
      heading: f,
      pitch: this.viewer.camera.pitch,
      roll: this.viewer.camera.roll
    };
    w ? (this.viewer.camera.cancelFlight(), this.viewer.camera.setView({ destination: m, orientation: T })) : this.viewer.camera.flyTo({
      destination: m,
      orientation: T,
      duration: r
    }), this.syncing = "ol", (R = this.onCameraChange) == null || R.call(this, {
      center: [o, c],
      zoom: a,
      rotation: e.getRotation() ?? 0,
      tilt: 0
    }), this.syncTimer && clearTimeout(this.syncTimer), this.syncTimer = setTimeout(() => {
      this.syncing = null;
    }, s);
  }
  syncCesiumToOl() {
    var C, S, R;
    if (this.syncing === "ol") return;
    const e = this.viewer.camera, t = ee.WGS84.cartesianToCartographic(e.position);
    if (!t) return;
    const { debounceMs: n = 100 } = this.opts;
    this.syncing = "cesium";
    const r = P.toDegrees(t.longitude), s = P.toDegrees(t.latitude), o = t.height, c = -e.heading, a = this.map.getView(), f = ((S = (C = a.getProjection()) == null ? void 0 : C.getCode) == null ? void 0 : S.call(C)) === "EPSG:3857", u = Ae({
      heightMeters: o,
      latDeg: s,
      olSize: this.map.getSize() ?? void 0,
      viewer: this.viewer,
      isWebMercator: f
    }), d = typeof a.getZoomForResolution == "function" ? a.getZoomForResolution(u) : Math.log2(2e7 / Math.max(o, 1)) + 1, h = Math.max(0, Math.min(28, d)), m = this.lastApplied;
    (!m || Math.abs(m.lon - r) > 1e-7 || Math.abs(m.lat - s) > 1e-7 || Math.abs(m.zoom - h) > 0.02 || Math.abs(m.rotation - c) > 1e-4) && (a.setCenter($([r, s], a.getProjection())), (!m || Math.abs(m.zoom - h) > 0.02) && a.setZoom(h), (!m || Math.abs(m.rotation - c) > 1e-4) && a.setRotation(c), this.lastApplied = { lon: r, lat: s, zoom: h, rotation: c });
    const T = P.toDegrees(e.pitch) + 90;
    (R = this.onCameraChange) == null || R.call(this, {
      center: [r, s],
      zoom: d,
      rotation: -c,
      tilt: T
    }), this.syncTimer && clearTimeout(this.syncTimer), this.syncTimer = setTimeout(() => {
      this.syncing = null;
    }, n);
  }
}
function j(i) {
  if (!i) return M.WHITE;
  if (Array.isArray(i)) {
    const [e, t, n, r = 1] = i;
    return new M(e / 255, t / 255, n / 255, r);
  }
  if (typeof i == "string")
    try {
      return M.fromCssColorString(i);
    } catch {
      return M.WHITE;
    }
  return M.WHITE;
}
function nt(i) {
  if (!i) return null;
  const e = i.getColor();
  return {
    color: j(e)
  };
}
function it(i) {
  return i ? {
    color: j(
      i.getColor()
    ),
    width: i.getWidth() ?? 1
  } : null;
}
function rt(i) {
  if (!i) return null;
  const e = i.getFill(), t = i.getStroke();
  return {
    color: e ? j(e.getColor()) : M.WHITE,
    outlineColor: t ? j(t.getColor()) : M.BLACK,
    outlineWidth: (t == null ? void 0 : t.getWidth()) ?? 1,
    pixelSize: i.getRadius() * 2
  };
}
function st(i) {
  return !i || typeof i.getSrc != "function" ? null : {
    image: i.getSrc() ?? void 0,
    scale: i.getScale() ?? 1,
    rotation: -(i.getRotation() ?? 0),
    horizontalOrigin: Le.CENTER,
    verticalOrigin: we.CENTER,
    heightReference: U.CLAMP_TO_GROUND
  };
}
function ot(i) {
  if (!i) return null;
  const e = i.getText();
  if (!e) return null;
  const t = i.getFill(), n = i.getStroke();
  return {
    text: Array.isArray(e) ? e.join("") : e,
    font: i.getFont() ?? "14px sans-serif",
    fillColor: t ? j(t.getColor()) : M.WHITE,
    outlineColor: n ? j(n.getColor()) : M.BLACK,
    outlineWidth: (n == null ? void 0 : n.getWidth()) ?? 2,
    style: Ne.FILL_AND_OUTLINE,
    scale: i.getScale() ?? 1,
    horizontalOrigin: Le.CENTER,
    verticalOrigin: we.BOTTOM,
    pixelOffset: new G(
      i.getOffsetX() ?? 0,
      -(i.getOffsetY() ?? 0)
    ),
    heightReference: U.CLAMP_TO_GROUND,
    disableDepthTestDistance: Number.POSITIVE_INFINITY,
    scaleByDistance: new Ze(1e3, 1, 5e6, 0.4)
  };
}
function ct(i) {
  if (!i)
    return {
      fill: null,
      stroke: null,
      circle: null,
      billboard: null,
      label: null
    };
  const e = i.getImage();
  let t = null, n = null;
  return e && (typeof e.getRadius == "function" ? t = rt(e) : typeof e.getSrc == "function" && (n = st(e))), {
    fill: nt(i.getFill()),
    stroke: it(i.getStroke()),
    circle: t,
    billboard: n,
    label: ot(i.getText())
  };
}
function le(i, e = 0) {
  const [t, n] = J(i);
  return _.fromDegrees(t, n, i[2] ?? e);
}
function re(i, e = 0) {
  return i.map((t) => le(t, e));
}
function fe(i, e, t) {
  var a;
  const [n, r, s] = i, c = {
    position: le(i, s ?? 0)
  };
  return e.circle && (c.point = {
    color: e.circle.color,
    pixelSize: e.circle.pixelSize,
    outlineColor: e.circle.outlineColor,
    outlineWidth: e.circle.outlineWidth,
    heightReference: U.CLAMP_TO_GROUND,
    disableDepthTestDistance: Number.POSITIVE_INFINITY
  }), (a = e.billboard) != null && a.image && (c.billboard = {
    image: e.billboard.image,
    scale: e.billboard.scale,
    rotation: e.billboard.rotation,
    heightReference: U.CLAMP_TO_GROUND,
    disableDepthTestDistance: Number.POSITIVE_INFINITY
  }), e.label && t.label && (c.label = {
    text: e.label.text,
    font: e.label.font,
    fillColor: e.label.fillColor,
    outlineColor: e.label.outlineColor,
    outlineWidth: e.label.outlineWidth,
    style: e.label.style,
    scale: e.label.scale,
    pixelOffset: e.label.pixelOffset,
    heightReference: U.CLAMP_TO_GROUND,
    disableDepthTestDistance: Number.POSITIVE_INFINITY,
    scaleByDistance: e.label.scaleByDistance
  }), c;
}
function he(i, e) {
  const t = re(i), n = e.stroke;
  return {
    polyline: {
      positions: t,
      width: (n == null ? void 0 : n.width) ?? 2,
      material: n ? new H(n.color) : new H(M.WHITE),
      clampToGround: !0
    }
  };
}
function de(i, e, t) {
  const n = re(i[0]), r = i.slice(1).map((f) => ({
    positions: re(f)
  })), s = e.fill, o = e.stroke, c = {
    hierarchy: new Be(n, r),
    material: s ? new H(s.color) : new H(M.WHITE.withAlpha(0.5))
  };
  t.extrude && (c.extrudedHeight = t.extrudeHeight ?? 100, c.heightReference = U.RELATIVE_TO_GROUND);
  const a = {
    polygon: c
  };
  return o && (a.polyline = {
    positions: n,
    width: o.width,
    material: new H(o.color),
    clampToGround: !0
  }), a;
}
function at(i, e, t) {
  const n = t.fill, r = t.stroke;
  return {
    position: le(i),
    ellipse: {
      semiMajorAxis: e,
      semiMinorAxis: e,
      material: n ? new H(n.color) : new H(M.WHITE.withAlpha(0.5)),
      outline: !!r,
      outlineColor: (r == null ? void 0 : r.color) ?? M.BLACK,
      outlineWidth: (r == null ? void 0 : r.width) ?? 1,
      heightReference: U.CLAMP_TO_GROUND
    }
  };
}
function Me(i, e = {}, t) {
  var d;
  const n = i.getGeometry();
  if (!n) return null;
  let r = i.getStyle() || t;
  if (typeof r == "function") {
    const h = e.resolution ?? 1;
    r = r(i, h);
  }
  const s = Array.isArray(r) ? r[0] : r, o = ct(s), c = ((d = i.getId()) == null ? void 0 : d.toString()) ?? `feature_${ae(i)}`, a = {
    ...i.getProperties()
  };
  delete a.geometry;
  const f = (h, m = "") => new Ke({
    id: c + m,
    name: a.name ?? c + m,
    ...h,
    properties: a
  }), u = n.getType();
  switch (u) {
    case "Point": {
      const h = n.getCoordinates();
      return !h || h.length < 2 ? null : f(fe(h, o, e));
    }
    case "LineString": {
      const h = n.getCoordinates();
      return !h || h.length < 2 ? null : f(he(h, o));
    }
    case "Polygon": {
      const h = n.getCoordinates();
      return !h || h.length === 0 || !h[0] || h[0].length < 3 ? null : f(de(h, o, e));
    }
    case "Circle": {
      const h = n;
      return f(
        at(h.getCenter(), h.getRadius(), o)
      );
    }
    case "MultiPoint": {
      const h = n.getPoints();
      return !h || h.length === 0 ? null : h.map(
        (m, w) => f(fe(m.getCoordinates(), o, e), `_${w}`)
      );
    }
    case "MultiLineString": {
      const h = n.getLineStrings();
      return !h || h.length === 0 ? null : h.map(
        (m, w) => f(he(m.getCoordinates(), o), `_${w}`)
      );
    }
    case "MultiPolygon": {
      const h = n.getPolygons();
      return !h || h.length === 0 ? null : h.map(
        (m, w) => f(de(m.getCoordinates(), o, e), `_${w}`)
      );
    }
    default:
      return console.warn(`[vectorConverters] Unsupported geometry type: ${u}`), null;
  }
}
function lt(i, e, t = {}, n) {
  const r = new _e(e), s = t.extent;
  for (const o of i) {
    const c = o.getGeometry();
    if (!c || s && !c.intersectsExtent(s))
      continue;
    const a = Me(o, t, n);
    a && (Array.isArray(a) ? a.forEach((f) => r.entities.add(f)) : r.entities.add(a));
  }
  return r;
}
function me(i, e, t = {}, n) {
  const r = { added: 0, removed: 0, updated: 0 }, s = i.entities, o = /* @__PURE__ */ new Set(), c = /* @__PURE__ */ new Set(), a = s.values;
  for (let u = 0; u < a.length; u++) {
    const d = a[u];
    d.id && o.add(String(d.id));
  }
  for (const u of e) {
    const d = `feature_${ae(u)}`;
    if (c.add(d), !s.getById(d)) {
      const m = Me(u, t, n);
      m && (Array.isArray(m) ? m.forEach((w) => s.add(w)) : s.add(m), r.added++);
    }
  }
  const f = [];
  for (const u of o)
    c.has(u) || f.push(u);
  for (const u of f) {
    const d = s.getById(u);
    d && (s.remove(d), r.removed++);
  }
  return r;
}
function ut(i) {
  var o, c;
  const e = i.getSource();
  if (!e) return null;
  let t;
  if (e instanceof ce)
    t = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
  else {
    const a = ((o = e.getUrls) == null ? void 0 : o.call(e)) || [];
    t = a.length > 0 ? a[0] : (c = e.getUrl) == null ? void 0 : c.call(e);
  }
  if (!t) return null;
  const n = t.replace(/\{x\}/g, "{x}").replace(/\{y\}/g, "{y}").replace(/\{z\}/g, "{z}").replace(/\{([a-z0-9])-[a-z0-9]\}/g, "$1"), r = new Se({
    url: n,
    minimumLevel: 0,
    maximumLevel: 19
  });
  return new Y(r, {
    alpha: i.getOpacity(),
    show: i.getVisible()
  });
}
function ft(i) {
  var c, a;
  const e = i.getSource();
  if (!e) return null;
  const t = ((c = e.getUrls) == null ? void 0 : c.call(e)) || [];
  let n = t.length > 0 ? t[0] : (a = e.getUrl) == null ? void 0 : a.call(e);
  if (!n) return null;
  const r = n.split("?")[0], s = e.getParams(), o = new Ue({
    url: r,
    layers: s.LAYERS ?? s.layers ?? "",
    parameters: {
      transparent: !0,
      format: s.FORMAT ?? s.format ?? "image/png",
      VERSION: s.VERSION ?? "1.1.1",
      // Add VERSION as default
      // Filter out layers/LAYERS from params to avoid duplication in query string
      ...Object.fromEntries(
        Object.entries(s).filter(([f]) => f.toUpperCase() !== "LAYERS")
      )
    },
    enablePickFeatures: !1
  });
  return new Y(o, {
    alpha: i.getOpacity(),
    show: i.getVisible()
  });
}
function ht(i) {
  var n, r, s, o, c;
  const e = i.getSource();
  if (!e) return null;
  const t = ((n = e.getUrls) == null ? void 0 : n.call(e)) || [];
  if (t.length === 0) return null;
  try {
    const a = new Ge({
      url: t[0],
      layer: ((r = e.getLayer) == null ? void 0 : r.call(e)) ?? "",
      style: ((s = e.getStyle) == null ? void 0 : s.call(e)) ?? "default",
      tileMatrixSetID: ((o = e.getMatrixSet) == null ? void 0 : o.call(e)) ?? "default",
      format: ((c = e.getFormat) == null ? void 0 : c.call(e)) ?? "image/png"
    });
    return new Y(a, {
      alpha: i.getOpacity(),
      show: i.getVisible()
    });
  } catch (a) {
    return console.warn("[layerConverters] Failed to convert WMTS layer:", a), null;
  }
}
function dt(i) {
  var s;
  const e = i.getSource();
  if (!e) return null;
  const t = (s = e.getUrl) == null ? void 0 : s.call(e);
  if (!t) return null;
  const n = e.getParams(), r = `${t}?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&LAYERS=${n.LAYERS ?? ""}&STYLES=&FORMAT=image/png&TRANSPARENT=true&SRS=EPSG:4326&BBOX=-180,-90,180,90&WIDTH=1024&HEIGHT=512`;
  try {
    const o = new He({
      url: r,
      rectangle: qe.fromDegrees(-180, -90, 180, 90)
    });
    return new Y(o, {
      alpha: i.getOpacity(),
      show: i.getVisible()
    });
  } catch (o) {
    return console.warn("[layerConverters] Failed to convert ImageWMS layer:", o), null;
  }
}
function mt(i, e = {}) {
  const t = i.getSource();
  if (!t) return null;
  const n = t.getFeatures(), r = i.get("title") ?? i.get("name") ?? `vector_${ae(i)}`, s = i.getStyle(), o = lt(n, r, e, s);
  return o.show = i.getVisible(), o;
}
function K(i, e = {}) {
  var s, o;
  const t = i, n = ((s = t == null ? void 0 : t.get) == null ? void 0 : s.call(t, "title")) || "unnamed", r = ((o = t == null ? void 0 : t.getType) == null ? void 0 : o.call(t)) || "unknown";
  if (i instanceof oe || r === "TILE") {
    const c = i.getSource();
    if (!c) return null;
    if (c instanceof ie || typeof c.getParams == "function") {
      const a = ft(i);
      return a ? { type: "imagery", imagery: a } : null;
    }
    if (c instanceof ce || c instanceof $e || typeof c.getUrls == "function" || typeof c.getUrl == "function") {
      const a = ut(i);
      return a ? { type: "imagery", imagery: a } : null;
    }
    if (c instanceof Ye) {
      const a = ht(i);
      return a ? { type: "imagery", imagery: a } : null;
    }
  }
  if (i instanceof Te || r === "IMAGE") {
    const c = i.getSource();
    if (c instanceof Ce || c.getParams && c.getUrl) {
      const a = dt(i);
      return a ? { type: "imagery", imagery: a } : null;
    }
  }
  if (i instanceof be || r === "VECTOR") {
    const c = mt(i, e);
    return c ? { type: "vector", dataSource: c } : null;
  }
  return console.warn(
    "[layerConverters] Unsupported layer type or source:",
    i.constructor.name,
    n,
    r
  ), null;
}
function B(i, e) {
  const t = i.getVisible(), n = i.getOpacity();
  e.cesiumLayer && ("show" in e.cesiumLayer && (e.cesiumLayer.show = t), "alpha" in e.cesiumLayer && (e.cesiumLayer.alpha = n)), e.visible = t, e.opacity = n;
}
function ne(i, e) {
  const t = i.useDefaultRenderLoop;
  i.useDefaultRenderLoop = !1;
  try {
    return e();
  } finally {
    i.useDefaultRenderLoop = t;
  }
}
class gt {
  constructor(e) {
    v(this, "map");
    v(this, "viewer");
    v(this, "vectorOptions");
    v(this, "autoOrderLayers");
    v(this, "layerMappings", []);
    v(this, "layerKeys", /* @__PURE__ */ new WeakMap());
    v(this, "sourceKeys", /* @__PURE__ */ new WeakMap());
    v(this, "vectorRefreshTimers", /* @__PURE__ */ new WeakMap());
    // Collection listeners (add/remove)
    v(this, "layersCollectionKeys", []);
    // First-enable stability: defer attaching vector sources until after first frame.
    v(this, "deferVectorAttachOnce", !1);
    v(this, "pendingVectorAttach", []);
    v(this, "pendingVectorAttachRemove", null);
    this.map = e.map, this.viewer = e.viewer, this.vectorOptions = e.vectorOptions ?? {}, this.autoOrderLayers = e.autoOrderLayers ?? !0;
  }
  attach() {
    var r;
    const e = this.map.getLayers(), t = (s) => this.addLayerToCesium(s.element), n = (s) => this.removeLayerFromCesium(s.element);
    this.layersCollectionKeys = [
      e.on("add", t),
      e.on("remove", n)
    ];
    for (const s of e.getArray()) {
      this.attachLayerListeners(s);
      const o = (r = s == null ? void 0 : s.getSource) == null ? void 0 : r.call(s);
      o && typeof o.getFeatures == "function" && this.attachSourceListeners(s);
    }
  }
  detach() {
    this.layersCollectionKeys.length && (z(this.layersCollectionKeys), this.layersCollectionKeys = []);
    for (const e of this.layerMappings)
      this.cleanupLayerListeners(e.olLayer);
    this.pendingVectorAttachRemove && (this.pendingVectorAttachRemove(), this.pendingVectorAttachRemove = null), this.deferVectorAttachOnce = !1, this.pendingVectorAttach.splice(0, this.pendingVectorAttach.length);
  }
  beginEnableTransaction() {
    this.deferVectorAttachOnce = !0, this.pendingVectorAttach = [];
  }
  endEnableTransaction() {
    this.pendingVectorAttachRemove || (this.pendingVectorAttachRemove = this.viewer.scene.postRender.addEventListener(() => {
      const e = this.pendingVectorAttach.splice(
        0,
        this.pendingVectorAttach.length
      );
      for (const t of e) {
        if (!(t != null && t.visible) || t.type !== "vector") continue;
        const n = t.cesiumLayer;
        if (n)
          try {
            this.hasDataSource(n) || this.viewer.dataSources.add(n);
          } catch {
          }
      }
      this.deferVectorAttachOnce = !1, this.pendingVectorAttachRemove && (this.pendingVectorAttachRemove(), this.pendingVectorAttachRemove = null), this.viewer.scene.requestRender();
    }));
  }
  syncOnce() {
    this.syncLayers(), this.refreshVectorLayers();
  }
  refreshVectorLayers() {
    var e, t, n, r, s;
    for (const o of this.layerMappings)
      if (o.type === "vector" && o.visible) {
        const c = (t = (e = o.olLayer) == null ? void 0 : e.getSource) == null ? void 0 : t.call(e);
        if (c && typeof c.getFeatures == "function") {
          const a = c.getFeatures(), f = o.cesiumLayer, u = f && !((n = f.isDestroyed) != null && n.call(f));
          if (u || (o.cesiumLayer = null), u) {
            const d = this.map.getView(), h = {
              ...this.vectorOptions,
              resolution: d.getResolution() ?? this.vectorOptions.resolution ?? 1,
              extent: this.vectorOptions.extent ?? d.calculateExtent()
            };
            me(
              f,
              a,
              h,
              (s = (r = o.olLayer).getStyle) == null ? void 0 : s.call(r)
            );
          } else {
            const d = this.map.getView(), h = {
              ...this.vectorOptions,
              resolution: d.getResolution() ?? this.vectorOptions.resolution ?? 1,
              extent: this.vectorOptions.extent ?? d.calculateExtent()
            }, m = K(
              o.olLayer,
              h
            );
            m && m.dataSource && (this.viewer.dataSources.add(m.dataSource), o.cesiumLayer = m.dataSource);
          }
        }
      }
    this.updateCesiumZOrder(), this.viewer.scene.requestRender();
  }
  clearCesiumLayers(e = !0) {
    for (const n of this.layerMappings)
      this.removeCesiumObject(n, e);
    this.layerMappings = [];
    const t = this.viewer.imageryLayers;
    for (let n = t.length - 1; n >= 0; n--) {
      const r = t.get(n);
      r._isDefaultBase || t.remove(r, !1);
    }
    this.viewer.dataSources.removeAll(!1);
  }
  syncLayers() {
    var n;
    const e = this.map.getLayers().getArray(), t = [];
    for (const r of this.layerMappings)
      e.includes(r.olLayer) ? t.push(r) : (ne(
        this.viewer,
        () => this.removeCesiumObject(r, !0)
      ), this.cleanupLayerListeners(r.olLayer));
    this.layerMappings = t;
    for (const r of e)
      (n = r.get) != null && n.call(r, "isDefaultBase") || this.layerMappings.find((s) => s.olLayer === r) || this.addLayerToCesium(r);
    this.autoOrderLayers && this.applyDefaultZIndex(), this.reconcileAllLayerAttachments(), this.updateCesiumZOrder();
  }
  addLayerToCesium(e) {
    var o, c, a;
    if ((o = e.get) != null && o.call(e, "isDefaultBase")) return;
    const t = this.map.getView(), n = {
      ...this.vectorOptions,
      resolution: t.getResolution() ?? this.vectorOptions.resolution ?? 1,
      extent: this.vectorOptions.extent ?? t.calculateExtent()
    }, r = K(e, n);
    if (!r) return;
    const s = {
      olLayer: e,
      cesiumLayer: r.imagery || r.dataSource || null,
      type: r.type,
      visible: ((c = e.getVisible) == null ? void 0 : c.call(e)) ?? !0,
      opacity: ((a = e.getOpacity) == null ? void 0 : a.call(e)) ?? 1
    };
    s.visible && (r.type === "imagery" && r.imagery ? this.viewer.imageryLayers.add(r.imagery) : r.type === "vector" && r.dataSource && (this.deferVectorAttachOnce ? this.pendingVectorAttach.push(s) : this.viewer.dataSources.add(r.dataSource))), this.layerMappings.push(s), this.attachLayerListeners(e), r.type === "vector" && this.attachSourceListeners(e), this.updateCesiumZOrder(), this.viewer.scene.requestRender();
  }
  removeLayerFromCesium(e) {
    const t = this.layerMappings.find((n) => n.olLayer === e);
    t && (ne(this.viewer, () => this.removeCesiumObject(t, !0)), this.cleanupLayerListeners(e), this.layerMappings = this.layerMappings.filter((n) => n !== t), this.viewer.scene.requestRender());
  }
  hasImageryLayer(e) {
    const t = this.viewer.imageryLayers;
    try {
      if (typeof t.contains == "function") return !!t.contains(e);
      if (typeof t.indexOf == "function") return t.indexOf(e) !== -1;
    } catch {
    }
    return !1;
  }
  hasDataSource(e) {
    const t = this.viewer.dataSources;
    try {
      if (typeof t.contains == "function") return !!t.contains(e);
      if (typeof t.indexOf == "function") return t.indexOf(e) !== -1;
    } catch {
    }
    return !1;
  }
  removeCesiumObject(e, t = !0) {
    if (!e.cesiumLayer) return;
    const n = e.cesiumLayer;
    try {
      e.type === "imagery" ? this.viewer.imageryLayers.remove(n, !!t) : e.type === "vector" && this.viewer.dataSources.remove(n, !!t);
    } catch {
    }
    t && (e.cesiumLayer = null);
  }
  reconvertLayer(e) {
    const t = this.map.getView(), n = {
      ...this.vectorOptions,
      resolution: t.getResolution() ?? this.vectorOptions.resolution ?? 1,
      extent: this.vectorOptions.extent ?? t.calculateExtent()
    }, r = K(
      e.olLayer,
      n
    );
    if (!r) {
      e.cesiumLayer = null;
      return;
    }
    e.type = r.type, e.cesiumLayer = r.imagery || r.dataSource || null;
  }
  addToCesiumViewer(e) {
    if (e.cesiumLayer || this.reconvertLayer(e), !!e.cesiumLayer) {
      try {
        if (e.type === "imagery") {
          const t = e.cesiumLayer;
          this.hasImageryLayer(t) || this.viewer.imageryLayers.add(t);
        } else if (e.type === "vector") {
          const t = e.cesiumLayer;
          this.deferVectorAttachOnce ? this.pendingVectorAttach.includes(e) || this.pendingVectorAttach.push(e) : this.hasDataSource(t) || this.viewer.dataSources.add(t);
        }
      } catch {
      }
      this.viewer.scene.requestRender();
    }
  }
  removeFromCesiumViewer(e) {
    e.cesiumLayer && (this.removeCesiumObject(e, !1), this.viewer.scene.requestRender());
  }
  reconcileAllLayerAttachments() {
    for (const e of this.layerMappings) {
      const t = e.olLayer, n = typeof (t == null ? void 0 : t.getVisible) == "function" ? t.getVisible() : !0;
      e.visible = n, n ? this.addToCesiumViewer(e) : this.removeFromCesiumViewer(e);
      try {
        B(t, e);
      } catch {
      }
    }
  }
  attachLayerListeners(e) {
    if (!e || typeof e.on != "function" || this.layerKeys.has(e)) return;
    const t = () => {
      const o = this.layerMappings.find((c) => c.olLayer === e);
      o && (o.visible = e.getVisible(), ne(this.viewer, () => {
        o.visible ? this.addToCesiumViewer(o) : this.removeFromCesiumViewer(o);
      }), B(e, o), this.updateCesiumZOrder());
    }, n = () => {
      const o = this.layerMappings.find((c) => c.olLayer === e);
      o && B(e, o), this.viewer.scene.requestRender();
    }, r = () => {
      this.updateCesiumZOrder(), this.viewer.scene.requestRender();
    }, s = [
      e.on("change:visible", t),
      e.on("change:opacity", n),
      e.on("change:zIndex", r)
    ];
    this.layerKeys.set(e, s);
  }
  attachSourceListeners(e) {
    var s;
    const t = (s = e == null ? void 0 : e.getSource) == null ? void 0 : s.call(e);
    if (!t || typeof t.on != "function" || this.sourceKeys.has(t)) return;
    const n = () => {
      const o = this.vectorRefreshTimers.get(e);
      o && clearTimeout(o);
      const c = setTimeout(() => {
        var T, C, S;
        const a = this.layerMappings.find((R) => R.olLayer === e);
        if (!a || a.type !== "vector" || !a.visible) return;
        const f = (T = e == null ? void 0 : e.getSource) == null ? void 0 : T.call(e);
        if (!f) return;
        const u = f.getFeatures(), d = this.map.getView(), h = {
          ...this.vectorOptions,
          resolution: d.getResolution() ?? this.vectorOptions.resolution ?? 1,
          extent: this.vectorOptions.extent ?? d.calculateExtent()
        }, m = a.cesiumLayer, w = m && !((C = m.isDestroyed) != null && C.call(m));
        if (w || (a.cesiumLayer = null), w)
          me(
            m,
            u,
            h,
            (S = e.getStyle) == null ? void 0 : S.call(e)
          ), this.viewer.scene.requestRender();
        else {
          const R = K(e, h);
          R && R.dataSource && (this.viewer.dataSources.add(R.dataSource), a.cesiumLayer = R.dataSource, this.updateCesiumZOrder(), this.viewer.scene.requestRender());
        }
      }, 50);
      this.vectorRefreshTimers.set(e, c);
    }, r = [
      t.on("addfeature", n),
      t.on("removefeature", n),
      t.on("clear", n),
      t.on("changefeature", n)
      // Feature değişikliklerini de izle
    ];
    this.sourceKeys.set(t, r);
  }
  cleanupLayerListeners(e) {
    var s;
    const t = this.layerKeys.get(e);
    t && (z(t), this.layerKeys.delete(e));
    const n = (s = e == null ? void 0 : e.getSource) == null ? void 0 : s.call(e);
    if (n) {
      const o = this.sourceKeys.get(n);
      o && (z(o), this.sourceKeys.delete(n));
    }
    const r = this.vectorRefreshTimers.get(e);
    r && (clearTimeout(r), this.vectorRefreshTimers.delete(e));
  }
  updateCesiumZOrder() {
    const e = this.map.getLayers().getArray();
    this.layerMappings.filter((r) => r.type === "imagery" && r.cesiumLayer).sort((r, s) => {
      var a, f, u, d;
      const o = ((f = (a = r.olLayer).getZIndex) == null ? void 0 : f.call(a)) || 0, c = ((d = (u = s.olLayer).getZIndex) == null ? void 0 : d.call(u)) || 0;
      return o !== c ? o - c : e.indexOf(r.olLayer) - e.indexOf(s.olLayer);
    }).forEach((r) => {
      try {
        const s = r.cesiumLayer;
        this.hasImageryLayer(s) && this.viewer.imageryLayers.raiseToTop(s);
      } catch {
      }
    }), this.layerMappings.filter((r) => r.type === "vector" && r.cesiumLayer).sort((r, s) => {
      var a, f, u, d;
      const o = ((f = (a = r.olLayer).getZIndex) == null ? void 0 : f.call(a)) || 0, c = ((d = (u = s.olLayer).getZIndex) == null ? void 0 : d.call(u)) || 0;
      return o !== c ? o - c : e.indexOf(r.olLayer) - e.indexOf(s.olLayer);
    }).forEach((r) => {
      try {
        const s = r.cesiumLayer;
        this.viewer.dataSources.raiseToTop && this.hasDataSource(s) && this.viewer.dataSources.raiseToTop(s);
      } catch {
      }
    });
  }
  applyDefaultZIndex() {
    var e, t, n, r, s, o, c, a, f, u;
    for (const d of this.map.getLayers().getArray()) {
      if (!d || typeof d.getZIndex != "function" || d.getZIndex() > 0) continue;
      const h = (e = d.getSource) == null ? void 0 : e.call(d), m = ((r = (n = (t = d == null ? void 0 : d.constructor) == null ? void 0 : t.name) == null ? void 0 : n.includes) == null ? void 0 : r.call(n, "Tile")) ?? !1, w = ((c = (o = (s = d == null ? void 0 : d.constructor) == null ? void 0 : s.name) == null ? void 0 : o.includes) == null ? void 0 : c.call(o, "Vector")) ?? !1, T = ((u = (f = (a = h == null ? void 0 : h.constructor) == null ? void 0 : a.name) == null ? void 0 : f.includes) == null ? void 0 : u.call(f, "WMS")) ?? !1;
      m && !T ? d.setZIndex(0) : T ? d.setZIndex(10) : w && d.setZIndex(20);
    }
  }
}
class yt {
  constructor(e) {
    v(this, "map");
    v(this, "viewer");
    v(this, "postRenderRemove", null);
    this.map = e.map, this.viewer = e.viewer;
  }
  attach() {
    this.postRenderRemove || (this.postRenderRemove = this.viewer.scene.postRender.addEventListener(
      () => this.syncOverlays()
    ));
  }
  detach() {
    this.postRenderRemove && (this.postRenderRemove(), this.postRenderRemove = null);
  }
  syncOverlays() {
    const e = this.map.getOverlays().getArray(), t = this.viewer.scene, n = this.viewer.camera, r = this.map.getView();
    for (const s of e) {
      const o = s.getElement();
      if (!o) continue;
      const c = s.getPosition();
      if (!c) {
        o.style.display = "none";
        continue;
      }
      const [a, f] = J(c, r.getProjection()), u = _.fromDegrees(a, f), d = je.worldToWindowCoordinates(
        t,
        u
      );
      if (!d) {
        o.style.display = "none";
        continue;
      }
      const h = _.subtract(
        u,
        n.position,
        new _()
      );
      if (_.dot(h, n.direction) <= 0) {
        o.style.display = "none";
        continue;
      }
      const w = o;
      w.style.display = "block", w.style.position = "absolute", w.style.left = `${d.x}px`, w.style.top = `${d.y}px`, w.style.transform = "translate(-50%, -100%)", w.style.pointerEvents = "auto";
    }
  }
}
class pt {
  constructor(e) {
    v(this, "map");
    v(this, "viewer");
    v(this, "opts");
    v(this, "handler", null);
    this.map = e.map, this.viewer = e.viewer, this.opts = typeof e.options == "boolean" ? { click: !0, hover: !0, select: !0 } : e.options;
  }
  attach() {
    this.handler || (this.handler = new Oe(this.viewer.scene.canvas), this.opts.click && this.handler.setInputAction(
      (e) => {
        const t = this.viewer.scene.pick(
          new G(e.position.x, e.position.y)
        );
        if (X(t) && t.id) {
          const n = this.viewer.scene.globe.pick(
            this.viewer.camera.getPickRay(
              new G(e.position.x, e.position.y)
            ),
            this.viewer.scene
          );
          if (n) {
            const r = ee.WGS84.cartesianToCartographic(n), s = P.toDegrees(r.longitude), o = P.toDegrees(r.latitude);
            this.map.dispatchEvent({
              type: "cesium:click",
              coordinate: $(
                [s, o],
                this.map.getView().getProjection()
              ),
              entity: t.id
            });
          }
        }
      },
      Q.LEFT_CLICK
    ), this.opts.hover && this.handler.setInputAction(
      (e) => {
        const t = this.viewer.scene.pick(
          new G(e.endPosition.x, e.endPosition.y)
        );
        this.map.dispatchEvent({
          type: "cesium:hover",
          entity: X(t) ? t.id : null
        });
      },
      Q.MOUSE_MOVE
    ));
  }
  detach() {
    this.handler && (this.handler.destroy(), this.handler = null);
  }
}
class vt {
  constructor(e) {
    v(this, "map");
    v(this, "viewer");
    v(this, "enabled", !1);
    v(this, "attached", !1);
    v(this, "clearOnDisable");
    v(this, "cameraSync");
    v(this, "layerSync");
    v(this, "overlaySync");
    v(this, "interactionSync");
    this.map = e.map, this.clearOnDisable = e.clearOnDisable ?? !1;
    const t = typeof e.target == "string" ? document.getElementById(e.target) : e.target;
    if (!t) throw new Error("OlCesium: target element not found");
    this.viewer = et({
      target: t,
      enableTerrain: e.enableTerrain ?? !1
    }), this.cameraSync = new tt({
      map: this.map,
      viewer: this.viewer,
      options: e.cameraSyncOptions ?? {},
      onCameraChange: e.onCameraChange
    }), this.layerSync = new gt({
      map: this.map,
      viewer: this.viewer,
      vectorOptions: e.vectorOptions ?? {},
      autoOrderLayers: e.autoOrderLayers ?? !0
    });
    const n = e.overlaySync ?? !0;
    this.overlaySync = n ? new yt({ map: this.map, viewer: this.viewer }) : null, this.interactionSync = e.interactionSync ? new pt({
      map: this.map,
      viewer: this.viewer,
      options: e.interactionSync
    }) : null, this.setEnabled(e.enabled ?? !0);
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
    const t = typeof e == "string" ? document.getElementById(e) : e;
    if (!t) throw new Error("OlCesium: target element not found");
    t.appendChild(this.viewer.container), this.viewer.resize(), this.viewer.scene.requestRender();
  }
  setEnabled(e) {
    if (this.enabled === e) return;
    this.enabled = e;
    const t = this.viewer.container;
    if (t && (t.style.visibility = e ? "visible" : "hidden", t.style.pointerEvents = e ? "auto" : "none"), e) {
      this.viewer.useDefaultRenderLoop = !1, this.layerSync.beginEnableTransaction(), this.attached || this.attach();
      try {
        this.viewer.resize();
      } catch {
      }
      this.syncOnce(), this.viewer.useDefaultRenderLoop = !0, this.layerSync.endEnableTransaction(), this.viewer.scene.requestRender();
    } else
      this.viewer.useDefaultRenderLoop = !1, this.attached && this.detach(), this.clearOnDisable && this.layerSync.clearCesiumLayers(!0);
  }
  syncOnce() {
    this.enabled && (this.cameraSync.syncOnce(), this.layerSync.syncOnce(), this.viewer.scene.requestRender());
  }
  destroy() {
    this.attached && this.detach(), this.layerSync.clearCesiumLayers(!0), this.viewer.isDestroyed() || this.viewer.destroy();
  }
  attach() {
    this.attached = !0, this.cameraSync.attach(), this.layerSync.attach(), this.overlaySync && this.overlaySync.attach(), this.interactionSync && this.interactionSync.attach();
  }
  detach() {
    this.attached = !1, this.cameraSync.detach(), this.layerSync.detach(), this.overlaySync && this.overlaySync.detach(), this.interactionSync && this.interactionSync.detach();
  }
}
class zt {
  constructor(e) {
    v(this, "core");
    v(this, "overlayDiv", null);
    // Public fields expected by legacy code.
    v(this, "viewer_");
    v(this, "canvas_");
    const t = e.map, n = e.target ?? this.createOverlayContainer(t, {
      pointerEvents: "auto"
    }), r = {
      map: t,
      target: n,
      enabled: !1,
      enableTerrain: e.enableTerrain ?? !1,
      // Keep default behavior close to ol-cesium: don't destroy layers on disable.
      clearOnDisable: !1
    };
    this.core = new vt(r), this.viewer_ = this.core.getCesiumViewer(), this.canvas_ = this.viewer_.scene.canvas;
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
  createOverlayContainer(e, t) {
    var o;
    const n = (o = e.getTargetElement) == null ? void 0 : o.call(e);
    if (!n)
      throw new Error(
        "OLCesium: map.getTargetElement() is missing. Provide options.target explicitly."
      );
    const r = window.getComputedStyle(n);
    (!r.position || r.position === "static") && (n.style.position = "relative");
    const s = document.createElement("div");
    return s.className = "olcesium-container", Object.assign(s.style, {
      position: "absolute",
      inset: "0",
      width: "100%",
      height: "100%",
      overflow: "hidden",
      ...t
    }), n.appendChild(s), this.overlayDiv = s, s;
  }
}
function Zt(i, e, t = {}, n) {
  const { debounceMs: r = 100, animate: s = !0, animationDuration: o = 0.5 } = t, c = I(null), a = I(null), f = I(null), u = I(null), d = I(0), h = I(null), m = N(() => {
    var E, Z;
    if (!i || !e || c.current === "cesium") return;
    const S = i.getView(), R = S.getCenter();
    if (!R) return;
    const [k, F] = J(R), q = -(S.getRotation() ?? 0), l = S.getZoom() ?? 2, g = S.getResolution() ?? (typeof S.getResolutionForZoom == "function" ? S.getResolutionForZoom(l) : void 0) ?? 2e7 / Math.pow(2, l - 1), b = ((Z = (E = S.getProjection()) == null ? void 0 : E.getCode) == null ? void 0 : Z.call(E)) === "EPSG:3857", y = Ie({
      resolution: g,
      latDeg: F,
      olSize: i.getSize() ?? void 0,
      viewer: e,
      isWebMercator: b
    }), L = _.fromDegrees(k, F, y), p = !s || c.current === "ol", O = e.camera.pitch, x = e.camera.roll, A = {
      heading: q,
      pitch: O,
      roll: x
    };
    p ? (e.camera.cancelFlight(), e.camera.setView({
      destination: L,
      orientation: A
    })) : e.camera.flyTo({
      destination: L,
      orientation: A,
      duration: o
    }), c.current = "ol";
    const V = {
      center: [k, F],
      zoom: l,
      rotation: S.getRotation() ?? 0,
      tilt: 0
    };
    n == null || n(V), a.current && clearTimeout(a.current), a.current = setTimeout(() => {
      c.current = null;
    }, r);
  }, [
    i,
    e,
    s,
    o,
    r,
    n
  ]), w = N(() => {
    f.current == null && (f.current = requestAnimationFrame(() => {
      f.current = null, m();
    }));
  }, [m]), T = N(() => {
    var E, Z;
    if (!i || !e || c.current === "ol") return;
    const S = e.camera, R = ee.WGS84.cartesianToCartographic(S.position);
    if (!R) return;
    c.current = "cesium";
    const k = P.toDegrees(R.longitude), F = P.toDegrees(R.latitude), q = R.height, l = -S.heading, g = i.getView(), b = ((Z = (E = g.getProjection()) == null ? void 0 : E.getCode) == null ? void 0 : Z.call(E)) === "EPSG:3857", y = Ae({
      heightMeters: q,
      latDeg: F,
      olSize: i.getSize() ?? void 0,
      viewer: e,
      isWebMercator: b
    }), L = typeof g.getZoomForResolution == "function" ? g.getZoomForResolution(y) : Math.log2(2e7 / Math.max(q, 1)) + 1, p = Math.max(0, Math.min(28, L)), O = h.current;
    (!O || Math.abs(O.lon - k) > 1e-7 || Math.abs(O.lat - F) > 1e-7 || Math.abs(O.zoom - p) > 0.02 || Math.abs(O.rotation - l) > 1e-4) && (g.setCenter($([k, F])), (!O || Math.abs(O.zoom - p) > 0.02) && g.setZoom(p), (!O || Math.abs(O.rotation - l) > 1e-4) && g.setRotation(l), h.current = {
      lon: k,
      lat: F,
      zoom: p,
      rotation: l
    });
    const A = P.toDegrees(S.pitch) + 90, V = {
      center: [k, F],
      zoom: L,
      rotation: -l,
      tilt: A
    };
    n == null || n(V), a.current && clearTimeout(a.current), a.current = setTimeout(() => {
      c.current = null;
    }, r);
  }, [i, e, r, n]), C = N(() => {
    const S = typeof performance < "u" ? performance.now() : Date.now();
    S - d.current < 33 || (d.current = S, u.current == null && (u.current = requestAnimationFrame(() => {
      u.current = null, T();
    })));
  }, [T]);
  return D(() => {
    if (!i) return;
    const S = i.getView();
    return S.on("change:center", w), S.on("change:resolution", w), S.on("change:rotation", w), () => {
      S.un("change:center", w), S.un("change:resolution", w), S.un("change:rotation", w), f.current != null && (cancelAnimationFrame(f.current), f.current = null);
    };
  }, [i, w]), D(() => {
    if (!e) return;
    const S = e.camera.changed.addEventListener(C);
    return e.camera.percentageChanged = 0.01, () => {
      S(), u.current != null && (cancelAnimationFrame(u.current), u.current = null);
    };
  }, [e, C]), { syncOlToCesium: w, syncCesiumToOl: C };
}
function Nt(i, e, t = {}) {
  const n = I([]), r = I(/* @__PURE__ */ new WeakMap()), s = I(/* @__PURE__ */ new WeakMap()), o = I([]), c = I(/* @__PURE__ */ new WeakMap()), a = N(() => {
    if (!i || !e) return;
    const l = i.getLayers().getArray(), g = n.current, b = [];
    for (const y of g)
      l.includes(y.olLayer) ? b.push(y) : d(y);
    n.current = b;
    for (const y of l)
      n.current.find((L) => L.olLayer === y) || S(y);
    f(), R();
  }, [i, e, t]), f = () => {
    if (!(!i || !e))
      for (const l of n.current) {
        const g = l.olLayer, b = typeof (g == null ? void 0 : g.getVisible) == "function" ? g.getVisible() : !0;
        l.visible = b, b ? C(l) : h(l);
        try {
          B(g, l);
        } catch {
        }
      }
  }, u = (l) => {
    l && o.current.push(l);
  }, d = (l, g = !0) => {
    if (!e || !l.cesiumLayer) return;
    const b = l.cesiumLayer;
    try {
      l.type === "imagery" ? e.imageryLayers.remove(b, !!g) : l.type === "vector" && e.dataSources.remove(b, !!g);
    } catch {
    }
    g && u(b), g && (l.cesiumLayer = null), e.scene.requestRender();
  }, h = (l) => {
    d(l, !1);
  }, m = (l) => {
    const g = e == null ? void 0 : e.imageryLayers;
    try {
      if (!g) return !1;
      if (typeof g.contains == "function") return !!g.contains(l);
      if (typeof g.indexOf == "function") return g.indexOf(l) !== -1;
    } catch {
    }
    return !1;
  }, w = (l) => {
    const g = e == null ? void 0 : e.dataSources;
    try {
      if (!g) return !1;
      if (typeof g.contains == "function") return !!g.contains(l);
      if (typeof g.indexOf == "function") return g.indexOf(l) !== -1;
    } catch {
    }
    return !1;
  }, T = (l) => {
    if (!i || !e) return;
    const g = i.getView(), b = {
      ...t,
      resolution: g.getResolution() ?? t.resolution ?? 1,
      extent: t.extent ?? g.calculateExtent()
    }, y = K(
      l.olLayer,
      b
    );
    if (!y) {
      l.cesiumLayer = null;
      return;
    }
    l.type = y.type, l.cesiumLayer = y.imagery || y.dataSource || null;
  }, C = (l) => {
    if (e && (l.cesiumLayer || T(l), !!l.cesiumLayer)) {
      try {
        if (l.type === "imagery") {
          const g = l.cesiumLayer;
          m(g) || e.imageryLayers.add(g);
        } else if (l.type === "vector") {
          const g = l.cesiumLayer;
          w(g) || e.dataSources.add(g);
        }
      } catch {
      }
      e.scene.requestRender();
    }
  }, S = (l) => {
    if (!i || !e) return;
    const g = i.getView(), b = {
      ...t,
      resolution: g.getResolution() ?? t.resolution ?? 1,
      extent: t.extent ?? g.calculateExtent()
    }, y = K(l, b);
    if (!y) return;
    const L = {
      olLayer: l,
      cesiumLayer: y.imagery || y.dataSource || null,
      type: y.type,
      visible: l.getVisible(),
      opacity: l.getOpacity()
    };
    L.visible && C(L), n.current.push(L), k(l), y.type === "vector" && F(l);
  }, R = () => {
    if (!i || !e) return;
    const l = i.getLayers().getArray();
    n.current.filter((y) => y.type === "imagery" && y.cesiumLayer).sort((y, L) => {
      const p = y.olLayer.getZIndex() || 0, O = L.olLayer.getZIndex() || 0;
      return p !== O ? p - O : l.indexOf(y.olLayer) - l.indexOf(L.olLayer);
    }).forEach((y) => {
      try {
        const L = y.cesiumLayer;
        m(L) && e.imageryLayers.raiseToTop(L);
      } catch {
      }
    }), n.current.filter((y) => y.type === "vector" && y.cesiumLayer).sort((y, L) => {
      const p = y.olLayer.getZIndex() || 0, O = L.olLayer.getZIndex() || 0;
      return p !== O ? p - O : l.indexOf(y.olLayer) - l.indexOf(L.olLayer);
    }).forEach((y) => {
      try {
        const L = y.cesiumLayer;
        w(L) && e.dataSources.raiseToTop(L);
      } catch {
      }
    });
  }, k = (l) => {
    if (!l || typeof l.on != "function" || r.current.has(l)) return;
    const g = () => {
      const p = n.current.find((O) => O.olLayer === l);
      p && (p.visible = l.getVisible(), p.visible ? C(p) : h(p), B(l, p), R());
    }, b = () => {
      const p = n.current.find((O) => O.olLayer === l);
      p && B(l, p);
    }, y = () => R(), L = [
      l.on("change:visible", g),
      l.on("change:opacity", b),
      l.on("change:zIndex", y)
    ];
    r.current.set(l, L);
  }, F = (l) => {
    var L;
    const g = (L = l.getSource) == null ? void 0 : L.call(l);
    if (!g || typeof g.on != "function" || s.current.has(g)) return;
    const b = () => {
      if (!e || !i) return;
      const p = c.current.get(l);
      p && clearTimeout(p);
      const O = setTimeout(() => {
        const x = n.current.find((Z) => Z.olLayer === l);
        if (!x || x.type !== "vector" || !x.visible) return;
        try {
          x.cesiumLayer && (e.dataSources.remove(x.cesiumLayer, !0), u(x.cesiumLayer));
        } catch {
        }
        const A = i.getView(), V = {
          ...t,
          resolution: A.getResolution() ?? t.resolution ?? 1,
          extent: t.extent ?? A.calculateExtent()
        }, E = K(l, V);
        E && E.dataSource && (e.dataSources.add(E.dataSource), x.cesiumLayer = E.dataSource);
      }, 100);
      c.current.set(l, O);
    }, y = [
      g.on("addfeature", b),
      g.on("removefeature", b),
      g.on("clear", b)
    ];
    s.current.set(g, y);
  }, q = N(() => {
    for (const l of n.current)
      B(l.olLayer, l);
  }, []);
  return D(() => {
    if (!i || !e) return;
    a(), f();
    const l = i.getLayers(), g = (y) => S(y.element), b = (y) => {
      var V;
      const L = n.current.find(
        (E) => E.olLayer === y.element
      );
      L && (d(L, !0), n.current = n.current.filter((E) => E !== L));
      const p = y.element, O = r.current.get(p);
      O && (z(O), r.current.delete(p));
      const x = (V = p == null ? void 0 : p.getSource) == null ? void 0 : V.call(p);
      if (x) {
        const E = s.current.get(x);
        E && (z(E), s.current.delete(x));
      }
      const A = c.current.get(p);
      A && (clearTimeout(A), c.current.delete(p));
    };
    return l.on("add", g), l.on("remove", b), () => {
      var y;
      l.un("add", g), l.un("remove", b);
      for (const L of n.current) {
        const p = L.olLayer, O = r.current.get(p);
        O && z(O), r.current.delete(p);
        const x = (y = p == null ? void 0 : p.getSource) == null ? void 0 : y.call(p);
        if (x) {
          const V = s.current.get(x);
          V && z(V), s.current.delete(x);
        }
        const A = c.current.get(p);
        A && clearTimeout(A), c.current.delete(p);
      }
      o.current.splice(0, o.current.length);
    };
  }, [i, e, a]), { syncLayers: a, syncAllVisibility: q, mappings: n };
}
function _t(i, e, t = !1) {
  D(() => {
    if (!i || !e || !t) return;
    const n = typeof t == "boolean" ? { click: !0, hover: !0 } : t, r = new Oe(e.scene.canvas);
    return n.click && r.setInputAction(
      (s) => {
        const o = e.scene.pick(
          new G(s.position.x, s.position.y)
        );
        if (X(o) && o.id) {
          const c = e.scene.globe.pick(
            e.camera.getPickRay(
              new G(s.position.x, s.position.y)
            ),
            e.scene
          );
          if (c) {
            const a = ee.WGS84.cartesianToCartographic(c), f = P.toDegrees(a.longitude), u = P.toDegrees(a.latitude);
            i.dispatchEvent({
              type: "cesium:click",
              coordinate: $([f, u]),
              entity: o.id
            });
          }
        }
      },
      Q.LEFT_CLICK
    ), n.hover && r.setInputAction(
      (s) => {
        const o = e.scene.pick(
          new G(s.endPosition.x, s.endPosition.y)
        );
        i.dispatchEvent({
          type: "cesium:hover",
          entity: X(o) ? o.id : null
        });
      },
      Q.MOUSE_MOVE
    ), () => {
      r.destroy();
    };
  }, [i, e, t]);
}
function Kt(i, e = !1) {
  D(() => {
    if (!i || !e) return;
    const t = (s) => {
      var u;
      if (s.getZIndex() > 0) return;
      const o = (u = s.getSource) == null ? void 0 : u.call(s), c = s instanceof oe && !(o instanceof ie), a = o instanceof ie || o instanceof Ce || s instanceof Te, f = s instanceof be || s instanceof Xe;
      c ? s.setZIndex(0) : a ? s.setZIndex(10) : f && s.setZIndex(20);
    }, n = i.getLayers();
    n.forEach(t);
    const r = (s) => {
      t(s.element);
    };
    return n.on("add", r), () => {
      n.un("add", r);
    };
  }, [i, e]);
}
export {
  Qe as C,
  zt as O,
  Nt as a,
  _t as b,
  Kt as c,
  vt as d,
  kt as e,
  Re as f,
  rt as g,
  Me as h,
  lt as i,
  nt as j,
  st as k,
  K as l,
  it as m,
  ot as n,
  ct as o,
  j as p,
  B as s,
  Zt as u
};
//# sourceMappingURL=index-Bos-K9mk.js.map
