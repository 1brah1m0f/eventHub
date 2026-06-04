export interface JwtPayload {
  userId: string;
  email: string;
}

export interface AuthRequest extends Express.Request {
  user?: JwtPayload;
}

export type EventType =
  | 'workshop' | 'seminar' | 'hackathon' | 'conference' | 'summit'
  | 'bootcamp' | 'course' | 'networking' | 'competition' | 'meetup' | 'demo_day';

export type EventStatus = 'draft' | 'published' | 'finished';
export type RegistrationRole = 'attendee' | 'mentor' | 'jury' | 'speaker';

export interface User {
  user_id: string;
  name: string;
  email: string;
  bio?: string;
  skills?: string[];
  linkedin_url?: string;
  avatar_url?: string;
  created_at: string;
}

export interface Event {
  event_id: string;
  title: string;
  description?: string;
  type: EventType;
  date?: string;
  end_date?: string;
  location?: string;
  cover_image?: string;
  agenda?: any;
  resources?: any;
  extra_fields?: any;
  created_by: string;
  status: EventStatus;
  created_at: string;
  updated_at: string;
}
