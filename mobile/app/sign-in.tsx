import { Link, Redirect } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useLearnerSession } from "@/auth/LearnerSessionContext";
import { colors, radius, spacing } from "@/theme/tokens";

export default function SignInScreen() {
  const { user, loading, signIn, error, configured } = useLearnerSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  if (user) return <Redirect href="/(tabs)" />;

  return <SafeAreaView style={styles.safeArea}><KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}><View style={styles.screen}>
    <View><Text style={styles.wordmark}>nomi</Text><Text style={styles.kicker}>LEARNS HOW YOU LEARN</Text></View>
    <View style={styles.hero}><View style={styles.mascot}><View style={styles.face}><View style={styles.eye}/><View style={styles.eye}/></View></View><Text style={styles.title}>Welcome back.</Text><Text style={styles.copy}>Pick up from the learner state Nomi has already built with you.</Text></View>
    <View style={styles.form}>
      <TextInput autoCapitalize="none" autoComplete="email" keyboardType="email-address" value={email} onChangeText={setEmail} placeholder="Email address" placeholderTextColor={colors.slate} style={styles.input}/>
      <TextInput autoCapitalize="none" autoComplete="password" secureTextEntry value={password} onChangeText={setPassword} placeholder="Password" placeholderTextColor={colors.slate} style={styles.input}/>
      <Link href="/forgot-password" style={styles.recovery}>Forgot password?</Link>
      {error?<Text style={styles.error}>{error}</Text>:null}{!configured?<Text style={styles.error}>Mobile authentication is not configured on this build.</Text>:null}
      <Pressable disabled={loading||!email.trim()||!password} onPress={()=>void signIn(email.trim(),password)} style={[styles.button,(loading||!email.trim()||!password)&&styles.disabled]}>{loading?<ActivityIndicator color={colors.white}/>:<Text style={styles.buttonText}>Continue</Text>}</Pressable>
      <View style={styles.divider}><View style={styles.line}/><Text style={styles.or}>NEW TO NOMI?</Text><View style={styles.line}/></View>
      <Link href="/sign-up" asChild><Pressable style={styles.secondary}><Text style={styles.secondaryText}>Create an account</Text></Pressable></Link>
    </View>
  </View></KeyboardAvoidingView></SafeAreaView>;
}

const styles=StyleSheet.create({flex:{flex:1},safeArea:{flex:1,backgroundColor:colors.cream},screen:{flex:1,justifyContent:"space-between",padding:spacing.lg,paddingBottom:spacing.xl},wordmark:{color:colors.primaryPurple,fontSize:34,fontWeight:"900",letterSpacing:-2},kicker:{color:colors.slate,fontSize:9,fontWeight:"900",letterSpacing:1.5,marginTop:2},hero:{alignItems:"center"},mascot:{alignItems:"center",backgroundColor:colors.primaryPurple,borderRadius:54,height:108,justifyContent:"center",width:108},face:{alignItems:"center",backgroundColor:colors.white,borderRadius:28,flexDirection:"row",gap:12,height:48,justifyContent:"center",width:70},eye:{backgroundColor:colors.ink,borderRadius:8,height:16,width:9},title:{color:colors.ink,fontSize:36,fontWeight:"900",letterSpacing:-1.4,marginTop:spacing.lg},copy:{color:colors.slate,fontSize:15,lineHeight:22,marginTop:spacing.sm,maxWidth:300,textAlign:"center"},form:{gap:12},input:{backgroundColor:colors.white,borderColor:colors.stone,borderRadius:radius.lg,borderWidth:1,color:colors.ink,fontSize:15,minHeight:56,paddingHorizontal:18},recovery:{color:colors.primaryPurple,fontSize:12,fontWeight:"800",textAlign:"right"},error:{color:colors.ink,fontSize:12,lineHeight:17},button:{alignItems:"center",backgroundColor:colors.primaryPurple,borderRadius:radius.pill,justifyContent:"center",minHeight:56},disabled:{opacity:.4},buttonText:{color:colors.white,fontSize:15,fontWeight:"900"},divider:{alignItems:"center",flexDirection:"row",gap:10},line:{backgroundColor:colors.stone,flex:1,height:1},or:{color:colors.slate,fontSize:9,fontWeight:"900",letterSpacing:1},secondary:{alignItems:"center",borderColor:colors.primaryPurple,borderRadius:radius.pill,borderWidth:1,justifyContent:"center",minHeight:54},secondaryText:{color:colors.primaryPurple,fontSize:14,fontWeight:"900"}});