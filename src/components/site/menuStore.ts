/*
  The mobile menu's open state. The button lives in the top bar (inside the
  layout container) and the dialog sits outside it, so the two share this tiny
  store instead of a provider that would wrap the whole page.
*/
let open = false;
const listeners = new Set<() => void>();

export function subscribeMenu(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export const getMenuOpen = () => open;
export const getMenuOpenServer = () => false;

export function setMenuOpen(next: boolean) {
  if (next === open) return;
  open = next;
  listeners.forEach((cb) => cb());
}
