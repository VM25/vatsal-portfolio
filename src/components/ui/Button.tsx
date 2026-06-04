import { cn } from "@/lib/utils";

type Variant = "solid" | "outline" | "ghost";

interface ButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
  icon?: React.ReactNode;
  external?: boolean;
  download?: boolean;
  className?: string;
  ariaLabel?: string;
}

const variants: Record<Variant, string> = {
  solid:
    "bg-amber text-[#1a1206] hover:bg-[#f2b65a] border border-amber/60 font-medium",
  outline:
    "text-ink border border-line-strong hover:border-amber/60 hover:text-amber bg-transparent",
  ghost: "text-ink-dim hover:text-ink border border-transparent",
};

export function Button({
  href,
  children,
  variant = "solid",
  icon,
  external,
  download,
  className,
  ariaLabel,
}: ButtonProps) {
  return (
    <a
      href={href}
      aria-label={ariaLabel}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      {...(download ? { download: "" } : {})}
      className={cn(
        "group inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm tracking-tight",
        "transition-[background-color,border-color,color,transform] duration-300 will-change-transform",
        "hover:-translate-y-0.5 active:translate-y-0",
        variants[variant],
        className,
      )}
    >
      <span>{children}</span>
      {icon ? (
        <span className="text-[1.05em] transition-transform duration-300 group-hover:translate-x-0.5">
          {icon}
        </span>
      ) : null}
    </a>
  );
}
