import { HugeiconsIcon } from "@hugeicons/react-native";
import {
  Activity01Icon,
  AiBookIcon,
  ArrowLeft01Icon,
  Home01Icon,
  Logout01Icon,
  Notification03Icon,
  PencilEdit02Icon,
  Settings01Icon,
  Target01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons";

export type AppIconName =
  | "home"
  | "learn"
  | "practice"
  | "progress"
  | "notification"
  | "settings"
  | "user"
  | "back"
  | "logout"
  | "target";

const icons = {
  home: Home01Icon,
  learn: AiBookIcon,
  practice: PencilEdit02Icon,
  progress: Activity01Icon,
  notification: Notification03Icon,
  settings: Settings01Icon,
  user: UserIcon,
  back: ArrowLeft01Icon,
  logout: Logout01Icon,
  target: Target01Icon,
} as const;

export function AppIcon({ name, size = 22, color, strokeWidth = 1.8 }: { name: AppIconName; size?: number; color: string; strokeWidth?: number }) {
  return <HugeiconsIcon icon={icons[name]} size={size} color={color} strokeWidth={strokeWidth} />;
}
