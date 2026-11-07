"use client";

import { useSyncExternalStore, type MouseEvent } from "react";
import { useChapter } from "@/components/world/ScrollState";
import { Clock } from "@/components/site/Clock";
import { jumpTo } from "@/components/site/jump";
import { getMenuOpen, getMenuOpenServer, setMenuOpen, subscribeMenu } from "@/components/site/menuStore";
import { profile } from "@/data/profile";
import type { Chapter } from "@/lib/scene";

const LINKS: { id: Exclude<Chapter, "home">; label: string }[] = [
  { id: "projects", label: "Projects" },
  { id: "research", label: "Research" },
  { id: "path", label: "Path" },
  { id: "contact", label: "Contact" },
];

/** A plain click on an in-page link jumps through jumpTo; modified clicks stay native. */
function onJump(e: MouseEvent<HTMLAnchorElement>) {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  if (jumpTo(e.currentTarget.hash.slice(1), "push")) e.preventDefault();
}

/*
  Sticky top bar. It re-renders only when the active chapter changes (for
  aria-current) or the menu opens; the clock is rewritten imperatively by
  ScrollState. Section links jump through jumpTo (see jump.ts). From 760px of
  container width the links, clock and résumé show; below it, one Menu button
  opens the dialog in MobileMenu.
*/
export function TopBar() {
  const chapter = useChapter();
  const menuOpen = useSyncExternalStore(subscribeMenu, getMenuOpen, getMenuOpenServer);

  return (
    <header className="top g">
      <a
        className="skip"
        href="#content"
        onClick={() => {
          document.getElementById("content")?.focus();
        }}
      >
        Skip to content
      </a>
      <a className="mk" href="#top" onClick={onJump}>
        {profile.name}
      </a>
      <nav className="links" aria-label="Main">
        {LINKS.map((l) => (
          <a
            key={l.id}
            href={`#${l.id}`}
            aria-current={chapter === l.id ? "true" : undefined}
            onClick={onJump}
          >
            {l.label}
          </a>
        ))}
      </nav>
      <Clock className="clock" />
      <a className="res" href={profile.links.resume} target="_blank" rel="noopener">
        Résumé<span className="sr-only"> (PDF), opens in a new tab</span>
      </a>
      <button
        className="menu-btn"
        type="button"
        data-menu-button
        aria-haspopup="dialog"
        aria-expanded={menuOpen}
        aria-controls="menu"
        onClick={() => setMenuOpen(true)}
      >
        <span>Menu</span>
        <span className="bars" aria-hidden="true">
          <i></i>
          <i></i>
        </span>
      </button>
    </header>
  );
}
