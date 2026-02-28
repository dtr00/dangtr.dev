"use client";

import { cn } from "@/lib/utils";

export type ShimmerTextProps = {
  as?: string;
  duration?: number;
  spread?: number;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLElement>;

export function ShimmerText({
  as = "span",
  className,
  duration = 4,
  spread = 20,
  children,
  ...props
}: ShimmerTextProps) {
  const dynamicSpread = Math.min(Math.max(spread, 5), 45);
  const Component = as as React.ElementType;

  return (
    <Component
      className={cn(
        "bg-size-[200%_auto] bg-clip-text font-medium text-transparent",
        "animate-[shimmer_4s_infinite_linear]",
        className
      )}
      style={{
        backgroundImage: `linear-gradient(to right, var(--muted-foreground) ${
          50 - dynamicSpread
        }%, var(--foreground) 50%, var(--muted-foreground) ${
          50 + dynamicSpread
        }%)`,
        animationDuration: `${duration}s`,
      }}
      {...props}
    >
      {children}
    </Component>
  );
}
