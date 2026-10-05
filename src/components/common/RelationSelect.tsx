'use client';

import React from 'react';

/** Relationship options for nominees, grouped for easier scanning. */
export const RELATION_GROUPS: { label: string; options: string[] }[] = [
  { label: 'Spouse', options: ['Husband', 'Wife'] },
  { label: 'Parents', options: ['Father', 'Mother', 'Step-Father', 'Step-Mother'] },
  { label: 'Children', options: ['Son', 'Daughter', 'Step-Son', 'Step-Daughter', 'Adopted Son', 'Adopted Daughter'] },
  { label: 'Siblings', options: ['Brother', 'Sister', 'Half-Brother', 'Half-Sister'] },
  { label: 'Grandparents & Grandchildren', options: ['Grandfather', 'Grandmother', 'Grandson', 'Granddaughter'] },
  { label: 'In-Laws', options: ['Father-in-Law', 'Mother-in-Law', 'Son-in-Law', 'Daughter-in-Law', 'Brother-in-Law', 'Sister-in-Law'] },
  { label: 'Extended Family', options: ['Uncle', 'Aunt', 'Nephew', 'Niece', 'Cousin'] },
  { label: 'Other', options: ['Legal Guardian', 'Other Relative'] },
];

export const ALL_RELATIONS = RELATION_GROUPS.flatMap(g => g.options);

interface RelationSelectProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  required?: boolean;
  id?: string;
}

export function RelationSelect({ value, onChange, className, required, id }: RelationSelectProps) {
  // Preserve legacy free-text values (e.g. "Spouse") saved before the dropdown existed
  const isLegacy = value && !ALL_RELATIONS.includes(value);

  return (
    <select
      id={id}
      required={required}
      value={value}
      onChange={e => onChange(e.target.value)}
      className={className}
    >
      <option value="" disabled>Select relation…</option>
      {isLegacy && <option value={value}>{value}</option>}
      {RELATION_GROUPS.map(group => (
        <optgroup key={group.label} label={group.label}>
          {group.options.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}
