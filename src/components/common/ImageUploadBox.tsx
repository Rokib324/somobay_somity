'use client';

import React, { useRef, useState } from 'react';

interface ImageUploadBoxProps {
  label: string;
  value?: string;
  onChange: (dataUrl: string) => void;
  helperText?: string;
  aspectRatio?: 'square' | 'passport' | 'signature' | 'wide';
  maxDimension?: number;
}

export function ImageUploadBox({
  label,
  value,
  onChange,
  helperText,
  aspectRatio = 'square',
  maxDimension = 800,
}: ImageUploadBoxProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlValue, setUrlValue] = useState('');

  // Process uploaded file and compress to high-quality data URL
  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, JPEG, WEBP, or SVG).');
      return;
    }

    setProcessing(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      const src = e.target?.result as string;
      if (!src) {
        setProcessing(false);
        return;
      }

      // If it's an SVG, keep as is
      if (file.type === 'image/svg+xml') {
        onChange(src);
        setProcessing(false);
        return;
      }

      // Compress and resize raster images via HTML5 Canvas
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL(file.type === 'image/png' ? 'image/png' : 'image/jpeg', 0.88);
          onChange(compressedDataUrl);
        } else {
          onChange(src);
        }
        setProcessing(false);
      };

      img.onerror = () => {
        onChange(src);
        setProcessing(false);
      };

      img.src = src;
    };

    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = () => {
    onChange('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Styling dimensions based on aspect ratio
  const previewBoxStyle =
    aspectRatio === 'passport'
      ? 'w-20 h-28'
      : aspectRatio === 'signature'
      ? 'w-36 h-16'
      : aspectRatio === 'wide'
      ? 'w-32 h-20'
      : 'w-24 h-24 rounded-full';

  return (
    <div className="space-y-1.5 text-left">
      <div className="flex items-center justify-between">
        <label className="block text-[11px] font-bold text-slate-700">{label}</label>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[10px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
        >
          <i className="fa-solid fa-link text-[9px]"></i>
          {showUrlInput ? 'Hide URL option' : 'Use URL instead'}
        </button>
      </div>

      {showUrlInput && (
        <div className="flex gap-2 mb-2 animate-in fade-in duration-100">
          <input
            type="text"
            placeholder="Paste image URL..."
            value={urlValue}
            onChange={(e) => setUrlValue(e.target.value)}
            className="flex-1 px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
          />
          <button
            type="button"
            onClick={() => {
              if (urlValue.trim()) {
                onChange(urlValue.trim());
                setUrlValue('');
                setShowUrlInput(false);
              }
            }}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors"
          >
            Apply
          </button>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {value ? (
        /* Preview Card with change / remove options */
        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 group">
          <div className="flex items-center gap-3">
            <div
              className={`${previewBoxStyle} bg-white border border-slate-300 overflow-hidden flex items-center justify-center flex-shrink-0 shadow-sm`}
            >
              <img src={value} alt={label} className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-slate-800 block truncate">{label} attached</span>
              <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                <i className="fa-solid fa-circle-check text-[9px]"></i>
                Ready to save
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
              title="Replace file"
            >
              <i className="fa-solid fa-arrows-rotate text-[10px]"></i>
              Replace
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg text-xs transition-colors"
              title="Remove image"
            >
              <i className="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </div>
      ) : (
        /* Drag & Drop / Click Upload Zone */
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`p-4 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 ${
            dragActive
              ? 'border-blue-500 bg-blue-50/70'
              : 'border-slate-300 hover:border-blue-400 bg-slate-50/60 hover:bg-white'
          }`}
        >
          {processing ? (
            <div className="py-2 flex items-center gap-2 text-xs font-semibold text-blue-600">
              <i className="fa-solid fa-spinner animate-spin"></i>
              Processing image...
            </div>
          ) : (
            <>
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-sm">
                <i className="fa-solid fa-cloud-arrow-up"></i>
              </div>
              <div>
                <span className="text-xs font-bold text-blue-600 hover:underline">Click to upload file</span>
                <span className="text-slate-400 text-xs"> or drag and drop</span>
              </div>
              <p className="text-[10px] text-slate-400">PNG, JPG, WEBP, or SVG (Auto-compressed)</p>
            </>
          )}
        </div>
      )}

      {helperText && <p className="text-[10px] text-slate-400 mt-0.5">{helperText}</p>}
    </div>
  );
}
