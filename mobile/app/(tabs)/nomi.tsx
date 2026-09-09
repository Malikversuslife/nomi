import { useRouter } from "expo-router";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

import { useLearnerSession } from "@/auth/LearnerSessionContext";
import { usePracticeProgress } from "@/progress/PracticeProgressContext";
import { colors, radius, spacing } from "@/theme/tokens";

function stateCopy(misconception: ReturnType<typeof usePracticeProgress>["misconception"], mastery: number) {
  if (misconception?.status === "recurring") return {
    eyebrow: "I KNOW WHERE TO START",
    title: "Let's slow down the common-factor step.",
    body: "I've seen this pattern more than once. I'll use a worked example first, then give you a gentler question to try yourself.",
    action: "Work through it with Nomi",
  };
  if (misconception?.status === "improving") return {
    eyebrow: "YOU'RE RECOVERING",
    title: "That common-factor step is getting clearer.",
    body: "Your recent evidence is improving. Let's check the idea once more without over-practising it.",
    action: "Check my understanding",
  };
  if (misconception?.status === "resolved") return {
    eyebrow: "PATTERN RESOLVED",
    title: "You've recovered this part of Factorisation.",
    body: "Recent practice shows the common-factor misunderstanding has cleared. We can move forward instead of drilling the same thing again.",
    action: "Try the next challenge",
  };
  if (misconception) return {
    eyebrow: "I NOTICED SOMETHING",
    title: "Let's check your common-factor thinking.",
    body: "One practice signal suggests this step may need attention. I won't assume it's a pattern yet, so we'll check it together.",
    action: "Explain it to me",
  };
  if (mastery >= 70) return {
    eyebrow: "READY FOR MORE",
    title: "Your Factorisation evidence is strong.",
    body: "I don't see an active misconception right now. We can increase the challenge or unpack a harder example together.",
    action: "Give me a harder example",
  };
  return {
    eyebrow: "LET'S BUILD FROM HERE",
    title: "I can use your practice evidence now.",
    body: "We'll focus on what your answers show, not just repeat the lesson. Practice a little more and I'll adjust the support as your learner model changes.",
    action: "Practice with Nomi",
  };
}

