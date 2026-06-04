import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const EVENT_TYPES = [
  { value: 'workshop', label: 'Workshop' },
  { value: 'seminar', label: 'Seminar' },
  { value: 'hackathon', label: 'Hackathon' },
  { value: 'conference', label: 'Conference' },
  { value: 'summit', label: 'Summit' },
  { value: 'bootcamp', label: 'Bootcamp' },
  { value: 'course', label: 'Course' },
  { value: 'networking', label: 'Networking Event' },
  { value: 'competition', label: 'Competition' },
  { value: 'meetup', label: 'Meetup' },
  { value: 'demo_day', label: 'Demo Day' },
] as const;

export const EVENT_TYPE_FIELDS: Record<string, string[]> = {
  workshop: ['speakers', 'agenda', 'resources'],
  seminar: ['speakers', 'agenda', 'resources'],
  hackathon: ['team_min', 'team_max', 'mentors', 'jury', 'prize_pool'],
  conference: ['speakers', 'sessions', 'sponsors'],
  summit: ['speakers', 'sessions', 'sponsors'],
  bootcamp: ['modules', 'certificate'],
  course: ['modules', 'certificate'],
  networking: ['attendee_fields'],
  competition: ['solo_or_team', 'submission_deadline', 'jury', 'leaderboard'],
  meetup: ['rsvp', 'maps_url', 'photo_gallery'],
  demo_day: ['teams', 'pitch_schedule', 'jury', 'audience_voting'],
};
