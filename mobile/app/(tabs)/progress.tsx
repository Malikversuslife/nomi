import { useState } from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from "react-native";

import { useLearnerSession } from "@/auth/LearnerSessionContext";
import { usePracticeProgress } from "@/progress/PracticeProgressContext";
import { colors, radius, spacing } from "@/theme/tokens";

export default function ProgressScreen() {
  const { configured, loading, user, displayName, error, signIn, signOut } = useLearnerSession();
  const { latestSession, mastery, masterySource, syncing, syncError } = usePracticeProgress();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const sourceLabel = syncing
    ? "Syncing learner data"
    : masterySource === "supabase"
      ? "Live learner data"
      : masterySource === "new-learner"
        ? "No practice recorded yet"
        : "Prototype state";

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <Text style={styles.eyebrow}>PROGRESS</Text>
        <Text style={styles.title}>See what is actually changing.</Text>
        <Text style={styles.description}>Nomi turns practice into evidence, then uses that evidence to shape what happens next.</Text>

        {!user ? (
          <View style={styles.syncCard}>
            <Text style={styles.syncTitle}>Sync your learner progress</Text>
            <Text style={styles.syncBody}>
              {configured ? "Sign in with the same Nomi account you use on the web." : "Mobile Supabase environment variables are not configured yet."}
            </Text>
            {configured ? (
              <>
                <TextInput autoCapitalize="none" keyboardType="email-address" placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} />
                <TextInput placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} style={styles.input} />
                {error ? <Text style={styles.error}>{error}</Text> : null}
                <Pressable disabled={loading || !email || !password} onPress={() => void signIn(email.trim(), password)} style={[styles.syncButton, (loading || !email || !password) && styles.disabled]}>
                  <Text style={styles.syncButtonText}>{loading ? "Signing in..." : "Sign in & sync"}</Text>
                </Pressable>
              </>
            ) : null}
          </View>
        ) : (
          <View style={styles.accountRow}>
            <View>
              <Text style={styles.accountLabel}>SYNCED LEARNER</Text>
              <Text style={styles.accountName}>{displayName ?? user.email ?? "Nomi learner"}</Text>
            </View>
            <Pressable onPress={() => void signOut()}><Text style={styles.signOut}>Sign out</Text></Pressable>
          </View>
        )}

        <View style={styles.masteryCard}>
          <View>
            <Text style={styles.metricLabel}>Factorisation mastery</Text>
            <Text style={styles.masteryValue}>{syncing ? "…" : mastery}</Text>
          </View>
          <View style={styles.masteryMeta}>
            <Text style={styles.masteryScale}>/ 100</Text>
            <Text style={styles.source}>{sourceLabel}</Text>
          </View>
        </View>

        {syncError ? (
          <View style={styles.noticeCard}>
            <Text style={styles.noticeTitle}>Progress sync needs attention</Text>
            <Text style={styles.noticeBody}>{syncError}</Text>
          </View>
        ) : null}

        {latestSession ? (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View><Text style={styles.subject}>{latestSession.subject}</Text><Text style={styles.topic}>{latestSession.topic}</Text></View>
              <View style={styles.accuracyBadge}><Text style={styles.accuracyValue}>{latestSession.accuracy}%</Text><Text style={styles.accuracyLabel}>accuracy</Text></View>
            </View>
            <View style={styles.divider} />
            <View style={styles.metricRow}>
              <View><Text style={styles.metricLabel}>Latest practice</Text><Text style={styles.metricValue}>{latestSession.score} / {latestSession.total} correct</Text></View>
              <Text style={styles.status}>{latestSession.masteryChange >= 0 ? `Mastery +${latestSession.masteryChange}` : `Mastery ${latestSession.masteryChange}`}</Text>
            </View>
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.cream },
  screen: { flex: 1, padding: spacing.lg, paddingTop: spacing.xl },
  eyebrow: { color: colors.primaryPurple, fontSize: 11, fontWeight: "900", letterSpacing: 1.2 },
  title: { color: colors.ink, fontSize: 34, fontWeight: "800", letterSpacing: -1.1, lineHeight: 39, marginTop: spacing.sm },
  description: { color: colors.slate, fontSize: 15, lineHeight: 22, marginTop: spacing.md },
  syncCard: { backgroundColor: colors.white, borderRadius: radius.lg, marginTop: spacing.xl, padding: spacing.lg },
  syncTitle: { color: colors.ink, fontSize: 18, fontWeight: "800" },
  syncBody: { color: colors.slate, fontSize: 14, lineHeight: 20, marginTop: spacing.sm },
  input: { backgroundColor: colors.cream, borderColor: colors.stone, borderRadius: radius.md, borderWidth: 1, color: colors.ink, marginTop: spacing.md, paddingHorizontal: 14, paddingVertical: 13 },
  error: { color: colors.ink, fontSize: 12, marginTop: spacing.sm },
  syncButton: { alignItems: "center", backgroundColor: colors.primaryPurple, borderRadius: radius.pill, marginTop: spacing.md, paddingVertical: 14 },
  disabled: { opacity: 0.4 },
  syncButtonText: { color: colors.white, fontSize: 15, fontWeight: "800" },
  accountRow: { alignItems: "center", backgroundColor: colors.white, borderRadius: radius.lg, flexDirection: "row", justifyContent: "space-between", marginTop: spacing.xl, padding: spacing.lg },
  accountLabel: { color: colors.primaryPurple, fontSize: 10, fontWeight: "900", letterSpacing: 1 },
  accountName: { color: colors.ink, fontSize: 17, fontWeight: "800", marginTop: 3 },
  signOut: { color: colors.primaryPurple, fontSize: 13, fontWeight: "800" },
  masteryCard: { alignItems: "flex-end", backgroundColor: colors.lavender, borderRadius: radius.lg, flexDirection: "row", justifyContent: "space-between", marginTop: spacing.md, padding: spacing.lg },
  masteryValue: { color: colors.primaryPurple, fontSize: 48, fontWeight: "900", letterSpacing: -1.5, marginTop: 4 },
  masteryMeta: { alignItems: "flex-end", paddingBottom: 4 },
  masteryScale: { color: colors.slate, fontSize: 16, fontWeight: "700" },
  source: { color: colors.primaryPurple, fontSize: 10, fontWeight: "800", marginTop: 4 },
  noticeCard: { backgroundColor: colors.white, borderRadius: radius.lg, marginTop: spacing.md, padding: spacing.lg },
  noticeTitle: { color: colors.ink, fontSize: 14, fontWeight: "800" },
  noticeBody: { color: colors.slate, fontSize: 13, lineHeight: 19, marginTop: spacing.xs },
  card: { backgroundColor: colors.white, borderRadius: radius.lg, marginTop: spacing.md, padding: spacing.lg },
  cardHeader: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  subject: { color: colors.primaryPurple, fontSize: 12, fontWeight: "800" },
  topic: { color: colors.ink, fontSize: 24, fontWeight: "800", marginTop: 4 },
  accuracyBadge: { alignItems: "center", backgroundColor: colors.lavender, borderRadius: radius.md, minWidth: 82, paddingHorizontal: 12, paddingVertical: 10 },
  accuracyValue: { color: colors.primaryPurple, fontSize: 20, fontWeight: "900" },
  accuracyLabel: { color: colors.slate, fontSize: 10, fontWeight: "700", marginTop: 2 },
  divider: { backgroundColor: colors.stone, height: 1, marginVertical: spacing.lg },
  metricRow: { alignItems: "flex-end", flexDirection: "row", justifyContent: "space-between" },
  metricLabel: { color: colors.slate, fontSize: 12, fontWeight: "700" },
  metricValue: { color: colors.ink, fontSize: 18, fontWeight: "800", marginTop: 4 },
  status: { color: colors.primaryPurple, fontSize: 12, fontWeight: "800" },
});
