// frontend/src/ui/SignatureCanvas.tsx
import React, { useRef, useState, useEffect } from "react";
import { Eraser, Check, X, Trash2 } from "lucide-react";
import Button from "./Button";

interface SignatureCanvasProps {
  onSave: (signatureDataUrl: string) => void;
  onCancel: () => void;
  width?: number;
  height?: number;
}

const SignatureCanvas: React.FC<SignatureCanvasProps> = ({
  onSave,
  onCancel,
  width = 600,
  height = 200,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEraser, setIsEraser] = useState(false);
  const [penColor, setPenColor] = useState("#000000");
  const [penSize, setPenSize] = useState(2);
  const [lastPos, setLastPos] = useState<{ x: number; y: number } | null>(null);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set up canvas with white background
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = isEraser ? "white" : penColor;
    ctx.lineWidth = isEraser ? 20 : penSize;
  }, [isEraser, penColor, penSize]);

  const getCoordinates = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX, clientY;

    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    return { x, y };
  };

  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    e.preventDefault();
    setIsDrawing(true);
    const coords = getCoordinates(e);
    if (coords) {
      setLastPos(coords);
      draw(coords, coords);
      setHasDrawn(true);
    }
  };

  const draw = (
    current: { x: number; y: number },
    previous: { x: number; y: number }
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(previous.x, previous.y);
    ctx.lineTo(current.x, current.y);
    ctx.stroke();
  };

  const drawOrErase = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing) return;
    e.preventDefault();

    const currentPos = getCoordinates(e);
    if (!currentPos || !lastPos) return;

    draw(currentPos, lastPos);
    setLastPos(currentPos);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    setLastPos(null);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create a new canvas for the final signature (with transparent background)
    const finalCanvas = document.createElement("canvas");
    const finalCtx = finalCanvas.getContext("2d");

    // Find bounds of the signature
    const ctx = canvas.getContext("2d");
    const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);

    if (imageData) {
      let minX = canvas.width,
        minY = canvas.height,
        maxX = 0,
        maxY = 0;

      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const pixel = imageData.data[(y * canvas.width + x) * 4];
          // Check if pixel is not white (has drawing)
          if (pixel < 250) {
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
          }
        }
      }

      if (maxX > minX && maxY > minY) {
        const padding = 20;
        const cropWidth = maxX - minX + padding * 2;
        const cropHeight = maxY - minY + padding * 2;

        finalCanvas.width = cropWidth;
        finalCanvas.height = cropHeight;

        if (finalCtx) {
          // Make background transparent
          finalCtx.fillStyle = "transparent";
          finalCtx.fillRect(0, 0, cropWidth, cropHeight);

          // Draw the signature
          finalCtx.drawImage(
            canvas,
            minX - padding,
            minY - padding,
            cropWidth,
            cropHeight,
            0,
            0,
            cropWidth,
            cropHeight
          );
        }
      } else {
        finalCanvas.width = canvas.width;
        finalCanvas.height = canvas.height;
        if (finalCtx) {
          finalCtx.drawImage(canvas, 0, 0);
        }
      }
    }

    const dataUrl = finalCanvas.toDataURL("image/png");
    onSave(dataUrl);
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 justify-center items-center p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Color:</label>
          <input
            type="color"
            value={penColor}
            onChange={(e) => setPenColor(e.target.value)}
            disabled={isEraser}
            className="w-8 h-8 rounded border cursor-pointer"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Size:</label>
          <input
            type="range"
            min={1}
            max={10}
            value={penSize}
            onChange={(e) => setPenSize(parseInt(e.target.value))}
            disabled={isEraser}
            className="w-24"
          />
          <span className="text-xs text-gray-500">{penSize}px</span>
        </div>

        <Button
          type="button"
          size="small"
          variant={isEraser ? "primary" : "secondary"}
          onClick={() => setIsEraser(!isEraser)}
        >
          <Eraser className="h-4 w-4 mr-1" />
          {isEraser ? "Pen Mode" : "Eraser"}
        </Button>

        <Button
          type="button"
          size="small"
          variant="secondary"
          onClick={clearCanvas}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Clear All
        </Button>
      </div>

      {/* Canvas */}
      <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-white shadow-lg">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          style={{
            width: "100%",
            height: "auto",
            touchAction: "none",
            cursor: "crosshair",
          }}
          onMouseDown={startDrawing}
          onMouseMove={drawOrErase}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={drawOrErase}
          onTouchEnd={stopDrawing}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 justify-center">
        <Button
          type="button"
          size="small"
          variant="secondary"
          onClick={onCancel}
        >
          <X className="h-4 w-4 mr-1" />
          Cancel
        </Button>

        <Button
          type="button"
          size="small"
          onClick={handleSave}
          disabled={!hasDrawn}
        >
          <Check className="h-4 w-4 mr-1" />
          Save Signature
        </Button>
      </div>

      <p className="text-xs text-gray-500 text-center">
        Draw your signature in the box above. Use the toolbar to adjust pen
        color, size, or switch to eraser mode.
      </p>
    </div>
  );
};

export default SignatureCanvas;
