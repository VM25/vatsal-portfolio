/*
  In-page jumps from the top bar and the menu.

  The browser's own anchor jump is aimed at where the section sits when the link is
  pressed. If the web fonts are still loading, the page reflows under a smooth jump
  when they swap in, and the reader lands up to about 80px off. So the jump is done
  here: focus moves to the section (as a native fragment jump does), it scrolls into
  view (instantly under reduced motion), and the hash is updated. Once
  document.fonts.ready resolves, the section's position is checked once more; if it
  moved and the reader has not scrolled, pressed a key, touched or clicked since,
  the jump is aimed again, once.
*/

const INTENTS = ["wheel", "touchstart", "keydown", "pointerdown"] as const;

function docTop(el: HTMLElement): number {
  return el.getBoundingClientRect().top + window.scrollY;
}

/**
 * Jump to the element with this id. `history` says whether the hash change adds an
 * entry (a top-bar link, like a native anchor) or replaces the current one (the menu).
 * Returns false when there is no such element, so the caller can leave the click alone.
 */
export function jumpTo(id: string, history: "push" | "replace"): boolean {
  const target = document.getElementById(id);
  if (!target) return false;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const behavior: ScrollBehavior = reduce ? "instant" : "smooth";
  const aimed = docTop(target);

  target.focus({ preventScroll: true });
  target.scrollIntoView({ block: "start", behavior });
  const href = `#${id}`;
  if (history === "replace") window.history.replaceState(null, "", href);
  else if (window.location.hash !== href) window.history.pushState(null, "", href);

  let moved = false;
  const mark = () => {
    moved = true;
  };
  INTENTS.forEach((e) => window.addEventListener(e, mark, { passive: true, capture: true }));
  const fonts = document.fonts?.ready ?? Promise.resolve();
  fonts.then(() =>
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        INTENTS.forEach((e) => window.removeEventListener(e, mark, { capture: true }));
        if (moved || !target.isConnected) return;
        if (Math.abs(docTop(target) - aimed) > 2) target.scrollIntoView({ block: "start", behavior });
      }),
    ),
  );
  return true;
}
