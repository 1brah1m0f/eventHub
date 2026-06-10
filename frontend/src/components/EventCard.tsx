import Link from 'next/link';
import { format } from 'date-fns';
import { Calendar, MapPin, Users } from 'lucide-react';
import { EVENT_TYPES } from '@/lib/utils';

interface Props {
  event: any;
}

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  hackathon:   { bg: 'bg-purple-100', text: 'text-purple-700' },
  conference:  { bg: 'bg-violet-100',   text: 'text-violet-800'   },
  workshop:    { bg: 'bg-emerald-100', text: 'text-emerald-700'},
  bootcamp:    { bg: 'bg-orange-100', text: 'text-orange-700' },
  meetup:      { bg: 'bg-pink-100',   text: 'text-pink-700'   },
  networking:  { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  competition: { bg: 'bg-red-100',    text: 'text-red-700'    },
  demo_day:    { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  seminar:     { bg: 'bg-teal-100',   text: 'text-teal-700'   },
  summit:      { bg: 'bg-sky-100',    text: 'text-sky-700'    },
  course:      { bg: 'bg-cyan-100',   text: 'text-cyan-700'   },
};

const TYPE_BANNER: Record<string, string> = {
  hackathon:   'from-purple-700 to-violet-900',
  conference:  'from-violet-800 to-cyan-700',
  workshop:    'from-emerald-700 to-violet-800',
  bootcamp:    'from-orange-600 to-violet-800',
  meetup:      'from-pink-700 to-violet-900',
  networking:  'from-yellow-600 to-orange-700',
  competition: 'from-red-700 to-violet-900',
  demo_day:    'from-violet-800 to-slate-900',
  seminar:     'from-teal-700 to-violet-800',
  summit:      'from-sky-700 to-violet-900',
};

export function EventCard({ event }: Props) {
  const typeLabel = EVENT_TYPES.find(t => t.value === event.type)?.label || event.type;
  const colors = TYPE_COLORS[event.type] || { bg: 'bg-gray-100', text: 'text-gray-700' };
  const banner = TYPE_BANNER[event.type] || 'from-violet-900 to-violet-800';

  return (
    <Link
      href={`/events/${event.event_id}`}
      className="group bg-white rounded-xl border border-gray-200 hover:border-violet-200 hover:shadow-md transition-all overflow-hidden block"
    >
      {event.cover_image ? (
        <img
          src={event.cover_image}
          alt={event.title}
          className="w-full h-40 object-cover"
        />
      ) : (
        <div className={`w-full h-40 bg-gradient-to-br ${banner}`} />
      )}

      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${colors.bg} ${colors.text}`}>
            {typeLabel}
          </span>
          {event.status === 'draft' && (
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">Draft</span>
          )}
        </div>

        <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-violet-800 transition-colors leading-snug mb-1.5">
          {event.title}
        </h3>

        {event.description && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-3 leading-relaxed">{event.description}</p>
        )}

        <div className="flex flex-col gap-1.5 text-xs text-gray-500 pt-2 border-t border-gray-100">
          {event.date && (
            <span className="flex items-center gap-1.5">
              <Calendar size={11} className="text-violet-600 shrink-0" />
              {format(new Date(event.date), 'MMM d, yyyy')}
            </span>
          )}
          {event.location && (
            <span className="flex items-center gap-1.5">
              <MapPin size={11} className="text-violet-600 shrink-0" />
              <span className="truncate">{event.location}</span>
            </span>
          )}
          {event.attendee_count !== undefined && Number(event.attendee_count) > 0 && (
            <span className="flex items-center gap-1.5">
              <Users size={11} className="text-violet-600 shrink-0" />
              {Number(event.attendee_count).toLocaleString()} registered
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
