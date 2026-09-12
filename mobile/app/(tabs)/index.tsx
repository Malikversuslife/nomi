import { useRouter } from "expo-router";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useLearnerSession } from "@/auth/LearnerSessionContext";
import { useCurriculum } from "@/learn/useCurriculum";
import { colors, radius, spacing } from "@/theme/tokens";

const mascotUri = "https://raw.githubusercontent.com/Malikversuslife/nomi/main/public/brand/nomi/mascot/encouraging.png";

function BellIcon() {
  return <View style={styles.bell}><View style={styles.bellBody}/><View style={styles.bellClapper}/></View>;
}

export default function HomeScreen() {
  const router = useRouter();
  const { user, displayName } = useLearnerSession();
  const { subject, topics, currentTopic, parentName, isPathComplete, loading, error } = useCurriculum("mathematics");
  const completedCount = topics.filter((topic) => topic.state === "completed").length;
  const totalCount = topics.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const profileInitial = (displayName ?? user?.email ?? "N").charAt(0).toUpperCase();

  const title = isPathComplete ? "You finished this path." : "Ready to keep going?";
  const subtitle = isPathComplete ? "Quadratic equations are mastered. Nomi can help you decide what comes next." : "A little progress today still counts.";
  const lessonTitle = isPathComplete ? "Quadratic equations" : currentTopic?.name ?? "Your next topic";
  const lessonMeta = isPathComplete ? `${completedCount}/${totalCount} topics mastered` : `${parentName ?? "Mathematics"} · ${currentTopic?.difficulty ?? 1}/10 difficulty`;
  const mastery = isPathComplete ? 100 : currentTopic?.mastery ?? 0;

  function handlePrimaryAction() {
    if (isPathComplete) { router.push("/(tabs)/learn"); return; }
    if (currentTopic && subject) {
      router.push({ pathname: "/(tabs)/practice", params: { topicId: currentTopic.id, topicSlug: currentTopic.slug, topicName: currentTopic.name, subjectId: subject.id, subjectName: subject.name } });
      return;
    }
    router.push("/(tabs)/learn");
  }

  return <SafeAreaView edges={["top"]} style={styles.safeArea}><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <View style={styles.topBar}><Text style={styles.wordmark}>nomi</Text><View style={styles.headerActions}><Pressable accessibilityRole="button" accessibilityLabel="Open notifications" onPress={()=>router.push("/notifications")} style={styles.headerButton}><BellIcon/></Pressable><Pressable accessibilityRole="button" accessibilityLabel="Open profile" onPress={()=>router.push("/profile")} style={styles.profile}><Text style={styles.profileText}>{profileInitial}</Text></Pressable></View></View>

    <View style={styles.hero}><View style={styles.heroCopy}><Text style={styles.kicker}>{isPathComplete ? "PATH COMPLETE" : "KEEP LEARNING"}</Text><Text style={styles.title}>{title}</Text><Text style={styles.subtitle}>{subtitle}</Text></View><Image source={{ uri: mascotUri }} style={styles.mascot} resizeMode="contain" /></View>

    <Text style={styles.sectionLabel}>{isPathComplete ? "LEARNING STATUS" : "CONTINUE LEARNING"}</Text>
    <View style={styles.lessonCard}><View style={styles.subjectPill}><Text style={styles.subjectPillText}>{subject?.name ?? "Mathematics"}</Text></View><Text style={styles.lessonTitle}>{loading ? "Loading your learner state…" : lessonTitle}</Text><Text style={styles.lessonMeta}>{error ? error : lessonMeta}</Text><View style={styles.progressTrack}><View style={[styles.progressFill,{width:`${Math.max(2,mastery)}%`}]} /></View><View style={styles.progressRow}><Text style={styles.progressCopy}>{isPathComplete ? "Path mastery" : "Assessed mastery"}</Text><Text style={styles.progressValue}>{mastery}%</Text></View><Pressable style={styles.primaryButton} accessibilityRole="button" accessibilityLabel={isPathComplete ? "Review completed learning path" : `Continue ${lessonTitle}`} onPress={handlePrimaryAction}><Text style={styles.primaryButtonText}>{isPathComplete ? "Review completed path" : "Continue learning"}</Text></Pressable></View>

    <View style={styles.insightCard}><View style={styles.insightDot}/><View style={styles.insightCopy}><Text style={styles.insightEyebrow}>NOMI NOTICED</Text><Text style={styles.insightTitle}>{isPathComplete ? "Your assessed evidence is strong across this unit." : `${lessonTitle} is your active learning step.`}</Text><Text style={styles.insightBody}>{isPathComplete ? "You can review weak evidence, mix practice across concepts, or move forward when the next unit is ready." : `Your current mastery is ${mastery}/100. Nomi will keep adapting difficulty around your assessed practice.`}</Text></View></View>

    <View style={styles.weekHeader}><Text style={styles.sectionLabel}>PATH PROGRESS</Text><Text style={styles.weekCount}>{completedCount}/{totalCount || 0} topics</Text></View><View style={styles.weekRow}>{topics.slice(0,7).map((topic)=><View key={topic.id} style={styles.dayItem}><View style={[styles.dayDot,topic.state==="completed"&&styles.dayDotActive]}/><Text numberOfLines={1} style={styles.dayText}>{topic.name.charAt(0)}</Text></View>)}</View>{totalCount>0?<Text style={styles.pathSummary}>{progressPercent}% of this path completed</Text>:null}
  </ScrollView></SafeAreaView>;
}

