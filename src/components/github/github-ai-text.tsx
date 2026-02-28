"use client";

import { cn } from "@/lib/utils";
import { IconChevronRight } from "@tabler/icons-react";
import { useState } from "react";
import { ShimmerText } from "../ui/shimmer-text";
import { Spinner } from "../ui/spinner";

export function GithubAiText({
  contributionsRequestDuration,
}: {
  contributionsRequestDuration: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full">
      <button
        className="group cursor-pointer flex items-center gap-1"
        onClick={() => setOpen((prev) => !prev)}
      >
        <ShimmerText className="text-xs">
          Probably contributing, or something...
        </ShimmerText>
        <IconChevronRight
          className={cn(
            "size-3.5 duration-150",
            "text-transparent group-hover:text-muted-foreground",
            open && "rotate-90 text-muted-foreground"
          )}
        />
      </button>
      <div
        className={cn(
          "flex flex-col gap-1 text-xs text-muted-foreground overflow-hidden duration-100",
          open ? "h-auto pt-1.5" : "h-0 p-0"
        )}
      >
        <div className="text-muted-foreground/60">
          <span>Fetched contributions in </span>
          <span className="font-medium text-muted-foreground">
            {contributionsRequestDuration}ms
          </span>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground/60">
          <Spinner className="size-3.25" />
          <ShimmerText>Thinking, probably...</ShimmerText>
        </div>
      </div>
    </div>
  );
}
