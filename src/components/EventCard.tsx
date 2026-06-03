import Link from 'next/link';
import { format } from 'date-fns';
import { Calendar, MapPin, Users } from 'lucide-react';
import { EVENT_TYPES } from '@/lib/utils';

interface Props {
  event: any;
}

const TYPE_COLORS: Record<string, string> = {
  hackathon: 'bg-purple-100 text-purple-700',
  conference: 'bg-blue-100 text-blue-700',
  workshop: 'bg-green-100 text-green-700',
  bootcamp: 'bg-orange-100 text-orange-700',
  meetup: 'bg-pink-100 text-pink-700',
  networking: 'bg-yellow-100 text-yellow-700',
  competition: 'bg-red-100 text-red-700',
  demo_day: 'bg-indigo-100 text-indigo-700',
  default: 'bg-gray-100 text-gray-700',
};

export function EventCard({ event }: Props) {
  const typeLabel = EVENT_TYPES.find(t => t.value === event.type)?.label || event.type;
  const colorClass = TYPE_COLORS[event.type] || TYPE_COLORS.default;

  return (
    <Link href={`/events/${event.event_id}`}
      className="bg-white rounded-xl border hover:shadow-md transition-shadow overflow-hidden">
      {event.cover_image && (
        <img src={event.cover_image} alt={event.title} className="w-full h-40 object-cover" />
      )}
      {!event.cover_image && (
        <div className="w-full h-40 bg-gradient-to-br from-indigo-50 to-purple-50" />
      )}
      <div className="p-4">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colorClass}`}>{typeLabel}</span>
        <h3 className="font-semibold text-gray-900 mt-2 mb-1 line-clamp-2">{event.title}</h3>
        <p className="text-sm text-gray-500 line-clamp-2 mb-3">{event.description}</p>
        <div className="flex flex-col gap-1 text-xs text-gray-500">
          {event.date && (
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {format(new Date(event.date), 'MMM d, yyyy')}
            </span>
          )}
          {event.location && (
            <span className="flex items-center gap-1">
              <MapPin size={12} /> {event.location}
            </span>
          )}
          {event.attendee_count !== undefined && (
            <span className="flex items-center gap-1">
              <Users size={12} /> {event.attendee_count} registered
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
