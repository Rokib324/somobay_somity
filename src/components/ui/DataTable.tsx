'use client';

import React, { useState, useEffect, useRef } from 'react';

export interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  searchPlaceholder?: string;
  actions?: (item: T) => React.ReactNode;
  onAddClick?: () => void;
  addButtonText?: string;
  onSearch?: (query: string) => void; // server-side search callback
  isLoading?: boolean;
}

// Accept both `id` and `_id` (MongoDB documents)
function getRowKey<T extends { id?: string | number; _id?: string }>(item: T, idx: number): string {
  return String(item._id ?? item.id ?? idx);
}

export function DataTable<T extends { id?: string | number; _id?: string }>({
  columns,
  data = [],
  searchPlaceholder = 'Search records...',
  actions,
  onAddClick,
  addButtonText = 'Add New',
  onSearch,
  isLoading = false,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');

  // Client-side filter (when no onSearch callback provided)
  const filteredData = onSearch
    ? data
    : (data || []).filter((item) => {
        if (!search) return true;
        const strVal = JSON.stringify(item).toLowerCase();
        return strVal.includes(search.toLowerCase());
      });

  // Keep a stable ref to the latest onSearch callback so it's never a useEffect dependency
  const onSearchRef = useRef(onSearch);
  useEffect(() => {
    onSearchRef.current = onSearch;
  });

  // Debounced server-side search — only fires when the user actually types
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (!onSearchRef.current) return;

    const timer = setTimeout(() => {
      onSearchRef.current?.(search);
    }, 350);

    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 card-shadow overflow-hidden">
      {/* Controls Bar */}
      <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
        <div className="relative flex-1 max-w-md">
          <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          {search && (
            <button
              onClick={() => {
                setSearch('');
                onSearchRef.current?.('');
              }}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              <i className="fa-solid fa-xmark text-xs"></i>
            </button>
          )}
        </div>
        {onAddClick && (
          <button
            onClick={onAddClick}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
          >
            <i className="fa-solid fa-plus text-xs"></i>
            {addButtonText}
          </button>
        )}
      </div>

      {/* Table Element */}
      <div className="overflow-x-auto relative min-h-[160px]">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
              {columns.map((col, idx) => (
                <th key={idx} className={`py-3.5 px-4 ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
              {actions && <th className="py-3.5 px-4 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="py-16 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs text-slate-500 font-medium">Loading records...</span>
                  </div>
                </td>
              </tr>
            ) : filteredData.length > 0 ? (
              filteredData.map((item, rowIdx) => (
                <tr key={getRowKey(item, rowIdx)} className="hover:bg-slate-50/80 transition-colors">
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className={`py-3.5 px-4 text-slate-700 ${col.className || ''}`}>
                      {typeof col.accessor === 'function'
                        ? col.accessor(item)
                        : (item[col.accessor] as React.ReactNode)}
                    </td>
                  ))}
                  {actions && <td className="py-3.5 px-4 text-right whitespace-nowrap">{actions(item)}</td>}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center gap-2">
                    <i className="fa-regular fa-folder-open text-3xl text-slate-300"></i>
                    <span>No records found</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
        <span>Showing {filteredData.length} records</span>
      </div>
    </div>
  );
}
