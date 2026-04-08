import type { Metadata } from 'next';
import { Oswald, Open_Sans } from 'next/font/google';
import './globals.css';

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
    'Interactive data visualization demo for Indicator 1.1.1: Exposure of Vulnerable Populations to Heatwaves',
};

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
        {/* ── Top nav bar ── */}
        <header className="fixed top-0 w-full z-50 glass shadow-sm px-6 py-3">
          <div className="max-w-screen-2xl mx-auto flex justify-between items-center">
            <div className="text-2xl font-bold tracking-tighter text-teal-950 font-headline uppercase">
              Lancet Countdown
            </div>
            <nav className="hidden md:flex space-x-8">
              <a className="text-slate-600 font-medium hover:text-teal-800 transition-colors" href="#">Reports</a>
              <a className="text-slate-600 font-medium hover:text-teal-800 transition-colors" href="#">Policy Briefs</a>
              <a className="text-teal-700 border-b-2 border-teal-700 font-bold" href="#">Indicators</a>
            </nav>
            <div className="flex items-center space-x-4">
              <div className="bg-surface-container-low px-3 py-1.5 rounded-full flex items-center space-x-2 text-on-surface-variant">
                <span className="material-symbols-outlined text-sm">search</span>
                <span className="text-sm font-label">Search indicators…</span>
              </div>
              <button className="material-symbols-outlined text-teal-900">settings</button>
            </div>
          </div>
        </header>

        <div className="flex pt-20 min-h-screen">
          {/* ── Sidebar ── */}
          <aside className="hidden lg:flex fixed left-4 top-20 bottom-4 w-64 glass rounded-3xl shadow-2xl shadow-slate-200/50 flex-col p-4 space-y-2 z-40">
            <div className="px-4 py-6">
              <div className="text-lg font-bold text-teal-900 font-headline">DATA EXPLORER</div>
              <div className="text-[10px] tracking-widest text-slate-400 font-headline">2026 ARCHIVE</div>
            </div>

            <nav className="flex-1 space-y-1">
              <button className="w-full flex items-center space-x-3 px-4 py-3 text-slate-500 hover:bg-slate-100/50 rounded-xl transition-all">
                <span className="material-symbols-outlined">dashboard</span>
                <span className="font-label font-semibold text-sm">Dashboard</span>
              </button>
              <button className="w-full flex items-center space-x-3 px-4 py-3 bg-teal-50 text-teal-900 rounded-xl font-bold border-l-4 border-teal-700 transition-all">
                <span className="material-symbols-outlined">thermostat</span>
                <span className="font-label text-sm text-left">Climate Impacts</span>
              </button>
              <div className="pl-12 py-2 space-y-3">
                <a className="block text-xs font-bold text-teal-700" href="#">1.1 Health and Heat</a>
                <a className="block text-xs text-slate-500 hover:text-teal-600" href="#">1.2 Health and Extreme Weather</a>
                <a className="block text-xs text-slate-500 hover:text-teal-600" href="#">1.3 Infectious Disease</a>
                <a className="block text-xs text-slate-500 hover:text-teal-600" href="#">1.4 Food Security</a>
              </div>
              <button className="w-full flex items-center space-x-3 px-4 py-3 text-slate-500 hover:bg-slate-100/50 rounded-xl transition-all">
                <span className="material-symbols-outlined">shield_with_heart</span>
                <span className="font-label font-semibold text-sm">Adaptation</span>
              </button>
              <button className="w-full flex items-center space-x-3 px-4 py-3 text-slate-500 hover:bg-slate-100/50 rounded-xl transition-all">
                <span className="material-symbols-outlined">eco</span>
                <span className="font-label font-semibold text-sm">Mitigation</span>
              </button>
              <button className="w-full flex items-center space-x-3 px-4 py-3 text-slate-500 hover:bg-slate-100/50 rounded-xl transition-all">
                <span className="material-symbols-outlined">payments</span>
                <span className="font-label font-semibold text-sm">Economics</span>
              </button>
            </nav>

            <button className="mt-auto bg-primary text-white py-4 rounded-2xl font-headline text-sm tracking-widest uppercase hover:bg-primary-container transition-colors">
              Download Full Report
            </button>
          </aside>

          {/* ── Main content canvas ── */}
          <main className="flex-1 px-4 sm:px-6 lg:pl-0 lg:pr-8 lg:ml-72 pb-20">
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
      </body>
    </html>
  );
}
