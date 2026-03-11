/**
 * OlCesiumAdapter.tsx
 * Main adapter component: orchestrates 2D ↔ 3D sync between OpenLayers & Cesium
 */
import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  Suspense,
  lazy,
} from "react";
import type OlMapObj from "ol/Map.js";

import OlMap, { type OlMapRef } from "./OlMap";
import type { OlCesiumAdapterProps } from "../types/adapter";

const CesiumAdapterCore = lazy(() => import("./CesiumAdapterCore"));

const OlCesiumAdapter: React.FC<OlCesiumAdapterProps> = ({
  map: externalMap,
  enable3D,
  cameraSyncOptions,
  vectorOptions = {},
  styleOptions = {},
  interactionSync = false,
  autoOrderLayers = true,
  splitMode = false,
  onCameraChange,
  on3DToggle,
}) => {
  const olMapRef = useRef<OlMapRef>(null);
  const [olMap, setOlMap] = useState<OlMapObj | null>(null);

  // Use external map if provided, otherwise internal
  const activeMap = externalMap ?? olMap;

  // Notify on toggle
  useEffect(() => {
    on3DToggle?.(enable3D);
  }, [enable3D, on3DToggle]);

  const handleOlMapReady = useCallback((map: OlMapObj) => {
    setOlMap(map);
  }, []);

  const isCesiumVisible = enable3D || splitMode;
  const isOlVisible = !enable3D || splitMode;

  return (
    <div
      className={`ol-cesium-adapter ${splitMode ? "split-view" : ""}`}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      {/* OpenLayers 2D Map — positioned on the left in split mode */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          width: splitMode ? "50%" : "100%",
          visibility: isOlVisible ? "visible" : "hidden",
          pointerEvents: isOlVisible && !externalMap ? "auto" : "none",
          zIndex: 1,
          borderRight: splitMode ? "2px solid var(--accent)" : "none",
        }}
      >
        {!externalMap && (
          <OlMap
            ref={olMapRef}
            onMapReady={handleOlMapReady}
            visible={isOlVisible}
          />
        )}
      </div>

      {/* Cesium 3D Scene — positioned on the right in split mode */}
      {isCesiumVisible && activeMap && (
        <div
          className="cesium-view-container"
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: splitMode ? "50%" : 0,
            width: splitMode ? "50%" : "100%",
            zIndex: 2,
            pointerEvents: "auto",
          }}
        >
          <Suspense
            fallback={
              <div className="loading-overlay">
                <div className="loading-spinner" />
              </div>
            }
          >
            <CesiumAdapterCore
              map={activeMap}
              enable3D={enable3D}
              splitMode={splitMode}
              cameraSyncOptions={cameraSyncOptions}
              vectorOptions={vectorOptions}
              interactionSync={interactionSync}
              autoOrderLayers={autoOrderLayers}
              onCameraChange={onCameraChange}
            />
          </Suspense>
        </div>
      )}

      {/* Container for OL Overlays when in 3D mode */}
      {isCesiumVisible && activeMap && (
        <div
          id="cesium-overlay-container"
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: splitMode ? "50%" : 0,
            width: splitMode ? "50%" : "100%",
            zIndex: 10,
            pointerEvents: "none",
          }}
        />
      )}
    </div>
  );
};

export default OlCesiumAdapter;
