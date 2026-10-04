import { Tabs } from "expo-router";
import { StyleSheet, View, type ColorValue } from "react-native";

import { AppIcon, type AppIconName } from "@/components/AppIcon";
import { colors } from "@/theme/tokens";

type TabName = "Home" | "Learn" | "Nomi" | "Practice" | "Progress";

const tabIcons: Record<TabName, AppIconName> = {
  Home: "home",
  Learn: "learn",
  Nomi: "nomi",
  Practice: "practice",
  Progress: "progress",
};

function TabIcon({
  name,
  color,
  focused,
}: {
  name: TabName;
  color: ColorValue;
  focused: boolean;
}) {
  return (
    <View style={[styles.iconFrame, focused && styles.iconFrameFocused]}>
      <AppIcon
        name={tabIcons[name]}
        size={22}
        color={String(color)}
        strokeWidth={focused ? 2.2 : 1.8}
      />
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      detachInactiveScreens={false}
      screenOptions={{
        lazy: false,
        headerShown: false,
        tabBarActiveTintColor: colors.primaryPurple,
        tabBarInactiveTintColor: colors.slate,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
          marginBottom: 2,
        },
        tabBarItemStyle: {
          paddingTop: 5,
        },
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.stone,
          borderTopWidth: 1,
          height: 68,
          paddingTop: 4,
        },
        sceneStyle: {
          backgroundColor: colors.cream,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="Home" color={color} focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="learn"
        options={{
          title: "Learn",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="Learn" color={color} focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="nomi"
        options={{
          title: "Nomi",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="Nomi" color={color} focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="practice"
        options={{
          title: "Practice",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="Practice" color={color} focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="progress"
        options={{
          title: "Progress",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="Progress" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconFrame: {
    alignItems: "center",
    justifyContent: "center",
    height: 28,
    width: 32,
  },
  iconFrameFocused: {
    transform: [{ scale: 1.04 }],
  },
});