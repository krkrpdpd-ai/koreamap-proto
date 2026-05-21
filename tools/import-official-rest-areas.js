const fs = require("fs");
const os = require("os");
const path = require("path");

const root = path.resolve(__dirname, "..");
const outPath = path.join(root, "data", "geo", "official-highway-rest-areas.json");
const inputPath = process.argv[2] || findDefaultWorkbook();

if (!inputPath) {
  throw new Error("No .xls input was provided and no 20260521 rest-area workbook was found on the Desktop.");
}

const workbook = parseXlsWorkbook(fs.readFileSync(inputPath));
const rows = workbookToRows(workbook);
const headerRowIndex = rows.findIndex((row) => row.includes("휴게소명") && row.includes("위도") && row.includes("경도"));
if (headerRowIndex < 0) throw new Error("Could not find the official rest-area header row.");

const headers = rows[headerRowIndex];
const restAreas = rows
  .slice(headerRowIndex + 1)
  .map((row, index) => rowToRestArea(row, headers, index))
  .filter(Boolean);

const output = {
  meta: {
    generatedAt: new Date().toISOString(),
    sourceFile: path.basename(inputPath),
    rowCount: restAreas.length,
    coordinateSystem: "WGS84 lon/lat from official standard rest-area workbook"
  },
  restAreas
};

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ inputPath, outPath, restAreas: restAreas.length }, null, 2));

function findDefaultWorkbook() {
  const desktop = path.join(os.homedir(), "Desktop");
  if (!fs.existsSync(desktop)) return "";
  return (
    fs
      .readdirSync(desktop)
      .filter((name) => /\.xls$/i.test(name) && /20260521/.test(name))
      .map((name) => path.join(desktop, name))
      .find((filePath) => /휴게소|Rest/i.test(path.basename(filePath))) || ""
  );
}

function rowToRestArea(row, headers, index) {
  const get = (name) => String(row[headers.indexOf(name)] ?? "").trim();
  const name = get("휴게소명");
  const lat = Number(get("위도"));
  const lon = Number(get("경도"));
  if (!name || !Number.isFinite(lat) || !Number.isFinite(lon)) return null;

  const routeNo = get("도로노선번호");
  const routeName = get("도로노선명");
  const direction = get("도로노선방향");
  const restType = get("휴게소종류");
  const phone = get("휴게소전화번호");
  const signatureFood = get("휴게소대표음식명");
  const parkingSpaces = numberOrNull(get("주차면수"));

  return {
    id: `official-rest-area-${String(index + 1).padStart(3, "0")}`,
    name,
    baseName: splitDirectionalName(name).base,
    directionName: splitDirectionalName(name).direction,
    roadType: get("도로종류"),
    routeNo,
    routeName,
    routeDirection: direction,
    lon,
    lat,
    restType,
    operatingHours: formatHours(get("휴게소운영시작시각"), get("휴게소운영종료시각")),
    occupiedAreaSqm: numberOrNull(get("도로점용면적")),
    parkingSpaces,
    amenities: {
      maintenance: yesNo(get("경정비가능여부")),
      fuel: yesNo(get("주유소유무")),
      lpg: yesNo(get("LPG충전소유무")),
      evCharging: yesNo(get("전기차충전소유무")),
      busTransfer: yesNo(get("버스환승가능여부")),
      shelter: yesNo(get("쉼터유무")),
      toilet: yesNo(get("화장실유무")),
      pharmacy: yesNo(get("약국유무")),
      nursingRoom: yesNo(get("수유실유무")),
      store: yesNo(get("매점유무")),
      restaurant: yesNo(get("음식점유무"))
    },
    otherAmenities: get("기타편의시설"),
    signatureFood,
    phone,
    dataDate: get("데이터기준일자"),
    providerCode: get("제공기관코드"),
    provider: get("제공기관명")
  };
}

function splitDirectionalName(name) {
  const match = String(name || "").match(/^(.*?)\((.*?)\)$/);
  if (!match) return { base: name, direction: "" };
  return { base: match[1].trim(), direction: match[2].trim() };
}

function yesNo(value) {
  if (value === "Y") return true;
  if (value === "N") return false;
  return null;
}

