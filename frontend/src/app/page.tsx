import Link from 'next/link';
import { Calendar, Users, MessageSquare, Layers, ArrowRight, CheckCircle, Sparkles } from 'lucide-react';
import { LandingRedirect } from '@/components/LandingRedirect';
import { Reveal } from '@/components/Reveal';

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
    <div className="bg-white overflow-hidden">
      <LandingRedirect />

      {/* ── Hero ── */}
      <section className="relative min-h-[100dvh] flex items-center px-4 py-24 text-white">
        {/* animated gradient base */}
        <div className="absolute inset-0 animate-gradient bg-gradient-to-br from-indigo-950 via-violet-900 to-indigo-900" />
        {/* floating orbs */}
        <div className="absolute -top-32 -left-24 w-[34rem] h-[34rem] rounded-full bg-violet-600/30 blur-3xl animate-float pointer-events-none" />
        <div className="absolute top-1/3 -right-32 w-[30rem] h-[30rem] rounded-full bg-fuchsia-500/20 blur-3xl animate-float-2 pointer-events-none" />
        <div className="absolute -bottom-40 left-1/3 w-[28rem] h-[28rem] rounded-full bg-amber-400/15 blur-3xl animate-float pointer-events-none" />
        {/* subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
            backgroundSize: '64px 64px',
            maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 75%)',
          }}
        />

        <div className="relative max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <Reveal>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 backdrop-blur px-3.5 py-1.5 text-xs font-medium text-violet-200 mb-6">
                <Sparkles size={13} className="text-amber-300" />
                One platform for every community event
              </span>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="text-5xl sm:text-6xl xl:text-7xl font-bold leading-[1.05] tracking-tight mb-6">
                Run great events,
                <br />
                <span className="text-gradient">start to finish.</span>
              </h1>
            </Reveal>
            <Reveal delay={160}>
              <p className="text-lg text-violet-200/90 mb-9 max-w-lg leading-relaxed">
                EventHub gives organizers everything they need to create, manage, and grow community events — hackathons, conferences, meetups, and more.
              </p>
            </Reveal>
            <Reveal delay={240}>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/register"
                  className="group flex items-center justify-center gap-2 bg-amber-400 text-indigo-950 px-6 py-3.5 rounded-xl font-semibold shadow-lg shadow-amber-400/25 hover:shadow-amber-400/40 hover:bg-amber-300 hover:-translate-y-0.5 transition-all duration-300"
                >
                  Get started free
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 border border-white/20 bg-white/5 backdrop-blur text-white px-6 py-3.5 rounded-xl font-semibold hover:bg-white/10 hover:border-white/30 transition-all duration-300"
                >
                  Sign in
                </Link>
              </div>
            </Reveal>
          </div>

          {/* Event type grid */}
          <Reveal delay={300} className="hidden lg:block">
            <div className="grid grid-cols-2 gap-3">
              {TYPES.map((type, i) => (
                <div
                  key={type}
                  className={`rounded-2xl px-4 py-4 text-sm font-medium border backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:scale-[1.03] ${
                    i % 3 === 0
                      ? 'bg-violet-500/20 border-violet-400/30 text-white hover:bg-violet-500/30'
                      : i % 3 === 1
                      ? 'bg-white/5 border-white/15 text-violet-100 hover:bg-white/10'
                      : 'bg-amber-400/10 border-amber-300/20 text-amber-100 hover:bg-amber-400/20'
                  }`}
                >
                  {type}
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Marquee ribbon ── */}
      <div className="bg-indigo-950 border-y border-white/5 py-4 overflow-hidden">
        <div className="flex w-max animate-marquee gap-3">
          {[...TYPES, ...TYPES].map((type, i) => (
            <span
              key={i}
              className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-medium text-violet-200 whitespace-nowrap"
            >
              {type}
            </span>
          ))}
        </div>
      </div>

      {/* ── Features ── */}
      <section className="py-24 px-4 bg-gradient-to-b from-indigo-50/60 to-white">
        <div className="max-w-6xl mx-auto">
          <Reveal className="mb-14">
            <span className="text-sm font-semibold uppercase tracking-wider text-violet-600">Features</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2 mb-3">Everything you need to run events</h2>
            <p className="text-gray-500 max-w-xl text-lg">Powerful tools that stay out of your way. No bloat, no complex setup.</p>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 90}>
                <div className="group h-full bg-white rounded-2xl border border-gray-100 p-6 hover:border-violet-200 hover:shadow-xl hover:shadow-violet-100/60 hover:-translate-y-1.5 transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center mb-5 shadow-lg shadow-violet-500/20 group-hover:scale-110 transition-transform duration-300">
                    <f.icon size={20} className="text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 text-lg">{f.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <Reveal className="mb-14">
            <span className="text-sm font-semibold uppercase tracking-wider text-violet-600">Workflow</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2 mb-3">How it works</h2>
            <p className="text-gray-500 text-lg">From idea to live event in minutes.</p>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((s, i) => (
              <Reveal key={s.num} delay={i * 120}>
                <div className="relative flex gap-5 rounded-2xl border border-gray-100 p-6 hover:border-violet-200 hover:shadow-lg hover:shadow-violet-100/50 transition-all duration-300">
                  <div className="text-5xl font-extrabold leading-none select-none bg-gradient-to-br from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                    {s.num}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1.5">{s.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── What you can manage ── */}
      <section className="py-24 px-4 bg-gradient-to-b from-white to-indigo-50/60">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <Reveal>
              <span className="text-sm font-semibold uppercase tracking-wider text-violet-600">Flexible</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2 mb-4">Built for every type of tech event</h2>
              <p className="text-gray-500 mb-7 leading-relaxed text-lg">
                EventHub adapts to your event format. Hackathons get team management and leaderboards. Conferences get speaker sessions and sponsors. Meetups get RSVPs and maps.
              </p>
              <ul className="space-y-3">
                {['Type-specific custom fields', 'Attendee roles: participant, mentor, jury, speaker', 'Team formation for hackathons and competitions', 'Draft and publish workflow'].map(item => (
                  <li key={item} className="flex items-center gap-3 text-sm text-gray-700">
                    <span className="w-5 h-5 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                      <CheckCircle size={13} className="text-violet-600" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={150}>
              <div className="grid grid-cols-2 gap-3">
                {TYPES.slice(0, 6).map((type, i) => (
                  <div
                    key={type}
                    className={`rounded-xl px-4 py-4 text-sm font-medium text-center border transition-all duration-300 hover:-translate-y-1 ${
                      i === 0
                        ? 'bg-gradient-to-br from-violet-600 to-indigo-700 text-white border-transparent shadow-lg shadow-violet-500/25'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-violet-300 hover:shadow-md'
                    }`}
                  >
                    {type}
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative py-28 px-4 text-white text-center overflow-hidden">
        <div className="absolute inset-0 animate-gradient bg-gradient-to-br from-indigo-950 via-violet-900 to-indigo-950" />
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-amber-400/15 blur-3xl animate-float pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-fuchsia-500/20 blur-3xl animate-float-2 pointer-events-none" />
        <Reveal className="relative max-w-2xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold mb-5">
            Ready to run your <span className="text-gradient">next event?</span>
          </h2>
          <p className="text-violet-200/90 mb-9 text-lg">
            Create an account, set up your event, and go live in minutes.
          </p>
          <Link
            href="/register"
            className="group inline-flex items-center gap-2 bg-amber-400 text-indigo-950 px-8 py-4 rounded-xl font-semibold shadow-xl shadow-amber-400/25 hover:shadow-amber-400/40 hover:bg-amber-300 hover:-translate-y-0.5 transition-all duration-300 text-base"
          >
            Create free account
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </Reveal>
      </section>
    </div>
  );
}
