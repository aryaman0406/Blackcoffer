import React from 'react';

interface TooltipPayloadItem {
  name: string;
  value: number | string;
  color?: string;
  unit?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string | number;
  titlePrefix?: string;
}

export const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
  titlePrefix,
}) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border border-[#26314A] bg-[#131B2E]/95 backdrop-blur-md p-2.5 shadow-2xl text-xs space-y-1.5 min-w-[140px] z-50">
      {label !== undefined && (
        <div className="font-semibold text-[#ECE9E2] border-b border-[#26314A] pb-1">
          {titlePrefix ? `${titlePrefix}: ` : ''}
          {label}
        </div>
      )}
      <div className="space-y-1">
        {payload.map((item, index) => (
          <div key={index} className="flex items-center justify-between gap-3 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span
                className="h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: item.color || '#4FD1C5' }}
              />
              <span className="text-[#8B93A7] capitalize">{item.name}:</span>
            </div>
            <span className="font-semibold text-[#ECE9E2] tabular-nums">
              {typeof item.value === 'number'
                ? Number.isFinite(item.value)
                  ? item.value.toLocaleString(undefined, { maximumFractionDigits: 2 })
                  : '0'
                : (item.value ?? '')}
              {item.unit || ''}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
