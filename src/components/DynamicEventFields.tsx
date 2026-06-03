'use client';
import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';

interface Props {
  type: string;
  onChange: (fields: Record<string, any>) => void;
  initialValues?: Record<string, any>;
}

export function DynamicEventFields({ type, onChange, initialValues = {} }: Props) {
  const [fields, setFields] = useState<Record<string, any>>(initialValues);

  useEffect(() => { onChange(fields); }, [fields]);

  const update = (key: string, value: any) => setFields(prev => ({ ...prev, [key]: value }));

  const addListItem = (key: string) => {
    const list = fields[key] || [];
    update(key, [...list, '']);
  };

  const updateListItem = (key: string, idx: number, val: string) => {
    const list = [...(fields[key] || [])];
    list[idx] = val;
    update(key, list);
  };

  const removeListItem = (key: string, idx: number) => {
    const list = [...(fields[key] || [])];
    list.splice(idx, 1);
    update(key, list);
  };

  const ListField = ({ fieldKey, label }: { fieldKey: string; label: string }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {(fields[fieldKey] || []).map((item: string, idx: number) => (
        <div key={idx} className="flex gap-2 mb-2">
          <input value={item} onChange={e => updateListItem(fieldKey, idx, e.target.value)}
            className="flex-1 border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <button type="button" onClick={() => removeListItem(fieldKey, idx)} className="text-red-400 hover:text-red-600">
            <Trash2 size={16} />
          </button>
        </div>
      ))}
      <button type="button" onClick={() => addListItem(fieldKey)}
        className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800">
        <Plus size={12} /> Add {label}
      </button>
    </div>
  );

  const renderFields = () => {
    switch (type) {
      case 'hackathon':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Team Size</label>
                <input type="number" value={fields.team_min || ''} onChange={e => update('team_min', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Team Size</label>
                <input type="number" value={fields.team_max || ''} onChange={e => update('team_max', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prize Pool</label>
              <input value={fields.prize_pool || ''} onChange={e => update('prize_pool', e.target.value)}
                placeholder="e.g. $10,000"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <ListField fieldKey="jury" label="Jury Members" />
          </>
        );

      case 'workshop':
      case 'seminar':
        return (
          <>
            <ListField fieldKey="speakers" label="Speakers" />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Agenda</label>
              <textarea value={fields.agenda_text || ''} onChange={e => update('agenda_text', e.target.value)}
                rows={3} placeholder="Describe the agenda..."
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </>
        );

      case 'conference':
      case 'summit':
        return (
          <>
            <ListField fieldKey="speakers" label="Speakers" />
            <ListField fieldKey="sponsors" label="Sponsors" />
          </>
        );

      case 'bootcamp':
      case 'course':
        return (
          <>
            <ListField fieldKey="modules" label="Modules" />
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                <input type="checkbox" checked={!!fields.certificate} onChange={e => update('certificate', e.target.checked)}
                  className="rounded" />
                Certificate of Completion
              </label>
            </div>
          </>
        );

      case 'meetup':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Google Maps URL</label>
            <input value={fields.maps_url || ''} onChange={e => update('maps_url', e.target.value)}
              placeholder="https://maps.google.com/..."
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
        );

      case 'competition':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
              <select value={fields.format || 'solo'} onChange={e => update('format', e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="solo">Solo</option>
                <option value="team">Team</option>
                <option value="both">Both</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Submission Deadline</label>
              <input type="datetime-local" value={fields.submission_deadline || ''}
                onChange={e => update('submission_deadline', e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <ListField fieldKey="jury" label="Jury Members" />
          </>
        );

      case 'demo_day':
        return (
          <>
            <ListField fieldKey="jury" label="Jury Members" />
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                <input type="checkbox" checked={!!fields.audience_voting}
                  onChange={e => update('audience_voting', e.target.checked)} className="rounded" />
                Enable Audience Voting
              </label>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  const content = renderFields();
  if (!content) return null;

  return (
    <div className="border-t pt-4 mt-2">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Event-specific settings</h3>
      <div className="space-y-4">{content}</div>
    </div>
  );
}
