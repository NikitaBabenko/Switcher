// Package the extension into a zip ready for upload to the Chrome Web Store.
// Excludes dev-only files (tests, build scripts, package.json, README, this
// folder, *.md). Run from the extension/ folder:
//
//   npm run package
//
// Output: extension/dist/vibenest-switcher-<version>.zip

import fs from "node:fs";
import path from "node:path";
import url from "node:url";
import zlib from "node:zlib";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");

const MANIFEST = JSON.parse(fs.readFileSync(path.join(ROOT, "manifest.json"), "utf8"));

// Files / dirs that must NOT be in the published zip.
const EXCLUDE_NAMES = new Set([
  "node_modules",
  "dist",
  "tools",
  "package.json",
  "package-lock.json",
  "README.md",
  "PRIVACY.md",
  ".gitignore",
  ".DS_Store",
]);
const EXCLUDE_SUFFIX = [".test.mjs", ".test.js", ".map"];
const EXCLUDE_SPECIFIC = new Set([
  "lib/build-models.mjs",
]);

function shouldInclude(relPath) {
  const parts = relPath.split("/");
  for (const p of parts) {
    if (EXCLUDE_NAMES.has(p)) return false;
  }
  for (const suf of EXCLUDE_SUFFIX) {
    if (relPath.endsWith(suf)) return false;
  }
  if (EXCLUDE_SPECIFIC.has(relPath)) return false;
  return true;
}

function walk(dir, baseRel = "") {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    const rel = baseRel ? `${baseRel}/${entry.name}` : entry.name;
    if (!shouldInclude(rel)) continue;
    if (entry.isDirectory()) {
      out.push(...walk(full, rel));
    } else if (entry.isFile()) {
      out.push({ rel, full });
    }
  }
  return out;
}

// Minimal zip writer: store-mode (no compression) keeps this script
// dependency-free and produces files Chrome accepts. Web Store also accepts
// deflate; we use deflate via zlib to shrink the upload.

function crc32(buf) {
  // Polynomial-table-based CRC32 (IEEE 802.3, the one zip uses).
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function dosTime(date) {
  const seconds = Math.floor(date.getSeconds() / 2);
  return (date.getHours() << 11) | (date.getMinutes() << 5) | seconds;
}
function dosDate(date) {
  return ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
}

function buildZip(files) {
  const now = new Date();
  const time = dosTime(now);
  const date = dosDate(now);
  const localChunks = [];
  const centralChunks = [];
  let offset = 0;

  for (const f of files) {
    const data = fs.readFileSync(f.full);
    const compressed = zlib.deflateRawSync(data);
    const useDeflate = compressed.length < data.length;
    const stored = useDeflate ? compressed : data;
    const method = useDeflate ? 8 : 0;
    const crc = crc32(data);
    const nameBuf = Buffer.from(f.rel, "utf8");

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);          // version needed
    local.writeUInt16LE(0x0800, 6);      // flags: utf-8 names
    local.writeUInt16LE(method, 8);
    local.writeUInt16LE(time, 10);
    local.writeUInt16LE(date, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(stored.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(nameBuf.length, 26);
    local.writeUInt16LE(0, 28);

    localChunks.push(local, nameBuf, stored);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x0800, 8);
    central.writeUInt16LE(method, 10);
    central.writeUInt16LE(time, 12);
    central.writeUInt16LE(date, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(stored.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(nameBuf.length, 28);
    central.writeUInt16LE(0, 30);
    central.writeUInt16LE(0, 32);
    central.writeUInt16LE(0, 34);
    central.writeUInt16LE(0, 36);
    central.writeUInt32LE(0, 38);
    central.writeUInt32LE(offset, 42);
    centralChunks.push(central, nameBuf);

    offset += local.length + nameBuf.length + stored.length;
  }

  const centralBuf = Buffer.concat(centralChunks);
  const centralOffset = offset;
  const centralSize = centralBuf.length;

  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(files.length, 8);
  eocd.writeUInt16LE(files.length, 10);
  eocd.writeUInt32LE(centralSize, 12);
  eocd.writeUInt32LE(centralOffset, 16);
  eocd.writeUInt16LE(0, 20);

  return Buffer.concat([...localChunks, centralBuf, eocd]);
}

const files = walk(ROOT).sort((a, b) => a.rel.localeCompare(b.rel));
console.log(`Packaging ${files.length} files…`);
const zip = buildZip(files);
fs.mkdirSync(DIST, { recursive: true });
const outPath = path.join(DIST, `vibenest-switcher-${MANIFEST.version}.zip`);
fs.writeFileSync(outPath, zip);
console.log(`Wrote ${outPath} — ${(zip.length / 1024).toFixed(1)} KB`);