function numberOrNull(value) {
  if (value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function formatHours(start, end) {
  if (!start && !end) return "";
  if (start && end) return `${start}-${end}`;
  return start || end;
}

function workbookToRows(workbook) {
  const rows = [];
  for (const [rowIndex, cells] of workbook.rows) {
    rows[rowIndex] = rows[rowIndex] || [];
    for (const [colIndex, value] of cells) rows[rowIndex][colIndex] = value;
  }
  return Array.from({ length: rows.length }, (_, index) => rows[index] || []);
}

function parseXlsWorkbook(buffer) {
  const workbookStream = readWorkbookStream(buffer);
  const sharedStrings = [];
  const rows = new Map();

  const records = [];
  for (let offset = 0; offset + 4 <= workbookStream.length; ) {
    const type = workbookStream.readUInt16LE(offset);
    const length = workbookStream.readUInt16LE(offset + 2);
    const payload = workbookStream.subarray(offset + 4, offset + 4 + length);
    records.push({ type, payload });
    offset += 4 + length;
  }

  for (let i = 0; i < records.length; i += 1) {
    if (records[i].type !== 0x00fc) continue;
    const chunks = [records[i].payload];
    while (records[i + 1]?.type === 0x003c) {
      i += 1;
      chunks.push(records[i].payload);
    }
    sharedStrings.push(...parseSharedStrings(Buffer.concat(chunks)));
  }

  for (const record of records) {
    const { type, payload } = record;
    if (type === 0x0204 && payload.length >= 9) {
      const row = payload.readUInt16LE(0);
      const col = payload.readUInt16LE(2);
      const charCount = payload.readUInt16LE(6);
      const flags = payload[8];
      const width = flags & 1 ? 2 : 1;
      const raw = payload.subarray(9, 9 + charCount * width);
      setCell(rows, row, col, raw.toString(width === 2 ? "utf16le" : "latin1"));
    } else if (type === 0x00fd && payload.length >= 10) {
      const row = payload.readUInt16LE(0);
      const col = payload.readUInt16LE(2);
      const index = payload.readUInt32LE(6);
      setCell(rows, row, col, sharedStrings[index] ?? "");
    } else if (type === 0x0203 && payload.length >= 14) {
      setCell(rows, payload.readUInt16LE(0), payload.readUInt16LE(2), String(payload.readDoubleLE(6)));
    } else if (type === 0x027e && payload.length >= 10) {
      setCell(rows, payload.readUInt16LE(0), payload.readUInt16LE(2), String(decodeRk(payload.readUInt32LE(6))));
    } else if (type === 0x00bd && payload.length >= 8) {
      const row = payload.readUInt16LE(0);
      const firstCol = payload.readUInt16LE(2);
      const lastCol = payload.readUInt16LE(payload.length - 2);
      let offset = 4;
      for (let col = firstCol; col <= lastCol && offset + 6 <= payload.length - 2; col += 1) {
        setCell(rows, row, col, String(decodeRk(payload.readUInt32LE(offset + 2))));
        offset += 6;
      }
    }
  }

  return { rows };
}

function setCell(rows, row, col, value) {
  if (!rows.has(row)) rows.set(row, new Map());
  rows.get(row).set(col, String(value ?? "").trim());
}

function parseSharedStrings(payload) {
  if (payload.length < 8) return [];
  const uniqueCount = payload.readUInt32LE(4);
  const strings = [];
  let offset = 8;
  for (let i = 0; i < uniqueCount && offset < payload.length; i += 1) {
    const parsed = readBiffString(payload, offset);
    strings.push(parsed.value);
    offset = parsed.offset;
  }
  return strings;
}

function readBiffString(payload, offset) {
  const charCount = payload.readUInt16LE(offset);
  let cursor = offset + 2;
  const flags = payload[cursor];
  cursor += 1;
  const hasRichText = !!(flags & 0x08);
  const hasExt = !!(flags & 0x04);
  const is16Bit = !!(flags & 0x01);
  const richTextRuns = hasRichText ? payload.readUInt16LE(cursor) : 0;
  if (hasRichText) cursor += 2;
  const extSize = hasExt ? payload.readUInt32LE(cursor) : 0;
  if (hasExt) cursor += 4;
  const byteLength = charCount * (is16Bit ? 2 : 1);
  const value = payload.subarray(cursor, cursor + byteLength).toString(is16Bit ? "utf16le" : "latin1");
  cursor += byteLength + richTextRuns * 4 + extSize;
  return { value, offset: cursor };
}

function decodeRk(rk) {
  const divideBy100 = rk & 1;
  const isInteger = rk & 2;
  let value;
  if (isInteger) {
    value = (rk & 0xfffffffc) >> 2;
    if (value & 0x20000000) value -= 0x40000000;
  } else {
    const bytes = Buffer.alloc(8);
    bytes.writeUInt32LE(0, 0);
    bytes.writeUInt32LE(rk & 0xfffffffc, 4);
    value = bytes.readDoubleLE(0);
  }
  return divideBy100 ? value / 100 : value;
}

function readWorkbookStream(buffer) {
  if (buffer.subarray(0, 8).toString("hex") !== "d0cf11e0a1b11ae1") {
    throw new Error("Input is not an OLE Compound File .xls workbook.");
  }

  const sectorSize = 1 << buffer.readUInt16LE(30);
  const fatSectorCount = buffer.readUInt32LE(44);
  const firstDirectorySector = buffer.readUInt32LE(48);
  const difat = [];
  for (let i = 0; i < 109; i += 1) difat.push(buffer.readUInt32LE(76 + i * 4));
  const fatSectors = difat.filter((sector) => sector !== 0xffffffff).slice(0, fatSectorCount);

  const sectorOffset = (sector) => (sector + 1) * sectorSize;
  const fat = [];
  for (const sector of fatSectors) {
    const start = sectorOffset(sector);
    for (let offset = 0; offset < sectorSize; offset += 4) fat.push(buffer.readUInt32LE(start + offset));
  }

  const readChain = (startSector, size = Infinity) => {
    const chunks = [];
    const seen = new Set();
    let sector = startSector;
    while (sector !== 0xfffffffe && sector !== 0xffffffff && !seen.has(sector)) {
      seen.add(sector);
      chunks.push(buffer.subarray(sectorOffset(sector), sectorOffset(sector) + sectorSize));
      sector = fat[sector];
    }
    return Buffer.concat(chunks).subarray(0, size);
  };

  const directory = readChain(firstDirectorySector);
  for (let offset = 0; offset + 128 <= directory.length; offset += 128) {
    const entry = directory.subarray(offset, offset + 128);
    const nameLength = entry.readUInt16LE(64);
    if (nameLength < 2) continue;
    const name = entry.subarray(0, nameLength - 2).toString("utf16le");
    if (name !== "Workbook" && name !== "Book") continue;
    const startSector = entry.readUInt32LE(116);
    const size = Number(entry.readBigUInt64LE(120));
    return readChain(startSector, size);
  }

  throw new Error("Workbook stream was not found in the .xls file.");
}
