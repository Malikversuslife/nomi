import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppIcon } from "@/components/AppIcon";
import { NomiMascot, NomiWordmark } from "@/components/NomiBrand";
import { colors, radius, spacing } from "@/theme/tokens";

export default function SettingsScreen() {
  const router = useRouter();

  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.screen} showsVerticalScrollIndicator={false}>
    <View style={styles.header}><Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={()=>router.back()} style={styles.back}><AppIcon name="back" color={colors.ink} size={22}/></Pressable><NomiWordmark width={64}/><View style={styles.spacer}/></View>

    <View style={styles.hero}><Text style={styles.kicker}>SETTINGS</Text><Text style={styles.heroTitle}>Make Nomi fit around you.</Text><Text style={styles.heroCopy}>Your goals, subjects and learning rhythm belong here. We only surface controls that the product can actually honor.</Text></View>

    <Text style={styles.label}>LEARNING</Text>
    <View style={styles.card}>
      <Row title="Learning goal" value="Saved from onboarding" badge="PROFILE" />
      <Row title="Daily goal" value="20 minutes" badge="SOON" />
      <Row title="Subjects" value="Add and manage learning tracks" badge="NEXT" />
    </View>

    <Text style={styles.label}>APP</Text>
    <View style={styles.card}>
      <Row title="Notifications" value="Learning reminders and account updates" onPress={()=>router.push("/notifications")} />
      <Row title="Appearance" value="Follows your device for now" badge="SYSTEM" />
    </View>

    <View style={styles.noteCard}><NomiMascot state="thinking" size={72}/><View style={styles.noteCopy}><Text style={styles.noteLabel}>NOMI PRINCIPLE</Text><Text style={styles.noteTitle}>Settings should change the product, not decorate it.</Text><Text style={styles.noteBody}>Controls appear here as the underlying behavior becomes real.</Text></View></View>
  </ScrollView></SafeAreaView>;
}

function Row({title,value,onPress,badge}:{title:string;value:string;onPress?:()=>void;badge?:string}) {
  const content=<View style={styles.row}><View style={styles.copy}><Text style={styles.rowTitle}>{title}</Text><Text style={styles.rowValue}>{value}</Text></View>{badge?<View style={styles.badge}><Text style={styles.badgeText}>{badge}</Text></View>:onPress?<AppIcon name="notification" color={colors.primaryPurple} size={20}/>:null}</View>;
  return onPress?<Pressable accessibilityRole="button" onPress={onPress}>{content}</Pressable>:content;
}

const styles=StyleSheet.create({
  safe:{flex:1,backgroundColor:colors.cream},screen:{padding:spacing.lg,paddingBottom:spacing.xxl},header:{alignItems:"center",flexDirection:"row",justifyContent:"space-between"},back:{alignItems:"center",height:40,justifyContent:"center",width:40},spacer:{width:40},hero:{marginTop:spacing.xl,marginBottom:spacing.lg},kicker:{color:colors.primaryPurple,fontSize:10,fontWeight:"900",letterSpacing:1.3},heroTitle:{color:colors.ink,fontSize:34,fontWeight:"900",letterSpacing:-1.2,lineHeight:38,marginTop:8,maxWidth:310},heroCopy:{color:colors.slate,fontSize:14,lineHeight:21,marginTop:spacing.md,maxWidth:340},label:{color:colors.slate,fontSize:10,fontWeight:"900",letterSpacing:1.3,marginBottom:spacing.sm,marginTop:spacing.lg},card:{backgroundColor:colors.white,borderRadius:radius.lg,overflow:"hidden"},row:{alignItems:"center",borderBottomColor:colors.stone,borderBottomWidth:1,flexDirection:"row",justifyContent:"space-between",minHeight:72,paddingHorizontal:18,paddingVertical:14},copy:{flex:1,paddingRight:12},rowTitle:{color:colors.ink,fontSize:15,fontWeight:"800"},rowValue:{color:colors.slate,fontSize:12,lineHeight:17,marginTop:3},badge:{backgroundColor:colors.lavender,borderRadius:radius.pill,paddingHorizontal:9,paddingVertical:6},badgeText:{color:colors.primaryPurple,fontSize:9,fontWeight:"900",letterSpacing:.5},noteCard:{alignItems:"center",backgroundColor:colors.lavender,borderRadius:radius.lg,flexDirection:"row",gap:10,marginTop:spacing.xl,padding:spacing.md},noteCopy:{flex:1},noteLabel:{color:colors.primaryPurple,fontSize:9,fontWeight:"900",letterSpacing:1.1},noteTitle:{color:colors.ink,fontSize:16,fontWeight:"900",lineHeight:21,marginTop:5},noteBody:{color:colors.slate,fontSize:12,lineHeight:18,marginTop:5}
});
