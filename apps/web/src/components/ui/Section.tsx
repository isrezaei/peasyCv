import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";

/** Vertical rhythm wrapper for page sections. `tint` paints the subtle surface. */
export function Section({
  children,
  tint = false,
  className = "",
  as: Tag = "section",
  labelledBy,
}: {
  children: ReactNode;
  tint?: boolean;
  className?: string;
  as?: "section" | "div" | "article";
  labelledBy?: string;
}) {
  return (
    <Tag
      aria-labelledby={labelledBy}
      className={`py-16 sm:py-20 ${tint ? "bg-tint" : ""} ${className}`}
    >
      <Container>{children}</Container>
    </Tag>
  );
}
