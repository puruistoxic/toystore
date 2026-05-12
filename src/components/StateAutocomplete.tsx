import React, {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Check, ChevronDown, MapPin, Plus } from 'lucide-react';
import api from '../utils/api';

type StateRow = {
  id: string;
  name: string;
  country_code?: string;
  slug?: string;
};

type Props = {
  value: string;
  onChange: (value: string) => void;
  countryCode?: string;
  /** Visual error state (e.g. when validation fails). */
  invalid?: boolean;
  placeholder?: string;
  disabled?: boolean;
  /** Optional id for the underlying input (for label association). */
  id?: string;
  className?: string;
  /** Optional aria-describedby. */
  describedBy?: string;
};

// Tiny in-memory cache so multiple instances of this component don't refetch.
const cache = new Map<string, StateRow[]>();
let inflight: Map<string, Promise<StateRow[]>> = new Map();

async function fetchStates(countryCode?: string): Promise<StateRow[]> {
  const key = countryCode || '*';
  if (cache.has(key)) return cache.get(key) as StateRow[];
  const existing = inflight.get(key);
  if (existing) return existing;
  const p = (async () => {
    try {
      const res = await api.get<StateRow[]>(
        countryCode
          ? `/content/states?country_code=${encodeURIComponent(countryCode)}`
          : '/content/states',
      );
      const list = Array.isArray(res.data) ? res.data : [];
      cache.set(key, list);
      return list;
    } catch {
      cache.set(key, []);
      return [];
    } finally {
      inflight.delete(key);
    }
  })();
  inflight.set(key, p);
  return p;
}

function normalize(s: string): string {
  return s.trim().toLowerCase();
}

