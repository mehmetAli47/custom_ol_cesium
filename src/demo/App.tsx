/**
 * Demo App (imperative ol-cesium style)
 *
 * This demo intentionally uses the same pattern as legacy `ol-cesium` usage:
 * - Create an OpenLayers map outside
 * - Create `new OLCesium({ map, imageryProvider: false })`
 * - Toggle with `setEnabled(true/false)`
 * - Access `viewer_`, `canvas_`, `getCesiumScene()` for Cesium-side tuning
 */
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import OlMapObj from "ol/Map.js";
import TileLayer from "ol/layer/Tile.js";
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import OSM from "ol/source/OSM.js";
import TileWMS from "ol/source/TileWMS.js";
import GeoJSON from "ol/format/GeoJSON.js";
import Feature from "ol/Feature.js";
import { Fill, Stroke, Style, Circle as CircleStyle } from "ol/style.js";
import type { Geometry } from "ol/geom.js";

import OlMap, { type OlMapRef } from "../lib/components/OlMap";
import OLCesium from "../lib";
import { useDrawing } from "./useDrawing";

const mapModeEnum = {
  Map2d: 0,
  Map3d: 1,
} as const;
type MapMode = (typeof mapModeEnum)[keyof typeof mapModeEnum];

type OlMapWithOl3d = OlMapObj & {
  mapMode?: MapMode;
  ol3d?: any;
};

const sampleGeoJSON = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "Istanbul" },
      geometry: { type: "Point", coordinates: [28.9784, 41.0082] },
    },
    {
      type: "Feature",
      properties: { name: "Ankara" },
      geometry: { type: "Point", coordinates: [32.8597, 39.9334] },
    },
    {
      type: "Feature",
      properties: { name: "Route" },
      geometry: {
        type: "LineString",
        coordinates: [
          [28.9784, 41.0082],
          [30.0, 40.5],
          [32.8597, 39.9334],
        ],
      },
    },
  ],
};

