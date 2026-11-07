"use client";

import { useEffect, useRef, useSyncExternalStore, type MouseEvent } from "react";
import { useChapter } from "@/components/world/ScrollState";
import { Clock } from "@/components/site/Clock";
import { getMenuOpen, getMenuOpenServer, setMenuOpen, subscribeMenu } from "@/components/site/menuStore";
import { profile } from "@/data/profile";
import { CHAPTERS, KEYS, clockAt, type Chapter } from "@/lib/scene";

const ITEMS: { id: Chapter; href: string; label: string }[] = [
  { id: "home", href: "#top", label: "Home" },
  { id: "projects", href: "#projects", label: "Projects" },
  { id: "research", href: "#research", label: "Research" },
  { id: "path", href: "#path", label: "Path" },
  { id: "contact", href: "#contact", label: "Contact" },
];

const FOCUSABLE = "a[href], button:not([disabled])";

/*
  The phone menu: a modal dialog rendered next to the layout container, not in
  it, so position: fixed fills the viewport however far the page has scrolled.
  While open the page behind is inert and scroll-locked (overflow, so the
  scroll position and the scene stay put). Closing puts focus back on Menu and
  the scroll back where it was; choosing a section then scrolls to it.
*/
export function MobileMenu() {
  const open = useSyncExternalStore(subscribeMenu, getMenuOpen, getMenuOpenServer);
  const chapter = useChapter();
  const sheet = useRef<HTMLDivElement>(null);
  const goTo = useRef<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const body = document.body;
    const dialog = sheet.current;
    if (!dialog) return;
    const saved = window.scrollY;
    const behind = [document.querySelector<HTMLElement>("header.top"), document.getElementById("content")];

    // Key times in the menu follow the live layout.
    window.dispatchEvent(new Event("resize"));
    root.style.overflow = "hidden";
    body.style.overflow = "hidden";
    behind.forEach((el) => {
      if (el) el.inert = true;
    });
    dialog.querySelector<HTMLElement>("a")?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setMenuOpen(false);
        return;
      }
      if (e.key !== "Tab") return;
      const items = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (!dialog.contains(active)) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    // Widening past the breakpoint hides the Menu button; close with it.
    const onResize = () => {
      const btn = document.querySelector<HTMLElement>("[data-menu-button]");
      if (btn && btn.offsetParent === null) setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);

    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
      root.style.overflow = "";
      body.style.overflow = "";
      behind.forEach((el) => {
        if (el) el.inert = false;
      });
      window.scrollTo({ top: saved, behavior: "instant" });
      document.querySelector<HTMLElement>("[data-menu-button]")?.focus({ preventScroll: true });
      const href = goTo.current;
      goTo.current = null;
      const target = href ? document.getElementById(href.slice(1)) : null;
      if (target) {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        target.scrollIntoView({ behavior: reduce ? "instant" : "smooth", block: "start" });
        history.replaceState(null, "", href);
      }
    };
  }, [open]);

  const choose = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    goTo.current = href;
    setMenuOpen(false);
  };

  return (
    <div ref={sheet} className="sheet" id="menu" role="dialog" aria-modal="true" aria-label="Sections" hidden={!open}>
      <div className="row1">
        <Clock />
        <button className="close" type="button" onClick={() => setMenuOpen(false)}>
          Close
        </button>
      </div>
      {ITEMS.map((it) => (
        <a
          key={it.id}
          href={it.href}
          aria-current={chapter === it.id ? "true" : undefined}
          onClick={(e) => choose(e, it.href)}
        >
          {it.label}{" "}
          <small data-tsec={it.id}>{clockAt(KEYS[CHAPTERS.indexOf(it.id)]).replace(" a.m.", "")}</small>
        </a>
      ))}
      <a className="res" href={profile.links.resume} target="_blank" rel="noopener">
        Résumé (PDF) <span aria-hidden="true">↗</span>
      </a>
    </div>
  );
}
