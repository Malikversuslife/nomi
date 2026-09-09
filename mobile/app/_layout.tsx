import "react-native-url-polyfill/auto";

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { LearnerSessionProvider } from "@/auth/LearnerSessionContext";
import { PracticeProgressProvider } from "@/progress/PracticeProgressContext";
import { colors } from "@/theme/tokens";

export default function RootLayout() {
  return (
    <LearnerSessionProvider>
      <PracticeProgressProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.cream },
          }}
        >
          <Stack.Screen name="(tabs)" />
        </Stack>
      </PracticeProgressProvider>
    </LearnerSessionProvider>
  );
}
