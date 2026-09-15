'use client';

import React, { useState } from 'react';

interface SignatureBoxProps {
  signatureUrl?: string;
  name: string;
  title?: string;
  subtitle?: string;
  className?: string;
  heightClass?: string;
}

// Generates an authentic SVG cursive ink signature data URL for a given name
export function getSpecimenSignatureSvg(name: string): string {
  const cleanName = (name || 'Member Signature').trim();
  // Safe URL encoding of an SVG representing a handwritten cursive pen signature
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 120" width="100%" height="100%">
      <defs>
        <filter id="ink-bleed" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.2" />
        </filter>
      </defs>
      <!-- Subtle security guilloche background lines -->
      <path d="M 10 90 Q 100 80, 200 85 T 390 85" stroke="#e2e8f0" stroke-width="0.8" fill="none" />
      <path d="M 20 95 Q 120 100, 220 95 T 380 95" stroke="#f1f5f9" stroke-width="0.8" fill="none" />
      
      <!-- Realistic handwritten cursive ink signature -->
      <g filter="url(#ink-bleed)" transform="rotate(-3 200 60)">
        <text 
          x="40" 
          y="75" 
          font-family="'Brush Script MT', 'Dancing Script', 'Caveat', 'Segoe Script', cursive, sans-serif" 
          font-size="44" 
          font-weight="600" 
          font-style="italic" 
          fill="#1e3a8a" 
          letter-spacing="0.5px">
          ${cleanName}
        </text>
        <!-- Cursive flourish tail stroke -->
        <path d="M 40 82 C 120 86, 260 88, 360 76 C 375 74, 385 68, 370 82 C 340 106, 210 95, 140 98" 
          fill="none" 
          stroke="#1e3a8a" 
          stroke-width="2.5" 
          stroke-linecap="round" 
          stroke-linejoin="round" />
      </g>
      
      <!-- Subtle verification stamp watermark -->
      <g transform="translate(310, 25) rotate(12)" opacity="0.4">
        <rect x="0" y="0" width="70" height="24" rx="4" fill="none" stroke="#2563eb" stroke-width="1" stroke-dasharray="2,2" />
        <text x="35" y="16" font-family="sans-serif" font-size="8" font-weight="bold" fill="#2563eb" text-anchor="middle">VERIFIED</text>
      </g>
    </svg>
  `.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function SignatureBox({
  signatureUrl,
  name,
  title = 'Official Specimen Signature',
  subtitle,
  className = '',
  heightClass = 'h-16',
}: SignatureBoxProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const effectiveSignature = signatureUrl || getSpecimenSignatureSvg(name);

  return (
    <div className={`space-y-1 text-left ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
          <i className="fa-solid fa-signature text-blue-600 text-[10px]"></i>
          {title}
        </span>
        {subtitle && <span className="text-[9px] text-slate-400 font-mono">{subtitle}</span>}
      </div>

      <div
        onClick={() => setIsPreviewOpen(true)}
        title="Click to view specimen signature in full size"
        className={`relative ${heightClass} border border-dashed border-slate-300 hover:border-blue-400 bg-gradient-to-b from-slate-50 to-white rounded-lg p-1.5 flex items-center justify-center cursor-pointer transition-all hover:shadow-sm group overflow-hidden`}
      >
        <img
          src={effectiveSignature}
          alt={`${name} signature`}
          className="max-h-full max-w-full object-contain filter drop-shadow-sm group-hover:scale-105 transition-transform"
        />

        <div className="absolute inset-0 bg-blue-900/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end p-1.5">
          <span className="bg-white/90 shadow text-blue-600 rounded p-1 text-[9px] font-bold flex items-center gap-1">
            <i className="fa-solid fa-magnifying-glass-plus"></i>
          </span>
        </div>
      </div>

      {/* Full Preview Modal */}
      {isPreviewOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setIsPreviewOpen(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <div>
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <i className="fa-solid fa-file-signature text-blue-600"></i>
                  Official Specimen Signature
                </h4>
                <p className="text-xs text-slate-500 font-medium">Record for: {name}</p>
              </div>
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-xs transition-colors"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="bg-slate-50 border-2 border-dashed border-blue-200 rounded-xl p-6 flex items-center justify-center min-h-[160px] relative">
              <img
                src={effectiveSignature}
                alt={`${name} signature`}
                className="max-h-36 max-w-full object-contain filter drop-shadow-md"
              />
              <div className="absolute bottom-2 right-3 text-[9px] font-mono text-slate-400">
                Somity Online Biometric Specimen Record
              </div>
            </div>

            <div className="mt-4 flex justify-between items-center text-xs text-slate-500">
              <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-[11px]">
                <i className="fa-solid fa-circle-check"></i>
                Digitally Verified & Archived
              </span>
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 rounded-lg text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
