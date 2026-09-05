export const NOMI_WORDMARK_VARIANTS = ["ink", "purple", "inverse"] as const;

export type NomiWordmarkVariant = (typeof NOMI_WORDMARK_VARIANTS)[number];

export const NOMI_WORDMARK_ASSETS: Record<NomiWordmarkVariant, string> = {
  ink: "/brand/nomi/wordmark-ink.png",
  purple: "/brand/nomi/wordmark-purple.png",
  inverse: "/brand/nomi/wordmark-white.png",
};

const ASPECT_RATIOS: Record<NomiWordmarkVariant, number> = {
  ink: 350 / 135,
  purple: 350 / 125,
  inverse: 350 / 125,
};

/** Canonical approved image-backed Nomi product wordmark. */
export function NomiWordmark({
  width = 160,
  variant = "ink",
  label,
  className,
}: {
  width?: number;
  variant?: NomiWordmarkVariant;
  label?: string;
  className?: string;
}) {
  return (
    <Image
      src={NOMI_WORDMARK_ASSETS[variant]}
      width={width}
      height={Math.round(width / ASPECT_RATIOS[variant])}
      alt={label ?? ""}
      aria-hidden={label ? undefined : true}
      draggable={false}
      unoptimized
      data-wordmark-variant={variant}
      className={className}
      style={{ display: "block", objectFit: "contain" }}
    />
  );
}
import Image from "next/image";
