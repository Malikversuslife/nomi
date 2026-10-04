import type { ReactNode } from "react";
import { Eyebrow } from "./eyebrow";

export function SectionHeader({
  title,
  id,
  eyebrow,
  description,
  className,
}: {
  title: ReactNode;
  id?: string;
  eyebrow?: ReactNode;
  description?: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      {eyebrow ? <Eyebrow className="mb-1">{eyebrow}</Eyebrow> : null}
      <h2
        id={id}
        className="font-display text-[1.7rem] font-semibold tracking-[-0.035em] text-nomi-ink"
      >
        {title}
      </h2>
      {description ? <p className="mt-1.5 max-w-2xl text-[0.95rem] leading-6 text-nomi-muted">{description}</p> : null}
    </div>
  );
}
