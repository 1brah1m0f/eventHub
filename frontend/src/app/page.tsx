import Link from 'next/link';
import { Calendar, MapPin, Users, Zap, Shield, Globe, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

const SAMPLE_EVENTS = [
  {
    event_id: 'demo-1',
    title: "TechHack 2025 — Azerbaijan's Biggest Hackathon",
    type: 'hackathon',
    date: '2025-07-15T09:00:00',
    location: 'Baku, Azerbaijan',
    description: 'Join 500+ developers, designers, and entrepreneurs for 48 hours of non-stop innovation and prize money.',
    attendee_count: 312,
    color: 'from-purple-600 to-blue-800',
  },
  {
    event_id: 'demo-2',
    title: 'AI & Machine Learning Summit',
    type: 'conference',
    date: '2025-08-02T10:00:00',
    location: 'Tbilisi, Georgia',
    description: 'World-class speakers exploring the cutting edge of artificial intelligence and its real-world applications.',
    attendee_count: 850,
    color: 'from-blue-800 to-cyan-600',
  },
  {
    event_id: 'demo-3',
    title: 'React & Next.js Bootcamp',
    type: 'bootcamp',
    date: '2025-07-20T09:00:00',
    location: 'Online',
    description: 'Intensive 4-week program covering modern frontend development from fundamentals to production deployment.',
    attendee_count: 145,
    color: 'from-blue-700 to-indigo-900',
  },
  {
    event_id: 'demo-4',
    title: 'Startup Demo Day — Spring 2025',
    type: 'demo_day',
    date: '2025-07-28T14:00:00',
    location: 'Yerevan, Armenia',
    description: 'Twelve early-stage startups pitch to investors and the public. Audience voting determines People\'s Choice.',
    attendee_count: 430,
    color: 'from-slate-800 to-blue-900',
  },
  {
    event_id: 'demo-5',
    title: 'Caucasus Developers Meetup #12',
    type: 'meetup',
    date: '2025-07-10T18:30:00',
    location: 'Baku, Azerbaijan',
    description: 'Monthly gathering of developers across the Caucasus region. Lightning talks, networking, and food.',
    attendee_count: 87,
    color: 'from-blue-900 to-blue-700',
  },
  {
    event_id: 'demo-6',
    title: 'Cybersecurity Workshop: Hands-On Penetration Testing',
    type: 'workshop',
    date: '2025-08-05T09:00:00',
    location: 'Tbilisi, Georgia',
    description: 'Learn ethical hacking techniques in a controlled lab environment. Certificates provided upon completion.',
    attendee_count: 60,
    color: 'from-blue-800 to-slate-900',
  },
];

const TYPE_BADGES: Record<string, string> = {
  hackathon: 'bg-purple-100 text-purple-700',
  conference: 'bg-blue-100 text-blue-800',
  bootcamp: 'bg-orange-100 text-orange-700',
  demo_day: 'bg-blue-100 text-blue-800',
  meetup: 'bg-pink-100 text-pink-700',
  workshop: 'bg-green-100 text-green-700',
};

const TYPE_LABELS: Record<string, string> = {
  hackathon: 'Hackathon',
  conference: 'Conference',
  bootcamp: 'Bootcamp',
  demo_day: 'Demo Day',
  meetup: 'Meetup',
  workshop: 'Workshop',
};

const FEATURES = [
  {
    icon: Zap,
    title: 'Instant Setup',
    desc: 'Create and publish any event type in minutes. No complex config, no overhead.',
  },
  {
    icon: Users,
    title: 'Staff & Roles',
    desc: 'Invite co-organizers, assign staff roles, and manage registrations from one dashboard.',
  },
  {
    icon: Shield,
    title: 'Live Q&A',
    desc: 'Built-in Q&A with upvoting so the best questions surface — moderated by your team.',
  },
  {
    icon: Globe,
    title: 'Any Format',
    desc: 'Hackathons, conferences, bootcamps, meetups, competitions — all supported natively.',
  },
];

const STATS = [
  { value: '2,400+', label: 'Events hosted' },
  { value: '180K+', label: 'Attendees managed' },
  { value: '94', label: 'Countries' },
  { value: '99.9%', label: 'Uptime' },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 text-white py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block bg-blue-700/40 border border-blue-600/50 text-blue-200 text-xs font-semibold px-3 py-1 rounded-full mb-6 tracking-wide uppercase">
            Event Management Platform
          </span>
          <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight mb-6">
            Manage any event,
            <br />
            <span className="text-blue-300">all in one place.</span>
          </h1>
          <p className="text-xl text-blue-200 mb-10 max-w-2xl mx-auto">
            Hackathons, conferences, bootcamps, meetups — create, manage, and grow your community events with EventHub.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/events"
              className="flex items-center justify-center gap-2 bg-white text-blue-900 px-7 py-3.5 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
            >
              Browse Events <ArrowRight size={16} />
            </Link>
            <Link
              href="/register"
              className="flex items-center justify-center gap-2 border border-blue-500 text-white px-7 py-3.5 rounded-xl font-semibold hover:bg-blue-800/50 transition-colors"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-blue-900 text-white py-10 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {STATS.map(s => (
            <div key={s.label}>
              <div className="text-3xl font-extrabold text-blue-200">{s.value}</div>
              <div className="text-sm text-blue-400 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Events */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Upcoming Events</h2>
              <p className="text-gray-500 text-sm mt-1">Discover what's happening near you</p>
            </div>
            <Link href="/events" className="text-sm text-blue-800 font-medium hover:underline flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SAMPLE_EVENTS.map(event => (
              <div key={event.event_id} className="bg-white rounded-2xl border hover:shadow-lg transition-shadow overflow-hidden">
                <div className={`h-36 bg-gradient-to-br ${event.color} flex items-end p-4`}>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${TYPE_BADGES[event.type] || 'bg-gray-100 text-gray-700'}`}>
                    {TYPE_LABELS[event.type] || event.type}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{event.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4">{event.description}</p>
                  <div className="flex flex-col gap-1.5 text-xs text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={12} className="text-blue-700" />
                      {format(new Date(event.date), 'MMM d, yyyy · HH:mm')}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin size={12} className="text-blue-700" /> {event.location}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users size={12} className="text-blue-700" /> {event.attendee_count} registered
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Everything you need to run great events</h2>
            <p className="text-gray-500">Powerful tools that stay out of your way.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(f => (
              <div key={f.title} className="p-5 rounded-2xl bg-blue-50 border border-blue-100">
                <div className="w-10 h-10 rounded-xl bg-blue-800 flex items-center justify-center mb-4">
                  <f.icon size={18} className="text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
                <p className="text-sm text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-800 py-16 px-4 text-white text-center">
        <h2 className="text-3xl font-bold mb-3">Ready to host your next event?</h2>
        <p className="text-blue-200 mb-8 max-w-xl mx-auto">
          Join thousands of organizers who trust EventHub to run their events smoothly.
        </p>
        <Link
          href="/register"
          className="inline-flex items-center gap-2 bg-white text-blue-900 px-8 py-3.5 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
        >
          Create free account <ArrowRight size={16} />
        </Link>
      </section>
    </div>
  );
}
