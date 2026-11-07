"use client";

import { useEffect, useRef, useState } from "react";

type State = "idle" | "copied" | "manual";

/**
 * The email link plus a Copy button. On success the button reads "Copied" for about two
 * seconds and a polite live region says so. If the clipboard is missing or rejects, the
 * address is selected and the button asks for the keyboard shortcut instead.
 */
export function CopyEmail({ email }: { email: string }) {
  const [state, setState] = useState<State>("idle");
  const [combo, setCombo] = useState("Ctrl+C");
  const link = useRef<HTMLAnchorElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      clearTimeout(timer.current);
    };
  }, []);

  function settle(next: State) {
    setState(next);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), next === "copied" ? 2000 : 4000);
  }

  function selectLink() {
    const el = link.current;
    const sel = window.getSelection();
    if (!el || !sel) return;
    const range = document.createRange();
    range.selectNodeContents(el);
    sel.removeAllRanges();
    sel.addRange(range);
  }

  async function copy() {
    try {
      if (!navigator.clipboard?.writeText) throw new Error("no clipboard");
      await navigator.clipboard.writeText(email);
      if (mounted.current) settle("copied");
    } catch {
      if (!mounted.current) return;
      setCombo(/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent) ? "⌘C" : "Ctrl+C");
      selectLink();
      settle("manual");
    }
  }

  return (
    <>
      <a ref={link} href={`mailto:${email}`} id="mail">
        {email}
      </a>
      <button className="copy" type="button" onClick={copy}>
        {state === "copied" ? "Copied" : state === "manual" ? `Press ${combo}` : "Copy"}
      </button>
      <span className="sr-only" aria-live="polite" role="status">
        {state === "copied" ? "Email address copied" : state === "manual" ? `Address selected. Press ${combo} to copy.` : ""}
      </span>
    </>
  );
}
