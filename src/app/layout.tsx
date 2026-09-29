// ============================================================
// Root Layout - The wrapper for ALL pages
// ============================================================
// In Next.js App Router, layout.tsx wraps every page.
// This is where we:
// - Set up the HTML document (<html>, <head>, <body>)
// - Load fonts and global CSS
// - Add the Navbar and Footer that appear on every page
// ============================================================

import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/providers/AuthProvider';

// SEO metadata that appears in browser tabs and search results
export const metadata: Metadata = {
  title: {
    default: 'Civora — AI-Powered Community Issue Detection & Resolution',
    template: '%s | Civora',
  },
  description:
    'Civora transforms community reports into verified, prioritized civic action. Report issues, verify with neighbors, and track resolution with complete transparency.',
  keywords: [
    'civic tech', 'community issues', 'municipality', 'pothole reporting',
    'smart city', 'citizen engagement', 'issue tracking', 'Nepal',
  ],
};

// The layout component wraps ALL pages
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="antialiased">
      <body className="min-h-screen flex flex-col">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
