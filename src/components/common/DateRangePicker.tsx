'use client';

import { useState } from 'react';

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onChange: (start: string, end: string) => void;
}

export default function DateRangePicker({ startDate, endDate, onChange }: DateRangePickerProps) {
  const [preset, setPreset] = useState<string>('custom');

  const presets = [
    { label: 'Hoy', value: 'today' },
    { label: 'Esta semana', value: 'week' },
    { label: 'Este mes', value: 'month' },
    { label: 'Personalizado', value: 'custom' },
  ];

  const getPresetDates = (preset: string) => {
    const today = new Date();
    const start = new Date();

    switch (preset) {
      case 'today':
        return { start: today.toISOString().split('T')[0], end: today.toISOString().split('T')[0] };
      case 'week':
        start.setDate(today.getDate() - today.getDay());
        return { start: start.toISOString().split('T')[0], end: today.toISOString().split('T')[0] };
      case 'month':
        start.setDate(1);
        return { start: start.toISOString().split('T')[0], end: today.toISOString().split('T')[0] };
      default:
        return { start: startDate, end: endDate };
    }
  };

  const handlePresetChange = (value: string) => {
    setPreset(value);
    if (value !== 'custom') {
      const dates = getPresetDates(value);
      onChange(dates.start, dates.end);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex gap-2">
        {presets.map((p) => (
          <button
            key={p.value}
            onClick={() => handlePresetChange(p.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              preset === p.value
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {preset === 'custom' && (
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => onChange(e.target.value, endDate)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white"
          />
          <span className="text-gray-500">a</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onChange(startDate, e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white"
          />
        </div>
      )}
    </div>
  );
}
