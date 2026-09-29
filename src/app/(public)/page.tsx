// ============================================================
// Landing Page - Pure Tailwind CSS (Linear/Vercel Aesthetic)
// ============================================================

import Link from 'next/link';
import {
  Shield,
  MapPin,
  Users,
  CheckCircle2,
  ArrowRight,
  Zap,
  Eye,
  BarChart3,
  Target,
  Building2,
  Camera,
  Search,
  Clock,
  Star,
  ChevronRight,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

// The 5 stages of the Civora pipeline
const pipelineStages = [
  {
    icon: Camera,
    title: 'Report',
    description: 'Pin location, snap photos, describe the issue',
    color: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    numberBg: 'bg-indigo-600',
  },
  {
    icon: Search,
    title: 'AI Detect',
    description: 'AI clusters identical complaints automatically',
    color: 'bg-purple-50 text-purple-600 border-purple-200',
    numberBg: 'bg-purple-600',
  },
  {
    icon: Users,
    title: 'Verify',
    description: 'Community members confirm or dispute reports',
    color: 'bg-blue-50 text-blue-600 border-blue-200',
    numberBg: 'bg-blue-600',
  },
  {
    icon: Target,
    title: 'Prioritize',
    description: 'Smart scoring routes issues to responsible teams',
    color: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    numberBg: 'bg-cyan-600',
  },
  {
    icon: CheckCircle2,
    title: 'Resolve',
    description: 'Before/after evidence verified by citizens',
    color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    numberBg: 'bg-emerald-600',
  },
];

// Impact statistics
const impactStats = [
  { label: 'Issues Tracked', value: '2,847', icon: AlertTriangle, color: 'text-indigo-600' },
  { label: 'Verified Rate', value: '73%', icon: CheckCircle2, color: 'text-emerald-600' },
  { label: 'Avg Resolution', value: '5.2 days', icon: Clock, color: 'text-blue-600' },
  { label: 'Active Wards', value: '34', icon: MapPin, color: 'text-purple-600' },
];

// Features for organizations
const orgFeatures = [
  {
    icon: BarChart3,
    title: 'Real-Time Analytics',
    description: 'Interactive dashboards with category breakdowns, resolution trends, and ward-level performance metrics.',
  },
  {
    icon: Target,
    title: 'Smart Prioritization',
    description: 'AI-driven scoring considers severity, community confirmations, safety risk, and affected population.',
  },
  {
    icon: Building2,
    title: 'Department Routing',
    description: 'Automatically route issues to the right department — Roads, Water, Sanitation, or Electrical.',
  },
  {
    icon: Eye,
    title: 'Public Transparency',
    description: 'Build citizen trust with a public civic transparency portal showing resolution velocity and rankings.',
  },
  {
    icon: Sparkles,
    title: 'AI Duplicate Detection',
    description: 'NLP-powered similarity matching prevents duplicate reports and clusters related complaints.',
  },
  {
    icon: Camera,
    title: 'Before/After Evidence',
    description: 'Require photographic proof of resolution with citizen verification voting for accountability.',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      {/* ============================================
          HERO SECTION
          ============================================ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 border-b border-slate-800 text-white">
        {/* Decorative background glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-400/30 bg-indigo-500/10 backdrop-blur-md text-xs font-semibold text-indigo-300">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>AI-Powered Civic Intelligence Platform · Nepal</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight">
              Turn Community Problems Into{' '}
              <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent">
                Verified Civic Action
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Civora combines location intelligence, community verification, and smart
              prioritization to help citizens and municipalities detect, track, and resolve
              real-world infrastructure issues with full transparency.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/report"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all hover:scale-102"
              >
                Report a Civic Issue
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/map"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-bold text-white border border-slate-700 bg-slate-900/60 hover:bg-slate-800 transition-all backdrop-blur-sm"
              >
                <MapPin className="w-4 h-4 text-cyan-400" />
                Explore Live Map
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-slate-400 text-xs">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                Open Civic Architecture
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-400" />
                Pokhara & Kathmandu Nodes
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400" />
                Community-Verified Data
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          LIVE CIVIC IMPACT BAR
          ============================================ */}
      <section className="relative -mt-8 z-10">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-2xl shadow-xl bg-white border border-slate-200">
            {impactStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="text-center p-2">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Icon className={`w-4 h-4 ${stat.color}`} />
                    <span className="text-2xl sm:text-3xl font-black text-slate-900">
                      {stat.value}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-500">
                    {stat.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================
          HOW CIVORA WORKS - 5 Stage Pipeline
          ============================================ */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
              Civic Intelligence Lifecycle
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              From Report to Resolution in 5 Steps
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Every issue goes through a transparent pipeline ensuring community validation,
              smart prioritization, and verified resolution.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {pipelineStages.map((stage, index) => {
              const Icon = stage.icon;
              return (
                <div
                  key={stage.title}
                  className="relative p-6 rounded-2xl border border-slate-200 bg-white shadow-xs hover:shadow-lg hover:border-indigo-300 transition-all duration-200 text-center space-y-3"
                >
                  {/* Step number badge */}
                  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full flex items-center justify-center text-white text-[11px] font-bold shadow-xs ${stage.numberBg}`}>
                    {index + 1}
                  </div>

                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto border ${stage.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>

                  <h3 className="text-sm font-bold text-slate-900">
                    {stage.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {stage.description}
                  </p>

                  {/* Connector arrow (hidden on last item) */}
                  {index < pipelineStages.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 -translate-y-1/2 z-10 text-slate-300">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================
          FOR ORGANIZATIONS SECTION
          ============================================ */}
      <section className="py-20 px-4 bg-slate-100/60 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
              For Municipalities & NGOs
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              A Complete Municipal Intelligence Platform
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Municipalities, wards, NGOs, and campuses get powerful tools to manage civic
              issues with data-driven efficiency and full public accountability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orgFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs hover:border-indigo-300 hover:shadow-lg transition-all duration-200 space-y-3 group"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-200">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================
          CTA BANNER SECTION
          ============================================ */}
      <section className="py-20 px-4 bg-gradient-to-tr from-indigo-900 via-indigo-800 to-indigo-950 text-white">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Ready to Transform Your Civic Community?
          </h2>
          <p className="text-xs sm:text-sm text-indigo-200 max-w-xl mx-auto leading-relaxed">
            Join citizens and municipal officers using Civora to build responsive,
            accountable, and transparent infrastructure governance.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/report"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-bold bg-white text-indigo-900 shadow-xl hover:bg-slate-100 transition-all hover:scale-102"
            >
              Start Reporting Issues
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-bold text-white border border-indigo-400/40 hover:bg-white/10 transition-all"
            >
              Municipal Officer Login
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
