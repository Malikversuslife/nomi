import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppIcon } from "@/components/AppIcon";
import { NomiMascot } from "@/components/NomiBrand";
import { colors, radius, spacing } from "@/theme/tokens";

export default function NotificationsScreen() {
  const router = useRouter();

  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.screen} showsVerticalScrollIndicator={false}>
    <View style={styles.header}><Pressable onPress={()=>router.back()} style={styles.iconButton}><AppIcon name="back" size={21} color={colors.ink}/></Pressable><Text style={styles.title}>Notifications</Text><View style={styles.headerSpacer}/></View>

    <View style={styles.heroCard}><View style={styles.heroCopy}><Text style={styles.kicker}>STAY IN YOUR RHYTHM</Text><Text style={styles.heroTitle}>Useful nudges. Nothing noisy.</Text><Text style={styles.heroBody}>Nomi should interrupt only when a reminder protects momentum or your account.</Text></View><NomiMascot state="curious" size={126} style={styles.heroMascot}/></View>

    <Text style={styles.sectionLabel}>CURRENT CHANNELS</Text>
    <View style={styles.card}><ChannelRow title="Learning reminders" body="Gentle prompts tied to your study rhythm." status="COMING SOON"/><View style={styles.divider}/><ChannelRow title="Practice follow-ups" body="Return to concepts that need more evidence." status="COMING SOON"/><View style={styles.divider}/><ChannelRow title="Account updates" body="Important authentication and account messages." status="ESSENTIAL" essential/></View>

    <View style={styles.noteCard}><View style={styles.noteIcon}><AppIcon name="notification" size={21} color={colors.primaryPurple}/></View><View style={styles.noteCopy}><Text style={styles.noteLabel}>WHY NO TOGGLES YET</Text><Text style={styles.noteTitle}>A switch should control something real.</Text><Text style={styles.noteBody}>Push delivery and saved preferences are not wired yet, so the UI stays truthful until those capabilities exist.</Text></View></View>
  </ScrollView></SafeAreaView>;
}

function ChannelRow({title,body,status,essential=false}:{title:string;body:string;status:string;essential?:boolean}) {
  return <View style={styles.row}><View style={styles.rowIcon}><AppIcon name="notification" size={18} color={colors.primaryPurple}/></View><View style={styles.rowCopy}><Text style={styles.rowTitle}>{title}</Text><Text style={styles.rowBody}>{body}</Text></View><View style={[styles.badge,essential&&styles.badgeEssential]}><Text style={[styles.badgeText,essential&&styles.badgeEssentialText]}>{status}</Text></View></View>;
}

const styles=StyleSheet.create({safe:{flex:1,backgroundColor:colors.cream},screen:{padding:spacing.lg,paddingBottom:spacing.xxl},header:{alignItems:"center",flexDirection:"row",justifyContent:"space-between"},iconButton:{alignItems:"center",backgroundColor:colors.white,borderRadius:radius.pill,height:40,justifyContent:"center",width:40},headerSpacer:{width:40},title:{color:colors.ink,fontSize:19,fontWeight:"900"},heroCard:{backgroundColor:colors.lavender,borderRadius:30,marginTop:spacing.lg,minHeight:224,overflow:"hidden",padding:spacing.lg,position:"relative"},heroCopy:{maxWidth:"67%",zIndex:2},kicker:{color:colors.primaryPurple,fontSize:9,fontWeight:"900",letterSpacing:1.2},heroTitle:{color:colors.ink,fontSize:31,fontWeight:"900",letterSpacing:-1,lineHeight:34,marginTop:8},heroBody:{color:colors.slate,fontSize:13,lineHeight:19,marginTop:12},heroMascot:{bottom:-4,position:"absolute",right:-5},sectionLabel:{color:colors.slate,fontSize:10,fontWeight:"900",letterSpacing:1.2,marginBottom:spacing.sm,marginTop:spacing.xl},card:{backgroundColor:colors.white,borderRadius:24,overflow:"hidden"},row:{alignItems:"center",flexDirection:"row",gap:12,minHeight:86,paddingHorizontal:14,paddingVertical:12},rowIcon:{alignItems:"center",backgroundColor:colors.lavender,borderRadius:13,height:40,justifyContent:"center",width:40},rowCopy:{flex:1},rowTitle:{color:colors.ink,fontSize:14,fontWeight:"900"},rowBody:{color:colors.slate,fontSize:11,lineHeight:16,marginTop:3},badge:{backgroundColor:colors.lavender,borderRadius:radius.pill,paddingHorizontal:8,paddingVertical:6},badgeEssential:{backgroundColor:colors.warmSurface},badgeText:{color:colors.primaryPurple,fontSize:7,fontWeight:"900",letterSpacing:.35},badgeEssentialText:{color:colors.ink},divider:{backgroundColor:colors.stone,height:1,marginLeft:66},noteCard:{alignItems:"flex-start",backgroundColor:colors.white,borderRadius:24,flexDirection:"row",gap:12,marginTop:spacing.xl,padding:spacing.md},noteIcon:{alignItems:"center",backgroundColor:colors.lavender,borderRadius:14,height:42,justifyContent:"center",width:42},noteCopy:{flex:1},noteLabel:{color:colors.primaryPurple,fontSize:8,fontWeight:"900",letterSpacing:1},noteTitle:{color:colors.ink,fontSize:16,fontWeight:"900",lineHeight:20,marginTop:4},noteBody:{color:colors.slate,fontSize:11,lineHeight:17,marginTop:4}});