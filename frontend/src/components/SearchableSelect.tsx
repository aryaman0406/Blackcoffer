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
    <div className="relative space-y-1" ref={dropdownRef}>
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-medium text-[#8B93A7]">
          {label}
        </label>
        {value && (
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="text-[10px] text-[#E8944A] hover:text-[#ECE9E2] transition-colors"
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
          'w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg border text-left transition-colors',
          'bg-[#0B1220] border-[#26314A] hover:border-[#3B4B6E] focus-visible:ring-1 focus-visible:ring-[#E8944A]',
          value ? 'text-[#ECE9E2] font-medium' : 'text-[#8B93A7]',
          isLoading && 'opacity-50 cursor-not-allowed',
        )}
      >
        <span className="truncate">
          {isLoading
            ? 'Loading...'
            : selectedItem
              ? `${selectedItem.value} (${selectedItem.count})`
              : placeholder}
        </span>
        <div className="flex items-center gap-1 ml-2 shrink-0">
          <ChevronDown
            className={cn(
              'h-3.5 w-3.5 text-[#8B93A7] transition-transform duration-150',
              isOpen && 'rotate-180 text-[#E8944A]',
            )}
          />
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 rounded-lg border border-[#26314A] bg-[#131B2E] shadow-panel overflow-hidden">
          {/* Search Input */}
          <div className="p-2 border-b border-[#26314A] flex items-center gap-2 bg-[#0E1524]">
            <Search className="h-3 w-3 text-[#8B93A7] shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Search ${options.length} ${label.toLowerCase()}s...`}
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
            <button
              type="button"
              onClick={() => {
                onChange(undefined);
                setIsOpen(false);
              }}
              className={cn(
                'w-full flex items-center justify-between px-2 py-1.5 text-xs rounded transition-colors text-left',
                !value
                  ? 'bg-[#E8944A]/15 text-[#ECE9E2] font-semibold'
                  : 'text-[#ECE9E2] hover:bg-[#18233C]',
              )}
            >
              <span>All {label}s</span>
              {!value && <Check className="h-3 w-3 text-[#E8944A]" />}
            </button>

            {filteredOptions.length === 0 ? (
              <div className="px-3 py-3 text-center text-xs text-[#8B93A7]">
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
                      'w-full flex items-center justify-between px-2 py-1.5 text-xs rounded transition-colors text-left group',
                      isSelected
                        ? 'bg-[#E8944A]/15 text-[#ECE9E2] font-medium'
                        : 'text-[#ECE9E2] hover:bg-[#18233C]',
                    )}
                  >
                    <span className="truncate mr-2">{opt.value}</span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] text-[#8B93A7] px-1 py-0.2 rounded bg-[#0B1220] tabular-nums">
                        {opt.count}
                      </span>
                      {isSelected && <Check className="h-3 w-3 text-[#E8944A]" />}
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
