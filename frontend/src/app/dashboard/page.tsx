'use client';
import { useDashboard } from '@/hooks/useDashboard';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { format } from 'date-fns';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { TrendingUp, Users, Calendar, Award, Star, Clock, Tag } from 'lucide-react';

const TYPE_COLORS: Record<string, string> = {
  hackathon: '#7c3aed',
  conference: '#1d4ed8',
  workshop: '#059669',
  bootcamp: '#ea580c',
  meetup: '#db2777',
  networking: '#ca8a04',
  competition: '#dc2626',
  demo_day: '#4f46e5',
  seminar: '#0d9488',
  summit: '#0891b2',
  course: '#16a34a',
};

const PIE_COLORS = ['#1d4ed8', '#7c3aed', '#059669', '#ea580c', '#db2777', '#ca8a04', '#dc2626', '#4f46e5'];

function StatCard({ label, value, sub, icon: Icon, accent }: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; accent: string;
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</span>
        <span className={`p-1.5 rounded-lg ${accent}`}>
          <Icon size={15} />
        </span>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-gray-700 mb-4">{title}</h2>
      {children}
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const { data, isLoading } = useDashboard();

  useEffect(() => {
    if (!user) router.push('/login');
  }, [user]);

  if (!user) return null;

  if (isLoading) return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-4 animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-gray-100 rounded-xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 h-64 bg-gray-100 rounded-xl" />
        <div className="h-64 bg-gray-100 rounded-xl" />
      </div>
    </div>
  );

  if (!data) return null;

  const { overview, monthly_registrations, event_comparison, category_breakdown, trends } = data;

  const growthSign = overview.growth_12m >= 0 ? '+' : '';
  const growthColor = overview.growth_12m >= 0 ? 'text-emerald-600' : 'text-red-500';

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-400 mt-0.5">Your event analytics</p>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Events"
          value={overview.total_events}
          icon={Calendar}
          accent="bg-violet-50 text-violet-700"
        />
        <StatCard
          label="Total Registrations"
          value={overview.total_registrations.toLocaleString()}
          icon={Users}
          accent="bg-violet-50 text-violet-700"
        />
        <StatCard
          label="12-Month Growth"
          value={`${growthSign}${overview.growth_12m}%`}
          sub="vs previous 12 months"
          icon={TrendingUp}
          accent={overview.growth_12m >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-500'}
        />
        <StatCard
          label="Avg per Event"
          value={overview.total_events ? Math.round(overview.total_registrations / overview.total_events) : 0}
          sub="registrations"
          icon={Award}
          accent="bg-orange-50 text-orange-700"
        />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Section title="Registrations Over Time (last 12 months)">
          <div className="lg:col-span-2" style={{ height: 220 }}>
            {monthly_registrations.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthly_registrations} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                    formatter={(v: any) => [v, 'Registrations']}
                  />
                  <Line type="monotone" dataKey="count" stroke="#1d4ed8" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-gray-400">No registration data yet</div>
            )}
          </div>
        </Section>

        <Section title="By Event Type">
          <div style={{ height: 220 }}>
            {category_breakdown.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={category_breakdown}
                    dataKey="registration_count"
                    nameKey="type"
                    cx="50%" cy="50%"
                    innerRadius={50} outerRadius={80}
                    paddingAngle={2}
                  >
                    {category_breakdown.map((_: any, i: number) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                    formatter={(v: any, _: any, p: any) => [v, p.payload.type]}
                  />
                  <Legend
                    formatter={(value: any, entry: any) => (
                      <span style={{ fontSize: 11 }}>{entry.payload.type}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-gray-400">No data</div>
            )}
          </div>
        </Section>
      </div>

      {/* Event comparison bar chart */}
      {event_comparison.length > 0 && (
        <Section title="Event Comparison — Registrations">
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={event_comparison}
                margin={{ top: 4, right: 8, left: -20, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis
                  dataKey="title"
                  tick={{ fontSize: 11 }}
                  angle={-30}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                  formatter={(v: any) => [v, 'Registrations']}
                />
                <Bar dataKey="registrations" radius={[4, 4, 0, 0]}>
                  {event_comparison.map((e: any, i: number) => (
                    <Cell key={i} fill={TYPE_COLORS[e.type] || '#1d4ed8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Section>
      )}

      {/* Event comparison table + trends */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <Section title="Event Comparison">
            {event_comparison.length ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                      <th className="pb-2 pr-3 font-medium">Event</th>
                      <th className="pb-2 pr-3 font-medium text-right">Registrations</th>
                      <th className="pb-2 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {event_comparison.map((e: any) => (
                      <tr key={e.event_id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                        <td className="py-2.5 pr-3">
                          <div className="font-medium text-gray-900 truncate max-w-[200px]">{e.title}</div>
                          <div className="text-xs text-gray-400 mt-0.5">{e.type}</div>
                        </td>
                        <td className="py-2.5 pr-3 text-right font-semibold text-gray-900">{e.registrations.toLocaleString()}</td>
                        <td className="py-2.5 text-xs text-gray-400">
                          {e.date ? format(new Date(e.date), 'MMM d, yyyy') : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-6">No events yet</p>
            )}
          </Section>
        </div>

        <Section title="Trend Analysis">
          <div className="space-y-4">
            {trends.best_event && (
              <div className="flex gap-3 items-start">
                <span className="p-1.5 bg-yellow-50 text-yellow-600 rounded-lg shrink-0"><Star size={14} /></span>
                <div>
                  <p className="text-xs text-gray-400">Top event</p>
                  <p className="text-sm font-medium text-gray-900 mt-0.5">{trends.best_event.title}</p>
                  <p className="text-xs text-gray-500">{trends.best_event.registrations} registrations</p>
                </div>
              </div>
            )}
            {trends.best_month && (
              <div className="flex gap-3 items-start">
                <span className="p-1.5 bg-violet-50 text-violet-700 rounded-lg shrink-0"><Calendar size={14} /></span>
                <div>
                  <p className="text-xs text-gray-400">Most active month</p>
                  <p className="text-sm font-medium text-gray-900 mt-0.5">{trends.best_month.label}</p>
                  <p className="text-xs text-gray-500">{trends.best_month.count} registrations</p>
                </div>
              </div>
            )}
            {trends.best_type && (
              <div className="flex gap-3 items-start">
                <span className="p-1.5 bg-violet-50 text-violet-700 rounded-lg shrink-0"><Tag size={14} /></span>
                <div>
                  <p className="text-xs text-gray-400">Top category</p>
                  <p className="text-sm font-medium text-gray-900 mt-0.5 capitalize">{trends.best_type.type}</p>
                  <p className="text-xs text-gray-500">{trends.best_type.registrations} registrations</p>
                </div>
              </div>
            )}
            {trends.best_day && (
              <div className="flex gap-3 items-start">
                <span className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg shrink-0"><Clock size={14} /></span>
                <div>
                  <p className="text-xs text-gray-400">Busiest day</p>
                  <p className="text-sm font-medium text-gray-900 mt-0.5">{trends.best_day}</p>
                </div>
              </div>
            )}
            {!trends.best_event && !trends.best_month && (
              <p className="text-sm text-gray-400 text-center py-4">No trends yet</p>
            )}
          </div>
        </Section>
      </div>
    </div>
  );
}
