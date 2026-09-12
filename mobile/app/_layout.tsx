import "react-native-url-polyfill/auto";

import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";

import { LearnerSessionProvider, useLearnerSession } from "@/auth/LearnerSessionContext";
import { NomiMascot, NomiWordmark } from "@/components/NomiBrand";
import { PracticeProgressProvider } from "@/progress/PracticeProgressContext";
import { colors } from "@/theme/tokens";

void SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({ duration: 350, fade: true });

const publicRoutes = new Set(["sign-in", "sign-up", "forgot-password"]);

function SessionGate() {
  const router = useRouter();
  const segments = useSegments();
  const { loading, user, onboardingCompleted } = useLearnerSession();
  const firstSegment = segments[0] ?? "";
  const isPublicAuthRoute = publicRoutes.has(firstSegment);
  const isOnboarding = firstSegment === "onboarding";
  const readyForApp = !loading && (!user || onboardingCompleted !== null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      if (!isPublicAuthRoute) router.replace("/sign-in");
      return;
    }
    if (onboardingCompleted === false) {
      if (!isOnboarding) router.replace("/onboarding");
      return;
    }
    if (onboardingCompleted === true && (isPublicAuthRoute || isOnboarding)) router.replace("/(tabs)");
  }, [isOnboarding, isPublicAuthRoute, loading, onboardingCompleted, router, user]);

  useEffect(() => {
    if (readyForApp) void SplashScreen.hideAsync();
  }, [readyForApp]);

  if (!readyForApp) return <View style={styles.splash}><NomiMascot state="neutral" size={112}/><NomiWordmark width={92}/></View>;

  return <><StatusBar style="dark"/><Stack screenOptions={{headerShown:false,contentStyle:{backgroundColor:colors.cream}}}><Stack.Screen name="sign-in"/><Stack.Screen name="sign-up"/><Stack.Screen name="forgot-password"/><Stack.Screen name="onboarding"/><Stack.Screen name="profile"/><Stack.Screen name="settings"/><Stack.Screen name="notifications"/><Stack.Screen name="(tabs)"/></Stack></>;
}

export default function RootLayout(){return <LearnerSessionProvider><PracticeProgressProvider><SessionGate/></PracticeProgressProvider></LearnerSessionProvider>;}

const styles=StyleSheet.create({splash:{alignItems:"center",backgroundColor:colors.cream,flex:1,gap:18,justifyContent:"center"}});
