import { Image, ImageStyle, StyleProp } from "react-native";

export type NomiMascotState =
  | "neutral"
  | "thinking"
  | "curious"
  | "encouraging"
  | "celebrating"
  | "reinforcing"
  | "challenge"
  | "supportive";

const wordmarkPurple = require("../../../public/brand/nomi/wordmark-purple.png");

const mascotSources: Record<NomiMascotState, number> = {
  neutral: require("../../../public/brand/nomi/mascot/neutral.png"),
  thinking: require("../../../public/brand/nomi/mascot/thinking.png"),
  curious: require("../../../public/brand/nomi/mascot/curious.png"),
  encouraging: require("../../../public/brand/nomi/mascot/encouraging.png"),
  celebrating: require("../../../public/brand/nomi/mascot/celebrating.png"),
  reinforcing: require("../../../public/brand/nomi/mascot/reinforcing.png"),
  challenge: require("../../../public/brand/nomi/mascot/challenge.png"),
  supportive: require("../../../public/brand/nomi/mascot/supportive.png"),
};

export function NomiWordmark({ width = 84, style }: { width?: number; style?: StyleProp<ImageStyle> }) {
  return <Image source={wordmarkPurple} resizeMode="contain" style={[{ width, height: 38 }, style]} accessibilityLabel="Nomi" />;
}

export function NomiMascot({ state = "neutral", size = 88, style }: { state?: NomiMascotState; size?: number; style?: StyleProp<ImageStyle> }) {
  return <Image source={mascotSources[state]} resizeMode="contain" style={[{ width: size, height: size }, style]} accessibilityLabel={`Nomi ${state}`} />;
}
