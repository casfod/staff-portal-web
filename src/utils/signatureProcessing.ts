// src/utils/signatureProcessing.ts
export interface CropBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SignatureAdjustments {
  contrast: number;
  removeBackground: boolean;
  threshold: number;
}

export const DEFAULT_ADJUSTMENTS: SignatureAdjustments = {
  contrast: 30,
  removeBackground: true,
  threshold: 200,
};

/**
 * Convert canvas to File with proper handling
 */
export const canvasToFile = (
  canvas: HTMLCanvasElement,
  fileName: string = 'signature.png'
): Promise<File> => {
  return new Promise((resolve, reject) => {
    try {
      // Use PNG for transparency support
      const dataUrl = canvas.toDataURL('image/png');
      fetch(dataUrl)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], fileName, { type: 'image/png' });
          resolve(file);
        })
        .catch(reject);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Load image from File
 */
export const loadImage = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    img.src = url;
  });
};

/**
 * Convert Image or Canvas to Canvas
 */
export const toCanvas = (
  source: HTMLImageElement | HTMLCanvasElement
): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  canvas.width = source.width;
  canvas.height = source.height;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.drawImage(source, 0, 0);
  }
  return canvas;
};

/**
 * FIXED: Prepare image for cropping with contrast and background removal
 * Using V1's pixel manipulation approach for reliability
 */
export const prepareForCrop = (
  source: HTMLImageElement | HTMLCanvasElement,
  adjustments: SignatureAdjustments
): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  canvas.width = source.width;
  canvas.height = source.height;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return canvas;
  
  // Draw source
  ctx.drawImage(source, 0, 0);
  
  // Get image data for pixel manipulation (V1 approach)
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];
    
    // Apply contrast (V1 algorithm)
    const factor = (259 * (adjustments.contrast + 255)) / (255 * (259 - adjustments.contrast));
    r = factor * (r - 128) + 128;
    g = factor * (g - 128) + 128;
    b = factor * (b - 128) + 128;
    
    // Clamp values
    data[i] = Math.min(255, Math.max(0, r));
    data[i + 1] = Math.min(255, Math.max(0, g));
    data[i + 2] = Math.min(255, Math.max(0, b));
    
    // Remove background (make light pixels transparent) - V1 approach
    if (adjustments.removeBackground) {
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      if (avg > adjustments.threshold) {
        data[i + 3] = 0; // Set alpha to 0 (transparent)
      }
    }
  }
  
  ctx.putImageData(imageData, 0, 0);
  return canvas;
};

/**
 * FIXED: Detect content bounds with proper padding and validation
 * Using V1's content detection approach
 */
export const detectContentBounds = (
  canvas: HTMLCanvasElement,
  padding: number = 20
): CropBounds | null => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  let minX = canvas.width;
  let minY = canvas.height;
  let maxX = 0;
  let maxY = 0;
  let hasContent = false;
  
  // Use V1's approach - check alpha channel for content
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const alpha = data[(y * canvas.width + x) * 4 + 3];
      if (alpha > 10) {
        hasContent = true;
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }
  
  if (!hasContent || maxX <= minX || maxY <= minY) {
    return null;
  }
  
  // Add padding while staying within canvas bounds
  const paddedMinX = Math.max(0, minX - padding);
  const paddedMinY = Math.max(0, minY - padding);
  const paddedMaxX = Math.min(canvas.width, maxX + padding);
  const paddedMaxY = Math.min(canvas.height, maxY + padding);
  
  return {
    x: paddedMinX,
    y: paddedMinY,
    width: paddedMaxX - paddedMinX,
    height: paddedMaxY - paddedMinY,
  };
};

/**
 * Crop and align with proper bounds validation
 */
export const cropAndAlign = (
  canvas: HTMLCanvasElement,
  bounds: CropBounds
): HTMLCanvasElement => {
  const output = document.createElement('canvas');
  
  // Validate bounds
  const validBounds = {
    x: Math.max(0, Math.min(bounds.x, canvas.width - 1)),
    y: Math.max(0, Math.min(bounds.y, canvas.height - 1)),
    width: Math.min(bounds.width, canvas.width - bounds.x),
    height: Math.min(bounds.height, canvas.height - bounds.y),
  };
  
  // Ensure minimum size
  if (validBounds.width < 1) validBounds.width = 1;
  if (validBounds.height < 1) validBounds.height = 1;
  
  output.width = validBounds.width;
  output.height = validBounds.height;
  
  const ctx = output.getContext('2d');
  if (ctx) {
    // Clear with transparent background (V1 approach)
    ctx.clearRect(0, 0, output.width, output.height);
    ctx.drawImage(
      canvas,
      validBounds.x, validBounds.y,
      validBounds.width, validBounds.height,
      0, 0,
      validBounds.width, validBounds.height
    );
  }
  
  return output;
};