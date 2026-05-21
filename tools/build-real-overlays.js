const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const baseDataPath = path.join(root, "src", "data", "korea-map-data.js");
const sgisProvincesPath = path.join(root, "data", "geo", "sgis-provinces.json");
const hdxPlacesPath = path.join(root, "data", "geo", "hotosm-places", "populated_places.geojson");
const hdxRailwaysPath = path.join(root, "data", "geo", "hotosm-railways", "railways.geojson");
const roadPath = path.join(root, "data", "geo", "arcgis-korea-major-roads.geojson");
const riverPath = path.join(root, "data", "geo", "arcgis-major-rivers.geojson");
const peaksPath = path.join(root, "data", "geo", "arcgis-peaks.geojson");
const islandPointsPath = path.join(root, "data", "geo", "arcgis-island-points.geojson");
const nationalParkPointsPath = path.join(root, "data", "geo", "arcgis-national-park-points.geojson");
const nationalParkNamePointsPath = path.join(root, "data", "geo", "arcgis-national-park-name-points.geojson");
const naturalEarthCountriesPath = path.join(root, "data", "geo", "natural-earth-ne_10m_admin_0_countries.geojson");
const fieldsPath = path.join(root, "data", "geo", "arcgis-named-fields.geojson");
const fieldsSamplePath = path.join(root, "data", "geo", "arcgis-fields-sample.geojson");
const outPath = path.join(root, "src", "data", "real-overlays.js");

const source = fs.readFileSync(baseDataPath, "utf8");
const data = Function("window", `${source}; return window.KOREA_MAP_DATA;`)({});

const bounds = data.meta.bounds;
const tileKm = data.meta.tileKm;
const tilePx = data.meta.tilePx;
const kmPerDegLat = 111.32;
const kmPerDegLon = 111.32 * Math.cos((data.meta.midLat * Math.PI) / 180);
const margin = 70;
const mapWidth = Math.ceil(((bounds.east - bounds.west) * kmPerDegLon / tileKm) * tilePx) + margin * 2;
const mapHeight = Math.ceil(((bounds.north - bounds.south) * kmPerDegLat / tileKm) * tilePx) + margin * 2;

const existingByName = new Map(data.places.map((place) => [normalizeName(place.name), place]));
const existingMountainNames = new Set((data.mountains || []).map((mountain) => normalizeName(mountain.name)));

const islandSeeds = [
  { id: "baengnyeongdo", name: "백령도", lon: 124.64, lat: 37.96, icon: "island", labelWeight: 3 },
  { id: "daecheongdo", name: "대청도", lon: 124.71, lat: 37.83, icon: "island", labelWeight: 5 },
  { id: "yeonpyeongdo", name: "연평도", lon: 125.70, lat: 37.66, icon: "island", labelWeight: 5 },
  { id: "ganghwado", name: "강화도", lon: 126.43, lat: 37.70, icon: "island", labelWeight: 4 },
  { id: "yeongjongdo", name: "영종도", lon: 126.54, lat: 37.49, icon: "island", labelWeight: 5 },
  { id: "anmyeondo", name: "안면도", lon: 126.36, lat: 36.52, icon: "island", labelWeight: 5 },
  { id: "heuksando", name: "흑산도", lon: 125.43, lat: 34.68, icon: "island", labelWeight: 4 },
  { id: "hongdo", name: "홍도", lon: 125.19, lat: 34.68, icon: "island", labelWeight: 5 },
  { id: "gagodo", name: "가거도", lon: 125.12, lat: 34.08, icon: "island", labelWeight: 5 },
  { id: "jindo", name: "진도", lon: 126.26, lat: 34.48, icon: "island", labelWeight: 3 },
  { id: "wando", name: "완도", lon: 126.75, lat: 34.31, icon: "island", labelWeight: 4 },
  { id: "bogildo", name: "보길도", lon: 126.57, lat: 34.16, icon: "island", labelWeight: 5 },
  { id: "geumodo", name: "금오도", lon: 127.73, lat: 34.53, icon: "island", labelWeight: 5 },
  { id: "geomundo", name: "거문도", lon: 127.31, lat: 34.03, icon: "island", labelWeight: 5 },
  { id: "namhaedo", name: "남해도", lon: 127.90, lat: 34.84, icon: "island", labelWeight: 4 },
  { id: "geojedo", name: "거제도", lon: 128.62, lat: 34.88, icon: "island", labelWeight: 3 },
  { id: "jeju", name: "제주도", lon: 126.53, lat: 33.38, icon: "volcano", labelWeight: 3 },
  { id: "marado", name: "마라도", lon: 126.27, lat: 33.12, icon: "lighthouse", labelWeight: 5 },
  { id: "chujado", name: "추자도", lon: 126.30, lat: 33.96, icon: "island", labelWeight: 5 },
  { id: "ulleungdo", name: "울릉도", lon: 130.90, lat: 37.49, icon: "island", labelWeight: 1 },
  { id: "dokdo", name: "독도", lon: 131.87, lat: 37.24, icon: "lighthouse", labelWeight: 1 },
  { id: "deokjeokdo", name: "덕적도", lon: 126.15, lat: 37.23, icon: "island", labelWeight: 5 },
  { id: "jawoldo", name: "자월도", lon: 126.31, lat: 37.25, icon: "island", labelWeight: 6 },
  { id: "seungbongdo", name: "승봉도", lon: 126.30, lat: 37.17, icon: "island", labelWeight: 6 },
  { id: "sapsido", name: "삽시도", lon: 126.35, lat: 36.33, icon: "island", labelWeight: 6 },
  { id: "wonsando", name: "원산도", lon: 126.44, lat: 36.37, icon: "island", labelWeight: 6 },
  { id: "seonyudo-gunsan", name: "선유도", lon: 126.41, lat: 35.81, icon: "island", labelWeight: 5 },
  { id: "munyeodo", name: "무녀도", lon: 126.42, lat: 35.81, icon: "island", labelWeight: 6 },
  { id: "jangjado", name: "장자도", lon: 126.40, lat: 35.81, icon: "island", labelWeight: 6 },
  { id: "imjado", name: "임자도", lon: 126.10, lat: 35.08, icon: "island", labelWeight: 5 },
  { id: "jeungdo", name: "증도", lon: 126.14, lat: 35.00, icon: "island", labelWeight: 5 },
  { id: "jaeundo", name: "자은도", lon: 126.05, lat: 34.89, icon: "island", labelWeight: 6 },
  { id: "amtaedo", name: "암태도", lon: 126.12, lat: 34.86, icon: "island", labelWeight: 6 },
  { id: "anjwado", name: "안좌도", lon: 126.12, lat: 34.75, icon: "island", labelWeight: 6 },
  { id: "hauido", name: "하의도", lon: 126.04, lat: 34.62, icon: "island", labelWeight: 6 },
  { id: "bigeumdo", name: "비금도", lon: 125.94, lat: 34.76, icon: "island", labelWeight: 5 },
  { id: "dochodo", name: "도초도", lon: 125.96, lat: 34.70, icon: "island", labelWeight: 5 },
  { id: "jangsando", name: "장산도", lon: 126.16, lat: 34.64, icon: "island", labelWeight: 6 },
  { id: "jodo", name: "조도", lon: 126.00, lat: 34.30, icon: "island", labelWeight: 5 },
  { id: "gwanmaedo", name: "관매도", lon: 126.05, lat: 34.25, icon: "island", labelWeight: 6 },
  { id: "cheongsando", name: "청산도", lon: 126.87, lat: 34.18, icon: "island", labelWeight: 4 },
  { id: "soando", name: "소안도", lon: 126.64, lat: 34.16, icon: "island", labelWeight: 5 },
  { id: "nohwado", name: "노화도", lon: 126.57, lat: 34.19, icon: "island", labelWeight: 6 },
  { id: "saengildo", name: "생일도", lon: 126.96, lat: 34.32, icon: "island", labelWeight: 6 },
  { id: "geumdangdo", name: "금당도", lon: 127.03, lat: 34.40, icon: "island", labelWeight: 6 },
  { id: "geogeumdo", name: "거금도", lon: 127.13, lat: 34.46, icon: "island", labelWeight: 5 },
  { id: "sorokdo", name: "소록도", lon: 127.12, lat: 34.51, icon: "island", labelWeight: 6 },
  { id: "dolsando", name: "돌산도", lon: 127.75, lat: 34.63, icon: "island", labelWeight: 5 },
  { id: "baekyado", name: "백야도", lon: 127.64, lat: 34.61, icon: "island", labelWeight: 6 },
  { id: "sado", name: "사도", lon: 127.55, lat: 34.58, icon: "island", labelWeight: 6 },
  { id: "sonjukdo", name: "손죽도", lon: 127.36, lat: 34.29, icon: "island", labelWeight: 6 },
  { id: "chodo", name: "초도", lon: 127.24, lat: 34.24, icon: "island", labelWeight: 6 },
  { id: "yokjido", name: "욕지도", lon: 128.25, lat: 34.63, icon: "island", labelWeight: 5 },
  { id: "yeonhwado", name: "연화도", lon: 128.36, lat: 34.65, icon: "island", labelWeight: 6 },
  { id: "hansando", name: "한산도", lon: 128.49, lat: 34.77, icon: "island", labelWeight: 4 },
  { id: "bijindo", name: "비진도", lon: 128.46, lat: 34.72, icon: "island", labelWeight: 6 },
  { id: "maemuldo", name: "매물도", lon: 128.58, lat: 34.64, icon: "island", labelWeight: 5 },
  { id: "saryangdo", name: "사량도", lon: 128.21, lat: 34.85, icon: "island", labelWeight: 5 },
  { id: "mireukdo", name: "미륵도", lon: 128.41, lat: 34.81, icon: "island", labelWeight: 6 },
  { id: "gadeokdo", name: "가덕도", lon: 128.83, lat: 35.02, icon: "island", labelWeight: 5 },
  { id: "udo-jeju", name: "우도", lon: 126.95, lat: 33.50, icon: "island", labelWeight: 5 },
  { id: "biyangdo", name: "비양도", lon: 126.23, lat: 33.41, icon: "island", labelWeight: 6 },
  { id: "gapado", name: "가파도", lon: 126.27, lat: 33.17, icon: "island", labelWeight: 6 },
  { id: "chagwido", name: "차귀도", lon: 126.15, lat: 33.31, icon: "island", labelWeight: 6 }
];

