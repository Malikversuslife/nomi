import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useLearnerSession } from "@/auth/LearnerSessionContext";
import { AppIcon } from "@/components/AppIcon";
import { NomiMascot, NomiWordmark } from "@/components/NomiBrand";
import { useCurriculum } from "@/learn/useCurriculum";
import { colors, radius, spacing } from "@/theme/tokens";

export default function HomeScreen() {
  const router = useRouter();
  const { user, displayName } = useLearnerSession();
  const { subject, topics, currentTopic, parentName, isPathComplete, loading, error } = useCurriculum("mathematics");
  const completedCount = topics.filter((topic) => topic.state === "completed").length;
  const totalCount = topics.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const profileInitial = (displayName ?? user?.email ?? "N").charAt(0).toUpperCase();
  const lessonTitle = isPathComplete ? "Quadratic equations" : currentTopic?.name ?? "Your next topic";
  const mastery = isPathComplete ? 100 : currentTopic?.mastery ?? 0;

  function handlePrimaryAction() {
    if (isPathComplete) return router.push("/(tabs)/learn");
    if (currentTopic && subject) return router.push({ pathname: "/(tabs)/practice", params: { topicId: currentTopic.id, topicSlug: currentTopic.slug, topicName: currentTopic.name, subjectId: subject.id, subjectName: subject.name } });
    router.push("/(tabs)/learn");
  }

  return <SafeAreaView edges={["top"]} style={styles.safeArea}><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <View style={styles.topBar}><NomiWordmark width={92}/><View style={styles.headerActions}><Pressable onPress={()=>router.push("/notifications")} style={styles.iconButton}><AppIcon name="notification" color={colors.ink} size={21}/></Pressable><Pressable onPress={()=>router.push("/profile")} style={styles.profile}><Text style={styles.profileText}>{profileInitial}</Text></Pressable></View></View>

    <View style={styles.heroCard}>
      <View style={styles.heroCopy}><Text style={styles.kicker}>{isPathComplete?"PATH COMPLETE":"TODAY WITH NOMI"}</Text><Text style={styles.heroTitle}>{isPathComplete?"Nice work. What should we learn next?":"Ready for your next small win?"}</Text><Text style={styles.heroBody}>{isPathComplete?"Your quadratic equations path is complete. Review, mix practice, or move forward when the next unit is ready.":"Nomi is using your assessed practice to choose what deserves your attention next."}</Text></View>
      <NomiMascot state={isPathComplete?"celebrating":"encouraging"} size={132} style={styles.heroMascot}/>
    </View>

    <View style={styles.sectionHeading}><Text style={styles.sectionLabel}>{isPathComplete?"MASTERED PATH":"NEXT UP"}</Text><Text style={styles.sectionMeta}>{subject?.name??"Mathematics"}</Text></View>

    <View style={styles.lessonCard}>
      <View style={styles.lessonTop}><View style={styles.lessonTitleWrap}><Text style={styles.lessonEyebrow}>{(parentName??"ALGEBRA").toUpperCase()}</Text><Text style={styles.lessonTitle}>{loading?"Loading your learner state…":lessonTitle}</Text><Text style={styles.lessonMeta}>{error?error:isPathComplete?`${completedCount}/${totalCount} topics mastered`:`${mastery}/100 mastery · ${currentTopic?.difficulty??1}/10 difficulty`}</Text></View><View style={styles.masteryBubble}><Text style={styles.masteryValue}>{mastery}%</Text><Text style={styles.masteryLabel}>mastery</Text></View></View>
      <View style={styles.progressTrack}><View style={[styles.progressFill,{width:`${Math.max(2,mastery)}%`}]} /></View>
      <Pressable style={styles.primaryButton} onPress={handlePrimaryAction}><Text style={styles.primaryButtonText}>{isPathComplete?"Review completed path":"Continue learning"}</Text></Pressable>
    </View>

    <View style={styles.nomiInsight}><NomiMascot state={isPathComplete?"reinforcing":"curious"} size={76}/><View style={styles.insightCopy}><Text style={styles.insightEyebrow}>NOMI NOTICED</Text><Text style={styles.insightTitle}>{isPathComplete?"Your evidence is strong across this unit.":`${lessonTitle} is the clearest next move.`}</Text><Text style={styles.insightBody}>{isPathComplete?"You can now revisit weak evidence or mix concepts for retention.":"The next practice set will adapt around your recent accuracy and mistakes."}</Text></View></View>

    <View style={styles.pathCard}><View style={styles.sectionHeading}><Text style={styles.sectionLabel}>PATH PROGRESS</Text><Text style={styles.sectionMeta}>{completedCount}/{totalCount||0} topics</Text></View><View style={styles.topicRow}>{topics.slice(0,7).map((topic)=><View key={topic.id} style={styles.topicItem}><View style={[styles.topicDot,topic.state==="completed"&&styles.topicDotDone]}><Text style={styles.topicInitial}>{topic.name.charAt(0)}</Text></View></View>)}</View><Text style={styles.pathSummary}>{progressPercent}% of this path completed</Text></View>
  </ScrollView></SafeAreaView>;
}

