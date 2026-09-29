'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  Building2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Users,
  Settings,
  ShieldAlert,
  ArrowRight,
  Filter,
  BarChart3,
  Layers,
  ChevronRight,
  ExternalLink,
  Loader2,
  Sparkles,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';

interface OrgDashboardProps {
  params: Promise<{ orgSlug: string }>;
}

export default function OrgDashboardPage({ params }: OrgDashboardProps) {
  const { orgSlug } = use(params);

  const [stats, setStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/org/${orgSlug}/stats`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) setStats(data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [orgSlug]);

  const handleQuickStatusChange = async (issueId: string, newStatus: string) => {
    setUpdatingId(issueId);
    try {
      const res = await fetch(`/api/org/${orgSlug}/issues/${issueId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setStats((prev: any) => ({
          ...prev,
          recentIssues: prev.recentIssues.map((i: any) =>
            i.id === issueId ? { ...i, status: newStatus } : i
          ),
        }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
        <p className="text-sm font-semibold text-slate-600">Loading Municipality Console...</p>
      </div>
    );
  }

  const kpis = stats?.kpis || { totalIssues: 0, criticalIssues: 0, resolvedIssues: 0, inProgressIssues: 0, resolutionRate: 0 };
  const org = stats?.organization || { name: 'Municipality', slug: orgSlug, city: 'Pokhara' };
  const categoryData = stats?.categoryStats || [];
  const statusData = stats?.statusStats || [];

  const PIE_COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Top Console Navigation & Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border shadow-sm" style={{ borderColor: 'var(--border-color)' }}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-sm font-black text-xl">
              {org.name?.charAt(0) || 'M'}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black text-slate-900">{org.name}</h1>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {org.subscription?.plan?.name || 'Professional'} Tier
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Civil Infrastructure & Municipal Service Dashboard • {org.city}, Nepal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/org/${orgSlug}/departments`}
              className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors"
            >
              Departments ({org.departmentsCount || 0})
            </Link>
            <Link
              href={`/org/${orgSlug}/issues`}
              className="px-4 py-2 rounded-xl gradient-primary text-white font-semibold text-xs shadow-md hover:shadow-lg transition-all"
            >
              Issue Management Table
            </Link>
          </div>
        </div>

        {/* Subnav links */}
        <div className="flex items-center gap-6 pt-4 text-xs font-semibold">
          <Link href={`/org/${orgSlug}`} className="text-indigo-600 border-b-2 border-indigo-600 pb-2">
            Overview Analytics
          </Link>
          <Link href={`/org/${orgSlug}/issues`} className="text-slate-500 hover:text-slate-900 pb-2">
            Dispatch Queue
          </Link>
          <Link href={`/org/${orgSlug}/departments`} className="text-slate-500 hover:text-slate-900 pb-2">
            Departments & Teams
          </Link>
          <Link href={`/org/${orgSlug}/settings`} className="text-slate-500 hover:text-slate-900 pb-2">
            Subscription & Settings
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-3xl p-6 border shadow-sm" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Reports</span>
            <Layers className="w-5 h-5 text-indigo-500" />
          </div>
          <h3 className="text-3xl font-black text-slate-900">{kpis.totalIssues}</h3>
          <p className="text-xs text-slate-500 mt-1">Managed across all municipal wards</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border shadow-sm" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Critical Hazards</span>
            <ShieldAlert className="w-5 h-5 text-rose-500" />
          </div>
          <h3 className="text-3xl font-black text-rose-600">{kpis.criticalIssues}</h3>
          <p className="text-xs text-slate-500 mt-1">Priority score ≥ 80 or Emergency flagged</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border shadow-sm" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Active In-Progress</span>
            <Clock className="w-5 h-5 text-sky-500" />
          </div>
          <h3 className="text-3xl font-black text-sky-600">{kpis.inProgressIssues}</h3>
          <p className="text-xs text-slate-500 mt-1">Assigned to field maintenance teams</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border shadow-sm" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Resolution Rate</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <h3 className="text-3xl font-black text-emerald-600">{kpis.resolutionRate}%</h3>
          <p className="text-xs text-slate-500 mt-1">{kpis.resolvedIssues} verified repairs closed</p>
        </div>
      </div>

      {/* Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Breakdown (Bar Chart) */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border shadow-sm" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900">Issues by Category</h3>
              <p className="text-xs text-slate-500">Distribution of civic complaints across municipal sectors</p>
            </div>
          </div>

          <div className="h-64 w-full">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-25} textAnchor="end" />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#6366f1" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No categorical data available yet
              </div>
            )}
          </div>
        </div>

        {/* Status Funnel (Donut Chart) */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border shadow-sm" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900">Lifecycle Status Breakdown</h3>
              <p className="text-xs text-slate-500">Real-time status of pipeline issues</p>
            </div>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {statusData.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-400">No status data available</div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-600 mt-2">
            {statusData.map((st: any, i: number) => (
              <span key={st.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                {st.name} ({st.count})
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Immediate Dispatch Queue (Top Urgent Issues) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border shadow-sm" style={{ borderColor: 'var(--border-color)' }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-lg text-slate-900">Immediate Action Dispatch Queue</h3>
            <p className="text-xs text-slate-500">Highest priority issues requiring municipal intervention</p>
          </div>
          <Link
            href={`/org/${orgSlug}/issues`}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            Full Table <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                <th className="pb-3">Tracking Code</th>
                <th className="pb-3">Issue Title</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Priority</th>
                <th className="pb-3">Department</th>
                <th className="pb-3">Status Action</th>
                <th className="pb-3 text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats?.recentIssues?.map((issue: any) => (
                <tr key={issue.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 font-mono font-bold text-indigo-600">
                    {issue.trackingCode}
                  </td>
                  <td className="py-3.5 font-semibold text-slate-900 max-w-xs truncate">
                    {issue.title}
                  </td>
                  <td className="py-3.5 text-slate-600">
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                      style={{
                        backgroundColor: `${issue.category.colorCode}15`,
                        color: issue.category.colorCode,
                      }}
                    >
                      {issue.category.name}
                    </span>
                  </td>
                  <td className="py-3.5">
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        issue.priorityScore >= 80
                          ? 'bg-rose-100 text-rose-800'
                          : issue.priorityScore >= 60
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {issue.priorityScore}/100
                    </span>
                  </td>
                  <td className="py-3.5 text-slate-600">
                    {issue.assignedDepartment?.name || 'Unassigned'}
                  </td>
                  <td className="py-3.5">
                    <select
                      value={issue.status}
                      disabled={updatingId === issue.id}
                      onChange={(e) => handleQuickStatusChange(issue.id, e.target.value)}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white font-medium text-slate-700 text-xs focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="REPORTED">Reported</option>
                      <option value="UNDER_REVIEW">Under Review</option>
                      <option value="VERIFIED">Verified</option>
                      <option value="ASSIGNED">Assigned</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="RESOLVED">Resolved</option>
                    </select>
                  </td>
                  <td className="py-3.5 text-right">
                    <Link
                      href={`/issues/${issue.id}`}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 inline-block"
                      title="Inspect Public Page"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
