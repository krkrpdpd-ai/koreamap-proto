window.KOREA_AVIATION_DATA = {
  meta: {
    title: "Korea aviation overlay prototype data",
    note:
      "Representative airports and domestic air corridors for the game map. Routes are visual game overlays, not live flight tracks, ATC procedures, or timetable data.",
    generatedAt: "2026-05-24"
  },
  airports: [
    {
      id: "airport-incheon",
      name: "인천국제공항",
      code: "ICN",
      lon: 126.4505,
      lat: 37.4602,
      region: "인천 중구",
      role: "대한민국 대표 국제 관문",
      description: "국제선 중심의 허브 공항이며, 수도권 장거리 항공 이동의 핵심 거점입니다.",
      labelWeight: 1
    },
    {
      id: "airport-gimpo",
      name: "김포국제공항",
      code: "GMP",
      lon: 126.8019,
      lat: 37.5583,
      region: "서울 강서구",
      role: "수도권 국내선 중심 공항",
      description: "제주와 부산 등 국내 주요 도시를 잇는 수도권 항공 교통의 중심입니다.",
      labelWeight: 1
    },
    {
      id: "airport-jeju",
      name: "제주국제공항",
      code: "CJU",
      lon: 126.493,
      lat: 33.5113,
      region: "제주 제주시",
      role: "제주 항공 관문",
      description: "전국 주요 도시와 제주를 연결하는 국내선 핵심 공항입니다.",
      labelWeight: 1
    },
    {
      id: "airport-gimhae",
      name: "김해국제공항",
      code: "PUS",
      lon: 128.9382,
      lat: 35.1796,
      region: "부산 강서구",
      role: "부산권 대표 공항",
      description: "부산과 동남권을 대표하는 공항으로 제주, 수도권, 국제선 이동 거점입니다.",
      labelWeight: 1
    },
    {
      id: "airport-daegu",
      name: "대구국제공항",
      code: "TAE",
      lon: 128.6379,
      lat: 35.8941,
      region: "대구 동구",
      role: "대구권 항공 거점",
      description: "대구와 경북 내륙권의 항공 이동을 담당하는 주요 공항입니다.",
      labelWeight: 2
    },
    {
      id: "airport-cheongju",
      name: "청주국제공항",
      code: "CJJ",
      lon: 127.4989,
      lat: 36.717,
      region: "충북 청주",
      role: "중부권 거점 공항",
      description: "충청권과 중부 내륙에서 제주 및 국제 노선 접근성을 담당하는 공항입니다.",
      labelWeight: 2
    },
    {
      id: "airport-gwangju",
      name: "광주공항",
      code: "KWJ",
      lon: 126.8108,
      lat: 35.1264,
      region: "광주 광산구",
      role: "광주권 국내선 공항",
      description: "광주와 전남 내륙의 국내선 이동 거점으로 제주 연결성이 높습니다.",
      labelWeight: 2
    },
    {
      id: "airport-muan",
      name: "무안국제공항",
      code: "MWX",
      lon: 126.3828,
      lat: 34.9914,
      region: "전남 무안",
      role: "전남 서남권 공항",
      description: "목포, 무안, 서남권을 담당하는 국제공항으로 표시했습니다.",
      labelWeight: 2
    },
    {
      id: "airport-yeosu",
      name: "여수공항",
      code: "RSU",
      lon: 127.6169,
      lat: 34.8423,
      region: "전남 여수",
      role: "남해안 국내선 공항",
      description: "여수, 순천, 광양권의 국내선 이동 거점입니다.",
      labelWeight: 2
    },
    {
      id: "airport-ulsan",
      name: "울산공항",
      code: "USN",
      lon: 129.3517,
      lat: 35.5935,
      region: "울산 북구",
      role: "울산권 국내선 공항",
      description: "울산 산업권과 수도권을 연결하는 동남권 국내선 공항입니다.",
      labelWeight: 3
    },
    {
      id: "airport-pohang",
      name: "포항경주공항",
      code: "KPO",
      lon: 129.4204,
      lat: 35.9879,
      region: "경북 포항",
      role: "포항, 경주권 공항",
      description: "포항과 경주권의 국내선 접근성을 담당하는 동해안 공항입니다.",
      labelWeight: 3
    },
    {
      id: "airport-sacheon",
      name: "사천공항",
      code: "HIN",
      lon: 128.0704,
      lat: 35.0886,
      region: "경남 사천",
      role: "서부 경남 국내선 공항",
      description: "진주, 사천 등 서부 경남권을 연결하는 국내선 공항입니다.",
      labelWeight: 3
    },
    {
      id: "airport-gunsan",
      name: "군산공항",
      code: "KUV",
      lon: 126.6159,
      lat: 35.9038,
      region: "전북 군산",
      role: "전북 서해안 공항",
      description: "군산과 전북 서해안권의 항공 이동 거점입니다.",
      labelWeight: 3
    },
    {
      id: "airport-wonju",
      name: "원주공항",
      code: "WJU",
      lon: 127.9601,
      lat: 37.4381,
      region: "강원 횡성",
      role: "강원 내륙 공항",
      description: "강원 내륙권의 항공 접근성을 나타내는 공항입니다.",
      labelWeight: 4
    },
    {
      id: "airport-yangyang",
      name: "양양국제공항",
      code: "YNY",
      lon: 128.6692,
      lat: 38.0613,
      region: "강원 양양",
      role: "강원 동해안 공항",
      description: "강원 동해안 관광권과 항공 이동을 연결하는 공항입니다.",
      labelWeight: 3
    }
  ],
  airRoutes: [
    {
      id: "air-gimpo-jeju",
      name: "김포-제주 하늘길",
      from: "김포국제공항",
      to: "제주국제공항",
      category: "대표 국내선",
      points: [
        [126.802, 37.558],
        [126.18, 36.12],
        [126.493, 33.511]
      ],
      description: "수도권과 제주를 잇는 대표 국내선 연결입니다.",
      labelWeight: 1
    },
    {
      id: "air-gimhae-jeju",
      name: "김해-제주 하늘길",
      from: "김해국제공항",
      to: "제주국제공항",
      category: "대표 국내선",
      points: [
        [128.938, 35.18],
        [128.02, 34.24],
        [126.493, 33.511]
      ],
      description: "부산권과 제주를 연결하는 주요 국내선입니다.",
      labelWeight: 1
    },
    {
      id: "air-cheongju-jeju",
      name: "청주-제주 하늘길",
      from: "청주국제공항",
      to: "제주국제공항",
      category: "중부권 제주 노선",
      points: [
        [127.499, 36.717],
        [126.86, 35.22],
        [126.493, 33.511]
      ],
      description: "충청권에서 제주로 향하는 대표 항공 연결입니다.",
      labelWeight: 2
    },
    {
      id: "air-daegu-jeju",
      name: "대구-제주 하늘길",
      from: "대구국제공항",
      to: "제주국제공항",
      category: "영남권 제주 노선",
      points: [
        [128.638, 35.894],
        [128.0, 34.78],
        [126.493, 33.511]
      ],
      description: "대구, 경북권과 제주를 연결하는 국내선입니다.",
      labelWeight: 2
    },
    {
      id: "air-gwangju-jeju",
      name: "광주-제주 하늘길",
      from: "광주공항",
      to: "제주국제공항",
      category: "호남권 제주 노선",
      points: [
        [126.811, 35.126],
        [126.27, 34.32],
        [126.493, 33.511]
      ],
      description: "광주권과 제주를 짧게 잇는 호남권 항공 연결입니다.",
      labelWeight: 2
    },
    {
      id: "air-yeosu-jeju",
      name: "여수-제주 하늘길",
      from: "여수공항",
      to: "제주국제공항",
      category: "남해안 제주 노선",
      points: [
        [127.617, 34.842],
        [127.0, 34.1],
        [126.493, 33.511]
      ],
      description: "남해안과 제주를 연결하는 대표 항공 경로입니다.",
      labelWeight: 3
    },
    {
      id: "air-gunsan-jeju",
      name: "군산-제주 하늘길",
      from: "군산공항",
      to: "제주국제공항",
      category: "전북 제주 노선",
      points: [
        [126.616, 35.904],
        [126.1, 34.7],
        [126.493, 33.511]
      ],
      description: "전북 서해안권과 제주를 연결하는 국내선입니다.",
      labelWeight: 3
    },
    {
      id: "air-gimpo-gimhae",
      name: "김포-김해 하늘길",
      from: "김포국제공항",
      to: "김해국제공항",
      category: "대도시 연결",
      points: [
        [126.802, 37.558],
        [127.9, 36.3],
        [128.938, 35.18]
      ],
      description: "수도권과 부산권을 잇는 대표 국내선 연결입니다.",
      labelWeight: 1
    },
    {
      id: "air-gimpo-ulsan",
      name: "김포-울산 하늘길",
      from: "김포국제공항",
      to: "울산공항",
      category: "수도권-동남권 연결",
      points: [
        [126.802, 37.558],
        [128.05, 36.55],
        [129.352, 35.594]
      ],
      description: "수도권과 울산 산업권을 연결하는 국내선입니다.",
      labelWeight: 2
    },
    {
      id: "air-gimpo-yeosu",
      name: "김포-여수 하늘길",
      from: "김포국제공항",
      to: "여수공항",
      category: "수도권-남해안 연결",
      points: [
        [126.802, 37.558],
        [127.0, 36.0],
        [127.617, 34.842]
      ],
      description: "수도권과 여수, 순천, 광양권을 잇는 국내선입니다.",
      labelWeight: 2
    },
    {
      id: "air-gimpo-sacheon",
      name: "김포-사천 하늘길",
      from: "김포국제공항",
      to: "사천공항",
      category: "수도권-서부경남 연결",
      points: [
        [126.802, 37.558],
        [127.38, 36.02],
        [128.07, 35.089]
      ],
      description: "수도권과 진주, 사천 등 서부 경남권을 연결합니다.",
      labelWeight: 3
    },
    {
      id: "air-gimpo-pohang",
      name: "김포-포항경주 하늘길",
      from: "김포국제공항",
      to: "포항경주공항",
      category: "수도권-동해안 연결",
      points: [
        [126.802, 37.558],
        [128.16, 36.72],
        [129.42, 35.988]
      ],
      description: "수도권과 포항, 경주권을 연결하는 국내선입니다.",
      labelWeight: 3
    },
    {
      id: "air-gimpo-yangyang",
      name: "김포-양양 하늘길",
      from: "김포국제공항",
      to: "양양국제공항",
      category: "수도권-강원 동해안 연결",
      points: [
        [126.802, 37.558],
        [127.78, 38.05],
        [128.669, 38.061]
      ],
      description: "수도권과 강원 동해안 관광권을 잇는 대표 항공 연결로 표시했습니다.",
      labelWeight: 4
    }
  ]
};
