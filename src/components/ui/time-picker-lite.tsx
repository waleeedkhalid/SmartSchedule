// components/ui/time-picker-lite.tsx
"use client";
import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  value?: string; // "HH:mm" or "h:mm a" if use12Hours
  onChange?: (v: string) => void;
  minuteStep?: number; // 5, 10, 15, 30
  use12Hours?: boolean; // default false
  placeholder?: string;
  className?: string;
  width?: number; // px
};

export default function TimePickerLite({
  value,
  onChange,
  minuteStep = 15,
  use12Hours = false,
  placeholder = "Select time",
  className = "",
  width = 160,
}: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const hourRef = useRef<HTMLDivElement | null>(null);
  const minuteRef = useRef<HTMLDivElement | null>(null);
  const periodRef = useRef<HTMLDivElement | null>(null);

  // parse incoming value
  const initial = useMemo(() => {
    if (!value) return null;
    const v = value.trim().toLowerCase();
    if (use12Hours) {
      const m = v.match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/);
      if (!m) return null;
      const h12 = clamp(parseInt(m[1], 10), 1, 12);
      const mm = clamp(parseInt(m[2], 10), 0, 59);
      const p = m[3] as "am" | "pm";
      return { hour: h12, minute: mm, period: p };
    } else {
      const m = v.match(/^(\d{1,2}):(\d{2})$/);
      if (!m) return null;
      const h24 = clamp(parseInt(m[1], 10), 0, 23);
      const mm = clamp(parseInt(m[2], 10), 0, 59);
      return { hour: h24, minute: mm, period: undefined };
    }
  }, [value, use12Hours]);

  const [hour, setHour] = useState<number | null>(initial?.hour ?? null);
  const [minute, setMinute] = useState<number | null>(initial?.minute ?? null);
  const [period, setPeriod] = useState<"am" | "pm" | undefined>(
    initial?.period ?? (use12Hours ? "am" : undefined)
  );

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  // build lists
  const hours = useMemo(
    () =>
      use12Hours
        ? Array.from({ length: 12 }, (_, i) => i + 1)
        : Array.from({ length: 24 }, (_, i) => i),
    [use12Hours]
  );
  const minutes = useMemo(
    () =>
      Array.from(
        { length: Math.ceil(60 / minuteStep) },
        (_, i) => i * minuteStep
      ),
    [minuteStep]
  );
  const periods: Array<"am" | "pm"> = ["am", "pm"];

  // scroll selected into view when opening
  useEffect(() => {
    if (!open) return;
    const opts: ScrollIntoViewOptions = { block: "center", behavior: "smooth" };
    if (hourRef.current)
      hourRef.current
        .querySelector('[data-active="true"]')
        ?.scrollIntoView(opts);
    if (minuteRef.current)
      minuteRef.current
        .querySelector('[data-active="true"]')
        ?.scrollIntoView(opts);
    if (use12Hours && periodRef.current)
      periodRef.current
        .querySelector('[data-active="true"]')
        ?.scrollIntoView(opts);
  }, [open, hour, minute, period, use12Hours]);

  const label = useMemo(() => {
    if (hour == null || minute == null) return "";
    const mm = String(minute).padStart(2, "0");
    if (use12Hours) {
      const hh = String(hour);
      const per = period ?? "am";
      return `${hh}:${mm} ${per.toUpperCase()}`;
    } else {
      const h24 = hour;
      const hh = String(h24).padStart(2, "0");
      return `${hh}:${mm}`;
    }
  }, [hour, minute, period, use12Hours]);

  const commitIfReady = (nextMinute?: number) => {
    const m = nextMinute ?? minute;
    if (hour == null || m == null) return;
    const out = use12Hours ? label : label; // already formatted
    onChange?.(out);
    setOpen(false);
  };

  return (
    <div
      ref={rootRef}
      className={`relative inline-block ${className}`}
      style={{ width }}
    >
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="tp-trigger"
      >
        <span className={`tp-text ${label ? "" : "tp-placeholder"}`}>
          {label || placeholder}
        </span>
        <svg
          className="tp-icon"
          viewBox="0 0 20 20"
          width="16"
          height="16"
          aria-hidden="true"
        >
          <path
            d="M5 7l5 6 5-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      </button>

      {open && (
        <div className="tp-popover" role="dialog">
          <div
            className="tp-columns"
            style={{
              gridTemplateColumns: use12Hours ? "1fr 1fr 0.7fr" : "1fr 1fr",
            }}
          >
            <Column
              title="Hour"
              refEl={hourRef}
              items={hours}
              active={hour}
              toLabel={(h) =>
                use12Hours ? String(h) : String(h).padStart(2, "0")
              }
              onPick={(h) => {
                setHour(h);
                // If minute is already selected, commit immediately
                if (minute != null) {
                  const mm = String(minute).padStart(2, "0");
                  const hh = use12Hours
                    ? String(h)
                    : String(h).padStart(2, "0");
                  const out = use12Hours
                    ? `${h}:${mm} ${(period ?? "am").toUpperCase()}`
                    : `${hh}:${mm}`;
                  onChange?.(out);
                  setOpen(false);
                }
              }}
            />
            <Column
              title="Minute"
              refEl={minuteRef}
              items={minutes}
              active={minute}
              toLabel={(m) => String(m).padStart(2, "0")}
              onPick={(m) => {
                setMinute(m);
                commitIfReady(m);
              }}
            />
            {use12Hours && (
              <Column<"am" | "pm">
                title="Period"
                refEl={periodRef}
                items={periods}
                active={period}
                toLabel={(p) => p.toUpperCase()}
                onPick={(p) => {
                  setPeriod(p);
                  // If hour and minute are already set, commit immediately
                  if (hour != null && minute != null) {
                    const mm = String(minute).padStart(2, "0");
                    const out = `${hour}:${mm} ${p.toUpperCase()}`;
                    onChange?.(out);
                    setOpen(false);
                  }
                }}
              />
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .tp-trigger {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          padding: 8px 10px;
          background: #fff;
          cursor: pointer;
        }
        .tp-trigger:focus-visible {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }
        .tp-text {
          font-size: 14px;
        }
        .tp-placeholder {
          color: #9ca3af;
        }
        .tp-icon {
          color: #6b7280;
        }

        .tp-popover {
          position: absolute;
          top: calc(100% + 6px);
          left: 0;
          width: max(100%, 260px);
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
          padding: 8px;
          z-index: 50;
        }
        .tp-columns {
          display: grid;
          gap: 8px;
        }
      `}</style>
    </div>
  );
}

function Column<T extends number | string>({
  title,
  items,
  active,
  toLabel,
  onPick,
  refEl,
}: {
  title: string;
  items: T[];
  active: T | null | undefined;
  toLabel: (x: T) => string;
  onPick: (x: T) => void;
  refEl: React.MutableRefObject<HTMLDivElement | null>;
}) {
  return (
    <div className="tp-col">
      <div className="tp-col-title">{title}</div>
      <div ref={refEl} className="tp-list" role="listbox" aria-label={title}>
        {items.map((x) => {
          const isActive = active === x;
          return (
            <button
              key={String(x)}
              type="button"
              className={`tp-item ${isActive ? "is-active" : ""}`}
              data-active={isActive ? "true" : "false"}
              onClick={() => onPick(x)}
            >
              {toLabel(x)}
            </button>
          );
        })}
      </div>
      <style jsx>{`
        .tp-col {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }
        .tp-col-title {
          font-size: 12px;
          color: #6b7280;
          margin: 4px 0 6px;
        }
        .tp-list {
          max-height: 180px;
          overflow-y: auto;
          padding: 4px;
          border: 1px solid #f3f4f6;
          border-radius: 8px;
          scroll-behavior: smooth; /* smooth panels */
        }
        .tp-item {
          width: 100%;
          padding: 8px 10px;
          text-align: left;
          border-radius: 6px;
          border: none;
          background: transparent;
          cursor: pointer;
          font-size: 14px;
        }
        .tp-item:hover {
          background: #f3f4f6;
        }
        .tp-item.is-active {
          background: #e5f0ff;
          color: #1d4ed8;
        }
      `}</style>
    </div>
  );
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}
