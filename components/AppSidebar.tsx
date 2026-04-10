'use client';

import { useEffect, useState, useCallback } from 'react';
import { SIDEBAR_SCROLL_IDS, sidebarSubItems, type SidebarScrollId } from '@/lib/navConfig';

/** Pixels from viewport top; section is “current” once its top crosses this (below fixed header). */
const SCROLL_ACTIVATION_OFFSET = 132;

function computeActiveSection(): SidebarScrollId {
  if (typeof document === 'undefined') return 'hero';
  let active: SidebarScrollId = 'hero';
  for (const id of SIDEBAR_SCROLL_IDS) {
    const el = document.getElementById(id);
    if (!el) continue;
    const top = el.getBoundingClientRect().top;
    if (top <= SCROLL_ACTIVATION_OFFSET) active = id;
  }
  return active;
}

export default function AppSidebar() {
  const [activeId, setActiveId] = useState<SidebarScrollId>('hero');

  const updateActive = useCallback(() => {
    setActiveId(computeActiveSection());
  }, []);

  useEffect(() => {
    updateActive();
    window.addEventListener('scroll', updateActive, { passive: true });
    window.addEventListener('resize', updateActive, { passive: true });
    return () => {
      window.removeEventListener('scroll', updateActive);
      window.removeEventListener('resize', updateActive);
    };
  }, [updateActive]);

  const isHeroActive = activeId === 'hero';

  return (
    <aside className="hidden lg:flex fixed left-4 top-20 bottom-4 w-64 glass rounded-3xl shadow-2xl shadow-slate-200/50 flex-col p-4 z-40 overflow-y-auto">
      <div className="px-4 pt-6 pb-4">
        <div className="text-2xl font-bold text-teal-950 font-headline tracking-tight">INDICATORS</div>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[13px] tracking-widest text-slate-400 font-headline">2026 LIVE ARCHIVE</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-1">
        <a
          href="#hero"
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-bold border-l-4 transition-all ${
            isHeroActive
              ? 'bg-teal-50 text-teal-900 border-teal-700'
              : 'bg-teal-50/60 text-teal-800 border-teal-500/40 hover:bg-teal-50'
          }`}
        >
          <span className="material-symbols-outlined text-2xl">thermostat</span>
          <span className="font-headline text-base uppercase tracking-wide text-left leading-snug">
            1.1 Health &amp; Heat
          </span>
        </a>

        <div className="pl-8 py-2 space-y-1">
          {sidebarSubItems.map((item) => {
            const on = activeId === item.sectionId;
            return (
              <a
                key={item.href}
                href={item.href}
                className={`block rounded-lg px-2.5 py-2.5 text-sm leading-snug transition-colors font-label border-l-[3px] ${
                  on
                    ? 'bg-teal-100/90 text-teal-950 border-teal-600 font-semibold shadow-sm ring-1 ring-teal-200/80'
                    : 'text-slate-600 border-transparent hover:text-teal-700 hover:bg-teal-50/50'
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </div>

        <button
          type="button"
          className="w-full flex items-center space-x-3 px-4 py-3 text-slate-500 hover:bg-slate-100/50 rounded-xl transition-all text-left"
        >
          <span className="material-symbols-outlined text-2xl">thunderstorm</span>
          <span className="font-headline text-[15px] uppercase tracking-wide leading-snug">
            1.2 Health and Extreme Weather Events
          </span>
        </button>

        <button
          type="button"
          className="w-full flex items-center space-x-3 px-4 py-3 text-slate-500 hover:bg-slate-100/50 rounded-xl transition-all text-left"
        >
          <span className="material-symbols-outlined text-2xl">coronavirus</span>
          <span className="font-headline text-[15px] uppercase tracking-wide leading-snug">
            1.3 Climate Suitability for Infectious Disease Transmission
          </span>
        </button>

        <button
          type="button"
          className="w-full flex items-center space-x-3 px-4 py-3 text-slate-500 hover:bg-slate-100/50 rounded-xl transition-all text-left"
        >
          <span className="material-symbols-outlined text-2xl">nutrition</span>
          <span className="font-headline text-[15px] uppercase tracking-wide leading-snug">
            1.4 Food Security and Under Nutrition
          </span>
        </button>
      </nav>

      <button
        type="button"
        className="mt-auto bg-primary text-white py-4 rounded-2xl font-headline text-[15px] tracking-widest uppercase hover:bg-primary-container transition-colors"
      >
        Download Full Report
      </button>
    </aside>
  );
}
