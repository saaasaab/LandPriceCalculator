const PERMUTATION = new Uint8Array(256);
for (let i = 0; i < 256; i++) {
  PERMUTATION[i] = i;
}

// Deterministic shuffle (Fisher-Yates with fixed seed pattern)
for (let i = 255; i > 0; i--) {
  const j = (i * 1103515245 + 12345) % (i + 1);
  const temp = PERMUTATION[i];
  PERMUTATION[i] = PERMUTATION[j];
  PERMUTATION[j] = temp;
}

const PERM = new Uint8Array(512);
for (let i = 0; i < 512; i++) {
  PERM[i] = PERMUTATION[i % 256];
}

function fade(t: number) {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function lerp(t: number, a: number, b: number) {
  return a + t * (b - a);
}

function grad(hash: number, x: number, y: number) {
  const h = hash & 3;
  const u = h < 2 ? x : y;
  const v = h < 2 ? y : x;
  return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
}

/** Returns smooth noise in the 0–1 range (similar to p5.js noise). */
export function perlin2D(x: number, y: number): number {
  const xi = Math.floor(x) & 255;
  const yi = Math.floor(y) & 255;
  const xf = x - Math.floor(x);
  const yf = y - Math.floor(y);
  const u = fade(xf);
  const v = fade(yf);

  const aa = PERM[PERM[xi] + yi];
  const ab = PERM[PERM[xi] + yi + 1];
  const ba = PERM[PERM[xi + 1] + yi];
  const bb = PERM[PERM[xi + 1] + yi + 1];

  const value = lerp(
    v,
    lerp(u, grad(aa, xf, yf), grad(ba, xf - 1, yf)),
    lerp(u, grad(ab, xf, yf - 1), grad(bb, xf - 1, yf - 1)),
  );

  return (value + 1) / 2;
}

function octaveNoise(
  x: number,
  y: number,
  octaves: { scale: number; weight: number; offsetX: number; offsetY: number }[],
) {
  return octaves.reduce((sum, { scale, weight, offsetX, offsetY }) => {
    return sum + (perlin2D(x * scale + offsetX, y * scale + offsetY) - 0.5) * weight;
  }, 0);
}

export function sampleTerrainElevation(
  x: number,
  y: number,
  siteWidthFt: number,
  siteHeightFt: number,
): { existingFt: number; finishedFt: number } {
  const baseElev = 100;
  const span = Math.max(siteWidthFt, siteHeightFt, 50);
  const noiseScale = span * 0.08;

  const nx = x / noiseScale;
  const ny = y / noiseScale;

  const existingVariation = octaveNoise(nx, ny, [
    { scale: 1, weight: 18, offsetX: 0, offsetY: 0 },
    { scale: 2.1, weight: 8, offsetX: 31.7, offsetY: 17.3 },
    { scale: 4.2, weight: 3, offsetX: 83.2, offsetY: 44.1 },
  ]);

  const slopeX = siteWidthFt > 0 ? (x / siteWidthFt - 0.5) * 6 : 0;
  const slopeY = siteHeightFt > 0 ? (y / siteHeightFt - 0.5) * -4 : 0;

  const existingFt = Math.round((baseElev + existingVariation + slopeX + slopeY) * 10) / 10;

  // Finished pad: nearly flat — gentle drainage slope with minimal ripple
  const finishSlopeX = siteWidthFt > 0 ? (x / siteWidthFt) * 1.2 : 0;
  const finishSlopeY = siteHeightFt > 0 ? (y / siteHeightFt) * -0.8 : 0;
  const finishRipple = octaveNoise(nx * 0.2, ny * 0.2, [
    { scale: 1, weight: 0.35, offsetX: 412.5, offsetY: 218.9 },
  ]);

  const finishedFt = Math.round((baseElev + finishSlopeX + finishSlopeY + finishRipple) * 10) / 10;

  return { existingFt, finishedFt };
}
