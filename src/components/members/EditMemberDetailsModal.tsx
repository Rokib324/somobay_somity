'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { ImageUploadBox } from '@/components/common/ImageUploadBox';
import { Member, Nominee, Guarantor } from '@/types';

interface EditMemberDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member;
  onUpdated: (updated: Member) => void;
}

export function EditMemberDetailsModal({
  isOpen,
  onClose,
  member,
  onUpdated,
}: EditMemberDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'nominee' | 'guarantor'>('profile');
  const [saving, setSaving] = useState(false);

  // Profile Form state
  const [photo, setPhoto] = useState(member.photo || '');
  const [signature, setSignature] = useState(member.signature || '');
  const [address, setAddress] = useState(member.address || '');
  const [mobile, setMobile] = useState(member.mobile || '');
  const [spouseName, setSpouseName] = useState(member.spouseName || '');

  // Nominee Form state
  const [nominee, setNominee] = useState<Nominee>({
    name: member.nominee?.name || '',
    relation: member.nominee?.relation || 'Spouse',
    percentage: member.nominee?.percentage ?? 100,
    nid: member.nominee?.nid || '',
    phone: member.nominee?.phone || '',
    photo: member.nominee?.photo || member.nominee?.picture || '',
    signature: member.nominee?.signature || '',
    dateOfBirth: member.nominee?.dateOfBirth ? String(member.nominee.dateOfBirth).slice(0, 10) : '',
    address: member.nominee?.address || '',
    occupation: member.nominee?.occupation || '',
  });

  // Guarantor Form state
  const [guarantor, setGuarantor] = useState<Guarantor>({
    accountNo: member.guarantor?.accountNo || '',
    name: member.guarantor?.name || '',
    relation: member.guarantor?.relation || 'Friend / Community Member',
    nid: member.guarantor?.nid || '',
    phone: member.guarantor?.phone || '',
    address: member.guarantor?.address || '',
    occupation: member.guarantor?.occupation || '',
    photo: member.guarantor?.photo || '',
    signature: member.guarantor?.signature || '',
    status: member.guarantor?.status || 'Active Guarantor',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: Partial<Member> = {
        photo,
        signature,
        address,
        mobile,
        spouseName,
        nominee: {
          ...nominee,
          picture: nominee.photo || nominee.picture,
        },
        guarantor,
      };

      const res = await fetch(`/api/members/${member._id || member.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Failed to update member records');
        return;
      }

      const updated = await res.json();
      onUpdated({ ...member, ...updated });
      onClose();
    } catch {
      alert('Network error while saving member details');
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    'w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium';
  const labelClass = 'block text-[11px] font-bold text-slate-700 mb-1';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Edit KYC & Records: ${member.name} (${member.accountNo})`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`pb-2 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'profile'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <i className="fa-solid fa-user"></i>
            Member Photo & Signature
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('nominee')}
            className={`pb-2 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'nominee'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <i className="fa-solid fa-user-shield"></i>
            Nominee Details & Bio
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('guarantor')}
            className={`pb-2 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'guarantor'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <i className="fa-solid fa-user-check"></i>
            Personal Guarantor Particulars
          </button>
        </div>

        {/* Tab 1: Member Profile & Signature */}
        {activeTab === 'profile' && (
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ImageUploadBox
                label="Member Profile Photo"
                value={photo}
                onChange={setPhoto}
                aspectRatio="square"
                helperText="Upload a portrait photo file from your device (PNG, JPG, WEBP)."
              />

              <ImageUploadBox
                label="Member Specimen Signature"
                value={signature}
                onChange={setSignature}
                aspectRatio="signature"
                helperText="Upload an official specimen signature file or scan."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className={labelClass}>Mobile Contact</label>
                <input
                  type="text"
                  value={mobile}
                  onChange={e => setMobile(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Spouse Name (If married)</label>
                <input
                  type="text"
                  value={spouseName}
                  onChange={e => setSpouseName(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Residential Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Nominee Particulars */}
        {activeTab === 'nominee' && (
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Nominee Full Name *</label>
                <input
                  type="text"
                  required
                  value={nominee.name}
                  onChange={e => setNominee({ ...nominee, name: e.target.value })}
                  placeholder="Nominee full legal name"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Relationship with Member *</label>
                <input
                  type="text"
                  required
                  value={nominee.relation}
                  onChange={e => setNominee({ ...nominee, relation: e.target.value })}
                  placeholder="Spouse / Son / Daughter / Mother"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Share Benefit (%)</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={nominee.percentage}
                  onChange={e => setNominee({ ...nominee, percentage: Number(e.target.value) })}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Nominee NID Number</label>
                <input
                  type="text"
                  value={nominee.nid || ''}
                  onChange={e => setNominee({ ...nominee, nid: e.target.value })}
                  placeholder="10 or 17 digit NID"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Nominee Contact Phone</label>
                <input
                  type="text"
                  value={nominee.phone || ''}
                  onChange={e => setNominee({ ...nominee, phone: e.target.value })}
                  placeholder="017XXXXXXXX"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Date of Birth</label>
                <input
                  type="date"
                  value={nominee.dateOfBirth ? String(nominee.dateOfBirth).slice(0, 10) : ''}
                  onChange={e => setNominee({ ...nominee, dateOfBirth: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Occupation / Profession</label>
                <input
                  type="text"
                  value={nominee.occupation || ''}
                  onChange={e => setNominee({ ...nominee, occupation: e.target.value })}
                  placeholder="e.g. Business / Homemaker / Teacher"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Nominee Address</label>
                <input
                  type="text"
                  value={nominee.address || ''}
                  onChange={e => setNominee({ ...nominee, address: e.target.value })}
                  placeholder="Permanent or present address"
                  className={inputClass}
                />
              </div>

              <ImageUploadBox
                label="Nominee Passport Size Photo"
                value={nominee.photo || nominee.picture}
                onChange={val => setNominee(n => ({ ...n, photo: val, picture: val }))}
                aspectRatio="passport"
                helperText="Upload passport size photograph (35x45mm)."
              />

              <ImageUploadBox
                label="Nominee Specimen Signature"
                value={nominee.signature || ''}
                onChange={val => setNominee(n => ({ ...n, signature: val }))}
                aspectRatio="signature"
                helperText="Upload official signature file of the nominee."
              />
            </div>
          </div>
        )}

        {/* Tab 3: Personal Guarantor Particulars */}
        {activeTab === 'guarantor' && (
          <div className="space-y-4 py-2">
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-800 flex items-start gap-2">
              <i className="fa-solid fa-circle-info mt-0.5 text-blue-600"></i>
              <div>
                <span className="font-bold">Member Personal Guarantor:</span> Record the individual serving as the
                primary institutional or loan guarantor for this member profile.
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Guarantor Account No (If Member)</label>
                <input
                  type="text"
                  value={guarantor.accountNo || ''}
                  onChange={e => setGuarantor({ ...guarantor, accountNo: e.target.value })}
                  placeholder="e.g. AC-1003 or leave blank for External"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Guarantor Full Name *</label>
                <input
                  type="text"
                  required
                  value={guarantor.name}
                  onChange={e => setGuarantor({ ...guarantor, name: e.target.value })}
                  placeholder="Guarantor legal name"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Relationship to Member</label>
                <input
                  type="text"
                  value={guarantor.relation || ''}
                  onChange={e => setGuarantor({ ...guarantor, relation: e.target.value })}
                  placeholder="e.g. Brother / Business Partner / Member"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>National ID (NID)</label>
                <input
                  type="text"
                  value={guarantor.nid || ''}
                  onChange={e => setGuarantor({ ...guarantor, nid: e.target.value })}
                  placeholder="NID number"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Mobile Phone</label>
                <input
                  type="text"
                  value={guarantor.phone || ''}
                  onChange={e => setGuarantor({ ...guarantor, phone: e.target.value })}
                  placeholder="018XXXXXXXX"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Occupation / Profession</label>
                <input
                  type="text"
                  value={guarantor.occupation || ''}
                  onChange={e => setGuarantor({ ...guarantor, occupation: e.target.value })}
                  placeholder="e.g. Merchant / Government Officer"
                  className={inputClass}
                />
              </div>

              <div className="md:col-span-2">
                <label className={labelClass}>Guarantor Residential Address</label>
                <input
                  type="text"
                  value={guarantor.address || ''}
                  onChange={e => setGuarantor({ ...guarantor, address: e.target.value })}
                  placeholder="Street address, city, district"
                  className={inputClass}
                />
              </div>

              <ImageUploadBox
                label="Guarantor Passport Size Photo"
                value={guarantor.photo || ''}
                onChange={val => setGuarantor(g => ({ ...g, photo: val }))}
                aspectRatio="passport"
                helperText="Upload passport size photograph (35x45mm)."
              />

              <ImageUploadBox
                label="Guarantor Specimen Signature"
                value={guarantor.signature || ''}
                onChange={val => setGuarantor(g => ({ ...g, signature: val }))}
                aspectRatio="signature"
                helperText="Upload official signature file of the personal guarantor."
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
          >
            {saving ? (
              <>
                <i className="fa-solid fa-spinner animate-spin"></i>
                Saving Changes...
              </>
            ) : (
              <>
                <i className="fa-solid fa-check"></i>
                Save Member KYC & Records
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
