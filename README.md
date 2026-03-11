# custom-ol-cesium

OpenLayers (2D) ile CesiumJS (3D) arasinda kamera/katman senkronizasyonu icin adapter.

## Imperative Kullanim (ol-cesium tarzi)

Disarida bir OpenLayers `Map` olusturup, Cesium Viewer'i adapter ile kurarsin:

```ts
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { fromLonLat } from "ol/proj";

import { OLCesium } from "custom-ol-cesium";

const map = new Map({
  target: "ol-map",
  layers: [new TileLayer({ source: new OSM() })],
  view: new View({
    center: fromLonLat([29, 41]),
    zoom: 6,
  }),
});

const ol3d = new OLCesium({
  map,
  imageryProvider: false,
});

// 3D ac/kapat
ol3d.setEnabled(false);
ol3d.setEnabled(true);

// Cesium Viewer'a erisim
const viewer = ol3d.viewer_;
```

Notlar:
- `target` bir `HTMLElement` veya element `id` (string) olabilir.
- Cesium Ion token gerekiyorsa `VITE_CESIUM_ION_TOKEN` ile ver.

## React Kullanim (Kutuphaneden)

Hazir wrapper ile:

```tsx
<OlCesiumAdapter map={olMap} enable3D={true} splitMode={false} />
```

## Build

- Demo: `yarn build`
- Kutuphane (ESM + d.ts): `yarn build:lib` (cikti: `dist-lib/`)
