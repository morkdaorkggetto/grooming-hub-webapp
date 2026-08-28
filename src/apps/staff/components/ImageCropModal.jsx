import React, { useEffect, useMemo, useRef, useState } from 'react';
import { cropImageSquare } from '../lib/imageCrop';

const FRAME_SIZE = 280;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export default function ImageCropModal({ file, open, onCancel, onConfirm }) {
  const [previewUrl, setPreviewUrl] = useState('');
  const [naturalSize, setNaturalSize] = useState({ width: 1, height: 1 });
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const dragStateRef = useRef(null);

  useEffect(() => {
    if (!file || !open) return undefined;

    const nextPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl(nextPreviewUrl);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setSaving(false);
    setError('');

    return () => {
      URL.revokeObjectURL(nextPreviewUrl);
    };
  }, [file, open]);

  const baseScale = useMemo(
    () => Math.max(FRAME_SIZE / naturalSize.width, FRAME_SIZE / naturalSize.height),
    [naturalSize.height, naturalSize.width]
  );

  const renderedSize = useMemo(
    () => ({
      width: naturalSize.width * baseScale * zoom,
      height: naturalSize.height * baseScale * zoom,
    }),
    [baseScale, naturalSize.height, naturalSize.width, zoom]
  );

  const maxOffset = useMemo(
    () => ({
      x: Math.max(0, (renderedSize.width - FRAME_SIZE) / 2),
      y: Math.max(0, (renderedSize.height - FRAME_SIZE) / 2),
    }),
    [renderedSize.height, renderedSize.width]
  );

  useEffect(() => {
    setOffset((current) => ({
      x: clamp(current.x, -maxOffset.x, maxOffset.x),
      y: clamp(current.y, -maxOffset.y, maxOffset.y),
    }));
  }, [maxOffset.x, maxOffset.y]);

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerUp = () => {
      dragStateRef.current = null;
    };

    window.addEventListener('pointerup', handlePointerUp);
    return () => window.removeEventListener('pointerup', handlePointerUp);
  }, [open]);

  if (!open || !file) return null;

  const handleImageLoad = (event) => {
    const image = event.currentTarget;
    setNaturalSize({
      width: image.naturalWidth || 1,
      height: image.naturalHeight || 1,
    });
  };

  const handlePointerDown = (event) => {
    event.preventDefault();
    dragStateRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      originX: offset.x,
      originY: offset.y,
    };
  };

  const handlePointerMove = (event) => {
    if (!dragStateRef.current) return;

    const nextX = dragStateRef.current.originX + (event.clientX - dragStateRef.current.startX);
    const nextY = dragStateRef.current.originY + (event.clientY - dragStateRef.current.startY);

    setOffset({
      x: clamp(nextX, -maxOffset.x, maxOffset.x),
      y: clamp(nextY, -maxOffset.y, maxOffset.y),
    });
  };

  const handleConfirm = async () => {
    setSaving(true);
    setError('');

    try {
      const cropped = await cropImageSquare(file, {
        zoom,
        offsetX: offset.x,
        offsetY: offset.y,
      });
      onConfirm(cropped);
    } catch (err) {
      setError(err.message || 'Errore durante il ritaglio della foto.');
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black bg-opacity-60 flex items-center justify-center p-4">
      <div className="w-full max-w-xl rounded-3xl bg-white shadow-2xl p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 style={{ color: 'var(--color-text-primary)' }} className="text-2xl font-bold">
              Ritaglia foto
            </h2>
            <p style={{ color: 'var(--color-secondary)' }} className="text-sm mt-1">
              Trascina l'immagine e regola lo zoom per centrare il muso del cane.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-2 rounded-lg text-white font-medium"
            style={{ backgroundColor: 'var(--color-secondary)' }}
          >
            Chiudi
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg border" style={{ borderColor: '#fecaca', backgroundColor: '#fff1f2' }}>
            <p style={{ color: '#9f1239' }} className="text-sm font-medium">
              {error}
            </p>
          </div>
        )}

        <div className="flex justify-center mb-5">
          <div
            className="relative overflow-hidden rounded-3xl border-4 shadow-inner touch-none select-none"
            style={{
              width: `${FRAME_SIZE}px`,
              height: `${FRAME_SIZE}px`,
              borderColor: 'var(--color-primary)',
              background:
                'linear-gradient(135deg, rgba(250,243,240,1) 0%, rgba(245,234,223,1) 100%)',
            }}
            onPointerMove={handlePointerMove}
            onPointerUp={() => {
              dragStateRef.current = null;
            }}
            onPointerLeave={() => {
              dragStateRef.current = null;
            }}
          >
            <img
              src={previewUrl}
              alt="Anteprima ritaglio"
              onLoad={handleImageLoad}
              onPointerDown={handlePointerDown}
              draggable={false}
              className="absolute max-w-none cursor-grab active:cursor-grabbing"
              style={{
                width: `${renderedSize.width}px`,
                height: `${renderedSize.height}px`,
                left: `calc(50% - ${renderedSize.width / 2}px + ${offset.x}px)`,
                top: `calc(50% - ${renderedSize.height / 2}px + ${offset.y}px)`,
              }}
            />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                boxShadow: 'inset 0 0 0 1px rgba(90,58,42,0.25)',
              }}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label style={{ color: 'var(--color-text-primary)' }} className="block text-sm font-medium mb-2">
              Zoom
            </label>
            <input
              type="range"
              min="1"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(event) => setZoom(Number(event.target.value))}
              className="w-full"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-3 rounded-lg font-bold border-2 transition"
              style={{ borderColor: 'var(--color-primary)', color: 'var(--color-text-primary)' }}
            >
              Annulla
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={saving}
              className="px-4 py-3 rounded-lg font-bold text-white transition disabled:opacity-60"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              {saving ? 'Applicazione...' : 'Usa questa foto'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
