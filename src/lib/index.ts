/**
 * index.ts — Public API exports
 */

// Components
export { default as OlMap } from "./components/OlMap";
export { default as CesiumScene } from "./components/CesiumScene";
export { default as OlCesiumAdapter } from "./components/OlCesiumAdapter";

// Core (imperative, ol-cesium style)
export { OlCesium, type OlCesiumOptions } from "./core/OlCesium";
export { default as OLCesium, type OLCesiumOptions } from "./compat/OLCesium";
export { default } from "./compat/OLCesium";

// Hooks
export {
  useCameraSync,
  useLayerSync,
  useInteractionSync,
} from "./hooks/useOlCesium";

// Utilities
export { convertLayerToCesium, syncVisibility } from "./utils/layerConverters";

export {
  convertFeatureToEntity,
  convertFeaturesToDataSource,
} from "./utils/vectorConverters";

export {
  olColorToCesiumColor,
  convertFill,
  convertStroke,
  convertCircleStyle,
  convertIconStyle,
  convertTextStyle,
  mapStyleToCesiumStyle,
} from "./utils/styleConverters";

// Types
export type {
  ViewState,
  VectorOptions,
  StyleOptions,
  LayerMapping,
  ConvertedLayer,
  ConvertedFeature,
  CameraSyncOptions,
  InteractionSyncOptions,
  OlCesiumAdapterProps,
  AdapterState,
} from "./types/adapter";
