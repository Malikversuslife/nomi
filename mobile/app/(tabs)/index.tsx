import { Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing } from "@/theme/tokens";

const mascotUri =
  "https://raw.githubusercontent.com/Malikversuslife/nomi/main/public/brand/nomi/mascot/encouraging.png";

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <Text style={styles.wordmark}>nomi</Text>
          <View style={styles.profile}><Text style={styles.profileText}>M</Text></View>
        </View>

        <View style={styles.hero}>
          <View style={styles.heroCopy}>
            <Text style={styles.kicker}>GOOD MORNING</Text>
            <Text style={styles.title}>Ready to keep going?</Text>
            <Text style={styles.subtitle}>A little progress today still counts.</Text>
          </View>
          <Image source={{ uri: mascotUri }} style={styles.mascot} resizeMode="contain" />
        </View>

        <Text style={styles.sectionLabel}>CONTINUE LEARNING</Text>
        <View style={styles.lessonCard}>
          <View style={styles.subjectPill}><Text style={styles.subjectPillText}>Mathematics</Text></View>
          <Text style={styles.lessonTitle}>Factorisation</Text>
          <Text style={styles.lessonMeta}>Common factors · about 8 min</Text>

          <View style={styles.progressTrack}>
            <View style={styles.progressFill} />
          </View>
          <View style={styles.progressRow}>
            <Text style={styles.progressCopy}>You are making progress</Text>
            <Text style={styles.progressValue}>64%</Text>
          </View>

          <Pressable style={styles.primaryButton} accessibilityRole="button">
            <Text style={styles.primaryButtonText}>Continue learning</Text>
          </Pressable>
        </View>

        <View style={styles.insightCard}>
          <View style={styles.insightDot} />
          <View style={styles.insightCopy}>
            <Text style={styles.insightEyebrow}>NOMI NOTICED</Text>
            <Text style={styles.insightTitle}>You are getting quicker at spotting common factors.</Text>
            <Text style={styles.insightBody}>Keep going. The next practice set will build on that.</Text>
          </View>
        </View>

        <View style={styles.weekHeader}>
          <Text style={styles.sectionLabel}>YOUR WEEK</Text>
          <Text style={styles.weekCount}>4 days</Text>
        </View>
        <View style={styles.weekRow}>
          {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
            <View key={`${day}-${index}`} style={styles.dayItem}>
              <View style={[styles.dayDot, index < 4 && styles.dayDotActive]} />
              <Text style={styles.dayText}>{day}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.cream },
  content: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.xxl },
  topBar: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  wordmark: { color: colors.primaryPurple, fontSize: 30, fontWeight: "900", letterSpacing: -1.5 },
  profile: {
    alignItems: "center",
    backgroundColor: colors.lavender,
    borderRadius: radius.pill,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  profileText: { color: colors.primaryPurple, fontSize: 15, fontWeight: "800" },
  hero: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.xl,
    minHeight: 142,
  },
  heroCopy: { flex: 1, paddingRight: spacing.sm },
  kicker: { color: colors.primaryPurple, fontSize: 12, fontWeight: "800", letterSpacing: 1.4 },
  title: { color: colors.ink, fontSize: 34, fontWeight: "800", letterSpacing: -1.2, lineHeight: 38, marginTop: 6 },
  subtitle: { color: colors.slate, fontSize: 15, lineHeight: 22, marginTop: spacing.sm },
  mascot: { height: 118, width: 118 },
  sectionLabel: { color: colors.slate, fontSize: 12, fontWeight: "800", letterSpacing: 1.25, marginTop: spacing.xl },
  lessonCard: { backgroundColor: colors.white, borderRadius: radius.lg, marginTop: spacing.sm, padding: spacing.lg },
  subjectPill: { alignSelf: "flex-start", backgroundColor: colors.lavender, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 7 },
  subjectPillText: { color: colors.primaryPurple, fontSize: 12, fontWeight: "800" },
  lessonTitle: { color: colors.ink, fontSize: 28, fontWeight: "800", letterSpacing: -0.8, marginTop: spacing.md },
  lessonMeta: { color: colors.slate, fontSize: 14, marginTop: 5 },
  progressTrack: { backgroundColor: colors.stone, borderRadius: radius.pill, height: 8, marginTop: spacing.lg, overflow: "hidden" },
  progressFill: { backgroundColor: colors.primaryPurple, borderRadius: radius.pill, height: 8, width: "64%" },
  progressRow: { flexDirection: "row", justifyContent: "space-between", marginTop: spacing.sm },
  progressCopy: { color: colors.slate, fontSize: 13 },
  progressValue: { color: colors.ink, fontSize: 13, fontWeight: "800" },
  primaryButton: { alignItems: "center", backgroundColor: colors.primaryPurple, borderRadius: radius.pill, marginTop: spacing.lg, paddingVertical: 16 },
  primaryButtonText: { color: colors.white, fontSize: 16, fontWeight: "800" },
  insightCard: { backgroundColor: colors.lavender, borderRadius: radius.lg, flexDirection: "row", marginTop: spacing.md, padding: spacing.lg },
  insightDot: { backgroundColor: colors.mint, borderRadius: radius.pill, height: 12, marginRight: 12, marginTop: 3, width: 12 },
  insightCopy: { flex: 1 },
  insightEyebrow: { color: colors.primaryPurple, fontSize: 11, fontWeight: "900", letterSpacing: 1.2 },
  insightTitle: { color: colors.ink, fontSize: 17, fontWeight: "800", lineHeight: 23, marginTop: 6 },
  insightBody: { color: colors.slate, fontSize: 14, lineHeight: 20, marginTop: 5 },
  weekHeader: { alignItems: "flex-end", flexDirection: "row", justifyContent: "space-between" },
  weekCount: { color: colors.primaryPurple, fontSize: 13, fontWeight: "800" },
  weekRow: { flexDirection: "row", justifyContent: "space-between", marginTop: spacing.md },
  dayItem: { alignItems: "center", gap: 7 },
  dayDot: { backgroundColor: colors.stone, borderRadius: radius.pill, height: 30, width: 30 },
  dayDotActive: { backgroundColor: colors.mint },
  dayText: { color: colors.slate, fontSize: 11, fontWeight: "700" },
});
