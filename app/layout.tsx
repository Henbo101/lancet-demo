import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Oswald, Open_Sans } from 'next/font/google';
import './globals.css';
import AppSidebar from '@/components/AppSidebar';
import ClientAccessGate from '@/components/ClientAccessGate';

const oswald = Oswald({
  subsets: ['latin'],
  variable: '--font-oswald',
  display: 'swap',
});

const openSans = Open_Sans({
  subsets: ['latin'],
  variable: '--font-open-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'LANCET COUNTDOWN | DATA EXPLORER',
  description:
    'Interactive data visualization for the 2025 Lancet Countdown report on health and climate change',
};

const topTabs = [
  { label: 'Health Hazards, Exposures, and Impacts', active: true },
  { label: 'Adaptation, Planning, and Resilience for Health', active: false },
  { label: 'Mitigation Actions and Health Co-Benefits', active: false },
  { label: 'Economics and Finance', active: false },
  { label: 'Public and Political Engagement', active: false },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`light ${oswald.variable} ${openSans.variable}`}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <ClientAccessGate>
        {/* ── Top nav bar ── */}
        <header className="fixed top-0 w-full z-50 glass shadow-sm px-6 py-3">
          <div className="max-w-screen-2xl mx-auto flex justify-between items-center">
            <Link
              href="/"
              className="shrink-0 inline-flex items-center"
              aria-label="Lancet Countdown — home"
            >
              <Image
                src="/lancet-countdown-logo.png"
                alt=""
                width={408}
                height={408}
                className="h-[4.5rem] w-[4.5rem] sm:h-20 sm:w-20 object-contain"
                priority
              />
            </Link>
            <nav className="hidden lg:flex items-center space-x-8 ml-8">
              {topTabs.map((tab) => (
                <a
                  key={tab.label}
                  className={`text-[11px] uppercase tracking-wider font-headline leading-tight max-w-[160px] ${
                    tab.active
                      ? 'text-teal-700 border-b-2 border-teal-700 font-bold pb-1'
                      : 'text-slate-500 font-medium hover:text-teal-800 transition-colors pb-1'
                  }`}
                  href="#"
                >
                  {tab.label}
                </a>
              ))}
            </nav>
            <div className="flex items-center space-x-4 shrink-0">
              <div className="hidden sm:flex bg-surface-container-low px-3 py-1.5 rounded-full items-center space-x-2 text-on-surface-variant">
                <span className="material-symbols-outlined text-sm">search</span>
                <span className="text-sm font-label">Search…</span>
              </div>
              <button className="material-symbols-outlined text-teal-900">settings</button>
            </div>
          </div>
        </header>

        <div className="flex pt-28 min-h-screen">
          <AppSidebar />

          {/* ── Main content canvas ── */}
          <main className="flex-1 min-w-0 w-full overflow-x-hidden px-4 sm:px-6 lg:pl-0 lg:pr-8 lg:ml-72 pb-20">
            {children}
          </main>
        </div>

        {/* ── Footer ── */}
        <footer className="w-full py-8 mt-auto bg-slate-50 border-t border-slate-200/50">
          <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row justify-between items-center px-12">
            <div className="text-sm font-label text-slate-500 mb-4 md:mb-0">
              © 2026 Lancet Countdown. All rights reserved.
            </div>
            <div className="flex space-x-8">
              <a className="text-sm font-label text-slate-500 hover:text-teal-600 transition-colors" href="#">Methodology</a>
              <a className="text-sm font-label text-slate-500 hover:text-teal-600 transition-colors" href="#">Data Access</a>
              <a className="text-sm font-label text-slate-500 hover:text-teal-600 transition-colors" href="#">Privacy Policy</a>
              <a className="text-sm font-label text-slate-500 hover:text-teal-600 transition-colors" href="#">Contact</a>
            </div>
          </div>
        </footer>
        </ClientAccessGate>
      </body>
    </html>
  );
}
