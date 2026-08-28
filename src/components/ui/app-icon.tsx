import type { IconSvgElement } from "@hugeicons/react";
import { HugeiconsIcon } from "@hugeicons/react";
import type { SVGProps } from "react";

export type AppIconSize = number;

export function AppIcon({
  icon,
  size = 20,
  strokeWidth = 2,
  className,
  ...props
}: SVGProps<SVGSVGElement> & {
  icon: IconSvgElement;
  size?: AppIconSize;
  strokeWidth?: number;
  className?: string;
}) {
  return (
    <HugeiconsIcon
      aria-hidden="true"
      className={className}
      icon={icon}
      size={size}
      strokeWidth={strokeWidth}
      {...props}
    />
  );
}