const StateAutocomplete: React.FC<Props> = ({
  value,
  onChange,
  countryCode,
  invalid,
  placeholder = 'Select or type a state',
  disabled,
  id,
  className,
  describedBy,
}) => {
  const autoId = useId();
  const inputId = id || `state-autocomplete-${autoId}`;
  const listboxId = `${inputId}-listbox`;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const [states, setStates] = useState<StateRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);

  // Keep the visible text in sync with controlled value.
  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchStates(countryCode).then((list) => {
      if (cancelled) return;
      setStates(list);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [countryCode]);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  const filtered = useMemo(() => {
    const q = normalize(query);
    if (!q) return states.slice(0, 100);
    const starts: StateRow[] = [];
    const includes: StateRow[] = [];
    for (const s of states) {
      const n = normalize(s.name);
      if (n.startsWith(q)) starts.push(s);
      else if (n.includes(q)) includes.push(s);
    }
    return [...starts, ...includes].slice(0, 100);
  }, [query, states]);

  const exactMatch = useMemo(() => {
    const q = normalize(query);
    if (!q) return null;
    return states.find((s) => normalize(s.name) === q) || null;
  }, [query, states]);

  const showAddOption = useMemo(() => {
    const q = query.trim();
    if (!q) return false;
    return !exactMatch;
  }, [query, exactMatch]);

  // Reset highlight when filter changes / dropdown opens.
  useEffect(() => {
    setHighlight(0);
  }, [query, open]);

  const totalOptions = filtered.length + (showAddOption ? 1 : 0);

  const commit = useCallback(
    (next: string) => {
      onChange(next);
      setQuery(next);
      setOpen(false);
      // Move focus back to the input after committing so keyboard users
      // can keep filling the form without an extra tab.
      window.setTimeout(() => inputRef.current?.focus(), 0);
    },
    [onChange],
  );

  const selectByIndex = useCallback(
    (idx: number) => {
      if (idx < 0) return;
      if (idx < filtered.length) {
        commit(filtered[idx].name);
      } else if (showAddOption) {
        commit(query.trim());
      }
    },
    [filtered, showAddOption, commit, query],
  );

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!open) setOpen(true);
      setHighlight((h) => (totalOptions === 0 ? 0 : Math.min(h + 1, totalOptions - 1)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!open) setOpen(true);
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      if (!open) return;
      e.preventDefault();
      selectByIndex(highlight);
    } else if (e.key === 'Escape') {
      if (open) {
        e.preventDefault();
        setOpen(false);
      }
    } else if (e.key === 'Tab') {
      // Close silently; preserve current text on blur.
      setOpen(false);
    }
  };

  // Keep the highlighted option scrolled into view.
  useEffect(() => {
    if (!open) return;
    const ul = listRef.current;
    if (!ul) return;
    const node = ul.querySelector<HTMLElement>(`[data-idx="${highlight}"]`);
    if (node) node.scrollIntoView({ block: 'nearest' });
  }, [highlight, open]);

  const baseClasses = `w-full pl-9 pr-9 py-2.5 rounded-xl border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
    invalid ? 'border-red-400' : 'border-gray-200'
  } ${disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}`;

  return (
    <div ref={wrapRef} className={`relative ${className || ''}`}>
      <MapPin className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      <input
        ref={inputRef}
        id={inputId}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={
          open && highlight >= 0 && highlight < totalOptions
            ? `${inputId}-opt-${highlight}`
            : undefined
        }
        aria-describedby={describedBy}
        autoComplete="address-level1"
        value={query}
        disabled={disabled}
        placeholder={placeholder}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          onChange(e.target.value);
          if (!open) setOpen(true);
        }}
        onKeyDown={onKeyDown}
        className={baseClasses}
      />
      <button
        type="button"
        tabIndex={-1}
        aria-label={open ? 'Close suggestions' : 'Show suggestions'}
        onClick={() => {
          if (disabled) return;
          setOpen((o) => !o);
          window.setTimeout(() => inputRef.current?.focus(), 0);
        }}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-700"
      >
        <ChevronDown
          className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && !disabled && (
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          className="absolute z-30 top-full mt-1 left-0 right-0 max-h-72 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg py-1"
        >
          {loading && filtered.length === 0 && (
            <li className="px-3 py-2 text-xs text-gray-500">Loading states…</li>
          )}
          {!loading && filtered.length === 0 && !showAddOption && (
            <li className="px-3 py-2 text-xs text-gray-500">
              No matches. Start typing a state name.
            </li>
          )}
          {filtered.map((s, i) => {
            const active = i === highlight;
            const isSelected = normalize(s.name) === normalize(query);
            return (
              <li
                key={s.id}
                id={`${inputId}-opt-${i}`}
                role="option"
                data-idx={i}
                aria-selected={isSelected}
                onMouseDown={(e) => {
                  // mousedown (not click) so we don't lose focus before commit
                  e.preventDefault();
                  commit(s.name);
                }}
                onMouseEnter={() => setHighlight(i)}
                className={`px-3 py-2 text-sm cursor-pointer flex items-center gap-2 ${
                  active ? 'bg-primary-50 text-primary-900' : 'text-gray-800'
                }`}
              >
                <span className="flex-1 truncate">{highlightMatch(s.name, query)}</span>
                {isSelected && <Check className="h-4 w-4 text-primary-600" />}
              </li>
            );
          })}
          {showAddOption && (
            <li
              id={`${inputId}-opt-${filtered.length}`}
              role="option"
              data-idx={filtered.length}
              aria-selected={false}
              onMouseDown={(e) => {
                e.preventDefault();
                commit(query.trim());
              }}
              onMouseEnter={() => setHighlight(filtered.length)}
              className={`px-3 py-2 text-sm cursor-pointer flex items-center gap-2 border-t border-gray-100 ${
                highlight === filtered.length
                  ? 'bg-primary-50 text-primary-900'
                  : 'text-primary-700'
              }`}
            >
              <Plus className="h-4 w-4" />
              <span className="flex-1 truncate">
                Add new: <span className="font-semibold">"{query.trim()}"</span>
              </span>
            </li>
          )}
        </ul>
      )}
    </div>
  );
};

/** Highlight the matching substring (case-insensitive). */
function highlightMatch(name: string, query: string): React.ReactNode {
  const q = query.trim();
  if (!q) return name;
  const i = name.toLowerCase().indexOf(q.toLowerCase());
  if (i < 0) return name;
  return (
    <>
      {name.slice(0, i)}
      <mark className="bg-amber-100 text-amber-900 rounded px-0.5">
        {name.slice(i, i + q.length)}
      </mark>
      {name.slice(i + q.length)}
    </>
  );
}

export default StateAutocomplete;