export default function App() {
  const olMapRef = useRef<OlMapRef>(null);
  const [mapObject, setMapObject] = useState<OlMapWithOl3d | null>(null);
  const [mapMode, setMapMode] = useState<MapMode>(mapModeEnum.Map2d);

  const { activeType, drawLayer, toggle, clear } = useDrawing(mapObject);

  const layerDefs = useMemo(() => {
    // Kalici default base layer — her zaman gorunur, katman listesinde YOK.
    // 2D tarafinda siyah ekran olmasini onler.
    const defaultBase = new TileLayer({
      source: new OSM(),
      properties: { title: "__defaultBase__", isDefaultBase: true },
    });

    // OSM — katman listesinden ac/kapat. Varsayilan KAPALI.
    const osm = new TileLayer({
      source: new OSM(),
      visible: false,
      properties: { title: "OSM" },
    });

    const wms = new TileLayer({
      source: new TileWMS({
        url: "https://ahocevar.com/geoserver/wms",
        params: {
          SERVICE: "WMS",
          VERSION: "1.1.1",
          REQUEST: "GetMap",
          LAYERS: "topp:states",
          TILED: true,
          FORMAT: "image/png",
          TRANSPARENT: true,
        },
        crossOrigin: "anonymous",
      }),
      visible: false,
      properties: { title: "WMS (topp:states)" },
    });

    const vectorSource = new VectorSource({
      features: new GeoJSON().readFeatures(sampleGeoJSON, {
        featureProjection: "EPSG:3857",
      }),
    });

    const vector = new VectorLayer({
      source: vectorSource,
      properties: { title: "Sample Data" },
      style: (feature) => {
        const geomType = feature.getGeometry()?.getType();
        if (geomType !== "Point") return new Style();
        return new Style({
          image: new CircleStyle({
            radius: 7,
            fill: new Fill({ color: "rgba(99, 102, 241, 0.85)" }),
            stroke: new Stroke({ color: "#fff", width: 2 }),
          }),
        });
      },
    });

    return {
      defaultBase,
      defs: [
        { id: "osm", title: "OSM", layer: osm },
        { id: "wms_states", title: "WMS (topp:states)", layer: wms },
        { id: "sample", title: "Sample Data", layer: vector },
        { id: "drawings", title: "External Drawings", layer: drawLayer },
      ] as const,
    };
  }, [drawLayer]);

  const [layerVisibility, setLayerVisibility] = useState<
    Record<string, boolean>
  >(() =>
    Object.fromEntries(
      layerDefs.defs.map((d) => [
        d.id,
        typeof (d.layer as any).getVisible === "function"
          ? (d.layer as any).getVisible()
          : true,
      ]),
    ),
  );

  useEffect(() => {
    for (const def of layerDefs.defs) {
      const v = layerVisibility[def.id];
      if (
        typeof v === "boolean" &&
        typeof (def.layer as any).setVisible === "function"
      ) {
        (def.layer as any).setVisible(v);
      }
    }
  }, [layerDefs, layerVisibility]);

  // defaultBase her zaman en altta, sonra diger katmanlar
  const layers = useMemo(
    () => [layerDefs.defaultBase, ...layerDefs.defs.map((d) => d.layer)],
    [layerDefs],
  );

  const handleMapReady = useCallback((map: OlMapObj) => {
    // Mirror legacy usage: keep a single OL map instance.
    setMapObject(map as OlMapWithOl3d);
  }, []);

  const changeMapMode = useCallback(
    (nextMode: MapMode) => {
      if (!mapObject) return;
      mapObject.mapMode = nextMode;
      setMapMode(nextMode);

      if (nextMode === mapModeEnum.Map3d) {
        if (!mapObject.ol3d) {
          // Legacy-like constructor + fields:
          // - viewer_ / canvas_ / getCesiumScene()
          // - setEnabled(true/false)
          mapObject.ol3d = new (OLCesium as any)({
            map: mapObject,
            imageryProvider: false,
          });

          // Example Cesium-side performance tuning (same intent as your legacy code).
          const scene = mapObject.ol3d.getCesiumScene();
          const sscc = mapObject.ol3d.viewer_.scene.screenSpaceCameraController;
          sscc.minimumZoomDistance = 25;
          sscc.inertiaSpin = 0.95;
          sscc.inertiaTranslate = 0.95;
          sscc.inertiaZoom = 0.85;
        }

        mapObject.updateSize();

        // Önce çizimleri senkronize et (3D gösterilmeden önce)
        // Böylece 3D'ye geçişte çizimler hazır olur
        if (mapObject.ol3d.core) {
          mapObject.ol3d.core.layerSync.syncOnce();
        }

        mapObject.ol3d.setEnabled(true);
        mapObject.ol3d.getCesiumScene().globe.show = true;
        mapObject.ol3d.getCesiumScene().requestRender();
      } else {
        if (mapObject.ol3d) {
          mapObject.ol3d.setEnabled(false);
          mapObject.ol3d.getCesiumScene().globe.show = false;
        }
      }
    },
    [mapObject],
  );

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "radial-gradient(1200px 600px at 20% 0%, rgba(99, 102, 241, 0.25), transparent 60%), #070a12",
        color: "#e5e7eb",
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 12,
          left: 12,
          zIndex: 50,
          padding: 12,
          borderRadius: 12,
          background: "rgba(16, 24, 40, 0.55)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          backdropFilter: "blur(10px)",
          display: "flex",
          gap: 10,
          alignItems: "center",
        }}
      >
        <button
          onClick={() =>
            changeMapMode(
              mapMode === mapModeEnum.Map3d
                ? mapModeEnum.Map2d
                : mapModeEnum.Map3d,
            )
          }
          style={{
            padding: "8px 10px",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.12)",
            background:
              mapMode === mapModeEnum.Map3d
                ? "rgba(99,102,241,0.22)"
                : "rgba(255,255,255,0.06)",
            color: "#e5e7eb",
            cursor: "pointer",
          }}
        >
          {mapMode === mapModeEnum.Map3d ? "3D Acik" : "2D Acik"} (Toggle)
        </button>

        <div style={{ opacity: 0.85, fontSize: 12 }}>
          Imperative demo:{" "}
          <code style={{ opacity: 0.9 }}>
            {"new OLCesium({ map, imageryProvider: false })"}
          </code>
        </div>

        <div
          style={{ width: 1, height: 18, background: "rgba(255,255,255,0.12)" }}
        />

        <button
          onClick={() => toggle("Point")}
          style={{
            padding: "8px 10px",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.12)",
            background:
              activeType === "Point"
                ? "rgba(245,158,11,0.18)"
                : "rgba(255,255,255,0.06)",
            color: "#e5e7eb",
            cursor: "pointer",
          }}
        >
          Point
        </button>
        <button
          onClick={() => toggle("LineString")}
          style={{
            padding: "8px 10px",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.12)",
            background:
              activeType === "LineString"
                ? "rgba(245,158,11,0.18)"
                : "rgba(255,255,255,0.06)",
            color: "#e5e7eb",
            cursor: "pointer",
          }}
        >
          Line
        </button>
        <button
          onClick={() => toggle("Polygon")}
          style={{
            padding: "8px 10px",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.12)",
            background:
              activeType === "Polygon"
                ? "rgba(245,158,11,0.18)"
                : "rgba(255,255,255,0.06)",
            color: "#e5e7eb",
            cursor: "pointer",
          }}
        >
          Polygon
        </button>
        <button
          onClick={clear}
          style={{
            padding: "8px 10px",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(255,255,255,0.06)",
            color: "#e5e7eb",
            cursor: "pointer",
          }}
        >
          Clear
        </button>
      </div>

      <div
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          zIndex: 50,
          width: 260,
          padding: 12,
          borderRadius: 12,
          background: "rgba(16, 24, 40, 0.55)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          backdropFilter: "blur(10px)",
        }}
      >
        <div style={{ fontSize: 12, opacity: 0.9, marginBottom: 10 }}>
          Layers
        </div>
        {layerDefs.defs.map((def) => (
          <label
            key={def.id}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
              padding: "6px 8px",
              borderRadius: 10,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
              marginBottom: 8,
              cursor: "pointer",
              userSelect: "none",
              fontSize: 13,
            }}
          >
            <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
              {def.title}
            </span>
            <input
              type="checkbox"
              checked={!!layerVisibility[def.id]}
              onChange={() =>
                setLayerVisibility((prev) => ({
                  ...prev,
                  [def.id]: !prev[def.id],
                }))
              }
            />
          </label>
        ))}
        <div style={{ fontSize: 11, opacity: 0.7 }}>
          Default altlik harita her zaman aktif. Katmanlari ac/kapa.
        </div>
      </div>

      <div style={{ position: "absolute", inset: 0 }}>
        <OlMap
          ref={olMapRef}
          center={[29, 41]}
          zoom={6}
          layers={layers}
          visible={true}
          onMapReady={handleMapReady}
        />
      </div>
    </div>
  );
}