export default function NomiScreen() {
  const router = useRouter();
  const { user, displayName } = useLearnerSession();
  const { mastery, masterySource, misconception, adaptivePractice, latestSession, syncing } = usePracticeProgress();
  const guidance = stateCopy(misconception, mastery);
  const firstName = displayName?.split(" ")[0] ?? "there";

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.screen} showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>NOMI</Text>
        <Text style={styles.title}>{user ? `I’m with you, ${firstName}.` : "Let's figure it out together."}</Text>
        <Text style={styles.description}>I use what happens in Practice to decide what kind of help makes sense next.</Text>

        <View style={styles.contextCard}>
          <Text style={styles.cardEyebrow}>{guidance.eyebrow}</Text>
          <Text style={styles.contextTitle}>{guidance.title}</Text>
          <Text style={styles.contextBody}>{guidance.body}</Text>
          <Pressable onPress={() => router.push("/(tabs)/practice")} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>{guidance.action}</Text>
          </Pressable>
        </View>

        <View style={styles.evidenceRow}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>FACTORISATION</Text>
            <Text style={styles.metricValue}>{syncing ? "…" : mastery}</Text>
            <Text style={styles.metricMeta}>mastery / 100</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>NEXT MODE</Text>
            <Text style={styles.modeValue}>{adaptivePractice.intervention.replaceAll("_", " ")}</Text>
            <Text style={styles.metricMeta}>difficulty {adaptivePractice.difficulty}</Text>
          </View>
        </View>

        <View style={styles.whyCard}>
          <Text style={styles.cardEyebrow}>WHY NOMI IS SUGGESTING THIS</Text>
          <Text style={styles.whyText}>{adaptivePractice.message}</Text>
          {latestSession ? <Text style={styles.evidenceNote}>Latest evidence: {latestSession.score}/{latestSession.total} correct · {latestSession.accuracy}% accuracy</Text> : <Text style={styles.evidenceNote}>{masterySource === "new-learner" ? "No synced practice evidence yet." : "Keep practising and I’ll build a clearer learner picture."}</Text>}
        </View>

        <View style={styles.promptCard}>
          <Text style={styles.cardEyebrow}>YOU CAN ALSO ASK NOMI TO</Text>
          <View style={styles.prompt}><Text style={styles.promptText}>Explain Factorisation another way</Text></View>
          <View style={styles.prompt}><Text style={styles.promptText}>Show me a worked example</Text></View>
          <View style={styles.prompt}><Text style={styles.promptText}>Quiz me on the step I keep missing</Text></View>
          <Text style={styles.comingSoon}>Conversational tutoring is the next layer. These actions will inherit the learner context above.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea:{flex:1,backgroundColor:colors.cream},
  screen:{padding:spacing.lg,paddingTop:spacing.xl,paddingBottom:48},
  eyebrow:{color:colors.primaryPurple,fontSize:11,fontWeight:"900",letterSpacing:1.2},
  title:{color:colors.ink,fontSize:34,fontWeight:"800",letterSpacing:-1.1,lineHeight:39,marginTop:spacing.sm},
  description:{color:colors.slate,fontSize:15,lineHeight:22,marginTop:spacing.md},
  contextCard:{backgroundColor:colors.white,borderRadius:radius.lg,marginTop:spacing.xl,padding:spacing.lg},
  cardEyebrow:{color:colors.primaryPurple,fontSize:10,fontWeight:"900",letterSpacing:1.1},
  contextTitle:{color:colors.ink,fontSize:24,fontWeight:"800",letterSpacing:-.4,lineHeight:29,marginTop:12},
  contextBody:{color:colors.slate,fontSize:14,lineHeight:21,marginTop:spacing.sm},
  primaryButton:{alignItems:"center",backgroundColor:colors.primaryPurple,borderRadius:radius.pill,marginTop:spacing.lg,paddingVertical:15},
  primaryButtonText:{color:colors.white,fontSize:15,fontWeight:"800"},
  evidenceRow:{flexDirection:"row",gap:spacing.md,marginTop:spacing.md},
  metricCard:{backgroundColor:colors.lavender,borderRadius:radius.lg,flex:1,minHeight:140,padding:spacing.md},
  metricLabel:{color:colors.primaryPurple,fontSize:9,fontWeight:"900",letterSpacing:.8},
  metricValue:{color:colors.primaryPurple,fontSize:42,fontWeight:"900",letterSpacing:-1.2,marginTop:12},
  modeValue:{color:colors.ink,fontSize:18,fontWeight:"800",lineHeight:22,marginTop:12,textTransform:"capitalize"},
  metricMeta:{color:colors.slate,fontSize:11,fontWeight:"700",marginTop:4},
  whyCard:{backgroundColor:colors.white,borderRadius:radius.lg,marginTop:spacing.md,padding:spacing.lg},
  whyText:{color:colors.ink,fontSize:16,fontWeight:"700",lineHeight:23,marginTop:12},
  evidenceNote:{color:colors.slate,fontSize:12,lineHeight:18,marginTop:spacing.md},
  promptCard:{backgroundColor:colors.white,borderRadius:radius.lg,marginTop:spacing.md,padding:spacing.lg},
  prompt:{backgroundColor:colors.cream,borderColor:colors.stone,borderRadius:radius.md,borderWidth:1,marginTop:spacing.sm,paddingHorizontal:14,paddingVertical:13},
  promptText:{color:colors.ink,fontSize:14,fontWeight:"700"},
  comingSoon:{color:colors.slate,fontSize:11,lineHeight:17,marginTop:spacing.md},
});