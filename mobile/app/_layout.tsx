import "react-native-url-polyfill/auto";

import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { LearnerSessionProvider, useLearnerSession } from "@/auth/LearnerSessionContext";
import { PracticeProgressProvider } from "@/progress/PracticeProgressContext";
import { colors } from "@/theme/tokens";

const publicRoutes = new Set(["sign-in", "sign-up", "forgot-password"]);

function SessionGate() {
  const router = useRouter();
  const segments = useSegments();
  const { loading, user } = useLearnerSession();
  const isPublicAuthRoute = publicRoutes.has(segments[0] ?? "");

  useEffect(() => {
    if (loading) return;
    if (!user && !isPublicAuthRoute) router.replace("/sign-in");
    if (user && isPublicAuthRoute) router.replace("/(tabs)");
  }, [isPublicAuthRoute, loading, router, user]);

  if (loading) return <View style={styles.splash}><View style={styles.mark}><View style={styles.face}><View style={styles.eye}/><View style={styles.eye}/></View></View><ActivityIndicator color={colors.primaryPurple}/></View>;

  return <><StatusBar style="dark"/><Stack screenOptions={{headerShown:false,contentStyle:{backgroundColor:colors.cream}}}><Stack.Screen name="sign-in"/><Stack.Screen name="sign-up"/><Stack.Screen name="forgot-password"/><Stack.Screen name="onboarding"/><Stack.Screen name="(tabs)"/></Stack></>;
}

export default function RootLayout(){return <LearnerSessionProvider><PracticeProgressProvider><SessionGate/></PracticeProgressProvider></LearnerSessionProvider>;}

const styles=StyleSheet.create({splash:{alignItems:"center",backgroundColor:colors.cream,flex:1,gap:24,justifyContent:"center"},mark:{alignItems:"center",backgroundColor:colors.primaryPurple,borderRadius:44,height:88,justifyContent:"center",width:88},face:{alignItems:"center",backgroundColor:colors.white,borderRadius:22,flexDirection:"row",gap:9,height:39,justifyContent:"center",width:58},eye:{backgroundColor:colors.ink,borderRadius:6,height:13,width:7}});