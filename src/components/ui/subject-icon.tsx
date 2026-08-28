import { AppIcon } from "./app-icon";
import { subjectIdentityForIconKey } from "./subject-identity";

export function SubjectIcon({
  iconKey,
  className,
  size = 20,
  strokeWidth = 2,
}: {
  iconKey: string | null;
  className?: string;
  size?: number;
  strokeWidth?: number;
}) {
  const identity = subjectIdentityForIconKey(iconKey);
  return (
    <AppIcon
      className={className}
      icon={identity.icon}
      size={size}
      strokeWidth={strokeWidth}
    />
  );
}