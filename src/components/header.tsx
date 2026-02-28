import { IconCircleDashed } from "@tabler/icons-react";
import Link from "next/link";

export function Header() {
  return (
    <header className="pt-24 pb-12">
      <Link href={"/"} className="flex items-center gap-2">
        <IconCircleDashed className="size-5 mt-0.25" />
        <span>dangtr.dev</span>
      </Link>
    </header>
  );
}