const nationalParkSeeds = [
  { id: "jirisan", name: "지리산국립공원", aliases: ["지리산"], lon: 127.73, lat: 35.34, radius: 44, labelWeight: 1 },
  { id: "gyeongju", name: "경주국립공원", aliases: ["경주"], lon: 129.22, lat: 35.79, radius: 26, labelWeight: 3 },
  { id: "gyeryongsan", name: "계룡산국립공원", aliases: ["계룡산"], lon: 127.20, lat: 36.35, radius: 24, labelWeight: 3 },
  {
    id: "hallyeohaesang",
    name: "한려해상국립공원",
    aliases: ["한려해상"],
    lon: 128.00,
    lat: 34.73,
    radius: 42,
    labelWeight: 2,
    marine: true,
    icon: "wave",
    zones: [
      { lon: 128.00, lat: 34.73, radius: 42 },
      { lon: 128.39, lat: 34.76, radius: 36 },
      { lon: 128.58, lat: 34.82, radius: 34 }
    ],
    description: "남해안의 섬, 바다, 리아스식 해안이 이어지는 해상 국립공원입니다. 여수-사천-통영-거제 주변 해역을 게임 지도에서 섬 탐험과 해상 항로 이벤트의 중심 구역으로 쓰기 좋습니다."
  },
  { id: "seoraksan", name: "설악산국립공원", aliases: ["설악산"], lon: 128.47, lat: 38.12, radius: 38, labelWeight: 1 },
  { id: "songnisan", name: "속리산국립공원", aliases: ["속리산"], lon: 127.86, lat: 36.54, radius: 28, labelWeight: 2 },
  { id: "hallasan", name: "한라산국립공원", aliases: ["한라산"], lon: 126.53, lat: 33.36, radius: 36, labelWeight: 1 },
  { id: "naejangsan", name: "내장산국립공원", aliases: ["내장산"], lon: 126.93, lat: 35.49, radius: 24, labelWeight: 3 },
  { id: "gayasan", name: "가야산국립공원", aliases: ["가야산"], lon: 128.14, lat: 35.80, radius: 26, labelWeight: 3 },
  { id: "deogyusan", name: "덕유산국립공원", aliases: ["덕유산"], lon: 127.75, lat: 35.86, radius: 34, labelWeight: 2 },
  { id: "odaesan", name: "오대산국립공원", aliases: ["오대산"], lon: 128.59, lat: 37.79, radius: 32, labelWeight: 2 },
  { id: "juwangsan", name: "주왕산국립공원", aliases: ["주왕산"], lon: 129.14, lat: 36.39, radius: 24, labelWeight: 3 },
  {
    id: "taean",
    name: "태안해안국립공원",
    aliases: ["태안해안"],
    lon: 126.29,
    lat: 36.75,
    radius: 34,
    labelWeight: 3,
    marine: true,
    icon: "wave",
    description: "서해안의 사구, 갯벌, 해안 숲이 중심인 해안 국립공원입니다. 태안반도와 안면도 주변을 해안 지형과 조수 간만 이벤트 구역으로 표현하기 좋습니다."
  },
  {
    id: "dadohae",
    name: "다도해해상국립공원",
    aliases: ["다도해해상"],
    lon: 126.75,
    lat: 34.32,
    radius: 44,
    labelWeight: 2,
    marine: true,
    icon: "wave",
    zones: [
      { lon: 125.43, lat: 34.68, radius: 36 },
      { lon: 126.05, lat: 34.34, radius: 38 },
      { lon: 126.74, lat: 34.25, radius: 44 },
      { lon: 127.34, lat: 34.27, radius: 36 },
      { lon: 127.47, lat: 34.47, radius: 34 }
    ],
    description: "전남 남해의 여러 섬과 해역을 아우르는 국내 최대 규모의 해상 국립공원입니다. 흑산도, 홍도, 조도, 완도, 거문도권처럼 분산된 섬 권역을 항해와 섬 탐험 콘텐츠로 연결하기 좋습니다."
  },
  { id: "bukhansan", name: "북한산국립공원", aliases: ["북한산"], lon: 126.99, lat: 37.62, radius: 22, labelWeight: 2 },
  { id: "chiaksan", name: "치악산국립공원", aliases: ["치악산"], lon: 128.05, lat: 37.36, radius: 26, labelWeight: 3 },
  { id: "woraksan", name: "월악산국립공원", aliases: ["월악산"], lon: 128.12, lat: 36.86, radius: 30, labelWeight: 3 },
  { id: "sobaeksan", name: "소백산국립공원", aliases: ["소백산"], lon: 128.49, lat: 36.90, radius: 32, labelWeight: 2 },
  { id: "byeonsanbando", name: "변산반도국립공원", aliases: ["변산반도"], lon: 126.59, lat: 35.65, radius: 24, labelWeight: 4 },
  { id: "wolchulsan", name: "월출산국립공원", aliases: ["월출산"], lon: 126.70, lat: 34.76, radius: 22, labelWeight: 4 },
  { id: "mudeungsan", name: "무등산국립공원", aliases: ["무등산"], lon: 126.99, lat: 35.13, radius: 24, labelWeight: 3 },
  { id: "taebaeksan", name: "태백산국립공원", aliases: ["태백산"], lon: 128.92, lat: 37.10, radius: 28, labelWeight: 3 },
  { id: "palgongsan", name: "팔공산국립공원", aliases: ["팔공산"], lon: 128.70, lat: 36.02, radius: 28, labelWeight: 3 }
];

const countySeeds = [
  ["Boeun-gun", "보은군", "충북"],
  ["Bonghwa-gun", "봉화군", "경북"],
  ["Boseong-gun", "보성군", "전남"],
  ["Buan-gun", "부안군", "전북"],
  ["Buyeo-gun", "부여군", "충남"],
  ["Changnyeong-gun", "창녕군", "경남"],
  ["Cheongdo-gun", "청도군", "경북"],
  ["Cheongsong-gun", "청송군", "경북"],
  ["Cheongyang-gun", "청양군", "충남"],
  ["Cheorwon-gun", "철원군", "강원"],
  ["Chilgok-gun", "칠곡군", "경북"],
  ["Dalseong-gun", "달성군", "대구"],
  ["Damyang-gun", "담양군", "전남"],
  ["Danyang-gun", "단양군", "충북"],
  ["Eumseong-gun", "음성군", "충북"],
  ["Ganghwa-gun", "강화군", "인천"],
  ["Gangjin-gun", "강진군", "전남"],
  ["Gapyeong-gun", "가평군", "경기"],
  ["Geochang-gun", "거창군", "경남"],
  ["Geumsan-gun", "금산군", "충남"],
  ["Gijang-gun", "기장군", "부산"],
  ["Gochang-gun", "고창군", "전북"],
  ["Goesan-gun", "괴산군", "충북"],
  ["Goheung-gun", "고흥군", "전남"],
  ["Gokseong-gun", "곡성군", "전남"],
  ["Goryeong-gun", "고령군", "경북"],
  ["Goseong-gun", "고성군(강원)", "강원", { sourceAdm1s: ["Gangwon"] }],
  ["Goseong-gun", "고성군(경남)", "경남", { sourceAdm1s: ["South Gyeongsang"] }],
  ["Gunwi-gun", "군위군", "대구"],
  ["Gurye-gun", "구례군", "전남"],
  ["Hadong-gun", "하동군", "경남"],
  ["Haenam-gun", "해남군", "전남"],
  ["Haman-gun", "함안군", "경남"],
  ["Hampyeong-gun", "함평군", "전남"],
  ["Hamyang-gun", "함양군", "경남"],
  ["Hapcheon-gun", "합천군", "경남"],
  ["Hoengseong-gun", "횡성군", "강원"],
  ["Hongcheon-gun", "홍천군", "강원"],
  ["Hongseong-gun", "홍성군", "충남"],
  ["Hwacheon-gun", "화천군", "강원"],
  ["Hwasun-gun", "화순군", "전남"],
  ["Imsil-gun", "임실군", "전북"],
  ["Inje-gun", "인제군", "강원"],
  ["Jangheung-gun", "장흥군", "전남"],
  ["Jangseong-gun", "장성군", "전남"],
  ["Jangsu-gun", "장수군", "전북"],
  ["Jeongseon-gun", "정선군", "강원"],
  ["Jeungpyeong-gun", "증평군", "충북"],
  ["Jinan-gun", "진안군", "전북"],
  ["Jincheon-gun", "진천군", "충북"],
  ["Jindo-gun", "진도군", "전남"],
  ["Muan-gun", "무안군", "전남"],
  ["Muju-gun", "무주군", "전북"],
  ["Namhae-gun", "남해군", "경남"],
  ["Okcheon-gun", "옥천군", "충북"],
  ["Ongjin-gun", "옹진군", "인천"],
  ["Pyeongchang-gun", "평창군", "강원"],
  ["Sancheong-gun", "산청군", "경남"],
  ["Seocheon-gun", "서천군", "충남"],
  ["Seongju-gun", "성주군", "경북"],
  ["Sinan-gun", "신안군", "전남"],
  ["Sunchang-gun", "순창군", "전북"],
  ["Taean-gun", "태안군", "충남"],
  ["Uiryeong-gun", "의령군", "경남"],
  ["Uiseong-gun", "의성군", "경북"],
  ["Uljin-gun", "울진군", "경북"],
  ["Ulju-gun", "울주군", "울산"],
  ["Ulleung-gun", "울릉군", "경북"],
  ["Wando-gun", "완도군", "전남"],
  ["Wanju-gun", "완주군", "전북"],
  ["Yanggu-gun", "양구군", "강원"],
  ["Yangpyeong-gun", "양평군", "경기"],
  ["Yangyang-gun", "양양군", "강원"],
  ["Yecheon-gun", "예천군", "경북"],
  ["Yeoncheon-gun", "연천군", "경기"],
  ["Yeongam-gun", "영암군", "전남"],
  ["Yeongdeok-gun", "영덕군", "경북"],
  ["Yeongdong-gun", "영동군", "충북"],
  ["Yeonggwang-gun", "영광군", "전남", { lon: 126.512, lat: 35.277 }],
  ["Yeongwol-gun", "영월군", "강원"],
  ["Yeongyang-gun", "영양군", "경북"],
  ["Yesan-gun", "예산군", "충남"]
].map(([adm2, name, province, options], index) => ({
  adm2,
  name,
  province,
  labelWeight: 5,
  id: `${adm2}-${index}`,
  ...(options || {})
}));

