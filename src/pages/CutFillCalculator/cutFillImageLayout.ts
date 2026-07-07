import type { BoundaryPoint } from '../../utils/siteMapCalculations';

export type ImageTransform = {
  scale: number;
  offsetX: number;
  offsetY: number;
  drawW: number;
  drawH: number;
};

export function computeImageTransform(
  canvasW: number,
  canvasH: number,
  imgW: number,
  imgH: number,
  pad = 16,
): ImageTransform {
  const availW = canvasW - pad * 2;
  const availH = canvasH - pad * 2;
  const scale = Math.min(availW / imgW, availH / imgH);
  const drawW = imgW * scale;
  const drawH = imgH * scale;
  return {
    scale,
    offsetX: (canvasW - drawW) / 2,
    offsetY: (canvasH - drawH) / 2,
    drawW,
    drawH,
  };
}

export function computeBlankCanvasTransform(
  canvasW: number,
  canvasH: number,
  pad = 16,
): ImageTransform {
  const drawW = Math.max(canvasW - pad * 2, 1);
  const drawH = Math.max(canvasH - pad * 2, 1);
  return {
    scale: 1,
    offsetX: pad,
    offsetY: pad,
    drawW,
    drawH,
  };
}

export function getPlanTransform(
  canvasW: number,
  canvasH: number,
  imgW: number,
  imgH: number,
  hasImage: boolean,
  pad = 16,
): ImageTransform {
  if (hasImage) return computeImageTransform(canvasW, canvasH, imgW, imgH, pad);
  return computeBlankCanvasTransform(canvasW, canvasH, pad);
}

export function imagePointToScreen(point: BoundaryPoint, transform: ImageTransform) {
  return {
    x: transform.offsetX + point.x * transform.scale,
    y: transform.offsetY + point.y * transform.scale,
  };
}
