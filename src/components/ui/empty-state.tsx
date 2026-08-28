import type { ReactNode } from "react";

export function EmptyState({
  icon,
  title,
  description,
  children,
  className,
}: {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`mx-auto flex max-w-[560px] flex-col items-center gap-3 px-2 py-6 text-center ${className ?? ""}`}
    >
      {icon ? <div className="flex justify-center">{icon}</div> : null}
      <h1 className="font-display text-2xl font-bold tracking-[-0.03em] text-nomi-ink sm:text-3xl">
        {title}
      </h1>
      {description ? (
        <p className="mx-auto max-w-sm text-sm leading-relaxed text-nomi-muted">{description}</p>
      ) : null}
      {children ? <div className="mt-2 flex flex-wrap justify-center gap-3">{children}</div> : null}
    </section>
  );
}