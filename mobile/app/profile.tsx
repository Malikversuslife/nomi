import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useLearnerSession } from "@/auth/LearnerSessionContext";
import { colors, radius, spacing } from "@/theme/tokens";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, displayName, signOut } = useLearnerSession();
  const initial = (displayName ?? user?.email ?? "N").charAt(0).toUpperCase();

  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.screen}>
    <View style={styles.header}><Pressable onPress={()=>router.back()} style={styles.back}><Text style={styles.backText}>‹</Text></Pressable><Text style={styles.wordmark}>nomi</Text><View style={styles.spacer}/></View>
    <View style={styles.identity}><View style={styles.avatar}><Text style={styles.avatarText}>{initial}</Text></View><Text style={styles.name}>{displayName ?? "Nomi learner"}</Text><Text style={styles.email}>{user?.email ?? ""}</Text></View>
    <View style={styles.section}><Text style={styles.label}>YOUR NOMI</Text><Pressable onPress={()=>router.push("/settings")} style={styles.row}><Text style={styles.rowText}>Settings</Text><Text style={styles.chevron}>›</Text></Pressable><Pressable onPress={()=>router.push("/notifications")} style={styles.row}><Text style={styles.rowText}>Notifications</Text><Text style={styles.chevron}>›</Text></Pressable></View>
    <Pressable onPress={()=>void signOut()} style={styles.signOut}><Text style={styles.signOutText}>Sign out</Text></Pressable>
  </ScrollView></SafeAreaView>;
}

const styles=StyleSheet.create({safe:{flex:1,backgroundColor:colors.cream},screen:{padding:spacing.lg,paddingBottom:spacing.xxl},header:{alignItems:"center",flexDirection:"row",justifyContent:"space-between"},back:{alignItems:"center",height:40,justifyContent:"center",width:40},backText:{color:colors.ink,fontSize:34,lineHeight:36},wordmark:{color:colors.primaryPurple,fontSize:28,fontWeight:"900",letterSpacing:-1.8},spacer:{width:40},identity:{alignItems:"center",marginTop:spacing.xxl},avatar:{alignItems:"center",backgroundColor:colors.lavender,borderRadius:radius.pill,height:84,justifyContent:"center",width:84},avatarText:{color:colors.primaryPurple,fontSize:30,fontWeight:"900"},name:{color:colors.ink,fontSize:28,fontWeight:"900",letterSpacing:-.8,marginTop:spacing.md},email:{color:colors.slate,fontSize:13,marginTop:4},section:{marginTop:spacing.xxl},label:{color:colors.slate,fontSize:10,fontWeight:"900",letterSpacing:1.3,marginBottom:spacing.sm},row:{alignItems:"center",backgroundColor:colors.white,borderRadius:radius.lg,flexDirection:"row",justifyContent:"space-between",marginBottom:10,minHeight:60,paddingHorizontal:18},rowText:{color:colors.ink,fontSize:15,fontWeight:"800"},chevron:{color:colors.slate,fontSize:24},signOut:{alignItems:"center",borderColor:colors.stone,borderRadius:radius.pill,borderWidth:1,marginTop:spacing.xxl,paddingVertical:16},signOutText:{color:colors.ink,fontSize:14,fontWeight:"900"}});