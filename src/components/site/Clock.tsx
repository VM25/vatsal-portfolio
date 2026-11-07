import { clockAt } from "@/lib/scene";

/*
  The scene's clock. ScrollState rewrites every [data-clock] as the page
  scrolls, so this renders the starting time and holds no state. It is
  decorative: the time is the scene's, not information the page depends on.
*/
export function Clock({ className = "" }: { className?: string }) {
  return (
    <span className={`${className} num`.trim()} data-clock aria-hidden="true">
      {clockAt(0)}
    </span>
  );
}
