// src/components/custom/SignatureUpload.tsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { PenTool, Upload as UploadIcon, RotateCcw, Save, Trash2, Loader2, Info } from 'lucide-react';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { SignaturePad, SignaturePadHandle } from './SignaturePad';
import { SignatureCropOverlay } from './SignatureCropOverlay';
import {
  CropBounds,
  DEFAULT_ADJUSTMENTS,
  SignatureAdjustments,
  canvasToFile,
  // Removed unused import: cropAndAlign
  detectContentBounds,
  loadImage,
  prepareForCrop,
  toCanvas,
} from '../../utils/signatureProcessing';
import { useSignature } from '../../hooks/useFile';
import { IAvatarResponse } from '../../interfaces';

interface SignatureUploadProps {
  userId: string;
  currentSignatureUrl?: string;
  onUploaded?: (url: string) => void;
}

const CHECKERBOARD_STYLE: React.CSSProperties = {
  backgroundImage: 'repeating-conic-gradient(#e5e7eb 0% 25%, #ffffff 0% 50%) 0 / 16px 16px',
};

export const SignatureUpload: React.FC<SignatureUploadProps> = ({
  userId,
  currentSignatureUrl,
  onUploaded,
}) => {
  const { uploadSignature, removeSignature, isUploading, isRemoving } = useSignature(userId);

  const [activeTab, setActiveTab] = useState<'draw' | 'upload'>('draw');
  const [source, setSource] = useState<HTMLCanvasElement | HTMLImageElement | null>(null);
  const [adjustments, setAdjustments] = useState<SignatureAdjustments>(DEFAULT_ADJUSTMENTS);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDrawn, setIsDrawn] = useState(false);

  const [cropMode, setCropMode] = useState<'auto' | 'manual'>('auto');
  const [manualBounds, setManualBounds] = useState<CropBounds | null>(null);

  const padRef = useRef<SignaturePadHandle>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const processedCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const preCropCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [preCropUrl, setPreCropUrl] = useState<string | null>(null);
  const originalFileRef = useRef<File | null>(null);
  const [hasOriginalFile, setHasOriginalFile] = useState(false);

  // Re-run contrast/background-removal
  useEffect(() => {
    if (!source) {
      preCropCanvasRef.current = null;
      setPreCropUrl(null);
      return;
    }
    const canvas = prepareForCrop(source, adjustments);
    preCropCanvasRef.current = canvas;
    setPreCropUrl(canvas.toDataURL('image/png'));
  }, [source, adjustments]);

  // Reset crop when source changes
  useEffect(() => {
    setCropMode('auto');
    setManualBounds(null);
  }, [source]);

  // FIXED: Crop and preview generation - using V1's reliable approach
  useEffect(() => {
    const canvas = preCropCanvasRef.current;
    if (!canvas) {
      setPreviewUrl(null);
      processedCanvasRef.current = null;
      return;
    }

    // Create a new canvas for the output (V1 approach)
    const output = document.createElement('canvas');
    let bounds: CropBounds | null = null;

    if (cropMode === 'manual' && manualBounds) {
      // Clamp manual bounds to ensure they're within the image
      bounds = {
        x: Math.max(0, Math.min(manualBounds.x, canvas.width - 10)),
        y: Math.max(0, Math.min(manualBounds.y, canvas.height - 10)),
        width: Math.min(manualBounds.width, canvas.width - Math.max(0, Math.min(manualBounds.x, canvas.width - 10))),
        height: Math.min(manualBounds.height, canvas.height - Math.max(0, Math.min(manualBounds.y, canvas.height - 10))),
      };
    } else {
      bounds = detectContentBounds(canvas);
    }

    if (bounds && bounds.width > 0 && bounds.height > 0) {
      // Use V1's direct approach - create a clean cropped canvas
      output.width = bounds.width;
      output.height = bounds.height;
      const ctx = output.getContext('2d');
      if (ctx) {
        // Clear with transparent background (V1 approach)
        ctx.clearRect(0, 0, output.width, output.height);
        ctx.drawImage(
          canvas,
          bounds.x, bounds.y,
          bounds.width, bounds.height,
          0, 0,
          bounds.width, bounds.height
        );
      }
    } else {
      // No bounds found, use entire canvas with V1 approach
      output.width = canvas.width;
      output.height = canvas.height;
      const ctx = output.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, output.width, output.height);
        ctx.drawImage(canvas, 0, 0);
      }
    }

    processedCanvasRef.current = output;
    setPreviewUrl(output.toDataURL('image/png'));
  }, [preCropUrl, cropMode, manualBounds]);

  const handleEnableManualCrop = useCallback(() => {
    const canvas = preCropCanvasRef.current;
    if (!canvas) return;
    
    const initial = manualBounds ?? detectContentBounds(canvas) ?? { 
      x: 0, 
      y: 0, 
      width: canvas.width, 
      height: canvas.height 
    };
    setManualBounds(initial);
    setCropMode('manual');
  }, [manualBounds]);

  const handleResetCrop = useCallback(() => {
    setCropMode('auto');
    setManualBounds(null);
  }, []);

  const handleUseDrawing = useCallback(() => {
    const canvas = padRef.current?.getCanvas();
    if (!canvas || padRef.current?.isEmpty()) {
      setError('Draw a signature first');
      return;
    }
    setError(null);
    originalFileRef.current = null;
    setHasOriginalFile(false);
    setSource(toCanvas(canvas));
  }, []);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }
    
    setError(null);
    try {
      const img = await loadImage(file);
      originalFileRef.current = file;
      setHasOriginalFile(true);
      setSource(img);
    } catch {
      setError('Could not read that image');
    }
    e.target.value = '';
  }, []);

  const handleReset = useCallback(() => {
    setSource(null);
    setAdjustments(DEFAULT_ADJUSTMENTS);
    setError(null);
    setIsDrawn(false);
    setCropMode('auto');
    setManualBounds(null);
    originalFileRef.current = null;
    setHasOriginalFile(false);
    padRef.current?.clear();
  }, []);

  // FIXED: Save using V1's reliable approach
  const handleSave = useCallback(async () => {
    if (!processedCanvasRef.current) {
      setError('Create a signature first');
      return;
    }
    
    setError(null);
    try {
      // Use the processed canvas directly (V1 approach)
      const canvas = processedCanvasRef.current;
      
      // Validate there's actual content (V1 approach)
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let hasContent = false;
        for (let i = 0; i < imageData.data.length; i += 4) {
          if (imageData.data[i + 3] > 10) {
            hasContent = true;
            break;
          }
        }
        if (!hasContent) {
          setError('No signature content detected');
          return;
        }
      }

      const file = await canvasToFile(canvas, `signature-${Date.now()}.png`);
      const result: IAvatarResponse = await uploadSignature(file);
      const url = result?.data?.url || '';
      if (url) onUploaded?.(url);
      handleReset();
    } catch (err) {
      setError('Failed to save signature');
      console.error('Save error:', err);
    }
  }, [uploadSignature, onUploaded, handleReset]);

  const handleSaveOriginal = useCallback(async () => {
    if (!originalFileRef.current) return;
    setError(null);
    try {
      const result: IAvatarResponse = await uploadSignature(originalFileRef.current);
      const url = result?.data?.url || '';
      if (url) onUploaded?.(url);
      handleReset();
    } catch {
      setError('Failed to save signature');
    }
  }, [uploadSignature, onUploaded, handleReset]);

  const handleRemoveExisting = useCallback(async () => {
    setError(null);
    try {
      await removeSignature();
      onUploaded?.('');
    } catch {
      setError('Failed to remove signature');
    }
  }, [removeSignature, onUploaded]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <PenTool className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Signature</h2>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {currentSignatureUrl && !source && (
          <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <img
              src={currentSignatureUrl}
              alt="Current signature"
              className="h-16 max-16 bg-white rounded border border-gray-200 px-2"
            />
            <div className="flex-1">
              <p className="text-sm text-gray-600">Current signature on file</p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outlineDestructive"
              onClick={handleRemoveExisting}
              disabled={isRemoving}
            >
              {isRemoving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={v => setActiveTab(v as 'draw' | 'upload')}>
          <TabsList>
            <TabsTrigger value="draw" className="flex items-center gap-2">
              <PenTool className="h-4 w-4" />
              Draw
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <UploadIcon className="h-4 w-4" />
              Upload
            </TabsTrigger>
          </TabsList>

          <TabsContent value="draw" className="pt-4">
            <SignaturePad ref={padRef} onChange={empty => setIsDrawn(!empty)} />
            <div className="flex justify-end mt-3">
              <Button type="button" size="sm" onClick={handleUseDrawing} disabled={!isDrawn}>
                Use this drawing
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="upload" className="pt-4 space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-blue-900">Upload guidelines</h3>
                  <ul className="text-xs text-blue-800 space-y-1 list-disc pl-4">
                    <li>Use a white background with dark ink for best results</li>
                    <li>Sign on plain white paper and take a clear photo</li>
                    <li>Ensure good lighting with no shadows</li>
                    <li>Maximum file size: 5MB (JPG or PNG)</li>
                  </ul>
                </div>
              </div>
            </div>
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  fileInputRef.current?.click();
                }
              }}
            >
              <UploadIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Click to upload a photo of your signature</p>
              <p className="text-xs text-gray-500 mt-1">JPG or PNG • Max 5MB</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>
          </TabsContent>
        </Tabs>

        {error && <p className="text-sm text-red-600">{error}</p>}

        {previewUrl && (
          <div className="space-y-4 border-t border-gray-200 pt-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-700">Preview</p>
                {cropMode === 'auto' ? (
                  <button
                    type="button"
                    onClick={handleEnableManualCrop}
                    className="text-xs font-medium text-blue-600 hover:underline"
                  >
                    Adjust crop manually
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleResetCrop}
                    className="text-xs font-medium text-gray-500 hover:underline"
                  >
                    Reset to auto-crop
                  </button>
                )}
              </div>

              {cropMode === 'manual' && preCropUrl && manualBounds && preCropCanvasRef.current ? (
                <div className="space-y-3">
                  <div className="rounded-lg border border-gray-200 p-3" style={CHECKERBOARD_STYLE}>
                    <SignatureCropOverlay
                      imageUrl={preCropUrl}
                      naturalWidth={preCropCanvasRef.current.width}
                      naturalHeight={preCropCanvasRef.current.height}
                      bounds={manualBounds}
                      onChange={setManualBounds}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Drag the box to move it, or drag a corner to resize. Everything outside the box
                    is discarded.
                  </p>
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">Result</p>
                    <div
                      className="rounded-lg border border-gray-200 p-4 flex items-center justify-center"
                      style={CHECKERBOARD_STYLE}
                    >
                      <img src={previewUrl} alt="Signature preview" className="max-h-24 max-w-full" />
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className="rounded-lg border border-gray-200 p-4 flex items-center justify-center"
                  style={CHECKERBOARD_STYLE}
                >
                  <img src={previewUrl} alt="Signature preview" className="max-h-32 max-w-full" />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Contrast</span>
                  <span>{adjustments.contrast}</span>
                </div>
                <input
                  type="range"
                  min={-100}
                  max={100}
                  value={adjustments.contrast}
                  onChange={e =>
                    setAdjustments(prev => ({ ...prev, contrast: Number(e.target.value) }))
                  }
                  className="w-full accent-blue-600"
                  aria-label="Contrast"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={adjustments.removeBackground}
                      onChange={e =>
                        setAdjustments(prev => ({ ...prev, removeBackground: e.target.checked }))
                      }
                    />
                    Remove background
                  </label>
                  <span>{adjustments.threshold}</span>
                </div>
                <input
                  type="range"
                  min={100}
                  max={250}
                  value={adjustments.threshold}
                  disabled={!adjustments.removeBackground}
                  onChange={e =>
                    setAdjustments(prev => ({ ...prev, threshold: Number(e.target.value) }))
                  }
                  className="w-full accent-blue-600 disabled:opacity-40"
                  aria-label="Background removal threshold"
                />
              </div>
            </div>

            <p className="text-xs text-gray-500">
              {cropMode === 'manual'
                ? 'Using your manual crop, centered in the output. Increase contrast to darken faint ink; raise the background threshold if edges of the paper are still showing.'
                : 'The signature is auto-cropped and centered. Increase contrast to darken faint ink; raise the background threshold if edges of the paper are still showing. If the auto-crop cuts off part of the signature, adjust it manually above.'}
            </p>

            <div className="flex flex-wrap justify-end gap-2">
              <Button type="button" size="sm" variant="outlineDestructive" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 mr-1" />
                Start over
              </Button>
              {hasOriginalFile && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleSaveOriginal}
                  disabled={isUploading}
                  title="Upload the photo exactly as-is, without processing"
                >
                  Use original photo
                </Button>
              )}
              <Button type="button" size="sm" onClick={handleSave} disabled={isUploading}>
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-1" />
                    Save signature
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};