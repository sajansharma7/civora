'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  Filter,
  Layers,
  Search,
  MapPin,
  List,
  Plus,
  Compass,
  Loader2,
  X,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';

const IssueMap = dynamic(() => import('@/components/maps/IssueMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center text-white">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-400 mb-3" />
      <p className="text-sm font-semibold tracking-wide">Initializing Geospatial Engine...</p>
    </div>
  ),
});

export default function LiveMapPage() {
  const [issues, setIssues] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState('ALL');

  // Map viewport (Default: Pokhara)
  const [center, setCenter] = useState<[number, number]>([28.2096, 83.9856]);
  const [zoom, setZoom] = useState(13);

  // Fetch categories
  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.categories) setCategories(data.categories);
      })
      .catch((err) => console.error(err));
  }, []);

  // Fetch issues based on filters
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedCategory !== 'ALL') params.set('category', selectedCategory);
    if (selectedStatus !== 'ALL') params.set('status', selectedStatus);
    if (selectedSeverity !== 'ALL') params.set('severity', selectedSeverity);
    if (selectedCity !== 'ALL') params.set('city', selectedCity);
    params.set('limit', '100');

    fetch(`/api/issues?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.issues) setIssues(data.issues);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [selectedCategory, selectedStatus, selectedSeverity, selectedCity]);

  const switchCity = (cityName: string, coords: [number, number]) => {
    setSelectedCity(cityName);
    setCenter(coords);
    setZoom(13);
  };

  return (
    <div className="relative w-full h-[calc(100vh-64px)] overflow-hidden">
      {/* Fullscreen Map Canvas */}
      <IssueMap
        issues={issues}
        selectedIssue={selectedIssue}
        onSelectIssue={setSelectedIssue}
        center={center}
        zoom={zoom}
      />

      {/* Floating Top Control Bar */}
      <div className="absolute top-4 left-4 right-4 sm:right-auto z-[999] flex flex-wrap items-center gap-2 pointer-events-none">
        {/* City Toggle Buttons */}
        <div className="bg-white/90 backdrop-blur-md p-1.5 rounded-2xl shadow-lg border border-slate-200 pointer-events-auto flex items-center gap-1">
          <button
            onClick={() => switchCity('Pokhara', [28.2096, 83.9856])}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedCity === 'Pokhara'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Pokhara
          </button>
          <button
            onClick={() => switchCity('Kathmandu', [27.7172, 85.3240])}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedCity === 'Kathmandu'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Kathmandu
          </button>
          <button
            onClick={() => {
              setSelectedCity('ALL');
              setCenter([28.0, 84.5]);
              setZoom(8);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedCity === 'ALL'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Nepal
          </button>
        </div>

        {/* Filter Toggle Button */}
        <button
          onClick={() => setFilterPanelOpen(!filterPanelOpen)}
          className="bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-lg border border-slate-200 pointer-events-auto flex items-center gap-2 text-xs font-bold text-slate-700 hover:bg-white transition-colors"
        >
          <Filter className="w-3.5 h-3.5 text-indigo-600" />
          Filters
          <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] flex items-center justify-center font-bold">
            {issues.length}
          </span>
        </button>

        {/* Switch to Grid View */}
        <Link
          href="/explore"
          className="bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-lg border border-slate-200 pointer-events-auto flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:bg-white transition-colors"
        >
          <List className="w-3.5 h-3.5 text-slate-500" />
          Grid View
        </Link>
      </div>

      {/* Floating Report CTA (Top Right) */}
      <div className="absolute top-4 right-4 z-[999] hidden sm:block pointer-events-auto">
        <Link
          href="/report"
          className="gradient-primary text-white px-4 py-2.5 rounded-2xl font-bold text-xs shadow-xl flex items-center gap-2 hover:shadow-2xl transition-all"
        >
          <Plus className="w-4 h-4" /> Report Issue
        </Link>
      </div>

      {/* Slide-out / Floating Filter Panel */}
      {filterPanelOpen && (
        <div className="absolute top-16 left-4 w-80 bg-white/95 backdrop-blur-md rounded-3xl p-5 shadow-2xl border border-slate-200 z-[1000] fade-in max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-600" />
              Map Layers & Filters
            </h3>
            <button
              onClick={() => setFilterPanelOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium"
              >
                <option value="ALL">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium"
              >
                <option value="ALL">All Statuses</option>
                <option value="REPORTED">Reported</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="VERIFIED">Verified</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Priority Bracket</label>
              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium"
              >
                <option value="ALL">All Priorities</option>
                <option value="CRITICAL">Critical (Score 80-100)</option>
                <option value="HIGH">High (Score 60-79)</option>
                <option value="MEDIUM">Medium (Score 35-59)</option>
                <option value="LOW">Low (Score 0-34)</option>
              </select>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-between">
              <button
                onClick={() => {
                  setSelectedCategory('ALL');
                  setSelectedStatus('ALL');
                  setSelectedSeverity('ALL');
                  setSelectedCity('ALL');
                }}
                className="text-xs text-indigo-600 font-semibold hover:underline"
              >
                Reset Filters
              </button>
              <span className="text-xs text-slate-500 font-medium">
                {issues.length} pins visible
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Floating Map Legend (Bottom Right) */}
      <div className="absolute bottom-6 right-6 hidden md:block bg-white/90 backdrop-blur-md rounded-2xl p-3.5 shadow-xl border border-slate-200 z-[999] text-[11px] font-medium text-slate-700 space-y-1.5">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
          Priority Pins
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-rose-500 shadow-sm" />
          <span>Critical Priority (80–100)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-orange-500 shadow-sm" />
          <span>High Priority (60–79)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-500 shadow-sm" />
          <span>Medium Priority (35–59)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm" />
          <span>Resolved / Verified Fix</span>
        </div>
      </div>
    </div>
  );
}
