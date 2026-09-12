import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, radius, spacing } from "@/theme/tokens";

export default function NotificationsScreen() {
  const router = useRouter();

  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.screen} showsVerticalScrollIndicator={false}>
    <View style={styles.header}><Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={()=>router.back()} style={styles.back}><Text style={styles.backText}>‹</Text></Pressable><Text style={styles.title}>Notifications</Text><View style={styles.spacer}/></View>

    <View style={styles.hero}><View style={styles.miniMark}><View style={styles.face}><View style={styles.eye}/><View style={styles.eye}/></View></View><Text style={styles.kicker}>STAY IN YOUR RHYTHM</Text><Text style={styles.heroTitle}>Useful nudges, not noise.</Text><Text style={styles.copy}>Nomi should interrupt you only when it can help you keep momentum or protect your account.</Text></View>

    <Text style={styles.sectionLabel}>CURRENT CHANNELS</Text>
    <View style={styles.card}>
      <Item title="Learning reminders" description="Gentle prompts tied to your study rhythm." status="COMING SOON" />
      <Item title="Practice follow-ups" description="Return to concepts that need more evidence." status="COMING SOON" />
      <Item title="Account updates" description="Important authentication and account messages." status="ESSENTIAL" />
    </View>

    <View style={styles.infoCard}><Text style={styles.infoEyebrow}>WHY THESE AREN'T TOGGLES YET</Text><Text style={styles.infoTitle}>A switch should control something real.</Text><Text style={styles.infoBody}>Push delivery and preference persistence are not wired yet, so Nomi shows the planned notification model without pretending the controls already work.</Text></View>
  </ScrollView></SafeAreaView>;
}

function Item({title,description,status}:{title:string;description:string;status:string}) {
  return <View style={styles.row}><View style={styles.rowCopy}><Text style={styles.rowTitle}>{title}</Text><Text style={styles.rowDescription}>{description}</Text></View><View style={[styles.status,status==="ESSENTIAL"&&styles.statusEssential]}><Text style={[styles.statusText,status==="ESSENTIAL"&&styles.statusTextEssential]}>{status}</Text></View></View>;
}

const styles=StyleSheet.create({
  safe:{flex:1,backgroundColor:colors.cream},
  screen:{padding:spacing.lg,paddingBottom:spacing.xxl},
  header:{alignItems:"center",flexDirection:"row",justifyContent:"space-between"},
  back:{alignItems:"center",height:40,justifyContent:"center",width:40},
  backText:{color:colors.ink,fontSize:34,lineHeight:36},
  title:{color:colors.ink,fontSize:20,fontWeight:"900"},
  spacer:{width:40},
  hero:{marginTop:spacing.xl},
  miniMark:{alignItems:"center",backgroundColor:colors.primaryPurple,borderRadius:26,height:52,justifyContent:"center",marginBottom:spacing.lg,width:52},
  face:{alignItems:"center",backgroundColor:colors.white,borderRadius:11,flexDirection:"row",gap:5,height:22,justifyContent:"center",width:32},
  eye:{backgroundColor:colors.ink,borderRadius:3,height:7,width:4},
  kicker:{color:colors.primaryPurple,fontSize:10,fontWeight:"900",letterSpacing:1.3},
  heroTitle:{color:colors.ink,fontSize:36,fontWeight:"900",letterSpacing:-1.3,lineHeight:39,marginTop:8,maxWidth:320},
  copy:{color:colors.slate,fontSize:14,lineHeight:21,marginTop:spacing.md,maxWidth:340},
  sectionLabel:{color:colors.slate,fontSize:10,fontWeight:"900",letterSpacing:1.3,marginBottom:spacing.sm,marginTop:spacing.xl},
  card:{backgroundColor:colors.white,borderRadius:radius.lg,overflow:"hidden"},
  row:{alignItems:"center",borderBottomColor:colors.stone,borderBottomWidth:1,flexDirection:"row",gap:14,justifyContent:"space-between",minHeight:82,paddingHorizontal:18,paddingVertical:14},
  rowCopy:{flex:1},
  rowTitle:{color:colors.ink,fontSize:14,fontWeight:"900"},
  rowDescription:{color:colors.slate,fontSize:12,lineHeight:17,marginTop:4},
  status:{backgroundColor:colors.lavender,borderRadius:radius.pill,paddingHorizontal:9,paddingVertical:6},
  statusEssential:{backgroundColor:colors.stone},
  statusText:{color:colors.primaryPurple,fontSize:8,fontWeight:"900",letterSpacing:.45},
  statusTextEssential:{color:colors.ink},
  infoCard:{backgroundColor:colors.lavender,borderRadius:radius.lg,marginTop:spacing.lg,padding:spacing.lg},
  infoEyebrow:{color:colors.primaryPurple,fontSize:9,fontWeight:"900",letterSpacing:1.1},
  infoTitle:{color:colors.ink,fontSize:18,fontWeight:"900",lineHeight:23,marginTop:6},
  infoBody:{color:colors.slate,fontSize:12,lineHeight:18,marginTop:6}
});