const styles=StyleSheet.create({safeArea:{flex:1,backgroundColor:colors.cream},content:{paddingHorizontal:spacing.lg,paddingTop:spacing.md,paddingBottom:spacing.xxl},topBar:{alignItems:"center",flexDirection:"row",justifyContent:"space-between"},wordmark:{color:colors.primaryPurple,fontSize:30,fontWeight:"900",letterSpacing:-1.5},headerActions:{alignItems:"center",flexDirection:"row",gap:8},headerButton:{alignItems:"center",backgroundColor:colors.white,borderRadius:radius.pill,height:40,justifyContent:"center",width:40},bell:{alignItems:"center",height:19,justifyContent:"flex-end",width:18},bellBody:{borderColor:colors.primaryPurple,borderRadius:9,borderWidth:2,height:14,width:14},bellClapper:{backgroundColor:colors.primaryPurple,borderRadius:2,height:3,marginTop:1,width:4},profile:{alignItems:"center",backgroundColor:colors.lavender,borderRadius:radius.pill,height:40,justifyContent:"center",width:40},profileText:{color:colors.primaryPurple,fontSize:15,fontWeight:"800"},hero:{alignItems:"center",flexDirection:"row",justifyContent:"space-between",marginTop:spacing.xl,minHeight:142},heroCopy:{flex:1,paddingRight:spacing.sm},kicker:{color:colors.primaryPurple,fontSize:12,fontWeight:"800",letterSpacing:1.4},title:{color:colors.ink,fontSize:34,fontWeight:"800",letterSpacing:-1.2,lineHeight:38,marginTop:6},subtitle:{color:colors.slate,fontSize:15,lineHeight:22,marginTop:spacing.sm},mascot:{height:118,width:118},sectionLabel:{color:colors.slate,fontSize:12,fontWeight:"800",letterSpacing:1.25,marginTop:spacing.xl},lessonCard:{backgroundColor:colors.white,borderRadius:radius.lg,marginTop:spacing.sm,padding:spacing.lg},subjectPill:{alignSelf:"flex-start",backgroundColor:colors.lavender,borderRadius:radius.pill,paddingHorizontal:12,paddingVertical:7},subjectPillText:{color:colors.primaryPurple,fontSize:12,fontWeight:"800"},lessonTitle:{color:colors.ink,fontSize:28,fontWeight:"800",letterSpacing:-.8,marginTop:spacing.md},lessonMeta:{color:colors.slate,fontSize:14,marginTop:5},progressTrack:{backgroundColor:colors.stone,borderRadius:radius.pill,height:8,marginTop:spacing.lg,overflow:"hidden"},progressFill:{backgroundColor:colors.primaryPurple,borderRadius:radius.pill,height:8},progressRow:{flexDirection:"row",justifyContent:"space-between",marginTop:spacing.sm},progressCopy:{color:colors.slate,fontSize:13},progressValue:{color:colors.ink,fontSize:13,fontWeight:"800"},primaryButton:{alignItems:"center",backgroundColor:colors.primaryPurple,borderRadius:radius.pill,marginTop:spacing.lg,paddingVertical:16},primaryButtonText:{color:colors.white,fontSize:16,fontWeight:"800"},insightCard:{backgroundColor:colors.lavender,borderRadius:radius.lg,flexDirection:"row",marginTop:spacing.md,padding:spacing.lg},insightDot:{backgroundColor:colors.mint,borderRadius:radius.pill,height:12,marginRight:12,marginTop:3,width:12},insightCopy:{flex:1},insightEyebrow:{color:colors.primaryPurple,fontSize:11,fontWeight:"900",letterSpacing:1.2},insightTitle:{color:colors.ink,fontSize:17,fontWeight:"800",lineHeight:23,marginTop:6},insightBody:{color:colors.slate,fontSize:14,lineHeight:20,marginTop:5},weekHeader:{alignItems:"flex-end",flexDirection:"row",justifyContent:"space-between"},weekCount:{color:colors.primaryPurple,fontSize:13,fontWeight:"800"},weekRow:{flexDirection:"row",justifyContent:"space-between",marginTop:spacing.md},dayItem:{alignItems:"center",gap:7,maxWidth:42},dayDot:{backgroundColor:colors.stone,borderRadius:radius.pill,height:30,width:30},dayDotActive:{backgroundColor:colors.mint},dayText:{color:colors.slate,fontSize:11,fontWeight:"700"},pathSummary:{color:colors.slate,fontSize:12,marginTop:spacing.sm}});