const majorRailwayGapTolerances = new Map([
  ["경부선", 95],
  ["경부고속선", 95],
  ["호남선", 90],
  ["호남고속선", 75],
  ["전라선", 90],
  ["중앙선", 90],
  ["동해선", 70],
  ["경전선", 90],
  ["장항선", 90],
  ["서해선", 65],
  ["영동선", 65],
  ["태백선", 65],
  ["경강선", 75],
  ["경춘선", 65],
  ["경원선", 65],
  ["경의선", 65],
  ["중부내륙선", 65],
  ["수서평택고속선", 65],
  ["인천국제공항선", 65]
]);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function toWorld(lon, lat) {
  return [
    margin + (((lon - bounds.west) * kmPerDegLon) / tileKm) * tilePx,
    margin + (((bounds.north - lat) * kmPerDegLat) / tileKm) * tilePx
  ];
}

function epsg5179ToLonLat(x, y) {
  const a = 6378137;
  const f = 1 / 298.257222101;
  const e2 = 2 * f - f * f;
  const ep2 = e2 / (1 - e2);
  const k0 = 0.9996;
  const lat0 = radians(38);
  const lon0 = radians(127.5);
  const falseEasting = 1000000;
  const falseNorthing = 2000000;
  const e4 = e2 * e2;
  const e6 = e4 * e2;
  const m0 =
    a *
    ((1 - e2 / 4 - (3 * e4) / 64 - (5 * e6) / 256) * lat0 -
      ((3 * e2) / 8 + (3 * e4) / 32 + (45 * e6) / 1024) * Math.sin(2 * lat0) +
      ((15 * e4) / 256 + (45 * e6) / 1024) * Math.sin(4 * lat0) -
      ((35 * e6) / 3072) * Math.sin(6 * lat0));
  const m = m0 + (y - falseNorthing) / k0;
  const mu = m / (a * (1 - e2 / 4 - (3 * e4) / 64 - (5 * e6) / 256));
  const e1 = (1 - Math.sqrt(1 - e2)) / (1 + Math.sqrt(1 - e2));
  const phi1 =
    mu +
    ((3 * e1) / 2 - (27 * Math.pow(e1, 3)) / 32) * Math.sin(2 * mu) +
    ((21 * e1 * e1) / 16 - (55 * Math.pow(e1, 4)) / 32) * Math.sin(4 * mu) +
    ((151 * Math.pow(e1, 3)) / 96) * Math.sin(6 * mu) +
    ((1097 * Math.pow(e1, 4)) / 512) * Math.sin(8 * mu);

  const sin1 = Math.sin(phi1);
  const cos1 = Math.cos(phi1);
  const tan1 = Math.tan(phi1);
  const c1 = ep2 * cos1 * cos1;
  const t1 = tan1 * tan1;
  const n1 = a / Math.sqrt(1 - e2 * sin1 * sin1);
  const r1 = (a * (1 - e2)) / Math.pow(1 - e2 * sin1 * sin1, 1.5);
  const d = (x - falseEasting) / (n1 * k0);
  const lat =
    phi1 -
    ((n1 * tan1) / r1) *
      (d * d / 2 -
        ((5 + 3 * t1 + 10 * c1 - 4 * c1 * c1 - 9 * ep2) * Math.pow(d, 4)) / 24 +
        ((61 + 90 * t1 + 298 * c1 + 45 * t1 * t1 - 252 * ep2 - 3 * c1 * c1) * Math.pow(d, 6)) / 720);
  const lon =
    lon0 +
    (d -
      ((1 + 2 * t1 + c1) * Math.pow(d, 3)) / 6 +
      ((5 - 2 * c1 + 28 * t1 - 3 * c1 * c1 + 8 * ep2 + 24 * t1 * t1) * Math.pow(d, 5)) / 120) /
      cos1;
  return [degrees(lon), degrees(lat)];
}

function buildSgisProvinces() {
  const geojson = readJson(sgisProvincesPath);
  return (geojson.features || [])
    .map((feature) => {
      const province = {
        id: String(feature.properties?.id || feature.id || ""),
        name: feature.properties?.title || feature.properties?.name || "province",
        source: "SGIS",
        rings: []
      };

      for (const ring of sgisRings(feature.geometry)) {
        const world = ring
          .map(([x, y]) => epsg5179ToLonLat(x, y))
          .map(([lon, lat]) => toWorld(lon, lat));
        const simplified = closeRing(simplify(world, 1.2).map(roundPoint));
        if (simplified.length >= 4 && ringArea(simplified) > 8) province.rings.push(simplified);
      }

      return province;
    })
    .filter((province) => province.rings.length > 0)
    .sort((a, b) => a.id.localeCompare(b.id));
}

function buildCountryLand() {
  if (!fs.existsSync(naturalEarthCountriesPath)) return [];

  const accepted = new Set(["KOR", "PRK", "JPN"]);
  const geojson = readJson(naturalEarthCountriesPath);
  return (geojson.features || [])
    .filter((feature) => accepted.has(feature.properties?.ISO_A3))
    .map((feature) => {
      const props = feature.properties || {};
      const country = {
        id: props.ISO_A3,
        name: props.ADMIN || props.NAME || props.ISO_A3,
        source: "Natural Earth Admin 0 Countries 1:10m",
        rings: []
      };

      for (const ring of geoPolygonRings(feature.geometry)) {
        const world = ring.map(([lon, lat]) => toWorld(lon, lat));
        const simplified = closeRing(simplify(world, 0.8).map(roundPoint));
        if (simplified.length >= 4 && ringArea(simplified) > 8 && ringIntersectsCanvas(simplified)) {
          country.rings.push(simplified);
        }
      }

      return country;
    })
    .filter((country) => country.rings.length > 0)
    .sort((a, b) => a.id.localeCompare(b.id));
}

function sgisRings(geometry) {
  if (!geometry) return [];
  if (geometry.type === "Polygon") return geometry.coordinates || [];
  if (geometry.type === "MultiPolygon") return (geometry.coordinates || []).flat();
  return [];
}

function pointInPolygon(point, polygon) {
  const [x, y] = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0];
    const yi = polygon[i][1];
    const xj = polygon[j][0];
    const yj = polygon[j][1];
    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function pointInProvinces(point, provinces) {
  return provinces.some((province) => province.rings.some((ring) => pointInPolygon(point, ring)));
}

function lineTouchesProvinces(points, provinces) {
  return points.some((point) => pointInProvinces(point, provinces));
}

function geoLineStrings(geometry) {
  if (!geometry) return [];
  if (geometry.type === "LineString") return [geometry.coordinates];
  if (geometry.type === "MultiLineString") return geometry.coordinates;
  return [];
}

function geoPolygonRings(geometry) {
  if (!geometry) return [];
  if (geometry.type === "Polygon") return geometry.coordinates;
  if (geometry.type === "MultiPolygon") return geometry.coordinates.flat();
  return [];
}

function convertLineFeature(feature, type, provinces, options = {}) {
  const lines = [];
  const props = feature.properties || {};
  for (const coords of geoLineStrings(feature.geometry)) {
    if (coords.length < 2) continue;
    const world = coords.map(([lon, lat]) => toWorld(lon, lat));
    if (!lineTouchesProvinces(world, provinces)) continue;

    const simplified = simplify(world, options.tolerance || 0.9).map(roundPoint);
    if (simplified.length < 2) continue;

    const lengthKm = geographicLengthKm(coords.map(([lon, lat]) => ({ lon, lat })));
    const riverWidth = type === "river" ? riverWidthInfo(props, lengthKm) : null;
    const line = {
      id: String(props.id || props.osm_id2 || props.OBJECTID || props.objectid || `${type}-${lines.length}`),
      name: type === "road" ? roadDisplayName(props) : pickName(props) || props.ref || type,
      type,
      class: type === "road" ? roadClass(feature) : type,
      path: simplified,
      length: Math.round(props.Shape__Length || lengthKm * 1000 || pathLength(simplified)),
      lengthKm: round(lengthKm)
    };

    if (riverWidth) {
      line.widthMeters = Math.round(riverWidth.meters);
      line.widthSource = riverWidth.source;
      line.displayWidth = riverDisplayWidth(riverWidth.meters);
    }

    lines.push(line);
  }
  return lines;
}

