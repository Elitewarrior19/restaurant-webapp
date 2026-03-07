import type { ReactNode } from "react";
import clsx from "clsx";

type Props = {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className }: Props) {
  return (
    <div className={clsx("rounded-2xl bg-white p-4 shadow-sm", className)}>
      {children}
    </div>
  );
}

