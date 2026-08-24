// src/components/custom/SignaturePad.tsx
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { Undo2, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';

export interface SignaturePadHandle {
  clear: () => void;
  undo: () => void;
  isEmpty: () => boolean;
  getCanvas: () => HTMLCanvasElement | null;
}

interface SignaturePadProps {
  maxWidth?: number;
  height?: number;
  strokeColor?: string;
  strokeWidth?: number;
  onChange?: (isEmpty: boolean) => void;
}

interface Point {
  x: number;
  y: number;
}

export const SignaturePad = forwardRef<SignaturePadHandle, SignaturePadProps>(
  ({ maxWidth = 600, height = 220, strokeColor = '#111827', strokeWidth = 2.5, onChange }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isDrawing = useRef(false);
    const lastPoint = useRef<Point | null>(null);
    const history = useRef<ImageData[]>([]);
    const [empty, setEmpty] = useState(true);
    const [canvasWidth, setCanvasWidth] = useState(maxWidth);

    const getContext = useCallback(() => canvasRef.current?.getContext('2d') || null, []);

    const initCanvas = useCallback(
      (cssWidth: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const dpr = window.devicePixelRatio || 1;
        canvas.width = cssWidth * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${cssWidth}px`;
        canvas.style.height = `${height}px`;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.scale(dpr, dpr);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, cssWidth, height);
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.strokeStyle = strokeColor;
          ctx.lineWidth = strokeWidth;
        }
      },
      [height, strokeColor, strokeWidth]
    );

    // Fixed: Wrap pushHistory in useCallback
    const pushHistory = useCallback(() => {
      const canvas = canvasRef.current;
      const ctx = getContext();
      if (!canvas || !ctx) return;
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      history.current.push(imageData);
      if (history.current.length > 20) history.current.shift();
    }, [getContext]);

    // Measure container width
    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      const measure = () => {
        const available = container.clientWidth;
        const next = Math.max(1, Math.min(maxWidth, available || maxWidth));
        setCanvasWidth(prev => (Math.abs(prev - next) > 1 ? next : prev));
      };

      measure();
      const observer = new ResizeObserver(measure);
      observer.observe(container);
      return () => observer.disconnect();
    }, [maxWidth]);

    // Initialize canvas when width changes
    useEffect(() => {
      if (!empty) return;
      initCanvas(canvasWidth);
    }, [canvasWidth, initCanvas, empty]);

    const getPoint = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      return { 
        x: e.clientX - rect.left, 
        y: e.clientY - rect.top 
      };
    };

    const handlePointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
      const ctx = getContext();
      if (!ctx) return;
      
      pushHistory();
      isDrawing.current = true;
      lastPoint.current = getPoint(e);
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth;
      canvasRef.current?.setPointerCapture(e.pointerId);
    }, [getContext, pushHistory, strokeColor, strokeWidth]);

    const handlePointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isDrawing.current) return;
      const ctx = getContext();
      if (!ctx || !lastPoint.current) return;
      
      const point = getPoint(e);
      ctx.beginPath();
      ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
      lastPoint.current = point;
      
      if (empty) {
        setEmpty(false);
        onChange?.(false);
      }
    }, [getContext, empty, onChange]);

    const stopDrawing = useCallback(() => {
      isDrawing.current = false;
      lastPoint.current = null;
    }, []);

    const clear = useCallback(() => {
      const canvas = canvasRef.current;
      const ctx = getContext();
      if (!canvas || !ctx) return;
      
      pushHistory();
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
      setEmpty(true);
      onChange?.(true);
    }, [getContext, pushHistory, onChange]);

    const undo = useCallback(() => {
      const ctx = getContext();
      const last = history.current.pop();
      if (!ctx || !last) return;
      ctx.putImageData(last, 0, 0);
    }, [getContext]);

    useImperativeHandle(ref, () => ({
      clear,
      undo,
      isEmpty: () => empty,
      getCanvas: () => canvasRef.current,
    }), [clear, undo, empty]);

    return (
      <div className="space-y-2">
        <div
          ref={containerRef}
          className="w-full border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-white touch-none"
        >
          <canvas
            ref={canvasRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={stopDrawing}
            onPointerLeave={stopDrawing}
            className="cursor-crosshair touch-none block w-full h-auto"
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" size="sm" variant="outline" onClick={undo}>
            <Undo2 className="h-4 w-4 mr-1" />
            Undo
          </Button>
          <Button type="button" size="sm" variant="destructive" onClick={clear}>
            <Trash2 className="h-4 w-4 mr-1" />
            Clear
          </Button>
        </div>
      </div>
    );
  }
);

SignaturePad.displayName = 'SignaturePad';