function buildRoads(provinces) {
  const raw = readJson(roadPath).features
    .filter(keepMajorRoadFeature)
    .flatMap((feature) => convertLineFeature(feature, "road", provinces, { tolerance: 0.55 }));
  return mergeLines(dedupeLines(raw), 4.5, { genericNames: new Set(["road", "national", "expressway"]) })
    .filter(keepDisplayRoad)
    .sort((a, b) => roadClassRank(a.class) - roadClassRank(b.class) || (b.length || 0) - (a.length || 0));
}

function buildRivers(provinces) {
  const raw = readJson(riverPath).features.flatMap((feature) => convertLineFeature(feature, "river", provinces, { tolerance: 0.55 }));
  return stitchMajorRiverGaps(mergeLines(dedupeLines(raw), 4.5, { genericNames: new Set(["river", "stream", "waterway"]) }).map(refreshMergedRiverWidth))
    .map(refreshMergedRiverWidth)
    .filter(keepDisplayRiver)
    .sort((a, b) => (b.displayWidth || 0) - (a.displayWidth || 0) || (b.length || 0) - (a.length || 0))
    .slice(0, 220)
    .sort((a, b) => (b.length || 0) - (a.length || 0));
}

function stitchMajorRiverGaps(rivers) {
  const grouped = new Map();
  const passthrough = [];

  for (const river of rivers) {
    const tolerance = riverGapTolerance(river.name);
    if (!tolerance) {
      passthrough.push(river);
      continue;
    }
    const key = normalizeName(river.name);
    if (!grouped.has(key)) grouped.set(key, { tolerance, rivers: [] });
    grouped.get(key).rivers.push(river);
  }

  return passthrough.concat([...grouped.values()].flatMap((group) => stitchRiverGroup(group.rivers, group.tolerance)));
}

function riverGapTolerance(name) {
  const compact = String(name || "").replace(/\s+/g, "");
  if (/서낙동강|seonakdong/i.test(compact)) return 0;
  if (/낙동강|nakdong/i.test(compact)) return 90;
  return 0;
}

function stitchRiverGroup(rivers, tolerance) {
  const pending = rivers.map((river) => ({ ...river, path: river.path.map((point) => point.slice()) }));
  const stitched = [];

  while (pending.length) {
    const current = pending.pop();
    let changed = true;
    while (changed) {
      changed = false;
      for (let i = pending.length - 1; i >= 0; i--) {
        const joined = joinPathsWithGap(current.path, pending[i].path, tolerance);
        if (!joined) continue;
        current.path = joined.path;
        current.length = Math.round((current.length || 0) + (pending[i].length || 0) + joined.gapKm * 1000);
        current.lengthKm = round((current.lengthKm || 0) + (pending[i].lengthKm || 0) + joined.gapKm);
        current.stitchedGaps = (current.stitchedGaps || 0) + (pending[i].stitchedGaps || 0) + (joined.stitched ? 1 : 0);
        mergeLineMetadata(current, pending[i]);
        pending.splice(i, 1);
        changed = true;
        break;
      }
    }
    stitched.push(current);
  }

  return stitched.sort((a, b) => (b.length || 0) - (a.length || 0));
}

function riverWidthInfo(props, lengthKm) {
  const tagged = parseMeters(props.width);
  if (tagged) return { meters: tagged, source: "osm-width-tag" };

  const name = `${pickName(props)} ${props.name || ""} ${props.name_en || ""}`;
  const named = namedRiverWidth(name);
  if (named) return { meters: named, source: "named-river-estimate" };

  if (lengthKm >= 80) return { meters: 120, source: "length-estimate" };
  if (lengthKm >= 45) return { meters: 80, source: "length-estimate" };
  if (lengthKm >= 22) return { meters: 45, source: "length-estimate" };
  if (lengthKm >= 10) return { meters: 24, source: "length-estimate" };
  return { meters: 14, source: "length-estimate" };
}

function parseMeters(value) {
  if (value === null || value === undefined || value === "") return 0;
  const text = String(value).toLowerCase().replace(/,/g, ".").trim();
  const match = text.match(/\d+(?:\.\d+)?/);
  if (!match) return 0;
  const number = Number(match[0]);
  if (!Number.isFinite(number) || number <= 0) return 0;
  if (text.includes("km")) return number * 1000;
  if (text.includes("ft") || text.includes("feet")) return number * 0.3048;
  return number;
}

function namedRiverWidth(name) {
  const rules = [
    [/북한강|bukhan/i, 190],
    [/남한강|namhan/i, 190],
    [/한강|hangang|han river/i, 850],
    [/낙동강|nakdong/i, 520],
    [/금강|geum river|geumgang/i, 360],
    [/영산강|yeongsan/i, 260],
    [/섬진강|seomjin/i, 230],
    [/임진강|imjin/i, 210],
    [/소양강|soyang/i, 120],
    [/안성천|anseong/i, 90],
    [/태화강|taehwa/i, 85],
    [/형산강|hyeongsan/i, 80],
    [/탐진강|tamjin/i, 70],
    [/만경강|mangyeong/i, 70],
    [/동진강|dongjin/i, 65],
    [/밀양강|miryang/i, 60],
    [/홍천강|hongcheon/i, 55],
    [/갑천|gapcheon/i, 45],
    [/청계천|cheonggye/i, 28]
  ];
  const rule = rules.find(([pattern]) => pattern.test(name));
  return rule ? rule[1] : 0;
}

function riverDisplayWidth(widthMeters) {
  if (widthMeters >= 600) return 8.2;
  if (widthMeters >= 350) return 7.2;
  if (widthMeters >= 180) return 6.2;
  if (widthMeters >= 90) return 5.2;
  if (widthMeters >= 45) return 4.3;
  if (widthMeters >= 20) return 3.4;
  return 2.6;
}

function refreshMergedRiverWidth(river) {
  if (river.widthSource !== "length-estimate") return river;
  const width = riverWidthInfo({ name: river.name }, river.lengthKm || 0);
  river.widthMeters = Math.round(width.meters);
  river.widthSource = width.source;
  river.displayWidth = riverDisplayWidth(width.meters);
  return river;
}

function keepDisplayRiver(river) {
  const lengthKm = river.lengthKm || 0;
  if (lengthKm < 18) return false;
  if (isMajorDisplayRiver(river.name) && lengthKm >= 20) return true;
  if ((river.displayWidth || 0) >= 6.2 && lengthKm >= 35) return true;
  if ((river.displayWidth || 0) >= 5.2 && lengthKm >= 90) return true;
  return lengthKm >= 160;
}

function isMajorDisplayRiver(name) {
  const compact = String(name || "").replace(/\s+/g, "");
  const majorNames = [
    "한강",
    "낙동강",
    "금강",
    "영산강",
    "섬진강",
    "북한강",
    "남한강",
    "임진강",
    "림진강",
    "소양강",
    "한탄강",
    "남강",
    "금호강",
    "황강",
    "평창강",
    "보성강",
    "홍천강",
    "태화강",
    "형산강",
    "탐진강",
    "만경강",
    "동진강",
    "안성천",
    "미호강",
    "위천",
    "달천",
    "내성천",
    "반변천",
    "섬강",
    "삽교천",
    "동강",
    "서낙동강"
  ];
  return majorNames.some((major) => compact === major || compact.includes(`/${major}`) || compact.includes(`${major}/`));
}

function buildRailways(provinces) {
  const accepted = new Set(["rail", "subway", "light_rail", "tram", "monorail", "narrow_gauge"]);
  const raw = [];
  for (const feature of readJson(hdxRailwaysPath).features || []) {
    const props = feature.properties || {};
    const railway = props.railway || "rail";
    if (!accepted.has(railway)) continue;

    for (const coords of geoLineStrings(feature.geometry)) {
      if (coords.length < 2) continue;
      const world = coords.map(([lon, lat]) => toWorld(lon, lat));
      if (!lineTouchesProvinces(world, provinces)) continue;

      const lengthKm = geographicLengthKm(coords.map(([lon, lat]) => ({ lon, lat })));
      if ((railway === "rail" && lengthKm < 1.2) || (railway !== "rail" && lengthKm < 0.35)) continue;
      if (!pickName(props) && lengthKm < 4) continue;

      const simplified = simplify(world, railway === "rail" ? 0.8 : 0.6).map(roundPoint);
      if (simplified.length < 2) continue;

      raw.push({
        id: String(props.id || props.osm_id2 || `rail-${raw.length}`),
        name: pickName(props) || railway,
        type: "railway",
        class: railway,
        path: simplified,
        length: Math.round(pathLength(simplified)),
        lengthKm: round(lengthKm)
      });
    }
  }
  return stitchMajorRailwayGaps(mergeLines(dedupeLines(raw), 20, { genericNames: new Set(["rail", "railway", "subway", "light_rail", "tram"]) }));
}

