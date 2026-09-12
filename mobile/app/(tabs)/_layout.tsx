import { Tabs } from "expo-router";
import { Text } from "react-native";

import { colors } from "@/theme/tokens";

const tabIcons: Record<string, string> = {
  Home: "⌂",
  Learn: "▤",
  Nomi: "●",
  Practice: "✎",
  Progress: "↗",
};

function TabIcon({ name, color }: { name: keyof typeof tabIcons; color: string }) {
  return <Text style={{ color, fontSize: 20, fontWeight: "800" }}>{tabIcons[name]}</Text>;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primaryPurple,
        tabBarInactiveTintColor: colors.slate,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.stone,
        },
        sceneStyle: { backgroundColor: colors.cream },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: ({ color }) => <TabIcon name="Home" color={color} /> }} />
      <Tabs.Screen name="learn" options={{ title: "Learn", tabBarIcon: ({ color }) => <TabIcon name="Learn" color={color} /> }} />
      <Tabs.Screen name="nomi" options={{ title: "Nomi", tabBarIcon: ({ color }) => <TabIcon name="Nomi" color={color} /> }} />
      <Tabs.Screen name="practice" options={{ title: "Practice", tabBarIcon: ({ color }) => <TabIcon name="Practice" color={color} /> }} />
      <Tabs.Screen name="progress" options={{ title: "Progress", tabBarIcon: ({ color }) => <TabIcon name="Progress" color={color} /> }} />
    </Tabs>
  );
}
