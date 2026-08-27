import { NomiMascot } from "@/components/nomi/nomi-mascot";

export function TutorLoading() {
  return (
    <div className="flex items-center gap-3" aria-label="Nomi is thinking">
      <NomiMascot state="thinking" size={40} className="flex-shrink-0" />
      <p className="text-sm font-medium text-nomi-muted">Nomi is thinking…</p>
    </div>
  );
}