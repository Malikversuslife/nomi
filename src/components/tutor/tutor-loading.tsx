import { NomiCharacter } from "@/components/nomi/nomi-character";

export function TutorLoading() {
  return (
    <div className="flex items-center gap-3" aria-label="Nomi is thinking">
      <NomiCharacter state="thinking" size={40} className="flex-shrink-0" />
      <p className="text-sm font-medium text-nomi-muted">Nomi is thinking…</p>
    </div>
  );
}
