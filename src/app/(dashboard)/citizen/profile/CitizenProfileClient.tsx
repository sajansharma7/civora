'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Award,
  Shield,
  Star,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  FileText,
  Bookmark,
  Edit3,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Heart,
  Loader2,
  X,
} from 'lucide-react';

interface CitizenProfileClientProps {
  initialUser: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar: string | null;
    phoneNumber: string | null;
    isVerified: boolean;
    createdAt: string;
    profile: {
      bio: string | null;
      country: string;
      city: string | null;
      ward: string | null;
      reportsCount: number;
      resolvedCount: number;
    } | null;
    reputation: {
      points: number;
      level: string;
      helpfulVotes: number;
    } | null;
    reportedIssues: Array<{
      id: string;
      trackingCode: string;
      title: string;
      description: string;
      status: string;
      severity: string;
      priorityScore: number;
      createdAt: string;
      confirmationsCount: number;
      category: {
        name: string;
        colorCode: string;
      };
      images: Array<{ url: string }>;
    }>;
    follows: Array<{
      id: string;
      issue: {
        id: string;
        trackingCode: string;
        title: string;
        status: string;
        severity: string;
        category: {
          name: string;
          colorCode: string;
        };
      };
    }>;
  };
}

export default function CitizenProfileClient({ initialUser }: CitizenProfileClientProps) {
  const [user, setUser] = useState(initialUser);
  const [activeTab, setActiveTab] = useState<'reports' | 'follows'>('reports');
  const [isEditing, setIsEditing] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user.name || '',
    bio: user.profile?.bio || '',
    city: user.profile?.city || 'Pokhara',
    ward: user.profile?.ward || 'Ward 8',
    phoneNumber: user.phoneNumber || '',
  });

  const points = user.reputation?.points || 0;
  const level = user.reputation?.level || 'NEW_CONTRIBUTOR';

  // Calculate tier information
  const getTierInfo = (pts: number) => {
    if (pts >= 400) {
      return {
        current: 'Community Champion',
        next: 'Max Level Reached',
        progress: 100,
        color: 'from-amber-500 to-rose-500',
        bgPill: 'bg-amber-100 text-amber-800 border-amber-300',
      };
    }
    if (pts >= 150) {
      return {
        current: 'Civic Leader',
        next: 'Community Champion (400 pts)',
        progress: Math.min(100, Math.round(((pts - 150) / 250) * 100)),
        color: 'from-indigo-600 to-purple-600',
        bgPill: 'bg-purple-100 text-purple-800 border-purple-300',
      };
    }
    if (pts >= 50) {
      return {
        current: 'Active Citizen',
        next: 'Civic Leader (150 pts)',
        progress: Math.min(100, Math.round(((pts - 50) / 100) * 100)),
        color: 'from-blue-600 to-cyan-500',
        bgPill: 'bg-blue-100 text-blue-800 border-blue-300',
      };
    }
    return {
      current: 'New Contributor',
      next: 'Active Citizen (50 pts)',
      progress: Math.min(100, Math.round((pts / 50) * 100)),
      color: 'from-slate-600 to-slate-800',
      bgPill: 'bg-slate-100 text-slate-800 border-slate-300',
    };
  };

  const tier = getTierInfo(points);

  // Available civic badges with unlocked condition
  const badges = [
    {
      id: 'first-report',
      title: 'First Voice',
      desc: 'Submitted your first civic report',
      icon: '🔰',
      unlocked: user.reportedIssues.length >= 1,
    },
    {
      id: 'neighborhood-watch',
      title: 'Neighborhood Watch',
      desc: 'Reported 3 or more local issues',
      icon: '👁️',
      unlocked: user.reportedIssues.length >= 3,
    },
    {
      id: 'community-validator',
      title: 'Trusted Neighbor',
      desc: 'Gathered 5+ community confirmations',
      icon: '🤝',
      unlocked: (user.reputation?.helpfulVotes || 0) >= 5,
    },
    {
      id: 'resolution-hero',
      title: 'Impact Maker',
      desc: 'Had at least 1 verified resolved issue',
      icon: '✨',
      unlocked: (user.profile?.resolvedCount || 0) >= 1,
    },
    {
      id: 'civic-pioneer',
      title: 'Civic Pioneer',
      desc: 'Achieved 50+ reputation points',
      icon: '🚀',
      unlocked: points >= 50,
    },
  ];

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    setEditLoading(true);
    try {
      const res = await fetch('/api/citizen/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        setUser((prev) => ({
          ...prev,
          name: editForm.name,
          phoneNumber: editForm.phoneNumber,
          profile: {
            ...prev.profile!,
            bio: editForm.bio,
            city: editForm.city,
            ward: editForm.ward,
          },
        }));
        setIsEditing(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setEditLoading(false);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RESOLVED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'VERIFIED':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'REJECTED':
        return 'bg-slate-100 text-slate-800 border-slate-300';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-300';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Profile Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center font-extrabold text-3xl shadow-lg">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900">{user.name}</h1>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${tier.bgPill}`}>
                  {tier.current}
                </span>
                {user.isVerified && (
                  <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified Citizen
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500 mt-1">{user.email}</p>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-600">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                  {user.profile?.ward ? `${user.profile.ward}, ` : ''}{user.profile?.city || 'Pokhara'}, Nepal
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Member since {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors w-full md:w-auto"
            >
              <Edit3 className="w-4 h-4 text-slate-500" />
              Edit Profile
            </button>
            <Link
              href="/report"
              className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl gradient-primary text-white shadow-md hover:shadow-lg transition-all w-full md:w-auto"
            >
              <FileText className="w-4 h-4" />
              New Report
            </Link>
          </div>
        </div>

        {user.profile?.bio && (
          <p className="mt-6 text-sm text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100">
            {user.profile.bio}
          </p>
        )}
      </div>

      {/* Reputation & Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Reputation Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Star className="w-5 h-5 fill-indigo-600" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Reputation</p>
                <h3 className="text-lg font-bold text-slate-900">{tier.current}</h3>
              </div>
            </div>
            <span className="text-2xl font-black text-indigo-600">{points} pts</span>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-slate-500 mb-1.5 font-medium">
              <span>Next Tier:</span>
              <span>{tier.next}</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${tier.color} transition-all duration-500`}
                style={{ width: `${tier.progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Total Reports Stat */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <TrendingUp className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Civic Reports</p>
            <h3 className="text-2xl font-black text-slate-900">{user.reportedIssues.length}</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {user.profile?.resolvedCount || 0} resolved with verified evidence
            </p>
          </div>
        </div>

        {/* Helpful Community Votes */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Heart className="w-7 h-7 fill-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Helpful Confirmations</p>
            <h3 className="text-2xl font-black text-slate-900">{user.reputation?.helpfulVotes || 0}</h3>
            <p className="text-xs text-slate-500 mt-0.5">Neighbors who confirmed your reports</p>
          </div>
        </div>
      </div>

      {/* Badges Showcase */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900">Civic Badges & Achievements</h2>
          </div>
          <span className="text-xs text-slate-500">
            {badges.filter((b) => b.unlocked).length} of {badges.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {badges.map((b) => (
            <div
              key={b.id}
              className={`p-4 rounded-2xl border text-center transition-all ${
                b.unlocked
                  ? 'bg-gradient-to-b from-indigo-50/50 to-white border-indigo-100 shadow-sm'
                  : 'bg-slate-50/50 border-slate-100 opacity-50 grayscale'
              }`}
            >
              <div className="text-3xl mb-2">{b.icon}</div>
              <h4 className="text-xs font-bold text-slate-900 mb-1">{b.title}</h4>
              <p className="text-[11px] text-slate-500 leading-tight">{b.desc}</p>
              {b.unlocked ? (
                <span className="inline-block mt-2 text-[10px] text-indigo-700 bg-indigo-50 font-semibold px-2 py-0.5 rounded-full">
                  Unlocked
                </span>
              ) : (
                <span className="inline-block mt-2 text-[10px] text-slate-400 font-semibold px-2 py-0.5 rounded-full">
                  Locked
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tabs for Reported Issues & Follows */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="border-b border-slate-100 px-6 pt-4 flex items-center gap-6">
          <button
            onClick={() => setActiveTab('reports')}
            className={`pb-4 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'reports'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            My Reported Issues ({user.reportedIssues.length})
          </button>
          <button
            onClick={() => setActiveTab('follows')}
            className={`pb-4 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'follows'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            Followed Issues ({user.follows.length})
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'reports' ? (
            user.reportedIssues.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-slate-800">No issues reported yet</h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                  Help improve your neighborhood by reporting infrastructure, safety, or utility problems.
                </p>
                <Link
                  href="/report"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl gradient-primary text-white"
                >
                  Report First Issue
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {user.reportedIssues.map((issue) => (
                  <div
                    key={issue.id}
                    className="p-4 sm:p-5 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-all bg-white hover:shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                          {issue.trackingCode}
                        </span>
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${getStatusColor(issue.status)}`}>
                          {issue.status.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">
                          {issue.category.name}
                        </span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs text-slate-400">
                          {new Date(issue.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="text-base font-semibold text-slate-900 mb-1 hover:text-indigo-600 transition-colors">
                        <Link href={`/issues/${issue.id}`}>{issue.title}</Link>
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-1">{issue.description}</p>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-0 pt-3 sm:pt-0">
                      <div className="text-right text-xs">
                        <span className="text-slate-400">Confirmations: </span>
                        <span className="font-bold text-slate-700">{issue.confirmationsCount}</span>
                      </div>
                      <Link
                        href={`/issues/${issue.id}`}
                        className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        View Details
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            user.follows.length === 0 ? (
              <div className="text-center py-12">
                <Bookmark className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-slate-800">No followed issues</h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                  Follow issues in your neighborhood to receive instant notifications when status updates or fixes are published.
                </p>
                <Link
                  href="/explore"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50"
                >
                  Explore Community Issues
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {user.follows.map((follow) => (
                  <div
                    key={follow.id}
                    className="p-4 sm:p-5 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-all bg-white hover:shadow-sm flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                          {follow.issue.trackingCode}
                        </span>
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${getStatusColor(follow.issue.status)}`}>
                          {follow.issue.status.replace('_', ' ')}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-slate-900">
                        <Link href={`/issues/${follow.issue.id}`}>{follow.issue.title}</Link>
                      </h4>
                    </div>

                    <Link
                      href={`/issues/${follow.issue.id}`}
                      className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      View
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-slate-900">Edit Citizen Profile</h3>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Bio / About Me</label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  rows={3}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Civic advocate living in Ward 8..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={editForm.city}
                    onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Ward Number</label>
                  <input
                    type="text"
                    value={editForm.ward}
                    onChange={(e) => setEditForm({ ...editForm, ward: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. Ward 8"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number (Optional)</label>
                <input
                  type="text"
                  value={editForm.phoneNumber}
                  onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="+977 98XXXXXXXX"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-sm font-medium rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-xl gradient-primary text-white shadow-md disabled:opacity-50"
                >
                  {editLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
