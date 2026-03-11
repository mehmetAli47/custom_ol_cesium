import { useCallback, useEffect, useRef, useState } from "react";
import VectorSource from "ol/source/Vector.js";
import VectorLayer from "ol/layer/Vector.js";
import Draw from "ol/interaction/Draw.js";
import type OlMapObj from "ol/Map.js";
import type Feature from "ol/Feature.js";
import type { Geometry } from "ol/geom.js";
import type { Type as GeometryType } from "ol/geom/Geometry.js";

export interface UseDrawingReturn {
  /** Currently active drawing type, or null if not drawing */
  activeType: GeometryType | null;
  /** The VectorLayer that holds drawn features */
  drawLayer: VectorLayer<VectorSource<Feature<Geometry>>>;
  /** Toggle a specific geometry type on/off */
  toggle: (type: GeometryType) => void;
  /** Remove all drawn features */
  clear: () => void;
}

export function useDrawing(map: OlMapObj | null): UseDrawingReturn {
  const [activeType, setActiveType] = useState<GeometryType | null>(null);

  const sourceRef = useRef<VectorSource<Feature<Geometry>>>(
    new VectorSource<Feature<Geometry>>(),
  );
  const interactionRef = useRef<Draw | null>(null);
  const layerRef = useRef<VectorLayer<VectorSource<Feature<Geometry>>>>(
    new VectorLayer({
      source: sourceRef.current,
      properties: { title: "External Drawings" },
    }),
  );

  // Sync draw interaction with activeType
  useEffect(() => {
    if (!map) return;
    const source = sourceRef.current;

    // Remove previous interaction
    if (interactionRef.current) {
      map.removeInteraction(interactionRef.current);
      interactionRef.current = null;
    }

    if (!activeType) return;

    const draw = new Draw({ source, type: activeType });
    map.addInteraction(draw);
    interactionRef.current = draw;

    return () => {
      if (interactionRef.current) {
        map.removeInteraction(interactionRef.current);
        interactionRef.current = null;
      }
    };
  }, [map, activeType]);

  const toggle = useCallback((type: GeometryType) => {
    setActiveType((prev) => (prev === type ? null : type));
  }, []);

  const clear = useCallback(() => {
    sourceRef.current.clear();
  }, []);

  return {
    activeType,
    drawLayer: layerRef.current,
    toggle,
    clear,
  };
}
