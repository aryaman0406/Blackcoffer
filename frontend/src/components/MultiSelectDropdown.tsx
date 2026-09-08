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
    <div className="relative space-y-1" ref={dropdownRef}>
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-medium text-[#8B93A7]">
          {label}
        </label>
        {selectedValues.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="text-[10px] text-[#E8944A] hover:text-[#ECE9E2] transition-colors"
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
          'w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg border text-left transition-colors',
          'bg-[#0B1220] border-[#26314A] hover:border-[#3B4B6E] focus-visible:ring-1 focus-visible:ring-[#E8944A]',
          selectedValues.length > 0 ? 'text-[#ECE9E2] font-medium' : 'text-[#8B93A7]',
          isLoading && 'opacity-50 cursor-not-allowed',
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
            <span className="px-1.5 py-0.2 text-[10px] font-semibold bg-[#E8944A]/15 text-[#E8944A] border border-[#E8944A]/30 rounded tabular-nums">
              {selectedValues.length}
            </span>
          )}
          <ChevronDown
            className={cn(
              'h-3.5 w-3.5 text-[#8B93A7] transition-transform duration-150',
              isOpen && 'rotate-180 text-[#E8944A]',
            )}
          />
        </div>
      </button>

      {/* Selected Tags Pills */}
      {selectedValues.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-0.5 max-h-20 overflow-y-auto scrollbar-thin">
          {selectedValues.map((val) => (
            <span
              key={val}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#E8944A]/15 text-[#E8944A] border border-[#E8944A]/30"
            >
              <span className="truncate max-w-[110px]">{val}</span>
              <button
                type="button"
                onClick={() => onRemove(val)}
                className="hover:text-white transition-colors"
                aria-label={`Remove ${val}`}
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 rounded-lg border border-[#26314A] bg-[#131B2E] shadow-panel overflow-hidden">
          {/* Search Input */}
          <div className="p-2 border-b border-[#26314A] flex items-center gap-2 bg-[#0E1524]">
            <Search className="h-3 w-3 text-[#8B93A7] shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Filter ${options.length} topics...`}
              className="w-full bg-transparent text-xs text-[#ECE9E2] placeholder-[#8B93A7] focus:outline-none"
              autoFocus
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="text-[#8B93A7] hover:text-[#ECE9E2]"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Options List */}
          <div className="max-h-52 overflow-y-auto p-1 space-y-0.5 scrollbar-thin">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-3 text-center text-xs text-[#8B93A7]">No signals found</div>
            ) : (
              filteredOptions.map((opt) => {
                const isChecked = selectedValues.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onToggle(opt.value)}
                    className={cn(
                      'w-full flex items-center justify-between px-2 py-1.5 text-xs rounded transition-colors text-left group',
                      isChecked
                        ? 'bg-[#E8944A]/15 text-[#ECE9E2] font-medium'
                        : 'text-[#ECE9E2] hover:bg-[#18233C]',
                    )}
                  >
                    <div className="flex items-center gap-2 truncate mr-2">
                      <div
                        className={cn(
                          'h-3 w-3 rounded flex items-center justify-center border transition-colors shrink-0',
                          isChecked
                            ? 'bg-[#E8944A] border-[#E8944A] text-[#0B1220]'
                            : 'border-[#26314A] bg-[#0B1220] group-hover:border-[#3B4B6E]',
                        )}
                      >
                        {isChecked && <Check className="h-2 w-2 stroke-[3]" />}
                      </div>
                      <span className="truncate">{opt.value}</span>
                    </div>

                    <span className="text-[10px] text-[#8B93A7] px-1 py-0.2 rounded bg-[#0B1220] shrink-0 tabular-nums">
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