function stitchMajorRailwayGaps(railways) {
  const grouped = new Map();
  const passthrough = [];

  for (const railway of railways) {
    if (railway.class !== "rail") {
      passthrough.push(railway);
      continue;
    }

    const canonicalName = canonicalRailwayName(railway.name);
    const tolerance = railwayGapTolerance(canonicalName);
    if (!tolerance) {
      passthrough.push(railway);
      continue;
    }
    if ((railway.lengthKm || 0) < 5) {
      passthrough.push(railway);
      continue;
    }

    if (!grouped.has(canonicalName)) grouped.set(canonicalName, { name: canonicalName, tolerance, railways: [] });
    grouped.get(canonicalName).railways.push({
      ...railway,
      name: canonicalName,
      path: railway.path.map((point) => point.slice())
    });
  }

  return passthrough.concat([...grouped.values()].flatMap((group) => stitchRailwayGroup(group.railways, group.tolerance, group.name)));
}

function canonicalRailwayName(name) {
  const text = String(name || "").replace(/\s+/g, "");
  if (/연결선로/.test(text)) return text;
  if (text === "경부본선") return "경부선";
  if (text === "호남본선") return "호남선";
  return text;
}

function railwayGapTolerance(name) {
  return majorRailwayGapTolerances.get(name) || 0;
}

function stitchRailwayGroup(railways, tolerance, name) {
  const pending = railways.map((railway) => ({ ...railway, path: railway.path.map((point) => point.slice()) }));
  const stitched = [];

  while (pending.length) {
    const current = pending.pop();
    let changed = true;
    while (changed) {
      changed = false;
      for (let i = pending.length - 1; i >= 0; i--) {
        const joined = joinPathsWithGap(current.path, pending[i].path, tolerance);
        if (!joined) continue;
        current.path = joined.path;
        current.name = name;
        current.length = Math.round(pathLength(current.path));
        current.lengthKm = round((current.lengthKm || 0) + (pending[i].lengthKm || 0) + joined.gapKm);
        current.stitchedGaps = (current.stitchedGaps || 0) + (pending[i].stitchedGaps || 0) + (joined.stitched ? 1 : 0);
        pending.splice(i, 1);
        changed = true;
        break;
      }
    }
    stitched.push(current);
  }

  return filterStitchedRailwayComponents(stitched.sort((a, b) => (b.lengthKm || 0) - (a.lengthKm || 0)));
}

function filterStitchedRailwayComponents(railways) {
  if (railways.length <= 1) return railways;

  const longestLengthKm = railways[0].lengthKm || 0;
  if (longestLengthKm < 50) return railways;

  return railways.filter((railway, index) => index === 0 || (railway.lengthKm || 0) >= 18);
}

function buildPlaces(provinces) {
  const places = [];
  const matchedBasePlaces = new Set();

  for (const province of provinces) {
    const point = provinceLabelPoint(province);
    const existing = existingByName.get(normalizeName(province.name));
    places.push({
      id: `province-${province.id}`,
      name: province.name,
      kind: "province",
      icon: existing?.icon || iconForName(province.name),
      motif: "시도 경계",
      labelWeight: 1,
      point: point.map(round)
    });
  }

  for (const feature of readJson(hdxPlacesPath).features || []) {
    if (feature.geometry?.type !== "Point") continue;
    const props = feature.properties || {};
    const name = pickName(props);
    if (!name) continue;
    if (isDedicatedIslandPlace(name)) continue;
    if (isEupMyeonDongName(name)) continue;
    const [lon, lat] = feature.geometry.coordinates || [];
    if (!Number.isFinite(lon) || !Number.isFinite(lat)) continue;
    const point = toWorld(lon, lat);
    if (!pointInProvinces(point, provinces)) continue;

    const placeKind = props.place || "place";
    const population = Number(props.population || 0);
    const existing = existingByName.get(normalizeName(name));
    const keep = placeKind === "city" || (existing && isMajorPlaceKind(existing.kind));
    if (!keep) continue;
    if (existing) matchedBasePlaces.add(normalizeName(existing.name));

    places.push({
      id: String(props.id || `place-${places.length}`),
      name,
      kind: existing?.kind || "city",
      province: props.adm1_name || "",
      lon,
      lat,
      icon: existing?.icon || iconForName(`${name} ${props.name_en || ""} ${props.adm1_name || ""}`),
      motif: existing?.motif || "OSM 도시 위치",
      labelWeight: existing?.labelWeight || 3,
      point: roundPoint(point),
      population: population || undefined
    });
  }

  places.push(...buildCountyPlacesFromAdmin(provinces, matchedBasePlaces));

  for (const place of data.places) {
    if (!isMajorPlaceKind(place.kind) || matchedBasePlaces.has(normalizeName(place.name))) continue;
    if (isDedicatedIslandPlace(place.name) || place.kind === "island") continue;
    const point = toWorld(place.lon, place.lat);
    if (!pointInProvinces(point, provinces)) continue;
    places.push({
      ...place,
      id: `fallback-${normalizeName(place.name)}`,
      point: roundPoint(point),
      motif: "주요 지역 보조 좌표",
      labelWeight: place.kind === "island" ? 2 : 4
    });
  }

  return dedupePlaces(places).sort((a, b) => (a.labelWeight || 9) - (b.labelWeight || 9) || a.name.localeCompare(b.name));
}

function buildCountyPlacesFromAdmin(provinces, matchedBasePlaces) {
  const seedGroups = new Map();
  for (const seed of countySeeds) {
    if (!seedGroups.has(seed.adm2)) seedGroups.set(seed.adm2, []);
    seedGroups.get(seed.adm2).push(seed);
  }

  const groups = new Map();
  for (const feature of readJson(hdxPlacesPath).features || []) {
    if (feature.geometry?.type !== "Point") continue;
    const props = feature.properties || {};
    const seeds = seedGroups.get(props.adm2_name);
    if (!seeds) continue;

    const matchingSeeds = seeds.filter((seed) => !seed.sourceAdm1s || seed.sourceAdm1s.includes(props.adm1_name));
    if (!matchingSeeds.length) continue;

    const [lon, lat] = feature.geometry.coordinates || [];
    if (!Number.isFinite(lon) || !Number.isFinite(lat)) continue;
    const point = toWorld(lon, lat);
    if (!pointInProvinces(point, provinces)) continue;

    for (const seed of matchingSeeds) {
      const group = groups.get(seed.id) || { seed, lons: [], lats: [] };
      group.lons.push(lon);
      group.lats.push(lat);
      groups.set(seed.id, group);
    }
  }

  const countyPlaces = [];
  const usedSeedIds = new Set();
  for (const group of groups.values()) {
    if (!group.lons.length || !group.lats.length) continue;
    const lon = median(group.lons);
    const lat = median(group.lats);
    const place = createCountyPlace(group.seed, lon, lat, "HOT/HDX adm2 centroid", provinces, matchedBasePlaces);
    if (!place) continue;
    countyPlaces.push(place);
    usedSeedIds.add(group.seed.id);
  }

  for (const seed of countySeeds) {
    if (usedSeedIds.has(seed.id)) continue;
    if (!Number.isFinite(seed.lon) || !Number.isFinite(seed.lat)) continue;
    const place = createCountyPlace(seed, seed.lon, seed.lat, "curated county fallback", provinces, matchedBasePlaces);
    if (place) countyPlaces.push(place);
  }

  return countyPlaces;
}

function createCountyPlace(seed, lon, lat, source, provinces, matchedBasePlaces) {
  const baseName = seed.name.replace(/\([^)]*\)/g, "");
  const existing = existingByName.get(normalizeName(seed.name)) || (!seed.sourceAdm1s ? existingByName.get(normalizeName(baseName)) : null);
  const resolvedLon = existing?.lon ?? lon;
  const resolvedLat = existing?.lat ?? lat;
  const point = toWorld(resolvedLon, resolvedLat);
  if (!pointInProvinces(point, provinces)) return null;

  matchedBasePlaces.add(normalizeName(seed.name));
  matchedBasePlaces.add(normalizeName(baseName));
  if (existing) matchedBasePlaces.add(normalizeName(existing.name));

  return {
    id: `county-${slugify(seed.id)}`,
    name: seed.name,
    kind: "county",
    province: seed.province,
    lon: round(resolvedLon),
    lat: round(resolvedLat),
    icon: existing?.icon || seed.icon || iconForCounty(seed),
    motif: existing?.motif || seed.motif || countyMotif(seed),
    labelWeight: existing?.labelWeight || seed.labelWeight || 5,
    point: roundPoint(point),
    source
  };
}

function buildIslands() {
  const osmMatches = new Map();
  if (fs.existsSync(islandPointsPath)) {
    for (const feature of readJson(islandPointsPath).features || []) {
      if (feature.geometry?.type !== "Point") continue;
      const name = pickName(feature.properties || {});
      if (!name) continue;
      const seed = islandSeeds.find((candidate) => namesMatchIsland(name, candidate.name));
      if (!seed) continue;
      const [lon, lat] = feature.geometry.coordinates || [];
      if (!pointNear(lon, lat, seed.lon, seed.lat, seed.id === "dokdo" ? 0.08 : 0.35)) continue;
      osmMatches.set(seed.id, { lon, lat, source: "ArcGIS OSM island point" });
    }
  }

  return islandSeeds.map((seed) => {
    const match = osmMatches.get(seed.id);
    const lon = match?.lon || seed.lon;
    const lat = match?.lat || seed.lat;
    return {
      id: seed.id,
      name: seed.name,
      kind: "island",
      lon,
      lat,
      icon: seed.icon,
      point: roundPoint(toWorld(lon, lat)),
      labelWeight: seed.labelWeight,
      description: islandDescription(seed),
      source: match?.source || "curated island coordinate"
    };
  });
}

