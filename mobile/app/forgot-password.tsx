import { Link } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useLearnerSession } from "@/auth/LearnerSessionContext";
import { colors, radius, spacing } from "@/theme/tokens";

export default function ForgotPasswordScreen() {
  const { resetPassword, error } = useLearnerSession();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  async function submit() { if (await resetPassword(email.trim())) setSent(true); }

  return <SafeAreaView style={styles.safe}><View style={styles.screen}>
    <View><Text style={styles.wordmark}>nomi</Text><Text style={styles.kicker}>ACCOUNT RECOVERY</Text></View>
    <View><Text style={styles.title}>{sent ? "Recovery sent." : "Find your way back."}</Text><Text style={styles.copy}>{sent ? "If that address belongs to a Nomi account, check your inbox for the recovery link." : "Enter the email connected to your learner profile."}</Text></View>
    <View style={styles.form}>{!sent ? <><TextInput autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} placeholder="Email address" placeholderTextColor={colors.slate} style={styles.input} />{error ? <Text style={styles.error}>{error}</Text> : null}<Pressable disabled={!email.trim()} onPress={() => void submit()} style={[styles.button,!email.trim()&&styles.disabled]}><Text style={styles.buttonText}>Send recovery email</Text></Pressable></> : null}<Link href="/sign-in" style={styles.link}>Back to sign in</Link></View>
  </View></SafeAreaView>;
}

const styles=StyleSheet.create({safe:{flex:1,backgroundColor:colors.cream},screen:{flex:1,justifyContent:"space-between",padding:spacing.lg,paddingBottom:spacing.xl},wordmark:{color:colors.primaryPurple,fontSize:34,fontWeight:"900",letterSpacing:-2},kicker:{color:colors.slate,fontSize:9,fontWeight:"900",letterSpacing:1.5},title:{color:colors.ink,fontSize:38,fontWeight:"900",letterSpacing:-1.6},copy:{color:colors.slate,fontSize:15,lineHeight:22,marginTop:spacing.md,maxWidth:330},form:{gap:12},input:{backgroundColor:colors.white,borderColor:colors.stone,borderRadius:radius.lg,borderWidth:1,color:colors.ink,fontSize:15,minHeight:56,paddingHorizontal:18},error:{color:colors.ink,fontSize:12},button:{alignItems:"center",backgroundColor:colors.primaryPurple,borderRadius:radius.pill,justifyContent:"center",minHeight:56},disabled:{opacity:.4},buttonText:{color:colors.white,fontSize:15,fontWeight:"900"},link:{color:colors.primaryPurple,fontSize:13,fontWeight:"800",paddingVertical:8,textAlign:"center"}});