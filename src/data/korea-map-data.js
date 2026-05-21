window.KOREA_MAP_DATA = {
  meta: {
    title: "Korea 10km pixel map prototype",
    version: "0.1.0",
    tileKm: 10,
    tilePx: 18,
    bounds: {
      west: 124.35,
      east: 132.2,
      south: 32.85,
      north: 38.75
    },
    midLat: 36.15,
    notes: [
      "Coordinates are approximate WGS84 points for a game prototype.",
      "Jeju, Ulleungdo, and Dokdo are included as visible island polygons or markers.",
      "Replace with source SHP/API-derived GeoJSON for production GIS accuracy."
    ]
  },
  landPolygons: [
    {
      id: "mainland",
      name: "한반도 남부 본토",
      points: [
        [126.16, 38.28],
        [126.58, 38.02],
        [127.18, 38.32],
        [128.05, 38.43],
        [128.68, 38.2],
        [129.16, 37.78],
        [129.37, 37.25],
        [129.44, 36.68],
        [129.42, 36.18],
        [129.34, 35.72],
        [129.25, 35.38],
        [129.12, 35.1],
        [128.82, 34.86],
        [128.33, 34.62],
        [127.74, 34.5],
        [127.22, 34.43],
        [126.76, 34.32],
        [126.34, 34.58],
        [126.12, 35.02],
        [126.02, 35.44],
        [126.28, 35.82],
        [126.46, 36.16],
        [126.31, 36.55],
        [126.54, 36.92],
        [126.72, 37.27],
        [126.48, 37.68],
        [126.16, 38.28]
      ]
    },
    {
      id: "jeju",
      name: "제주도",
      points: [
        [126.1, 33.3],
        [126.25, 33.45],
        [126.58, 33.55],
        [126.86, 33.48],
        [126.96, 33.32],
        [126.78, 33.18],
        [126.4, 33.12],
        [126.14, 33.18],
        [126.1, 33.3]
      ]
    },
    {
      id: "ulleungdo",
      name: "울릉도",
      points: [
        [130.78, 37.5],
        [130.84, 37.56],
        [130.94, 37.55],
        [131.0, 37.49],
        [130.96, 37.43],
        [130.86, 37.42],
        [130.78, 37.5]
      ]
    },
    {
      id: "dokdo",
      name: "독도",
      points: [
        [131.84, 37.25],
        [131.87, 37.27],
        [131.9, 37.25],
        [131.88, 37.22],
        [131.84, 37.25]
      ]
    },
    {
      id: "geoje",
      name: "거제도",
      points: [
        [128.52, 34.93],
        [128.67, 34.94],
        [128.75, 34.82],
        [128.64, 34.72],
        [128.5, 34.78],
        [128.52, 34.93]
      ]
    },
    {
      id: "jindo",
      name: "진도",
      points: [
        [126.18, 34.5],
        [126.32, 34.51],
        [126.35, 34.38],
        [126.2, 34.33],
        [126.12, 34.42],
        [126.18, 34.5]
      ]
    }
  ],
  provinceBoundaries: [
    {
      id: "gyeonggi-gangwon",
      name: "경기·강원 경계",
      points: [
        [126.72, 37.78],
        [127.05, 37.96],
        [127.42, 37.9],
        [127.72, 37.67],
        [128.0, 37.47],
        [128.22, 37.34]
      ],
      labelPoint: [127.52, 37.78]
    },
    {
      id: "gyeonggi-chungcheong",
      name: "경기·충청 경계",
      points: [
        [126.72, 37.05],
        [127.03, 37.0],
        [127.28, 36.9],
        [127.55, 36.77],
        [127.78, 36.66]
      ],
      labelPoint: [127.18, 36.92]
    },
    {
      id: "gangwon-chungbuk-gyeongbuk",
      name: "강원·충북·경북 경계",
      points: [
        [127.78, 36.66],
        [128.03, 36.88],
        [128.32, 37.05],
        [128.56, 37.22],
        [128.82, 37.1]
      ],
      labelPoint: [128.28, 36.97]
    },
    {
      id: "chungnam-chungbuk",
      name: "충남·충북 경계",
      points: [
        [126.9, 36.62],
        [127.15, 36.56],
        [127.38, 36.48],
        [127.58, 36.36],
        [127.74, 36.18]
      ],
      labelPoint: [127.25, 36.43]
    },
    {
      id: "chungcheong-jeonbuk",
      name: "충청·전북 경계",
      points: [
        [126.58, 36.05],
        [126.86, 36.02],
        [127.12, 36.04],
        [127.42, 35.98],
        [127.72, 35.9]
      ],
      labelPoint: [127.08, 36.05]
    },
    {
      id: "jeonbuk-jeonnam",
      name: "전북·전남 경계",
      points: [
        [126.52, 35.42],
        [126.78, 35.35],
        [127.03, 35.34],
        [127.26, 35.5],
        [127.5, 35.48],
        [127.72, 35.34]
      ],
      labelPoint: [127.07, 35.42]
    },
    {
      id: "jeolla-gyeongnam",
      name: "전라·경남 경계",
      points: [
        [127.5, 35.48],
        [127.7, 35.38],
        [127.86, 35.18],
        [128.05, 35.12],
        [128.24, 35.18]
      ],
      labelPoint: [127.86, 35.28]
    },
    {
      id: "gyeongbuk-gyeongnam",
      name: "경북·경남 경계",
      points: [
        [127.72, 35.9],
        [128.05, 35.78],
        [128.35, 35.66],
        [128.62, 35.47],
        [128.9, 35.36],
        [129.16, 35.28]
      ],
      labelPoint: [128.5, 35.58]
    },
    {
      id: "chungbuk-gyeongbuk",
      name: "충북·경북 경계",
      points: [
        [127.74, 36.18],
        [128.05, 36.28],
        [128.3, 36.38],
        [128.55, 36.58],
        [128.76, 36.73]
      ],
      labelPoint: [128.25, 36.38]
    },
    {
      id: "seoul-boundary",
      name: "서울",
      closed: true,
      points: [
        [126.78, 37.7],
        [127.18, 37.68],
        [127.2, 37.47],
        [126.82, 37.43]
      ],
      labelPoint: [126.98, 37.64]
    },
    {
      id: "incheon-boundary",
      name: "인천",
      closed: true,
      points: [
        [126.45, 37.62],
        [126.82, 37.58],
        [126.78, 37.28],
        [126.44, 37.28]
      ],
      labelPoint: [126.58, 37.45]
    },
    {
      id: "sejong-boundary",
      name: "세종",
      closed: true,
      points: [
        [127.18, 36.58],
        [127.38, 36.56],
        [127.38, 36.38],
        [127.17, 36.36]
      ],
      labelPoint: [127.28, 36.53]
    },
    {
      id: "daejeon-boundary",
      name: "대전",
      closed: true,
      points: [
        [127.26, 36.45],
        [127.52, 36.44],
        [127.53, 36.25],
        [127.26, 36.24]
      ],
      labelPoint: [127.38, 36.29]
    },
    {
      id: "gwangju-boundary",
      name: "광주",
      closed: true,
      points: [
        [126.74, 35.24],
        [126.98, 35.24],
        [126.98, 35.08],
        [126.74, 35.08]
      ],
      labelPoint: [126.86, 35.22]
    },
    {
      id: "daegu-boundary",
      name: "대구",
      closed: true,
      points: [
        [128.43, 35.98],
        [128.78, 35.98],
        [128.78, 35.75],
        [128.43, 35.75]
      ],
      labelPoint: [128.6, 35.95]
    },
    {
      id: "busan-ulsan-boundary",
      name: "부산·울산",
      points: [
        [129.0, 35.42],
        [129.18, 35.34],
        [129.25, 35.18],
        [129.15, 35.04],
        [128.98, 35.0]
      ],
      labelPoint: [129.17, 35.31]
    },
    {
      id: "jeju-boundary",
      name: "제주",
      closed: true,
      points: [
        [126.08, 33.46],
        [126.54, 33.6],
        [126.98, 33.43],
        [126.9, 33.15],
        [126.42, 33.06],
        [126.05, 33.2]
      ],
      labelPoint: [126.32, 33.42]
    }
  ],
  terrainZones: [
    {
      id: "baekdudaegan",
      type: "mountainRange",
      name: "백두대간 남부 산지",
      points: [
        [128.47, 38.12],
        [128.58, 37.9],
        [128.55, 37.75],
        [128.66, 37.48],
        [128.58, 37.35],
        [128.82, 36.95],
        [128.66, 36.72],
        [128.72, 36.55],
        [128.45, 36.15],
        [128.18, 35.98],
        [128.0, 35.86],
        [127.73, 35.45],
        [127.58, 35.28],
        [127.5, 35.18]
      ],
      labelPoint: [128.55, 36.92],
      peakStep: 34
    },
    {
      id: "taebaek-range",
      type: "mountainRange",
      name: "태백산맥",
      points: [
        [128.43, 38.25],
        [128.72, 37.92],
        [128.98, 37.55],
        [129.14, 37.12],
        [129.26, 36.72],
        [129.33, 36.32],
        [129.36, 35.95]
      ],
      labelPoint: [129.05, 37.18],
      peakStep: 36
    },
    {
      id: "sobaek-range",
      type: "mountainRange",
      name: "소백산맥",
      points: [
        [128.78, 36.76],
        [128.48, 36.55],
        [128.16, 36.32],
        [127.86, 36.08],
        [127.63, 35.8],
        [127.44, 35.5],
        [127.73, 35.34]
      ],
      labelPoint: [128.05, 36.2],
      peakStep: 36
    },
    {
      id: "charyeong-range",
      type: "mountainRange",
      name: "차령산맥",
      points: [
        [127.78, 36.8],
        [127.52, 36.66],
        [127.26, 36.52],
        [126.98, 36.38],
        [126.74, 36.28]
      ],
      labelPoint: [127.25, 36.66],
      peakStep: 40
    },
    {
      id: "noryeong-range",
      type: "mountainRange",
      name: "노령산맥",
      points: [
        [127.65, 35.82],
        [127.38, 35.66],
        [127.05, 35.48],
        [126.74, 35.28],
        [126.44, 35.08]
      ],
      labelPoint: [127.0, 35.62],
      peakStep: 40
    },
    {
      id: "yeongnam-alps",
      type: "mountainRange",
      name: "영남알프스",
      points: [
        [128.78, 35.72],
        [128.95, 35.58],
        [129.05, 35.42],
        [129.18, 35.34]
      ],
      labelPoint: [128.9, 35.58],
      peakStep: 28
    },
    {
      id: "honam-plain",
      type: "field",
      name: "호남평야",
      polygon: [
        [126.65, 35.95],
        [127.2, 35.9],
        [127.25, 35.55],
        [126.88, 35.25],
        [126.55, 35.35],
        [126.5, 35.72],
        [126.65, 35.95]
      ]
    },
    {
      id: "nonsan-plain",
      type: "field",
      name: "논산/금강 평야",
      polygon: [
        [126.95, 36.45],
        [127.35, 36.42],
        [127.3, 36.12],
        [126.88, 36.08],
        [126.78, 36.25],
        [126.95, 36.45]
      ]
    },
    {
      id: "nakdong-delta",
      type: "field",
      name: "낙동강 하구 평야",
      polygon: [
        [128.75, 35.38],
        [129.2, 35.32],
        [129.23, 35.02],
        [128.9, 34.88],
        [128.65, 35.02],
        [128.75, 35.38]
      ]
    },
    {
      id: "cheorwon-plain",
      type: "field",
      name: "철원평야",
      polygon: [
        [127.1, 38.35],
        [127.42, 38.35],
        [127.45, 38.12],
        [127.1, 38.08],
        [127.0, 38.2],
        [127.1, 38.35]
      ]
    }
  ],
  rivers: [
    {
      id: "han",
      name: "한강",
      points: [
        [128.9, 37.16],
        [128.62, 37.24],
        [128.35, 37.22],
        [128.1, 37.32],
        [127.85, 37.42],
        [127.62, 37.48],
        [127.35, 37.33],
        [127.05, 37.52],
        [126.94, 37.53],
        [126.8, 37.54],
        [126.68, 37.57],
        [126.58, 37.58]
      ]
    },
    {
      id: "nakdong",
      name: "낙동강",
      points: [
        [128.98, 37.1],
        [128.9, 36.88],
        [128.78, 36.58],
        [128.64, 36.42],
        [128.52, 36.25],
        [128.44, 36.05],
        [128.38, 35.9],
        [128.34, 35.68],
        [128.42, 35.52],
        [128.55, 35.38],
        [128.75, 35.22],
        [128.88, 35.14],
        [128.96, 35.08]
      ]
    },
    {
      id: "geum",
      name: "금강",
      points: [
        [127.72, 36.42],
        [127.55, 36.55],
        [127.36, 36.46],
        [127.35, 36.35],
        [127.12, 36.25],
        [126.96, 36.23],
        [126.88, 36.18],
        [126.82, 36.04],
        [126.72, 36.0],
        [126.65, 35.95]
      ]
    },
    {
      id: "yeongsan",
      name: "영산강",
      points: [
        [127.0, 35.25],
        [126.92, 35.14],
        [126.9, 35.08],
        [126.75, 34.98],
        [126.64, 34.88],
        [126.55, 34.82],
        [126.45, 34.8],
        [126.38, 34.78]
      ]
    },
    {
      id: "seomjin",
      name: "섬진강",
      points: [
        [127.45, 35.7],
        [127.35, 35.55],
        [127.38, 35.45],
        [127.48, 35.34],
        [127.55, 35.22],
        [127.66, 35.1],
        [127.68, 35.05],
        [127.78, 34.92]
      ]
    }
  ],
  lakes: [
    { id: "soyang", name: "소양호", lon: 127.85, lat: 37.92, icon: "lake" },
    { id: "chungju", name: "충주호", lon: 128.02, lat: 37.0, icon: "lake" },
    { id: "daecheong", name: "대청호", lon: 127.48, lat: 36.37, icon: "lake" },
    { id: "andong", name: "안동호", lon: 128.78, lat: 36.58, icon: "lake" },
    { id: "jinyang", name: "진양호", lon: 128.02, lat: 35.15, icon: "lake" }
  ],
  mountains: [
    { id: "seorak", name: "설악산", lon: 128.47, lat: 38.12, icon: "snow" },
    { id: "odae", name: "오대산", lon: 128.59, lat: 37.79, icon: "mountain" },
    { id: "taebaek", name: "태백산", lon: 128.92, lat: 37.1, icon: "mountain" },
    { id: "sobaek", name: "소백산", lon: 128.48, lat: 36.96, icon: "mountain" },
    { id: "songni", name: "속리산", lon: 127.86, lat: 36.54, icon: "mountain" },
    { id: "deogyu", name: "덕유산", lon: 127.75, lat: 35.86, icon: "mountain" },
    { id: "jiri", name: "지리산", lon: 127.73, lat: 35.34, icon: "mountain" },
    { id: "halla", name: "한라산", lon: 126.53, lat: 33.36, icon: "volcano" },
    { id: "palgong", name: "팔공산", lon: 128.7, lat: 36.02, icon: "mountain" },
    { id: "gaya", name: "가야산", lon: 128.1, lat: 35.82, icon: "temple" }
  ],
  roads: [
    {
      id: "gyeongbu",
      name: "경부고속도로",
      type: "expressway",
      points: [
        [126.98, 37.57],
        [127.03, 37.26],
        [127.09, 37.11],
        [127.13, 37.0],
        [127.15, 36.82],
        [127.39, 36.82],
        [127.43, 36.62],
        [127.42, 36.35],
        [127.82, 36.22],
        [128.34, 36.12],
        [128.5, 36.02],
        [128.6, 35.87],
        [128.88, 35.9],
        [129.21, 35.85],
        [129.18, 35.55],
        [129.08, 35.18]
      ]
    },
    {
      id: "yeongdong",
      name: "영동고속도로",
      type: "expressway",
      points: [
        [126.7, 37.45],
        [127.03, 37.26],
        [127.32, 37.31],
        [127.64, 37.49],
        [127.93, 37.34],
        [128.08, 37.43],
        [128.22, 37.52],
        [128.58, 37.68],
        [128.88, 37.75],
        [128.9, 37.75]
      ]
    },
    {
      id: "seoul-yangyang",
      name: "서울양양고속도로",
      type: "expressway",
      points: [
        [126.98, 37.57],
        [127.21, 37.54],
        [127.48, 37.62],
        [127.73, 37.68],
        [127.96, 37.84],
        [128.19, 38.07],
        [128.42, 38.08],
        [128.62, 38.08]
      ]
    },
    {
      id: "seohaean",
      name: "서해안고속도로",
      type: "expressway",
      points: [
        [126.7, 37.45],
        [126.78, 37.2],
        [126.99, 37.0],
        [127.11, 36.99],
        [126.78, 36.77],
        [126.45, 36.78],
        [126.62, 36.38],
        [126.71, 35.97],
        [126.68, 35.72],
        [126.72, 35.43],
        [126.64, 35.16],
        [126.39, 34.81]
      ]
    },
    {
      id: "honam",
      name: "호남고속도로",
      type: "expressway",
      points: [
        [127.42, 36.35],
        [127.28, 36.26],
        [127.1, 36.18],
        [127.2, 36.0],
        [127.15, 35.82],
        [126.98, 35.55],
        [126.85, 35.16],
        [126.79, 35.02],
        [126.39, 34.81]
      ]
    },
    {
      id: "namhae",
      name: "남해고속도로",
      type: "expressway",
      points: [
        [129.08, 35.18],
        [128.68, 35.23],
        [128.42, 35.2],
        [128.08, 35.18],
        [127.66, 34.94],
        [127.49, 34.95],
        [127.28, 34.88],
        [127.0, 34.76],
        [126.66, 34.78],
        [126.39, 34.81]
      ]
    },
    {
      id: "donghae",
      name: "동해고속도로",
      type: "expressway",
      points: [
        [128.59, 38.2],
        [128.72, 38.02],
        [128.9, 37.75],
        [129.11, 37.52],
        [129.23, 37.25],
        [129.4, 36.99],
        [129.38, 36.54],
        [129.37, 36.04],
        [129.21, 35.85],
        [129.31, 35.54],
        [129.08, 35.18]
      ]
    },
    {
      id: "jungang",
      name: "중앙고속도로",
      type: "expressway",
      points: [
        [127.73, 37.88],
        [127.93, 37.34],
        [128.05, 37.2],
        [128.19, 37.13],
        [128.36, 36.89],
        [128.56, 36.72],
        [128.73, 36.57],
        [128.66, 36.24],
        [128.6, 35.87]
      ]
    },
    {
      id: "national-1",
      name: "국도 1호선",
      type: "national",
      points: [
        [126.98, 37.57],
        [127.03, 37.26],
        [127.08, 37.05],
        [127.15, 36.8],
        [127.32, 36.6],
        [127.42, 36.35],
        [127.29, 36.05],
        [127.15, 35.82],
        [126.98, 35.5],
        [126.85, 35.16],
        [126.72, 35.0],
        [126.39, 34.81]
      ]
    },
    {
      id: "national-7",
      name: "국도 7호선",
      type: "national",
      points: [
        [128.59, 38.2],
        [128.74, 38.0],
        [128.9, 37.75],
        [129.11, 37.52],
        [129.3, 37.24],
        [129.41, 36.99],
        [129.43, 36.55],
        [129.4, 36.04],
        [129.37, 35.97],
        [129.31, 35.54],
        [129.08, 35.18]
      ]
    },
    {
      id: "national-17",
      name: "국도 17호선",
      type: "national",
      points: [
        [127.48, 34.95],
        [127.49, 34.76],
        [127.44, 35.1],
        [127.38, 35.42],
        [127.25, 35.62],
        [127.15, 35.82],
        [127.28, 36.08],
        [127.42, 36.35],
        [127.49, 36.64]
      ]
    }
  ],
  places: [
    { id: "seoul", name: "서울특별시", kind: "specialCity", province: "서울", lon: 126.978, lat: 37.566, icon: "capital", motif: "궁궐", labelWeight: 1 },
    { id: "busan", name: "부산광역시", kind: "metroCity", province: "부산", lon: 129.075, lat: 35.18, icon: "port", motif: "항구", labelWeight: 1 },
    { id: "daegu", name: "대구광역시", kind: "metroCity", province: "대구", lon: 128.601, lat: 35.872, icon: "apple", motif: "분지 도시", labelWeight: 1 },
    { id: "incheon", name: "인천광역시", kind: "metroCity", province: "인천", lon: 126.705, lat: 37.456, icon: "airport", motif: "공항/항만", labelWeight: 1 },
    { id: "gwangju", name: "광주광역시", kind: "metroCity", province: "광주", lon: 126.852, lat: 35.16, icon: "light", motif: "빛", labelWeight: 1 },
    { id: "daejeon", name: "대전광역시", kind: "metroCity", province: "대전", lon: 127.385, lat: 36.35, icon: "tech", motif: "과학", labelWeight: 1 },
    { id: "ulsan", name: "울산광역시", kind: "metroCity", province: "울산", lon: 129.311, lat: 35.539, icon: "industry", motif: "산업", labelWeight: 1 },
    { id: "sejong", name: "세종특별자치시", kind: "specialCity", province: "세종", lon: 127.289, lat: 36.48, icon: "government", motif: "행정", labelWeight: 1 },
    { id: "suwon", name: "수원시", kind: "city", province: "경기", lon: 127.028, lat: 37.263, icon: "fortress", motif: "화성", labelWeight: 2 },
    { id: "goyang", name: "고양시", kind: "city", province: "경기", lon: 126.835, lat: 37.658, icon: "flower", motif: "호수공원", labelWeight: 3 },
    { id: "seongnam", name: "성남시", kind: "city", province: "경기", lon: 127.126, lat: 37.42, icon: "tech", motif: "판교", labelWeight: 3 },
    { id: "yongin", name: "용인시", kind: "city", province: "경기", lon: 127.178, lat: 37.241, icon: "tower", motif: "관광", labelWeight: 3 },
    { id: "bucheon", name: "부천시", kind: "city", province: "경기", lon: 126.766, lat: 37.503, icon: "film", motif: "문화", labelWeight: 4 },
    { id: "ansan", name: "안산시", kind: "city", province: "경기", lon: 126.831, lat: 37.322, icon: "industry", motif: "해안 산업", labelWeight: 4 },
    { id: "hwaseong", name: "화성시", kind: "city", province: "경기", lon: 126.832, lat: 37.199, icon: "industry", motif: "서해 산업", labelWeight: 4 },
    { id: "pyeongtaek", name: "평택시", kind: "city", province: "경기", lon: 127.112, lat: 36.992, icon: "port", motif: "항만", labelWeight: 4 },
    { id: "gapyeong", name: "가평군", kind: "county", province: "경기", lon: 127.51, lat: 37.831, icon: "mountain", motif: "산림", labelWeight: 5 },
    { id: "chuncheon", name: "춘천시", kind: "city", province: "강원", lon: 127.73, lat: 37.881, icon: "lake", motif: "호반", labelWeight: 2 },
    { id: "wonju", name: "원주시", kind: "city", province: "강원", lon: 127.92, lat: 37.342, icon: "bridge", motif: "내륙 교통", labelWeight: 3 },
    { id: "gangneung", name: "강릉시", kind: "city", province: "강원", lon: 128.876, lat: 37.752, icon: "wave", motif: "동해", labelWeight: 2 },
    { id: "sokcho", name: "속초시", kind: "city", province: "강원", lon: 128.591, lat: 38.207, icon: "snow", motif: "설악", labelWeight: 3 },
    { id: "donghae", name: "동해시", kind: "city", province: "강원", lon: 129.114, lat: 37.524, icon: "wave", motif: "항만", labelWeight: 4 },
    { id: "taebaek", name: "태백시", kind: "city", province: "강원", lon: 128.986, lat: 37.164, icon: "mine", motif: "고원", labelWeight: 4 },
    { id: "pyeongchang", name: "평창군", kind: "county", province: "강원", lon: 128.39, lat: 37.37, icon: "snow", motif: "고원", labelWeight: 4 },
    { id: "cheongju", name: "청주시", kind: "city", province: "충북", lon: 127.489, lat: 36.642, icon: "field", motif: "내륙 평야", labelWeight: 2 },
    { id: "chungju", name: "충주시", kind: "city", province: "충북", lon: 127.925, lat: 36.991, icon: "lake", motif: "충주호", labelWeight: 3 },
    { id: "jecheon", name: "제천시", kind: "city", province: "충북", lon: 128.191, lat: 37.132, icon: "mountain", motif: "의림지", labelWeight: 4 },
    { id: "danyang", name: "단양군", kind: "county", province: "충북", lon: 128.366, lat: 36.984, icon: "mountain", motif: "석회암 산지", labelWeight: 4 },
    { id: "cheonan", name: "천안시", kind: "city", province: "충남", lon: 127.152, lat: 36.815, icon: "bridge", motif: "교통", labelWeight: 2 },
    { id: "asan", name: "아산시", kind: "city", province: "충남", lon: 127.004, lat: 36.789, icon: "hotSpring", motif: "온천", labelWeight: 4 },
    { id: "gongju", name: "공주시", kind: "city", province: "충남", lon: 127.119, lat: 36.446, icon: "temple", motif: "백제", labelWeight: 3 },
    { id: "boryeong", name: "보령시", kind: "city", province: "충남", lon: 126.612, lat: 36.333, icon: "wave", motif: "서해", labelWeight: 4 },
    { id: "seosan", name: "서산시", kind: "city", province: "충남", lon: 126.45, lat: 36.784, icon: "field", motif: "간척지", labelWeight: 4 },
    { id: "taean", name: "태안군", kind: "county", province: "충남", lon: 126.298, lat: 36.745, icon: "wave", motif: "해안", labelWeight: 4 },
    { id: "jeonju", name: "전주시", kind: "city", province: "전북", lon: 127.148, lat: 35.824, icon: "hanok", motif: "한옥", labelWeight: 2 },
    { id: "gunsan", name: "군산시", kind: "city", province: "전북", lon: 126.736, lat: 35.967, icon: "port", motif: "금강 하구", labelWeight: 3 },
    { id: "iksan", name: "익산시", kind: "city", province: "전북", lon: 126.957, lat: 35.948, icon: "temple", motif: "미륵사지", labelWeight: 4 },
    { id: "namwon", name: "남원시", kind: "city", province: "전북", lon: 127.39, lat: 35.416, icon: "mountain", motif: "지리산 관문", labelWeight: 4 },
    { id: "muju", name: "무주군", kind: "county", province: "전북", lon: 127.66, lat: 36.007, icon: "mountain", motif: "덕유산", labelWeight: 5 },
    { id: "mokpo", name: "목포시", kind: "city", province: "전남", lon: 126.392, lat: 34.812, icon: "port", motif: "항구", labelWeight: 2 },
    { id: "yeosu", name: "여수시", kind: "city", province: "전남", lon: 127.662, lat: 34.761, icon: "wave", motif: "남해", labelWeight: 2 },
    { id: "suncheon", name: "순천시", kind: "city", province: "전남", lon: 127.487, lat: 34.95, icon: "field", motif: "습지", labelWeight: 3 },
    { id: "gwangyang", name: "광양시", kind: "city", province: "전남", lon: 127.695, lat: 34.94, icon: "industry", motif: "제철", labelWeight: 4 },
    { id: "naju", name: "나주시", kind: "city", province: "전남", lon: 126.71, lat: 35.016, icon: "field", motif: "영산강", labelWeight: 4 },
    { id: "haenam", name: "해남군", kind: "county", province: "전남", lon: 126.6, lat: 34.573, icon: "field", motif: "땅끝", labelWeight: 4 },
    { id: "wando", name: "완도군", kind: "county", province: "전남", lon: 126.755, lat: 34.311, icon: "wave", motif: "섬", labelWeight: 5 },
    { id: "pohang", name: "포항시", kind: "city", province: "경북", lon: 129.365, lat: 36.019, icon: "industry", motif: "제철/항만", labelWeight: 2 },
    { id: "gyeongju", name: "경주시", kind: "city", province: "경북", lon: 129.224, lat: 35.856, icon: "temple", motif: "신라", labelWeight: 2 },
    { id: "andong", name: "안동시", kind: "city", province: "경북", lon: 128.729, lat: 36.568, icon: "hanok", motif: "하회", labelWeight: 3 },
    { id: "gumi", name: "구미시", kind: "city", province: "경북", lon: 128.344, lat: 36.119, icon: "tech", motif: "전자 산업", labelWeight: 3 },
    { id: "gimcheon", name: "김천시", kind: "city", province: "경북", lon: 128.114, lat: 36.139, icon: "bridge", motif: "교통", labelWeight: 4 },
    { id: "yeongju", name: "영주시", kind: "city", province: "경북", lon: 128.625, lat: 36.805, icon: "temple", motif: "부석사", labelWeight: 4 },
    { id: "uljin", name: "울진군", kind: "county", province: "경북", lon: 129.4, lat: 36.993, icon: "wave", motif: "동해", labelWeight: 4 },
    { id: "ulleung", name: "울릉군", kind: "county", province: "경북", lon: 130.9, lat: 37.485, icon: "island", motif: "화산섬", labelWeight: 2 },
    { id: "dokdo", name: "독도", kind: "island", province: "경북", lon: 131.867, lat: 37.243, icon: "lighthouse", motif: "동쪽 섬", labelWeight: 2 },
    { id: "changwon", name: "창원시", kind: "city", province: "경남", lon: 128.681, lat: 35.228, icon: "industry", motif: "기계 산업", labelWeight: 2 },
    { id: "jinju", name: "진주시", kind: "city", province: "경남", lon: 128.084, lat: 35.18, icon: "fortress", motif: "성곽", labelWeight: 3 },
    { id: "gimhae", name: "김해시", kind: "city", province: "경남", lon: 128.889, lat: 35.228, icon: "airport", motif: "가야/공항", labelWeight: 4 },
    { id: "yangsan", name: "양산시", kind: "city", province: "경남", lon: 129.037, lat: 35.335, icon: "mountain", motif: "영남알프스", labelWeight: 4 },
    { id: "tongyeong", name: "통영시", kind: "city", province: "경남", lon: 128.433, lat: 34.854, icon: "port", motif: "남해 항구", labelWeight: 3 },
    { id: "geoje", name: "거제시", kind: "city", province: "경남", lon: 128.622, lat: 34.88, icon: "shipyard", motif: "조선", labelWeight: 3 },
    { id: "miryang", name: "밀양시", kind: "city", province: "경남", lon: 128.748, lat: 35.503, icon: "field", motif: "강변 평야", labelWeight: 5 },
    { id: "jeju-si", name: "제주시", kind: "city", province: "제주", lon: 126.532, lat: 33.499, icon: "citrus", motif: "감귤/관문", labelWeight: 2 },
    { id: "seogwipo", name: "서귀포시", kind: "city", province: "제주", lon: 126.56, lat: 33.254, icon: "volcano", motif: "한라산 남쪽", labelWeight: 2 }
  ]
};