function islandDescription(seed) {
  const name = seed.name;
  if (/독도/.test(name)) return "동해의 최동단 섬입니다. 울릉도와 함께 동해 해상 탐험, 등대, 경비 거점 이벤트에 쓰기 좋은 지점입니다.";
  if (/울릉/.test(name)) return "화산 지형과 해안 절벽이 두드러지는 동해의 대표 섬입니다. 독도 항로와 산악/해상 지형을 함께 표현하기 좋습니다.";
  if (/제주/.test(name)) return "한라산을 중심으로 한 큰 화산섬입니다. 남쪽 해역의 중심 거점이자 별도 지역권으로 쓰기 좋습니다.";
  if (/우도|비양도|가파도|마라도|차귀도/.test(name)) return "제주 주변의 부속 섬입니다. 짧은 항로, 해안 마을, 관광/탐험 이벤트 지점으로 배치하기 좋습니다.";
  if (/한산도|욕지도|연화도|비진도|매물도|사량도|미륵도|거제|남해|가덕/.test(name)) {
    return "한려해상권의 주요 섬입니다. 남해안 항로, 해전/해상 교통, 섬 마을 콘텐츠를 배치하기 좋은 지점입니다.";
  }
  if (/흑산|홍도|가거|조도|관매|청산|소안|노화|생일|금당|거문|금오|거금|소록|돌산|백야|사도|손죽|초도|보길|완도|진도|임자|증도|자은|암태|안좌|하의|비금|도초|장산/.test(name)) {
    return "다도해권의 주요 섬입니다. 복잡한 섬 지형, 해상 국립공원, 항로 기반 탐험 요소를 표현하기 좋은 지점입니다.";
  }
  if (/안면|삽시|원산|선유|무녀|장자|덕적|자월|승봉|백령|대청|연평|강화|영종/.test(name)) {
    return "서해안의 주요 섬입니다. 갯벌, 사구, 항구, 서해 항로 이벤트와 함께 쓰기 좋은 지점입니다.";
  }
  return "OSM 또는 보정 좌표 기반으로 표시한 주요 섬입니다. 섬 탐험, 항로, 해안 지형 콘텐츠의 거점으로 사용할 수 있습니다.";
}

function buildNationalParks() {
  const features = [nationalParkPointsPath, nationalParkNamePointsPath]
    .filter((filePath) => fs.existsSync(filePath))
    .flatMap((filePath) => readJson(filePath).features || []);

  return nationalParkSeeds.map((seed) => {
    const match = bestNationalParkFeature(seed, features);
    const [lon, lat] = match?.geometry?.coordinates || [seed.lon, seed.lat];
    const center = toWorld(lon, lat);
    const zones = seed.zones || [{ lon, lat, radius: seed.radius }];
    return {
      id: seed.id,
      name: seed.name,
      kind: "nationalPark",
      lon,
      lat,
      icon: seed.icon || "park",
      point: roundPoint(center),
      rings: zones.map((zone) => parkPatch(toWorld(zone.lon, zone.lat), zone.radius || seed.radius).map(roundPoint)),
      labelWeight: seed.labelWeight,
      marine: !!seed.marine,
      description: seed.description,
      source: match ? "ArcGIS OSM POI" : "curated national park coordinate"
    };
  });
}

function bestNationalParkFeature(seed, features) {
  const candidates = features
    .filter((feature) => feature.geometry?.type === "Point")
    .map((feature) => ({ feature, score: nationalParkScore(seed, pickName(feature.properties || ""), feature.properties || {}) }))
    .filter((candidate) => candidate.score > 0)
    .sort((a, b) => b.score - a.score);
  return candidates[0]?.feature || null;
}

function nationalParkScore(seed, name, props) {
  const compact = normalizeParkName(name);
  if (!compact) return 0;
  const names = [seed.name, ...(seed.aliases || [])].map(normalizeParkName);
  if (!names.some((candidate) => compact.includes(candidate))) return 0;
  let score = compact === normalizeParkName(seed.name) ? 80 : 35;
  if (props.leisure === "nature_reserve") score += 35;
  if (props.tourism === "attraction") score += 20;
  if (props.tourism === "information" || props.information || props.amenity) score -= 20;
  return score;
}

function parkPatch(center, radius) {
  const wobble = [
    [-0.9, -0.32],
    [-0.34, -0.78],
    [0.42, -0.66],
    [0.92, -0.12],
    [0.55, 0.66],
    [-0.24, 0.8],
    [-0.78, 0.38]
  ];
  return closeRing(wobble.map(([x, y]) => [center[0] + x * radius, center[1] + y * radius]));
}

function isDedicatedIslandPlace(name) {
  return /울릉|독도/.test(String(name || ""));
}

function namesMatchIsland(name, seedName) {
  const a = normalizeName(name).replace(/도$/, "");
  const b = normalizeName(seedName).replace(/도$/, "");
  return a === b || a.includes(b) || b.includes(a);
}

function normalizeParkName(name) {
  return String(name || "")
    .replace(/\s+/g, "")
    .replace(/[()（）].*?[)）]/g, "")
    .replace(/NationalPark|nationalpark|InquiryOffice|ControlOffice|Office/gi, "")
    .replace(/국립공원.*$/, "국립공원");
}

function pointNear(lon, lat, targetLon, targetLat, tolerance) {
  return Number.isFinite(lon) && Number.isFinite(lat) && Math.hypot(lon - targetLon, lat - targetLat) <= tolerance;
}

function isMajorPlaceKind(kind) {
  return ["specialCity", "metroCity", "province", "city", "county", "island"].includes(kind);
}

function isEupMyeonDongName(name) {
  return /[읍면동]$/.test(String(name || "").trim());
}

function buildFields(provinces) {
  const fieldSources = [fieldsPath, fieldsSamplePath].filter((filePath) => fs.existsSync(filePath));
  const cells = new Map();

  for (const feature of fieldSources.flatMap((filePath) => readJson(filePath).features || [])) {
    const props = feature.properties || {};
    const rings = geoPolygonRings(feature.geometry).map((ring) => ring.map(([lon, lat]) => toWorld(lon, lat)));
    if (!rings.length) continue;

    const center = provinceLabelPoint({ rings });
    if (!pointInProvinces(center, provinces)) continue;
    const area = rings.reduce((sum, ring) => sum + ringArea(ring), 0);
    const key = `${Math.floor(center[0] / 38)}:${Math.floor(center[1] / 38)}`;
    if (!cells.has(key)) {
      cells.set(key, {
        id: `field-cell-${key}`,
        name: "OSM field cluster",
        type: props.landuse || "field",
        count: 0,
        weight: 0,
        x: 0,
        y: 0
      });
    }
    const cell = cells.get(key);
    cell.count += 1;
    cell.weight += Math.max(0.18, area);
    cell.x += center[0];
    cell.y += center[1];
  }

  return [...cells.values()]
    .filter((cell) => cell.count >= 2 || cell.weight >= 1.1)
    .map((cell) => {
      const center = [cell.x / cell.count, cell.y / cell.count];
      const size = Math.max(13, Math.min(34, 10 + Math.sqrt(cell.weight) * 4.2 + Math.log2(cell.count + 1) * 2.4));
      const ring = closeRing([
        [center[0] - size, center[1] - size * 0.45],
        [center[0] - size * 0.15, center[1] - size],
        [center[0] + size, center[1] - size * 0.35],
        [center[0] + size * 0.65, center[1] + size * 0.75],
        [center[0] - size * 0.75, center[1] + size * 0.8]
      ].map(roundPoint));
      return {
        id: cell.id,
        name: cell.name,
        type: cell.type,
        rings: [ring],
        center: roundPoint(center),
        area: Math.round(cell.weight * 10) / 10,
        count: cell.count,
        labelWeight: cell.weight > 6 || cell.count > 8 ? 5 : 9
      };
    })
    .sort((a, b) => b.area - a.area || b.count - a.count)
    .slice(0, 280)
    .sort((a, b) => a.labelWeight - b.labelWeight || b.area - a.area);
}

function buildPeaks(provinces) {
  const peaks = [];
  for (const feature of readJson(peaksPath).features || []) {
    if (feature.geometry?.type !== "Point") continue;
    const props = feature.properties || {};
    const name = pickName(props);
    if (!name) continue;
    const [lon, lat] = feature.geometry.coordinates || [];
    const point = toWorld(lon, lat);
    if (!pointInProvinces(point, provinces)) continue;
    const elevation = parseElevation(props.ele);
    const known = existingMountainNames.has(normalizeName(name));
    peaks.push({
      id: String(props.osm_id2 || `peak-${peaks.length}`),
      name,
      lon,
      lat,
      elevation,
      point: roundPoint(point),
      labelWeight: known ? 1 : elevation >= 1500 ? 2 : elevation >= 1000 ? 3 : elevation >= 700 ? 5 : 8
    });
  }

  for (const mountain of data.mountains || []) {
    const nameKey = normalizeName(mountain.name);
    for (let i = peaks.length - 1; i >= 0; i--) {
      if (normalizeName(peaks[i].name) === nameKey) peaks.splice(i, 1);
    }
    const point = toWorld(mountain.lon, mountain.lat);
    if (!pointInProvinces(point, provinces)) continue;
    peaks.push({
      id: `fallback-${mountain.id}`,
      name: mountain.name,
      lon: mountain.lon,
      lat: mountain.lat,
      elevation: knownMountainElevation(mountain.name),
      point: roundPoint(point),
      labelWeight: 1,
      source: "base mountain coordinate"
    });
  }

  return dedupePlaces(peaks)
    .sort((a, b) => (a.labelWeight || 9) - (b.labelWeight || 9) || b.elevation - a.elevation)
    .slice(0, 650);
}

