/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  altText?: string;
  caption?: string;
}

export const ImageModal: React.FC<ImageModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  altText = 'Gambar Soal',
  caption,
}) => {
  const [scale, setScale] = useState<number>(1);

  useEffect(() => {
    if (isOpen) {
      setScale(1);
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={altText}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative max-h-[92vh] max-w-5xl w-full flex flex-col items-center justify-center overflow-hidden rounded-2xl bg-white p-3 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Controls bar */}
        <div className="flex w-full items-center justify-between border-b border-slate-100 pb-2 px-2 text-slate-700">
          <div className="text-xs font-medium text-slate-500">
            {caption || altText}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setScale((s) => Math.min(2.5, s + 0.25))}
              className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              title="Perbesar"
              aria-label="Perbesar gambar"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setScale((s) => Math.max(0.75, s - 0.25))}
              className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              title="Perkecil"
              aria-label="Perkecil gambar"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setScale(1)}
              className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              title="Reset ukuran"
              aria-label="Reset ukuran gambar"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-colors ml-2"
              title="Tutup"
              aria-label="Tutup pratinjau gambar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Image viewport */}
        <div className="flex items-center justify-center overflow-auto p-4 max-h-[75vh] w-full">
          <img
            src={imageUrl}
            alt={altText}
            loading="lazy"
            referrerPolicy="no-referrer"
            style={{ transform: `scale(${scale})`, transition: 'transform 0.15s ease-out' }}
            className="max-h-[70vh] w-auto max-w-full object-contain rounded-lg shadow-sm"
          />
        </div>

        <div className="pt-2 text-center text-xs text-slate-400">
          Klik tombol tutup atau tekan tombol Escape di keyboard untuk keluar
        </div>
      </div>
    </div>
  );
};

export default ImageModal;
