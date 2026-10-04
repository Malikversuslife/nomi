import { HugeiconsIcon } from "@hugeicons/react-native";
import {
  Activity01Icon,
  AiBookIcon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ArrowUp01Icon,
  BotIcon,
  Home01Icon,
  Logout01Icon,
  Notification02Icon,
  PencilEdit02Icon,
  Settings02Icon,
  Target01Icon,
  User02Icon,
} from "@hugeicons/core-free-icons";

export type AppIconName =
  | "home"
  | "learn"
  | "nomi"
  | "practice"
  | "progress"
  | "notification"
  | "settings"
  | "user"
  | "back"
  | "logout"
  | "arrow-up"
  | "chevron-right"
  | "target";
  

const icons = {
  home: Home01Icon,
  learn: AiBookIcon,
  nomi: BotIcon,
  practice: PencilEdit02Icon,
  progress: Activity01Icon,
  notification: Notification02Icon,
  settings: Settings02Icon,
  user: User02Icon,
  back: ArrowLeft01Icon,
  logout: Logout01Icon,
  "chevron-right": ArrowRight01Icon,
  "arrow-up": ArrowUp01Icon,
  target: Target01Icon,
} as const;

export function AppIcon({
  name,
  size = 22,
  color,
  strokeWidth = 1.8,
}: {
  name: AppIconName;
  size?: number;
  color: string;
  strokeWidth?: number;
}) {
  return (
    <HugeiconsIcon
      icon={icons[name]}
      size={size}
      color={color}
      strokeWidth={strokeWidth}
    />
  );
}