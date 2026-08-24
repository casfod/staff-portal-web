// src/components/custom/SignatureCropOverlay.tsx
import React, { useCallback, useRef, useState } from 'react';
import { CropBounds } from '../../utils/signatureProcessing';

interface SignatureCropOverlayProps {
  imageUrl: string;
  naturalWidth: number;
  naturalHeight: number;
  bounds: CropBounds;
  onChange: (bounds: CropBounds) => void;
}

type DragMode = 'move' | 'nw' | 'ne' | 'sw' | 'se' | null;

const HANDLE_SIZE = 14;
const MIN_SIZE = 12;

export const SignatureCropOverlay: React.FC<SignatureCropOverlayProps> = ({
  imageUrl,
  naturalWidth,
  naturalHeight,
  bounds,
  onChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragMode = useRef<DragMode>(null);
  const dragStart = useRef<{ x: number; y: number; bounds: CropBounds } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  // Convert pointer coordinates to canvas pixel space using the actual image display size
  const toCanvasCoords = useCallback(
    (clientX: number, clientY: number) => {
      const el = containerRef.current;
      const img = imageRef.current;
      if (!el || !img) return { x: 0, y: 0 };
      
      const rect = el.getBoundingClientRect();
      // Use the image's actual display dimensions for accurate scaling
      const displayWidth = img.offsetWidth || rect.width;
      const displayHeight = img.offsetHeight || rect.height;
      
      const scaleX = naturalWidth / displayWidth;
      const scaleY = naturalHeight / displayHeight;
      
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY,
      };
    },
    [naturalWidth, naturalHeight]
  );

  const clampBounds = useCallback(
    (b: CropBounds): CropBounds => {
      let { x, y, width, height } = b;
      
      // Ensure minimum size
      width = Math.max(MIN_SIZE, width);
      height = Math.max(MIN_SIZE, height);
      
      // Clamp to image boundaries
      x = Math.min(Math.max(0, x), naturalWidth - MIN_SIZE);
      y = Math.min(Math.max(0, y), naturalHeight - MIN_SIZE);
      width = Math.min(width, naturalWidth - x);
      height = Math.min(height, naturalHeight - y);
      
      return { x, y, width, height };
    },
    [naturalWidth, naturalHeight]
  );

  const startDrag = (mode: DragMode) => (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    dragMode.current = mode;
    const point = toCanvasCoords(e.clientX, e.clientY);
    dragStart.current = { 
      x: point.x, 
      y: point.y, 
      bounds: { ...bounds } 
    };
    setIsDragging(true);
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragMode.current || !dragStart.current) return;
    
    const point = toCanvasCoords(e.clientX, e.clientY);
    const dx = point.x - dragStart.current.x;
    const dy = point.y - dragStart.current.y;
    const start = dragStart.current.bounds;

    // Fixed: Use const for next since we're creating a new object
    const next: CropBounds = { ...start };

    if (dragMode.current === 'move') {
      next.x = start.x + dx;
      next.y = start.y + dy;
    } else if (dragMode.current) {
      // Handle resize from corners
      if (dragMode.current.includes('w')) {
        next.x = Math.min(start.x + start.width - MIN_SIZE, start.x + dx);
        next.width = start.width - (next.x - start.x);
      }
      if (dragMode.current.includes('e')) {
        next.width = Math.max(MIN_SIZE, start.width + dx);
      }
      if (dragMode.current.includes('n')) {
        next.y = Math.min(start.y + start.height - MIN_SIZE, start.y + dy);
        next.height = start.height - (next.y - start.y);
      }
      if (dragMode.current.includes('s')) {
        next.height = Math.max(MIN_SIZE, start.height + dy);
      }
    }

    onChange(clampBounds(next));
  };

  const stopDrag = () => {
    dragMode.current = null;
    dragStart.current = null;
    setIsDragging(false);
  };

  // Use pixel values directly with transform for precision
  const getStyle = (value: number, total: number) => {
    return `${(value / total) * 100}%`;
  };

  return (
    <div
      ref={containerRef}
      className="relative select-none touch-none mx-auto"
      style={{ 
        width: '100%', 
        maxWidth: 480, 
        aspectRatio: `${naturalWidth} / ${naturalHeight}` 
      }}
      onPointerMove={handlePointerMove}
      onPointerUp={stopDrag}
      onPointerLeave={stopDrag}
    >
      <img
        ref={imageRef}
        src={imageUrl}
        alt="Adjust crop area"
        className="absolute inset-0 w-full h-full object-contain pointer-events-none"
        draggable={false}
      />

      {/* Dim overlay */}
      <div
        className="absolute inset-0 bg-black/35 pointer-events-none"
        style={{
          clipPath: `polygon(
            0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%,
            ${getStyle(bounds.x, naturalWidth)} ${getStyle(bounds.y, naturalHeight)},
            ${getStyle(bounds.x, naturalWidth)} ${getStyle(bounds.y + bounds.height, naturalHeight)},
            ${getStyle(bounds.x + bounds.width, naturalWidth)} ${getStyle(bounds.y + bounds.height, naturalHeight)},
            ${getStyle(bounds.x + bounds.width, naturalWidth)} ${getStyle(bounds.y, naturalHeight)},
            ${getStyle(bounds.x, naturalWidth)} ${getStyle(bounds.y, naturalHeight)}
          )`,
        }}
      />

      {/* Selection box */}
      <div
        className={`absolute border-2 border-blue-500 ${isDragging ? 'cursor-grabbing' : 'cursor-move'}`}
        style={{
          left: getStyle(bounds.x, naturalWidth),
          top: getStyle(bounds.y, naturalHeight),
          width: getStyle(bounds.width, naturalWidth),
          height: getStyle(bounds.height, naturalHeight),
        }}
        onPointerDown={startDrag('move')}
      >
        {/* Corner handles */}
        {(['nw', 'ne', 'sw', 'se'] as const).map(corner => (
          <div
            key={corner}
            onPointerDown={startDrag(corner)}
            className="absolute bg-blue-500 border-2 border-white rounded-full shadow-sm hover:scale-110 transition-transform"
            style={{
              width: HANDLE_SIZE,
              height: HANDLE_SIZE,
              cursor: corner === 'nw' || corner === 'se' ? 'nwse-resize' : 'nesw-resize',
              top: corner.includes('n') ? -HANDLE_SIZE / 2 : undefined,
              bottom: corner.includes('s') ? -HANDLE_SIZE / 2 : undefined,
              left: corner.includes('w') ? -HANDLE_SIZE / 2 : undefined,
              right: corner.includes('e') ? -HANDLE_SIZE / 2 : undefined,
            }}
          />
        ))}
      </div>
    </div>
  );
};