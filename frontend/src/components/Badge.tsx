import { Trophy, Medal, Award, Star, Sparkles, Palette, Mic, CheckCircle2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface BadgeType {
  type: string;
  label?: string | null;
}

interface Meta {
  icon: LucideIcon;
  name: string;
  ring: string;   // border + bg classes
  text: string;
  iconColor: string;
}

export const ACHIEVEMENT_META: Record<string, Meta> = {
  winner:      { icon: Trophy,      name: '1st Place',   ring: 'bg-amber-50 border-amber-200',   text: 'text-amber-800',   iconColor: 'text-amber-500' },
  runner_up:   { icon: Medal,       name: '2nd Place',   ring: 'bg-slate-50 border-slate-200',   text: 'text-slate-700',   iconColor: 'text-slate-400' },
  third_place: { icon: Medal,       name: '3rd Place',   ring: 'bg-orange-50 border-orange-200', text: 'text-orange-800',  iconColor: 'text-orange-500' },
  finalist:    { icon: Star,        name: 'Finalist',    ring: 'bg-violet-50 border-violet-200', text: 'text-violet-800',  iconColor: 'text-violet-500' },
  best_design: { icon: Palette,     name: 'Best Design', ring: 'bg-pink-50 border-pink-200',     text: 'text-pink-800',    iconColor: 'text-pink-500' },
  best_pitch:  { icon: Mic,         name: 'Best Pitch',  ring: 'bg-indigo-50 border-indigo-200', text: 'text-indigo-800',  iconColor: 'text-indigo-500' },
  special:     { icon: Sparkles,    name: 'Special',     ring: 'bg-fuchsia-50 border-fuchsia-200', text: 'text-fuchsia-800', iconColor: 'text-fuchsia-500' },
  participant: { icon: CheckCircle2,name: 'Participant', ring: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', iconColor: 'text-emerald-500' },
};

export const ACHIEVEMENT_TYPES = Object.entries(ACHIEVEMENT_META).map(([value, m]) => ({ value, label: m.name }));

export function metaFor(type: string): Meta {
  return ACHIEVEMENT_META[type] ?? { icon: Award, name: type, ring: 'bg-gray-50 border-gray-200', text: 'text-gray-700', iconColor: 'text-gray-400' };
}

// Compact pill badge — used in lists, attendee rows
export function Badge({ type, label, size = 'sm' }: BadgeType & { size?: 'sm' | 'md' }) {
  const m = metaFor(type);
  const Icon = m.icon;
  const display = label || m.name;
  const pad = size === 'md' ? 'px-2.5 py-1 text-sm' : 'px-2 py-0.5 text-xs';
  const ic = size === 'md' ? 14 : 12;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${m.ring} ${m.text} ${pad}`}>
      <Icon size={ic} className={m.iconColor} />
      {display}
    </span>
  );
}

// Bigger trophy-card variant — used in profile badge grid
export function BadgeCard({ type, label, eventTitle }: BadgeType & { eventTitle?: string }) {
  const m = metaFor(type);
  const Icon = m.icon;
  return (
    <div className={`rounded-xl border p-4 flex items-center gap-3 ${m.ring}`}>
      <div className="w-11 h-11 rounded-lg bg-white/70 flex items-center justify-center shrink-0">
        <Icon size={22} className={m.iconColor} />
      </div>
      <div className="min-w-0">
        <p className={`text-sm font-semibold ${m.text}`}>{label || m.name}</p>
        {eventTitle && <p className="text-xs text-gray-500 truncate">{eventTitle}</p>}
      </div>
    </div>
  );
}
