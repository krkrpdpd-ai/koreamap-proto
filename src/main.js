(() => {
  const data = window.KOREA_MAP_DATA;
  const real = window.KOREA_REAL_OVERLAYS || null;
  const maritime = window.KOREA_MARITIME_DATA || { ports: [], seaRoutes: [] };
  const cultureTourism = window.KOREA_CULTURE_TOURISM_DATA || { heritageSites: [], touristSpots: [] };
  const canvas = document.getElementById("mapCanvas");
  const ctx = canvas.getContext("2d");
  const frame = document.querySelector(".map-frame");
  const mapContent = document.getElementById("mapContent");
  const inspectorTitle = document.getElementById("inspectorTitle");
  const inspectorBody = document.getElementById("inspectorBody");
  const positionReadout = document.getElementById("positionReadout");

  const state = {
    showRoads: true,
    showExpressways: true,
    showNationalRoads: true,
    showRestAreas: true,
    showRailways: true,
    showRailwayStations: true,
    showMaritime: true,
    showPorts: true,
    showSeaRoutes: true,
    showCultureTourism: true,
    showHeritageSites: true,
    showTouristSpots: true,
    showNature: true,
    showMountains: true,
    showRivers: true,
    showLakes: true,
    showNationalParks: true,
    showAdmin: true,
    showProvinces: true,
    showCities: true,
    showCounties: true,
    showIslands: true,
    showBoundaries: false,
    showLabels: true,
    showGrid: true,
    zoom: 20,
    staticDirty: true,
    hoverPlace: null,
    selectedPlace: (real?.places && real.places[0]) || data.places[0]
  };

  const bounds = data.meta.bounds;
  const tileKm = data.meta.tileKm;
  const tilePx = data.meta.tilePx;
  const kmPerDegLat = 111.32;
  const kmPerDegLon = 111.32 * Math.cos((data.meta.midLat * Math.PI) / 180);
  const margin = 70;
  const fixedIconScale = 3;
  const labelScale = 1.35;
  const playerScale = 0.04;
  const pointHitRadiusPx = 64;
  const hoverHitRadiusPx = 58;
  const staticCachePaddingPx = 900;
  const staticScrollRedrawIntervalMs = 120;
  const playerMoveRedrawIdleMs = 180;
  const cameraMoveRedrawIdleMs = 140;
  const mapWidth = Math.ceil(((bounds.east - bounds.west) * kmPerDegLon / tileKm) * tilePx) + margin * 2;
  const mapHeight = Math.ceil(((bounds.north - bounds.south) * kmPerDegLat / tileKm) * tilePx) + margin * 2;

  canvas.width = mapWidth;
  canvas.height = mapHeight;
  ctx.imageSmoothingEnabled = false;

  const staticCanvas = document.createElement("canvas");
  staticCanvas.width = mapWidth;
  staticCanvas.height = mapHeight;
  const staticCtx = staticCanvas.getContext("2d");
  staticCtx.imageSmoothingEnabled = false;
  let renderPixelRatio = 1;
  let cachedStaticScrollLeft = 0;
  let cachedStaticScrollTop = 0;
  let lastStaticDrawTime = 0;
  let lastPlayerMoveTime = 0;
  let lastCameraMoveTime = 0;
  let lastPositionText = "";
  let viewScrollLeft = 0;
  let viewScrollTop = 0;
  let syncingFrameScroll = false;
  let frameScrollSyncPending = false;
  let staticDirtyReason = "content";
  const pathBoundsCache = new WeakMap();

  const keys = new Set();
  const sprites = new Map();
  const activePointers = new Map();
  const dragPan = {
    active: false,
    pointerId: null,
    startX: 0,
    startY: 0,
    startScrollLeft: 0,
    startScrollTop: 0,
    moved: false,
    suppressClick: false
  };
  const pinchZoom = {
    active: false,
    startDistance: 0,
    startZoom: 1
  };
  const player = {
    ...toWorld([126.978, 37.566]),
    speed: 13.2,
    frame: 0,
    direction: "down"
  };

  const palette = {
    sea: "#284f6d",
    seaDeep: "#1d3d5d",
    grid: "rgba(255, 255, 255, 0.12)",
    land: "#4c9f5f",
    landDark: "#347548",
    coast: "#d9d18b",
    mountain: "#6f8f54",
    mountainDark: "#536f47",
    park: "#2f7f4f",
    parkFill: "rgba(47, 127, 79, 0.24)",
    parkStroke: "rgba(200, 238, 178, 0.58)",
    field: "#c8b05a",
    fieldDark: "#9f8843",
    river: "#63c5da",
    riverDark: "#2b7fa0",
    expressway: "#e6b84d",
    expresswayDark: "#7c4d25",
    national: "#d86b4a",
    nationalDark: "#683238",
    restArea: "#f6c85f",
    restAreaDark: "#7c4d25",
    rail: "#d8d0b0",
    railDark: "#252b30",
    station: "#f2d27c",
    seaRoute: "#9be2ed",
    seaRouteDark: "#2b7fa0",
    port: "#f4f1de",
    portDark: "#d86048",
    heritage: "#d8b36a",
    heritageDark: "#7c4d25",
    tourism: "#69c7b8",
    tourismDark: "#2b7fa0",
    subway: "#b7a6dc",
    boundary: "rgba(244, 241, 222, 0.9)",
    boundaryShadow: "rgba(23, 32, 42, 0.82)",
    label: "#f4f1de",
    labelShadow: "#17202a",
    marker: "#f2d27c",
    selected: "#fff2a8"
  };

  function toWorld([lon, lat]) {
    return {
      x: margin + ((lon - bounds.west) * kmPerDegLon / tileKm) * tilePx,
      y: margin + ((bounds.north - lat) * kmPerDegLat / tileKm) * tilePx
    };
  }

  function fromWorld(x, y) {
    return {
      lon: bounds.west + (((x - margin) / tilePx) * tileKm) / kmPerDegLon,
      lat: bounds.north - (((y - margin) / tilePx) * tileKm) / kmPerDegLat
    };
  }

  const majorMountainDetails = {
    seorak: {
      elevation: 1708,
      description: "강원 북동부의 대표적인 고산으로, 바위 능선과 깊은 계곡이 특징입니다."
    },
    odae: {
      elevation: 1565,
      description: "강원 내륙의 숲과 사찰 문화가 함께 알려진 백두대간의 주요 산입니다."
    },
    taebaek: {
      elevation: 1567,
      description: "태백산맥을 대표하는 산으로, 한강과 낙동강 수계가 갈라지는 산지에 자리합니다."
    },
    sobaek: {
      elevation: 1439,
      description: "충북과 경북 경계의 긴 능선이 특징인 백두대간의 큰 산입니다."
    },
    songni: {
      elevation: 1058,
      description: "충북 보은과 경북 상주 일대에 걸친 산으로, 문장대와 법주사로 유명합니다."
    },
    deogyu: {
      elevation: 1614,
      description: "전북 무주와 경남 거창 일대의 큰 산으로, 남부 내륙 산악 지형을 대표합니다."
    },
    jiri: {
      elevation: 1915,
      description: "남부 내륙을 대표하는 대형 산지로, 넓은 산줄기와 국립공원 지형이 두드러집니다."
    },
    halla: {
      elevation: 1950,
      description: "제주도 중앙의 화산으로, 대한민국에서 가장 높은 산입니다."
    },
    palgong: {
      elevation: 1193,
      description: "대구와 경북을 대표하는 산으로, 도시권 가까이에 긴 산줄기를 형성합니다."
    },
    gaya: {
      elevation: 1433,
      description: "경남 합천과 경북 성주 일대의 산으로, 해인사와 암릉 지형이 잘 알려져 있습니다."
    }
  };

  const majorMountains = buildMajorMountains();
  const inaccessibleCountryIds = new Set(["PRK", "JPN"]);
  const inaccessibleCountryLand = (real?.countryLand || []).filter((country) => inaccessibleCountryIds.has(country.id));
  const countryBackgroundLabels = [
    { id: "PRK", name: "북한", lon: 126.9, lat: 38.48 },
    { id: "JPN", name: "일본", lon: 130.52, lat: 33.68 },
    { id: "JPN", name: "대마도", lon: 129.3, lat: 34.42 }
  ];

  const islandDetails = {
    baengnyeongdo: "서해 북쪽 접경 해역의 대표 섬으로, 해안 절벽과 기암 지형이 두드러집니다.",
    daecheongdo: "서해 북서부의 섬으로, 모래 해안과 사구 지형이 알려져 있습니다.",
    yeonpyeongdo: "서해 북방 접경 해역에 있는 섬으로, 어장과 해안 마을이 특징입니다.",
    ganghwado: "한강 하구와 서해가 만나는 큰 섬으로, 역사 유적과 갯벌 지형이 많습니다.",
    yeongjongdo: "인천국제공항이 자리한 수도권 관문 섬입니다.",
    anmyeondo: "충남 태안의 긴 해안 섬으로, 해변과 소나무 숲이 이어집니다.",
    heuksando: "다도해 서쪽의 섬으로, 먼바다 항로와 해산물 문화가 잘 알려져 있습니다.",
    hongdo: "붉은빛 해안 절벽과 바다 경관이 유명한 다도해의 섬입니다.",
    gagodo: "대한민국 서남단에 가까운 외딴 섬으로, 먼바다 어업의 거점입니다.",
    jindo: "남해 서부의 큰 섬으로, 울돌목과 진돗개로 널리 알려져 있습니다.",
    wando: "남해안 섬 지역의 중심지로, 청정 해역과 해상 교통의 거점입니다.",
    bogildo: "완도 남쪽의 섬으로, 윤선도 유적과 조용한 해안 경관이 특징입니다.",
    geumodo: "여수 앞바다의 섬으로, 굴곡진 해안과 절벽길이 잘 알려져 있습니다.",
    geomundo: "남해 먼바다의 섬으로, 등대와 항로 거점의 성격이 강합니다.",
    namhaedo: "경남 남해의 큰 섬으로, 산지와 리아스식 해안이 함께 나타납니다.",
    geojedo: "남해안의 큰 섬으로, 조선 산업과 해안 관광지가 발달했습니다.",
    jeju: "대한민국 최대 섬으로, 화산 지형과 한라산을 중심으로 한 자연 경관이 특징입니다.",
    marado: "대한민국 최남단 섬으로, 낮은 초지와 등대 경관이 대표적입니다.",
    chujado: "제주와 남해 사이에 있는 섬군으로, 어업과 해상 교통의 중간 거점입니다.",
    ulleungdo: "동해의 화산섬으로, 급경사 해안과 독특한 섬 지형이 돋보입니다.",
    dokdo: "동해의 섬으로, 바위섬 지형과 해양 생태 가치가 큽니다."
  };

  const lakeDetails = {
    soyang: "강원 내륙의 큰 인공호로 산악 지형과 넓은 수면이 어우러진 지역입니다.",
    chungju: "남한강 수계의 대형 호수로 충북 내륙 이동과 수변 지형 표현에 어울립니다.",
    daecheong: "금강 수계의 주요 호수로 대전, 청주권의 상수원과 수변 지형을 나타냅니다.",
    andong: "낙동강 상류의 큰 호수로 경북 북부 산지와 강줄기 흐름을 보여줍니다.",
    jinyang: "진주 인근의 호수로 남강 수계와 서부 경남의 수변 지형을 표현합니다."
  };

  const selectableIslands = buildSelectableIslands();
  const selectableRoadRoutes = buildSelectableRoadRoutes();

  function buildSelectableIslands() {
    return (real?.islands || []).map((island) => ({
      ...island,
      kind: "island",
      description: islandDetails[island.id] || island.description || `${island.name}은 지도에 표시된 주요 섬입니다.`
    }));
  }

  const maritimePorts = (maritime.ports || []).map((port) => {
    const p = toWorld([port.lon, port.lat]);
    return {
      ...port,
      type: "port",
      kind: "port",
      icon: "port",
      point: [p.x, p.y]
    };
  });

  const maritimeRoutes = (maritime.seaRoutes || []).map((route) => {
    const path = route.points.map((point) => {
      const p = toWorld(point);
      return [p.x, p.y];
    });
    return {
      ...route,
      type: "seaRoute",
      kind: "seaRoute",
      path,
      lengthKm: geoPathLengthKm(route.points)
    };
  });

  const heritageSites = buildCultureTourismPoints(cultureTourism.heritageSites || [], "heritageSite", "heritage");
  const touristSpots = buildCultureTourismPoints(cultureTourism.touristSpots || [], "touristSpot", "tourist");

  function buildCultureTourismPoints(items, type, defaultIcon) {
    return items.map((item) => {
      const p = toWorld([item.lon, item.lat]);
      return {
        ...item,
        type,
        kind: type,
        icon: item.icon || defaultIcon,
        point: [p.x, p.y]
      };
    });
  }

  function buildSelectableRoadRoutes() {
    if (!real?.roads?.length) return [];
    const groups = new Map();

    for (const road of real.roads) {
      if (!road.path?.length) continue;
      const key = roadRouteKey(road);
      if (!groups.has(key)) {
        groups.set(key, {
          id: `road-route:${key}`,
          type: "road",
          class: road.class,
          name: canonicalRoadDisplayName(road.name),
          paths: [],
          segments: [],
          length: 0,
          lengthKm: 0,
          source: road.source
        });
      }

      const group = groups.get(key);
      group.paths.push(road.path);
      group.segments.push(road);
      group.length += road.length || 0;
      group.lengthKm += road.lengthKm || 0;
    }

    return [...groups.values()]
      .map((route) => ({
        ...route,
        point: routeLabelPoint(route),
        segmentCount: route.segments.length,
        length: Math.round(route.length),
        lengthKm: Math.round(route.lengthKm * 10) / 10
      }))
      .sort((a, b) => roadClassRank(a.class) - roadClassRank(b.class) || (b.length || 0) - (a.length || 0));
  }

  function roadRouteKey(road) {
    return `${road.class || road.type || "road"}:${canonicalRoadDisplayName(road.name).replace(/\s+/g, "").toLowerCase()}`;
  }

  function canonicalRoadDisplayName(name) {
    const trimmed = String(name || "road").trim();
    const aliases = {
      "Seoul-Yangyang Expressway": "서울양양고속도로",
      "Yeongdong Expressway": "영동고속도로",
      "Donghae Expressway": "동해고속도로",
      "Hamyang-Ulsan Expressway": "함양울산고속도로",
      "Jungang Expressway Branch": "중앙고속도로지선",
      "Pyeongtaek-Paju Expressway": "평택파주고속도로",
      "Namhae Expressway": "남해고속도로",
      "Jungang Expressway": "중앙고속도로",
      "Gyeongbu Expressway": "경부고속도로",
      "West Coast Expressway": "서해안고속도로",
      "미사대로;서울양양고속도로": "서울양양고속도로"
    };
    return aliases[trimmed] || trimmed;
  }

  function routeLabelPoint(route) {
    const longest = route.segments.reduce((best, road) => ((road.length || 0) > (best?.length || 0) ? road : best), null);
    if (!longest?.path?.length) return null;
    const p = longest.path[Math.floor(longest.path.length / 2)];
    return [p[0], p[1]];
  }

  function roadClassRank(value) {
    if (value === "expressway") return 0;
    if (value === "national") return 1;
    return 2;
  }

  const majorRailwayNames = new Set([
    "경부선",
    "경부본선",
    "경부고속선",
    "수서평택고속선",
    "호남선",
    "호남본선",
    "호남고속선",
    "전라선",
    "중앙선",
    "장항선",
    "충북선",
    "경전선",
    "동해선",
    "경의선",
    "경원선",
    "경춘선",
    "영동선",
    "태백선",
    "경강선",
    "중부내륙선",
    "서해선",
    "인천국제공항선"
  ]);

  function buildMajorMountains() {
    const peakByName = new Map(
      (real?.peaks || [])
        .filter((peak) => peak.source === "base mountain coordinate")
        .map((peak) => [peak.name, peak])
    );

    return (data.mountains || []).map((mountain) => {
      const fallback = toWorld([mountain.lon, mountain.lat]);
      const peak = peakByName.get(mountain.name);
      const details = majorMountainDetails[mountain.id] || {};
      return {
        ...mountain,
        kind: "mountain",
        point: peak?.point || [fallback.x, fallback.y],
        elevation: peak?.elevation || details.elevation || null,
        description: details.description || "대한민국을 대표하는 큰 산입니다.",
        labelWeight: 1
      };
    });
  }

  function resizeInitialScroll() {
    scrollToWorld(player.x, player.y);
  }

  function updateCanvasScale() {
    const scaledWidth = Math.round(mapWidth * state.zoom);
    const scaledHeight = Math.round(mapHeight * state.zoom);
    const viewportWidth = Math.max(1, Math.floor(frame.clientWidth || frame.getBoundingClientRect().width || mapWidth));
    const viewportHeight = Math.max(1, Math.floor(frame.clientHeight || frame.getBoundingClientRect().height || mapHeight));
    renderPixelRatio = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));

    if (mapContent) {
      mapContent.style.width = `${scaledWidth}px`;
      mapContent.style.height = `${scaledHeight}px`;
    }

    const backingWidth = Math.max(1, Math.round(viewportWidth * renderPixelRatio));
    const backingHeight = Math.max(1, Math.round(viewportHeight * renderPixelRatio));
    canvas.width = backingWidth;
    canvas.height = backingHeight;
    staticCanvas.width = Math.max(1, Math.round((viewportWidth + staticCachePaddingPx * 2) * renderPixelRatio));
    staticCanvas.height = Math.max(1, Math.round((viewportHeight + staticCachePaddingPx * 2) * renderPixelRatio));
    ctx.imageSmoothingEnabled = false;
    staticCtx.imageSmoothingEnabled = false;
    canvas.style.width = `${viewportWidth}px`;
    canvas.style.height = `${viewportHeight}px`;

    setViewScroll(viewScrollLeft, viewScrollTop, { dirty: false });
    const zoomLevel = document.getElementById("zoomLevel");
    if (zoomLevel) zoomLevel.textContent = `${Math.round(state.zoom * 100)}%`;
    markStaticDirty("content");
  }

  function applyWorldTransform(target, scrollLeft = viewScrollLeft, scrollTop = viewScrollTop) {
    target.setTransform(
      renderPixelRatio * state.zoom,
      0,
      0,
      renderPixelRatio * state.zoom,
      -scrollLeft * renderPixelRatio,
      -scrollTop * renderPixelRatio
    );
  }

  function visibleWorldBounds(paddingPx = 96) {
    const padding = Math.max(paddingPx, staticCachePaddingPx + 96) / state.zoom;
    return {
      left: viewScrollLeft / state.zoom - padding,
      top: viewScrollTop / state.zoom - padding,
      right: (viewScrollLeft + frame.clientWidth) / state.zoom + padding,
      bottom: (viewScrollTop + frame.clientHeight) / state.zoom + padding
    };
  }

  function pathBounds(points) {
    if (!points?.length) return null;
    const cached = pathBoundsCache.get(points);
    if (cached) return cached;

    let left = Infinity;
    let top = Infinity;
    let right = -Infinity;
    let bottom = -Infinity;
    for (const point of points) {
      const x = Array.isArray(point) ? point[0] : point.x;
      const y = Array.isArray(point) ? point[1] : point.y;
      if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
      if (x < left) left = x;
      if (x > right) right = x;
      if (y < top) top = y;
      if (y > bottom) bottom = y;
    }

    const bounds = { left, top, right, bottom };
    pathBoundsCache.set(points, bounds);
    return bounds;
  }

  function boundsIntersect(a, b) {
    return !!a && a.left <= b.right && a.right >= b.left && a.top <= b.bottom && a.bottom >= b.top;
  }

  function pathIntersectsView(points, paddingPx = 96) {
    return boundsIntersect(pathBounds(points), visibleWorldBounds(paddingPx));
  }

  function pathsIntersectView(paths, paddingPx = 96) {
    return (paths || []).some((path) => pathIntersectsView(path, paddingPx));
  }

  function clientToWorld(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (viewScrollLeft + clientX - rect.left) / state.zoom,
      y: (viewScrollTop + clientY - rect.top) / state.zoom
    };
  }

  function markStaticDirty(reason = "content") {
    state.staticDirty = true;
    if (reason === "content") {
      staticDirtyReason = "content";
    } else if (staticDirtyReason !== "content") {
      staticDirtyReason = reason;
    }
  }

  function maxScrollLeft() {
    return Math.max(0, Math.round(mapWidth * state.zoom) - frame.clientWidth);
  }

  function maxScrollTop() {
    return Math.max(0, Math.round(mapHeight * state.zoom) - frame.clientHeight);
  }

  function syncFrameScrollToView() {
    frameScrollSyncPending = false;
    const left = Math.round(viewScrollLeft);
    const top = Math.round(viewScrollTop);
    if (Math.abs(frame.scrollLeft - left) < 0.5 && Math.abs(frame.scrollTop - top) < 0.5) return;
    syncingFrameScroll = true;
    frame.scrollLeft = left;
    frame.scrollTop = top;
    requestAnimationFrame(() => {
      syncingFrameScroll = false;
    });
  }

  function setViewScroll(left, top, options = {}) {
    const syncFrame = options.syncFrame !== false;
    const dirty = options.dirty !== false;
    const now = options.now || performance.now();
    const nextLeft = clamp(left, 0, maxScrollLeft());
    const nextTop = clamp(top, 0, maxScrollTop());
    const moved = Math.abs(nextLeft - viewScrollLeft) > 0.25 || Math.abs(nextTop - viewScrollTop) > 0.25;

    viewScrollLeft = nextLeft;
    viewScrollTop = nextTop;

    if (moved && dirty) markStaticDirty("scroll");
    if (!syncFrame) {
      if (moved) {
        lastCameraMoveTime = now;
        frameScrollSyncPending = true;
      }
    } else {
      syncFrameScrollToView();
    }

    return moved;
  }

  function maybeSyncFrameScroll(now) {
    if (!frameScrollSyncPending) return;
    if (now - lastCameraMoveTime < cameraMoveRedrawIdleMs) return;
    syncFrameScrollToView();
  }

  function setZoom(nextZoom, anchor = null) {
    const oldZoom = state.zoom;
    const clamped = clamp(nextZoom, 0.65, 20);
    if (Math.abs(clamped - oldZoom) < 0.001) return;

    const target = anchor || {
      clientX: frame.getBoundingClientRect().left + frame.clientWidth / 2,
      clientY: frame.getBoundingClientRect().top + frame.clientHeight / 2
    };
    const frameRect = frame.getBoundingClientRect();
    const focusX = target.clientX - frameRect.left;
    const focusY = target.clientY - frameRect.top;
    const worldX = (viewScrollLeft + focusX) / oldZoom;
    const worldY = (viewScrollTop + focusY) / oldZoom;

    state.zoom = clamped;
    updateCanvasScale();
    setViewScroll(worldX * state.zoom - focusX, worldY * state.zoom - focusY);
  }

  function scrollToWorld(x, y) {
    setViewScroll(x * state.zoom - frame.clientWidth / 2, y * state.zoom - frame.clientHeight / 2);
  }

  function drawStatic() {
    staticCtx.setTransform(1, 0, 0, 1, 0, 0);
    staticCtx.clearRect(0, 0, staticCanvas.width, staticCanvas.height);
    applyWorldTransform(staticCtx, viewScrollLeft - staticCachePaddingPx, viewScrollTop - staticCachePaddingPx);
    drawSea(staticCtx);
    if (state.showGrid) drawGrid(staticCtx);
    drawLand(staticCtx);
    if (isNatureLayerVisible("showNationalParks")) {
      drawTerrain(staticCtx);
    }
    if (isNatureLayerVisible("showRivers")) {
      drawRivers(staticCtx);
    }
    if (isNatureLayerVisible("showLakes")) {
      drawPointFeatures(staticCtx, data.lakes, 1);
    }
    if (state.showMaritime && state.showSeaRoutes) drawSeaRoutes(staticCtx);
    if (state.showRoads) drawRoads(staticCtx);
    if (state.showRoads && state.showRestAreas) drawRestAreas(staticCtx);
    if (state.showRailways) drawRailways(staticCtx);
    if (state.showMaritime && state.showPorts) drawPorts(staticCtx);
    if (isNatureLayerVisible("showMountains")) drawMajorMountains(staticCtx);
    if (state.showBoundaries && !real?.provinces?.length) drawProvinceBoundaries(staticCtx);
    drawPlaces(staticCtx);
    drawIslands(staticCtx);
    drawCultureTourism(staticCtx);
    staticCtx.setTransform(1, 0, 0, 1, 0, 0);
    state.staticDirty = false;
    staticDirtyReason = "none";
    cachedStaticScrollLeft = viewScrollLeft;
    cachedStaticScrollTop = viewScrollTop;
    lastStaticDrawTime = performance.now();
  }

  function drawSea(target) {
    target.fillStyle = palette.sea;
    target.fillRect(0, 0, mapWidth, mapHeight);

    for (let y = 0; y < mapHeight; y += tilePx) {
      for (let x = 0; x < mapWidth; x += tilePx) {
        const bit = pseudo(x / tilePx, y / tilePx);
        if (bit > 0.72) {
          target.fillStyle = bit > 0.88 ? palette.seaDeep : "rgba(112, 190, 204, 0.16)";
          target.fillRect(x + 2, y + 3, 6, 3);
        }
      }
    }

    drawSeaLabel(target, "서해", [125.2, 36.1]);
    drawSeaLabel(target, "남해", [127.1, 33.75]);
    drawSeaLabel(target, "동해", [130.55, 36.25]);
  }

  function drawSeaLabel(target, label, lonLat) {
    const p = toWorld(lonLat);
    target.save();
    target.font = `bold ${28 / state.zoom}px 'Malgun Gothic', sans-serif`;
    target.fillStyle = "rgba(227, 244, 246, 0.23)";
    target.fillText(label, p.x, p.y);
    target.restore();
  }

  function drawGrid(target) {
    target.strokeStyle = palette.grid;
    target.lineWidth = 1;
    for (let x = margin; x < mapWidth - margin; x += tilePx) {
      target.beginPath();
      target.moveTo(Math.round(x) + 0.5, margin);
      target.lineTo(Math.round(x) + 0.5, mapHeight - margin);
      target.stroke();
    }
    for (let y = margin; y < mapHeight - margin; y += tilePx) {
      target.beginPath();
      target.moveTo(margin, Math.round(y) + 0.5);
      target.lineTo(mapWidth - margin, Math.round(y) + 0.5);
      target.stroke();
    }
  }

  function drawLand(target) {
    if (real?.provinces?.length) {
      drawRealLand(target);
      return;
    }
    for (const land of data.landPolygons) {
      drawPolygon(target, land.points, palette.land, palette.coast, 3);
    }

    for (let y = margin; y < mapHeight - margin; y += tilePx) {
      for (let x = margin; x < mapWidth - margin; x += tilePx) {
        const lonLat = fromWorld(x + tilePx / 2, y + tilePx / 2);
        if (!isLand(lonLat.lon, lonLat.lat)) continue;
        const bit = pseudo(Math.floor(x / tilePx), Math.floor(y / tilePx));
        target.fillStyle = bit > 0.58 ? "#5dae67" : palette.landDark;
        target.fillRect(x + 3, y + 4, 4, 4);
        if (bit > 0.82) target.fillRect(x + 11, y + 10, 3, 3);
      }
    }
  }

  function drawRealLand(target) {
    target.save();
    target.lineJoin = "round";
    target.lineCap = "round";

    drawCountryLandBackground(target);

    real.provinces.forEach((province, index) => {
      target.fillStyle = state.showBoundaries && index % 2 !== 0 ? "#54a966" : palette.land;
      target.strokeStyle = state.showBoundaries ? "rgba(217, 209, 139, 0.74)" : "rgba(0, 0, 0, 0)";
      target.lineWidth = state.showBoundaries ? 1.5 / state.zoom : 0;
      for (const ring of province.rings) {
        drawWorldPolygon(target, ring);
      }
    });

    for (let y = margin; y < mapHeight - margin; y += tilePx) {
      for (let x = margin; x < mapWidth - margin; x += tilePx) {
        const centerX = x + tilePx / 2;
        const centerY = y + tilePx / 2;
        if (!isRealLand(centerX, centerY)) continue;
        const bit = pseudo(Math.floor(x / tilePx), Math.floor(y / tilePx));
        const inaccessible = isInaccessibleCountryLand(centerX, centerY);
        target.fillStyle = inaccessible ? (bit > 0.58 ? "#8d9490" : "#68706d") : bit > 0.58 ? "#5dae67" : palette.landDark;
        target.fillRect(x + 3, y + 4, 4, 4);
        if (bit > 0.82) target.fillRect(x + 11, y + 10, 3, 3);
      }
    }

    target.restore();
  }

  function drawCountryLandBackground(target) {
    if (!real?.countryLand?.length) return;

    for (const country of real.countryLand) {
      const inaccessible = inaccessibleCountryIds.has(country.id);
      target.fillStyle = inaccessible ? "#747b78" : palette.land;
      target.strokeStyle = inaccessible ? "rgba(191, 198, 194, 0.5)" : "rgba(217, 209, 139, 0.58)";
      target.lineWidth = 1.2 / state.zoom;
      for (const ring of country.rings) drawWorldPolygon(target, ring);
    }

    if (state.showLabels) {
      const countryIds = new Set(real.countryLand.map((country) => country.id));
      for (const label of countryBackgroundLabels) {
        if (!countryIds.has(label.id)) continue;
        const labelPoint = toWorld([label.lon, label.lat]);
        drawLabel(target, label.name, labelPoint.x, labelPoint.y, 11);
      }
    }
  }

  function drawWorldPolygon(target, points) {
    if (points.length < 3) return;
    target.beginPath();
    target.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) {
      target.lineTo(points[i][0], points[i][1]);
    }
    target.closePath();
    target.fill();
    target.stroke();
  }

  function drawTerrain(target) {
    if (drawRealTerrain(target)) return;

    for (const zone of data.terrainZones) {
      if (zone.type === "mountainRange" || zone.type === "field") continue;
    }
  }

  function drawRealTerrain(target) {
    const hasRealTerrain = !!real?.nationalParks?.length;
    if (!hasRealTerrain) return false;

    if (real.nationalParks?.length) drawRealNationalParks(target);
    return true;
  }

  function drawRealFields(target) {
    let labels = 0;
    target.save();
    target.lineJoin = "round";

    for (const field of real.fields) {
      const alpha = Math.min(0.72, 0.34 + Math.log2((field.count || 1) + 1) * 0.06);
      target.fillStyle = `rgba(200, 176, 90, ${alpha.toFixed(2)})`;
      target.strokeStyle = "rgba(245, 221, 129, 0.58)";
      target.lineWidth = 1.3;
      for (const ring of field.rings) drawWorldPolygon(target, ring);

      if (state.zoom >= 1.25 && field.center && (field.count || 0) >= 4) {
        drawIcon(target, "field", field.center[0], field.center[1], 0.82);
      }
      if (state.showLabels && state.zoom >= 1.55 && labels < 10 && field.labelWeight <= 5) {
        drawLabelNear(target, field.name, field.center[0], field.center[1], 10, 8, 3);
        labels += 1;
      }
    }

    target.restore();
  }

  function drawRealNationalParks(target) {
    let labels = 0;
    target.save();

    for (const park of real.nationalParks) {
      if (park === state.selectedPlace || park === state.hoverPlace) {
        const markerSize = 36 / state.zoom;
        target.fillStyle = park === state.selectedPlace ? palette.selected : "#bdf3ff";
        target.fillRect(Math.round(park.point[0] - markerSize / 2), Math.round(park.point[1] - markerSize / 2), markerSize, markerSize);
      }
      if (isNationalParkVisible(park)) {
        drawIcon(target, park.icon || "park", park.point[0], park.point[1], 0.76, true);
      }
      if (state.showLabels && labels < 18 && park.labelWeight <= (state.zoom >= 1.35 ? 4 : 2)) {
        drawLabelNear(target, park.name, park.point[0], park.point[1], 10, 7, 3);
        labels += 1;
      }
    }

    target.restore();
  }

  function isNationalParkVisible(park) {
    return state.zoom >= 1.1 || park.labelWeight <= 2;
  }

  function drawRealMountainRanges(target) {
    target.save();
    target.lineJoin = "round";
    target.lineCap = "round";

    for (const range of real.mountainRanges) {
      drawWorldStroke(target, range.path, "rgba(42, 58, 43, 0.72)", 18);
      drawWorldStroke(target, range.path, palette.mountainDark, 11);
      drawWorldStroke(target, range.path, palette.mountain, 6);

      const samples = samplePath(range.path.map(([x, y]) => ({ x, y })), range.peakStep || 46);
      for (let i = 0; i < samples.length; i++) {
        drawPeak(target, samples[i].x, samples[i].y, i % 3 === 0 ? 1.02 : 0.82);
      }

      if (state.showLabels && state.zoom >= 1.15 && range.labelPoint) {
        drawLabelNear(target, range.name, range.labelPoint[0], range.labelPoint[1], 11, 7, -5);
      }
    }

    target.restore();
  }

  function drawRealPeaks(target) {
    const peaks = [...real.peaks].sort((a, b) => (a.labelWeight || 9) - (b.labelWeight || 9) || (b.elevation || 0) - (a.elevation || 0));
    let labels = 0;
    for (const peak of peaks) {
      if (state.zoom < 1.05 && peak.labelWeight > 2) continue;
      if (state.zoom < 1.45 && peak.labelWeight > 5) continue;
      const scale = peak.labelWeight <= 2 ? 1.02 : peak.labelWeight <= 4 ? 0.82 : 0.66;
      drawPeak(target, peak.point[0], peak.point[1], scale);

      if (state.showLabels && labels < 22 && peak.labelWeight <= (state.zoom >= 1.45 ? 4 : 2)) {
        const elevation = peak.elevation ? ` ${Math.round(peak.elevation)}m` : "";
        drawLabelNear(target, `${peak.name}${elevation}`, peak.point[0], peak.point[1], 10, 7, -4);
        labels += 1;
      }
    }
  }

  function drawRivers(target) {
    if (real?.rivers?.length) {
      drawRealRivers(target);
      return;
    }
    for (const river of data.rivers) {
      drawCurvedPixelPath(target, river.points, palette.river, river.width || 5, 4, { wiggle: 2.2 });
      if (state.showLabels) {
        const mid = river.points[Math.floor(river.points.length / 2)];
        const p = toWorld(mid);
        drawLabelNear(target, river.name, p.x, p.y, 12, 7, -4);
      }
    }
  }

  function drawRoads(target) {
    if (real?.roads?.length) {
      drawRealRoads(target);
      return;
    }
    for (const road of data.roads) {
      if (!isRoadClassEnabled(road)) continue;
      const top = road.type === "expressway" ? palette.expressway : palette.national;
      drawCurvedPixelPath(target, road.points, top, road.type === "expressway" ? 6 : 4, 5, { wiggle: 0.3 });
      if (state.showLabels && road.type === "expressway") {
        const mid = road.points[Math.floor(road.points.length / 2)];
        const p = toWorld(mid);
        drawLabelNear(target, road.name, p.x, p.y, 11, 7, -5);
      }
    }
  }

  function drawRailways(target) {
    if (!real?.railways?.length && !real?.railwayStations?.length) return;
    if (real?.railways?.length) drawRealRailways(target);
    if (state.showRailwayStations && real?.railwayStations?.length) drawRailwayStations(target);
  }

  function drawProvinceBoundaries(target) {
    if (real?.provinces?.length) {
      drawRealProvinceBoundaries(target);
      return;
    }
    const boundaries = data.provinceBoundaries || [];
    for (const boundary of boundaries) {
      const points = boundary.closed ? [...boundary.points, boundary.points[0]] : boundary.points;
      drawCurvedPixelPath(target, points, palette.boundaryShadow, 6, 8, { wiggle: 0.2 });
      drawCurvedPixelPath(target, points, palette.boundary, 2, 8, { wiggle: 0.2, dash: true });
      if (state.showLabels && boundary.labelPoint) {
        const p = toWorld(boundary.labelPoint);
        drawLabelNear(target, boundary.name, p.x, p.y, 10, 6, 3);
      }
    }
  }

  function drawRealProvinceBoundaries(target) {
    target.save();
    target.lineJoin = "round";
    target.lineCap = "round";
    target.setLineDash([7, 5]);

    for (const province of real.provinces) {
      for (const ring of province.rings) {
        drawWorldStroke(target, ring, palette.boundaryShadow, 5);
        drawWorldStroke(target, ring, palette.boundary, 2);
      }
    }

    target.setLineDash([]);
    if (state.showLabels) {
      for (const province of real.provinces) {
        const center = provinceLabelPoint(province);
        if (center) drawLabelNear(target, province.name, center[0], center[1], 10, 4, 3);
      }
    }
    target.restore();
  }

  function drawRealRoads(target) {
    const roads = [...real.roads].sort((a, b) => (a.class === b.class ? 0 : a.class === "expressway" ? 1 : -1));
    const labeled = new Set();
    let labelCount = 0;

    target.save();
    target.lineJoin = "round";
    target.lineCap = "round";

    for (const road of roads) {
      if (!isRoadVisible(road)) continue;
      if (!pathIntersectsView(road.path, 120)) continue;
      const color = road.class === "expressway" ? palette.expressway : palette.national;
      drawWorldStroke(target, road.path, color, road.class === "expressway" ? 4.2 : 2.8, true);

      if (state.showLabels && road.name && labelCount < 28 && road.length > 9000 && !labeled.has(road.name)) {
        if (road.class === "national" && state.zoom < 1.35) continue;
        const p = road.path[Math.floor(road.path.length / 2)];
        drawLabelNear(target, road.name, p[0], p[1], 10, 7, -5);
        labeled.add(road.name);
        labelCount += 1;
      }
    }
    drawRoadRouteHighlight(target, state.hoverPlace, "#bdf3ff");
    drawRoadRouteHighlight(target, state.selectedPlace, palette.selected);
    target.restore();
  }

  function drawRoadRouteHighlight(target, route, color) {
    if (!route || route.type !== "road" || !isRoadClassEnabled(route)) return;
    const width = route.class === "expressway" ? 6.4 : 4.8;
    const paths = route.paths || (route.path ? [route.path] : []);
    if (!pathsIntersectView(paths, 140)) return;
    for (const path of paths) {
      drawWorldStroke(target, path, color, width, true);
    }
  }

  function isRoadVisible(road) {
    if (!isRoadClassEnabled(road)) return false;
    if (state.zoom < 1.05 && road.class === "national" && road.length < 35000) return false;
    if (state.zoom < 1.35 && road.class === "national" && road.length < 12000) return false;
    return true;
  }

  function drawRealRivers(target) {
    const labeled = new Set();

    target.save();
    target.lineJoin = "round";
    target.lineCap = "round";

    for (const river of real.rivers) {
      if (!pathIntersectsView(river.path, 140)) continue;
      drawWorldStroke(target, river.path, palette.river, river.displayWidth || 4, true);
      if (river === state.selectedPlace || river === state.hoverPlace) {
        drawWorldStroke(target, river.path, river === state.selectedPlace ? palette.selected : "#bdf3ff", (river.displayWidth || 4) + 3, true);
      }

      if (state.showLabels && river.name && river.length > 12000 && !labeled.has(river.name)) {
        const p = river.path[Math.floor(river.path.length / 2)];
        drawLabelNear(target, river.name, p[0], p[1], 11, 7, -4);
        labeled.add(river.name);
      }
    }
    target.restore();
  }

  function drawRealRailways(target) {
    target.save();
    target.lineJoin = "round";
    target.lineCap = "round";

    const rails = real.railways.filter(isMajorRailway);
    for (const rail of rails) {
      if (!pathIntersectsView(rail.path, 120)) continue;
      drawWorldStroke(target, rail.path, palette.rail, 2.6, true);
      if (rail === state.selectedPlace || rail === state.hoverPlace) {
        drawWorldStroke(target, rail.path, rail === state.selectedPlace ? palette.selected : "#bdf3ff", 5, true);
      }
    }

    target.restore();
  }

  function drawSeaRoutes(target) {
    if (!maritimeRoutes.length) return;

    target.save();
    target.lineJoin = "round";
    target.lineCap = "round";
    for (const route of maritimeRoutes) {
      if (!isSeaRouteVisible(route)) continue;
      if (!pathIntersectsView(route.path, 140)) continue;
      drawWorldStroke(target, route.path, "rgba(29, 61, 93, 0.82)", 6.5, true);
      drawDashedWorldStroke(target, route.path, palette.seaRoute, 2.8, true, 10, 7);
      if (route === state.selectedPlace || route === state.hoverPlace) {
        drawWorldStroke(target, route.path, route === state.selectedPlace ? palette.selected : "#bdf3ff", 6, true);
      }
      if (state.showLabels && shouldShowSeaRouteLabel(route)) {
        const p = route.path[Math.floor(route.path.length / 2)];
        drawLabelNear(target, route.name, p[0], p[1], route.labelWeight <= 1 ? 10 : 9, 7, -4);
      }
    }
    target.restore();
  }

  function drawPorts(target) {
    if (!maritimePorts.length) return;

    target.save();
    let labels = 0;
    for (const port of maritimePorts) {
      if (!isPortVisible(port)) continue;
      const p = { x: port.point[0], y: port.point[1] };
      if (port === state.selectedPlace || port === state.hoverPlace) {
        const markerSize = 30 / state.zoom;
        target.fillStyle = port === state.selectedPlace ? palette.selected : "#bdf3ff";
        target.fillRect(Math.round(p.x - markerSize / 2), Math.round(p.y - markerSize / 2), markerSize, markerSize);
      }

      drawIcon(target, "port", p.x, p.y, port.labelWeight <= 2 ? 0.8 : 0.62, true);

      const showPortLabel =
        port.labelWeight <= 2 ||
        (state.zoom >= 1.35 && port.labelWeight <= 3) ||
        (state.zoom >= 2.2 && port.labelWeight <= 4);
      if (state.showLabels && showPortLabel && labels < 34) {
        drawLabelNear(target, port.name, p.x, p.y, port.labelWeight <= 1 ? 10 : 9, 6, -2);
        labels += 1;
      }
    }
    target.restore();
  }

  function drawRailwayStations(target) {
    const stations = [...real.railwayStations]
      .filter(isRailwayStationVisible)
      .sort((a, b) => (b.labelWeight || 9) - (a.labelWeight || 9));
    let labels = 0;

    target.save();
    for (const station of stations) {
      const p = { x: station.point[0], y: station.point[1] };
      if (station === state.selectedPlace || station === state.hoverPlace) {
        const markerSize = 26 / state.zoom;
        target.fillStyle = station === state.selectedPlace ? palette.selected : "#bdf3ff";
        target.fillRect(Math.round(p.x - markerSize / 2), Math.round(p.y - markerSize / 2), markerSize, markerSize);
      }

      drawIcon(target, "station", p.x, p.y, station.labelWeight <= 1 ? 0.72 : 0.54, true);

      const showStationLabel =
        (state.zoom >= 1.15 && station.labelWeight <= 1) ||
        (state.zoom >= 1.75 && station.labelWeight <= 4) ||
        (state.zoom >= 2.65 && station.labelWeight <= 6);
      if (state.showLabels && showStationLabel && labels < 38) {
        drawLabelNear(target, station.name, p.x, p.y, station.labelWeight <= 1 ? 10 : 9, 6, -2);
        labels += 1;
      }
    }
    target.restore();
  }

  function drawRestAreas(target) {
    if (!real?.restAreas?.length) return;

    const areas = [...real.restAreas].filter(isRestAreaVisible).sort((a, b) => (b.labelWeight || 9) - (a.labelWeight || 9));
    let labels = 0;

    target.save();
    for (const area of areas) {
      const p = { x: area.point[0], y: area.point[1] };
      if (area === state.selectedPlace || area === state.hoverPlace) {
        const markerSize = 30 / state.zoom;
        target.fillStyle = area === state.selectedPlace ? palette.selected : "#bdf3ff";
        target.fillRect(Math.round(p.x - markerSize / 2), Math.round(p.y - markerSize / 2), markerSize, markerSize);
      }

      drawIcon(target, "restArea", p.x, p.y, area.labelWeight <= 3 ? 0.78 : 0.64, true);

      const showRestAreaLabel =
        area.labelWeight <= 2 ||
        (state.zoom >= 1.6 && area.labelWeight <= 4) ||
        (state.zoom >= 2.4 && area.labelWeight <= 6);
      if (state.showLabels && showRestAreaLabel && labels < 36) {
        drawLabelNear(target, area.name, p.x, p.y, area.labelWeight <= 2 ? 10 : 9, 6, -1);
        labels += 1;
      }
    }
    target.restore();
  }

  function isRailwayStationVisible(station) {
    if (!state.showRailways || !state.showRailwayStations) return false;
    if (station.labelWeight <= 1) return true;
    if (station.labelWeight <= 4) return state.zoom >= 1.3;
    return state.zoom >= 2.1;
  }

  function isRestAreaVisible(area) {
    if (!state.showRoads || !state.showExpressways || !state.showRestAreas) return false;
    if ((area.labelWeight || 9) <= 2) return true;
    if ((area.labelWeight || 9) <= 4) return state.zoom >= 1.6;
    return state.zoom >= 2.3;
  }

  function isPortVisible(port) {
    if (!state.showMaritime || !state.showPorts) return false;
    if ((port.labelWeight || 9) <= 2) return true;
    if ((port.labelWeight || 9) <= 3) return state.zoom >= 1.25;
    return state.zoom >= 1.8;
  }

  function isSeaRouteVisible(route) {
    if (!state.showMaritime || !state.showSeaRoutes) return false;
    if ((route.labelWeight || 9) <= 2) return true;
    if ((route.labelWeight || 9) <= 3) return state.zoom >= 1.25;
    return state.zoom >= 1.65;
  }

  function shouldShowSeaRouteLabel(route) {
    if ((route.labelWeight || 9) <= 1) return true;
    if ((route.labelWeight || 9) <= 2) return state.zoom >= 1.2;
    return state.zoom >= 1.85;
  }

  function isCultureTourismVisible(feature) {
    if (!state.showCultureTourism) return false;
    if (feature.type === "heritageSite" && !state.showHeritageSites) return false;
    if (feature.type === "touristSpot" && !state.showTouristSpots) return false;
    if ((feature.labelWeight || 9) <= 2) return true;
    if ((feature.labelWeight || 9) <= 4) return state.zoom >= 1.25;
    return state.zoom >= 1.85;
  }

  function isMajorRailway(rail) {
    return majorRailwayNames.has(rail.name) && (rail.lengthKm || 0) >= 18 && rail.path?.length >= 3;
  }

  function drawWorldStroke(target, points, color, width, fixedScreenWidth = false) {
    if (points.length < 2) return;
    if (!pathIntersectsView(points, Math.max(96, width * state.zoom * 3))) return;
    target.beginPath();
    target.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) {
      target.lineTo(points[i][0], points[i][1]);
    }
    target.strokeStyle = color;
    target.lineWidth = fixedScreenWidth ? width / state.zoom : width;
    target.stroke();
  }

  function drawDashedWorldStroke(target, points, color, width, fixedScreenWidth = false, dash = 8, gap = 6) {
    if (points.length < 2) return;
    target.save();
    target.setLineDash([dash / state.zoom, gap / state.zoom]);
    drawWorldStroke(target, points, color, width, fixedScreenWidth);
    target.restore();
  }

  function provinceLabelPoint(province) {
    let best = null;
    let bestArea = 0;
    for (const ring of province.rings) {
      const area = polygonAreaWorld(ring);
      if (area > bestArea) {
        bestArea = area;
        best = ring;
      }
    }
    if (!best) return null;
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

  function polygonAreaWorld(points) {
    let area = 0;
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
      area += points[j][0] * points[i][1] - points[i][0] * points[j][1];
    }
    return Math.abs(area / 2);
  }

  function drawPointFeatures(target, list, scale) {
    for (const feature of list) {
      const p = toWorld([feature.lon, feature.lat]);
      if (feature === state.selectedPlace || feature === state.hoverPlace) {
        const markerSize = 34 / state.zoom;
        target.fillStyle = feature === state.selectedPlace ? palette.selected : "#bdf3ff";
        target.fillRect(Math.round(p.x - markerSize / 2), Math.round(p.y - markerSize / 2), markerSize, markerSize);
      }
      drawIcon(target, feature.icon, p.x, p.y, scale);
      if (state.showLabels) drawLabelNear(target, feature.name, p.x, p.y, 11, 8, 3);
    }
  }

  function drawPlaces(target) {
    const sourcePlaces = real?.places?.length ? real.places : data.places;
    const sorted = [...sourcePlaces].sort((a, b) => (b.labelWeight || 9) - (a.labelWeight || 9));
    for (const place of sorted) {
      if (!isPlaceKindVisible(place)) continue;
      const p = placePoint(place);
      const scale = place.labelWeight <= 1 ? 1.25 : place.labelWeight <= 3 ? 1 : 0.84;
      if (place === state.selectedPlace || place === state.hoverPlace) {
        const markerSize = 38 / state.zoom;
        target.fillStyle = place === state.selectedPlace ? palette.selected : "#bdf3ff";
        target.fillRect(Math.round(p.x - markerSize / 2), Math.round(p.y - markerSize / 2), markerSize, markerSize);
      }
      drawIcon(target, place.icon, p.x, p.y, scale, true);
      const showCountyLabel = place.kind === "county" && state.zoom >= 1.15 && place.labelWeight <= 5;
      if (state.showLabels && (place.labelWeight <= 4 || showCountyLabel)) {
        drawLabelNear(target, place.name, p.x, p.y, place.labelWeight <= 1 ? 13 : place.kind === "county" ? 10 : 11, 5, -1);
      }
    }
  }

  function drawIslands(target) {
    if (!state.showAdmin || !state.showIslands) return;
    if (!selectableIslands.length) return;
    const islands = [...selectableIslands].sort((a, b) => (b.labelWeight || 9) - (a.labelWeight || 9));
    for (const island of islands) {
      const p = { x: island.point[0], y: island.point[1] };
      if (island === state.selectedPlace || island === state.hoverPlace) {
        const markerSize = 36 / state.zoom;
        target.fillStyle = island === state.selectedPlace ? palette.selected : "#bdf3ff";
        target.fillRect(Math.round(p.x - markerSize / 2), Math.round(p.y - markerSize / 2), markerSize, markerSize);
      }

      drawIcon(target, island.icon || "island", p.x, p.y, island.labelWeight <= 1 ? 1 : 0.82, true);
      const showIslandLabel =
        island.labelWeight <= 4 || (island.labelWeight <= 5 && state.zoom >= 1.25) || (island.labelWeight <= 6 && state.zoom >= 1.75);
      if (state.showLabels && showIslandLabel) {
        drawLabelNear(target, island.name, p.x, p.y, island.labelWeight <= 1 ? 12 : 10, 5, -1);
      }
    }
  }

  function drawMajorMountains(target) {
    const sorted = [...majorMountains].sort((a, b) => (b.elevation || 0) - (a.elevation || 0));
    for (const mountain of sorted) {
      const p = placePoint(mountain);
      if (mountain === state.selectedPlace || mountain === state.hoverPlace) {
        const markerSize = 36 / state.zoom;
        target.fillStyle = mountain === state.selectedPlace ? palette.selected : "#bdf3ff";
        target.fillRect(Math.round(p.x - markerSize / 2), Math.round(p.y - markerSize / 2), markerSize, markerSize);
      }

      drawIcon(target, mountain.icon || "mountain", p.x, p.y, mountain.id === "halla" ? 1.06 : 0.96, true);
      if (state.showLabels) {
        const elevation = state.zoom >= 1.35 && mountain.elevation ? ` ${Math.round(mountain.elevation)}m` : "";
        drawLabelNear(target, `${mountain.name}${elevation}`, p.x, p.y, 11, 5, -1);
      }
    }
  }

  function drawCultureTourism(target) {
    if (!state.showCultureTourism) return;

    const features = [...heritageSites, ...touristSpots]
      .filter(isCultureTourismVisible)
      .sort((a, b) => (b.labelWeight || 9) - (a.labelWeight || 9));
    let labels = 0;

    target.save();
    for (const feature of features) {
      const p = placePoint(feature);
      if (feature === state.selectedPlace || feature === state.hoverPlace) {
        const markerSize = 34 / state.zoom;
        target.fillStyle = feature === state.selectedPlace ? palette.selected : "#bdf3ff";
        target.fillRect(Math.round(p.x - markerSize / 2), Math.round(p.y - markerSize / 2), markerSize, markerSize);
      }

      const isHeritage = feature.type === "heritageSite";
      const scale = feature.labelWeight <= 1 ? 0.88 : feature.labelWeight <= 3 ? 0.76 : 0.64;
      drawIcon(target, feature.icon || (isHeritage ? "heritage" : "tourist"), p.x, p.y, scale, true);

      const showLabel =
        (feature.labelWeight || 9) <= 2 ||
        (state.zoom >= 1.35 && (feature.labelWeight || 9) <= 4) ||
        (state.zoom >= 2.1 && (feature.labelWeight || 9) <= 6);
      if (state.showLabels && showLabel && labels < 46) {
        drawLabelNear(target, feature.name, p.x, p.y, feature.labelWeight <= 1 ? 10 : 9, 6, -2);
        labels += 1;
      }
    }
    target.restore();
  }

  function placePoint(place) {
    if (place.point) return { x: place.point[0], y: place.point[1] };
    return toWorld([place.lon, place.lat]);
  }

  function drawPolygon(target, points, fill, stroke, width) {
    target.beginPath();
    points.forEach((point, index) => {
      const p = toWorld(point);
      if (index === 0) target.moveTo(p.x, p.y);
      else target.lineTo(p.x, p.y);
    });
    target.closePath();
    target.fillStyle = fill;
    target.fill();
    target.strokeStyle = stroke;
    target.lineWidth = width;
    target.stroke();
  }

  function drawPixelPath(target, points, color, size, step) {
    target.fillStyle = color;
    for (let i = 0; i < points.length - 1; i++) {
      const a = toWorld(points[i]);
      const b = toWorld(points[i + 1]);
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const distance = Math.max(1, Math.hypot(dx, dy));
      const pieces = Math.ceil(distance / step);
      for (let j = 0; j <= pieces; j++) {
        const t = j / pieces;
        const x = Math.round((a.x + dx * t) / 2) * 2;
        const y = Math.round((a.y + dy * t) / 2) * 2;
        target.fillRect(x - size / 2, y - size / 2, size, size);
      }
    }
  }

  function drawCurvedPixelPath(target, points, color, size, step, options = {}) {
    const world = points.map(toWorld);
    target.fillStyle = color;
    let stamp = 0;

    for (let i = 0; i < world.length - 1; i++) {
      const p0 = world[Math.max(0, i - 1)];
      const p1 = world[i];
      const p2 = world[i + 1];
      const p3 = world[Math.min(world.length - 1, i + 2)];
      const distance = Math.max(1, Math.hypot(p2.x - p1.x, p2.y - p1.y));
      const pieces = Math.ceil(distance / step);

      for (let j = 0; j <= pieces; j++) {
        const t = j / pieces;
        if (options.dash && stamp % 7 > 3) {
          stamp += 1;
          continue;
        }

        const point = catmullRom(p0, p1, p2, p3, t);
        const tangent = catmullTangent(p0, p1, p2, p3, t);
        const length = Math.max(1, Math.hypot(tangent.x, tangent.y));
        const wave = Math.sin((i * 1.77 + t * 2.85) * Math.PI);
        const offset = (options.wiggle || 0) * wave;
        const x = Math.round((point.x + (-tangent.y / length) * offset) / 2) * 2;
        const y = Math.round((point.y + (tangent.x / length) * offset) / 2) * 2;
        target.fillRect(x - size / 2, y - size / 2, size, size);
        stamp += 1;
      }
    }
  }

  function catmullRom(p0, p1, p2, p3, t) {
    const t2 = t * t;
    const t3 = t2 * t;
    return {
      x:
        0.5 *
        (2 * p1.x +
          (-p0.x + p2.x) * t +
          (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
          (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
      y:
        0.5 *
        (2 * p1.y +
          (-p0.y + p2.y) * t +
          (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
          (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3)
    };
  }

  function catmullTangent(p0, p1, p2, p3, t) {
    const t2 = t * t;
    return {
      x:
        0.5 *
        ((-p0.x + p2.x) +
          2 * (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t +
          3 * (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t2),
      y:
        0.5 *
        ((-p0.y + p2.y) +
          2 * (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t +
          3 * (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t2)
    };
  }

  function drawMountainRange(target, zone) {
    drawCurvedPixelPath(target, zone.points, "rgba(42, 58, 43, 0.76)", 19, 8, { wiggle: 1.4 });
    drawCurvedPixelPath(target, zone.points, palette.mountainDark, 13, 7, { wiggle: 1.2 });
    drawCurvedPixelPath(target, zone.points, palette.mountain, 8, 6, { wiggle: 1.1 });

    const samples = samplePath(zone.points.map(toWorld), zone.peakStep || 44);
    for (let i = 0; i < samples.length; i++) {
      const sample = samples[i];
      drawPeak(target, sample.x, sample.y, i % 3 === 0 ? 1.12 : 0.88);
    }

    if (state.showLabels && zone.labelPoint) {
      const p = toWorld(zone.labelPoint);
      drawLabelNear(target, zone.name, p.x, p.y, 12, 7, -5);
    }
  }

  function samplePath(points, spacing) {
    const samples = [];
    let carry = 0;
    for (let i = 0; i < points.length - 1; i++) {
      const a = points[i];
      const b = points[i + 1];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const distance = Math.max(1, Math.hypot(dx, dy));
      for (let d = spacing - carry; d < distance; d += spacing) {
        samples.push({ x: a.x + (dx * d) / distance, y: a.y + (dy * d) / distance });
      }
      carry = (carry + distance) % spacing;
    }
    return samples;
  }

  function drawPeak(target, x, y, scale) {
    const w = Math.round(13 * scale);
    const h = Math.round(10 * scale);
    const left = Math.round(x - w / 2);
    const top = Math.round(y - h / 2);
    target.fillStyle = "#2f3f34";
    target.fillRect(left + 1, top + h - 3, w - 2, 3);
    target.fillStyle = "#6f8f54";
    target.fillRect(left + 3, top + h - 6, w - 6, 3);
    target.fillRect(left + 5, top + h - 9, Math.max(3, w - 10), 3);
    target.fillStyle = "#dfe7d5";
    target.fillRect(left + Math.floor(w / 2) - 1, top + 1, 3, 3);
  }

  function drawLabelNear(target, text, x, y, size, dx = 6, dy = -2) {
    drawLabel(target, text, x + dx / state.zoom, y + dy / state.zoom, size);
  }

  function drawLabel(target, text, x, y, size) {
    target.save();
    const zoomAdjustedSize = (size * labelScale) / state.zoom;
    target.font = `700 ${zoomAdjustedSize}px 'Malgun Gothic', sans-serif`;
    target.lineWidth = (4 * labelScale) / state.zoom;
    target.strokeStyle = palette.labelShadow;
    target.fillStyle = palette.label;
    target.strokeText(text, Math.round(x), Math.round(y));
    target.fillText(text, Math.round(x), Math.round(y));
    target.restore();
  }

  function drawIcon(target, theme, x, y, scale = 1, fixedScreenSize = false) {
    const sprite = getSprite(theme);
    const zoomFactor = fixedScreenSize ? state.zoom : 1;
    const displayScale = fixedScreenSize ? scale * fixedIconScale : scale;
    const w = Math.round((sprite.width * displayScale) / zoomFactor);
    const h = Math.round((sprite.height * displayScale) / zoomFactor);
    target.drawImage(sprite, Math.round(x - w / 2), Math.round(y - h / 2), w, h);
  }

  function getSprite(theme) {
    if (!sprites.has(theme)) sprites.set(theme, createSprite(theme));
    return sprites.get(theme);
  }

  function createSprite(theme) {
    const sprite = document.createElement("canvas");
    sprite.width = 24;
    sprite.height = 24;
    const g = sprite.getContext("2d");
    g.imageSmoothingEnabled = false;
    const px = (x, y, w, h, color) => {
      g.fillStyle = color;
      g.fillRect(x, y, w, h);
    };

    px(9, 20, 6, 3, "rgba(0,0,0,0.28)");
    const farm = {
      outline: "#3f2e24",
      roof: "#b9553f",
      roofLight: "#df7651",
      wall: "#efd38f",
      wallShade: "#c99f5a",
      wood: "#76513a",
      grass: "#6fae5f",
      grassDark: "#4f8148",
      water: "#58b6c5",
      waterLight: "#a9e2dc",
      stone: "#8b8170",
      gold: "#f1c45d"
    };

    const cottage = (roof = farm.roof, wall = farm.wall, accent = farm.gold) => {
      px(5, 11, 14, 8, farm.outline);
      px(6, 10, 12, 8, wall);
      px(4, 8, 16, 3, farm.outline);
      px(5, 7, 14, 3, roof);
      px(7, 6, 10, 2, farm.roofLight);
      px(8, 13, 3, 5, farm.wood);
      px(14, 12, 3, 3, accent);
      px(15, 13, 1, 1, "#fff0b8");
      px(6, 18, 12, 2, farm.grassDark);
    };

    const tree = () => {
      px(10, 14, 4, 7, farm.wood);
      px(6, 8, 7, 7, farm.grass);
      px(12, 7, 7, 8, "#78b96a");
      px(8, 12, 9, 6, "#5d9d56");
      px(10, 6, 4, 3, "#9bd27d");
    };

    const baseMarker = (color = "#f2d27c") => {
      cottage(farm.roof, color, "#7fc7d1");
    };

    switch (theme) {
      case "capital":
        cottage("#a94638", "#f0d38a", "#7fc7d1");
        px(10, 3, 4, 4, farm.gold);
        px(9, 6, 6, 2, "#f8df7a");
        break;
      case "port":
        px(4, 16, 16, 4, palette.seaRouteDark);
        px(6, 12, 12, 4, palette.port);
        px(8, 10, 8, 2, "#d8d0b0");
        px(11, 5, 2, 6, farm.gold);
        px(5, 20, 14, 2, palette.seaRoute);
        px(7, 14, 10, 2, palette.portDark);
        break;
      case "airport":
        px(5, 12, 14, 3, "#d8e5e7");
        px(11, 5, 3, 15, "#f1f0d1");
        px(7, 16, 10, 2, "#d8e5e7");
        px(12, 3, 1, 3, "#d86048");
        break;
      case "industry":
      case "shipyard":
        px(4, 11, 16, 9, "#9aa2a6");
        px(6, 8, 3, 3, "#9aa2a6");
        px(10, 7, 3, 4, "#9aa2a6");
        px(15, 5, 3, 6, "#9aa2a6");
        px(6, 15, 3, 3, "#ffd36b");
        px(12, 15, 3, 3, "#ffd36b");
        break;
      case "tech":
        px(6, 6, 12, 12, "#273b4b");
        px(8, 8, 8, 8, "#57d3b7");
        px(11, 3, 2, 5, "#57d3b7");
        px(11, 16, 2, 5, "#57d3b7");
        px(3, 11, 5, 2, "#57d3b7");
        px(16, 11, 5, 2, "#57d3b7");
        break;
      case "volcano":
        px(5, 17, 14, 3, "#334932");
        px(7, 13, 10, 4, "#6f8f54");
        px(9, 9, 6, 4, "#8e5d41");
        px(11, 6, 2, 3, "#e9553d");
        px(10, 4, 4, 2, "#f2d27c");
        break;
      case "citrus":
        px(7, 8, 10, 10, "#f0a83a");
        px(9, 6, 6, 2, "#67a65d");
        px(10, 10, 2, 2, "#ffd980");
        px(14, 14, 2, 2, "#c76e2e");
        break;
      case "heritage":
        cottage("#8e4a34", palette.heritage, "#f4f1de");
        px(4, 7, 16, 2, "#5f3529");
        px(8, 5, 8, 2, "#e7c06a");
        break;
      case "tourist":
        px(7, 7, 10, 10, palette.tourism);
        px(6, 10, 12, 7, palette.tourismDark);
        px(9, 9, 6, 5, "#f4f1de");
        px(11, 11, 2, 2, "#26313a");
        px(10, 17, 4, 3, farm.wood);
        break;
      case "palace":
        px(4, 9, 16, 2, "#c84f38");
        px(6, 6, 12, 3, "#d86048");
        px(5, 12, 14, 8, palette.heritage);
        px(7, 15, 2, 5, "#7c4d25");
        px(15, 15, 2, 5, "#7c4d25");
        px(11, 4, 2, 2, "#f4f1de");
        break;
      case "shrine":
        px(5, 7, 14, 3, "#c84f38");
        px(7, 11, 10, 2, palette.heritage);
        px(8, 13, 2, 7, "#7c4d25");
        px(14, 13, 2, 7, "#7c4d25");
        px(10, 16, 4, 4, "#4b3427");
        break;
      case "pagoda":
        px(6, 7, 12, 2, palette.heritage);
        px(7, 10, 10, 2, palette.heritage);
        px(8, 13, 8, 2, palette.heritage);
        px(9, 16, 6, 2, palette.heritage);
        px(11, 5, 2, 14, "#7c4d25");
        break;
      case "dolmen":
        px(5, 9, 14, 4, "#8f8170");
        px(7, 13, 3, 7, "#6e6256");
        px(14, 13, 3, 7, "#6e6256");
        px(8, 7, 8, 2, "#b2a28b");
        break;
      case "school":
        px(5, 9, 14, 10, palette.heritage);
        px(4, 7, 16, 2, "#7c4d25");
        px(8, 12, 2, 7, "#4b3427");
        px(14, 12, 2, 7, "#4b3427");
        px(10, 4, 4, 3, "#f4f1de");
        break;
      case "temple":
      case "hanok":
        px(6, 6, 12, 2, "#c84f38");
        px(8, 9, 8, 2, "#e3c675");
        px(7, 12, 10, 2, "#c84f38");
        px(9, 15, 6, 5, "#e3c675");
        break;
      case "field":
        px(5, 7, 14, 12, "#c8b05a");
        px(6, 9, 12, 2, "#dfc96f");
        px(7, 8, 2, 10, farm.grass);
        px(11, 8, 2, 10, farm.grass);
        px(15, 8, 2, 10, farm.grass);
        px(6, 18, 12, 2, farm.grassDark);
        break;
      case "park":
        tree();
        break;
      case "mountain":
      case "snow":
        px(4, 18, 16, 3, farm.grassDark);
        px(5, 15, 14, 4, "#496b43");
        px(7, 11, 10, 5, "#6f8f54");
        px(9, 8, 6, 4, theme === "snow" ? "#f4f1de" : "#8dae62");
        px(11, 7, 2, 2, "#f5efd7");
        break;
      case "lake":
        px(5, 10, 14, 7, farm.water);
        px(7, 8, 10, 2, farm.waterLight);
        px(7, 15, 11, 2, "#2b7fa0");
        px(4, 17, 16, 2, farm.grassDark);
        break;
      case "wave":
        px(4, 11, 5, 3, "#9be2ed");
        px(9, 13, 5, 3, "#63c5da");
        px(14, 11, 5, 3, "#9be2ed");
        px(4, 16, 15, 3, "#2b7fa0");
        break;
      case "fortress":
        px(5, 8, 14, 12, "#9b7950");
        px(5, 5, 3, 3, "#9b7950");
        px(11, 5, 3, 3, "#9b7950");
        px(17, 5, 2, 3, "#9b7950");
        px(10, 14, 4, 6, "#4b3427");
        break;
      case "government":
        cottage("#7198ad", "#e6d6a6", "#f4f1de");
        px(7, 12, 2, 6, "#576878");
        px(15, 12, 2, 6, "#576878");
        break;
      case "light":
        px(11, 6, 2, 12, "#ffd36b");
        px(7, 10, 10, 5, "#f2d27c");
        px(5, 12, 2, 2, "#ffd36b");
        px(17, 12, 2, 2, "#ffd36b");
        px(10, 18, 4, 2, "#7c4d25");
        break;
      case "bridge":
        px(4, 12, 16, 3, "#d8d0b0");
        px(6, 15, 3, 5, "#9b7950");
        px(15, 15, 3, 5, "#9b7950");
        px(9, 16, 6, 2, "#63c5da");
        break;
      case "market":
        cottage("#d86048", "#f4d58d", "#69c7b8");
        px(6, 8, 12, 2, "#f4f1de");
        px(8, 13, 3, 5, "#ffd36b");
        px(13, 13, 3, 5, "#69c7b8");
        break;
      case "gate":
        px(4, 8, 16, 3, "#d86048");
        px(6, 11, 12, 2, "#f2d27c");
        px(7, 13, 3, 7, "#7c4d25");
        px(14, 13, 3, 7, "#7c4d25");
        break;
      case "village":
        cottage("#cf6b45", "#f2d27c", palette.tourism);
        px(4, 14, 4, 5, palette.tourism);
        break;
      case "riverRock":
        px(4, 16, 16, 3, "#63c5da");
        px(6, 10, 4, 6, "#8f8170");
        px(11, 7, 5, 9, "#b2a28b");
        px(16, 12, 3, 4, "#6e6256");
        break;
      case "science":
        px(6, 14, 12, 4, palette.tourism);
        px(10, 5, 4, 9, "#f4f1de");
        px(8, 5, 8, 2, "#69c7b8");
        px(7, 17, 10, 2, "#2b7fa0");
        break;
      case "cableCar":
        px(5, 6, 14, 2, "#d8d0b0");
        px(8, 10, 8, 7, palette.tourism);
        px(10, 12, 4, 3, "#26313a");
        px(11, 8, 2, 2, "#d8d0b0");
        px(7, 18, 10, 2, "#2b7fa0");
        break;
      case "restArea":
        cottage("#d77d3f", palette.restArea, "#7fc7d1");
        px(7, 8, 10, 2, palette.restAreaDark);
        px(8, 13, 5, 3, "#2b2e34");
        px(15, 11, 2, 6, "#2b2e34");
        break;
      case "station":
        cottage("#6f8f54", "#f2d27c", "#7fc7d1");
        px(7, 18, 12, 2, "#d8d0b0");
        px(7, 20, 2, 2, "#252b30");
        px(15, 20, 2, 2, "#252b30");
        break;
      case "port":
        px(4, 16, 16, 4, palette.seaRouteDark);
        px(6, 12, 12, 4, palette.port);
        px(8, 10, 8, 2, "#d8d0b0");
        px(11, 5, 2, 6, farm.gold);
        px(5, 20, 14, 2, palette.seaRoute);
        px(7, 14, 10, 2, palette.portDark);
        break;
      case "island":
      case "lighthouse":
        px(5, 16, 14, 4, "#c8b05a");
        px(7, 14, 10, 2, farm.grass);
        px(9, 7, 6, 9, "#f4f1de");
        px(10, 5, 4, 2, "#d86048");
        px(10, 10, 4, 2, farm.waterLight);
        break;
      case "mine":
        px(6, 15, 12, 5, "#5b6468");
        px(8, 11, 8, 4, "#737d82");
        px(10, 7, 4, 4, "#9aa2a6");
        px(5, 9, 3, 2, "#ffd36b");
        break;
      case "apple":
        px(8, 8, 8, 9, "#d94e3f");
        px(11, 5, 2, 3, "#7c4d25");
        px(13, 5, 4, 2, "#67a65d");
        px(10, 10, 2, 2, "#ffd9bd");
        break;
      case "flower":
        px(11, 11, 2, 8, "#67a65d");
        px(8, 7, 3, 3, "#ffb7c8");
        px(13, 7, 3, 3, "#ffb7c8");
        px(10, 10, 4, 4, "#ffd36b");
        px(8, 13, 3, 3, "#ffb7c8");
        px(13, 13, 3, 3, "#ffb7c8");
        break;
      case "film":
        px(5, 7, 14, 11, "#273b4b");
        px(7, 9, 2, 2, "#f4f1de");
        px(11, 9, 2, 2, "#f4f1de");
        px(15, 9, 2, 2, "#f4f1de");
        px(7, 14, 10, 2, "#f4f1de");
        break;
      case "hotSpring":
        px(6, 16, 12, 4, "#63c5da");
        px(8, 8, 2, 6, "#f4f1de");
        px(12, 6, 2, 8, "#f4f1de");
        px(16, 8, 2, 6, "#f4f1de");
        break;
      case "observatory":
      case "tower":
        px(11, 5, 2, 15, "#d8d0b0");
        px(8, 10, 8, 2, "#d8d0b0");
        px(7, 15, 10, 2, "#d8d0b0");
        px(10, 3, 4, 2, "#ffd36b");
        break;
      default:
        baseMarker();
    }

    const original = g.getImageData(0, 0, sprite.width, sprite.height);
    const outlined = g.createImageData(sprite.width, sprite.height);
    outlined.data.set(original.data);
    const outlineRgb = [63, 46, 36, 255];
    const setOutline = (x, y) => {
      if (x < 0 || y < 0 || x >= sprite.width || y >= sprite.height) return;
      const index = (y * sprite.width + x) * 4;
      if (original.data[index + 3] !== 0 || outlined.data[index + 3] !== 0) return;
      outlined.data[index] = outlineRgb[0];
      outlined.data[index + 1] = outlineRgb[1];
      outlined.data[index + 2] = outlineRgb[2];
      outlined.data[index + 3] = outlineRgb[3];
    };

    for (let y = 0; y < sprite.height; y++) {
      for (let x = 0; x < sprite.width; x++) {
        const index = (y * sprite.width + x) * 4;
        if (original.data[index + 3] <= 120) continue;
        setOutline(x - 1, y);
        setOutline(x + 1, y);
        setOutline(x, y - 1);
        setOutline(x, y + 1);
      }
    }
    g.putImageData(outlined, 0, 0);

    return sprite;
  }

  function drawPlayer(target) {
    const x = player.x;
    const y = player.y;
    const step = Math.floor(player.frame / 12) % 2;
    const legA = step === 0 ? 0 : 1;
    target.save();
    target.translate(x, y);
    target.scale(playerScale, playerScale);
    target.translate(-9, -18);
    const px = (a, b, w, h, color) => {
      target.fillStyle = color;
      target.fillRect(a, b, w, h);
    };
    px(5, 20, 8, 3, "rgba(0,0,0,0.3)");
    px(7, 2, 8, 8, "#f0c69a");
    px(6, 0, 10, 3, "#3c2a22");
    px(5, 9, 12, 8, "#4f86c6");
    px(4, 10, 3, 6, "#f0c69a");
    px(17, 10, 3, 6, "#f0c69a");
    px(7, 17, 3, 5 + legA, "#26313a");
    px(13, 17, 3, 6 - legA, "#26313a");
    px(7, 22, 4, 2, "#20262c");
    px(13, 22, 4, 2, "#20262c");
    if (player.direction === "left") px(6, 5, 2, 2, "#17202a");
    else if (player.direction === "right") px(14, 5, 2, 2, "#17202a");
    else {
      px(8, 5, 2, 2, "#17202a");
      px(13, 5, 2, 2, "#17202a");
    }
    target.restore();
  }

  function shouldDeferScrollRedraw(now) {
    if (!state.staticDirty || staticDirtyReason !== "scroll") return false;
    if (!lastStaticDrawTime) return false;
    const dx = Math.abs(viewScrollLeft - cachedStaticScrollLeft);
    const dy = Math.abs(viewScrollTop - cachedStaticScrollTop);
    if (dx > staticCachePaddingPx * 0.88 || dy > staticCachePaddingPx * 0.88) return false;
    if (now - lastPlayerMoveTime < playerMoveRedrawIdleMs) return true;
    if (now - lastCameraMoveTime < cameraMoveRedrawIdleMs) return true;
    return now - lastStaticDrawTime < staticScrollRedrawIntervalMs;
  }

  function drawStaticCache(target) {
    const dx = Math.round((cachedStaticScrollLeft - viewScrollLeft - staticCachePaddingPx) * renderPixelRatio);
    const dy = Math.round((cachedStaticScrollTop - viewScrollTop - staticCachePaddingPx) * renderPixelRatio);
    const sourceX = Math.max(0, -dx);
    const sourceY = Math.max(0, -dy);
    const destX = Math.max(0, dx);
    const destY = Math.max(0, dy);
    const width = Math.min(staticCanvas.width - sourceX, canvas.width - destX);
    const height = Math.min(staticCanvas.height - sourceY, canvas.height - destY);
    if (width <= 0 || height <= 0) return;
    target.drawImage(staticCanvas, sourceX, sourceY, width, height, destX, destY, width, height);
  }

  function render(now = performance.now()) {
    if (state.staticDirty && !shouldDeferScrollRedraw(now)) drawStatic();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawStaticCache(ctx);
    applyWorldTransform(ctx);
    drawPlayer(ctx);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    maybeSyncFrameScroll(now);
  }

  function animate(now) {
    const delta = Math.min(0.04, (now - (animate.last || now)) / 1000);
    animate.last = now;
    updatePlayer(delta, now);
    render(now);
    requestAnimationFrame(animate);
  }

  function updatePlayer(delta, now = performance.now()) {
    let dx = 0;
    let dy = 0;
    if (keys.has("ArrowLeft") || keys.has("KeyA") || keys.has("Numpad4")) dx -= 1;
    if (keys.has("ArrowRight") || keys.has("KeyD") || keys.has("Numpad6")) dx += 1;
    if (keys.has("ArrowUp") || keys.has("KeyW") || keys.has("Numpad8")) dy -= 1;
    if (keys.has("ArrowDown") || keys.has("KeyS") || keys.has("Numpad2")) dy += 1;
    if (keys.has("Numpad7") || keys.has("Home")) {
      dx -= 1;
      dy -= 1;
    }
    if (keys.has("Numpad9") || keys.has("PageUp")) {
      dx += 1;
      dy -= 1;
    }
    if (keys.has("Numpad1") || keys.has("End")) {
      dx -= 1;
      dy += 1;
    }
    if (keys.has("Numpad3") || keys.has("PageDown")) {
      dx += 1;
      dy += 1;
    }

    if (dx || dy) {
      const length = Math.hypot(dx, dy);
      dx /= length;
      dy /= length;
      player.x = clamp(player.x + dx * player.speed * delta, 20, mapWidth - 20);
      player.y = clamp(player.y + dy * player.speed * delta, 20, mapHeight - 20);
      player.direction = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? "left" : "right") : dy < 0 ? "up" : "down";
      player.frame += 1;
      lastPlayerMoveTime = now;
      keepPlayerVisible();
      updatePosition();
    }
  }

  function keepPlayerVisible() {
    const pad = Math.min(180, Math.max(100, Math.floor(Math.min(frame.clientWidth, frame.clientHeight) * 0.24)));
    const x = player.x * state.zoom;
    const y = player.y * state.zoom;
    let nextLeft = viewScrollLeft;
    let nextTop = viewScrollTop;
    if (x < viewScrollLeft + pad) nextLeft = Math.max(0, x - pad);
    if (y < viewScrollTop + pad) nextTop = Math.max(0, y - pad);
    if (x > viewScrollLeft + frame.clientWidth - pad) {
      nextLeft = x - frame.clientWidth + pad;
    }
    if (y > viewScrollTop + frame.clientHeight - pad) {
      nextTop = y - frame.clientHeight + pad;
    }
    setViewScroll(nextLeft, nextTop, { syncFrame: false });
  }

  function updatePosition(point = player) {
    const p = fromWorld(point.x, point.y);
    const text = `${p.lon.toFixed(3)}E, ${p.lat.toFixed(3)}N`;
    if (text !== lastPositionText) {
      positionReadout.textContent = text;
      lastPositionText = text;
    }
  }

  function updateSelectedPosition(place, fallbackPoint = null) {
    updatePosition(featurePosition(place, fallbackPoint));
  }

  function featurePosition(feature, fallbackPoint = null) {
    if (feature?.paths?.length) {
      return closestPointOnPaths(fallbackPoint || routePoint(feature), feature.paths);
    }
    if (feature?.path?.length >= 2) {
      return closestPointOnPath(fallbackPoint || pathMidpoint(feature.path), feature.path);
    }
    if (feature?.point?.length >= 2) return { x: feature.point[0], y: feature.point[1] };
    if (Number.isFinite(feature?.lon) && Number.isFinite(feature?.lat)) return toWorld([feature.lon, feature.lat]);
    return fallbackPoint || player;
  }

  function routePoint(route) {
    if (route?.point?.length >= 2) return { x: route.point[0], y: route.point[1] };
    const firstPath = route?.paths?.find((path) => path?.length);
    if (firstPath) return pathMidpoint(firstPath);
    return player;
  }

  function pathMidpoint(path) {
    return {
      x: path[Math.floor(path.length / 2)][0],
      y: path[Math.floor(path.length / 2)][1]
    };
  }

  function closestPointOnPath(point, path) {
    let best = { x: path[0][0], y: path[0][1] };
    let bestDistance = Infinity;
    for (let i = 1; i < path.length; i++) {
      const candidate = closestPointOnSegment(point, path[i - 1], path[i]);
      const distance = Math.hypot(point.x - candidate.x, point.y - candidate.y);
      if (distance < bestDistance) {
        best = candidate;
        bestDistance = distance;
      }
    }
    return best;
  }

  function closestPointOnPaths(point, paths) {
    let best = point || player;
    let bestDistance = Infinity;
    for (const path of paths || []) {
      if (!path?.length) continue;
      const candidate = closestPointOnPath(point, path);
      const distance = Math.hypot(point.x - candidate.x, point.y - candidate.y);
      if (distance < bestDistance) {
        best = candidate;
        bestDistance = distance;
      }
    }
    return best;
  }

  function closestPointOnSegment(point, start, end) {
    const dx = end[0] - start[0];
    const dy = end[1] - start[1];
    if (dx === 0 && dy === 0) return { x: start[0], y: start[1] };
    const t = clamp(((point.x - start[0]) * dx + (point.y - start[1]) * dy) / (dx * dx + dy * dy), 0, 1);
    return {
      x: start[0] + dx * t,
      y: start[1] + dy * t
    };
  }

  function updateInspector(place, focusPoint = null) {
    state.selectedPlace = place;
    updateSelectedPosition(place, focusPoint);
    if (place.type === "road") {
      inspectorTitle.textContent = place.name;
      const roadType = place.class === "expressway" ? "고속도로" : "국도";
      const segmentText = place.segmentCount ? ` 원본 ${place.segmentCount.toLocaleString("ko-KR")}개 선 조각을 하나의 노선으로 묶어 선택했습니다.` : "";
      inspectorBody.textContent = `${roadType}. OSM 기반 도로 경로이며, 현재 지도에는 약 ${formatKm(place.lengthKm)} 구간으로 표시됩니다.${segmentText}`;
      state.staticDirty = true;
      return;
    }

    if (place.type === "restArea") {
      inspectorTitle.textContent = place.name;
      const route = [place.roadName, place.direction || place.routeDirection].filter(Boolean).join(" / ");
      const food = place.signatureFood ? ` 대표 음식: ${place.signatureFood}.` : "";
      const phone = place.phone ? ` 전화: ${place.phone}.` : "";
      const parking = Number.isFinite(place.parkingSpaces) ? ` 주차 ${place.parkingSpaces.toLocaleString("ko-KR")}면.` : "";
      const amenities = formatRestAreaAmenities(place.amenities);
      inspectorBody.textContent = `${place.restType || "고속도로 휴게소"}. ${route || "고속도로"}의 공식 표준데이터 위치입니다.${food}${phone}${parking}${amenities}`;
      state.staticDirty = true;
      return;
    }

    if (place.type === "port") {
      inspectorTitle.textContent = place.name;
      const region = place.region ? `${place.region}. ` : "";
      inspectorBody.textContent = `항구. ${region}${place.role || "연안 여객 항구"}입니다. ${place.description || "지도 위 주요 해상 교통 거점으로 표시됩니다."}`;
      state.staticDirty = true;
      return;
    }

    if (place.type === "seaRoute") {
      inspectorTitle.textContent = place.name;
      const endpoint = [place.from, place.to].filter(Boolean).join(" → ");
      const distance = Number.isFinite(place.lengthKm) ? ` 약 ${formatKm(place.lengthKm)}.` : "";
      inspectorBody.textContent = `뱃길. ${place.category || "대표 여객 항로"}${endpoint ? ` (${endpoint})` : ""}.${distance} ${place.description || "실제 항법용 해도가 아닌 게임 지도용 대표 항로입니다."}`;
      state.staticDirty = true;
      return;
    }

    if (place.type === "river") {
      inspectorTitle.textContent = place.name;
      const width = place.widthMeters ? ` 추정 폭은 약 ${place.widthMeters.toLocaleString("ko-KR")}m입니다.` : "";
      inspectorBody.textContent = `주요 강. OSM 기반 수계 경로이며, 현재 지도에는 약 ${formatKm(place.lengthKm)} 구간으로 표시됩니다.${width}`;
      state.staticDirty = true;
      return;
    }

    if (place.type === "railway") {
      inspectorTitle.textContent = place.name;
      inspectorBody.textContent = `주요 철도 노선. OSM 기반 철도 경로이며, 현재 지도에는 약 ${formatKm(place.lengthKm)} 구간으로 표시됩니다.`;
      state.staticDirty = true;
      return;
    }

    if (place.type === "railwayStation") {
      inspectorTitle.textContent = place.name;
      const nameEn = place.nameEn ? ` / ${place.nameEn}` : "";
      const area = [place.province, place.city].filter(Boolean).join(" / ");
      inspectorBody.textContent = `철도역${nameEn}. HOT/HDX OSM 철도역 포인트 기반 위치입니다.${area ? ` 위치 분류: ${area}.` : ""}`;
      state.staticDirty = true;
      return;
    }

    if (place.type === "heritageSite") {
      inspectorTitle.textContent = place.name;
      const region = place.region ? `${place.region}. ` : "";
      const era = place.era ? `${place.era} 시대. ` : "";
      inspectorBody.textContent = `문화유적. ${region}${place.category || "문화유산"}. ${era}${place.description || "대표 문화유산 지점으로 표시됩니다."}`;
      state.staticDirty = true;
      return;
    }

    if (place.type === "touristSpot") {
      inspectorTitle.textContent = place.name;
      const region = place.region ? `${place.region}. ` : "";
      inspectorBody.textContent = `관광지. ${region}${place.category || "대표 관광지"}. ${place.description || "게임 지도에서 방문 지점으로 활용할 수 있는 관광 명소입니다."}`;
      state.staticDirty = true;
      return;
    }

    if (place.kind === "nationalPark") {
      inspectorTitle.textContent = place.name;
      inspectorBody.textContent = describeNationalPark(place);
      state.staticDirty = true;
      return;
    }

    if (place.icon === "lake") {
      inspectorTitle.textContent = place.name;
      inspectorBody.textContent = `호수. ${lakeDetails[place.id] || "주요 수변 지형으로 지도 위 자연 요소로 표시됩니다."}`;
      state.staticDirty = true;
      return;
    }

    if (place.kind === "mountain") {
      inspectorTitle.textContent = place.name;
      const elevation = place.elevation ? `${Math.round(place.elevation).toLocaleString("ko-KR")}m` : "고도 정보 없음";
      inspectorBody.textContent = `${elevation}. ${place.description}`;
      state.staticDirty = true;
      return;
    }

    if (place.kind === "island") {
      inspectorTitle.textContent = place.name;
      inspectorBody.textContent = `섬. ${place.description || "OSM 또는 보정 좌표 기반으로 표시한 주요 섬입니다."}`;
      state.staticDirty = true;
      return;
    }

    inspectorTitle.textContent = place.name;
    const area = place.province ? `${place.province} / ` : "";
    inspectorBody.textContent = `${area}${kindLabel(place.kind)}. ${place.motif || "OSM"} 모티프 아이콘으로 표시됩니다.`;
    state.staticDirty = true;
  }

  function kindLabel(kind) {
    const labels = {
      specialCity: "특별시/특별자치시",
      metroCity: "광역시",
      province: "시도",
      city: "시",
      town: "읍/면/동",
      county: "군",
      island: "섬"
    };
    return labels[kind] || kind;
  }

  function formatRestAreaAmenities(amenities = {}) {
    const labels = [
      ["fuel", "주유"],
      ["evCharging", "전기차 충전"],
      ["restaurant", "음식점"],
      ["store", "매점"],
      ["nursingRoom", "수유실"],
      ["maintenance", "경정비"],
      ["lpg", "LPG"],
      ["shelter", "쉼터"]
    ];
    const enabled = labels.filter(([key]) => amenities[key]).map(([, label]) => label);
    return enabled.length ? ` 편의시설: ${enabled.join(", ")}.` : "";
  }

  function formatKm(value) {
    if (!Number.isFinite(value)) return "알 수 없는 길이";
    return `${value.toLocaleString("ko-KR", { maximumFractionDigits: value >= 10 ? 0 : 1 })}km`;
  }

  function geoPathLengthKm(points) {
    if (!points || points.length < 2) return 0;
    let total = 0;
    for (let i = 1; i < points.length; i++) {
      total += haversineKm(points[i - 1], points[i]);
    }
    return total;
  }

  function haversineKm(a, b) {
    const radiusKm = 6371;
    const lat1 = (a[1] * Math.PI) / 180;
    const lat2 = (b[1] * Math.PI) / 180;
    const dLat = ((b[1] - a[1]) * Math.PI) / 180;
    const dLon = ((b[0] - a[0]) * Math.PI) / 180;
    const h =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return 2 * radiusKm * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  }

  function describeNationalPark(park) {
    if (park.description) return park.description;
    const name = park.name || "국립공원";
    if (/경주/.test(name)) return "역사 유산과 산지가 함께 보존된 국립공원입니다. 게임에서는 문화 유적과 자연 지형이 만나는 지역으로 활용하기 좋습니다.";
    if (/한려|다도해|태안/.test(name)) return "해안과 섬, 바다 경관이 중심인 국립공원입니다. 항로, 섬, 해안 지형 요소와 함께 배치하기 좋습니다.";
    if (/북한산|계룡산|속리산|월악산|소백산|오대산|설악산|태백산|덕유산|지리산|한라산|가야산|주왕산|치악산|팔공산|무등산|월출산|내장산/.test(name)) {
      return "산지 경관과 탐방로가 중심인 국립공원입니다. 산 아이콘, 능선, 숲 지형과 함께 표시하기 좋은 보호 구역입니다.";
    }
    if (/변산/.test(name)) return "반도 지형의 해안과 산지가 함께 나타나는 국립공원입니다. 바다와 산지 요소를 함께 배치하기 좋습니다.";
    return "OSM 좌표 기반으로 표시한 국립공원입니다. 자연 보호 구역과 주요 탐험 지점으로 활용할 수 있습니다.";
  }

  function findNearestPlace(x, y, radius = 20) {
    let best = null;
    let bestScore = radius;
    const sourcePlaces = real?.places?.length ? real.places : data.places;
    const selectablePlaces = sourcePlaces.filter(isPlaceKindVisible);
    if (state.showAdmin && state.showIslands) selectablePlaces.push(...selectableIslands);
    if (isNatureLayerVisible("showMountains")) selectablePlaces.push(...majorMountains);
    if (isNatureLayerVisible("showNationalParks")) selectablePlaces.push(...(real?.nationalParks || []).filter(isNationalParkVisible));
    if (isNatureLayerVisible("showLakes")) selectablePlaces.push(...data.lakes);
    if (state.showCultureTourism) {
      selectablePlaces.push(...heritageSites.filter(isCultureTourismVisible), ...touristSpots.filter(isCultureTourismVisible));
    }

    function consider(candidate, distance, priority = 0) {
      const score = distance + priority;
      if (score < bestScore) {
        best = candidate;
        bestScore = score;
      }
    }

    for (const place of selectablePlaces) {
      const p = placePoint(place);
      const d = Math.hypot(p.x - x, p.y - y);
      if (d < radius) consider(place, d);
    }

    if (state.showRailways && state.showRailwayStations && real?.railwayStations?.length) {
      for (const station of real.railwayStations) {
        if (!isRailwayStationVisible(station)) continue;
        const p = placePoint(station);
        const stationRadius = Math.max(radius, 16 / state.zoom);
        const d = Math.hypot(p.x - x, p.y - y);
        if (d < stationRadius) consider(station, d, station.labelWeight <= 1 ? 0 : 1.5 / state.zoom);
      }
    }

    if (state.showRoads && state.showRestAreas && real?.restAreas?.length) {
      for (const area of real.restAreas) {
        if (!isRestAreaVisible(area)) continue;
        const p = placePoint(area);
        const restAreaRadius = Math.max(radius, 17 / state.zoom);
        const d = Math.hypot(p.x - x, p.y - y);
        if (d < restAreaRadius) consider(area, d, -1 / state.zoom);
      }
    }

    const linePriority = 4 / state.zoom;
    if (state.showMaritime && state.showPorts && maritimePorts.length) {
      for (const port of maritimePorts) {
        if (!isPortVisible(port)) continue;
        const p = placePoint(port);
        const portRadius = Math.max(radius, 18 / state.zoom);
        const d = Math.hypot(p.x - x, p.y - y);
        if (d < portRadius) consider(port, d, -1 / state.zoom);
      }
    }

    if (state.showMaritime && state.showSeaRoutes && maritimeRoutes.length) {
      for (const route of maritimeRoutes) {
        if (!isSeaRouteVisible(route)) continue;
        const tolerance = 10 / state.zoom;
        const d = distanceToPath([x, y], route.path, tolerance);
        if (d <= tolerance) consider(route, d, linePriority);
      }
    }

    if (state.showRoads && selectableRoadRoutes.length) {
      for (const route of selectableRoadRoutes) {
        if (!isRoadClassEnabled(route)) continue;
        const tolerance = (route.class === "expressway" ? 9 : 7) / state.zoom;
        const d = distanceToPaths([x, y], route.paths, tolerance);
        if (d <= tolerance) consider(route, d, linePriority);
      }
    }

    if (isNatureLayerVisible("showRivers") && real?.rivers?.length) {
      for (const river of real.rivers) {
        const tolerance = Math.max(((river.displayWidth || 4) + 6) / state.zoom, 2.5);
        const d = distanceToPath([x, y], river.path, tolerance);
        if (d <= tolerance) consider(river, d, linePriority);
      }
    }

    if (state.showRailways && real?.railways?.length) {
      for (const rail of real.railways) {
        if (!isMajorRailway(rail)) continue;
        const tolerance = 8 / state.zoom;
        const d = distanceToPath([x, y], rail.path, tolerance);
        if (d <= tolerance) consider(rail, d, linePriority);
      }
    }

    return best;
  }

  function isLand(lon, lat) {
    return data.landPolygons.some((poly) => pointInPolygon([lon, lat], poly.points));
  }

  function isRealLand(x, y) {
    return (
      !!real?.countryLand?.some((country) => country.rings.some((ring) => pointInPolygon([x, y], ring))) ||
      !!real?.provinces?.some((province) => province.rings.some((ring) => pointInPolygon([x, y], ring)))
    );
  }

  function isInaccessibleCountryLand(x, y) {
    return inaccessibleCountryLand.some((country) => country.rings.some((ring) => pointInPolygon([x, y], ring)));
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

  function distanceToPath(point, path, limit = Infinity) {
    if (!path || path.length < 2) return Infinity;
    let best = Infinity;
    for (let i = 1; i < path.length; i++) {
      const d = distanceToSegment(point, path[i - 1], path[i]);
      if (d < best) best = d;
      if (best <= 0.01) return best;
    }
    return best;
  }

  function distanceToPaths(point, paths, limit = Infinity) {
    let best = Infinity;
    for (const path of paths || []) {
      const distance = distanceToPath(point, path, limit);
      if (distance < best) best = distance;
      if (best <= 0.01) return best;
    }
    return best;
  }

  function distanceToSegment(point, start, end) {
    const dx = end[0] - start[0];
    const dy = end[1] - start[1];
    if (dx === 0 && dy === 0) return Math.hypot(point[0] - start[0], point[1] - start[1]);
    const t = clamp(((point[0] - start[0]) * dx + (point[1] - start[1]) * dy) / (dx * dx + dy * dy), 0, 1);
    return Math.hypot(point[0] - (start[0] + dx * t), point[1] - (start[1] + dy * t));
  }

  function polygonCentroid(points) {
    const total = points.reduce(
      (acc, point) => {
        acc[0] += point[0];
        acc[1] += point[1];
        return acc;
      },
      [0, 0]
    );
    return [total[0] / points.length, total[1] / points.length];
  }

  function pseudo(x, y) {
    const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return n - Math.floor(n);
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function isNatureLayerVisible(key) {
    return state.showNature && state[key];
  }

  function isPlaceKindVisible(place) {
    if (!state.showAdmin) return false;
    if (place.kind === "province") return state.showProvinces;
    if (place.kind === "county") return state.showCounties;
    if (place.kind === "island") return state.showIslands;
    return state.showCities;
  }

  function isRoadClassEnabled(road) {
    if (!state.showRoads) return false;
    if (road.class === "expressway" || road.type === "expressway") return state.showExpressways;
    if (road.class === "national" || road.type === "national") return state.showNationalRoads;
    return true;
  }

  function setToggle(id, key) {
    const el = document.getElementById(id);
    if (!el) return;
    el.checked = state[key];
    el.addEventListener("change", () => {
      state[key] = el.checked;
      state.staticDirty = true;
      syncToggleGroups();
    });
  }

  function syncToggleGroups() {
    const groups = {
      toggleRoads: ["toggleExpressways", "toggleNationalRoads", "toggleRestAreas"],
      toggleRailways: ["toggleRailwayStations"],
      toggleMaritime: ["togglePorts", "toggleSeaRoutes"],
      toggleCultureTourism: ["toggleHeritageSites", "toggleTouristSpots"],
      toggleNature: ["toggleMountains", "toggleRivers", "toggleLakes", "toggleNationalParks"],
      toggleAdmin: ["toggleProvinces", "toggleCities", "toggleCounties", "toggleIslands"]
    };

    for (const [parentId, childIds] of Object.entries(groups)) {
      const parent = document.getElementById(parentId);
      const disabled = parent ? !parent.checked : false;
      for (const childId of childIds) {
        const child = document.getElementById(childId);
        if (!child) continue;
        child.disabled = disabled;
        child.closest("label")?.classList.toggle("disabled", disabled);
      }
    }
  }

  setToggle("toggleRoads", "showRoads");
  setToggle("toggleExpressways", "showExpressways");
  setToggle("toggleNationalRoads", "showNationalRoads");
  setToggle("toggleRestAreas", "showRestAreas");
  setToggle("toggleRailways", "showRailways");
  setToggle("toggleRailwayStations", "showRailwayStations");
  setToggle("toggleMaritime", "showMaritime");
  setToggle("togglePorts", "showPorts");
  setToggle("toggleSeaRoutes", "showSeaRoutes");
  setToggle("toggleCultureTourism", "showCultureTourism");
  setToggle("toggleHeritageSites", "showHeritageSites");
  setToggle("toggleTouristSpots", "showTouristSpots");
  setToggle("toggleNature", "showNature");
  setToggle("toggleMountains", "showMountains");
  setToggle("toggleRivers", "showRivers");
  setToggle("toggleLakes", "showLakes");
  setToggle("toggleNationalParks", "showNationalParks");
  setToggle("toggleAdmin", "showAdmin");
  setToggle("toggleProvinces", "showProvinces");
  setToggle("toggleCities", "showCities");
  setToggle("toggleCounties", "showCounties");
  setToggle("toggleIslands", "showIslands");
  setToggle("toggleBoundaries", "showBoundaries");
  setToggle("toggleLabels", "showLabels");
  setToggle("toggleGrid", "showGrid");
  syncToggleGroups();

  document.getElementById("zoomOut").addEventListener("click", () => setZoom(state.zoom - 0.15));
  document.getElementById("zoomIn").addEventListener("click", () => setZoom(state.zoom + 0.15));
  document.getElementById("zoomReset").addEventListener("click", () => setZoom(1));

  frame.addEventListener("scroll", () => {
    if (syncingFrameScroll) return;
    if (Math.abs(frame.scrollLeft - viewScrollLeft) < 0.5 && Math.abs(frame.scrollTop - viewScrollTop) < 0.5) return;
    viewScrollLeft = frame.scrollLeft;
    viewScrollTop = frame.scrollTop;
    frameScrollSyncPending = false;
    lastCameraMoveTime = performance.now();
    markStaticDirty("scroll");
  });

  if (window.ResizeObserver) {
    const resizeObserver = new ResizeObserver(() => updateCanvasScale());
    resizeObserver.observe(frame);
  } else {
    window.addEventListener("resize", updateCanvasScale);
  }

  frame.addEventListener(
    "wheel",
    (event) => {
      event.preventDefault();
      const wheelScale = clamp(Math.exp(-event.deltaY * 0.0015), 0.82, 1.22);
      setZoom(state.zoom * wheelScale, { clientX: event.clientX, clientY: event.clientY });
    },
    { passive: false }
  );

  function pointerCenter(pointerA, pointerB) {
    return {
      clientX: (pointerA.clientX + pointerB.clientX) / 2,
      clientY: (pointerA.clientY + pointerB.clientY) / 2
    };
  }

  function pointerDistance(pointerA, pointerB) {
    return Math.hypot(pointerA.clientX - pointerB.clientX, pointerA.clientY - pointerB.clientY);
  }

  function startPinchZoom() {
    const pointers = [...activePointers.values()];
    if (pointers.length < 2) return;
    pinchZoom.active = true;
    pinchZoom.startDistance = Math.max(1, pointerDistance(pointers[0], pointers[1]));
    pinchZoom.startZoom = state.zoom;
    dragPan.active = false;
    dragPan.pointerId = null;
    dragPan.moved = true;
    dragPan.suppressClick = true;
    frame.classList.remove("dragging");
  }

  function continueDragFromPointer(pointer) {
    dragPan.active = true;
    dragPan.pointerId = pointer.pointerId;
    dragPan.startX = pointer.clientX;
    dragPan.startY = pointer.clientY;
    dragPan.startScrollLeft = viewScrollLeft;
    dragPan.startScrollTop = viewScrollTop;
    dragPan.moved = true;
    frame.classList.add("dragging");
  }

  canvas.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    activePointers.set(event.pointerId, {
      pointerId: event.pointerId,
      clientX: event.clientX,
      clientY: event.clientY
    });
    canvas.setPointerCapture(event.pointerId);

    if (event.pointerType !== "mouse" && activePointers.size >= 2) {
      startPinchZoom();
      event.preventDefault();
      return;
    }

    dragPan.active = true;
    dragPan.pointerId = event.pointerId;
    dragPan.startX = event.clientX;
    dragPan.startY = event.clientY;
    dragPan.startScrollLeft = viewScrollLeft;
    dragPan.startScrollTop = viewScrollTop;
    dragPan.moved = false;
    dragPan.suppressClick = false;
    frame.classList.add("dragging");
  });

  canvas.addEventListener("pointermove", (event) => {
    if (activePointers.has(event.pointerId)) {
      activePointers.set(event.pointerId, {
        pointerId: event.pointerId,
        clientX: event.clientX,
        clientY: event.clientY
      });
    }

    if (pinchZoom.active && activePointers.size >= 2) {
      const pointers = [...activePointers.values()];
      const distance = Math.max(1, pointerDistance(pointers[0], pointers[1]));
      const center = pointerCenter(pointers[0], pointers[1]);
      setZoom(pinchZoom.startZoom * (distance / pinchZoom.startDistance), center);
      dragPan.suppressClick = true;
      event.preventDefault();
      return;
    }

    if (!dragPan.active || dragPan.pointerId !== event.pointerId) return;
    const dx = event.clientX - dragPan.startX;
    const dy = event.clientY - dragPan.startY;
    if (Math.abs(dx) + Math.abs(dy) > 3) dragPan.moved = true;
    setViewScroll(dragPan.startScrollLeft - dx, dragPan.startScrollTop - dy, { syncFrame: false });
    event.preventDefault();
  });

  function endDragPan(event) {
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    activePointers.delete(event.pointerId);

    if (pinchZoom.active) {
      pinchZoom.active = false;
      dragPan.suppressClick = true;
      if (activePointers.size === 1) {
        continueDragFromPointer([...activePointers.values()][0]);
      } else {
        dragPan.active = false;
        dragPan.pointerId = null;
        frame.classList.remove("dragging");
      }
      return;
    }

    if (!dragPan.active || dragPan.pointerId !== event.pointerId) return;
    dragPan.active = false;
    dragPan.pointerId = null;
    dragPan.suppressClick = dragPan.moved;
    frame.classList.remove("dragging");
    syncFrameScrollToView();
  }

  canvas.addEventListener("pointerup", endDragPan);
  canvas.addEventListener("pointercancel", endDragPan);

  window.addEventListener("keydown", (event) => {
    if (
      event.code.startsWith("Arrow") ||
      event.code.startsWith("Numpad") ||
      ["KeyW", "KeyA", "KeyS", "KeyD", "Home", "End", "PageUp", "PageDown"].includes(event.code)
    ) {
      keys.add(event.code);
      event.preventDefault();
    }
  });

  window.addEventListener("keyup", (event) => {
    keys.delete(event.code);
  });

  canvas.addEventListener("click", (event) => {
    if (dragPan.suppressClick) {
      dragPan.suppressClick = false;
      return;
    }
    const { x, y } = clientToWorld(event.clientX, event.clientY);
    const place = findNearestPlace(x, y, pointHitRadiusPx / state.zoom);
    if (place) updateInspector(place, { x, y });
  });

  canvas.addEventListener("mousemove", (event) => {
    if (dragPan.active) return;
    const { x, y } = clientToWorld(event.clientX, event.clientY);
    const place = findNearestPlace(x, y, hoverHitRadiusPx / state.zoom);
    if (place !== state.hoverPlace) {
      state.hoverPlace = place;
      canvas.style.cursor = place ? "pointer" : "grab";
      state.staticDirty = true;
    }
  });

  updateCanvasScale();
  updateInspector(state.selectedPlace);
  updatePosition();
  render();
  requestAnimationFrame(() => {
    resizeInitialScroll();
    requestAnimationFrame(animate);
  });
})();
