'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import type { SearchResultItem } from '@/server/search/search-service';
import { StatusPill } from '@/components/ui/status-pill';

export function GlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Global Keyboard Shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch search results on debounce
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        const json = await res.json();
        if (json.status === 'success') {
          setResults(json.data);
          setSelectedIndex(0);
          setIsOpen(true);
        }
      } catch (err) {
        console.error('Search request failed:', err);
      } finally {
        setIsLoading(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (item: SearchResultItem) => {
    setIsOpen(false);
    setQuery('');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    router.push(item.href as any);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      handleSelect(results[selectedIndex]!);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative">
        <input
          ref={inputRef}
          aria-autocomplete="list"
          aria-controls="global-search-results"
          aria-expanded={isOpen && results.length > 0}
          aria-label="Global authority search"
          className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 pr-16 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 shadow-2xs transition-all"
          placeholder="Search settlements, red zones, relocation sectors..."
          role="combobox"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          onKeyDown={handleInputKeyDown}
        />
        <div className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center gap-1">
          <kbd className="rounded-md border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[9px] font-semibold text-slate-500 shadow-2xs">
            Ctrl K
          </kbd>
        </div>
      </div>

      {isOpen && (results.length > 0 || isLoading) && (
        <div className="absolute top-full z-50 mt-1.5 max-h-80 w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white/98 p-1.5 shadow-elevated backdrop-blur-md">
          {isLoading && (
            <div className="p-3 text-center text-xs text-slate-500">Searching authority registries...</div>
          )}
          {!isLoading && results.length === 0 && (
            <div className="p-3 text-center text-xs text-slate-500">No matching entities found.</div>
          )}
          {!isLoading &&
            results.map((item, idx) => (
              <button
                key={`${item.category}-${item.id}`}
                className={`flex w-full items-start justify-between gap-2 rounded-xl p-2.5 text-left text-xs transition-colors ${
                  selectedIndex === idx ? 'bg-blue-50/80 font-medium text-blue-950' : 'hover:bg-slate-50 text-slate-800'
                }`}
                onClick={() => handleSelect(item)}
                type="button"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <span>{item.title}</span>
                    <span className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-slate-500">
                      {item.categoryLabel}
                    </span>
                  </div>
                  <div className="truncate text-[11px] text-slate-500 mt-0.5">{item.subtitle}</div>
                </div>
                {item.badgeTone && (
                  <StatusPill tone={item.badgeTone}>
                    {item.category === 'habitation' ? 'ASSESSED' : item.category === 'red_zone' ? 'RED ZONE' : 'SECTOR'}
                  </StatusPill>
                )}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
