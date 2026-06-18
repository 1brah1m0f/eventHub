'use client';
import Link from 'next/link';
import { Calendar, Users, MessageSquare, Layers, ArrowRight, CheckCircle, Sparkles } from 'lucide-react';
import { Reveal } from '@/components/Reveal';
import { useT, EVENT_TYPE_VALUES } from '@/lib/i18n';

export function HomeContent() {
  const t = useT();

  const FEATURES = [
    { icon: Layers, title: t('homeFeature1Title'), desc: t('homeFeature1Desc') },
    { icon: Users, title: t('homeFeature2Title'), desc: t('homeFeature2Desc') },
    { icon: MessageSquare, title: t('homeFeature3Title'), desc: t('homeFeature3Desc') },
    { icon: Calendar, title: t('homeFeature4Title'), desc: t('homeFeature4Desc') },
  ];

  const STEPS = [
    { num: '01', title: t('step1Title'), desc: t('step1Desc') },
    { num: '02', title: t('step2Title'), desc: t('step2Desc') },
    { num: '03', title: t('step3Title'), desc: t('step3Desc') },
  ];

  const FLEXIBLE_ITEMS = [
    t('flexibleItem1'),
    t('flexibleItem2'),
    t('flexibleItem3'),
    t('flexibleItem4'),
  ];

  const typeLabels = EVENT_TYPE_VALUES.map((value) => t(`eventType_${value}` as Parameters<typeof t>[0]));

  return (
    <>
      <section className="relative min-h-[100dvh] flex items-center px-4 py-24 text-white">
        <div className="absolute inset-0 animate-gradient bg-gradient-to-br from-indigo-950 via-violet-900 to-indigo-900" />
        <div className="absolute -top-32 -left-24 w-[34rem] h-[34rem] rounded-full bg-violet-600/30 blur-3xl animate-float pointer-events-none" />
        <div className="absolute top-1/3 -right-32 w-[30rem] h-[30rem] rounded-full bg-fuchsia-500/20 blur-3xl animate-float-2 pointer-events-none" />
        <div className="absolute -bottom-40 left-1/3 w-[28rem] h-[28rem] rounded-full bg-amber-400/15 blur-3xl animate-float pointer-events-none" />
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
                {t('homeBadge')}
              </span>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="text-5xl sm:text-6xl xl:text-7xl font-bold leading-[1.05] tracking-tight mb-6">
                {t('homeTitle1')}
                <br />
                <span className="text-gradient">{t('homeTitle2')}</span>
              </h1>
            </Reveal>
            <Reveal delay={160}>
              <p className="text-lg text-violet-200/90 mb-9 max-w-lg leading-relaxed">
                {t('homeDesc')}
              </p>
            </Reveal>
            <Reveal delay={240}>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/register"
                  className="group flex items-center justify-center gap-2 bg-amber-400 text-indigo-950 px-6 py-3.5 rounded-xl font-semibold shadow-lg shadow-amber-400/25 hover:shadow-amber-400/40 hover:bg-amber-300 hover:-translate-y-0.5 transition-all duration-300"
                >
                  {t('getStartedFree')}
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 border border-white/20 bg-white/5 backdrop-blur text-white px-6 py-3.5 rounded-xl font-semibold hover:bg-white/10 hover:border-white/30 transition-all duration-300"
                >
                  {t('signIn')}
                </Link>
              </div>
            </Reveal>
          </div>

          <Reveal delay={300} className="hidden lg:block">
            <div className="grid grid-cols-2 gap-3">
              {typeLabels.map((type, i) => (
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

      <div className="bg-indigo-950 border-y border-white/5 py-4 overflow-hidden">
        <div className="flex w-max animate-marquee gap-3">
          {[...typeLabels, ...typeLabels].map((type, i) => (
            <span
              key={i}
              className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-medium text-violet-200 whitespace-nowrap"
            >
              {type}
            </span>
          ))}
        </div>
      </div>

      <section className="py-24 px-4 bg-gradient-to-b from-indigo-50/60 to-white">
        <div className="max-w-6xl mx-auto">
          <Reveal className="mb-14">
            <span className="text-sm font-semibold uppercase tracking-wider text-violet-600">{t('featuresLabel')}</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2 mb-3">{t('featuresTitle')}</h2>
            <p className="text-gray-500 max-w-xl text-lg">{t('featuresDesc')}</p>
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

      <section className="py-24 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <Reveal className="mb-14">
            <span className="text-sm font-semibold uppercase tracking-wider text-violet-600">{t('workflowLabel')}</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2 mb-3">{t('howItWorks')}</h2>
            <p className="text-gray-500 text-lg">{t('howItWorksDesc')}</p>
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

      <section className="py-24 px-4 bg-gradient-to-b from-white to-indigo-50/60">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <Reveal>
              <span className="text-sm font-semibold uppercase tracking-wider text-violet-600">{t('flexibleLabel')}</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2 mb-4">{t('flexibleTitle')}</h2>
              <p className="text-gray-500 mb-7 leading-relaxed text-lg">{t('flexibleDesc')}</p>
              <ul className="space-y-3">
                {FLEXIBLE_ITEMS.map((item) => (
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
                {typeLabels.slice(0, 6).map((type, i) => (
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

      <section className="relative py-28 px-4 text-white text-center overflow-hidden">
        <div className="absolute inset-0 animate-gradient bg-gradient-to-br from-indigo-950 via-violet-900 to-indigo-950" />
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-amber-400/15 blur-3xl animate-float pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-fuchsia-500/20 blur-3xl animate-float-2 pointer-events-none" />
        <Reveal className="relative max-w-2xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold mb-5">
            {t('ctaTitle')}
          </h2>
          <p className="text-violet-200/90 mb-9 text-lg">{t('ctaDesc')}</p>
          <Link
            href="/register"
            className="group inline-flex items-center gap-2 bg-amber-400 text-indigo-950 px-8 py-4 rounded-xl font-semibold shadow-xl shadow-amber-400/25 hover:shadow-amber-400/40 hover:bg-amber-300 hover:-translate-y-0.5 transition-all duration-300 text-base"
          >
            {t('createFreeAccount')}
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </Reveal>
      </section>
    </>
  );
}
