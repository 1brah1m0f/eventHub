import Link from 'next/link';
import { format } from 'date-fns';
import { Calendar, MapPin, Users } from 'lucide-react';
import { EVENT_TYPES } from '@/lib/utils';

interface Props {
  event: any;
}

const TYPE_COLORS: Record<string, string> = {
  hackathon: 'bg-purple-100 text-purple-700',
  conference: 'bg-blue-100 text-blue-800',
  workshop: 'bg-green-100 text-green-700',
  bootcamp: 'bg-orange-100 text-orange-700',
  meetup: 'bg-pink-100 text-pink-700',
  networking: 'bg-yellow-100 text-yellow-700',
  competition: 'bg-red-100 text-red-700',
  demo_day: 'bg-blue-100 text-blue-800',
  default: 'bg-gray-100 text-gray-700',
};

const TYPE_GRADIENTS: Record<string, string> = {
  hackathon: 'from-purple-700 to-blue-900',
  conference: 'from-blue-800 to-cyan-700',
  workshop: 'from-green-700 to-blue-800',
  bootcamp: 'from-orange-600 to-blue-800',
  meetup: 'from-pink-700 to-blue-900',
  networking: 'from-yellow-600 to-blue-800',
  competition: 'from-red-700 to-blue-900',
  demo_day: 'from-blue-800 to-slate-900',
  default: 'from-blue-900 to-blue-800',
};

export function EventCard({ event }: Props) {
  const typeLabel = EVENT_TYPES.find(t => t.value === event.type)?.label || event.type;
  const colorClass = TYPE_COLORS[event.type] || TYPE_COLORS.default;
  const gradientClass = TYPE_GRADIENTS[event.type] || TYPE_GRADIENTS.default;

  return (
    <Link href={`/events/${event.event_id}`}
      className="bg-white rounded-2xl border hover:shadow-lg transition-shadow overflow-hidden group">
      {event.cover_image ? (
        <img src={event.cover_image} alt={event.title} className="w-full h-40 object-cover" />
      ) : (
        <div className={`w-full h-40 bg-gradient-to-br ${gradientClass} flex items-end p-3`}>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${colorClass}`}>{typeLabel}</span>
        </div>
      )}
      <div className="p-4">
        {event.cover_image && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colorClass} mb-2 inline-block`}>{typeLabel}</span>
        )}
        <h3 className="font-semibold text-gray-900 mt-1 mb-1 line-clamp-2 group-hover:text-blue-800 transition-colors">
          {event.title}
        </h3>
        <p className="text-sm text-gray-500 line-clamp-2 mb-3">{event.description}</p>
        <div className="flex flex-col gap-1 text-xs text-gray-500">
          {event.date && (
            <span className="flex items-center gap-1.5">
              <Calendar size={12} className="text-blue-700" />
              {format(new Date(event.date), 'MMM d, yyyy')}
            </span>
          )}
          {event.location && (
            <span className="flex items-center gap-1.5">
              <MapPin size={12} className="text-blue-700" /> {event.location}
            </span>
          )}
          {event.attendee_count !== undefined && (
            <span className="flex items-center gap-1.5">
              <Users size={12} className="text-blue-700" /> {event.attendee_count} registered
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
