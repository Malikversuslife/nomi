import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useLearnerSession } from "@/auth/LearnerSessionContext";
import { AppIcon } from "@/components/AppIcon";
import { NomiMascot, NomiWordmark } from "@/components/NomiBrand";
import { colors, radius, spacing } from "@/theme/tokens";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, displayName, signOut } = useLearnerSession();
  const initial = (displayName ?? user?.email ?? "N").charAt(0).toUpperCase();

  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.screen} showsVerticalScrollIndicator={false}>
    <View style={styles.header}><Pressable onPress={()=>router.back()} style={styles.iconButton}><AppIcon name="back" size={21} color={colors.ink}/></Pressable><NomiWordmark width={82}/><View style={styles.headerSpacer}/></View>

    <View style={styles.heroCard}>
      <View style={styles.heroCopy}><Text style={styles.eyebrow}>YOUR LEARNING SPACE</Text><Text style={styles.heroTitle}>{displayName??"Nomi learner"}</Text><Text style={styles.email}>{user?.email??""}</Text><Text style={styles.heroBody}>One profile keeps Nomi’s context connected across subjects, practice and tutoring.</Text></View>
      <NomiMascot state="supportive" size={126} style={styles.heroMascot}/>
    </View>

    <View style={styles.quickCard}><View style={styles.avatar}><Text style={styles.avatarText}>{initial}</Text></View><View style={styles.quickCopy}><Text style={styles.quickLabel}>LEARNER PROFILE</Text><Text style={styles.quickTitle}>Your preferences and learning setup</Text></View><AppIcon name="user" size={22} color={colors.primaryPurple}/></View>

    <Text style={styles.sectionLabel}>YOUR NOMI</Text>
    <View style={styles.menuCard}><MenuRow icon="settings" title="Settings" subtitle="Goals, subjects and app controls" onPress={()=>router.push("/settings")}/><View style={styles.divider}/><MenuRow icon="notification" title="Notifications" subtitle="Learning reminders and account updates" onPress={()=>router.push("/notifications")}/></View>

    <Pressable onPress={()=>void signOut()} style={styles.signOut}><AppIcon name="logout" size={19} color={colors.ink}/><Text style={styles.signOutText}>Sign out</Text></Pressable>
  </ScrollView></SafeAreaView>;
}

function MenuRow({icon,title,subtitle,onPress}:{icon:"settings"|"notification";title:string;subtitle:string;onPress:()=>void}) {
  return <Pressable onPress={onPress} style={styles.row}><View style={styles.rowIcon}><AppIcon name={icon} size={20} color={colors.primaryPurple}/></View><View style={styles.rowCopy}><Text style={styles.rowTitle}>{title}</Text><Text style={styles.rowSub}>{subtitle}</Text></View><Text style={styles.chevron}>›</Text></Pressable>;
}

const styles=StyleSheet.create({safe:{flex:1,backgroundColor:colors.cream},screen:{padding:spacing.lg,paddingBottom:spacing.xxl},header:{alignItems:"center",flexDirection:"row",justifyContent:"space-between"},iconButton:{alignItems:"center",backgroundColor:colors.white,borderRadius:radius.pill,height:40,justifyContent:"center",width:40},headerSpacer:{width:40},heroCard:{backgroundColor:colors.lavender,borderRadius:30,marginTop:spacing.lg,minHeight:220,overflow:"hidden",padding:spacing.lg,position:"relative"},heroCopy:{maxWidth:"68%",zIndex:2},eyebrow:{color:colors.primaryPurple,fontSize:9,fontWeight:"900",letterSpacing:1.2},heroTitle:{color:colors.ink,fontSize:30,fontWeight:"900",letterSpacing:-1,lineHeight:34,marginTop:7},email:{color:colors.slate,fontSize:11,marginTop:5},heroBody:{color:colors.slate,fontSize:13,lineHeight:19,marginTop:14},heroMascot:{bottom:-6,position:"absolute",right:-5},quickCard:{alignItems:"center",backgroundColor:colors.white,borderRadius:24,flexDirection:"row",gap:12,marginTop:spacing.md,padding:spacing.md},avatar:{alignItems:"center",backgroundColor:colors.warmSurface,borderRadius:radius.pill,height:52,justifyContent:"center",width:52},avatarText:{color:colors.primaryPurple,fontSize:20,fontWeight:"900"},quickCopy:{flex:1},quickLabel:{color:colors.primaryPurple,fontSize:8,fontWeight:"900",letterSpacing:1},quickTitle:{color:colors.ink,fontSize:14,fontWeight:"900",lineHeight:19,marginTop:3},sectionLabel:{color:colors.slate,fontSize:10,fontWeight:"900",letterSpacing:1.2,marginBottom:spacing.sm,marginTop:spacing.xl},menuCard:{backgroundColor:colors.white,borderRadius:24,overflow:"hidden"},row:{alignItems:"center",flexDirection:"row",minHeight:76,paddingHorizontal:16,paddingVertical:12},rowIcon:{alignItems:"center",backgroundColor:colors.lavender,borderRadius:14,height:42,justifyContent:"center",width:42},rowCopy:{flex:1,marginLeft:12},rowTitle:{color:colors.ink,fontSize:15,fontWeight:"900"},rowSub:{color:colors.slate,fontSize:11,lineHeight:16,marginTop:3},divider:{backgroundColor:colors.stone,height:1,marginLeft:70},chevron:{color:colors.slate,fontSize:24},signOut:{alignItems:"center",borderColor:colors.stone,borderRadius:radius.pill,borderWidth:1,flexDirection:"row",gap:8,justifyContent:"center",marginTop:spacing.xl,paddingVertical:15},signOutText:{color:colors.ink,fontSize:14,fontWeight:"900"}});