const styles=StyleSheet.create({safeArea:{flex:1,backgroundColor:colors.cream},content:{paddingHorizontal:spacing.lg,paddingTop:spacing.sm,paddingBottom:spacing.xxl},topBar:{alignItems:"center",flexDirection:"row",justifyContent:"space-between",minHeight:48},headerActions:{alignItems:"center",flexDirection:"row",gap:8},iconButton:{alignItems:"center",backgroundColor:colors.white,borderRadius:radius.pill,height:42,justifyContent:"center",width:42},profile:{alignItems:"center",backgroundColor:colors.lavender,borderRadius:radius.pill,height:42,justifyContent:"center",width:42},profileText:{color:colors.primaryPurple,fontSize:15,fontWeight:"900"},heroCard:{backgroundColor:colors.lavender,borderRadius:30,marginTop:spacing.lg,minHeight:236,overflow:"hidden",padding:spacing.lg,position:"relative"},heroCopy:{maxWidth:"68%",zIndex:2},kicker:{color:colors.primaryPurple,fontSize:10,fontWeight:"900",letterSpacing:1.3},heroTitle:{color:colors.ink,fontSize:32,fontWeight:"900",letterSpacing:-1.1,lineHeight:35,marginTop:8},heroBody:{color:colors.slate,fontSize:13,lineHeight:19,marginTop:12},heroMascot:{bottom:-2,position:"absolute",right:-4},sectionHeading:{alignItems:"center",flexDirection:"row",justifyContent:"space-between",marginTop:spacing.xl},sectionLabel:{color:colors.slate,fontSize:10,fontWeight:"900",letterSpacing:1.2},sectionMeta:{color:colors.primaryPurple,fontSize:11,fontWeight:"900"},lessonCard:{backgroundColor:colors.white,borderRadius:28,marginTop:spacing.sm,padding:spacing.lg},lessonTop:{alignItems:"flex-start",flexDirection:"row",justifyContent:"space-between",gap:12},lessonTitleWrap:{flex:1},lessonEyebrow:{color:colors.primaryPurple,fontSize:9,fontWeight:"900",letterSpacing:1.1},lessonTitle:{color:colors.ink,fontSize:26,fontWeight:"900",letterSpacing:-.7,lineHeight:30,marginTop:5},lessonMeta:{color:colors.slate,fontSize:12,lineHeight:18,marginTop:5},masteryBubble:{alignItems:"center",backgroundColor:colors.warmSurface??colors.lavender,borderRadius:22,height:72,justifyContent:"center",width:72},masteryValue:{color:colors.ink,fontSize:18,fontWeight:"900"},masteryLabel:{color:colors.slate,fontSize:9,marginTop:1},progressTrack:{backgroundColor:colors.stone,borderRadius:radius.pill,height:8,marginTop:spacing.lg,overflow:"hidden"},progressFill:{backgroundColor:colors.primaryPurple,borderRadius:radius.pill,height:8},primaryButton:{alignItems:"center",backgroundColor:colors.primaryPurple,borderRadius:radius.pill,marginTop:spacing.lg,paddingVertical:16},primaryButtonText:{color:colors.white,fontSize:15,fontWeight:"900"},nomiInsight:{alignItems:"center",backgroundColor:colors.white,borderRadius:28,flexDirection:"row",gap:12,marginTop:spacing.md,padding:spacing.md},insightCopy:{flex:1},insightEyebrow:{color:colors.primaryPurple,fontSize:9,fontWeight:"900",letterSpacing:1.1},insightTitle:{color:colors.ink,fontSize:16,fontWeight:"900",lineHeight:21,marginTop:4},insightBody:{color:colors.slate,fontSize:12,lineHeight:18,marginTop:4},pathCard:{marginTop:spacing.sm},topicRow:{flexDirection:"row",justifyContent:"space-between",marginTop:spacing.md},topicItem:{alignItems:"center"},topicDot:{alignItems:"center",backgroundColor:colors.stone,borderRadius:radius.pill,height:34,justifyContent:"center",width:34},topicDotDone:{backgroundColor:colors.mint},topicInitial:{color:colors.ink,fontSize:10,fontWeight:"900"},pathSummary:{color:colors.slate,fontSize:11,marginTop:spacing.sm}});