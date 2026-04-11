'use client';

import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'lc_gate_ok';

/** Set on Vercel: same value users type to enter (visible in client bundle — casual access only). */
const GATE_PASSWORD = process.env.NEXT_PUBLIC_GATE_PASSWORD ?? '';

/** Shown under the logo; override with NEXT_PUBLIC_GATE_PROJECT_TITLE. */
const PROJECT_TITLE = process.env.NEXT_PUBLIC_GATE_PROJECT_TITLE ?? 'Data Platform Demo';

export default function ClientAccessGate({ children }: { children: React.ReactNode }) {
  const hasGate = GATE_PASSWORD.length > 0;
  const [unlocked, setUnlocked] = useState(!hasGate);

  useEffect(() => {
    if (!hasGate) return;
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === '1') {
        setUnlocked(true);
      }
    } catch {
      /* sessionStorage unavailable */
    }
  }, [hasGate]);

  const unlock = useCallback((pwd: string) => {
    if (pwd === GATE_PASSWORD) {
      try {
        sessionStorage.setItem(STORAGE_KEY, '1');
      } catch {
        /* ignore */
      }
      setUnlocked(true);
      return true;
    }
    return false;
  }, []);

  if (!hasGate || unlocked) {
    return <>{children}</>;
  }

  return <GateScreen onUnlock={unlock} projectTitle={PROJECT_TITLE} />;
}

function GateScreen({
  onUnlock,
  projectTitle,
}: {
  onUnlock: (pwd: string) => boolean;
  projectTitle: string;
}) {
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(false);
    if (!onUnlock(value.trim())) {
      setError(true);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex min-h-screen flex-col items-center justify-center px-6 py-12"
      style={{
        background: 'linear-gradient(165deg, #003d5c 0%, #001a26 45%, #000f18 100%)',
      }}
    >
      <div className="flex w-full max-w-md flex-col items-center text-center">
        <div className="mb-8 flex justify-center">
          <Image
            src="/lancet-countdown-logo-gate.svg"
            alt=""
            width={270}
            height={156}
            priority
            className="h-auto w-[min(85vw,280px)] brightness-0 invert"
          />
        </div>
        <h1 className="font-headline text-3xl font-bold uppercase tracking-tight text-white sm:text-4xl">
          {projectTitle}
        </h1>
        <p className="mt-3 text-sm text-white/55 font-body">Enter the access phrase to continue.</p>

        <form onSubmit={submit} className="mt-10 w-full max-w-sm space-y-4">
          <label htmlFor="gate-password" className="sr-only">
            Access phrase
          </label>
          <input
            id="gate-password"
            type="password"
            autoComplete="current-password"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError(false);
            }}
            placeholder="Access phrase"
            className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-center text-base text-white placeholder:text-white/35 outline-none ring-0 transition focus:border-white/40 focus:bg-white/15 font-body"
          />
          {error ? (
            <p className="text-sm text-red-300/90" role="alert">
              That phrase doesn&apos;t match. Try again.
            </p>
          ) : null}
          <button
            type="submit"
            className="w-full rounded-xl bg-white/95 px-4 py-3 text-sm font-headline font-bold uppercase tracking-widest text-[#001a26] shadow-lg transition hover:bg-white"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}
