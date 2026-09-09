import { useRouter } from "expo-router";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

import { usePracticeProgress } from "@/progress/PracticeProgressContext";
import { colors, radius, spacing } from "@/theme/tokens";

type TopicState = "current" | "available" | "locked";
type Topic = { title:string; description:string; state:TopicState; meta:string };

const upcoming:Topic[] = [
  { title:"Expanding brackets", description:"Reverse factorisation and simplify expressions confidently.", state:"available", meta:"Next concept" },
  { title:"Algebraic fractions", description:"Use factors to simplify and reason about algebraic fractions.", state:"locked", meta:"Builds on Factorisation" },
  { title:"Quadratic expressions", description:"Recognise and factorise common quadratic forms.", state:"locked", meta:"Later in Algebra" },
];

export default function LearnScreen(){
  const router=useRouter();
  const{mastery,masterySource,adaptivePractice,misconception,syncing,syncError}=usePracticeProgress();
  const masteryLabel=mastery>=80?"Strong":mastery>=60?"Developing":mastery>0?"Building":"Not started";
  const nextAction=misconception?.status==="recurring"?"Review the common-factor step":mastery>=80?"Take a harder practice set":"Continue Factorisation";

  return <SafeAreaView style={styles.safeArea}><ScrollView contentContainerStyle={styles.screen} showsVerticalScrollIndicator={false}>
    <Text style={styles.eyebrow}>LEARN</Text>
    <Text style={styles.title}>Build it one idea at a time.</Text>
    <Text style={styles.description}>Your curriculum stays structured while Nomi adapts the depth, difficulty and next step around your evidence.</Text>

    <View style={styles.subjectHeader}>
      <View><Text style={styles.subjectEyebrow}>ACTIVE SUBJECT</Text><Text style={styles.subjectTitle}>Mathematics</Text></View>
      <View style={styles.subjectBadge}><Text style={styles.subjectBadgeText}>ALGEBRA</Text></View>
    </View>

    <View style={styles.currentCard}>
      <View style={styles.rowBetween}><View style={styles.currentTag}><Text style={styles.currentTagText}>CURRENT</Text></View><Text style={styles.mastery}>{mastery}/100</Text></View>
      <Text style={styles.topicTitle}>Factorisation</Text>
      <Text style={styles.topicDescription}>Extract common factors, recognise structure and rebuild expressions with confidence.</Text>
      <View style={styles.progressTrack}><View style={[styles.progressFill,{width:`${Math.max(2,mastery)}%`}]} /></View>
      <View style={styles.rowBetween}><Text style={styles.progressLabel}>{masteryLabel} mastery</Text><Text style={styles.progressMeta}>{adaptivePractice.difficulty}/10 difficulty</Text></View>

      <View style={styles.adaptiveBox}><Text style={styles.adaptiveEyebrow}>NOMI'S NEXT MOVE</Text><Text style={styles.adaptiveTitle}>{nextAction}</Text><Text style={styles.adaptiveText}>{adaptivePractice.message}</Text>{misconception?<Text style={styles.misconception}>{misconception.message}</Text>:null}</View>

      <View style={styles.actions}>
        <Pressable onPress={()=>router.push("/(tabs)/practice")} style={styles.primaryButton}><Text style={styles.primaryButtonText}>{mastery>0?"Continue practice":"Start topic"}</Text></Pressable>
        <Pressable onPress={()=>router.push("/(tabs)/nomi")} style={styles.secondaryButton}><Text style={styles.secondaryButtonText}>Ask Nomi</Text></Pressable>
      </View>
      <Text style={styles.evidenceNote}>{syncing?"Syncing learner evidence…":masterySource==="supabase"?"Progress is backed by assessed practice evidence.":masterySource==="new-learner"?"Complete assessed Practice to establish your mastery.":"Prototype learner state is active."}</Text>
      {syncError?<Text style={styles.errorText}>{syncError}</Text>:null}
    </View>

    <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Your path</Text><Text style={styles.sectionMeta}>ALGEBRA</Text></View>
    <View style={styles.path}>
      {upcoming.map((topic,index)=><View key={topic.title} style={[styles.pathCard,topic.state==="locked"&&styles.lockedCard]}>
        <View style={[styles.number,topic.state==="locked"&&styles.lockedNumber]}><Text style={[styles.numberText,topic.state==="locked"&&styles.lockedText]}>{index+2}</Text></View>
        <View style={styles.pathContent}><View style={styles.rowBetween}><Text style={[styles.pathTitle,topic.state==="locked"&&styles.lockedText]}>{topic.title}</Text><Text style={styles.pathMeta}>{topic.state==="locked"?"LOCKED":"NEXT"}</Text></View><Text style={[styles.pathDescription,topic.state==="locked"&&styles.lockedDescription]}>{topic.description}</Text><Text style={styles.requirement}>{topic.meta}</Text></View>
      </View>)}
    </View>

    <View style={styles.boundaryCard}><Text style={styles.boundaryTitle}>How Learn works</Text><Text style={styles.boundaryText}>Learn shows the curriculum and your next move. Practice supplies the assessed evidence. Nomi can explain and coach, but conversation alone never changes mastery.</Text></View>
  </ScrollView></SafeAreaView>;
}

