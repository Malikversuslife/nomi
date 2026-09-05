export const NOMI_CHARACTER_STATES = [
  "neutral",
  "curious",
  "thinking",
  "encouraging",
  "celebrating",
  "supportive",
  "challenge",
  "reinforcing",
] as const;

export type NomiCharacterState = (typeof NOMI_CHARACTER_STATES)[number];

export const NOMI_CHARACTER_SIZES = ["xs", "sm", "md", "lg", "xl", "hero"] as const;

export type NomiCharacterSize = (typeof NOMI_CHARACTER_SIZES)[number];

export const NOMI_CHARACTER_SURFACES = ["light", "brand"] as const;

export type NomiCharacterSurface = (typeof NOMI_CHARACTER_SURFACES)[number];

export const NOMI_CHARACTER_ASSETS: Record<NomiCharacterState, string> = {
  neutral: "/brand/nomi/mascot/neutral.png",
  curious: "/brand/nomi/mascot/curious.png",
  thinking: "/brand/nomi/mascot/thinking.png",
  encouraging: "/brand/nomi/mascot/encouraging.png",
  celebrating: "/brand/nomi/mascot/celebrating.png",
  supportive: "/brand/nomi/mascot/supportive.png",
  challenge: "/brand/nomi/mascot/challenge.png",
  reinforcing: "/brand/nomi/mascot/reinforcing.png",
};

const SIZE_PX: Record<NomiCharacterSize, number> = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 64,
  xl: 80,
  hero: 128,
};

/** Resolves unknown integration inputs conservatively to the neutral source asset. */
export function characterStateForAsset(state: string | undefined): NomiCharacterState {
  return state && state in NOMI_CHARACTER_ASSETS ? (state as NomiCharacterState) : "neutral";
}

export function characterAssetForState(state: string | undefined): string {
  return NOMI_CHARACTER_ASSETS[characterStateForAsset(state)];
}

/**
 * Canonical image-backed Nomi companion. The approved production PNGs are the
 * sole character artwork; component sizing only controls the rendered box.
 */
export function NomiCharacter({
  state = "neutral",
  size = "md",
  surface = "light",
  label,
  className,
}: {
  state?: NomiCharacterState;
  size?: NomiCharacterSize | number;
  surface?: NomiCharacterSurface;
  label?: string;
  className?: string;
}) {
  const resolvedState = characterStateForAsset(state);
  const px = typeof size === "number" ? size : SIZE_PX[size];

  return (
    <Image
      src={characterAssetForState(resolvedState)}
      width={px}
      height={px}
      alt={label ?? ""}
      aria-hidden={label ? undefined : true}
      draggable={false}
      unoptimized
      data-state={resolvedState}
      data-surface={surface}
      data-asset={characterAssetForState(resolvedState)}
      className={className}
      style={{ display: "block", objectFit: "contain" }}
    />
  );
}
import Image from "next/image";
