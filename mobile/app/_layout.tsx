import "react-native-url-polyfill/auto";

import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";

import { LearnerSessionProvider } from "@/auth/LearnerSessionContext";
import { PracticeProgressProvider } from "@/progress/PracticeProgressContext";
import { colors } from "@/theme/tokens";

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => { void SplashScreen.hideAsync(); }, []);
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
          <Stack.Screen name="auth" />
        </Stack>
      </PracticeProgressProvider>
    </LearnerSessionProvider>
  );
}