const styles=StyleSheet.create({
  safeArea:{flex:1,backgroundColor:colors.cream},screen:{padding:spacing.lg,paddingTop:spacing.xl,paddingBottom:56},eyebrow:{color:colors.primaryPurple,fontSize:11,fontWeight:"900",letterSpacing:1.2},title:{color:colors.ink,fontSize:34,fontWeight:"800",letterSpacing:-1.2,lineHeight:39,marginTop:spacing.sm},description:{color:colors.slate,fontSize:15,lineHeight:22,marginTop:spacing.md},subjectHeader:{alignItems:"center",flexDirection:"row",justifyContent:"space-between",marginTop:spacing.xl},subjectEyebrow:{color:colors.slate,fontSize:9,fontWeight:"900",letterSpacing:1},subjectTitle:{color:colors.ink,fontSize:21,fontWeight:"800",marginTop:3},subjectBadge:{backgroundColor:colors.lavender,borderRadius:radius.pill,paddingHorizontal:12,paddingVertical:7},subjectBadgeText:{color:colors.primaryPurple,fontSize:10,fontWeight:"900",letterSpacing:.8},currentCard:{backgroundColor:colors.white,borderRadius:radius.lg,marginTop:spacing.md,padding:spacing.lg},rowBetween:{alignItems:"center",flexDirection:"row",justifyContent:"space-between"},currentTag:{backgroundColor:colors.primaryPurple,borderRadius:radius.pill,paddingHorizontal:10,paddingVertical:6},currentTagText:{color:colors.white,fontSize:9,fontWeight:"900",letterSpacing:.8},mastery:{color:colors.primaryPurple,fontSize:16,fontWeight:"900"},topicTitle:{color:colors.ink,fontSize:27,fontWeight:"800",letterSpacing:-.7,marginTop:spacing.md},topicDescription:{color:colors.slate,fontSize:14,lineHeight:21,marginTop:8},progressTrack:{backgroundColor:colors.stone,borderRadius:radius.pill,height:9,marginTop:spacing.lg,overflow:"hidden"},progressFill:{backgroundColor:colors.primaryPurple,borderRadius:radius.pill,height:"100%"},progressLabel:{color:colors.ink,fontSize:11,fontWeight:"800",marginTop:8},progressMeta:{color:colors.slate,fontSize:11,marginTop:8},adaptiveBox:{backgroundColor:colors.lavender,borderRadius:radius.md,marginTop:spacing.lg,padding:spacing.md},adaptiveEyebrow:{color:colors.primaryPurple,fontSize:9,fontWeight:"900",letterSpacing:1},adaptiveTitle:{color:colors.ink,fontSize:16,fontWeight:"800",marginTop:7},adaptiveText:{color:colors.slate,fontSize:12,lineHeight:18,marginTop:5},misconception:{color:colors.ink,fontSize:11,fontWeight:"700",lineHeight:17,marginTop:8},actions:{flexDirection:"row",gap:10,marginTop:spacing.lg},primaryButton:{alignItems:"center",backgroundColor:colors.primaryPurple,borderRadius:radius.pill,flex:1,paddingVertical:14},primaryButtonText:{color:colors.white,fontSize:13,fontWeight:"900"},secondaryButton:{alignItems:"center",borderColor:colors.primaryPurple,borderRadius:radius.pill,borderWidth:1,flex:1,paddingVertical:14},secondaryButtonText:{color:colors.primaryPurple,fontSize:13,fontWeight:"900"},evidenceNote:{color:colors.slate,fontSize:10,lineHeight:15,marginTop:12,textAlign:"center"},errorText:{color:colors.ink,fontSize:10,lineHeight:15,marginTop:6,textAlign:"center"},sectionHeader:{alignItems:"center",flexDirection:"row",justifyContent:"space-between",marginTop:spacing.xl},sectionTitle:{color:colors.ink,fontSize:20,fontWeight:"800"},sectionMeta:{color:colors.primaryPurple,fontSize:9,fontWeight:"900",letterSpacing:1},path:{gap:10,marginTop:spacing.md},pathCard:{alignItems:"flex-start",backgroundColor:colors.white,borderRadius:radius.lg,flexDirection:"row",gap:14,padding:spacing.md},lockedCard:{opacity:.62},number:{alignItems:"center",backgroundColor:colors.yellow,borderRadius:radius.pill,height:36,justifyContent:"center",width:36},lockedNumber:{backgroundColor:colors.stone},numberText:{color:colors.ink,fontSize:13,fontWeight:"900"},lockedText:{color:colors.slate},pathContent:{flex:1},pathTitle:{color:colors.ink,flex:1,fontSize:15,fontWeight:"800",paddingRight:8},pathMeta:{color:colors.primaryPurple,fontSize:8,fontWeight:"900",letterSpacing:.8},pathDescription:{color:colors.slate,fontSize:12,lineHeight:18,marginTop:5},lockedDescription:{color:colors.slate},requirement:{color:colors.slate,fontSize:10,fontWeight:"700",marginTop:8},boundaryCard:{borderColor:colors.stone,borderRadius:radius.lg,borderWidth:1,marginTop:spacing.xl,padding:spacing.lg},boundaryTitle:{color:colors.ink,fontSize:14,fontWeight:"800"},boundaryText:{color:colors.slate,fontSize:11,lineHeight:18,marginTop:6}
});