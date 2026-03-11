/**
 * OlMap.tsx
 * OpenLayers Map wrapper component
 */
import React, {
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useState,
} from "react";
import OlMapObj from "ol/Map.js";
import View from "ol/View.js";
import TileLayer from "ol/layer/Tile.js";
import OSM from "ol/source/OSM.js";
import { fromLonLat } from "ol/proj.js";

export interface OlMapProps {
  center?: [number, number];
  zoom?: number;
  className?: string;
  style?: React.CSSProperties;
  layers?: any[];
  visible?: boolean;
  onMapReady?: (map: OlMapObj) => void;
}

export interface OlMapRef {
  map: OlMapObj | null;
}

const OlMap = forwardRef<OlMapRef, OlMapProps>(
  (
    {
      center = [29, 41],
      zoom = 6,
      className = "",
      style,
      layers,
      visible = true,
      onMapReady,
    },
    ref,
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<OlMapObj | null>(null);
    const [map, setMap] = useState<OlMapObj | null>(null);

    useImperativeHandle(ref, () => ({ map }), [map]);

    // Initialize map
    useEffect(() => {
      if (!containerRef.current || mapRef.current) return;

      const defaultLayers = [new TileLayer({ source: new OSM() })];

      const map = new OlMapObj({
        target: containerRef.current,
        layers: layers ?? defaultLayers,
        view: new View({
          center: fromLonLat(center),
          zoom,
          maxZoom: 22,
          minZoom: 1,
        }),
      });

      mapRef.current = map;
      setMap(map);
      onMapReady?.(map);

      return () => {
        map.setTarget(undefined);
        mapRef.current = null;
        setMap(null);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // View updates handled by camera sync internally,
    // no need to force `center` and `zoom` on every render.

    // Update layers when prop changes
    useEffect(() => {
      const map = mapRef.current;
      if (!map || !layers) return;

      const mapLayers = map.getLayers();
      const currentLayersArray = mapLayers.getArray();

      // 1. Remove layers from the props-managed set that are no longer present
      // We only remove layers that WE added (are in the props list or were in the previous props list)
      // For simplicity, we can't easily track previous props without a ref,
      // but we can at least NOT clear everything.

      // Actually, we want to ensure mapLayers matches layers ONLY for the layers WE manage.
      // But usually this component is the owner of the map.
      // Let's at least avoid clearing if they are already there.

      // Simple approach: remove layers that are NOT in the new 'layers' prop
      // BUT were arguably added by this component (i.e. not the internal ones if we had any).
      // Better: just sync the collection to match 'layers'.
      // To allow external layers (like drawing), we should only manage the ones passed in 'layers'.

      // Let's just update the collection surgically.
      layers.forEach((layer) => {
        if (!currentLayersArray.includes(layer)) {
          mapLayers.push(layer);
        }
      });

      // Note: Removal is trickier without state.
      // But if we want 'layers' to be the definitive list for this component:
      currentLayersArray.forEach((layer) => {
        // DON'T remove the drawing layer, other "external" layers, or the default base
        const isExternal =
          layer.get("title") === "External Drawings" || layer.get("isInternal");
        const isDefaultBase = !!layer.get("isDefaultBase");
        if (!layers.includes(layer) && !isExternal && !isDefaultBase) {
          mapLayers.remove(layer);
        }
      });
    }, [layers]);

    // Resize when visibility changes
    useEffect(() => {
      const map = mapRef.current;
      if (!map) return;
      setTimeout(() => map.updateSize(), 50);
    }, [visible]);

    // Ensure initial map size is correct
    useEffect(() => {
      if (mapRef.current) {
        mapRef.current.updateSize();
      }
    }, []);

    return (
      <div
        ref={containerRef}
        className={`ol-map-container ${className}`}
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          top: 0,
          left: 0,
          visibility: visible ? "visible" : "hidden",
          ...style,
        }}
      />
    );
  },
);

OlMap.displayName = "OlMap";
export default OlMap;
