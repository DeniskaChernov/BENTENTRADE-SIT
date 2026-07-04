// Build a square favicon from the real logo: the copper "BTT" monogram on a
// black rounded square. Source: assets/btt-logo.png (copper on transparent).
import { readFileSync, writeFileSync } from "node:fs";
import { PNG } from "pngjs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = PNG.sync.read(readFileSync(join(root, "assets", "btt-logo.png")));

const T = 512;                 // favicon side
const R = Math.round(T * 0.18); // corner radius
const REGION_H = 475;          // crop the "BTT" band (exclude the wordmark)
const logoW = Math.round(T * 0.9);
const scale = logoW / src.width;
const logoH = Math.round(REGION_H * scale);
const offX = Math.round((T - logoW) / 2);
const offY = Math.round((T - logoH) / 2);

const out = new PNG({ width: T, height: T });

function inRounded(x, y) {
  const nx = x < R ? R - x : x > T - 1 - R ? x - (T - 1 - R) : 0;
  const ny = y < R ? R - y : y > T - 1 - R ? y - (T - 1 - R) : 0;
  return nx * nx + ny * ny <= R * R;
}

for (let y = 0; y < T; y++) {
  for (let x = 0; x < T; x++) {
    const d = (y * T + x) * 4;
    if (!inRounded(x, y)) { out.data[d + 3] = 0; continue; }
    // default: black background
    let r = 17, g = 15, b = 12, a = 255;
    if (x >= offX && x < offX + logoW && y >= offY && y < offY + logoH) {
      const sx = Math.min(src.width - 1, Math.floor((x - offX) / scale));
      const sy = Math.min(REGION_H - 1, Math.floor((y - offY) / scale));
      const s = (sy * src.width + sx) * 4;
      if (src.data[s + 3] > 40) { r = src.data[s]; g = src.data[s + 1]; b = src.data[s + 2]; }
    }
    out.data[d] = r; out.data[d + 1] = g; out.data[d + 2] = b; out.data[d + 3] = a;
  }
}

writeFileSync(join(root, "assets", "favicon.png"), PNG.sync.write(out));
console.log(`favicon.png ${T}x${T} (logo ${logoW}x${logoH})`);
