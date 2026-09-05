import { NomiCharacter, type NomiCharacterState } from "@/components/nomi/nomi-character";

export function NomiReaction({
  state,
  size = 44,
  caption,
  className,
}: {
  state: NomiCharacterState;
  size?: number;
  caption?: string;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-3 ${className ?? ""}`}>
      <NomiCharacter state={state} size={size} />
      {caption && (
        <p className="text-sm font-medium text-nomi-muted">{caption}</p>
      )}
    </div>
  );
}
