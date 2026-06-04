import Link from 'next/link';
import { Calendar, Users, MessageSquare, Layers, ArrowRight, CheckCircle } from 'lucide-react';

const FEATURES = [
  {
    icon: Layers,
    title: 'Any event type',
    desc: 'Hackathons, conferences, bootcamps, meetups, workshops, competitions — all supported with type-specific fields.',
  },
  {
    icon: Users,
    title: 'Staff and roles',
    desc: 'Invite co-organizers, assign staff roles, manage registrations, and track attendees from one place.',
  },
  {
    icon: MessageSquare,
    title: 'Live Q&A',
    desc: 'Built-in Q&A with audience upvoting so the best questions surface. Moderated by your team.',
  },
  {
    icon: Calendar,
    title: 'Full event lifecycle',
    desc: 'Draft, publish, manage, and wrap up events. Agenda, resources, and custom fields all included.',
  },
];

const STEPS = [
  { num: '01', title: 'Create your event', desc: 'Choose a type, fill in details, add a cover image. Publish when ready.' },
  { num: '02', title: 'Invite your team', desc: 'Add co-organizers and staff. Each person gets the right level of access.' },
  { num: '03', title: 'Manage on the day', desc: 'Handle registrations, run Q&A, track attendees — all in real time.' },
];

const TYPES = ['Hackathon', 'Conference', 'Bootcamp', 'Meetup', 'Workshop', 'Demo Day', 'Competition', 'Seminar', 'Networking', 'Summit'];

export default function HomePage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="min-h-[100dvh] bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900 text-white flex items-center px-4 py-20">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl sm:text-6xl font-bold leading-tight tracking-tight mb-6">
              Run great events,<br />
              <span className="text-blue-300">start to finish.</span>
            </h1>
            <p className="text-lg text-blue-200 mb-8 max-w-lg leading-relaxed">
              EventHub gives organizers everything they need to create, manage, and grow community events — hackathons, conferences, meetups, and more.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/register"
                className="flex items-center justify-center gap-2 bg-white text-blue-900 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                Get started free <ArrowRight size={16} />
              </Link>
              <Link
                href="/events"
                className="flex items-center justify-center gap-2 border border-blue-600 text-blue-200 px-6 py-3 rounded-lg font-semibold hover:bg-blue-800/50 transition-colors"
              >
                Browse events
              </Link>
            </div>
          </div>

          {/* Event type grid */}
          <div className="hidden lg:grid grid-cols-2 gap-3">
            {TYPES.map((type, i) => (
              <div
                key={type}
                className={`rounded-xl px-4 py-3 text-sm font-medium border transition-all ${
                  i % 3 === 0
                    ? 'bg-blue-800/60 border-blue-700/50 text-white'
                    : i % 3 === 1
                    ? 'bg-blue-900/40 border-blue-800/40 text-blue-200'
                    : 'bg-slate-800/50 border-slate-700/40 text-blue-300'
                }`}
              >
                {type}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Everything you need to run events</h2>
            <p className="text-gray-500 max-w-xl">Powerful tools that stay out of your way. No bloat, no complex setup.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(f => (
              <div key={f.title} className="bg-white rounded-xl border p-5 hover:shadow-sm transition-shadow">
                <div className="w-10 h-10 rounded-lg bg-blue-900 flex items-center justify-center mb-4">
                  <f.icon size={18} className="text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">How it works</h2>
            <p className="text-gray-500">From idea to live event in minutes.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map(s => (
              <div key={s.num} className="flex gap-5">
                <div className="text-4xl font-extrabold text-blue-100 leading-none select-none">{s.num}</div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{s.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What you can manage */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Built for every type of tech event</h2>
              <p className="text-gray-500 mb-6 leading-relaxed">
                EventHub adapts to your event format. Hackathons get team management and leaderboards. Conferences get speaker sessions and sponsors. Meetups get RSVPs and maps.
              </p>
              <ul className="space-y-2">
                {['Type-specific custom fields', 'Attendee roles: participant, mentor, jury, speaker', 'Team formation for hackathons and competitions', 'Draft and publish workflow'].map(item => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-gray-700">
                    <CheckCircle size={16} className="text-blue-700 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {TYPES.slice(0, 6).map((type, i) => (
                <div key={type} className={`rounded-lg px-4 py-3 text-sm font-medium text-center border ${
                  i === 0 ? 'bg-blue-900 text-white border-blue-800' : 'bg-white text-gray-700 border-gray-200'
                }`}>
                  {type}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-blue-950 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold mb-4">Ready to run your next event?</h2>
          <p className="text-blue-300 mb-8 text-lg">
            Create an account, set up your event, and go live in minutes.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-white text-blue-900 px-8 py-3.5 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-base"
          >
            Create free account <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
