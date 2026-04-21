// frontend/src/ui/ImageEditor.tsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import {
  Wand2,
  Contrast,
  Sun,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Undo,
  Redo,
  Download,
  Check,
  X,
  RefreshCw,
  Sliders,
  Eraser,
} from "lucide-react";
import Button from "./Button";

interface ImageEditorProps {
  imageFile: File;
  onSave: (editedImageUrl: string) => void;
  onCancel: () => void;
  onUseOriginal: () => void;
}

const ImageEditor: React.FC<ImageEditorProps> = ({
  imageFile,
  onSave,
  onCancel,
  onUseOriginal,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(
    null
  );

  // Image adjustments
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [flipX, setFlipX] = useState(false);
  const [flipY, setFlipY] = useState(false);
  const [removeBackground, setRemoveBackground] = useState(false);
  const [backgroundThreshold, setBackgroundThreshold] = useState(240);

  // History for undo/redo
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Load image
  useEffect(() => {
    const img = new Image();
    const url = URL.createObjectURL(imageFile);
    img.onload = () => {
      setOriginalImage(img);
    };
    img.src = url;

    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  // Apply all edits to canvas
  const applyEdits = useCallback(() => {
    if (!originalImage || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Reset canvas dimensions to original image size
    canvas.width = originalImage.width;
    canvas.height = originalImage.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();

    // Handle rotation and flipping
    let drawWidth = canvas.width;
    let drawHeight = canvas.height;

    // Reset canvas for transformations
    if (rotation !== 0) {
      const radians = (rotation * Math.PI) / 180;
      const cos = Math.abs(Math.cos(radians));
      const sin = Math.abs(Math.sin(radians));
      drawWidth = canvas.width * cos + canvas.height * sin;
      drawHeight = canvas.width * sin + canvas.height * cos;

      canvas.width = drawWidth;
      canvas.height = drawHeight;

      ctx.translate(drawWidth / 2, drawHeight / 2);
      ctx.rotate(radians);
      ctx.translate(-originalImage.width / 2, -originalImage.height / 2);
    }

    // Apply flipping
    let scaleX = 1,
      scaleY = 1;
    let translateX = 0,
      translateY = 0;

    if (flipX) {
      scaleX = -1;
      translateX = originalImage.width;
    }
    if (flipY) {
      scaleY = -1;
      translateY = originalImage.height;
    }

    if (flipX || flipY) {
      ctx.translate(translateX, translateY);
      ctx.scale(scaleX, scaleY);
    }

    // Draw image
    ctx.drawImage(originalImage, 0, 0);
    ctx.restore();

    // Apply filters
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      // Apply brightness
      r = r * (brightness / 100);
      g = g * (brightness / 100);
      b = b * (brightness / 100);

      // Apply contrast
      const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
      r = factor * (r - 128) + 128;
      g = factor * (g - 128) + 128;
      b = factor * (b - 128) + 128;

      // Apply saturation
      const gray = 0.2989 * r + 0.587 * g + 0.114 * b;
      r = gray + (r - gray) * (saturation / 100);
      g = gray + (g - gray) * (saturation / 100);
      b = gray + (b - gray) * (saturation / 100);

      // Clamp values
      data[i] = Math.min(255, Math.max(0, r));
      data[i + 1] = Math.min(255, Math.max(0, g));
      data[i + 2] = Math.min(255, Math.max(0, b));

      // Remove background (make light pixels transparent)
      if (removeBackground) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        if (avg > backgroundThreshold) {
          data[i + 3] = 0; // Set alpha to 0 (transparent)
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);

    // Save to history (only if we're not loading from history)
    const currentState = canvas.toDataURL();
    if (historyIndex === -1 || history[historyIndex] !== currentState) {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(currentState);
      // Limit history to 50 items
      if (newHistory.length > 50) {
        newHistory.shift();
      }
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  }, [
    originalImage,
    brightness,
    contrast,
    saturation,
    rotation,
    flipX,
    flipY,
    removeBackground,
    backgroundThreshold,
    history,
    historyIndex,
  ]);

  // Apply edits when any setting changes or when original image loads
  useEffect(() => {
    if (originalImage) {
      applyEdits();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    originalImage,
    brightness,
    contrast,
    saturation,
    rotation,
    flipX,
    flipY,
    removeBackground,
    backgroundThreshold,
  ]);

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      loadHistoryState(newIndex);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      loadHistoryState(newIndex);
    }
  };

  const loadHistoryState = (index: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !history[index]) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
    };
    img.src = history[index];
  };

  const resetAll = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setRotation(0);
    setFlipX(false);
    setFlipY(false);
    setRemoveBackground(false);
    setBackgroundThreshold(240);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create a new canvas for the final signature (with transparent background)
    const finalCanvas = document.createElement("canvas");

    // Get the signature area (crop to content)
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Find bounds of non-transparent pixels
    let minX = canvas.width;
    let minY = canvas.height;
    let maxX = 0;
    let maxY = 0;
    let hasContent = false;

    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const alpha = imageData.data[(y * canvas.width + x) * 4 + 3];
        if (alpha > 0) {
          hasContent = true;
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
      }
    }

    let editedImageUrl: string;

    if (hasContent && maxX > minX && maxY > minY) {
      // Add padding
      const padding = 20;
      const cropWidth = maxX - minX + padding * 2;
      const cropHeight = maxY - minY + padding * 2;

      finalCanvas.width = cropWidth;
      finalCanvas.height = cropHeight;

      const finalCtx = finalCanvas.getContext("2d");
      if (finalCtx) {
        // Make background transparent
        finalCtx.clearRect(0, 0, cropWidth, cropHeight);

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
      editedImageUrl = finalCanvas.toDataURL("image/png");
    } else {
      // If no content found, just use the canvas as is
      editedImageUrl = canvas.toDataURL("image/png");
    }

    onSave(editedImageUrl);
  };

  // Helper function to handle slider changes (since rc-slider can return number or number[])
  const handleBrightnessChange = (value: number | number[]) => {
    const val = Array.isArray(value) ? value[0] : value;
    setBrightness(val);
  };

  const handleContrastChange = (value: number | number[]) => {
    const val = Array.isArray(value) ? value[0] : value;
    setContrast(val);
  };

  const handleSaturationChange = (value: number | number[]) => {
    const val = Array.isArray(value) ? value[0] : value;
    setSaturation(val);
  };

  const handleThresholdChange = (value: number | number[]) => {
    const val = Array.isArray(value) ? value[0] : value;
    setBackgroundThreshold(val);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Canvas Preview */}
      <div className="flex-1">
        <div className="bg-gray-100 rounded-lg p-4 flex justify-center items-center min-h-[300px]">
          <canvas
            ref={canvasRef}
            className="max-w-full h-auto border border-gray-300 shadow-lg"
            style={{ maxHeight: "400px" }}
          />
        </div>

        <div className="flex justify-center gap-2 mt-4">
          <Button
            size="small"
            variant="secondary"
            onClick={undo}
            disabled={historyIndex <= 0}
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            size="small"
            variant="secondary"
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
          >
            <Redo className="h-4 w-4" />
          </Button>
          <Button size="small" variant="secondary" onClick={resetAll}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Reset
          </Button>
        </div>
      </div>

      {/* Controls Panel */}
      <div className="w-full lg:w-80 space-y-4">
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
            <Sliders className="h-4 w-4" />
            Adjustments
          </h4>

          <div>
            <label className="text-sm text-gray-600 flex items-center gap-2 mb-2">
              <Sun className="h-3 w-3" />
              Brightness: {brightness}%
            </label>
            <Slider
              min={0}
              max={200}
              value={brightness}
              onChange={handleBrightnessChange}
              trackStyle={{ backgroundColor: "#1373B0" }}
              handleStyle={{ borderColor: "#1373B0" }}
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 flex items-center gap-2 mb-2">
              <Contrast className="h-3 w-3" />
              Contrast: {contrast}%
            </label>
            <Slider
              min={0}
              max={200}
              value={contrast}
              onChange={handleContrastChange}
              trackStyle={{ backgroundColor: "#1373B0" }}
              handleStyle={{ borderColor: "#1373B0" }}
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 flex items-center gap-2 mb-2">
              <Wand2 className="h-3 w-3" />
              Saturation: {saturation}%
            </label>
            <Slider
              min={0}
              max={200}
              value={saturation}
              onChange={handleSaturationChange}
              trackStyle={{ backgroundColor: "#1373B0" }}
              handleStyle={{ borderColor: "#1373B0" }}
            />
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <h4 className="font-semibold text-gray-900">Transform</h4>

          <div className="flex gap-2">
            <Button
              size="small"
              variant="secondary"
              onClick={() => setRotation((prev) => prev - 90)}
            >
              <RotateCw className="h-4 w-4" />
              Rotate Left
            </Button>
            <Button
              size="small"
              variant="secondary"
              onClick={() => setRotation((prev) => prev + 90)}
            >
              <RotateCw className="h-4 w-4 rotate-90" />
              Rotate Right
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              size="small"
              variant={flipX ? "primary" : "secondary"}
              onClick={() => setFlipX(!flipX)}
            >
              <FlipHorizontal className="h-4 w-4 mr-1" />
              Flip H
            </Button>
            <Button
              size="small"
              variant={flipY ? "primary" : "secondary"}
              onClick={() => setFlipY(!flipY)}
            >
              <FlipVertical className="h-4 w-4 mr-1" />
              Flip V
            </Button>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <label className="font-semibold text-gray-900 flex items-center gap-2">
              <Eraser className="h-4 w-4" />
              Remove Background
            </label>
            <button
              onClick={() => setRemoveBackground(!removeBackground)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                removeBackground ? "bg-blue-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  removeBackground ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {removeBackground && (
            <div>
              <label className="text-sm text-gray-600 mb-2 block">
                Background Threshold: {backgroundThreshold}
              </label>
              <Slider
                min={100}
                max={255}
                value={backgroundThreshold}
                onChange={handleThresholdChange}
                trackStyle={{ backgroundColor: "#1373B0" }}
                handleStyle={{ borderColor: "#1373B0" }}
              />
              <p className="text-xs text-gray-500 mt-1">
                Higher values remove more background
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-4">
          <Button variant="secondary" onClick={onCancel} className="flex-1">
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
          <Button
            variant="secondary"
            onClick={onUseOriginal}
            className="flex-1"
          >
            <Download className="h-4 w-4 mr-1" />
            Use Original
          </Button>
          <Button onClick={handleSave} className="flex-1">
            <Check className="h-4 w-4 mr-1" />
            Save Edits
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;
