import { SafeAreaView, StyleSheet, Text, View } from "react-native";

import { usePracticeProgress } from "@/progress/PracticeProgressContext";
import { colors, radius, spacing } from "@/theme/tokens";

export default function ProgressScreen() {
  const { latestSession } = usePracticeProgress();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <Text style={styles.eyebrow}>PROGRESS</Text>
        <Text style={styles.title}>See what is actually changing.</Text>
        <Text style={styles.description}>
          Nomi turns practice into evidence, then uses that evidence to shape what happens next.
        </Text>

        {latestSession ? (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.subject}>{latestSession.subject}</Text>
                <Text style={styles.topic}>{latestSession.topic}</Text>
              </View>
              <View style={styles.accuracyBadge}>
                <Text style={styles.accuracyValue}>{latestSession.accuracy}%</Text>
                <Text style={styles.accuracyLabel}>accuracy</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.metricRow}>
              <View>
                <Text style={styles.metricLabel}>Latest practice</Text>
                <Text style={styles.metricValue}>{latestSession.score} / {latestSession.total} correct</Text>
              </View>
              <Text style={styles.status}>{latestSession.accuracy >= 80 ? "Strong session" : "Keep reinforcing"}</Text>
            </View>

            <View style={styles.notice}>
              <View style={styles.noticeDot} />
              <Text style={styles.noticeText}>
                This session is now available as learner evidence. The next step is to feed each attempt into Nomi's deterministic mastery engine.
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No practice evidence yet.</Text>
            <Text style={styles.emptyBody}>Finish a Factorisation practice set and your latest result will appear here.</Text>
          </View>
        )}
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
  card: { backgroundColor: colors.white, borderRadius: radius.lg, marginTop: spacing.xl, padding: spacing.lg },
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
  notice: { backgroundColor: colors.lavender, borderRadius: radius.md, flexDirection: "row", marginTop: spacing.lg, padding: spacing.md },
  noticeDot: { backgroundColor: colors.mint, borderRadius: radius.pill, height: 10, marginRight: 10, marginTop: 4, width: 10 },
  noticeText: { color: colors.slate, flex: 1, fontSize: 13, lineHeight: 19 },
  emptyCard: { backgroundColor: colors.white, borderRadius: radius.lg, marginTop: spacing.xl, padding: spacing.lg },
  emptyTitle: { color: colors.ink, fontSize: 18, fontWeight: "800" },
  emptyBody: { color: colors.slate, fontSize: 14, lineHeight: 21, marginTop: spacing.sm },
});
