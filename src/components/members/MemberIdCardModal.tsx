'use client';

import React, { useRef } from 'react';
import { Modal } from '@/components/ui/Modal';

interface MemberForCard {
  _id?: string;
  accountNo: string;
  name: string;
  mobile: string;
  nid: string;
  category: string;
  branch: string;
  joinDate?: string;
  address?: string;
  photo?: string;
  signature?: string;
  fatherName?: string;
  motherName?: string;
}

interface MemberIdCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: MemberForCard | null;
}

export function MemberIdCardModal({ isOpen, onClose, member }: MemberIdCardModalProps) {
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!member) return null;

  const handlePrint = () => {
    const printContent = printAreaRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      alert('Please allow popups to print ID card');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Member ID Card - ${member.name} (${member.accountNo})</title>
          <style>
            @page {
              size: auto;
              margin: 10mm;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              margin: 0;
              padding: 20px;
              background: #fff;
              display: flex;
              justify-content: center;
              gap: 20px;
            }
            .card-wrapper {
              display: flex;
              gap: 20px;
              flex-wrap: wrap;
            }
            .id-card {
              width: 320px;
              height: 480px;
              border: 1px solid #cbd5e1;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: none;
              position: relative;
              background: #ffffff;
              box-sizing: border-box;
              page-break-inside: avoid;
            }
            .card-header {
              background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
              color: white;
              padding: 16px;
              text-align: center;
            }
            .org-title {
              font-size: 14px;
              font-weight: 800;
              letter-spacing: 0.5px;
              margin: 0;
              text-transform: uppercase;
            }
            .org-sub {
              font-size: 9px;
              opacity: 0.9;
              margin-top: 2px;
            }
            .photo-box {
              width: 100px;
              height: 100px;
              border-radius: 50%;
              border: 3px solid #2563eb;
              margin: 16px auto 10px;
              overflow: hidden;
              background: #f1f5f9;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 32px;
              font-weight: bold;
              color: #2563eb;
            }
            .photo-box img {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
            .member-name {
              font-size: 16px;
              font-weight: 800;
              text-align: center;
              color: #0f172a;
              margin: 0;
            }
            .member-acc {
              font-size: 11px;
              font-family: monospace;
              font-weight: 700;
              text-align: center;
              color: #2563eb;
              margin: 4px 0 12px;
            }
            .info-grid {
              padding: 0 18px;
              font-size: 11px;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              padding: 4px 0;
              border-bottom: 1px dashed #e2e8f0;
            }
            .info-label {
              color: #64748b;
              font-weight: 600;
            }
            .info-val {
              color: #0f172a;
              font-weight: 700;
              text-align: right;
            }
            .card-footer {
              position: absolute;
              bottom: 0;
              left: 0;
              right: 0;
              padding: 10px 18px;
              background: #f8fafc;
              border-top: 1px solid #e2e8f0;
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
            }
            .sig-title {
              font-size: 9px;
              color: #64748b;
              border-top: 1px solid #94a3b8;
              padding-top: 2px;
              display: inline-block;
            }
            .back-card {
              padding: 20px 18px;
              display: flex;
              flex-direction: column;
              height: 100%;
              box-sizing: border-box;
            }
            .terms-box {
              font-size: 9px;
              color: #475569;
              line-height: 1.4;
              margin-bottom: 14px;
            }
            .barcode-sim {
              height: 36px;
              background: repeating-linear-gradient(90deg, #000 0px, #000 2px, #fff 2px, #fff 4px, #000 4px, #000 7px, #fff 7px, #fff 8px);
              margin: 15px auto 4px;
              width: 80%;
            }
          </style>
        </head>
        <body>
          <div class="card-wrapper">
            ${printContent.innerHTML}
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() { window.close(); };
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Member Official Identification Card"
      footer={
        <div className="flex justify-between w-full">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg text-xs hover:bg-slate-200"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-sm"
          >
            <i className="fa-solid fa-print"></i>
            Print ID Card (Front & Back)
          </button>
        </div>
      }
    >
      <div className="flex flex-col items-center">
        <p className="text-xs text-slate-500 mb-4 text-center">
          Preview of the dual-sided biometric laminated membership identification badge.
        </p>

        {/* Printable Card Area */}
        <div ref={printAreaRef} className="flex flex-wrap gap-6 justify-center">
          {/* Card Front */}
          <div className="w-[300px] h-[450px] bg-white border border-slate-300 rounded-xl overflow-hidden shadow-lg relative flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white p-4 text-center">
              <div className="flex justify-center items-center gap-1.5 mb-1">
                <i className="fa-solid fa-building-columns text-amber-400 text-sm"></i>
                <h4 className="text-xs font-black tracking-wider uppercase">SOMITY ONLINE COOPERATIVE</h4>
              </div>
              <p className="text-[9px] text-blue-200 font-medium">Govt. Reg # SOM-DH-2024/0912</p>
            </div>

            {/* Photo & Name */}
            <div className="p-4 text-center flex-1">
              <div className="w-24 h-24 rounded-full border-4 border-blue-600 mx-auto overflow-hidden bg-slate-100 flex items-center justify-center text-blue-600 text-2xl font-black shadow-inner">
                {member.photo ? (
                  <img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
                ) : (
                  member.name.slice(0, 2).toUpperCase()
                )}
              </div>

              <h3 className="font-extrabold text-slate-900 text-base mt-2">{member.name}</h3>
              <span className="font-mono text-xs font-bold text-blue-600 block">{member.accountNo}</span>
              <span className="inline-block mt-1 px-2.5 py-0.5 bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-bold rounded-full">
                {member.category}
              </span>

              {/* Front Details */}
              <div className="mt-4 border-t border-slate-100 pt-3 text-[11px] text-left space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Branch:</span>
                  <span className="font-bold text-slate-800">{member.branch}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Mobile:</span>
                  <span className="font-bold text-slate-800">{member.mobile}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">NID:</span>
                  <span className="font-bold text-slate-800 font-mono text-[10px]">{member.nid}</span>
                </div>
              </div>
            </div>

            {/* Footer Signatures */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-between items-end text-[9px] text-slate-500">
              <div className="text-center">
                <div className="h-7 border-b border-slate-400 w-24 mb-0.5 flex items-center justify-center overflow-hidden">
                  {member.signature ? (
                    <img src={member.signature} alt="Member Signature" className="max-h-6 max-w-full object-contain" />
                  ) : (
                    <span className="font-serif italic text-[11px] text-blue-900">{member.name.split(' ')[0]}</span>
                  )}
                </div>
                <span>Member Signature</span>
              </div>
              <div className="text-center">
                <div className="h-6 border-b border-slate-400 w-20 mb-0.5 flex items-center justify-center font-mono text-[8px] text-emerald-700 font-bold">
                  VERIFIED
                </div>
                <span>Authorized Officer</span>
              </div>
            </div>
          </div>

          {/* Card Back */}
          <div className="w-[300px] h-[450px] bg-white border border-slate-300 rounded-xl overflow-hidden shadow-lg p-5 flex flex-col justify-between">
            <div>
              <div className="border-b border-slate-200 pb-2 text-center">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Emergency & Terms</h4>
                <p className="text-[9px] text-slate-400">Somity Online Multi-Purpose Cooperative Society Ltd.</p>
              </div>

              <div className="mt-4 space-y-2 text-[11px]">
                {member.fatherName && (
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase font-bold">Father's Name</span>
                    <span className="font-bold text-slate-800">{member.fatherName}</span>
                  </div>
                )}
                {member.motherName && (
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase font-bold">Mother's Name</span>
                    <span className="font-bold text-slate-800">{member.motherName}</span>
                  </div>
                )}
                {member.address && (
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase font-bold">Residential Address</span>
                    <span className="font-semibold text-slate-700 text-[10px] leading-tight block">{member.address}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-[9px] text-amber-900 leading-relaxed">
                <strong>Notice:</strong> This identity card is the property of the Cooperative Society. If found, please return to any branch office or call: <strong>+880 1700-000000</strong>.
              </div>
            </div>

            <div className="text-center pt-3 border-t border-slate-100">
              <div className="h-9 bg-slate-900 mx-auto rounded w-3/4 flex items-center justify-center text-white font-mono text-[10px] tracking-widest">
                |||||||| | | |||| || ||| ||
              </div>
              <span className="font-mono text-[9px] text-slate-500 mt-1 block">{member.accountNo}</span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
