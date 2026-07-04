// One-off: turn the solid-black logo background transparent for use on both
// light and dark themes. Input: assets/btt-logo-full.png (copper on black).
// Output: assets/btt-logo.png (copper on transparent) + a tight trim.
import { readFileSync, writeFileSync } from "node:fs";
import { PNG } from "pngjs";
import jpeg from "jpeg-js";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
// Source is a JPEG (despite the .png name) — decode to RGBA.
const decoded = jpeg.decode(readFileSync(join(root, "assets", "btt-logo-full.png")), { formatAsRGBA: true });
const width = decoded.width, height = decoded.height;
const src = new PNG({ width, height });
decoded.data.copy(src.data);
const data = src.data;
// Any near-black pixel -> transparent. Copper (~200,120,60) is far from black.
const BG_MAX = 40; // max channel value considered "background"
let minX = width, minY = height, maxX = 0, maxY = 0;

for (let i = 0; i < data.length; i += 4) {
  const r = data[i], g = data[i + 1], b = data[i + 2];
  const m = Math.max(r, g, b);
  if (m <= BG_MAX) {
    data[i + 3] = 0; // fully transparent
  } else {
    // soften edge: scale alpha down as pixel approaches background
    if (m < BG_MAX + 40) data[i + 3] = Math.round((data[i + 3] * (m - BG_MAX)) / 40);
    const px = (i / 4) % width;
    const py = Math.floor(i / 4 / width);
    if (data[i + 3] > 8) {
      if (px < minX) minX = px;
      if (px > maxX) maxX = px;
      if (py < minY) minY = py;
      if (py > maxY) maxY = py;
    }
  }
}

// Write full-size transparent version.
writeFileSync(join(root, "assets", "btt-logo.png"), PNG.sync.write(src));

// Write a tightly-trimmed version (nicer for the header slot).
const pad = 8;
minX = Math.max(0, minX - pad); minY = Math.max(0, minY - pad);
maxX = Math.min(width - 1, maxX + pad); maxY = Math.min(height - 1, maxY + pad);
const tw = maxX - minX + 1, th = maxY - minY + 1;
const trimmed = new PNG({ width: tw, height: th });
for (let y = 0; y < th; y++) {
  for (let x = 0; x < tw; x++) {
    const s = ((minY + y) * width + (minX + x)) * 4;
    const d = (y * tw + x) * 4;
    trimmed.data[d] = data[s];
    trimmed.data[d + 1] = data[s + 1];
    trimmed.data[d + 2] = data[s + 2];
    trimmed.data[d + 3] = data[s + 3];
  }
}
writeFileSync(join(root, "assets", "btt-logo-trim.png"), PNG.sync.write(trimmed));
console.log(`ok: full ${width}x${height}, trim ${tw}x${th}`);