function buildMountainRanges(peaks) {
  const high = peaks.filter((peak) => peak.elevation >= 650);
  const ranges = [
    {
      id: "east-spine",
      name: "OSM 산봉우리 능선(동부)",
      selector: (peak) => peak.lon >= 127.2 && peak.lat >= 35.0,
      axis: "lat",
      minPoints: 8
    },
    {
      id: "south-spine",
      name: "OSM 산봉우리 능선(남부)",
      selector: (peak) => peak.lat >= 34.55 && peak.lat <= 35.75 && peak.lon >= 126.4 && peak.lon <= 129.0,
      axis: "lon",
      minPoints: 6
    },
    {
      id: "jeju-spine",
      name: "OSM 산봉우리 능선(제주)",
      selector: (peak) => peak.lat >= 33.1 && peak.lat <= 33.6 && peak.lon >= 126.1 && peak.lon <= 126.95,
      axis: "lon",
      minPoints: 2
    }
  ];

  return ranges
    .map((range) => {
      const selected = selectRidgePeaks(high.filter(range.selector), range.axis);
      if (selected.length < range.minPoints) return null;
      const path = simplify(selected.map((peak) => peak.point), 7).map(roundPoint);
      if (path.length < 2) return null;
      return {
        id: range.id,
        name: range.name,
        path,
        labelPoint: path[Math.floor(path.length / 2)],
        peakStep: range.id === "jeju-spine" ? 34 : 46
      };
    })
    .filter(Boolean);
}

function buildMountainRangesFromSeededPeaks(peaks) {
  return (data.terrainZones || [])
    .filter((zone) => zone.type === "mountainRange")
    .map((zone) => {
      const snapped = zone.points.map(([lon, lat]) => {
        const peak = nearestPeak(peaks, lon, lat, zone.id === "yeongnam-alps" ? 0.23 : 0.32);
        return peak?.point || roundPoint(toWorld(lon, lat));
      });
      const path = simplify(snapped, 4.8).map(roundPoint);
      if (path.length < 2) return null;
      return {
        id: zone.id,
        name: zone.name,
        path,
        labelPoint: path[Math.floor(path.length / 2)],
        peakStep: zone.peakStep || 46,
        source: "base ridge snapped to ArcGIS OSM peaks"
      };
    })
    .filter(Boolean);
}

function nearestPeak(peaks, lon, lat, toleranceDeg) {
  let best = null;
  let bestScore = Infinity;
  for (const peak of peaks) {
    const distance = Math.hypot((peak.lon - lon) * 0.82, peak.lat - lat);
    if (distance > toleranceDeg) continue;
    const elevationBonus = Math.min(0.12, (peak.elevation || 0) / 16000);
    const score = distance - elevationBonus;
    if (score < bestScore) {
      best = peak;
      bestScore = score;
    }
  }
  return best;
}

function selectRidgePeaks(peaks, axis) {
  const binSize = axis === "lat" ? 0.18 : 0.22;
  const bins = new Map();
  for (const peak of peaks) {
    const key = Math.floor((axis === "lat" ? peak.lat : peak.lon) / binSize);
    const previous = bins.get(key);
    if (!previous || peak.elevation > previous.elevation) bins.set(key, peak);
  }
  return [...bins.values()].sort((a, b) => (axis === "lat" ? b.lat - a.lat : a.lon - b.lon));
}

function mergeLines(lines, tolerance, options = {}) {
  const buckets = new Map();
  const generic = options.genericNames || new Set();
  for (const line of lines) {
    const nameKey = normalizeName(line.name);
    const canMerge = nameKey && !generic.has(nameKey.toLowerCase());
    const key = canMerge ? `${line.class}:${nameKey}` : `${line.id}:${line.class}`;
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push({ ...line, path: line.path.map((point) => point.slice()) });
  }
  return [...buckets.values()].flatMap((group) => mergeLineGroup(group, tolerance));
}

function mergeLineGroup(lines, tolerance) {
  const pending = lines.slice();
  const merged = [];

  while (pending.length) {
    const current = pending.pop();
    let changed = true;
    while (changed) {
      changed = false;
      for (let i = pending.length - 1; i >= 0; i--) {
        const nextPath = joinPaths(current.path, pending[i].path, tolerance);
        if (!nextPath) continue;
        current.path = nextPath;
        current.length = Math.round((current.length || 0) + (pending[i].length || 0));
        current.lengthKm = round((current.lengthKm || 0) + (pending[i].lengthKm || 0));
        mergeLineMetadata(current, pending[i]);
        pending.splice(i, 1);
        changed = true;
        break;
      }
    }
    merged.push(current);
  }

  return merged.sort((a, b) => (b.length || 0) - (a.length || 0));
}

function mergeLineMetadata(current, next) {
  if (current.type !== "river") return;
  const nextIsBetter =
    (next.displayWidth || 0) > (current.displayWidth || 0) ||
    ((next.displayWidth || 0) === (current.displayWidth || 0) && widthSourceRank(next.widthSource) > widthSourceRank(current.widthSource));
  if (!nextIsBetter) return;
  current.displayWidth = next.displayWidth;
  current.widthMeters = next.widthMeters;
  current.widthSource = next.widthSource;
}

function widthSourceRank(source) {
  if (source === "osm-width-tag") return 3;
  if (source === "named-river-estimate") return 2;
  if (source === "length-estimate") return 1;
  return 0;
}

function joinPaths(a, b, tolerance) {
  const aStart = a[0];
  const aEnd = a[a.length - 1];
  const bStart = b[0];
  const bEnd = b[b.length - 1];
  if (pointDistance(aEnd, bStart) <= tolerance) return a.concat(b.slice(1));
  if (pointDistance(aEnd, bEnd) <= tolerance) return a.concat(b.slice(0, -1).reverse());
  if (pointDistance(aStart, bEnd) <= tolerance) return b.slice(0, -1).concat(a);
  if (pointDistance(aStart, bStart) <= tolerance) return b.slice(1).reverse().concat(a);
  return null;
}

function joinPathsWithGap(a, b, tolerance) {
  const direct = joinPaths(a, b, 4.5);
  if (direct) return { path: direct, gapKm: 0, stitched: false };

  const candidates = [
    { distance: pointDistance(a[a.length - 1], b[0]), path: () => appendWithConnector(a, b) },
    { distance: pointDistance(a[a.length - 1], b[b.length - 1]), path: () => appendWithConnector(a, b.slice().reverse()) },
    { distance: pointDistance(a[0], b[b.length - 1]), path: () => appendWithConnector(b, a) },
    { distance: pointDistance(a[0], b[0]), path: () => appendWithConnector(b.slice().reverse(), a) }
  ].sort((left, right) => left.distance - right.distance);

  if (!candidates.length || candidates[0].distance > tolerance) return null;
  const path = candidates[0].path();
  return {
    path,
    gapKm: round((candidates[0].distance / tilePx) * tileKm),
    stitched: true
  };
}

function appendWithConnector(a, b) {
  return a.concat(curvedGapConnector(a[a.length - 1], b[0]), b.slice(1));
}

function curvedGapConnector(start, end) {
  const distance = pointDistance(start, end);
  if (!distance) return [];
  const dx = end[0] - start[0];
  const dy = end[1] - start[1];
  const nx = -dy / distance;
  const ny = dx / distance;
  const bend = Math.min(18, distance * 0.18);
  return [0.22, 0.44, 0.66, 0.84].map((t) => {
    const sway = Math.sin(Math.PI * t) * bend;
    return roundPoint([start[0] + dx * t + nx * sway, start[1] + dy * t + ny * sway]);
  });
}

