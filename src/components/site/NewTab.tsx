/*
  A link that opens in a new tab: the visible label with an aria-hidden ↗, and a
  screen-reader note that it opens a new tab (" (PDF)" first when it is a PDF).
  No hooks, so server chapters and client exhibits share it.
*/
export function NewTab({ href, children, pdf = false }: { href: string; children: string; pdf?: boolean }) {
  return (
    <a href={href} target="_blank" rel="noopener">
      <span>
        {children} <span aria-hidden="true">↗</span>
      </span>
      <span className="sr-only">{pdf ? " (PDF), opens in a new tab" : ", opens in a new tab"}</span>
    </a>
  );
}
