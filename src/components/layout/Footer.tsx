// ============================================================
// Footer Component - Pure Tailwind CSS
// ============================================================

import Link from 'next/link';
import { Shield, Globe, Share2, Mail, Heart, Sparkles, CheckCircle2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-900 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">

          {/* Brand & Mission */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center shadow-md shadow-indigo-500/20">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-black tracking-tight text-white">Civora</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-800">
                Nepal
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              AI-powered civic intelligence, verification, and resolution infrastructure.
              Transforming community reports into transparent, prioritized public action for
              Pokhara, Kathmandu, and municipal authorities worldwide.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              All Systems Operational · Public Transparency Active
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">
              Platform
            </h4>
            <div className="space-y-2.5">
              {[
                { href: '/explore', label: 'Explore Issues' },
                { href: '/map', label: 'Live GIS Map' },
                { href: '/report', label: 'Report Issue' },
                { href: '/transparency', label: 'Civic Transparency' },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block text-xs text-slate-400 hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Municipal Solutions */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">
              Municipalities
            </h4>
            <div className="space-y-2.5">
              {[
                { href: '/org/pokhara-metro', label: 'Pokhara Metropolitan Portal' },
                { href: '/login', label: 'Officer Sign In' },
                { href: '/transparency', label: 'Open Civic Data API' },
                { href: '/report', label: 'Field Evidence Upload' },
              ].map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="block text-xs text-slate-400 hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Community & Verification */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">
              Citizen Governance
            </h4>
            <div className="space-y-2.5">
              {[
                { href: '/citizen/profile', label: 'Reputation & Badges' },
                { href: '/explore?filter=VERIFIED', label: 'Community Verified Feed' },
                { href: '/explore?filter=RESOLVED', label: 'Before/After Showcase' },
                { href: '/register', label: 'Join Community Roster' },
              ].map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="block text-xs text-slate-400 hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p className="text-slate-500">
            © {new Date().getFullYear()} Civora Civic Tech. Built with high precision for smarter municipal operations.
          </p>
          <div className="flex items-center gap-4 text-slate-500">
            <span className="hover:text-slate-400 transition-colors">Privacy & Open Data</span>
            <span>·</span>
            <span className="hover:text-slate-400 transition-colors">Security</span>
            <span>·</span>
            <span className="hover:text-slate-400 transition-colors">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
