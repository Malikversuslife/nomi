import Image from "next/image";
import { BookOpen01Icon } from "@hugeicons/core-free-icons";
import { AppIcon } from "./app-icon";
import type { SubjectKey } from "./subject-identity";

export const SUBJECT_3D_ASSETS: Record<SubjectKey, string> = {
  mathematics: "/brand/nomi/subjects/mathematics.png",
  physics: "/brand/nomi/subjects/physics.png",
  chemistry: "/brand/nomi/subjects/chemistry.png",
  biology: "/brand/nomi/subjects/biology.png",
};

export type SubjectVisualSize = "sm" | "md" | "lg";

const VISUAL_SIZES: Record<SubjectVisualSize, number> = {
  sm: 96,
  md: 144,
  lg: 208,
};

function subjectKeyForAsset(subject: string | null | undefined): SubjectKey | null {
  const normalized = subject?.trim().toLowerCase();
  const key = normalized === "science" ? "biology" : normalized;
  return key && key in SUBJECT_3D_ASSETS ? (key as SubjectKey) : null;
}

/** Resolves the supplied production illustration for a known curriculum subject. */
export function subjectAssetForSubject(subject: string | null | undefined): string | null {
  const key = subjectKeyForAsset(subject);
  return key ? SUBJECT_3D_ASSETS[key] : null;
}

/**
 * Decorative subject artwork for high-emphasis learning contexts. Unknown subjects
 * retain the existing generic book visual instead of selecting an unrelated asset.
 */
export function Subject3DVisual({
  subject,
  size = "md",
  className,
}: {
  subject: string | null | undefined;
  size?: SubjectVisualSize;
  className?: string;
}) {
  const px = VISUAL_SIZES[size];
  const asset = subjectAssetForSubject(subject);

  if (!asset) {
    return (
      <span
        aria-hidden="true"
        data-subject-visual="fallback"
        className={`flex items-center justify-center text-nomi-muted ${className ?? ""}`}
        style={{ height: px, width: px }}
      >
        <AppIcon icon={BookOpen01Icon} size={Math.round(px * 0.38)} strokeWidth={1.75} />
      </span>
    );
  }

  return (
    <Image
      src={asset}
      width={px}
      height={px}
      alt=""
      aria-hidden="true"
      draggable={false}
      unoptimized
      data-subject-visual={subjectKeyForAsset(subject)}
      data-asset={asset}
      className={className}
      style={{ display: "block", objectFit: "contain" }}
    />
  );
}
