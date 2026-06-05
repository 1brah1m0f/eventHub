'use client';
import { useState } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';

export interface AgendaItem {
  time: string;
  title: string;
  description?: string;
}

interface Props {
  value: AgendaItem[];
  onChange: (items: AgendaItem[]) => void;
}

const inputClass = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-700 bg-white';

export function AgendaEditor({ value, onChange }: Props) {
  const [items, setItems] = useState<AgendaItem[]>(value || []);

  const update = (next: AgendaItem[]) => {
    setItems(next);
    onChange(next);
  };

  const add = () => update([...items, { time: '', title: '', description: '' }]);

  const remove = (i: number) => update(items.filter((_, idx) => idx !== i));

  const set = (i: number, field: keyof AgendaItem, val: string) => {
    const next = items.map((item, idx) => idx === i ? { ...item, [field]: val } : item);
    update(next);
  };

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="flex gap-2 items-start group">
          <GripVertical size={16} className="mt-2.5 text-gray-300 shrink-0" />
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-2">
            <input
              value={item.time}
              onChange={e => set(i, 'time', e.target.value)}
              className={inputClass}
              placeholder="10:00 AM"
            />
            <input
              value={item.title}
              onChange={e => set(i, 'title', e.target.value)}
              className={inputClass}
              placeholder="Session title"
            />
            <input
              value={item.description || ''}
              onChange={e => set(i, 'description', e.target.value)}
              className={`${inputClass} sm:col-span-2`}
              placeholder="Short description (optional)"
            />
          </div>
          <button
            type="button"
            onClick={() => remove(i)}
            className="mt-2 text-gray-300 hover:text-red-500 transition-colors shrink-0"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={add}
        className="flex items-center gap-1.5 text-sm text-blue-700 hover:text-blue-900 transition-colors"
      >
        <Plus size={15} /> Add agenda item
      </button>
    </div>
  );
}
