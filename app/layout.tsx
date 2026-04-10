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
    'Interactive data visualization for the 2025 Lancet Countdown report on health and climate change',
};

const topTabs = [
  { label: 'Health Hazards, Exposures, and Impacts', active: true },
  { label: 'Adaptation, Planning, and Resilience for Health', active: false },
  { label: 'Mitigation Actions and Health Co-Benefits', active: false },
  { label: 'Economics and Finance', active: false },
  { label: 'Public and Political Engagement', active: false },
];

const sidebarSubItems = [
  { label: '1.1.1 Heatwave Days (Attr.)', href: '#111attr' },
  { label: '1.1.1 Heatwave Exposure (Vuln.)', href: '#111vuln' },
  { label: '1.1.2 Heat & Physical Activity', href: '#112' },
  { label: '1.1.3 Labour Capacity (PWHL)', href: '#113pwhl' },
  { label: '1.1.3 Outdoor Workers', href: '#113workers' },
  { label: '1.1.4 Sleep Loss', href: '#114' },
  { label: '1.1.5 Heat-Related Mortality', href: '#115' },
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
        {/* ── Top nav bar ── */}
        <header className="fixed top-0 w-full z-50 glass shadow-sm px-6 py-3">
          <div className="max-w-screen-2xl mx-auto flex justify-between items-center">
            <div className="shrink-0">
              <span className="text-2xl font-bold tracking-tighter text-teal-950 font-headline uppercase">
                Lancet Countdown
              </span>
              <span className="text-2xl font-light tracking-tighter text-primary font-headline ml-1">
                2026
              </span>
            </div>
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

        <div className="flex pt-20 min-h-screen">
          {/* ── Sidebar ── */}
          <aside className="hidden lg:flex fixed left-4 top-20 bottom-4 w-64 glass rounded-3xl shadow-2xl shadow-slate-200/50 flex-col p-4 z-40 overflow-y-auto">
            <div className="px-4 pt-6 pb-4">
              <div className="text-lg font-bold text-teal-950 font-headline tracking-tight">INDICATORS</div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[10px] tracking-widest text-slate-400 font-headline">2026 LIVE ARCHIVE</span>
              </div>
            </div>

            <nav className="flex-1 space-y-1 px-1">
              {/* 1.1 Heat & Health — active */}
              <a
                href="#hero"
                className="w-full flex items-center space-x-3 px-4 py-3 bg-teal-50 text-teal-900 rounded-xl font-bold border-l-4 border-teal-700 transition-all"
              >
                <span className="material-symbols-outlined text-xl">thermostat</span>
                <span className="font-headline text-xs uppercase tracking-wide text-left leading-tight">
                  1.1 Health &amp; Heat
                </span>
              </a>

              {/* Sub-indicators */}
              <div className="pl-10 py-2 space-y-2.5">
                {sidebarSubItems.map((item) => (
                  <a
                    key={item.href}
                    className="block text-[11px] text-slate-500 hover:text-teal-700 transition-colors font-label leading-tight"
                    href={item.href}
                  >
                    {item.label}
                  </a>
                ))}
              </div>

              {/* 1.2 — inactive */}
              <button className="w-full flex items-center space-x-3 px-4 py-3 text-slate-500 hover:bg-slate-100/50 rounded-xl transition-all">
                <span className="material-symbols-outlined text-xl">thunderstorm</span>
                <span className="font-headline text-xs uppercase tracking-wide text-left leading-tight">
                  1.2 Health and Extreme Weather Events
                </span>
              </button>

              {/* 1.3 — inactive */}
              <button className="w-full flex items-center space-x-3 px-4 py-3 text-slate-500 hover:bg-slate-100/50 rounded-xl transition-all">
                <span className="material-symbols-outlined text-xl">coronavirus</span>
                <span className="font-headline text-xs uppercase tracking-wide text-left leading-tight">
                  1.3 Climate Suitability for Infectious Disease Transmission
                </span>
              </button>

              {/* 1.4 — inactive */}
              <button className="w-full flex items-center space-x-3 px-4 py-3 text-slate-500 hover:bg-slate-100/50 rounded-xl transition-all">
                <span className="material-symbols-outlined text-xl">nutrition</span>
                <span className="font-headline text-xs uppercase tracking-wide text-left leading-tight">
                  1.4 Food Security and Under Nutrition
                </span>
              </button>
            </nav>

            <button className="mt-auto bg-primary text-white py-4 rounded-2xl font-headline text-sm tracking-widest uppercase hover:bg-primary-container transition-colors">
              Download Full Report
            </button>
          </aside>

          {/* ── Main content canvas ── */}
          <main className="flex-1 min-w-0 w-full px-4 sm:px-6 lg:pl-0 lg:pr-8 lg:ml-72 pb-20">
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
