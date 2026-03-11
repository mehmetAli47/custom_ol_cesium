import type OlMap from "ol/Map.js";
import type OlView from "ol/View.js";
import type OlBaseLayer from "ol/layer/Base.js";
import type OlFeature from "ol/Feature.js";
import type OlStyle from "ol/style/Style.js";
import type { Geometry as OlGeometry } from "ol/geom.js";

import type {
  Viewer as CesiumViewer,
  Camera as CesiumCamera,
  ImageryLayer as CesiumImageryLayer,
  Entity as CesiumEntity,
  CustomDataSource as CesiumDataSource,
  DataSource,
} from "cesium";

/* ─── View State ─── */
export interface ViewState {
  center: [number, number];
  zoom: number;
  rotation: number;
  tilt: number;
  extent?: [number, number, number, number];
}

/* ─── Vector Options ─── */
export interface VectorOptions {
  /** Enable polygon extrusion (height) */
  extrude?: boolean;
  /** Enable label rendering */
  label?: boolean;
  /** Enable billboard rendering for points */
  billboard?: boolean;
  /** Default extrusion height (meters) */
  extrudeHeight?: number;
  /** Enable lazy conversion (only visible features) */
  lazy?: boolean;
  /** Current view extent for filtering */
  extent?: import("ol/extent.js").Extent;
  /** Current map resolution (used for style functions) */
  resolution?: number;
}

/* ─── Style Options ─── */
export interface StyleOptions {
  /** Convert OL Circle style to Cesium Billboard */
  circleToBillboard?: boolean;
  /** Convert OL Fill to Cesium Polygon material */
  fillToPolygon?: boolean;
  /** Convert OL Stroke to Cesium Polyline material */
  strokeToPolyline?: boolean;
}

/* ─── Layer Mapping ─── */
export interface LayerMapping {
  olLayer: OlBaseLayer;
  cesiumLayer: CesiumImageryLayer | CesiumDataSource | null;
  type: "imagery" | "vector" | "unknown";
  visible: boolean;
  opacity: number;
}

/* ─── Converted Layer (generic) ─── */
export interface ConvertedLayer<T = CesiumImageryLayer | CesiumDataSource> {
  source: OlBaseLayer;
  target: T;
  type: "imagery" | "vector";
}

/* ─── Converted Feature (generic) ─── */
export interface ConvertedFeature<T = CesiumEntity> {
  source: OlFeature<OlGeometry>;
  target: T;
}

/* ─── Camera Sync Options ─── */
export interface CameraSyncOptions {
  /** Debounce time in ms to prevent infinite loops (default 100) */
  debounceMs?: number;
  /** Enable smooth fly-to animations */
  animate?: boolean;
  /** Animation duration in seconds */
  animationDuration?: number;
}

/* ─── Interaction Sync Options ─── */
export interface InteractionSyncOptions {
  /** Sync click events */
  click?: boolean;
  /** Sync hover events */
  hover?: boolean;
  /** Sync select events */
  select?: boolean;
}

/* ─── Main Adapter Props ─── */
export interface OlCesiumAdapterProps {
  /** OpenLayers Map instance */
  map: OlMap | null;
  /** Enable 3D mode */
  enable3D: boolean;
  /** Camera sync options */
  cameraSyncOptions?: CameraSyncOptions;
  /** Vector conversion options */
  vectorOptions?: VectorOptions;
  /** Style conversion options */
  styleOptions?: StyleOptions;
  /** Interaction sync */
  interactionSync?: boolean | InteractionSyncOptions;
  autoOrderLayers?: boolean;
  /** Split view mode (show 2D and 3D side-by-side) */
  splitMode?: boolean;
  /** Camera change callback */
  onCameraChange?: (viewState: ViewState) => void;
  /** When 3D mode is toggled */
  on3DToggle?: (enabled: boolean) => void;
}

/* ─── Adapter State ─── */
export interface AdapterState {
  is3D: boolean;
  cesiumViewer: CesiumViewer | null;
  layerMappings: LayerMapping[];
  viewState: ViewState;
}
