'use client';

import React, { useRef } from 'react';
import { Modal } from '@/components/ui/Modal';

interface BlankRegistrationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BlankRegistrationFormModal({ isOpen, onClose }: BlankRegistrationFormModalProps) {
  const formRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = formRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank', 'width=900,height=1000');
    if (!printWindow) {
      alert('Please enable popups to print registration form');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Blank Member Registration Form - Somity Online</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 15mm;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
              font-size: 11px;
              color: #1e293b;
              margin: 0;
              padding: 10px;
            }
            .form-container {
              border: 2px solid #0f172a;
              padding: 16px;
              max-width: 800px;
              margin: 0 auto;
            }
            .header-table {
              width: 100%;
              border-bottom: 2px solid #0f172a;
              padding-bottom: 8px;
              margin-bottom: 12px;
            }
            .title-main {
              font-size: 18px;
              font-weight: 900;
              text-transform: uppercase;
              text-align: center;
              margin: 0;
              color: #1e3a8a;
            }
            .title-sub {
              font-size: 10px;
              text-align: center;
              color: #475569;
              margin-top: 2px;
            }
            .form-title {
              background: #0f172a;
              color: white;
              font-size: 12px;
              font-weight: bold;
              text-align: center;
              padding: 4px;
              letter-spacing: 1px;
              margin: 10px 0;
            }
            .photo-box {
              width: 95px;
              height: 115px;
              border: 1px dashed #64748b;
              text-align: center;
              font-size: 9px;
              color: #64748b;
              display: flex;
              align-items: center;
              justify-content: center;
              box-sizing: border-box;
            }
            .sec-header {
              background: #f1f5f9;
              border-left: 4px solid #1e3a8a;
              padding: 4px 8px;
              font-weight: bold;
              font-size: 11px;
              margin: 10px 0 6px;
              text-transform: uppercase;
            }
            .field-row {
              display: flex;
              margin-bottom: 8px;
              align-items: flex-end;
              gap: 8px;
            }
            .field-label {
              font-weight: 600;
              white-space: nowrap;
              color: #334155;
            }
            .field-line {
              flex: 1;
              border-bottom: 1px dotted #94a3b8;
              height: 16px;
            }
            .checkbox-group {
              display: flex;
              gap: 12px;
              flex-wrap: wrap;
            }
            .checkbox-item {
              display: flex;
              align-items: center;
              gap: 4px;
            }
            .box-box {
              width: 12px;
              height: 12px;
              border: 1px solid #475569;
              display: inline-block;
            }
            .sig-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 20px;
              margin-top: 35px;
              text-align: center;
            }
            .sig-box {
              border-top: 1px solid #475569;
              padding-top: 4px;
              font-size: 10px;
              font-weight: 600;
            }
            .office-box {
              border: 1px solid #cbd5e1;
              background: #f8fafc;
              padding: 8px;
              margin-top: 14px;
            }
          </style>
        </head>
        <body>
          <div class="form-container">
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
      title="Blank Member Admission & KYC Registration Form"
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
            Print Blank Registration Form (A4)
          </button>
        </div>
      }
    >
      <div className="max-h-[70vh] overflow-y-auto pr-2">
        <p className="text-xs text-slate-500 mb-3 text-center">
          Official physical application template for walk-in member registration, KYC compliance, and account opening.
        </p>

        {/* Printable Form Container */}
        <div ref={formRef} className="border-2 border-slate-900 p-6 bg-white text-slate-900 text-[11px] rounded-lg">
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-3">
            <div>
              <h2 className="text-lg font-black uppercase text-blue-900 tracking-wide">
                SOMITY ONLINE COOPERATIVE SOCIETY LTD.
              </h2>
              <p className="text-[10px] text-slate-600">
                Registered under Cooperative Societies Act | Registration No: SOM-DH-2024/0912
              </p>
              <p className="text-[10px] text-slate-500">
                Head Office: Central Plaza, Commercial Area, Dhaka - 1000 | Phone: +880 2-9876543
              </p>
            </div>
            <div className="flex gap-2">
              <div className="w-20 h-24 border border-dashed border-slate-400 flex items-center justify-center text-[9px] text-slate-400 text-center p-1">
                Member Passport Photo
              </div>
              <div className="w-20 h-24 border border-dashed border-slate-400 flex items-center justify-center text-[9px] text-slate-400 text-center p-1">
                Nominee Photo
              </div>
            </div>
          </div>

          <div className="bg-slate-900 text-white text-center font-bold text-xs py-1 tracking-wider uppercase my-3">
            APPLICATION FOR MEMBERSHIP & KYC VERIFICATION
          </div>

          <div className="flex justify-between text-[10px] font-semibold text-slate-600 mb-2">
            <span>Branch Name: ____________________________</span>
            <span>Date: _____ / _____ / 20_____</span>
            <span>Account No: [ Assigned by Office ]</span>
          </div>

          {/* Section 1: Member Personal Information */}
          <div className="bg-slate-100 border-l-4 border-blue-900 px-2 py-1 font-bold text-[10px] uppercase text-slate-800 my-2">
            1. Applicant Particulars
          </div>
          <div className="space-y-2">
            <div className="flex gap-2 items-end">
              <span className="font-semibold w-36">Full Name (English):</span>
              <div className="flex-1 border-b border-dotted border-slate-400 h-4"></div>
            </div>
            <div className="flex gap-2 items-end">
              <span className="font-semibold w-36">Father's Name:</span>
              <div className="flex-1 border-b border-dotted border-slate-400 h-4"></div>
            </div>
            <div className="flex gap-2 items-end">
              <span className="font-semibold w-36">Mother's Name:</span>
              <div className="flex-1 border-b border-dotted border-slate-400 h-4"></div>
              <span className="font-semibold w-24">Spouse:</span>
              <div className="flex-1 border-b border-dotted border-slate-400 h-4"></div>
            </div>
            <div className="flex gap-2 items-end">
              <span className="font-semibold w-36">Date of Birth:</span>
              <div className="w-32 border-b border-dotted border-slate-400 h-4"></div>
              <span className="font-semibold w-24">NID / Birth Reg:</span>
              <div className="flex-1 border-b border-dotted border-slate-400 h-4"></div>
            </div>
            <div className="flex gap-2 items-end">
              <span className="font-semibold w-36">Mobile Number:</span>
              <div className="w-40 border-b border-dotted border-slate-400 h-4"></div>
              <span className="font-semibold w-20">Occupation:</span>
              <div className="flex-1 border-b border-dotted border-slate-400 h-4"></div>
            </div>
            <div className="flex gap-2 items-end">
              <span className="font-semibold w-36">Present Address:</span>
              <div className="flex-1 border-b border-dotted border-slate-400 h-4"></div>
            </div>
            <div className="flex gap-2 items-end">
              <span className="font-semibold w-36">Permanent Address:</span>
              <div className="flex-1 border-b border-dotted border-slate-400 h-4"></div>
            </div>
          </div>

          {/* Section 2: Membership Tier Selection */}
          <div className="bg-slate-100 border-l-4 border-blue-900 px-2 py-1 font-bold text-[10px] uppercase text-slate-800 my-2">
            2. Membership Category (Please Tick One)
          </div>
          <div className="grid grid-cols-3 gap-2 text-[10px] py-1">
            {['Staff Member', 'Farmer Member', 'Business Member', 'Student Member', 'Senior Citizen', 'Cooperative Member', 'Young Entrepreneur', 'Association Member', 'Founder Member'].map(c => (
              <label key={c} className="flex items-center gap-1.5">
                <span className="w-3 h-3 border border-slate-700 inline-block"></span>
                <span>{c}</span>
              </label>
            ))}
          </div>

          {/* Section 3: Nominee Particulars */}
          <div className="bg-slate-100 border-l-4 border-blue-900 px-2 py-1 font-bold text-[10px] uppercase text-slate-800 my-2">
            3. Nominee Designation
          </div>
          <div className="space-y-2">
            <div className="flex gap-2 items-end">
              <span className="font-semibold w-32">Nominee Name:</span>
              <div className="flex-1 border-b border-dotted border-slate-400 h-4"></div>
              <span className="font-semibold w-20">Relation:</span>
              <div className="w-32 border-b border-dotted border-slate-400 h-4"></div>
            </div>
            <div className="flex gap-2 items-end">
              <span className="font-semibold w-32">Nominee NID:</span>
              <div className="flex-1 border-b border-dotted border-slate-400 h-4"></div>
              <span className="font-semibold w-20">Share %:</span>
              <div className="w-20 border-b border-dotted border-slate-400 h-4"></div>
            </div>
          </div>

          {/* Section 4: Initial Share & Savings */}
          <div className="bg-slate-100 border-l-4 border-blue-900 px-2 py-1 font-bold text-[10px] uppercase text-slate-800 my-2">
            4. Initial Share Purchase & Savings Commitment
          </div>
          <div className="flex gap-4 text-[10px]">
            <span>Admission Fee: ৳ _________________</span>
            <span>Share Capital (Min 1 Share): ৳ _________________</span>
            <span>Monthly Target: ৳ _________________</span>
          </div>

          {/* Declarations & Signatures */}
          <div className="mt-4 pt-2 border-t border-slate-200 text-[9px] text-slate-600 leading-tight">
            I hereby declare that the particulars provided above are true, complete, and accurate. I agree to abide by the rules, by-laws, and operational terms of the Cooperative Society.
          </div>

          <div className="grid grid-cols-3 gap-6 text-center mt-8 pt-4">
            <div>
              <div className="border-t border-slate-700 pt-1 font-semibold text-[10px]">
                Signature of Applicant
              </div>
            </div>
            <div>
              <div className="border-t border-slate-700 pt-1 font-semibold text-[10px]">
                Introducer / Field Officer
              </div>
            </div>
            <div>
              <div className="border-t border-slate-700 pt-1 font-semibold text-[10px]">
                Branch Manager Approval
              </div>
            </div>
          </div>

          {/* Office Use Box */}
          <div className="border border-slate-300 bg-slate-50 p-2 mt-4 text-[9px] text-slate-600">
            <span className="font-bold uppercase text-slate-800 block mb-1">For Office Use Only:</span>
            <div className="grid grid-cols-4 gap-2">
              <div>Account Assigned: ______________</div>
              <div>Share Certificate No: ______________</div>
              <div>Ledger Folio: ______________</div>
              <div>System Entry By: ______________</div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
