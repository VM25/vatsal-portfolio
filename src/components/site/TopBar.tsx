"use client";

import { useSyncExternalStore } from "react";
import { useChapter } from "@/components/world/ScrollState";
import { onJumpClick } from "@/components/site/jump";
import { getMenuOpen, getMenuOpenServer, setMenuOpen, subscribeMenu } from "@/components/site/menuStore";
import { profile } from "@/data/profile";
import type { Chapter } from "@/lib/scene";

const LINKS: { id: Exclude<Chapter, "home">; label: string }[] = [
  { id: "projects", label: "Projects" },
  { id: "research", label: "Research" },
  { id: "path", label: "Path" },
  { id: "contact", label: "Contact" },
];

/*
  Sticky top bar. It re-renders only when the active chapter changes (for
  aria-current) or the menu opens. Section links jump through jumpTo (see
  jump.ts). From 760px of container width the links and résumé show; below it,
  one Menu button opens the dialog in MobileMenu.
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
      <a className="mk" href="#top" onClick={onJumpClick}>
        {profile.name}
      </a>
      <nav className="links" aria-label="Main">
        {LINKS.map((l) => (
          <a
            key={l.id}
            href={`#${l.id}`}
            aria-current={chapter === l.id ? "true" : undefined}
            onClick={onJumpClick}
          >
            {l.label}
          </a>
        ))}
      </nav>
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
