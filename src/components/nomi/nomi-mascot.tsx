export type NomiMascotState =
  | "neutral"
  | "thinking"
  | "curious"
  | "encouraging"
  | "celebrating"
  | "supportive"
  | "reinforcing"
  | "challenge";

const stateClasses: Record<NomiMascotState, string> = {
  neutral: "animate-neutral-6s ease-in-out loop",
  thinking: "animate-thinking-3s ease-in-out loop",
  curious: "animate-curious-2s ease-in-out loop",
  encouraging: "animate-encouraging-4s ease-in-out loop",
  celebrating: "animate-celebrating-3s ease-out loop",
  supportive: "animate-supportive-5s ease-in-out loop",
  reinforcing: "animate-reinforcing-4s ease-in-out loop",
  challenge: "animate-challenge-3s ease-in-out loop",
};

export function NomiMascot({
  state = "neutral",
  size = 48,
  className,
}: {
  state?: NomiMascotState;
  size?: number;
  className?: string;
}) {
  const animationClass = stateClasses[state as NomiMascotState] || "";

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
        ${animationClass}
        ${className}
      `}
      aria-hidden="true"
    >
      <path
        d="M12 2L2 7h5v11H7v5h11v-5h-7v-11h5z"
        fill="currentColor"
      />
    </svg>
  );
}