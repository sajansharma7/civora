'use client';

import Link from 'next/link';
import {
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  Image as ImageIcon,
  Building,
  Users,
} from 'lucide-react';

interface IssueCardProps {
  issue: {
    id: string;
    trackingCode: string;
    title: string;
    description: string;
    status: string;
    severity: string;
    safetyRisk?: string;
    isEmergency?: boolean;
    priorityScore: number;
    priorityLevel: string;
    communityConfidence: number;
    confirmationsCount: number;
    disputesCount?: number;
    followersCount?: number;
    address: string;
    city: string;
    ward?: string | null;
    createdAt: string;
    category: {
      name: string;
      colorCode: string;
      icon?: string;
    };
    reporter?: {
      name: string;
      avatar?: string | null;
    };
    images?: Array<{ url: string }>;
    assignedOrg?: {
      name: string;
      slug: string;
    } | null;
  };
}

export default function IssueCard({ issue }: IssueCardProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'RESOLVED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'IN_PROGRESS':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'VERIFIED':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'ASSIGNED':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'UNDER_REVIEW':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'REJECTED':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  const getPriorityBadge = (score: number) => {
    if (score >= 80) return { label: 'Critical', bg: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-600' };
    if (score >= 60) return { label: 'High', bg: 'bg-orange-50 text-orange-700 border-orange-200', dot: 'bg-orange-500' };
    if (score >= 35) return { label: 'Medium', bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' };
    return { label: 'Low', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' };
  };

  const priority = getPriorityBadge(issue.priorityScore);
  const primaryImage = issue.images && issue.images.length > 0 ? issue.images[0].url : null;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden group">
      {/* Top Banner / Image */}
      {primaryImage ? (
        <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
          <img
            src={primaryImage}
            alt={issue.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {issue.isEmergency && (
            <span className="absolute top-3 left-3 bg-rose-600 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md flex items-center gap-1 animate-pulse">
              <ShieldAlert className="w-3 h-3" /> Emergency
            </span>
          )}
          <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full font-mono font-semibold">
            {issue.trackingCode}
          </div>
        </div>
      ) : (
        <div className="p-4 pb-0 flex items-center justify-between">
          <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
            {issue.trackingCode}
          </span>
          {issue.isEmergency && (
            <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <ShieldAlert className="w-3 h-3 text-rose-600" /> Emergency
            </span>
          )}
        </div>
      )}

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Metadata Row */}
          <div className="flex flex-wrap items-center gap-2 mb-2.5">
            <span
              className="text-[11px] font-bold px-2.5 py-0.5 rounded-full"
              style={{
                backgroundColor: `${issue.category.colorCode}15`,
                color: issue.category.colorCode,
              }}
            >
              {issue.category.name}
            </span>

            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${getStatusBadge(issue.status)}`}>
              {issue.status.replace('_', ' ')}
            </span>

            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1 ${priority.bg}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${priority.dot}`} />
              {priority.label} ({issue.priorityScore})
            </span>
          </div>

          {/* Title */}
          <h3 className="font-bold text-slate-900 text-base leading-snug mb-1.5 group-hover:text-indigo-600 transition-colors line-clamp-2">
            <Link href={`/issues/${issue.id}`}>{issue.title}</Link>
          </h3>

          {/* Description */}
          <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
            {issue.description}
          </p>
        </div>

        <div>
          {/* Location & Metrics */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 truncate">
              <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className="truncate">
                {issue.address}, {issue.city}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <div className="flex items-center gap-3 text-slate-600">
                <span className="flex items-center gap-1" title="Community confirmations">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <strong>{issue.confirmationsCount}</strong> confirmed
                </span>
                <span className="flex items-center gap-1" title="Community confidence score">
                  <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                  <strong>{issue.communityConfidence}%</strong>
                </span>
              </div>

              <Link
                href={`/issues/${issue.id}`}
                className="inline-flex items-center gap-1 font-semibold text-xs text-indigo-600 hover:text-indigo-700 group-hover:translate-x-0.5 transition-all"
              >
                Details <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
