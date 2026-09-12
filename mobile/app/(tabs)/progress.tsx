import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useLearnerSession } from "@/auth/LearnerSessionContext";
import { usePracticeProgress } from "@/progress/PracticeProgressContext";
import { colors, radius, spacing } from "@/theme/tokens";

const lifecycle = ["Noticed", "Recurring", "Improving", "Resolved"] as const;

export default function ProgressScreen() {
  const { configured, loading, user, displayName, error, signIn, signOut } = useLearnerSession();
  const { latestSession, mastery, masterySource, misconception, activeTopicName, syncing, syncError } = usePracticeProgress();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const sourceLabel = syncing ? "Syncing learner data" : masterySource === "supabase" ? "Live learner data" : masterySource === "new-learner" ? "No practice recorded yet" : "Prototype state";
  const misconceptionStage = misconception?.status === "active" ? "Noticed" : misconception?.status === "recurring" ? "Recurring" : misconception?.status === "improving" ? "Improving" : "Resolved";
  const topicLabel = activeTopicName ?? latestSession?.topic ?? "Current topic";

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.screen} showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>PROGRESS</Text>
        <Text style={styles.title}>See what is actually changing.</Text>
        <Text style={styles.description}>Nomi turns practice into evidence, then uses that evidence to shape what happens next.</Text>

        {!user ? (
          <View style={styles.syncCard}>
            <Text style={styles.syncTitle}>Sync your learner progress</Text>
            <Text style={styles.syncBody}>{configured ? "Sign in with the same Nomi account you use on the web." : "Mobile Supabase environment variables are not configured yet."}</Text>
            {configured ? <><TextInput autoCapitalize="none" keyboardType="email-address" placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} /><TextInput placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} style={styles.input} />{error ? <Text style={styles.error}>{error}</Text> : null}<Pressable disabled={loading || !email || !password} onPress={() => void signIn(email.trim(), password)} style={[styles.syncButton, (loading || !email || !password) && styles.disabled]}><Text style={styles.syncButtonText}>{loading ? "Signing in..." : "Sign in & sync"}</Text></Pressable></> : null}
          </View>
        ) : (
          <View style={styles.accountRow}><View><Text style={styles.accountLabel}>SYNCED LEARNER</Text><Text style={styles.accountName}>{displayName ?? user.email ?? "Nomi learner"}</Text></View><Pressable onPress={() => void signOut()}><Text style={styles.signOut}>Sign out</Text></Pressable></View>
        )}

        <View style={styles.masteryCard}><View><Text style={styles.metricLabel}>{topicLabel} mastery</Text><Text style={styles.masteryValue}>{syncing ? "…" : mastery}</Text></View><View style={styles.masteryMeta}><Text style={styles.masteryScale}>/ 100</Text><Text style={styles.source}>{sourceLabel}</Text></View></View>

        {misconception ? (
          <View style={styles.insightCard}>
            <Text style={styles.insightEyebrow}>WHAT NOMI HAS NOTICED</Text>
            <View style={styles.insightHeader}><View style={styles.insightCopy}><Text style={styles.insightTitle}>{topicLabel} learning pattern</Text><Text style={styles.insightBody}>{misconception.message}</Text></View><View style={styles.stateBadge}><Text style={styles.stateBadgeText}>{misconceptionStage}</Text></View></View>
            <Text style={styles.evidenceText}>{misconception.occurrenceCount} misconception {misconception.occurrenceCount === 1 ? "signal" : "signals"} recorded</Text>
            <View style={styles.lifecycleRow}>{lifecycle.map((stage, index) => <View key={stage} style={styles.lifecycleItem}><View style={[styles.lifecycleDot, stage === misconceptionStage && styles.lifecycleDotActive]}><Text style={[styles.lifecycleNumber, stage === misconceptionStage && styles.lifecycleNumberActive]}>{index + 1}</Text></View><Text style={[styles.lifecycleLabel, stage === misconceptionStage && styles.lifecycleLabelActive]}>{stage}</Text></View>)}</View>
          </View>
        ) : user && masterySource === "supabase" ? (
          <View style={styles.clearCard}><Text style={styles.insightEyebrow}>WHAT NOMI HAS NOTICED</Text><Text style={styles.clearTitle}>No active misconception right now.</Text><Text style={styles.insightBody}>Nomi will surface a learning pattern here when repeated practice evidence is strong enough.</Text></View>
        ) : null}

        {syncError ? <View style={styles.noticeCard}><Text style={styles.noticeTitle}>Progress sync needs attention</Text><Text style={styles.noticeBody}>{syncError}</Text></View> : null}

        {latestSession ? <View style={styles.card}><View style={styles.cardHeader}><View><Text style={styles.subject}>{latestSession.subject}</Text><Text style={styles.topic}>{latestSession.topic}</Text></View><View style={styles.accuracyBadge}><Text style={styles.accuracyValue}>{latestSession.accuracy}%</Text><Text style={styles.accuracyLabel}>accuracy</Text></View></View><View style={styles.divider} /><View style={styles.metricRow}><View><Text style={styles.metricLabel}>Latest practice</Text><Text style={styles.metricValue}>{latestSession.score} / {latestSession.total} correct</Text></View><Text style={styles.status}>{latestSession.masteryChange >= 0 ? `Mastery +${latestSession.masteryChange}` : `Mastery ${latestSession.masteryChange}`}</Text></View></View> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea:{flex:1,backgroundColor:colors.cream},screen:{padding:spacing.lg,paddingTop:spacing.lg,paddingBottom:48},eyebrow:{color:colors.primaryPurple,fontSize:11,fontWeight:"900",letterSpacing:1.2},title:{color:colors.ink,fontSize:34,fontWeight:"800",letterSpacing:-1.1,lineHeight:39,marginTop:spacing.sm},description:{color:colors.slate,fontSize:15,lineHeight:22,marginTop:spacing.md},syncCard:{backgroundColor:colors.white,borderRadius:radius.lg,marginTop:spacing.xl,padding:spacing.lg},syncTitle:{color:colors.ink,fontSize:18,fontWeight:"800"},syncBody:{color:colors.slate,fontSize:14,lineHeight:20,marginTop:spacing.sm},input:{backgroundColor:colors.cream,borderColor:colors.stone,borderRadius:radius.md,borderWidth:1,color:colors.ink,marginTop:spacing.md,paddingHorizontal:14,paddingVertical:13},error:{color:colors.ink,fontSize:12,marginTop:spacing.sm},syncButton:{alignItems:"center",backgroundColor:colors.primaryPurple,borderRadius:radius.pill,marginTop:spacing.md,paddingVertical:14},disabled:{opacity:.4},syncButtonText:{color:colors.white,fontSize:15,fontWeight:"800"},accountRow:{alignItems:"center",backgroundColor:colors.white,borderRadius:radius.lg,flexDirection:"row",justifyContent:"space-between",marginTop:spacing.xl,padding:spacing.lg},accountLabel:{color:colors.primaryPurple,fontSize:10,fontWeight:"900",letterSpacing:1},accountName:{color:colors.ink,fontSize:17,fontWeight:"800",marginTop:3},signOut:{color:colors.primaryPurple,fontSize:13,fontWeight:"800"},masteryCard:{alignItems:"flex-end",backgroundColor:colors.lavender,borderRadius:radius.lg,flexDirection:"row",justifyContent:"space-between",marginTop:spacing.md,padding:spacing.lg},masteryValue:{color:colors.primaryPurple,fontSize:48,fontWeight:"900",letterSpacing:-1.5,marginTop:4},masteryMeta:{alignItems:"flex-end",paddingBottom:4},masteryScale:{color:colors.slate,fontSize:16,fontWeight:"700"},source:{color:colors.primaryPurple,fontSize:10,fontWeight:"800",marginTop:4},insightCard:{backgroundColor:colors.white,borderRadius:radius.lg,marginTop:spacing.md,padding:spacing.lg},insightEyebrow:{color:colors.primaryPurple,fontSize:10,fontWeight:"900",letterSpacing:1.1},insightHeader:{alignItems:"flex-start",flexDirection:"row",gap:12,justifyContent:"space-between",marginTop:12},insightCopy:{flex:1},insightTitle:{color:colors.ink,fontSize:20,fontWeight:"800"},insightBody:{color:colors.slate,fontSize:13,lineHeight:19,marginTop:6},stateBadge:{backgroundColor:colors.lavender,borderRadius:radius.pill,paddingHorizontal:11,paddingVertical:7},stateBadgeText:{color:colors.primaryPurple,fontSize:10,fontWeight:"900"},evidenceText:{color:colors.slate,fontSize:11,fontWeight:"700",marginTop:16},lifecycleRow:{flexDirection:"row",justifyContent:"space-between",marginTop:18},lifecycleItem:{alignItems:"center",flex:1},lifecycleDot:{alignItems:"center",backgroundColor:colors.cream,borderColor:colors.stone,borderRadius:18,borderWidth:1,height:30,justifyContent:"center",width:30},lifecycleDotActive:{backgroundColor:colors.primaryPurple,borderColor:colors.primaryPurple},lifecycleNumber:{color:colors.slate,fontSize:11,fontWeight:"800"},lifecycleNumberActive:{color:colors.white},lifecycleLabel:{color:colors.slate,fontSize:9,fontWeight:"700",marginTop:6},lifecycleLabelActive:{color:colors.primaryPurple,fontWeight:"900"},clearCard:{backgroundColor:colors.white,borderRadius:radius.lg,marginTop:spacing.md,padding:spacing.lg},clearTitle:{color:colors.ink,fontSize:18,fontWeight:"800",marginTop:10},noticeCard:{backgroundColor:colors.white,borderRadius:radius.lg,marginTop:spacing.md,padding:spacing.lg},noticeTitle:{color:colors.ink,fontSize:14,fontWeight:"800"},noticeBody:{color:colors.slate,fontSize:13,lineHeight:19,marginTop:spacing.xs},card:{backgroundColor:colors.white,borderRadius:radius.lg,marginTop:spacing.md,padding:spacing.lg},cardHeader:{alignItems:"center",flexDirection:"row",justifyContent:"space-between"},subject:{color:colors.primaryPurple,fontSize:12,fontWeight:"800"},topic:{color:colors.ink,fontSize:24,fontWeight:"800",marginTop:4},accuracyBadge:{alignItems:"center",backgroundColor:colors.lavender,borderRadius:radius.md,minWidth:82,paddingHorizontal:12,paddingVertical:10},accuracyValue:{color:colors.primaryPurple,fontSize:20,fontWeight:"900"},accuracyLabel:{color:colors.slate,fontSize:10,fontWeight:"700",marginTop:2},divider:{backgroundColor:colors.stone,height:1,marginVertical:spacing.lg},metricRow:{alignItems:"flex-end",flexDirection:"row",justifyContent:"space-between"},metricLabel:{color:colors.slate,fontSize:12,fontWeight:"700"},metricValue:{color:colors.ink,fontSize:18,fontWeight:"800",marginTop:4},status:{color:colors.primaryPurple,fontSize:12,fontWeight:"800"}
});
