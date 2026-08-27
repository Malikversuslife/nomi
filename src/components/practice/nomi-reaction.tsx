import { NomiMascot, type NomiMascotState } from "@/components/nomi/nomi-mascot";

export function NomiReaction({
  state,
  size = 44,
  caption,
  className,
}: {
  state: NomiMascotState;
  size?: number;
  caption?: string;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-3 ${className ?? ""}`}>
      <NomiMascot state={state} size={size} />
      {caption && (
        <p className="text-sm font-medium text-nomi-muted">{caption}</p>
      )}
    </div>
  );
}