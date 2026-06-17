import { cn } from "@/lib/utils";

type Variant = "solid" | "accent" | "outline" | "ghost";

interface ButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
  icon?: React.ReactNode;
  external?: boolean;
  className?: string;
  ariaLabel?: string;
}

const variants: Record<Variant, string> = {
  // high-contrast ink block - the bold default (keeps cobalt off the main CTA)
  solid: "bg-ink text-paper border border-ink hover:bg-accent hover:border-accent hover:text-accent-ink",
  accent: "bg-accent text-accent-ink border border-accent hover:bg-accent-strong hover:border-accent-strong",
  outline: "text-ink border border-line-2 bg-card hover:border-ink",
  ghost: "text-ink-2 hover:text-ink border border-transparent hover:bg-card",
};

export function Button({
  href,
  children,
  variant = "solid",
  icon,
  external,
  className,
  ariaLabel,
}: ButtonProps) {
  return (
    <a
      href={href}
      aria-label={ariaLabel}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={cn(
        "group inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold uppercase tracking-[0.05em]",
        "transition-[background-color,border-color,color,transform] duration-200 will-change-transform",
        "hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99]",
        variants[variant],
        className,
      )}
    >
      <span>{children}</span>
      {icon ? (
        <span className="text-[1.05em] transition-transform duration-200 group-hover:translate-x-0.5">
          {icon}
        </span>
      ) : null}
    </a>
  );
}
