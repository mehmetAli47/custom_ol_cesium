import React, { useEffect, useState, useCallback } from "react";
import type OlMapObj from "ol/Map.js";
import type { Viewer as CesiumViewer } from "cesium";

import CesiumScene from "./CesiumScene";
import {
  useCameraSync,
  useLayerSync,
  useInteractionSync,
  useAutoLayerOrder,
} from "../hooks/useOlCesium";
import { useOverlaySync } from "../hooks/useOverlaySync";
import type { OlCesiumAdapterProps } from "../types/adapter";

type Props = Pick<
  OlCesiumAdapterProps,
  | "enable3D"
  | "splitMode"
  | "cameraSyncOptions"
  | "vectorOptions"
  | "interactionSync"
  | "autoOrderLayers"
  | "onCameraChange"
> & {
  map: OlMapObj;
};

export default function CesiumAdapterCore({
  map,
  enable3D,
  splitMode = false,
  cameraSyncOptions,
  vectorOptions = {},
  interactionSync = false,
  autoOrderLayers = true,
  onCameraChange,
}: Props) {
  const [cesiumViewer, setCesiumViewer] = useState<CesiumViewer | null>(null);
  const isActive3D = enable3D || splitMode;

  const { syncOlToCesium } = useCameraSync(
    map,
    isActive3D ? cesiumViewer : null,
    cameraSyncOptions,
    onCameraChange,
  );

  useLayerSync(map, isActive3D ? cesiumViewer : null, vectorOptions);
  useInteractionSync(
    map,
    isActive3D ? cesiumViewer : null,
    isActive3D ? interactionSync : false,
  );
  useAutoLayerOrder(map, autoOrderLayers);
  useOverlaySync(map, isActive3D ? cesiumViewer : null, isActive3D);

  // Ensure an initial camera sync even if the user doesn't move the 2D view.
  useEffect(() => {
    if (!isActive3D || !map || !cesiumViewer) return;
    const t = setTimeout(() => syncOlToCesium(), 0);
    return () => clearTimeout(t);
  }, [isActive3D, map, cesiumViewer, syncOlToCesium]);

  const handleCesiumReady = useCallback((viewer: CesiumViewer) => {
    setCesiumViewer(viewer);
  }, []);

  return <CesiumScene visible={isActive3D} onViewerReady={handleCesiumReady} />;
}
