import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppIcon } from "@/components/AppIcon";
import { NomiMascot } from "@/components/NomiBrand";
import { colors, radius, spacing } from "@/theme/tokens";

export default function SettingsScreen() {
  const router = useRouter();

  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.screen} showsVerticalScrollIndicator={false}>
    <View style={styles.header}><Pressable onPress={()=>router.back()} style={styles.iconButton}><AppIcon name="back" size={21} color={colors.ink}/></Pressable><Text style={styles.title}>Settings</Text><View style={styles.headerSpacer}/></View>

    <View style={styles.heroCard}><View style={styles.heroCopy}><Text style={styles.kicker}>YOUR LEARNING SPACE</Text><Text style={styles.heroTitle}>Make Nomi fit around you.</Text><Text style={styles.heroBody}>Goals, subjects and learning rhythm live here as real product controls come online.</Text></View><NomiMascot state="thinking" size={124} style={styles.heroMascot}/></View>

    <Text style={styles.sectionLabel}>LEARNING</Text>
    <View style={styles.card}><SettingRow icon="target" title="Learning goal" value="Saved from onboarding" badge="PROFILE"/><View style={styles.divider}/><SettingRow icon="progress" title="Daily goal" value="20 minutes" badge="SOON"/><View style={styles.divider}/><SettingRow icon="learn" title="Subjects" value="Add and manage learning tracks" badge="NEXT"/></View>

    <Text style={styles.sectionLabel}>APP</Text>
    <View style={styles.card}><SettingRow icon="notification" title="Notifications" value="Learning reminders and account updates" onPress={()=>router.push("/notifications")}/><View style={styles.divider}/><SettingRow icon="settings" title="Appearance" value="Follows your device for now" badge="SYSTEM"/></View>

    <View style={styles.principleCard}><NomiMascot state="reinforcing" size={72}/><View style={styles.principleCopy}><Text style={styles.principleLabel}>NOMI PRINCIPLE</Text><Text style={styles.principleTitle}>Settings should change the product.</Text><Text style={styles.principleBody}>No decorative toggles. A control appears when the underlying behavior is real.</Text></View></View>
  </ScrollView></SafeAreaView>;
}

function SettingRow({icon,title,value,onPress,badge}:{icon:"target"|"progress"|"learn"|"notification"|"settings";title:string;value:string;onPress?:()=>void;badge?:string}) {
  const content=<View style={styles.row}><View style={styles.rowIcon}><AppIcon name={icon} size={20} color={colors.primaryPurple}/></View><View style={styles.rowCopy}><Text style={styles.rowTitle}>{title}</Text><Text style={styles.rowValue}>{value}</Text></View>{badge?<View style={styles.badge}><Text style={styles.badgeText}>{badge}</Text></View>:<Text style={styles.chevron}>›</Text>}</View>;
  return onPress?<Pressable onPress={onPress}>{content}</Pressable>:content;
}

const styles=StyleSheet.create({safe:{flex:1,backgroundColor:colors.cream},screen:{padding:spacing.lg,paddingBottom:spacing.xxl},header:{alignItems:"center",flexDirection:"row",justifyContent:"space-between"},iconButton:{alignItems:"center",backgroundColor:colors.white,borderRadius:radius.pill,height:40,justifyContent:"center",width:40},headerSpacer:{width:40},title:{color:colors.ink,fontSize:19,fontWeight:"900"},heroCard:{backgroundColor:colors.lavender,borderRadius:30,marginTop:spacing.lg,minHeight:224,overflow:"hidden",padding:spacing.lg,position:"relative"},heroCopy:{maxWidth:"67%",zIndex:2},kicker:{color:colors.primaryPurple,fontSize:9,fontWeight:"900",letterSpacing:1.2},heroTitle:{color:colors.ink,fontSize:31,fontWeight:"900",letterSpacing:-1,lineHeight:34,marginTop:8},heroBody:{color:colors.slate,fontSize:13,lineHeight:19,marginTop:12},heroMascot:{bottom:-4,position:"absolute",right:-5},sectionLabel:{color:colors.slate,fontSize:10,fontWeight:"900",letterSpacing:1.2,marginBottom:spacing.sm,marginTop:spacing.xl},card:{backgroundColor:colors.white,borderRadius:24,overflow:"hidden"},row:{alignItems:"center",flexDirection:"row",minHeight:78,paddingHorizontal:16,paddingVertical:12},rowIcon:{alignItems:"center",backgroundColor:colors.lavender,borderRadius:14,height:42,justifyContent:"center",width:42},rowCopy:{flex:1,marginLeft:12,paddingRight:10},rowTitle:{color:colors.ink,fontSize:14,fontWeight:"900"},rowValue:{color:colors.slate,fontSize:11,lineHeight:16,marginTop:3},badge:{backgroundColor:colors.lavender,borderRadius:radius.pill,paddingHorizontal:9,paddingVertical:6},badgeText:{color:colors.primaryPurple,fontSize:8,fontWeight:"900",letterSpacing:.45},chevron:{color:colors.primaryPurple,fontSize:24},divider:{backgroundColor:colors.stone,height:1,marginLeft:70},principleCard:{alignItems:"center",backgroundColor:colors.white,borderRadius:24,flexDirection:"row",gap:10,marginTop:spacing.xl,padding:spacing.md},principleCopy:{flex:1},principleLabel:{color:colors.primaryPurple,fontSize:8,fontWeight:"900",letterSpacing:1},principleTitle:{color:colors.ink,fontSize:16,fontWeight:"900",lineHeight:20,marginTop:4},principleBody:{color:colors.slate,fontSize:11,lineHeight:17,marginTop:4}});