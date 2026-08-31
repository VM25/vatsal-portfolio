"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useId, useState, type ReactNode } from "react";

/**
 * A title that opens. Detail does not exist on screen until it is asked for —
 * closed, a row is a name and a field and nothing more.
 */
export function Open({
  index,
  title,
  meta,
  children,
}: {
  index: string;
  title: string;
  meta: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <div className="border-b border-nocturnal/60">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={id}
        className="group flex w-full items-baseline gap-4 py-5 text-left sm:gap-6"
      >
        <span className="readout shrink-0 !text-here">{index}</span>
        <span className="sub-title flex-1 transition-colors duration-300 group-hover:text-saffron">
          {title}
        </span>
        <span className="readout hidden shrink-0 sm:block">{meta}</span>
        <span
          className="readout shrink-0 !text-saffron transition-transform duration-300"
          style={{ transform: open ? "rotate(45deg)" : "none" }}
          aria-hidden
        >
          +
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            id={id}
            key="panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="pb-8 pt-1">{children}</div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
