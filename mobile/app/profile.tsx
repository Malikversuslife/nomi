import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useLearnerSession } from "@/auth/LearnerSessionContext";
import { AppIcon, AppIconName } from "@/components/AppIcon";
import { NomiMascot, NomiWordmark } from "@/components/NomiBrand";
import { colors, radius, spacing } from "@/theme/tokens";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, displayName, signOut } = useLearnerSession();
  const initial = (displayName ?? user?.email ?? "N").charAt(0).toUpperCase();

  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.screen} showsVerticalScrollIndicator={false}>
    <View style={styles.header}><Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={()=>router.back()} style={styles.back}><AppIcon name="back" color={colors.ink} size={22}/></Pressable><NomiWordmark width={64}/><View style={styles.spacer}/></View>

    <View style={styles.identityCard}><View style={styles.avatar}><Text style={styles.avatarText}>{initial}</Text></View><View style={styles.identityCopy}><Text style={styles.eyebrow}>YOUR LEARNING SPACE</Text><Text style={styles.name}>{displayName ?? "Nomi learner"}</Text><Text style={styles.email}>{user?.email ?? ""}</Text></View></View>

    <View style={styles.nomiNote}><NomiMascot state="supportive" size={66}/><View style={styles.nomiCopy}><Text style={styles.nomiLabel}>NOMI</Text><Text style={styles.nomiText}>Your profile keeps the learning context Nomi uses across subjects, practice and tutor conversations.</Text></View></View>

    <Text style={styles.label}>YOUR NOMI</Text>
    <View style={styles.menuCard}><MenuRow icon="settings" title="Settings" subtitle="Learning preferences and app controls" onPress={()=>router.push("/settings")}/><View style={styles.divider}/><MenuRow icon="notification" title="Notifications" subtitle="Reminders and account updates" onPress={()=>router.push("/notifications")}/></View>

    <Pressable accessibilityRole="button" onPress={()=>void signOut()} style={styles.signOut}><AppIcon name="logout" color={colors.ink} size={19}/><Text style={styles.signOutText}>Sign out</Text></Pressable>
  </ScrollView></SafeAreaView>;
}

function MenuRow({icon,title,subtitle,onPress}:{icon:AppIconName;title:string;subtitle:string;onPress:()=>void}){return <Pressable accessibilityRole="button" onPress={onPress} style={styles.row}><View style={styles.rowIcon}><AppIcon name={icon} color={colors.primaryPurple} size={20}/></View><View style={styles.rowCopy}><Text style={styles.rowText}>{title}</Text><Text style={styles.rowSub}>{subtitle}</Text></View></Pressable>}

const styles=StyleSheet.create({safe:{flex:1,backgroundColor:colors.cream},screen:{padding:spacing.lg,paddingBottom:spacing.xxl},header:{alignItems:"center",flexDirection:"row",justifyContent:"space-between"},back:{alignItems:"center",height:40,justifyContent:"center",width:40},spacer:{width:40},identityCard:{alignItems:"center",backgroundColor:colors.white,borderRadius:radius.lg,flexDirection:"row",marginTop:spacing.xl,padding:spacing.lg},avatar:{alignItems:"center",backgroundColor:colors.lavender,borderRadius:radius.pill,height:72,justifyContent:"center",width:72},avatarText:{color:colors.primaryPurple,fontSize:27,fontWeight:"900"},identityCopy:{flex:1,marginLeft:spacing.md},eyebrow:{color:colors.primaryPurple,fontSize:9,fontWeight:"900",letterSpacing:1.2},name:{color:colors.ink,fontSize:24,fontWeight:"900",letterSpacing:-.7,marginTop:5},email:{color:colors.slate,fontSize:12,marginTop:3},nomiNote:{alignItems:"center",backgroundColor:colors.lavender,borderRadius:radius.lg,flexDirection:"row",marginTop:spacing.md,padding:spacing.md},nomiCopy:{flex:1,marginLeft:10},nomiLabel:{color:colors.primaryPurple,fontSize:10,fontWeight:"900",letterSpacing:1.1},nomiText:{color:colors.ink,fontSize:13,lineHeight:19,marginTop:4},label:{color:colors.slate,fontSize:10,fontWeight:"900",letterSpacing:1.3,marginBottom:spacing.sm,marginTop:spacing.xl},menuCard:{backgroundColor:colors.white,borderRadius:radius.lg,overflow:"hidden"},row:{alignItems:"center",flexDirection:"row",minHeight:72,paddingHorizontal:18,paddingVertical:14},rowIcon:{alignItems:"center",backgroundColor:colors.lavender,borderRadius:12,height:40,justifyContent:"center",marginRight:12,width:40},rowCopy:{flex:1},rowText:{color:colors.ink,fontSize:15,fontWeight:"800"},rowSub:{color:colors.slate,fontSize:12,lineHeight:17,marginTop:3},divider:{backgroundColor:colors.stone,height:1,marginLeft:70},signOut:{alignItems:"center",borderColor:colors.stone,borderRadius:radius.pill,borderWidth:1,flexDirection:"row",gap:8,justifyContent:"center",marginTop:spacing.xl,paddingVertical:16},signOutText:{color:colors.ink,fontSize:14,fontWeight:"900"}});
