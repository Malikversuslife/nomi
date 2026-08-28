export type NomiMascotState =
  | "neutral"
  | "thinking"
  | "curious"
  | "encouraging"
  | "celebrating"
  | "supportive"
  | "reinforcing"
  | "challenge";

export function NomiMascot({
  state = "neutral",
  size = 48,
  className,
}: {
  state?: NomiMascotState;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={`
        flex items-center justify-center
        rounded-full
        bg-nomi-surface
        border border-nomi-border/50
        text-nomi-purple-600
        ${className ?? ""}
      `}
      aria-hidden="true"
      data-state={state as NomiMascotState}
    >
      <path
        d="M12 2L2 7h5v11H7v5h11v-5h-7v-11h5z"
        fill="currentColor"
      />
    </svg>
  );
}