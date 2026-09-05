export const NOMI_LOGO_ASSETS = {
  icon: "/brand/nomi/logo.png",
  primaryLockup: "/brand/nomi/lockup-primary.png",
  horizontalLockup: "/brand/nomi/lockup-horizontal.png",
} as const;

export type NomiLogoVariant = keyof typeof NOMI_LOGO_ASSETS;

const ASPECT_RATIOS: Record<NomiLogoVariant, number> = {
  icon: 260 / 190,
  primaryLockup: 430 / 320,
  horizontalLockup: 380 / 150,
};

/** Approved image-backed Nomi logo and lockup assets. */
export function NomiLogo({
  variant = "icon",
  width = 96,
  label,
  className,
}: {
  variant?: NomiLogoVariant;
  width?: number;
  label?: string;
  className?: string;
}) {
  return (
    <Image
      src={NOMI_LOGO_ASSETS[variant]}
      width={width}
      height={Math.round(width / ASPECT_RATIOS[variant])}
      alt={label ?? ""}
      aria-hidden={label ? undefined : true}
      draggable={false}
      unoptimized
      data-logo-variant={variant}
      className={className}
      style={{ display: "block", objectFit: "contain" }}
    />
  );
}
import Image from "next/image";
