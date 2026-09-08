import { Check, ChevronDown, Search, X } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { FilterOptionItem } from '../types/index.js';
import { cn } from '../utils/index.js';

interface MultiSelectDropdownProps {
  label: string;
  selectedValues: string[];
  options: FilterOptionItem[];
  placeholder?: string;
  onToggle: (val: string) => void;
  onRemove: (val: string) => void;
  onClear: () => void;
  isLoading?: boolean;
}

export const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  label,
  selectedValues,
  options,
  placeholder = 'Select topics...',
  onToggle,
  onRemove,
  onClear,
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

  return (
    <div className="relative space-y-1.5" ref={dropdownRef}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </label>
        {selectedValues.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="text-[11px] text-sky-400 hover:text-sky-300 transition-colors"
          >
            Clear ({selectedValues.length})
          </button>
        )}
      </div>

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        disabled={isLoading}
        className={cn(
          'w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg border text-left transition-all duration-150',
          'bg-slate-900/80 border-slate-700/80 hover:border-slate-600 focus:outline-none focus:ring-1 focus:ring-sky-500',
          selectedValues.length > 0 ? 'text-slate-100 font-medium' : 'text-slate-400',
          isLoading && 'opacity-60 cursor-not-allowed',
        )}
      >
        <span className="truncate">
          {isLoading
            ? 'Loading topics...'
            : selectedValues.length === 0
              ? placeholder
              : `${selectedValues.length} topic${selectedValues.length > 1 ? 's' : ''} selected`}
        </span>
        <div className="flex items-center gap-1.5 ml-2 shrink-0">
          {selectedValues.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-sky-500/20 text-sky-400 border border-sky-500/30">
              {selectedValues.length}
            </span>
          )}
          <ChevronDown
            className={cn(
              'w-4 h-4 text-slate-400 transition-transform duration-200',
              isOpen && 'rotate-180 text-sky-400',
            )}
          />
        </div>
      </button>

      {/* Selected Tags Pills */}
      {selectedValues.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1 max-h-24 overflow-y-auto scrollbar-thin">
          {selectedValues.map((val) => (
            <span
              key={val}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-sky-500/15 text-sky-300 border border-sky-500/30"
            >
              <span className="truncate max-w-[120px]">{val}</span>
              <button
                type="button"
                onClick={() => onRemove(val)}
                className="hover:text-white transition-colors"
                aria-label={`Remove ${val}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 rounded-xl border border-slate-700/80 bg-slate-900/95 backdrop-blur-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Search Header */}
          <div className="p-2 border-b border-slate-800 flex items-center gap-2 bg-slate-950/60">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Search ${options.length} topics...`}
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
          <div className="max-h-60 overflow-y-auto p-1.5 space-y-0.5 scrollbar-thin scrollbar-thumb-slate-700">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-slate-500">No matching topics</div>
            ) : (
              filteredOptions.map((opt) => {
                const isChecked = selectedValues.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onToggle(opt.value)}
                    className={cn(
                      'w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-md transition-colors text-left group',
                      isChecked
                        ? 'bg-sky-500/20 text-sky-200 font-medium'
                        : 'text-slate-300 hover:bg-slate-800/80',
                    )}
                  >
                    <div className="flex items-center gap-2 truncate mr-2">
                      <div
                        className={cn(
                          'w-3.5 h-3.5 rounded flex items-center justify-center border transition-colors shrink-0',
                          isChecked
                            ? 'bg-sky-500 border-sky-500 text-white'
                            : 'border-slate-600 bg-slate-800 group-hover:border-slate-500',
                        )}
                      >
                        {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                      <span className="truncate">{opt.value}</span>
                    </div>

                    <span className="text-[10px] text-slate-400 px-1.5 py-0.5 rounded-full bg-slate-800 shrink-0 group-hover:bg-slate-700">
                      {opt.count}
                    </span>
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