function dedupeLines(lines) {
  const seen = new Set();
  const out = [];
  for (const line of lines) {
    const forward = line.path.map((point) => `${Math.round(point[0] * 2)},${Math.round(point[1] * 2)}`).join("|");
    const reverse = line.path
      .slice()
      .reverse()
      .map((point) => `${Math.round(point[0] * 2)},${Math.round(point[1] * 2)}`)
      .join("|");
    const key = `${line.class}:${forward < reverse ? forward : reverse}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(line);
  }
  return out;
}

function dedupePlaces(places) {
  const out = [];
  for (const place of places) {
    const key = normalizeName(place.name);
    const duplicate = out.find((candidate) => normalizeName(candidate.name) === key && pointDistance(candidate.point, place.point) < 28);
    if (duplicate) {
      if ((place.labelWeight || 9) < (duplicate.labelWeight || 9)) Object.assign(duplicate, place);
      continue;
    }
    out.push(place);
  }
  return out;
}

function pickName(props) {
  return props.name_ko || props.name || props.name_en || props.name_latin || "";
}

function roadRefs(props) {
  const refs = String(props.ref || "")
    .split(/[;,/]/)
    .map((part) => {
      const match = part.match(/\d+/);
      return match ? Number(match[0]) : 0;
    })
    .filter((value) => Number.isFinite(value) && value > 0);
  return [...new Set(refs)];
}

function isNationalRoadRef(ref) {
  return ref >= 1 && ref <= 99;
}

function keepMajorRoadFeature(feature) {
  const props = feature.properties || {};
  const highway = String(props.highway || "").toLowerCase();
  if (highway === "motorway") return true;
  if (highway !== "trunk" && highway !== "primary") return false;
  return roadRefs(props).some(isNationalRoadRef);
}

function roadDisplayName(props) {
  const highway = String(props.highway || "").toLowerCase();
  const refs = roadRefs(props);
  if (highway === "motorway") {
    const expresswayName = [props.name, props.name_en, props.alt_name].find((name) => /expressway|고속도로/i.test(String(name || "")));
    if (expresswayName) return expresswayName;
    if (refs.length) return `고속도로 ${refs[0]}호선`;
  }
  const nationalRef = refs.find(isNationalRoadRef);
  if (nationalRef) return `국도 ${nationalRef}호선`;
  return pickName(props) || props.ref || "road";
}

function keepDisplayRoad(road) {
  const lengthKm = road.lengthKm || (road.length || 0) / 1000;
  if (road.class === "expressway") return lengthKm >= 1.2;
  return lengthKm >= 1.6;
}

function roadClassRank(value) {
  return value === "expressway" ? 1 : 0;
}

function roadClass(feature) {
  const props = feature.properties || {};
  const name = `${props.name || ""} ${props.name_en || ""} ${props.ref || ""}`;
  if (props.highway === "motorway" || /expressway|고속/i.test(name)) return "expressway";
  return "national";
}

function iconForName(text) {
  if (/seoul|서울/i.test(text)) return "capital";
  if (/busan|incheon|ulsan|pohang|mokpo|yeosu|gunsan|tongyeong|port|부산|인천|울산|포항|목포|여수|군산|통영/i.test(text)) return "port";
  if (/jeju|제주/i.test(text)) return "citrus";
  if (/daejeon|seongnam|gumi|tech|대전|성남|구미/i.test(text)) return "tech";
  if (/gyeongju|andong|gongju|jeonju|경주|안동|공주|전주/i.test(text)) return "temple";
  if (/gangwon|chuncheon|chungju|강원|춘천|충주/i.test(text)) return "lake";
  if (/gangneung|sokcho|donghae|samcheok|강릉|속초|동해|삼척/i.test(text)) return "wave";
  if (/daegu|apple|대구/i.test(text)) return "apple";
  if (/gwangju|광주/i.test(text)) return "light";
  return "government";
}

function iconForCounty(seed) {
  const name = seed.name;
  if (/울릉|옹진|신안|완도|진도/.test(name)) return "island";
  if (/강화|기장|울주|태안|고흥|강진|해남|영광|무안|보성|장흥|영덕|울진|양양|남해|고성/.test(name)) return "wave";
  if (/가평|평창|정선|인제|양구|화천|홍천|횡성|철원|단양|영월|봉화|청송|영양|무주|장수|함양|산청|구례|곡성/.test(name)) return "mountain";
  if (/달성|군위|칠곡|고령|성주|창녕|함안|의령|합천|고창|부안|예산|홍성/.test(name)) return "field";
  return "government";
}

function countyMotif(seed) {
  const name = seed.name;
  if (/울릉|옹진|신안|완도|진도/.test(name)) return "섬과 해안";
  if (/강화|기장|울주|태안|고흥|강진|해남|영광|무안|보성|장흥|영덕|울진|양양|남해|고성/.test(name)) return "해안 군";
  if (/가평|평창|정선|인제|양구|화천|홍천|횡성|철원|단양|영월|봉화|청송|영양|무주|장수|함양|산청|구례|곡성/.test(name)) return "산지 군";
  return "군 대표 지역";
}

function provinceLabelPoint(province) {
  let best = province.rings[0];
  let bestArea = 0;
  for (const ring of province.rings) {
    const area = ringArea(ring);
    if (area > bestArea) {
      best = ring;
      bestArea = area;
    }
  }
  const total = best.reduce(
    (acc, point) => {
      acc[0] += point[0];
      acc[1] += point[1];
      return acc;
    },
    [0, 0]
  );
  return [total[0] / best.length, total[1] / best.length];
}

function distanceToSegment(point, start, end) {
  const dx = end[0] - start[0];
  const dy = end[1] - start[1];
  if (dx === 0 && dy === 0) return pointDistance(point, start);
  const t = Math.max(0, Math.min(1, ((point[0] - start[0]) * dx + (point[1] - start[1]) * dy) / (dx * dx + dy * dy)));
  return pointDistance(point, [start[0] + dx * t, start[1] + dy * t]);
}

function simplify(points, tolerance) {
  if (points.length <= 2) return points;
  let maxDistance = 0;
  let index = 0;
  const end = points.length - 1;
  for (let i = 1; i < end; i++) {
    const distance = distanceToSegment(points[i], points[0], points[end]);
    if (distance > maxDistance) {
      index = i;
      maxDistance = distance;
    }
  }
  if (maxDistance <= tolerance) return [points[0], points[end]];
  return simplify(points.slice(0, index + 1), tolerance).slice(0, -1).concat(simplify(points.slice(index), tolerance));
}

function closeRing(points) {
  if (points.length < 2) return points;
  const first = points[0];
  const last = points[points.length - 1];
  if (first[0] === last[0] && first[1] === last[1]) return points;
  return [...points, first];
}

function ringArea(points) {
  let area = 0;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    area += points[j][0] * points[i][1] - points[i][0] * points[j][1];
  }
  return Math.abs(area / 2);
}

function ringIntersectsCanvas(points) {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (const [x, y] of points) {
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  }

  return maxX >= 0 && minX <= mapWidth && maxY >= 0 && minY <= mapHeight;
}

function pathLength(points) {
  let length = 0;
  for (let i = 1; i < points.length; i++) {
    length += pointDistance(points[i], points[i - 1]);
  }
  return length;
}

function geographicLengthKm(points) {
  let length = 0;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    length += Math.hypot((b.lon - a.lon) * kmPerDegLon, (b.lat - a.lat) * kmPerDegLat);
  }
  return length;
}

function parseElevation(value) {
  const numbers = String(value || "")
    .match(/-?\d+(?:\.\d+)?/g)
    ?.map(Number)
    .filter((number) => Number.isFinite(number) && number >= 0 && number < 3000);
  return numbers?.length ? Math.max(...numbers) : 0;
}

function knownMountainElevation(name) {
  const elevations = {
    설악산: 1708,
    오대산: 1565,
    태백산: 1567,
    소백산: 1439,
    속리산: 1058,
    덕유산: 1614,
    지리산: 1915,
    한라산: 1950,
    팔공산: 1193,
    가야산: 1433
  };
  return elevations[name] || 0;
}

function pointDistance(a, b) {
  return Math.hypot(a[0] - b[0], a[1] - b[1]);
}

function normalizeName(name) {
  return String(name || "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/특별자치시|특별자치도|광역시|특별시|자치도|자치시|province|city|county|district|si|gun|gu|do|시|도|군|구|읍|면/g, "");
}

function roundPoint(point) {
  return [round(point[0]), round(point[1])];
}

function round(value) {
  return Math.round(value * 10) / 10;
}

function median(values) {
  const sorted = values.filter(Number.isFinite).sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function radians(value) {
  return (value * Math.PI) / 180;
}

function degrees(value) {
  return (value * 180) / Math.PI;
}

const countryLand = buildCountryLand();
const provinces = buildSgisProvinces();
const places = buildPlaces(provinces);
const islands = buildIslands();
const roads = buildRoads(provinces);
const rivers = buildRivers(provinces);
const railways = buildRailways(provinces);
const fields = buildFields(provinces);
const nationalParks = buildNationalParks();
const peaks = buildPeaks(provinces);
const mountainRanges = buildMountainRangesFromSeededPeaks(peaks);

const overlays = {
  meta: {
    generatedAt: new Date().toISOString(),
    sources: [
      "SGIS province boundary GeoJSON via statgarten",
      "HOT/HDX South Korea populated places OSM GeoJSON export",
      "HOT/HDX South Korea railways OSM GeoJSON export",
      "ArcGIS OSM Asia Highways Korea major-route GeoJSON query",
      "ArcGIS OSM Asia Waterways GeoJSON query",
      "ArcGIS OSM Asia POIs peak GeoJSON query",
      "ArcGIS OSM Asia POIs island and national park GeoJSON queries",
      "ArcGIS OSM Asia Landuse field GeoJSON query",
      "Natural Earth Admin 0 Countries 1:10m GeoJSON"
    ],
    note: "Road, river, rail, city/county, peak, island, national park, and field overlays are OSM-derived from HOT/HDX and ArcGIS services with curated coordinate fallbacks where OSM point coverage is sparse. Province boundaries use SGIS because a compact OSM admin-boundary export was not available in the current source set. Country land background for South Korea, North Korea, and nearby visible Japanese land uses Natural Earth Admin 0 country polygons.",
    coordinateSpace: "app base canvas pixels"
  },
  countryLand,
  provinces,
  places,
  islands,
  roads,
  rivers,
  railways,
  fields,
  nationalParks,
  peaks,
  mountainRanges
};

fs.writeFileSync(outPath, `window.KOREA_REAL_OVERLAYS = ${JSON.stringify(overlays)};\n`, "utf8");
console.log(
  JSON.stringify({
    outPath,
    countryLand: countryLand.length,
    provinces: provinces.length,
    places: places.length,
    islands: islands.length,
    roads: roads.length,
    rivers: rivers.length,
    railways: railways.length,
    fields: fields.length,
    nationalParks: nationalParks.length,
    peaks: peaks.length,
    mountainRanges: mountainRanges.length
  })
);
