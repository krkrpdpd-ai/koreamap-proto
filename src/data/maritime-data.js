window.KOREA_MARITIME_DATA = {
  meta: {
    title: "Korea maritime overlay prototype data",
    note:
      "Representative passenger ports and ferry routes for the game map. Coordinates and paths are approximate and are not navigation charts or live timetables.",
    generatedAt: "2026-05-21"
  },
  ports: [
    {
      id: "port-incheon",
      name: "인천항",
      lon: 126.596,
      lat: 37.455,
      region: "인천",
      role: "서해권 국제/연안 여객 거점",
      description: "백령도, 연평도 등 서해 5도권 여객 항로의 대표 출발지입니다.",
      labelWeight: 2
    },
    {
      id: "port-baengnyeong",
      name: "백령도 용기포항",
      lon: 124.718,
      lat: 37.967,
      region: "인천 옹진",
      role: "서해 최북단 섬 여객항",
      description: "백령도 여객선이 드나드는 항구로, 서해 북방 섬 항로의 끝점입니다.",
      labelWeight: 3
    },
    {
      id: "port-yeonpyeong",
      name: "연평항",
      lon: 125.696,
      lat: 37.665,
      region: "인천 옹진",
      role: "서해 5도 여객항",
      description: "연평도와 인천을 잇는 서해 여객 항로의 주요 항구입니다.",
      labelWeight: 4
    },
    {
      id: "port-mokpo",
      name: "목포항",
      lon: 126.386,
      lat: 34.782,
      region: "전남 목포",
      role: "서남해 여객 거점",
      description: "제주, 흑산도, 홍도 등 서남해 섬을 잇는 대표 여객 항구입니다.",
      labelWeight: 1
    },
    {
      id: "port-wando",
      name: "완도항",
      lon: 126.758,
      lat: 34.316,
      region: "전남 완도",
      role: "제주·다도해 연결항",
      description: "제주와 다도해 섬 지역을 연결하는 남해권 여객 항구입니다.",
      labelWeight: 1
    },
    {
      id: "port-yeosu",
      name: "여수항",
      lon: 127.751,
      lat: 34.747,
      region: "전남 여수",
      role: "남해 동부 여객 거점",
      description: "제주와 거문도 방향 여객 항로의 대표 출발지입니다.",
      labelWeight: 2
    },
    {
      id: "port-nokdong",
      name: "녹동항",
      lon: 127.145,
      lat: 34.524,
      region: "전남 고흥",
      role: "고흥권 제주 연결항",
      description: "고흥에서 제주로 향하는 남해권 여객 항로의 출발 항구입니다.",
      labelWeight: 2
    },
    {
      id: "port-busan",
      name: "부산항",
      lon: 129.05,
      lat: 35.105,
      region: "부산",
      role: "남해 동부 해상 교통 거점",
      description: "부산권의 대표 항만입니다. 부산-제주 카페리 항로는 과거 운항 이력이 있으나 현재 정기 여객 항로로는 표시하지 않았습니다.",
      labelWeight: 2
    },
    {
      id: "port-jeju",
      name: "제주항",
      lon: 126.536,
      lat: 33.527,
      region: "제주",
      role: "제주 여객 관문",
      description: "목포, 완도, 여수, 녹동 등 육지 주요 항구와 연결되는 제주도의 대표 항구입니다.",
      labelWeight: 1
    },
    {
      id: "port-unjin",
      name: "운진항",
      lon: 126.271,
      lat: 33.213,
      region: "제주 서귀포",
      role: "마라도·가파도 연결항",
      description: "제주 남서부에서 마라도와 가파도 방향 여객선이 오가는 항구입니다.",
      labelWeight: 4
    },
    {
      id: "port-marado",
      name: "마라도항",
      lon: 126.267,
      lat: 33.116,
      region: "제주",
      role: "최남단 섬 여객항",
      description: "대한민국 최남단 섬 마라도의 여객선 접안 지점입니다.",
      labelWeight: 4
    },
    {
      id: "port-pohang",
      name: "포항항",
      lon: 129.386,
      lat: 36.051,
      region: "경북 포항",
      role: "울릉도 연결항",
      description: "동해안에서 울릉도로 향하는 대표 여객 항구입니다.",
      labelWeight: 1
    },
    {
      id: "port-hupo",
      name: "후포항",
      lon: 129.455,
      lat: 36.679,
      region: "경북 울진",
      role: "울릉도 연결항",
      description: "울진권에서 울릉도로 향하는 동해안 여객 항구입니다.",
      labelWeight: 2
    },
    {
      id: "port-mukho",
      name: "묵호항",
      lon: 129.116,
      lat: 37.548,
      region: "강원 동해",
      role: "울릉도 연결항",
      description: "강원 영동권에서 울릉도로 향하는 대표 여객 항구입니다.",
      labelWeight: 2
    },
    {
      id: "port-gangneung",
      name: "강릉항",
      lon: 128.951,
      lat: 37.772,
      region: "강원 강릉",
      role: "울릉도 연결항",
      description: "강릉에서 울릉도 저동 방향으로 이어지는 여객 항로의 출발지입니다.",
      labelWeight: 2
    },
    {
      id: "port-ulleung-sadong",
      name: "울릉 사동항",
      lon: 130.914,
      lat: 37.467,
      region: "경북 울릉",
      role: "울릉도 여객항",
      description: "울릉도 동남부의 여객·화물 접안 항구입니다.",
      labelWeight: 1
    },
    {
      id: "port-ulleung-dodong",
      name: "울릉 도동항",
      lon: 130.913,
      lat: 37.484,
      region: "경북 울릉",
      role: "울릉도 중심 여객항",
      description: "울릉도 관광과 독도행 항로의 주요 거점으로 쓰이는 항구입니다.",
      labelWeight: 2
    },
    {
      id: "port-dokdo",
      name: "독도 선착장",
      lon: 131.869,
      lat: 37.242,
      region: "경북 울릉",
      role: "독도 접안 지점",
      description: "기상과 해상 상태가 허락할 때 울릉도에서 출발한 여객선이 접안하는 지점입니다.",
      labelWeight: 2
    },
    {
      id: "port-tongyeong",
      name: "통영항",
      lon: 128.425,
      lat: 34.844,
      region: "경남 통영",
      role: "한려수도 여객 거점",
      description: "욕지도, 한산도 등 한려수도 섬 항로의 대표 항구입니다.",
      labelWeight: 2
    },
    {
      id: "port-yokjido",
      name: "욕지도항",
      lon: 128.256,
      lat: 34.634,
      region: "경남 통영",
      role: "통영권 섬 여객항",
      description: "통영 남쪽 욕지도에 있는 여객선 항구입니다.",
      labelWeight: 4
    },
    {
      id: "port-heuksando",
      name: "흑산도항",
      lon: 125.426,
      lat: 34.683,
      region: "전남 신안",
      role: "서남해 섬 여객항",
      description: "목포에서 흑산도·홍도 방향으로 이어지는 항로의 중간 거점입니다.",
      labelWeight: 3
    },
    {
      id: "port-hongdo",
      name: "홍도항",
      lon: 125.194,
      lat: 34.683,
      region: "전남 신안",
      role: "서남해 섬 여객항",
      description: "다도해 해상 관광 항로에서 중요한 서남해 섬 항구입니다.",
      labelWeight: 4
    },
    {
      id: "port-geomundo",
      name: "거문도항",
      lon: 127.309,
      lat: 34.028,
      region: "전남 여수",
      role: "남해 원거리 섬 항구",
      description: "여수 남쪽 거문도에 있는 여객 항구입니다.",
      labelWeight: 4
    }
  ],
  seaRoutes: [
    {
      id: "route-mokpo-jeju",
      name: "목포-제주 항로",
      from: "목포항",
      to: "제주항",
      category: "제주 여객 항로",
      points: [
        [126.26, 34.72],
        [126.26, 34.62],
        [126.32, 34.56],
        [126.34, 34.56],
        [126.38, 34.52],
        [126.52, 33.56],
        [126.536, 33.547]
      ],
      description: "서남해 목포권과 제주를 잇는 대표 장거리 여객 항로입니다. 지도에서는 항구 앞바다의 해상 진출입로를 기준으로 표시했습니다.",
      labelWeight: 1
    },
    {
      id: "route-wando-jeju",
      name: "완도-제주 항로",
      from: "완도항",
      to: "제주항",
      category: "제주 여객 항로",
      points: [
        [126.758, 34.316],
        [126.58, 34.03],
        [126.49, 33.76],
        [126.536, 33.527]
      ],
      description: "완도와 제주를 비교적 짧게 연결하는 남해권 대표 항로입니다.",
      labelWeight: 1
    },
    {
      id: "route-nokdong-jeju",
      name: "녹동-제주 항로",
      from: "녹동항",
      to: "제주항",
      category: "제주 여객 항로",
      points: [
        [127.145, 34.524],
        [126.98, 34.12],
        [126.72, 33.8],
        [126.536, 33.527]
      ],
      description: "고흥 녹동항과 제주를 연결하는 남해권 여객 항로입니다.",
      labelWeight: 2
    },
    {
      id: "route-unjin-marado",
      name: "운진-마라도 항로",
      from: "운진항",
      to: "마라도항",
      category: "제주 부속섬 항로",
      points: [
        [126.271, 33.213],
        [126.266, 33.165],
        [126.267, 33.116]
      ],
      description: "제주 남서부에서 대한민국 최남단 마라도로 이어지는 짧은 여객 항로입니다.",
      labelWeight: 4
    },
    {
      id: "route-pohang-ulleung",
      name: "포항-울릉 항로",
      from: "포항항",
      to: "울릉 사동항",
      category: "울릉도 여객 항로",
      points: [
        [129.386, 36.051],
        [129.88, 36.65],
        [130.46, 37.13],
        [130.914, 37.467]
      ],
      description: "포항에서 울릉도로 향하는 동해 대표 장거리 여객 항로입니다.",
      labelWeight: 1
    },
    {
      id: "route-hupo-ulleung",
      name: "후포-울릉 항로",
      from: "후포항",
      to: "울릉 사동항",
      category: "울릉도 여객 항로",
      points: [
        [129.455, 36.679],
        [129.86, 37.03],
        [130.34, 37.28],
        [130.914, 37.467]
      ],
      description: "울진 후포항에서 울릉도로 이어지는 동해 여객 항로입니다.",
      labelWeight: 2
    },
    {
      id: "route-mukho-ulleung",
      name: "묵호-울릉 항로",
      from: "묵호항",
      to: "울릉 도동항",
      category: "울릉도 여객 항로",
      points: [
        [129.116, 37.548],
        [129.72, 37.66],
        [130.32, 37.58],
        [130.913, 37.484]
      ],
      description: "동해 묵호항에서 울릉도 도동 방향으로 이어지는 여객 항로입니다.",
      labelWeight: 2
    },
    {
      id: "route-gangneung-ulleung",
      name: "강릉-울릉 항로",
      from: "강릉항",
      to: "울릉 도동항",
      category: "울릉도 여객 항로",
      points: [
        [128.951, 37.772],
        [129.55, 37.85],
        [130.22, 37.68],
        [130.913, 37.484]
      ],
      description: "강릉에서 울릉도로 향하는 강원 영동권 대표 여객 항로입니다.",
      labelWeight: 2
    },
    {
      id: "route-ulleung-dokdo",
      name: "울릉-독도 항로",
      from: "울릉 도동항",
      to: "독도 선착장",
      category: "독도 관광 항로",
      points: [
        [130.913, 37.484],
        [131.25, 37.42],
        [131.57, 37.34],
        [131.869, 37.242]
      ],
      description: "울릉도에서 독도로 향하는 관광 여객 항로입니다. 실제 접안은 기상과 해상 상태의 영향을 크게 받습니다.",
      labelWeight: 1
    },
    {
      id: "route-mokpo-heuksan-hongdo",
      name: "목포-흑산-홍도 항로",
      from: "목포항",
      to: "홍도항",
      category: "서남해 섬 항로",
      points: [
        [126.386, 34.782],
        [125.95, 34.7],
        [125.426, 34.683],
        [125.194, 34.683]
      ],
      description: "목포에서 흑산도와 홍도 방향으로 이어지는 서남해 섬 여객 항로입니다.",
      labelWeight: 3
    },
    {
      id: "route-yeosu-geomundo",
      name: "여수-거문도 항로",
      from: "여수항",
      to: "거문도항",
      category: "남해 섬 항로",
      points: [
        [127.751, 34.747],
        [127.62, 34.38],
        [127.46, 34.16],
        [127.309, 34.028]
      ],
      description: "여수에서 남쪽 먼바다의 거문도로 이어지는 남해 섬 항로입니다.",
      labelWeight: 4
    },
    {
      id: "route-tongyeong-yokjido",
      name: "통영-욕지도 항로",
      from: "통영항",
      to: "욕지도항",
      category: "한려수도 섬 항로",
      points: [
        [128.425, 34.844],
        [128.36, 34.76],
        [128.31, 34.69],
        [128.256, 34.634]
      ],
      description: "통영에서 욕지도로 이어지는 한려수도권 섬 여객 항로입니다.",
      labelWeight: 4
    },
    {
      id: "route-incheon-baengnyeong",
      name: "인천-백령 항로",
      from: "인천항",
      to: "백령도 용기포항",
      category: "서해 5도 항로",
      points: [
        [126.58, 37.43],
        [126.56, 37.41],
        [125.76, 37.47],
        [125.24, 37.69],
        [124.74, 37.93],
        [124.718, 37.947]
      ],
      description: "인천에서 백령도로 향하는 서해 장거리 여객 항로입니다. 지도에서는 영종도, 덕적도, 대청도 주변 섬을 피하는 해상 표시 경로로 단순화했습니다.",
      labelWeight: 2
    },
    {
      id: "route-incheon-yeonpyeong",
      name: "인천-연평 항로",
      from: "인천항",
      to: "연평항",
      category: "서해 5도 항로",
      points: [
        [126.596, 37.455],
        [126.34, 37.26],
        [126.05, 37.4],
        [125.82, 37.56],
        [125.696, 37.665]
      ],
      description: "인천과 연평도를 잇는 서해 5도권 여객 항로입니다.",
      labelWeight: 3
    }
  ]
};
