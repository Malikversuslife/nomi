import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { useLearnerSession } from "@/auth/LearnerSessionContext";
import { NomiMascot, NomiWordmark } from "@/components/NomiBrand";
import { colors, radius, spacing } from "@/theme/tokens";

export default function AuthScreen() {
  const router = useRouter();
  const { configured, loading, user, error, notice, clearMessage, signIn, signUp, signInWithGoogle } = useLearnerSession();
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => { if (user) router.replace("/(tabs)"); }, [router, user]);

  async function submit() {
    if (mode === "sign-up") await signUp(name.trim(), email.trim(), password);
    else await signIn(email.trim(), password);
  }

  const ready = configured && !loading && email.trim().length > 0 && password.length > 0 && (mode === "sign-in" || name.trim().length > 0);

  return <SafeAreaView style={styles.safe}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.screen}>
    <View style={styles.brand}><NomiWordmark width={112}/><NomiMascot state="encouraging" size={122}/></View>
    <Text style={styles.eyebrow}>YOUR LEARNING SPACE</Text>
    <Text style={styles.title}>{mode === "sign-in" ? "Welcome back." : "Learn with Nomi."}</Text>
    <Text style={styles.body}>Your practice, progress and tutor context stay together on your account.</Text>
    <View style={styles.card}>
      {mode === "sign-up" ? <TextInput accessibilityLabel="Preferred name" placeholder="Preferred name" value={name} onChangeText={setName} autoCapitalize="words" style={styles.input}/> : null}
      <TextInput accessibilityLabel="Email" placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" textContentType="emailAddress" style={styles.input}/>
      <TextInput accessibilityLabel="Password" placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry textContentType={mode === "sign-up" ? "newPassword" : "password"} style={styles.input}/>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {notice ? <Text style={styles.notice}>{notice}</Text> : null}
      {!configured ? <Text style={styles.error}>Account sign-in is unavailable until Nomi is configured.</Text> : null}
      <Pressable disabled={!ready} onPress={() => void submit()} style={[styles.primary, !ready && styles.disabled]}><Text style={styles.primaryText}>{loading ? "Working…" : mode === "sign-in" ? "Sign in" : "Create account"}</Text></Pressable>
      <View style={styles.divider}><View style={styles.line}/><Text style={styles.or}>OR</Text><View style={styles.line}/></View>
      <Pressable disabled={!configured || loading} onPress={() => void signInWithGoogle()} style={[styles.google, (!configured || loading) && styles.disabled]}><Text style={styles.googleMark}>G</Text><Text style={styles.googleText}>Continue with Google</Text></Pressable>
      <Pressable onPress={() => { clearMessage(); setMode(mode === "sign-in" ? "sign-up" : "sign-in"); }} style={styles.switch}><Text style={styles.switchText}>{mode === "sign-in" ? "New to Nomi? Create an account" : "Already have an account? Sign in"}</Text></Pressable>
    </View>
    <Pressable onPress={() => router.replace("/(tabs)")} style={styles.explore}><Text style={styles.exploreText}>Explore without signing in</Text></Pressable>
  </ScrollView></SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream }, screen: { flexGrow: 1, padding: spacing.lg, paddingBottom: spacing.xxl },
  brand: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginTop: spacing.lg },
  eyebrow: { color: colors.primaryPurple, fontSize: 11, fontWeight: "900", letterSpacing: 1.5, marginTop: spacing.xl },
  title: { color: colors.ink, fontSize: 40, fontWeight: "900", letterSpacing: -1.3, marginTop: 8 },
  body: { color: colors.slate, fontSize: 16, lineHeight: 24, marginTop: 10 },
  card: { backgroundColor: colors.white, borderRadius: radius.lg, marginTop: spacing.xl, padding: spacing.lg },
  input: { backgroundColor: colors.cream, borderColor: colors.stone, borderRadius: radius.md, borderWidth: 1, color: colors.ink, fontSize: 16, marginBottom: spacing.md, paddingHorizontal: 16, paddingVertical: 15 },
  error: { color: "#B42318", fontSize: 13, lineHeight: 19, marginBottom: spacing.md },
  notice: { color: colors.primaryPurple, fontSize: 13, lineHeight: 19, marginBottom: spacing.md },
  primary: { alignItems: "center", backgroundColor: colors.primaryPurple, borderRadius: radius.pill, paddingVertical: 17 },
  primaryText: { color: colors.white, fontSize: 16, fontWeight: "900" }, disabled: { opacity: 0.45 },
  divider: { alignItems: "center", flexDirection: "row", gap: 12, marginVertical: spacing.lg }, line: { backgroundColor: colors.stone, flex: 1, height: 1 }, or: { color: colors.slate, fontSize: 11, fontWeight: "800" },
  google: { alignItems: "center", borderColor: colors.stone, borderRadius: radius.pill, borderWidth: 1, flexDirection: "row", gap: 14, justifyContent: "center", paddingVertical: 15 },
  googleMark: { color: "#4285F4", fontSize: 20, fontWeight: "900" }, googleText: { color: colors.ink, fontSize: 15, fontWeight: "800" },
  switch: { alignItems: "center", marginTop: spacing.lg }, switchText: { color: colors.primaryPurple, fontSize: 14, fontWeight: "800" },
  explore: { alignItems: "center", marginTop: spacing.lg }, exploreText: { color: colors.slate, fontSize: 13, fontWeight: "700" },
});
