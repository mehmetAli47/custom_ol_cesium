/**
 * CesiumScene.tsx
 * Cesium Viewer wrapper — loaded dynamically only when 3D is enabled
 */
import React, {
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useState,
} from "react";
import { Viewer, Ion, createWorldTerrainAsync } from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";

// Optionally set Ion token via Vite env: VITE_CESIUM_ION_TOKEN
const ionToken = (import.meta as any).env?.VITE_CESIUM_ION_TOKEN as
  | string
  | undefined;
if (ionToken) {
  Ion.defaultAccessToken = ionToken;
}

export interface CesiumSceneProps {
  className?: string;
  style?: React.CSSProperties;
  visible?: boolean;
  enableTerrain?: boolean;
  onViewerReady?: (viewer: Viewer) => void;
}

export interface CesiumSceneRef {
  viewer: Viewer | null;
}

const CesiumScene = forwardRef<CesiumSceneRef, CesiumSceneProps>(
  (
    {
      className = "",
      style,
      visible = true,
      enableTerrain = false,
      onViewerReady,
    },
    ref,
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const viewerRef = useRef<Viewer | null>(null);
    const [isReady, setIsReady] = useState(false);

    useImperativeHandle(ref, () => ({ viewer: viewerRef.current }), [isReady]);

    // Initialize Cesium Viewer
    useEffect(() => {
      if (!containerRef.current || viewerRef.current) return;

      const viewer = new Viewer(containerRef.current, {
        animation: false,
        baseLayerPicker: false,
        fullscreenButton: false,
        geocoder: false,
        homeButton: false,
        infoBox: false,
        sceneModePicker: false,
        selectionIndicator: false,
        timeline: false,
        navigationHelpButton: false,
        navigationInstructionsInitiallyVisible: false,
        scene3DOnly: true,
        requestRenderMode: true,
        maximumRenderTimeChange: Infinity,
      });

      // Clear default imagery
      viewer.imageryLayers.removeAll();

      // Performance settings
      viewer.scene.globe.enableLighting = false;
      viewer.scene.fog.enabled = false;
      viewer.clock.shouldAnimate = false;
      (viewer as any).targetFrameRate = 30;
      if (viewer.scene.skyAtmosphere) {
        viewer.scene.skyAtmosphere.show = true;
      }
      viewer.scene.globe.showGroundAtmosphere = true;

      // Terrain
      if (enableTerrain) {
        createWorldTerrainAsync().then((terrain) => {
          if (!viewer.isDestroyed()) {
            viewer.terrainProvider = terrain;
          }
        });
      }

      viewerRef.current = viewer;
      setIsReady(true);
      onViewerReady?.(viewer);

      return () => {
        if (!viewer.isDestroyed()) {
          viewer.destroy();
        }
        viewerRef.current = null;
        setIsReady(false);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Handle visibility
    useEffect(() => {
      const viewer = viewerRef.current;
      if (!viewer || viewer.isDestroyed()) return;

      if (visible) {
        viewer.resize();
        viewer.scene.requestRender();
      }
    }, [visible]);

    return (
      <div
        ref={containerRef}
        className={`cesium-scene-container ${className}`}
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

CesiumScene.displayName = "CesiumScene";
export default CesiumScene;
