import { AppIcon } from "./app-icon";
import { subjectIconForKey } from "./subject-identity";

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
  return (
    <AppIcon
      className={className}
      icon={subjectIconForKey(iconKey)}
      size={size}
      strokeWidth={strokeWidth}
    />
  );
}
