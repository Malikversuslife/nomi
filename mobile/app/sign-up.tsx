import { Link, Redirect } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useLearnerSession } from "@/auth/LearnerSessionContext";
import { colors, radius, spacing } from "@/theme/tokens";

export default function SignUpScreen() {
  const { user, loading, signUp, error } = useLearnerSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sent, setSent] = useState(false);

  if (user) return <Redirect href="/(tabs)" />;

  async function submit() {
    const result = await signUp(email.trim(), password, name.trim());
    if (result.ok && result.needsEmailConfirmation) setSent(true);
  }

  return <SafeAreaView style={styles.safe}><KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}><View style={styles.screen}>
    <View><Text style={styles.wordmark}>nomi</Text><Text style={styles.kicker}>YOUR LEARNING COMPANION</Text></View>
    <View><Text style={styles.title}>{sent ? "Check your inbox." : "Start learning your way."}</Text><Text style={styles.copy}>{sent ? "Confirm your email, then come back to Nomi to continue." : "Create your learner profile. Nomi will build its understanding from what you actually do next."}</Text></View>
    {sent ? <Link href="/sign-in" asChild><Pressable style={styles.button}><Text style={styles.buttonText}>Back to sign in</Text></Pressable></Link> : <View style={styles.form}>
      <TextInput value={name} onChangeText={setName} placeholder="Your name" placeholderTextColor={colors.slate} style={styles.input} />
      <TextInput autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} placeholder="Email address" placeholderTextColor={colors.slate} style={styles.input} />
      <TextInput secureTextEntry value={password} onChangeText={setPassword} placeholder="Password · 8+ characters" placeholderTextColor={colors.slate} style={styles.input} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable disabled={loading || !name.trim() || !email.trim() || password.length < 8} onPress={() => void submit()} style={[styles.button, (loading || !name.trim() || !email.trim() || password.length < 8) && styles.disabled]}>{loading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.buttonText}>Create my account</Text>}</Pressable>
      <Link href="/sign-in" style={styles.link}>Already learning with Nomi? Sign in</Link>
    </View>}
  </View></KeyboardAvoidingView></SafeAreaView>;
}

const styles = StyleSheet.create({
  flex:{flex:1}, safe:{flex:1,backgroundColor:colors.cream}, screen:{flex:1,justifyContent:"space-between",padding:spacing.lg,paddingBottom:spacing.xl},
  wordmark:{color:colors.primaryPurple,fontSize:34,fontWeight:"900",letterSpacing:-2}, kicker:{color:colors.slate,fontSize:9,fontWeight:"900",letterSpacing:1.5},
  title:{color:colors.ink,fontSize:38,fontWeight:"900",letterSpacing:-1.6,lineHeight:41,maxWidth:330}, copy:{color:colors.slate,fontSize:15,lineHeight:22,marginTop:spacing.md,maxWidth:330},
  form:{gap:12}, input:{backgroundColor:colors.white,borderColor:colors.stone,borderRadius:radius.lg,borderWidth:1,color:colors.ink,fontSize:15,minHeight:56,paddingHorizontal:18},
  error:{color:colors.ink,fontSize:12}, button:{alignItems:"center",backgroundColor:colors.primaryPurple,borderRadius:radius.pill,justifyContent:"center",minHeight:56}, disabled:{opacity:.4}, buttonText:{color:colors.white,fontSize:15,fontWeight:"900"}, link:{color:colors.primaryPurple,fontSize:13,fontWeight:"800",paddingVertical:8,textAlign:"center"}
});