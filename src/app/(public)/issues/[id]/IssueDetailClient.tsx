'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  MapPin,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Bookmark,
  Share2,
  Building,
  TrendingUp,
  ShieldAlert,
  Clock,
  ArrowRight,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  X,
  Loader2,
  History,
  Sparkles,
  Camera,
  Check,
  Send,
  Flag,
} from 'lucide-react';
import BeforeAfterSlider from '@/components/issues/BeforeAfterSlider';

interface IssueDetailClientProps {
  initialIssue: any;
}

export default function IssueDetailClient({ initialIssue }: IssueDetailClientProps) {
  const { data: session } = useSession();
  const [issue, setIssue] = useState(initialIssue);

  // Interaction Modals & States
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmComment, setConfirmComment] = useState('');
  const [confirmLoading, setConfirmLoading] = useState(false);

  const [disputeModalOpen, setDisputeModalOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState('OTHER');
  const [disputeDetails, setDisputeDetails] = useState('');
  const [disputeLoading, setDisputeLoading] = useState(false);

  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [afterImageUrl, setAfterImageUrl] = useState('');
  const [resolveDesc, setResolveDesc] = useState('');
  const [resolveLoading, setResolveLoading] = useState(false);

  const [votingLoading, setVotingLoading] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  const [commentText, setCommentText] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  // Lifecycle progression steps
  const LIFECYCLE_STEPS = [
    { key: 'REPORTED', label: 'Reported' },
    { key: 'VERIFIED', label: 'Verified' },
    { key: 'ASSIGNED', label: 'Assigned' },
    { key: 'IN_PROGRESS', label: 'In Progress' },
    { key: 'RESOLVED', label: 'Resolved' },
  ];

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'REPORTED':
        return 0;
      case 'UNDER_REVIEW':
      case 'VERIFIED':
        return 1;
      case 'ASSIGNED':
        return 2;
      case 'IN_PROGRESS':
      case 'PENDING':
        return 3;
      case 'RESOLVED':
        return 4;
      case 'REOPENED':
        return 3; // Reopened falls back to active work
      default:
        return 0;
    }
  };

  const currentStepIdx = getStepIndex(issue.status);

  // Handle Confirm Issue
  const handleConfirm = async () => {
    setConfirmLoading(true);
    setActionError('');
    try {
      const res = await fetch(`/api/issues/${issue.id}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment: confirmComment }),
      });
      const data = await res.json();
      if (res.ok) {
        setIssue((prev: any) => ({
          ...prev,
          confirmationsCount: data.confirmationsCount,
          communityConfidence: data.communityConfidence,
          priorityScore: data.priorityScore,
          status: data.status,
        }));
        setConfirmModalOpen(false);
        setActionSuccess('Thank you! You successfully confirmed this issue (+2 Civic Points).');
      } else {
        setActionError(data.error || 'Failed to confirm issue');
      }
    } catch {
      setActionError('Network error confirming issue');
    } finally {
      setConfirmLoading(false);
    }
  };

  // Handle Dispute Issue
  const handleDispute = async () => {
    setDisputeLoading(true);
    setActionError('');
    try {
      const res = await fetch(`/api/issues/${issue.id}/dispute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: disputeReason, details: disputeDetails }),
      });
      const data = await res.json();
      if (res.ok) {
        setIssue((prev: any) => ({
          ...prev,
          disputesCount: data.disputesCount,
          communityConfidence: data.communityConfidence,
          status: data.status,
        }));
        setDisputeModalOpen(false);
        setActionSuccess('Dispute registered and flagged for municipal investigation.');
      } else {
        setActionError(data.error || 'Failed to submit dispute');
      }
    } catch {
      setActionError('Network error submitting dispute');
    } finally {
      setDisputeLoading(false);
    }
  };

  // Handle Follow Toggle
  const handleToggleFollow = async () => {
    setFollowLoading(true);
    try {
      const res = await fetch(`/api/issues/${issue.id}/follow`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setIsFollowing(data.isFollowing);
        setIssue((prev: any) => ({
          ...prev,
          followersCount: data.followersCount,
          priorityScore: data.priorityScore,
        }));
      }
    } catch {
      console.warn('Follow error');
    } finally {
      setFollowLoading(false);
    }
  };

  // Handle Resolution Submit (Staff)
  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    setResolveLoading(true);
    setActionError('');
    try {
      const res = await fetch(`/api/issues/${issue.id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          afterImageUrl: afterImageUrl || 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=800&auto=format&fit=crop&q=80',
          description: resolveDesc,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setIssue((prev: any) => ({
          ...prev,
          status: 'RESOLVED',
          resolutionEvidence: data.resolution,
        }));
        setResolveModalOpen(false);
        setActionSuccess('Resolution evidence submitted! Reverification requests dispatched to followers.');
      } else {
        setActionError(data.error || 'Failed to mark resolved');
      }
    } catch {
      setActionError('Network error recording resolution');
    } finally {
      setResolveLoading(false);
    }
  };

  // Handle Resolution Reverification Vote
  const handleVerifyVote = async (verdict: 'FIXED' | 'PARTIALLY_FIXED' | 'STILL_EXISTS') => {
    setVotingLoading(true);
    setActionError('');
    try {
      const res = await fetch(`/api/issues/${issue.id}/verify-resolution`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verdict }),
      });
      const data = await res.json();
      if (res.ok) {
        setIssue((prev: any) => ({
          ...prev,
          resolutionEvidence: data.resolution,
          ...(data.reopened && { status: 'REOPENED' }),
        }));
        setActionSuccess(
          data.reopened
            ? 'Vote recorded. Due to high reports that the problem persists, this issue was automatically REOPENED!'
            : 'Thank you for verifying this civic resolution.'
        );
      } else {
        setActionError(data.error || 'Failed to record vote');
      }
    } catch {
      setActionError('Network error recording verification vote');
    } finally {
      setVotingLoading(false);
    }
  };

  // Handle Comment Submission
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setCommentLoading(true);
    try {
      const res = await fetch(`/api/issues/${issue.id}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: commentText }),
      });
      const data = await res.json();
      if (res.ok && data.comment) {
        setIssue((prev: any) => ({
          ...prev,
          comments: [...prev.comments, data.comment],
        }));
        setCommentText('');
      }
    } catch {
      console.warn('Comment post error');
    } finally {
      setCommentLoading(false);
    }
  };

  const beforePhoto = issue.images?.[0]?.url || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80';
  const afterPhoto = issue.resolutionEvidence?.afterImageUrl;

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 bg-slate-50/50">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Alerts */}
        {actionSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>{actionSuccess}</span>
            </div>
            <button onClick={() => setActionSuccess('')} className="p-1 hover:bg-emerald-100 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {actionError && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              <span>{actionError}</span>
            </div>
            <button onClick={() => setActionError('')} className="p-1 hover:bg-rose-100 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Top Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border shadow-sm" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="font-mono text-sm font-extrabold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-xl border border-indigo-200 shadow-inner">
                {issue.trackingCode}
              </span>
              <span
                className="text-xs font-bold px-3 py-1 rounded-full"
                style={{
                  backgroundColor: `${issue.category.colorCode}18`,
                  color: issue.category.colorCode,
                }}
              >
                {issue.category.name}
              </span>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {issue.status.replace('_', ' ')}
              </span>
              {issue.isEmergency && (
                <span className="text-xs font-extrabold bg-rose-600 text-white px-3 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1 animate-pulse">
                  <ShieldAlert className="w-3.5 h-3.5" /> Emergency
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleFollow}
                disabled={followLoading}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                  isFollowing
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isFollowing ? 'fill-indigo-600 text-indigo-600' : ''}`} />
                {isFollowing ? 'Following' : 'Follow Updates'} ({issue.followersCount})
              </button>

              <button
                onClick={() => setDisputeModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold"
              >
                <Flag className="w-3.5 h-3.5" />
                Dispute
              </button>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-snug tracking-tight mb-3">
            {issue.title}
          </h1>

          <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-indigo-600" />
              {issue.address}, {issue.ward ? `${issue.ward}, ` : ''}{issue.city}, Nepal
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-400" />
              Reported on {new Date(issue.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
            <span className="flex items-center gap-1.5">
              <Building className="w-4 h-4 text-slate-400" />
              Assigned to {issue.assignedOrg?.name || 'Pokhara Metropolitan City'}
            </span>
          </div>

          {/* Lifecycle Progression Bar */}
          <div className="mt-8 pt-8 border-t border-slate-100">
            <div className="flex items-center justify-between relative">
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-100 -translate-y-1/2 z-0" />
              <div
                className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-indigo-600 to-emerald-500 -translate-y-1/2 z-0 transition-all duration-700"
                style={{ width: `${(currentStepIdx / (LIFECYCLE_STEPS.length - 1)) * 100}%` }}
              />

              {LIFECYCLE_STEPS.map((step, idx) => {
                const isPassed = currentStepIdx >= idx;
                const isCurrent = currentStepIdx === idx;

                return (
                  <div key={step.key} className="flex flex-col items-center relative z-10">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-sm ${
                        isCurrent
                          ? 'bg-indigo-600 text-white ring-4 ring-indigo-100'
                          : isPassed
                          ? 'bg-emerald-500 text-white'
                          : 'bg-white border-2 border-slate-200 text-slate-400'
                      }`}
                    >
                      {isPassed && !isCurrent ? <Check className="w-4 h-4" /> : idx + 1}
                    </div>
                    <span
                      className={`text-[11px] font-bold mt-2 whitespace-nowrap ${
                        isCurrent ? 'text-indigo-600' : isPassed ? 'text-slate-800' : 'text-slate-400'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content Layout (2 Columns) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column (Evidence Slider, Details, Reverification, Comments) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Visual Evidence Section */}
            {issue.status === 'RESOLVED' && afterPhoto ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    Verified Before / After Resolution Comparison
                  </h3>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Fix Evidence Uploaded
                  </span>
                </div>
                <BeforeAfterSlider beforeImage={beforePhoto} afterImage={afterPhoto} />
                {issue.resolutionEvidence?.description && (
                  <p className="text-xs text-slate-600 bg-white p-4 rounded-2xl border border-slate-200">
                    <strong>Official Municipal Completion Report:</strong>{' '}
                    {issue.resolutionEvidence.description}
                  </p>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm">
                <img
                  src={beforePhoto}
                  alt={issue.title}
                  className="w-full h-80 sm:h-96 object-cover"
                />
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Photo evidence submitted by reporting citizen</span>
                  <span className="font-mono">{issue.images?.length || 1} image attached</span>
                </div>
              </div>
            )}

            {/* CITIZEN REVERIFICATION LOOP (When Resolved) */}
            {issue.status === 'RESOLVED' && issue.resolutionEvidence && (
              <div className="bg-gradient-to-br from-emerald-50/80 to-white rounded-3xl p-6 sm:p-8 border border-emerald-200 shadow-sm space-y-5">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/70 px-2.5 py-1 rounded-full">
                    Citizen Verification Loop
                  </span>
                  <h3 className="text-xl font-black text-slate-900 mt-2">
                    Did the municipality properly resolve this problem?
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Civora requires community consensus before archiving civic repairs. If 3 or more neighbors vote that the problem still exists, the issue is automatically reopened.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    disabled={votingLoading}
                    onClick={() => handleVerifyVote('FIXED')}
                    className="p-4 rounded-2xl border border-emerald-300 bg-white hover:bg-emerald-50 transition-all text-center flex flex-col items-center justify-center group shadow-sm"
                  >
                    <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">✅</span>
                    <span className="text-xs font-bold text-slate-900">Properly Fixed</span>
                    <span className="text-[11px] font-semibold text-emerald-700 mt-1">
                      {issue.resolutionEvidence.fixedVotes || 0} votes
                    </span>
                  </button>

                  <button
                    disabled={votingLoading}
                    onClick={() => handleVerifyVote('PARTIALLY_FIXED')}
                    className="p-4 rounded-2xl border border-amber-300 bg-white hover:bg-amber-50 transition-all text-center flex flex-col items-center justify-center group shadow-sm"
                  >
                    <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">⚠️</span>
                    <span className="text-xs font-bold text-slate-900">Partially Fixed</span>
                    <span className="text-[11px] font-semibold text-amber-700 mt-1">
                      {issue.resolutionEvidence.partiallyFixedVotes || 0} votes
                    </span>
                  </button>

                  <button
                    disabled={votingLoading}
                    onClick={() => handleVerifyVote('STILL_EXISTS')}
                    className="p-4 rounded-2xl border border-rose-300 bg-white hover:bg-rose-50 transition-all text-center flex flex-col items-center justify-center group shadow-sm"
                  >
                    <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">❌</span>
                    <span className="text-xs font-bold text-slate-900">Still Exists / Failed</span>
                    <span className="text-[11px] font-semibold text-rose-700 mt-1">
                      {issue.resolutionEvidence.stillExistsVotes || 0} votes
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* Description & Impact Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border shadow-sm space-y-4" style={{ borderColor: 'var(--border-color)' }}>
              <h3 className="font-bold text-base text-slate-900">Problem Description & Impact</h3>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {issue.description}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">Estimated Impact</span>
                  <span className="font-bold text-slate-800">{issue.affectedPeopleEst}+ citizens affected</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Safety Risk Level</span>
                  <span className="font-bold text-rose-700">{issue.safetyRisk} Hazard</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Reported By</span>
                  <span className="font-bold text-indigo-600">{issue.reporter?.name || 'Verified Citizen'}</span>
                </div>
              </div>
            </div>

            {/* Official Audit Trail History */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border shadow-sm" style={{ borderColor: 'var(--border-color)' }}>
              <div className="flex items-center gap-2 mb-6">
                <History className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-base text-slate-900">Audit Trail & Status History</h3>
              </div>

              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {issue.statusHistory?.map((h: any) => (
                  <div key={h.id} className="relative">
                    <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-indigo-600 ring-4 ring-white" />
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-900">
                          {h.newStatus.replace('_', ' ')}
                        </span>
                        <span className="text-[11px] text-slate-400">•</span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(h.createdAt).toLocaleDateString()} at{' '}
                          {new Date(h.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {h.changedBy && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                            by {h.changedBy.name} ({h.changedBy.role})
                          </span>
                        )}
                      </div>
                      {h.comment && <p className="text-xs text-slate-600">{h.comment}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Comments Thread & Official Updates */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border shadow-sm space-y-6" style={{ borderColor: 'var(--border-color)' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-bold text-base text-slate-900">
                    Community Comments & Updates ({issue.comments?.length || 0})
                  </h3>
                </div>
              </div>

              {/* Comment Input */}
              <form onSubmit={handleAddComment} className="flex gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add community information or municipal feedback..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
                <button
                  type="submit"
                  disabled={commentLoading || !commentText.trim()}
                  className="px-4 py-2.5 rounded-xl gradient-primary text-white font-semibold text-xs shadow-md disabled:opacity-50 flex items-center gap-1.5"
                >
                  {commentLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  Post
                </button>
              </form>

              {/* Comment List */}
              <div className="space-y-4 pt-2">
                {issue.comments?.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">
                    No comments yet. Share your observation or field update.
                  </p>
                ) : (
                  issue.comments?.map((cm: any) => (
                    <div
                      key={cm.id}
                      className={`p-4 rounded-2xl border text-xs space-y-1.5 ${
                        cm.isOfficialUpdate
                          ? 'bg-indigo-50/60 border-indigo-200'
                          : 'bg-slate-50 border-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{cm.user.name}</span>
                          {cm.isOfficialUpdate && (
                            <span className="bg-indigo-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                              Official Municipal Update
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {new Date(cm.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-slate-700 leading-relaxed">{cm.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column (Actions, Priority Engine, Confidence) */}
          <div className="space-y-6">
            {/* COMMUNITY ACTION HUB CARD */}
            <div className="bg-white rounded-3xl p-6 border shadow-sm space-y-4" style={{ borderColor: 'var(--border-color)' }}>
              <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400">
                Community Verification Hub
              </h3>

              <div className="space-y-2.5">
                <button
                  onClick={() => setConfirmModalOpen(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl gradient-primary text-white font-bold text-sm shadow-md hover:shadow-lg transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Confirm: This Still Exists (+2 pts)
                </button>

                <button
                  onClick={() => setDisputeModalOpen(true)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors"
                >
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Dispute This Report
                </button>

                {/* Mark as Resolved button for staff */}
                {issue.status !== 'RESOLVED' && (
                  <button
                    onClick={() => setResolveModalOpen(true)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl border border-emerald-300 bg-emerald-50 text-emerald-800 font-bold text-xs hover:bg-emerald-100 transition-colors"
                  >
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    Submit Resolution Evidence
                  </button>
                )}
              </div>
            </div>

            {/* DETERMINISTIC SMART PRIORITY CARD */}
            <div className="bg-white rounded-3xl p-6 border shadow-sm space-y-4" style={{ borderColor: 'var(--border-color)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Smart Priority Engine
                  </span>
                  <h4 className="text-xl font-black text-slate-900 mt-0.5">
                    {issue.priorityLevel} Priority
                  </h4>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-black text-indigo-600">
                    {issue.priorityScore}
                  </span>
                  <span className="text-xs text-slate-400 block font-semibold">/ 100</span>
                </div>
              </div>

              {issue.priorityExplanation && (
                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {issue.priorityExplanation}
                </p>
              )}

              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Confirmations Factor</span>
                  <span className="font-bold text-slate-900">{issue.confirmationsCount} votes</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Safety Risk Factor</span>
                  <span className="font-bold text-rose-600">{issue.safetyRisk}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Followers Interest</span>
                  <span className="font-bold text-slate-900">{issue.followersCount} followers</span>
                </div>
              </div>
            </div>

            {/* DYNAMIC COMMUNITY CONFIDENCE METER */}
            <div className="bg-white rounded-3xl p-6 border shadow-sm space-y-4" style={{ borderColor: 'var(--border-color)' }}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Community Confidence
                </span>
                <span className="text-xl font-black text-emerald-600">
                  {issue.communityConfidence}%
                </span>
              </div>

              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                  style={{ width: `${issue.communityConfidence}%` }}
                />
              </div>

              <p className="text-[11px] text-slate-500">
                Calculated dynamically using logarithmic confirmations, attached photographic evidence, and zero-spam dispute balancing.
              </p>
            </div>

            {/* MUNICIPALITY DISPATCH CARD */}
            <div className="bg-white rounded-3xl p-6 border shadow-sm space-y-3" style={{ borderColor: 'var(--border-color)' }}>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Assigned Authority
              </span>
              <h4 className="font-bold text-slate-900 text-sm">
                {issue.assignedOrg?.name || 'Pokhara Metropolitan City'}
              </h4>
              <p className="text-xs text-slate-500">
                Department:{' '}
                <strong className="text-slate-700">
                  {issue.assignedDepartment?.name || 'Infrastructure & Road Maintenance'}
                </strong>
              </p>
              <div className="pt-2">
                <Link
                  href={`/org/${issue.assignedOrg?.slug || 'pokhara-metro'}`}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  View Municipality Metrics <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* CONFIRM MODAL */}
        {confirmModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border" style={{ borderColor: 'var(--border-color)' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-slate-900">Confirm Community Issue</h3>
                <button onClick={() => setConfirmModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-slate-600 mb-4">
                Confirming verifies to municipal evaluators that this issue is genuine and actively affects the neighborhood.
              </p>
              <textarea
                value={confirmComment}
                onChange={(e) => setConfirmComment(e.target.value)}
                placeholder="Optional: add details (e.g. 'Water is still leaking this afternoon')..."
                rows={3}
                className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={confirmLoading}
                  onClick={handleConfirm}
                  className="px-5 py-2 rounded-xl gradient-primary text-white text-xs font-bold shadow-md disabled:opacity-50 flex items-center gap-1.5"
                >
                  {confirmLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Submit Confirmation
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DISPUTE MODAL */}
        {disputeModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border" style={{ borderColor: 'var(--border-color)' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-slate-900">Dispute Report</h3>
                <button onClick={() => setDisputeModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Reason for Dispute</label>
                  <select
                    value={disputeReason}
                    onChange={(e) => setDisputeReason(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium"
                  >
                    <option value="ALREADY_RESOLVED">Already Resolved by Municipality</option>
                    <option value="INACCURATE_LOCATION">Inaccurate GPS or Address Location</option>
                    <option value="DUPLICATE">Duplicate of an existing issue</option>
                    <option value="FAKE_OR_SPAM">Spam or Fake Complaint</option>
                    <option value="OTHER">Other Reason</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Details & Evidence *</label>
                  <textarea
                    value={disputeDetails}
                    onChange={(e) => setDisputeDetails(e.target.value)}
                    rows={3}
                    placeholder="Provide justification why this report is inaccurate or should be flagged..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setDisputeModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={disputeLoading || !disputeDetails.trim()}
                  onClick={handleDispute}
                  className="px-5 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold shadow-md disabled:opacity-50 flex items-center gap-1.5"
                >
                  {disputeLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Submit Dispute
                </button>
              </div>
            </div>
          </div>
        )}

        {/* RESOLVE EVIDENCE MODAL (Staff/Admin) */}
        {resolveModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border" style={{ borderColor: 'var(--border-color)' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-slate-900">Submit Resolution Evidence</h3>
                <button onClick={() => setResolveModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleResolve} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Repaired Photo Evidence (After-Photo URL) *
                  </label>
                  <input
                    type="url"
                    value={afterImageUrl}
                    onChange={(e) => setAfterImageUrl(e.target.value)}
                    placeholder="https://... or upload photo"
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Leave blank to use verified high-resolution road repair photo.
                  </span>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Completion Description & Notes *
                  </label>
                  <textarea
                    value={resolveDesc}
                    onChange={(e) => setResolveDesc(e.target.value)}
                    rows={3}
                    placeholder="E.g. Asphalt resurfacing completed by Pokhara Ward 6 Road Maintenance Crew..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setResolveModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={resolveLoading || !resolveDesc.trim()}
                    className="px-5 py-2 rounded-xl gradient-primary text-white text-xs font-bold shadow-md disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {resolveLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Publish Resolution Evidence
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
