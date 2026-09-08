import { Check, ChevronDown, Search, X } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { FilterOptionItem } from '../types/index.js';
import { cn } from '../utils/index.js';

interface SearchableSelectProps {
  label: string;
  value?: string;
  options: FilterOptionItem[];
  placeholder?: string;
  onChange: (val?: string) => void;
  isLoading?: boolean;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  label,
  value,
  options,
  placeholder = 'Select option...',
  onChange,
  isLoading = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return options;
    const lower = searchTerm.toLowerCase();
    return options.filter((opt) => opt.value.toLowerCase().includes(lower));
  }, [options, searchTerm]);

  const selectedItem = options.find((opt) => opt.value === value);

  return (
    <div className="relative space-y-1.5" ref={dropdownRef}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </label>
        {value && (
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="text-[11px] text-sky-400 hover:text-sky-300 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        disabled={isLoading}
        className={cn(
          'w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg border text-left transition-all duration-150',
          'bg-slate-900/80 border-slate-700/80 hover:border-slate-600 focus:outline-none focus:ring-1 focus:ring-sky-500',
          value ? 'text-slate-100 font-medium' : 'text-slate-400',
          isLoading && 'opacity-60 cursor-not-allowed',
        )}
      >
        <span className="truncate">
          {isLoading
            ? 'Loading options...'
            : selectedItem
              ? `${selectedItem.value} (${selectedItem.count})`
              : placeholder}
        </span>
        <ChevronDown
          className={cn(
            'w-4 h-4 text-slate-400 transition-transform duration-200 ml-2 shrink-0',
            isOpen && 'rotate-180 text-sky-400',
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 rounded-xl border border-slate-700/80 bg-slate-900/95 backdrop-blur-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Search Input */}
          <div className="p-2 border-b border-slate-800 flex items-center gap-2 bg-slate-950/60">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Search ${options.length} ${label.toLowerCase()}s...`}
              className="w-full bg-transparent text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
              autoFocus
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="text-slate-500 hover:text-slate-300 p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Options List */}
          <div className="max-h-56 overflow-y-auto p-1.5 space-y-0.5 scrollbar-thin scrollbar-thumb-slate-700">
            <button
              type="button"
              onClick={() => {
                onChange(undefined);
                setIsOpen(false);
              }}
              className={cn(
                'w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-md transition-colors text-left',
                !value
                  ? 'bg-sky-500/10 text-sky-400 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800/70',
              )}
            >
              <span>All {label}s</span>
              {!value && <Check className="w-3.5 h-3.5 text-sky-400" />}
            </button>

            {filteredOptions.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-slate-500">
                No matching {label.toLowerCase()}s
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = value === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                    className={cn(
                      'w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-md transition-colors text-left group',
                      isSelected
                        ? 'bg-sky-500/15 text-sky-300 font-medium'
                        : 'text-slate-300 hover:bg-slate-800/80',
                    )}
                  >
                    <span className="truncate mr-2">{opt.value}</span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] text-slate-400 px-1.5 py-0.5 rounded-full bg-slate-800 group-hover:bg-slate-700">
                        {opt.count}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-sky-400" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
