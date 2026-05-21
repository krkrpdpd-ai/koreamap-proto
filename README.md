# 한국 2D 도트맵 게임 프로토타입

대한민국 지도를 배경으로 한 웹 Canvas 기반 도트맵 게임 프로토타입입니다.

## 실행

```powershell
python -m http.server 8000 --bind 127.0.0.1
```

브라우저에서 `http://127.0.0.1:8000/index.html`을 엽니다.

## 현재 기능

- 10km 격자 감각의 스크롤 가능한 대한민국 도트맵
- 제주도, 울릉도, 독도 등 주요 섬 표시
- 확대/축소 시 Canvas를 다시 렌더링해 아이콘과 텍스트 선명도 유지
- 시도 경계 표시/숨김 옵션
- 주요 도로, 강, 철도, 도시, 산봉우리, 산맥, 국립공원, 들판 밀도 패치 표시
- 방향키, WASD, 숫자패드 대각선 이동을 지원하는 작은 캐릭터

## 데이터 파이프라인

`src/data/korea-map-data.js`는 기본 게임용 fallback 데이터입니다. 화면의 실제 벡터 오버레이는 `tools/build-real-overlays.js`가 아래 원천을 읽어 `src/data/real-overlays.js`로 생성합니다.

- `data/geo/sgis-provinces.json`: SGIS 시도 경계. 현재 시도 경계와 land fill에 사용.
- `data/geo/hotosm-places/populated_places.geojson`: HOT/HDX 대한민국 OSM populated places 추출본. 도시/읍급 위치에 사용.
- `data/geo/hotosm-railways/railways.geojson`: HOT/HDX 대한민국 OSM railways 추출본. 철도/도시철도에 사용.
- `data/geo/arcgis-major-roads.geojson`: ArcGIS OSM Asia Highways GeoJSON. 주요 고속도로/국도에 사용.
- `data/geo/arcgis-major-rivers.geojson`: ArcGIS OSM Asia Waterways GeoJSON. 주요 강 경로와 폭 등급 산정에 사용.
- `data/geo/arcgis-peaks.geojson`: ArcGIS OSM Asia POIs peak GeoJSON. 산봉우리와 산맥 표현에 사용.
- `data/geo/arcgis-island-points.geojson`: ArcGIS OSM Asia POIs island/islet GeoJSON. 주요 섬 라벨 보정에 사용.
- `data/geo/arcgis-national-park-points.geojson`, `data/geo/arcgis-national-park-name-points.geojson`: ArcGIS OSM Asia POIs GeoJSON. 국립공원 위치 보정에 사용.
- `data/geo/arcgis-fields-sample.geojson`, `data/geo/arcgis-named-fields.geojson`: ArcGIS OSM Asia Landuse GeoJSON. 들판/농지 밀도 패치에 사용.

사용자의 요청에 따라 Overpass API 자료는 현재 빌드 파이프라인에서 사용하지 않습니다. OSM 계열 자료는 ODbL 라이선스 적용 대상이므로 배포 시 출처와 라이선스 표기가 필요합니다.
