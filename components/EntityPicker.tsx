'use client';

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';

export const ENTITY_COLORS = [
  '#004e6f',
  '#B5334F',
  '#259AD4',
  '#E67E22',
  '#2ECC71',
  '#9B59B6',
  '#1ABC9C',
  '#E74C3C',
] as const;

export interface EntityCategory {
  category: string;
  items: string[];
}

interface Props {
  categories: EntityCategory[];
  selected: string[];
  onChange: (entities: string[]) => void;
  maxSelections?: number;
  dark?: boolean;
  /** Swatch colours for selected entities (e.g. left-axis teal ramp). Merges over default ENTITY_COLORS. */
  entityColors?: Record<string, string>;
}

export function getEntityColor(entity: string, selected: string[]): string {
  return buildColorMap(selected)[entity] ?? ENTITY_COLORS[0];
}

export function buildColorMap(selected: string[]): Record<string, string> {
  const map: Record<string, string> = {};
  let ci = 0;
  for (const s of selected) {
    if (s === 'Global') {
      map[s] = ENTITY_COLORS[0];
    } else {
      ci++;
      map[s] = ENTITY_COLORS[ci % ENTITY_COLORS.length];
    }
  }
  return map;
}

export default function EntityPicker({
  categories,
  selected,
  onChange,
  maxSelections = 8,
  dark = false,
  entityColors,
}: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const colorMap = useMemo(() => {
    const base = buildColorMap(selected);
    if (!entityColors) return base;
    const m = { ...base };
    for (const s of selected) {
      if (entityColors[s]) m[s] = entityColors[s];
    }
    return m;
  }, [selected, entityColors]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return categories;
    return categories
      .map((c) => ({
        ...c,
        items: c.items.filter((item) => item.toLowerCase().includes(q)),
      }))
      .filter((c) => c.items.length > 0);
  }, [categories, search]);

  const toggle = useCallback(
    (entity: string) => {
      if (selected.includes(entity)) {
        if (selected.length <= 1) return;
        onChange(selected.filter((s) => s !== entity));
      } else {
        if (selected.length >= maxSelections) return;
        onChange([...selected, entity]);
      }
    },
    [selected, onChange, maxSelections],
  );

  const remove = useCallback(
    (entity: string) => {
      if (selected.length <= 1) return;
      onChange(selected.filter((s) => s !== entity));
    },
    [selected, onChange],
  );

  const pillBg = dark
    ? 'bg-white/10 border-white/20 text-white'
    : 'bg-white border-slate-200 text-slate-700';
  const addBtnClass = dark
    ? 'bg-white/10 border-white/20 text-white/70 hover:bg-white/20'
    : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100';

  return (
    <div ref={ref} className="relative">
      {/* pill bar */}
      <div className="flex flex-wrap items-center gap-1.5">
        {selected.map((entity) => (
          <span
            key={entity}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${pillBg}`}
          >
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ background: colorMap[entity] }}
            />
            <span className="truncate max-w-[120px]">{entity}</span>
            {selected.length > 1 && (
              <button
                onClick={() => remove(entity)}
                className="opacity-50 hover:opacity-100 ml-0.5"
                aria-label={`Remove ${entity}`}
              >
                <span className="material-symbols-outlined text-[14px]">
                  close
                </span>
              </button>
            )}
          </span>
        ))}
        {selected.length < maxSelections && (
          <button
            onClick={() => setOpen(!open)}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors ${addBtnClass}`}
          >
            <span className="material-symbols-outlined text-[14px]">add</span>
            Add
          </button>
        )}
      </div>

      {/* dropdown */}
      {open && (
        <div
          className={`absolute left-0 top-full mt-2 w-72 max-h-80 rounded-2xl shadow-2xl border overflow-hidden z-50 ${
            dark
              ? 'bg-emerald-950 border-emerald-700/50 text-white'
              : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          {/* search input */}
          <div className="p-3 border-b border-current/10">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                dark ? 'bg-white/10' : 'bg-slate-50'
              }`}
            >
              <span className="material-symbols-outlined text-sm opacity-50">
                search
              </span>
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search entities..."
                className="flex-1 bg-transparent text-sm outline-none placeholder:opacity-40"
              />
            </div>
          </div>

          {/* entity list */}
          <div className="overflow-y-auto max-h-56 p-2">
            {filtered.length === 0 && (
              <div className="text-center text-xs opacity-40 py-4">
                No matches
              </div>
            )}
            {filtered.map((cat) => (
              <div key={cat.category} className="mb-2">
                <div className="text-[10px] font-headline uppercase tracking-widest opacity-40 px-2 py-1">
                  {cat.category}
                </div>
                {cat.items.map((item) => {
                  const isSelected = selected.includes(item);
                  return (
                    <button
                      key={item}
                      onClick={() => {
                        toggle(item);
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-left text-sm transition-colors ${
                        isSelected
                          ? dark
                            ? 'bg-white/10'
                            : 'bg-primary/5'
                          : dark
                            ? 'hover:bg-white/5'
                            : 'hover:bg-slate-50'
                      }`}
                    >
                      {isSelected ? (
                        <span
                          className="w-4 h-4 rounded flex items-center justify-center text-white text-[10px]"
                          style={{ background: colorMap[item] || ENTITY_COLORS[0] }}
                        >
                          <span className="material-symbols-outlined text-[12px]">
                            check
                          </span>
                        </span>
                      ) : (
                        <span
                          className={`w-4 h-4 rounded border ${
                            dark ? 'border-white/30' : 'border-slate-300'
                          }`}
                        />
                      )}
                      <span className="truncate">{item}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
