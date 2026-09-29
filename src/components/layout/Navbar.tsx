// ============================================================
// Navbar Component - Pure Tailwind CSS
// ============================================================

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  Shield,
  MapPin,
  Search,
  FileText,
  BarChart3,
  Menu,
  X,
  LogIn,
  User,
  LogOut,
  Building2,
  ChevronDown,
} from 'lucide-react';

import NotificationBell from './NotificationBell';

const navLinks = [
  { href: '/explore', label: 'Explore Issues', icon: Search },
  { href: '/map', label: 'Live Map', icon: MapPin },
  { href: '/report', label: 'Report Issue', icon: FileText },
  { href: '/transparency', label: 'Transparency', icon: BarChart3 },
];

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isActive = (href: string) => pathname === href;
  const isOrgUser = session?.user?.role === 'ORG_STAFF' || session?.user?.role === 'ORG_ADMIN';
  const orgSlug = session?.user?.orgSlug || 'pokhara-metro';

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ---- Logo ---- */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-500 flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                Civora
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100/80">
                Nepal
              </span>
            </div>
          </Link>

          {/* ---- Desktop Navigation Links ---- */}
          <div className="hidden md:flex items-center gap-1.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    active
                      ? 'text-indigo-600 bg-indigo-50 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-indigo-600' : 'text-slate-400'}`} />
                  {link.label}
                </Link>
              );
            })}

            {/* If Org user, show quick link to Org Dashboard */}
            {isOrgUser && (
              <Link
                href={`/org/${orgSlug}`}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  pathname.startsWith('/org')
                    ? 'text-indigo-600 bg-indigo-50 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <Building2 className="w-4 h-4 text-indigo-500" />
                Org Console
              </Link>
            )}
          </div>

          {/* ---- Right Side: Auth / CTA ---- */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/report"
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/20 hover:shadow-md hover:shadow-indigo-600/30 transition-all duration-200"
            >
              <FileText className="w-3.5 h-3.5" />
              Report Issue
            </Link>

            {status === 'loading' ? (
              <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse" />
            ) : session?.user ? (
              <div className="flex items-center gap-2">
                <NotificationBell />
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors shadow-xs"
                  >
                    <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      {session.user.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="text-left text-xs">
                      <p className="font-semibold text-slate-800 leading-tight truncate max-w-[100px]">
                        {session.user.name?.split(' ')[0]}
                      </p>
                      <span className="text-[10px] text-indigo-600 font-medium capitalize block">
                        {session.user.role?.toLowerCase().replace('_', ' ')}
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-xl border border-slate-200/90 p-2 z-50">
                      <div className="px-3 py-2 border-b border-slate-100 mb-1">
                        <p className="font-semibold text-xs text-slate-900 truncate">{session.user.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{session.user.email}</p>
                      </div>

                      <Link
                        href="/citizen/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                      >
                        <User className="w-4 h-4 text-indigo-500" />
                        Citizen Profile & Badges
                      </Link>

                      <Link
                        href="/citizen/my-reports"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                      >
                        <FileText className="w-4 h-4 text-emerald-500" />
                        My Reports & Follows
                      </Link>

                      {isOrgUser && (
                        <Link
                          href={`/org/${orgSlug}`}
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                        >
                          <Building2 className="w-4 h-4 text-blue-500" />
                          Organization Portal
                        </Link>
                      )}

                      <div className="border-t border-slate-100 my-1" />

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          signOut({ callbackUrl: '/' });
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100/70 border border-slate-200 transition-all duration-200 shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign In
              </Link>
            )}
          </div>

          {/* ---- Mobile Menu Button ---- */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ---- Mobile Menu ---- */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white shadow-xl">
          <div className="px-4 py-3 space-y-1.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? 'text-indigo-600 bg-indigo-50'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}

            {isOrgUser && (
              <Link
                href={`/org/${orgSlug}`}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-indigo-600 hover:bg-indigo-50"
              >
                <Building2 className="w-4 h-4" />
                Organization Console
              </Link>
            )}

            <div className="pt-3 border-t border-slate-100">
              {session?.user ? (
                <div className="space-y-1.5">
                  <div className="px-3 py-1">
                    <p className="font-semibold text-xs text-slate-900">{session.user.name}</p>
                    <p className="text-[11px] text-slate-500">{session.user.email}</p>
                  </div>
                  <Link
                    href="/citizen/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <User className="w-4 h-4 text-indigo-500" />
                    Profile & Badges
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      signOut({ callbackUrl: '/' });
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-xs font-semibold rounded-xl bg-slate-100 text-slate-800 hover:bg-slate-200"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
