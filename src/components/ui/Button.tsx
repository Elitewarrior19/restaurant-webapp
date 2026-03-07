import type { ButtonHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
};

const base =
  "inline-flex items-center justify-center rounded-full font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron/70 disabled:opacity-60 disabled:cursor-not-allowed transition-colors";

const variantClasses: Record<Variant, string> = {
  primary: "bg-saffron text-white hover:bg-saffron/90",
  secondary:
    "bg-deepGreen text-cream hover:bg-deepGreen/90",
  ghost:
    "bg-transparent text-charcoal hover:bg-charcoal/5 border border-charcoal/10"
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm"
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: Props) {
  return (
    <button
      className={clsx(base, variantClasses[variant], sizeClasses[size], className)}
      {...props}
    />
  );
}

