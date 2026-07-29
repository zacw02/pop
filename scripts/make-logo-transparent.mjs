// One-time asset step: convert the JPEG POP logo to a PNG with a transparent
// background. JPEG cannot store transparency, so the source has a solid white
// background. We flood-fill from the image borders and clear only the white
// that is CONNECTED to the edge — that removes the surrounding background while
// leaving the white *inside* the "POP" letters and the white truck untouched
// (those whites are enclosed by blue and never reached from the border).
import { Jimp } from "jimp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(__dirname, "pop-logo-source.jpg");
const OUT = path.join(__dirname, "..", "public", "assets", "pop-logo.png");

// A pixel counts as "background white" if every channel is very bright.
const THRESHOLD = 205;

const img = await Jimp.read(SRC);
const { width: w, height: h, data } = img.bitmap;

const isWhite = (i) =>
  data[i] >= THRESHOLD && data[i + 1] >= THRESHOLD && data[i + 2] >= THRESHOLD;

const visited = new Uint8Array(w * h);
// Queue of pixel indices (y*w + x); seeded with every border pixel.
const queue = [];
const push = (x, y) => {
  const p = y * w + x;
  if (visited[p]) return;
  const i = p * 4;
  if (!isWhite(i)) return;
  visited[p] = 1;
  data[i + 3] = 0; // clear alpha
  queue.push(p);
};

for (let x = 0; x < w; x++) {
  push(x, 0);
  push(x, h - 1);
}
for (let y = 0; y < h; y++) {
  push(0, y);
  push(w - 1, y);
}

let head = 0;
while (head < queue.length) {
  const p = queue[head++];
  const x = p % w;
  const y = (p - x) / w;
  if (x > 0) push(x - 1, y);
  if (x < w - 1) push(x + 1, y);
  if (y > 0) push(x, y - 1);
  if (y < h - 1) push(x, y + 1);
}

// Soften the hard edge: any still-opaque near-white pixel that borders a
// cleared pixel gets partial transparency, trimming the anti-aliased halo.
const original = Uint8ClampedArray.from(data);
for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const p = y * w + x;
    const i = p * 4;
    if (original[i + 3] === 0) continue;
    const bright = (original[i] + original[i + 1] + original[i + 2]) / 3;
    if (bright < 230) continue;
    const neighborCleared =
      (x > 0 && original[(p - 1) * 4 + 3] === 0) ||
      (x < w - 1 && original[(p + 1) * 4 + 3] === 0) ||
      (y > 0 && original[(p - w) * 4 + 3] === 0) ||
      (y < h - 1 && original[(p + w) * 4 + 3] === 0);
    if (neighborCleared) data[i + 3] = 90;
  }
}

await img.write(OUT);
console.log(`Wrote transparent logo -> ${OUT} (${w}x${h})`);
