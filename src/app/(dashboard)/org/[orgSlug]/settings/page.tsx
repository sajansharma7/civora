import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { ArrowLeft, CreditCard, Check, Sparkles, Building, Phone, Mail, Globe, Shield } from 'lucide-react';

interface SettingsPageProps {
  params: Promise<{ orgSlug: string }>;
}

export default async function OrgSettingsPage({ params }: SettingsPageProps) {
  const { orgSlug } = await params;

  const org = await prisma.organization.findUnique({
    where: { slug: orgSlug },
    include: {
      subscription: {
        include: { plan: true },
      },
    },
  });

  const plans = await prisma.plan.findMany();

  if (!org) {
    return <div className="p-8">Organization not found</div>;
  }

  const currentPlan = org.subscription?.plan || plans[1]; // default to professional

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      <div>
        <Link
          href={`/org/${orgSlug}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Org Overview
        </Link>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Organization Settings & Subscriptions
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your municipal license tier, API credentials, and administrative profile.
        </p>
      </div>

      {/* Subscription Plans Grid */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            SaaS License Tier
          </span>
          <h2 className="text-lg font-bold text-slate-900 mt-0.5">Municipal Service Plans</h2>
          <p className="text-xs text-slate-500">
            Civora plans scale from small rural municipalities to national capital cities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((p) => {
            const isCurrent = currentPlan?.id === p.id;
            return (
              <div
                key={p.id}
                className={`rounded-3xl p-6 border transition-all flex flex-col justify-between ${
                  isCurrent
                    ? 'border-indigo-600 bg-indigo-50/20 ring-2 ring-indigo-500/20 shadow-md'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-base text-slate-900">{p.name}</h3>
                    {isCurrent && (
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-600 text-white">
                        Active Plan
                      </span>
                    )}
                  </div>

                  <div className="mb-4">
                    <span className="text-3xl font-black text-slate-900">${Number(p.priceUsd)}</span>
                    <span className="text-xs text-slate-400"> / month</span>
                  </div>

                  <div className="space-y-2 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>Up to <strong>{p.maxDepts}</strong> departments</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>Up to <strong>{p.maxStaff}</strong> municipal staff accounts</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>{p.hasAiFeatures ? 'Full AI duplicate detection' : 'Basic deduplication'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>{p.hasApiAccess ? 'REST Webhook & API access' : 'Standard Web Portal'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100">
                  <button
                    disabled={isCurrent}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isCurrent
                        ? 'bg-slate-100 text-slate-500 cursor-default'
                        : 'gradient-primary text-white shadow-md hover:shadow-lg'
                    }`}
                  >
                    {isCurrent ? 'Current Subscription' : 'Upgrade Plan'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Organization Profile Details */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="font-bold text-base text-slate-900">Organization Metadata</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block mb-1">Official Name</span>
            <span className="font-bold text-slate-900">{org.name}</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block mb-1">Coverage Territory</span>
            <span className="font-bold text-slate-900">{org.city}, {org.district}, {org.province} Province</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block mb-1">Contact Email</span>
            <span className="font-bold text-slate-900">{org.email}</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block mb-1">Official Portal</span>
            <span className="font-bold text-indigo-600">{org.website}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
