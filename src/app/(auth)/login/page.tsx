// ============================================================
// Login Page - Pure Tailwind CSS (Linear/Vercel Aesthetic)
// ============================================================

'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Shield,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  Building2,
  Wrench,
  UserCheck,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get('registered');

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Quick fill helper for testing
  function quickFill(e: string, p: string) {
    setEmail(e);
    setPassword(p);
    setError('');
  }

  // Handle form submission
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password. Please try again.');
      } else {
        router.push('/');
        router.refresh();
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* ---- Left side: Decorative SaaS showcase panel ---- */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-12 flex-col justify-between text-white border-r border-slate-800">
        {/* Ambient background glows */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-cyan-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="relative z-10 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 group text-xs font-semibold text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Civora Home
          </Link>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-indigo-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Nepal Civic Node Active
          </div>
        </div>

        {/* Center Presentation */}
        <div className="relative z-10 max-w-lg my-auto space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Shield className="w-7 h-7 text-white" />
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
              Community Intelligence for Smarter Municipalities.
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Civora transforms fragmented community complaints into verified, prioritized civic action
              with automated duplicate detection, GIS routing, and citizen-governed resolution proof.
            </p>
          </div>

          {/* Quick Demo Credentials Widget */}
          <div className="rounded-2xl bg-white/5 border border-white/10 p-5 backdrop-blur-md space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Quick Demo Fill (1-Click)
              </span>
              <span className="text-[10px] text-slate-400">Click to autofill credentials</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => quickFill('aarav.sharma@example.com', 'Citizen@123')}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all group"
              >
                <div className="w-7 h-7 rounded-lg bg-indigo-600/40 text-indigo-300 flex items-center justify-center font-bold text-xs shrink-0 group-hover:scale-105 transition-transform">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <p className="font-semibold text-white truncate">Citizen (Aarav)</p>
                  <p className="text-[10px] text-slate-400">Pokhara Resident</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => quickFill('admin@pokhara.gov.np', 'Admin@123')}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all group"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-600/40 text-blue-300 flex items-center justify-center font-bold text-xs shrink-0 group-hover:scale-105 transition-transform">
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <p className="font-semibold text-white truncate">Municipal Admin</p>
                  <p className="text-[10px] text-slate-400">Pokhara Metro</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => quickFill('ramesh.thapa@pokhara.gov.np', 'Worker@123')}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all group"
              >
                <div className="w-7 h-7 rounded-lg bg-amber-600/40 text-amber-300 flex items-center justify-center font-bold text-xs shrink-0 group-hover:scale-105 transition-transform">
                  <Wrench className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <p className="font-semibold text-white truncate">Field Worker</p>
                  <p className="text-[10px] text-slate-400">Road Department</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => quickFill('superadmin@civora.org', 'SuperAdmin@123')}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all group"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-600/40 text-emerald-300 flex items-center justify-center font-bold text-xs shrink-0 group-hover:scale-105 transition-transform">
                  <Shield className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <p className="font-semibold text-white truncate">Platform Admin</p>
                  <p className="text-[10px] text-slate-400">Civora Root</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Metrics */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 pt-6 border-t border-white/10">
          <span>2,800+ Citizen Reports</span>
          <span>·</span>
          <span>73% Resolution Velocity</span>
          <span>·</span>
          <span>Pokhara & Kathmandu</span>
        </div>
      </div>

      {/* ---- Right side: Clean Modern Tailwind Form ---- */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full max-w-md space-y-6">

          {/* Mobile Brand */}
          <div className="lg:hidden text-center space-y-2 mb-6">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center shadow-md">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-black text-slate-900 tracking-tight">Civora</span>
            </Link>
            <p className="text-xs text-slate-500">Sign in to your civic intelligence account</p>
          </div>

          {/* Form Header */}
          <div className="space-y-1">
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              Welcome Back
            </h2>
            <p className="text-xs text-slate-500">
              Enter your credentials to access your dashboard and civic reports.
            </p>
          </div>

          {/* Registration Success Banner */}
          {registered && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-800 flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Account created successfully! Please sign in with your password.</span>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs font-medium text-red-700 flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all shadow-xs"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
                <a href="#" className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 hover:shadow-lg hover:shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  Sign In to Civora
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo buttons for mobile users */}
          <div className="lg:hidden pt-4 border-t border-slate-200">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Demo Credentials (Tap to fill):
            </p>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => quickFill('aarav.sharma@example.com', 'Citizen@123')}
                className="p-2 rounded-lg bg-white border border-slate-200 text-slate-700 text-left font-medium"
              >
                👤 Citizen
              </button>
              <button
                type="button"
                onClick={() => quickFill('admin@pokhara.gov.np', 'Admin@123')}
                className="p-2 rounded-lg bg-white border border-slate-200 text-slate-700 text-left font-medium"
              >
                🏛️ Pokhara Admin
              </button>
            </div>
          </div>

          {/* Switch to Register */}
          <div className="pt-2 text-center text-xs text-slate-500">
            Don&apos;t have an account yet?{' '}
            <Link href="/register" className="font-bold text-indigo-600 hover:text-indigo-700 underline underline-offset-4">
              Create citizen account free
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
