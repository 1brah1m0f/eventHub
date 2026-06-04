'use client';
import { useState, useEffect } from 'react';
import { Plus, Trash2, Link as LinkIcon } from 'lucide-react';

interface Props {
  type: string;
  onChange: (fields: Record<string, any>) => void;
  initialValues?: Record<string, any>;
}

export function DynamicEventFields({ type, onChange, initialValues = {} }: Props) {
  const [fields, setFields] = useState<Record<string, any>>(initialValues);

  useEffect(() => { onChange(fields); }, [fields]);

  const update = (key: string, value: any) => setFields(prev => ({ ...prev, [key]: value }));

  const addListItem = (key: string, template: any = '') => {
    update(key, [...(fields[key] || []), template]);
  };

  const updateListItem = (key: string, idx: number, val: any) => {
    const list = [...(fields[key] || [])];
    list[idx] = val;
    update(key, list);
  };

  const updateListItemField = (key: string, idx: number, field: string, val: any) => {
    const list = [...(fields[key] || [])];
    list[idx] = { ...list[idx], [field]: val };
    update(key, list);
  };

  const removeListItem = (key: string, idx: number) => {
    const list = [...(fields[key] || [])];
    list.splice(idx, 1);
    update(key, list);
  };

  const inp = 'w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-700';
  const addBtn = 'flex items-center gap-1 text-xs text-blue-700 hover:text-blue-900 transition-colors mt-1';

  // Simple string list
  const ListField = ({ fieldKey, label, placeholder }: { fieldKey: string; label: string; placeholder?: string }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {(fields[fieldKey] || []).map((item: string, idx: number) => (
        <div key={idx} className="flex gap-2 mb-2">
          <input value={item} onChange={e => updateListItem(fieldKey, idx, e.target.value)}
            placeholder={placeholder}
            className="flex-1 border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-700" />
          <button type="button" onClick={() => removeListItem(fieldKey, idx)}
            className="text-red-400 hover:text-red-600 transition-colors shrink-0">
            <Trash2 size={15} />
          </button>
        </div>
      ))}
      <button type="button" onClick={() => addListItem(fieldKey)} className={addBtn}>
        <Plus size={12} /> Add {label}
      </button>
    </div>
  );

  // Object list (e.g. speaker with name + bio)
  const SpeakerField = () => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Speakers</label>
      {(fields.speakers || []).map((s: any, idx: number) => (
        <div key={idx} className="border rounded-xl p-3 mb-3 bg-gray-50 space-y-2">
          <div className="flex gap-2">
            <input value={s.name || ''} onChange={e => updateListItemField('speakers', idx, 'name', e.target.value)}
              placeholder="Full name" className="flex-1 border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-700" />
            <button type="button" onClick={() => removeListItem('speakers', idx)}
              className="text-red-400 hover:text-red-600 shrink-0">
              <Trash2 size={15} />
            </button>
          </div>
          <input value={s.title || ''} onChange={e => updateListItemField('speakers', idx, 'title', e.target.value)}
            placeholder="Title / Company (e.g. Senior Engineer @ Google)" className={inp} />
          <textarea value={s.bio || ''} onChange={e => updateListItemField('speakers', idx, 'bio', e.target.value)}
            placeholder="Short bio..." rows={2} className={inp} />
          <input value={s.linkedin || ''} onChange={e => updateListItemField('speakers', idx, 'linkedin', e.target.value)}
            placeholder="LinkedIn URL (optional)" className={inp} />
        </div>
      ))}
      <button type="button" onClick={() => addListItem('speakers', { name: '', title: '', bio: '', linkedin: '' })} className={addBtn}>
        <Plus size={12} /> Add Speaker
      </button>
    </div>
  );

  // Resources (name + URL)
  const ResourcesField = () => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Resources / Links</label>
      {(fields.resources || []).map((r: any, idx: number) => (
        <div key={idx} className="flex gap-2 mb-2">
          <input value={r.label || ''} onChange={e => updateListItemField('resources', idx, 'label', e.target.value)}
            placeholder="Label (e.g. Slides)" className="w-1/3 border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-700" />
          <input value={r.url || ''} onChange={e => updateListItemField('resources', idx, 'url', e.target.value)}
            placeholder="https://..." className="flex-1 border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-700" />
          <button type="button" onClick={() => removeListItem('resources', idx)}
            className="text-red-400 hover:text-red-600 shrink-0">
            <Trash2 size={15} />
          </button>
        </div>
      ))}
      <button type="button" onClick={() => addListItem('resources', { label: '', url: '' })} className={addBtn}>
        <LinkIcon size={12} /> Add Resource
      </button>
    </div>
  );

  // Jury with scoring criteria
  const JuryField = () => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Jury Panel</label>
      {(fields.jury || []).map((j: any, idx: number) => (
        <div key={idx} className="border rounded-xl p-3 mb-3 bg-gray-50 space-y-2">
          <div className="flex gap-2">
            <input value={j.name || ''} onChange={e => updateListItemField('jury', idx, 'name', e.target.value)}
              placeholder="Juror name" className="flex-1 border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-700" />
            <button type="button" onClick={() => removeListItem('jury', idx)}
              className="text-red-400 hover:text-red-600 shrink-0">
              <Trash2 size={15} />
            </button>
          </div>
          <input value={j.title || ''} onChange={e => updateListItemField('jury', idx, 'title', e.target.value)}
            placeholder="Title / Company" className={inp} />
        </div>
      ))}
      <button type="button" onClick={() => addListItem('jury', { name: '', title: '' })} className={addBtn}>
        <Plus size={12} /> Add Juror
      </button>

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Scoring Criteria</label>
        {(fields.scoring_criteria || []).map((c: any, idx: number) => (
          <div key={idx} className="flex gap-2 mb-2">
            <input value={c.name || ''} onChange={e => updateListItemField('scoring_criteria', idx, 'name', e.target.value)}
              placeholder="Criterion (e.g. Innovation)" className="flex-1 border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-700" />
            <input type="number" value={c.weight || ''} onChange={e => updateListItemField('scoring_criteria', idx, 'weight', e.target.value)}
              placeholder="Weight %" className="w-24 border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-700" />
            <button type="button" onClick={() => removeListItem('scoring_criteria', idx)}
              className="text-red-400 hover:text-red-600 shrink-0">
              <Trash2 size={15} />
            </button>
          </div>
        ))}
        <button type="button" onClick={() => addListItem('scoring_criteria', { name: '', weight: '' })} className={addBtn}>
          <Plus size={12} /> Add Criterion
        </button>
      </div>
    </div>
  );

  // Conference sessions
  const SessionsField = () => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Sessions / Tracks</label>
      {(fields.sessions || []).map((s: any, idx: number) => (
        <div key={idx} className="border rounded-xl p-3 mb-3 bg-gray-50 space-y-2">
          <div className="flex gap-2">
            <input value={s.title || ''} onChange={e => updateListItemField('sessions', idx, 'title', e.target.value)}
              placeholder="Session title" className="flex-1 border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-700" />
            <button type="button" onClick={() => removeListItem('sessions', idx)}
              className="text-red-400 hover:text-red-600 shrink-0">
              <Trash2 size={15} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input type="datetime-local" value={s.start_time || ''}
              onChange={e => updateListItemField('sessions', idx, 'start_time', e.target.value)}
              className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-700" />
            <input value={s.room || ''} onChange={e => updateListItemField('sessions', idx, 'room', e.target.value)}
              placeholder="Room / Track" className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-700" />
          </div>
          <input value={s.speaker || ''} onChange={e => updateListItemField('sessions', idx, 'speaker', e.target.value)}
            placeholder="Speaker name" className={inp} />
        </div>
      ))}
      <button type="button" onClick={() => addListItem('sessions', { title: '', start_time: '', room: '', speaker: '' })} className={addBtn}>
        <Plus size={12} /> Add Session
      </button>
    </div>
  );

  // Bootcamp modules
  const ModulesField = () => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Modules</label>
      {(fields.modules || []).map((m: any, idx: number) => (
        <div key={idx} className="border rounded-xl p-3 mb-3 bg-gray-50 space-y-2">
          <div className="flex gap-2">
            <input value={m.title || ''} onChange={e => updateListItemField('modules', idx, 'title', e.target.value)}
              placeholder={`Module ${idx + 1} title`} className="flex-1 border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-700" />
            <button type="button" onClick={() => removeListItem('modules', idx)}
              className="text-red-400 hover:text-red-600 shrink-0">
              <Trash2 size={15} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input type="date" value={m.date || ''} onChange={e => updateListItemField('modules', idx, 'date', e.target.value)}
              className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-700" />
            <input value={m.duration || ''} onChange={e => updateListItemField('modules', idx, 'duration', e.target.value)}
              placeholder="Duration (e.g. 3 hours)" className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-700" />
          </div>
          <textarea value={m.description || ''} onChange={e => updateListItemField('modules', idx, 'description', e.target.value)}
            placeholder="What will be covered..." rows={2} className={inp} />
        </div>
      ))}
      <button type="button" onClick={() => addListItem('modules', { title: '', date: '', duration: '', description: '' })} className={addBtn}>
        <Plus size={12} /> Add Module
      </button>
    </div>
  );

  // Networking: attendee profile fields
  const AttendeeProfileFields = () => (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Required Attendee Info</label>
        <p className="text-xs text-gray-500 mb-2">Fields shown on public attendee profiles</p>
        <div className="space-y-2">
          {(['company', 'job_title', 'field_of_work', 'skills'] as const).map(field => (
            <label key={field} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox"
                checked={!!(fields.profile_fields || {})[field]}
                onChange={e => update('profile_fields', { ...(fields.profile_fields || {}), [field]: e.target.checked })}
                className="rounded accent-blue-800" />
              {field.split('_').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')}
            </label>
          ))}
        </div>
      </div>
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
          <input type="checkbox" checked={!!fields.public_attendee_list}
            onChange={e => update('public_attendee_list', e.target.checked)}
            className="rounded accent-blue-800" />
          Show public attendee list
        </label>
      </div>
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
          <input type="checkbox" checked={!!fields.connect_feature}
            onChange={e => update('connect_feature', e.target.checked)}
            className="rounded accent-blue-800" />
          Enable Connect feature (attendees can request introductions)
        </label>
      </div>
    </div>
  );

  // Demo Day: pitch slots
  const PitchSlotsField = () => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Pitch Schedule</label>
      {(fields.pitch_slots || []).map((slot: any, idx: number) => (
        <div key={idx} className="border rounded-xl p-3 mb-3 bg-gray-50 space-y-2">
          <div className="flex gap-2">
            <input value={slot.team || ''} onChange={e => updateListItemField('pitch_slots', idx, 'team', e.target.value)}
              placeholder="Team / Startup name" className="flex-1 border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-700" />
            <button type="button" onClick={() => removeListItem('pitch_slots', idx)}
              className="text-red-400 hover:text-red-600 shrink-0">
              <Trash2 size={15} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input type="datetime-local" value={slot.time || ''}
              onChange={e => updateListItemField('pitch_slots', idx, 'time', e.target.value)}
              className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-700" />
            <input value={slot.duration || ''} onChange={e => updateListItemField('pitch_slots', idx, 'duration', e.target.value)}
              placeholder="Duration (e.g. 5 min)" className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-700" />
          </div>
        </div>
      ))}
      <button type="button" onClick={() => addListItem('pitch_slots', { team: '', time: '', duration: '' })} className={addBtn}>
        <Plus size={12} /> Add Pitch Slot
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
                <input type="number" min={1} value={fields.team_min || ''}
                  onChange={e => update('team_min', e.target.value)} className={inp} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Team Size</label>
                <input type="number" min={1} value={fields.team_max || ''}
                  onChange={e => update('team_max', e.target.value)} className={inp} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prize Pool</label>
              <input value={fields.prize_pool || ''} onChange={e => update('prize_pool', e.target.value)}
                placeholder="e.g. $10,000" className={inp} />
            </div>
            <ListField fieldKey="mentors" label="Mentors" placeholder="Mentor name" />
            <JuryField />
            <ResourcesField />
          </>
        );

      case 'workshop':
      case 'seminar':
        return (
          <>
            <SpeakerField />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Agenda</label>
              <textarea value={fields.agenda || ''} onChange={e => update('agenda', e.target.value)}
                rows={4} placeholder="Describe the agenda, schedule, and topics covered..."
                className={inp} />
            </div>
            <ResourcesField />
          </>
        );

      case 'conference':
      case 'summit':
        return (
          <>
            <SpeakerField />
            <SessionsField />
            <ListField fieldKey="sponsors" label="Sponsors" placeholder="Sponsor name" />
            <ResourcesField />
          </>
        );

      case 'bootcamp':
      case 'course':
        return (
          <>
            <ModulesField />
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                <input type="checkbox" checked={!!fields.certificate}
                  onChange={e => update('certificate', e.target.checked)}
                  className="rounded accent-blue-800" />
                Certificate of completion
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                <input type="checkbox" checked={!!fields.progress_tracker}
                  onChange={e => update('progress_tracker', e.target.checked)}
                  className="rounded accent-blue-800" />
                Enable progress tracker
              </label>
            </div>
            <ResourcesField />
          </>
        );

      case 'networking':
        return <AttendeeProfileFields />;

      case 'meetup':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Google Maps URL</label>
              <input value={fields.maps_url || ''} onChange={e => update('maps_url', e.target.value)}
                placeholder="https://maps.google.com/..." className={inp} />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                <input type="checkbox" checked={!!fields.rsvp_enabled}
                  onChange={e => update('rsvp_enabled', e.target.checked)}
                  className="rounded accent-blue-800" />
                Enable RSVP system
              </label>
            </div>
            {fields.rsvp_enabled && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">RSVP Capacity</label>
                <input type="number" value={fields.rsvp_capacity || ''}
                  onChange={e => update('rsvp_capacity', e.target.value)}
                  placeholder="Max attendees" className={inp} />
              </div>
            )}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                <input type="checkbox" checked={!!fields.photo_gallery}
                  onChange={e => update('photo_gallery', e.target.checked)}
                  className="rounded accent-blue-800" />
                Enable post-event photo gallery
              </label>
            </div>
          </>
        );

      case 'competition':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
              <select value={fields.format || 'solo'} onChange={e => update('format', e.target.value)}
                className={inp}>
                <option value="solo">Solo only</option>
                <option value="team">Team only</option>
                <option value="both">Both solo and team</option>
              </select>
            </div>
            {(fields.format === 'team' || fields.format === 'both') && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Team Size</label>
                  <input type="number" value={fields.team_min || ''}
                    onChange={e => update('team_min', e.target.value)} className={inp} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Team Size</label>
                  <input type="number" value={fields.team_max || ''}
                    onChange={e => update('team_max', e.target.value)} className={inp} />
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Submission Deadline</label>
              <input type="datetime-local" value={fields.submission_deadline || ''}
                onChange={e => update('submission_deadline', e.target.value)} className={inp} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Submission Instructions</label>
              <textarea value={fields.submission_instructions || ''}
                onChange={e => update('submission_instructions', e.target.value)}
                rows={3} placeholder="How should participants submit their work?"
                className={inp} />
            </div>
            <JuryField />
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                <input type="checkbox" checked={!!fields.leaderboard}
                  onChange={e => update('leaderboard', e.target.checked)}
                  className="rounded accent-blue-800" />
                Enable real-time leaderboard
              </label>
            </div>
          </>
        );

      case 'demo_day':
        return (
          <>
            <PitchSlotsField />
            <JuryField />
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                <input type="checkbox" checked={!!fields.audience_voting}
                  onChange={e => update('audience_voting', e.target.checked)}
                  className="rounded accent-blue-800" />
                Enable audience voting
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                <input type="checkbox" checked={!!fields.jury_feedback_form}
                  onChange={e => update('jury_feedback_form', e.target.checked)}
                  className="rounded accent-blue-800" />
                Enable jury feedback form per team
              </label>
            </div>
            <ResourcesField />
          </>
        );

      default:
        return null;
    }
  };

  const content = renderFields();
  if (!content) return null;

  return (
    <div className="border-t pt-5 mt-2">
      <h3 className="text-sm font-semibold text-blue-800 mb-4 uppercase tracking-wide">
        {type.charAt(0).toUpperCase() + type.replace('_', ' ').slice(1)} settings
      </h3>
      <div className="space-y-5">{content}</div>
    </div>
  );
}
