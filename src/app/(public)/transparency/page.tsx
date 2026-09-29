'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  TrendingUp,
  CheckCircle2,
  Clock,
  Shield,
  Download,
  Building,
  Sparkles,
  ArrowRight,
  Layers,
  MapPin,
  Loader2,
  Award,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export default function TransparencyPage() {
  const [city, setCity] = useState('Pokhara');
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/analytics/public?city=${city}`)
      .then((res) => res.json())
      .then((resData) => {
        if (!resData.error) setData(resData);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [city]);

  const summary = data?.summary || {
    totalIssues: 0,
    resolvedIssues: 0,
    inProgressIssues: 0,
    verifiedIssues: 0,
    totalConfirmations: 0,
    resolutionRate: 0,
    avgResolutionDays: 4.8,
  };

  const monthlyTrends = data?.monthlyTrends || [];
  const categoryStats = data?.categoryStats || [];
  const wardLeaderboard = data?.wardLeaderboard || [];

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 bg-slate-50/50">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 mb-2">
              <Shield className="w-3.5 h-3.5 text-emerald-600" /> Public Accountability Portal
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Civic Transparency & Open Metrics
            </h1>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              Publicly verifiable reporting on municipal infrastructure response times, resolution rates, and community verification across Nepal.
            </p>
          </div>

          {/* City Selector */}
          <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-1">
            <button
              onClick={() => setCity('Pokhara')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                city === 'Pokhara'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Pokhara Metro
            </button>
            <button
              onClick={() => setCity('Kathmandu')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                city === 'Kathmandu'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Kathmandu Metro
            </button>
          </div>
        </div>

        {/* Executive KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Total Community Reports
            </span>
            <h3 className="text-3xl font-black text-slate-900">{summary.totalIssues}</h3>
            <p className="text-xs text-slate-500 mt-1">Logged across all municipal wards</p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Verified Resolutions
            </span>
            <h3 className="text-3xl font-black text-emerald-600">{summary.resolvedIssues}</h3>
            <p className="text-xs text-slate-500 mt-1">With photo evidence verified by neighbors</p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Overall Resolution Rate
            </span>
            <h3 className="text-3xl font-black text-indigo-600">{summary.resolutionRate}%</h3>
            <p className="text-xs text-slate-500 mt-1">Ratio of completed fixes to active reports</p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Average Fix Speed
            </span>
            <h3 className="text-3xl font-black text-slate-900">{summary.avgResolutionDays} Days</h3>
            <p className="text-xs text-slate-500 mt-1">From community verification to field resolution</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Monthly Trends (Area Chart) */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs">
            <div className="mb-4">
              <h3 className="font-bold text-base text-slate-900">Resolution Trend Analysis</h3>
              <p className="text-xs text-slate-500">Comparison of monthly reported issues vs confirmed fixes</p>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorReported" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="reported"
                    name="Reported"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorReported)"
                  />
                  <Area
                    type="monotone"
                    dataKey="resolved"
                    name="Resolved"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorResolved)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-center gap-6 text-xs font-semibold text-slate-600 mt-3">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-indigo-600" /> Issues Reported
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500" /> Resolved & Verified
              </span>
            </div>
          </div>

          {/* Sector Resolution Performance (Bar Chart) */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs">
            <div className="mb-4">
              <h3 className="font-bold text-base text-slate-900">Sector Resolution Rate</h3>
              <p className="text-xs text-slate-500">Percentage of complaints resolved by municipal category</p>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryStats} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-25} textAnchor="end" />
                  <YAxis tick={{ fontSize: 11 }} unit="%" />
                  <Tooltip />
                  <Bar dataKey="rate" name="Resolution %" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Ward Accountability Leaderboard Table */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-600" />
                Ward Response Leaderboard ({city})
              </h3>
              <p className="text-xs text-slate-500">Ranked by municipal repair completion speed and citizen satisfaction</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-3">Rank</th>
                  <th className="pb-3">Ward</th>
                  <th className="pb-3">Total Issues</th>
                  <th className="pb-3">Verified Fixes</th>
                  <th className="pb-3">Resolution Rate</th>
                  <th className="pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {wardLeaderboard.map((w: any, idx: number) => (
                  <tr key={w.ward} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 font-bold text-slate-400">#{idx + 1}</td>
                    <td className="py-3.5 font-bold text-slate-900">{w.ward}</td>
                    <td className="py-3.5 font-semibold text-slate-700">{w.total}</td>
                    <td className="py-3.5 font-semibold text-emerald-700">{w.resolved}</td>
                    <td className="py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${w.rate}%` }}
                          />
                        </div>
                        <span className="font-bold text-slate-800">{w.rate}%</span>
                      </div>
                    </td>
                    <td className="py-3.5 text-right">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Active Monitoring
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Zero-PII Public Transparency Guarantee */}
        <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-indigo-400" /> Zero-PII Open Civic Data Standard
            </span>
            <h3 className="text-xl font-bold">Privacy-Preserving Public Transparency</h3>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Civora aggregated reports, charts, and public maps undergo anonymization. Citizen names, phone numbers, email addresses, and private residences are strictly shielded from public export.
            </p>
          </div>

          <Link
            href="/explore"
            className="px-5 py-2.5 rounded-xl bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 transition-colors shadow flex items-center gap-2 whitespace-nowrap"
          >
            Explore Public Records <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
