import React, { useEffect, useMemo, useRef, useState } from 'react';
import { cropImageSquare } from '../media/imageCrop';

const FRAME_SIZE = 280;
const MAX_ZOOM = 8;
const DEFAULT_DESCRIPTION = "Trascina l'immagine e regola lo zoom per centrare il muso del cane.";

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const distanceBetween = (first, second) =>
  Math.hypot(second.x - first.x, second.y - first.y);

export default function ImageCropModal({
  file,
  open,
  onCancel,
  onConfirm,
  round = false,
  description = DEFAULT_DESCRIPTION,
}) {
  const [previewUrl, setPreviewUrl] = useState('');
  const [naturalSize, setNaturalSize] = useState({ width: 1, height: 1 });
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const dragStateRef = useRef(null);
  const pinchStateRef = useRef(null);
  const pointersRef = useRef(new Map());
  const offsetRef = useRef(offset);
  const zoomRef = useRef(zoom);

  useEffect(() => {
    if (!file || !open) return undefined;

    const nextPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl(nextPreviewUrl);
    setZoom(1);
    zoomRef.current = 1;
    setOffset({ x: 0, y: 0 });
    offsetRef.current = { x: 0, y: 0 };
    pointersRef.current.clear();
    dragStateRef.current = null;
    pinchStateRef.current = null;
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
    setOffset((current) => {
      const next = {
        x: clamp(current.x, -maxOffset.x, maxOffset.x),
        y: clamp(current.y, -maxOffset.y, maxOffset.y),
      };
      offsetRef.current = next;
      return next;
    });
  }, [maxOffset.x, maxOffset.y]);

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
    event.currentTarget.setPointerCapture?.(event.pointerId);
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

    const pointers = [...pointersRef.current.entries()];
    if (pointers.length === 1) {
      dragStateRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        originX: offsetRef.current.x,
        originY: offsetRef.current.y,
      };
      pinchStateRef.current = null;
      return;
    }

    const [[, first], [, second]] = pointers;
    dragStateRef.current = null;
    pinchStateRef.current = {
      startDistance: Math.max(1, distanceBetween(first, second)),
      startZoom: zoomRef.current,
    };
  };

  const handlePointerMove = (event) => {
    if (!pointersRef.current.has(event.pointerId)) return;
    event.preventDefault();
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

    const pointers = [...pointersRef.current.values()];
    if (pointers.length >= 2 && pinchStateRef.current) {
      const nextDistance = distanceBetween(pointers[0], pointers[1]);
      const nextZoom = clamp(
        pinchStateRef.current.startZoom * (nextDistance / pinchStateRef.current.startDistance),
        1,
        MAX_ZOOM
      );
      zoomRef.current = nextZoom;
      setZoom(nextZoom);
      return;
    }

    if (!dragStateRef.current || dragStateRef.current.pointerId !== event.pointerId) return;

    const nextX = dragStateRef.current.originX + (event.clientX - dragStateRef.current.startX);
    const nextY = dragStateRef.current.originY + (event.clientY - dragStateRef.current.startY);

    const nextOffset = {
      x: clamp(nextX, -maxOffset.x, maxOffset.x),
      y: clamp(nextY, -maxOffset.y, maxOffset.y),
    };
    offsetRef.current = nextOffset;
    setOffset(nextOffset);
  };

  const handlePointerEnd = (event) => {
    pointersRef.current.delete(event.pointerId);
    pinchStateRef.current = null;

    const remaining = [...pointersRef.current.entries()];
    if (remaining.length === 1) {
      const [[pointerId, pointer]] = remaining;
      dragStateRef.current = {
        pointerId,
        startX: pointer.x,
        startY: pointer.y,
        originX: offsetRef.current.x,
        originY: offsetRef.current.y,
      };
      return;
    }

    dragStateRef.current = null;
  };

  const handleConfirm = async () => {
    setSaving(true);
    setError('');

    try {
      const cropped = await cropImageSquare(file, {
        zoom,
        offsetX: offset.x / FRAME_SIZE,
        offsetY: offset.y / FRAME_SIZE,
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
              {description}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-2 rounded-lg text-white font-medium"
            style={{
              backgroundColor: 'var(--color-secondary)',
              minHeight: round ? 44 : undefined,
            }}
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
            className={`relative overflow-hidden border-4 shadow-inner touch-none select-none ${round ? 'rounded-full' : 'rounded-3xl'}`}
            style={{
              width: `${FRAME_SIZE}px`,
              height: `${FRAME_SIZE}px`,
              borderColor: 'var(--color-primary)',
              background:
                'linear-gradient(135deg, rgba(250,243,240,1) 0%, rgba(245,234,223,1) 100%)',
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerEnd}
            onPointerCancel={handlePointerEnd}
          >
            <img
              src={previewUrl}
              alt="Anteprima ritaglio"
              onLoad={handleImageLoad}
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
              max={MAX_ZOOM}
              step="0.05"
              value={zoom}
              onChange={(event) => {
                const nextZoom = Number(event.target.value);
                zoomRef.current = nextZoom;
                setZoom(nextZoom);
              }}
              className="w-full"
              style={{ minHeight: round ? 44 : undefined }}
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
