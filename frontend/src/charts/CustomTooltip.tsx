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
    <div className="rounded-xl border border-slate-700/80 bg-slate-900/95 backdrop-blur-xl p-3 shadow-2xl text-xs space-y-1.5 min-w-[140px] z-50">
      {label !== undefined && (
        <div className="font-semibold text-slate-200 border-b border-slate-800 pb-1">
          {titlePrefix ? `${titlePrefix}: ` : ''}
          {label}
        </div>
      )}
      <div className="space-y-1">
        {payload.map((item, index) => (
          <div key={index} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: item.color || '#38bdf8' }}
              />
              <span className="text-slate-400 capitalize">{item.name}:</span>
            </div>
            <span className="font-bold text-slate-100">
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
