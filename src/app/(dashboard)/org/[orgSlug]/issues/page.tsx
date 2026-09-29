'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  ArrowLeft,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Building,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  X,
} from 'lucide-react';

interface OrgIssuesPageProps {
  params: Promise<{ orgSlug: string }>;
}

export default function OrgIssuesPage({ params }: OrgIssuesPageProps) {
  const { orgSlug } = use(params);

  const [issues, setIssues] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    // Fetch departments for this org
    fetch(`/api/org/${orgSlug}/stats`)
      .then((res) => res.json())
      .then((data) => {
        if (data.organization?.id) {
          fetch(`/api/issues?limit=100`)
            .then((r) => r.json())
            .then((idat) => {
              if (idat.issues) {
                // Filter issues for this org or city
                setIssues(idat.issues);
              }
            });
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));

    fetch('/api/categories')
      .then((r) => r.json())
      .then((d) => {
        if (d.categories) setCategories(d.categories);
      });
  }, [orgSlug]);

  const handleStatusChange = async (issueId: string, newStatus: string) => {
    setUpdatingId(issueId);
    try {
      const res = await fetch(`/api/org/${orgSlug}/issues/${issueId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setIssues((prev) =>
          prev.map((iss) => (iss.id === issueId ? { ...iss, status: newStatus } : iss))
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredIssues = issues.filter((iss) => {
    if (filterCategory !== 'ALL' && iss.categoryId !== filterCategory) return false;
    if (filterStatus !== 'ALL' && iss.status !== filterStatus) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        iss.title?.toLowerCase().includes(q) ||
        iss.trackingCode?.toLowerCase().includes(q) ||
        iss.address?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Link
            href={`/org/${orgSlug}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Org Overview
          </Link>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Issue Dispatch & Management Table
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Sort, review, and transition civic complaints across municipal departments.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-3xl p-5 border shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by tracking code, title, or address..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 font-medium"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700"
          >
            <option value="ALL">All Statuses</option>
            <option value="REPORTED">Reported</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="VERIFIED">Verified</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs overflow-x-auto">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
            Loading Dispatch Table...
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                <th className="pb-3">Tracking</th>
                <th className="pb-3">Title & Location</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Priority</th>
                <th className="pb-3">Community Votes</th>
                <th className="pb-3">Status Pipeline</th>
                <th className="pb-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredIssues.map((iss) => (
                <tr key={iss.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 font-mono font-bold text-indigo-600">
                    {iss.trackingCode}
                  </td>
                  <td className="py-3.5 max-w-sm">
                    <p className="font-semibold text-slate-900 truncate">{iss.title}</p>
                    <p className="text-[11px] text-slate-400 truncate">{iss.address}, {iss.city}</p>
                  </td>
                  <td className="py-3.5">
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                      style={{
                        backgroundColor: `${iss.category?.colorCode || '#6366f1'}15`,
                        color: iss.category?.colorCode || '#6366f1',
                      }}
                    >
                      {iss.category?.name}
                    </span>
                  </td>
                  <td className="py-3.5">
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        iss.priorityScore >= 80
                          ? 'bg-rose-100 text-rose-800'
                          : iss.priorityScore >= 60
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {iss.priorityScore}/100
                    </span>
                  </td>
                  <td className="py-3.5 font-semibold text-slate-700">
                    {iss.confirmationsCount || 0} confirmations
                  </td>
                  <td className="py-3.5">
                    <select
                      value={iss.status}
                      disabled={updatingId === iss.id}
                      onChange={(e) => handleStatusChange(iss.id, e.target.value)}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white font-medium text-slate-700 text-xs"
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
                      href={`/issues/${iss.id}`}
                      className="inline-flex items-center gap-1 font-semibold text-xs text-indigo-600 hover:text-indigo-700"
                    >
                      View <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
