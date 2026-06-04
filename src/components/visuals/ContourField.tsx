import { cn } from "@/lib/utils";

/**
 * Layered SVG curves evoking yield curves / contour maps. Static by default;
 * a very slow drift is applied via CSS and auto-disabled under reduced-motion.
 */
export function ContourField({
  className,
  accent = "#e8a23d",
}: {
  className?: string;
  accent?: string;
}) {
  const curves = [0, 1, 2, 3, 4];
  return (
    <svg
      aria-hidden
      className={cn("absolute inset-0 h-full w-full", className)}
      viewBox="0 0 1200 600"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
    >
      {curves.map((i) => {
        const y = 140 + i * 80;
        return (
          <path
            key={i}
            d={`M-50 ${y + 60} C 250 ${y - 70 + i * 8}, 520 ${y + 70}, 760 ${y - 30} S 1180 ${y - 90 + i * 6}, 1260 ${y - 10}`}
            stroke={accent}
            strokeOpacity={0.06 + i * 0.012}
            strokeWidth={1}
          />
        );
      })}
    </svg>
  );
}
