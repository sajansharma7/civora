'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  SlidersHorizontal,
  MapPin,
  Map,
  FileText,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  X,
  AlertCircle,
} from 'lucide-react';
import IssueCard from '@/components/issues/IssueCard';

export default function ExploreIssuesPage() {
  const [issues, setIssues] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState('ALL');
  const [selectedCity, setSelectedCity] = useState('ALL');
  const [selectedSort, setSelectedSort] = useState('priority');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  // Fetch categories
  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.categories) setCategories(data.categories);
      })
      .catch((err) => console.error(err));
  }, []);

  // Fetch issues whenever filters change
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (selectedCategory !== 'ALL') params.set('category', selectedCategory);
    if (selectedStatus !== 'ALL') params.set('status', selectedStatus);
    if (selectedSeverity !== 'ALL') params.set('severity', selectedSeverity);
    if (selectedCity !== 'ALL') params.set('city', selectedCity);
    params.set('sort', selectedSort);
    params.set('page', String(page));
    params.set('limit', '12');

    fetch(`/api/issues?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.issues) {
          setIssues(data.issues);
          if (data.pagination) setPagination(data.pagination);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [searchTerm, selectedCategory, selectedStatus, selectedSeverity, selectedCity, selectedSort, page]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('ALL');
    setSelectedStatus('ALL');
    setSelectedSeverity('ALL');
    setSelectedCity('ALL');
    setSelectedSort('priority');
    setPage(1);
  };

  const hasActiveFilters =
    searchTerm !== '' ||
    selectedCategory !== 'ALL' ||
    selectedStatus !== 'ALL' ||
    selectedSeverity !== 'ALL' ||
    selectedCity !== 'ALL';

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-slate-50/50">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with Title and Map Toggle CTA */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Community Issues Explorer
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Browse, verify, and monitor active civic infrastructure reports across Nepal municipalities.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Link
              href="/map"
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm w-full md:w-auto"
            >
              <Map className="w-4 h-4 text-indigo-600" />
              Switch to Live Map View
            </Link>
            <Link
              href="/report"
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all w-full md:w-auto"
            >
              <FileText className="w-4 h-4" />
              Report Issue
            </Link>
          </div>
        </div>

        {/* Filter Controls Card */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
          {/* Search bar */}
          <div className="relative mb-5">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              placeholder="Search by keywords, street address, or tracking code (e.g. CIV-1012)..."
              className="w-full pl-11 pr-10 py-3 text-sm rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Multi-facet Filter Row */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
            {/* Category Dropdown */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800"
              >
                <option value="ALL">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Dropdown */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800"
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

            {/* Severity Dropdown */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Severity</label>
              <select
                value={selectedSeverity}
                onChange={(e) => {
                  setSelectedSeverity(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800"
              >
                <option value="ALL">All Severities</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>

            {/* Municipality Dropdown */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Municipality</label>
              <select
                value={selectedCity}
                onChange={(e) => {
                  setSelectedCity(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800"
              >
                <option value="ALL">All Municipalities</option>
                <option value="Pokhara">Pokhara</option>
                <option value="Kathmandu">Kathmandu</option>
                <option value="Lalitpur">Lalitpur</option>
              </select>
            </div>

            {/* Sorting */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Sort By</label>
              <select
                value={selectedSort}
                onChange={(e) => {
                  setSelectedSort(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800"
              >
                <option value="priority">Highest Priority</option>
                <option value="confirmations">Most Confirmed</option>
                <option value="confidence">Highest Confidence</option>
                <option value="recent">Newest Reports</option>
              </select>
            </div>
          </div>

          {/* Active Filter Clear Tag */}
          {hasActiveFilters && (
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Filtering active records</span>
              <button
                onClick={resetFilters}
                className="text-indigo-600 font-semibold hover:text-indigo-700 underline"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>

        {/* Results Bar */}
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 px-1">
          <span>
            Showing {issues.length} of {pagination.total} community issues
          </span>
          <span>Page {page} of {pagination.totalPages || 1}</span>
        </div>

        {/* Issues Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-80 rounded-3xl bg-white border border-slate-200/80 p-6 animate-pulse" />
            ))}
          </div>
        ) : issues.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs">
            <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">No issues found</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-5">
              No civic issues match your current filters. Try relaxing your search criteria or resetting filters.
            </p>
            <button
              onClick={resetFilters}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {issues.map((issue) => (
              <IssueCard key={issue.id} issue={issue} />
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-6 pb-12">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors shadow-sm"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-xs font-bold text-slate-700 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm">
              Page {page} of {pagination.totalPages}
            </span>

            <button
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors shadow-sm"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
