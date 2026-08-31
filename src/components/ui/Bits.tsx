"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";

export function R({
  as: Tag = "div",
  d = 0,
  className = "",
  children,
}: {
  as?: ElementType;
  d?: number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Tag data-r="" style={d ? ({ ["--d"]: d } as React.CSSProperties) : undefined} className={className}>
      {children}
    </Tag>
  );
}

/**
 * Counts a figure up when it first comes into view. Only the numeric part is
 * animated — prefixes, suffixes and separators are left exactly as written, so
 * "USD 4.65M" and "3 of 5" survive intact.
 */
export function Count({ value, className = "" }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(value);
  const done = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const m = value.match(/^(\D*)([\d,.]+)([\s\S]*)$/);
    if (!m) return;
    const [, pre, digits, post] = m;
    const target = parseFloat(digits.replace(/,/g, ""));
    if (!isFinite(target)) return;
    const decimals = (digits.split(".")[1] ?? "").length;
    const grouped = digits.includes(",");

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || done.current) return;
        done.current = true;
        io.disconnect();
        const start = performance.now();
        const dur = 900;
        // If the tab is backgrounded mid-count, requestAnimationFrame stops and
        // the figure would be left stranded on a partial value. This guarantees
        // it always lands on the real number.
        const settle = window.setTimeout(() => setShown(value), dur + 400);
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / dur);
          const eased = 1 - Math.pow(1 - t, 3);
          const n = target * eased;
          const s = grouped
            ? n.toLocaleString("en-US", { maximumFractionDigits: decimals, minimumFractionDigits: decimals })
            : n.toFixed(decimals);
          setShown(`${pre}${s}${post}`);
          if (t < 1) requestAnimationFrame(tick);
          else {
            window.clearTimeout(settle);
            setShown(value);
          }
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [value]);

  return (
    <span ref={ref} className={className}>
      {shown}
    </span>
  );
}
