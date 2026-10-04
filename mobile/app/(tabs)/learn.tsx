import { useEffect } from "react";
import { useRouter } from "expo-router";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useCurriculum } from "@/learn/useCurriculum";
import { usePracticeProgress } from "@/progress/PracticeProgressContext";
import { colors, radius, spacing } from "@/theme/tokens";

export default function LearnScreen() {
  const router = useRouter();

  const {
    mastery,
    masterySource,
    adaptivePractice,
    misconception,
    activeTopicId,
    setActiveTopic,
    syncing,
    syncError,
  } = usePracticeProgress();

  const {
    subject,
    topics,
    currentTopic,
    parentName,
    isPathComplete,
    loading,
    error,
  } = useCurriculum("mathematics");

  useEffect(() => {
    if (currentTopic) {
      setActiveTopic(currentTopic.id, currentTopic.name);
    }
  }, [currentTopic, setActiveTopic]);

  const activeStateReady = Boolean(
    currentTopic && activeTopicId === currentTopic.id
  );

  const activeMastery = activeStateReady
    ? mastery
    : currentTopic?.mastery ?? 0;

  const activeDifficulty = activeStateReady
    ? adaptivePractice.difficulty
    : currentTopic?.difficulty ?? 1;

  const masteryLabel =
    activeMastery >= 80
      ? "Strong"
      : activeMastery >= 60
        ? "Developing"
        : activeMastery > 0
          ? "Building"
          : "Not started";

  const nextAction =
    misconception?.status === "recurring" && activeStateReady
      ? "Review the current misconception"
      : activeMastery >= 80
        ? "Move to the next concept"
        : `Continue ${currentTopic?.name ?? "learning"}`;

  const adaptiveMessage = activeStateReady
    ? adaptivePractice.message
    : "Nomi is loading this topic’s assessed learner state.";

  const pathTopics = isPathComplete
    ? topics
    : topics.filter((topic) => topic.id !== currentTopic?.id);

  const completedCount = topics.filter(
    (topic) => topic.state === "completed"
  ).length;

  const parentLabel = (parentName ?? "QUADRATIC EQUATIONS").toUpperCase();

  function openPractice() {
    if (!currentTopic || !subject) return;

    router.push({
      pathname: "/(tabs)/practice",
      params: {
        topicId: currentTopic.id,
        topicSlug: currentTopic.slug,
        topicName: currentTopic.name,
        subjectId: subject.id,
        subjectName: subject.name,
      },
    });
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.screen}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.eyebrow}>LEARN</Text>

        <Text style={styles.title}>
          Build it one idea at a time.
        </Text>

        <Text style={styles.description}>
          Your curriculum stays structured while Nomi adapts the depth,
          difficulty and next step around your evidence.
        </Text>

        <View style={styles.subjectHeader}>
          <View>
            <Text style={styles.subjectEyebrow}>ACTIVE SUBJECT</Text>
            <Text style={styles.subjectTitle}>
              {subject?.name ?? "Mathematics"}
            </Text>
          </View>

          <View style={styles.subjectBadge}>
            <Text style={styles.subjectBadgeText}>
              {parentLabel}
            </Text>
          </View>
        </View>

        {loading ? (
          <View style={styles.statusCard}>
            <Text style={styles.statusTitle}>
              Loading your learning path…
            </Text>
            <Text style={styles.statusText}>
              Nomi is matching the curriculum to your assessed progress.
            </Text>
          </View>
        ) : error ? (
          <View style={styles.statusCard}>
            <Text style={styles.statusTitle}>
              Your curriculum needs attention
            </Text>
            <Text style={styles.statusText}>{error}</Text>
          </View>
        ) : isPathComplete ? (
          <>
            <View style={styles.completionCard}>
              <View style={styles.completeTag}>
                <Text style={styles.completeTagText}>
                  PATH COMPLETE
                </Text>
              </View>

              <Text style={styles.completionTitle}>
                Quadratic equations mastered.
              </Text>

              <Text style={styles.completionMeta}>
                {completedCount} of {topics.length} topics complete · 100% mastery
              </Text>

              <Text style={styles.completionText}>
                You’ve built strong evidence across this path. Review it,
                mix concepts for retention, or continue when the next unit
                becomes available.
              </Text>

              <Pressable
                onPress={() => router.push(currentTopic ? { pathname: "/(tabs)/nomi", params: { topicId: currentTopic.id, topicName: currentTopic.name } } : "/(tabs)/nomi")}
                style={styles.primaryButton}
              >
                <Text style={styles.primaryButtonText}>
                  Ask Nomi what’s next
                </Text>
              </Pressable>
            </View>

            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionEyebrow}>
                  YOUR CURRICULUM
                </Text>
                <Text style={styles.sectionTitle}>
                  Quadratic equations
                </Text>
              </View>

              <Text style={styles.sectionMeta}>
                {completedCount}/{topics.length}
              </Text>
            </View>

            <View style={styles.curriculumCard}>
              {pathTopics.map((topic, index) => {
                const isLast = index === pathTopics.length - 1;

                return (
                  <View key={topic.id} style={styles.pathRow}>
                    <View style={styles.timeline}>
                      <View style={styles.completedNumber}>
                        <Text style={styles.check}>✓</Text>
                      </View>

                      {!isLast ? (
                        <View style={styles.timelineLine} />
                      ) : null}
                    </View>

                    <View
                      style={[
                        styles.pathContent,
                        !isLast && styles.pathContentBorder,
                      ]}
                    >
                      <Text style={styles.pathTitle}>
                        {topic.name}
                      </Text>

                      <Text style={styles.pathDescription}>
                        {topic.description}
                      </Text>

                      <Text style={styles.requirement}>
                        {topic.mastery}/100 mastery · {topic.difficulty}/10 difficulty
                      </Text>
                    </View>
                  </View>
                );
              })}

              <View style={styles.pathCompleteFooter}>
                <View style={styles.footerDot} />

                <View style={styles.footerCopy}>
                  <Text style={styles.footerEyebrow}>
                    PATH COMPLETE
                  </Text>
                  <Text style={styles.footerText}>
                    Foundation complete
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.nextUnit}>
              <Text style={styles.nextUnitEyebrow}>UP NEXT</Text>
              <Text style={styles.nextUnitTitle}>
                Your next unit will appear here.
              </Text>
              <Text style={styles.nextUnitText}>
                Until then, Nomi can help you revisit concepts or mix
                completed topics for stronger retention.
              </Text>
            </View>
          </>
        ) : !currentTopic ? (
          <View style={styles.statusCard}>
            <Text style={styles.statusTitle}>
              No active topic found
            </Text>
            <Text style={styles.statusText}>
              Nomi could not determine the next curriculum step.
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.currentCard}>
              <View style={styles.rowBetween}>
                <View style={styles.currentTag}>
                  <Text style={styles.currentTagText}>
                    {currentTopic.state.toUpperCase()}
                  </Text>
                </View>

                <Text style={styles.mastery}>
                  {activeMastery}/100
                </Text>
              </View>

              <Text style={styles.topicTitle}>
                {currentTopic.name}
              </Text>

              <Text style={styles.topicDescription}>
                {currentTopic.description ??
                  "Build confidence through structured, assessed practice."}
              </Text>

              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${Math.max(2, activeMastery)}%` },
                  ]}
                />
              </View>

              <View style={styles.rowBetween}>
                <Text style={styles.progressLabel}>
                  {masteryLabel} mastery
                </Text>
                <Text style={styles.progressMeta}>
                  {activeDifficulty}/10 difficulty
                </Text>
              </View>

              <View style={styles.adaptiveBox}>
                <Text style={styles.adaptiveEyebrow}>
                  NOMI'S NEXT MOVE
                </Text>

                <Text style={styles.adaptiveTitle}>
                  {nextAction}
                </Text>

                <Text style={styles.adaptiveText}>
                  {adaptiveMessage}
                </Text>

                {misconception && activeStateReady ? (
                  <Text style={styles.misconception}>
                    {misconception.message}
                  </Text>
                ) : null}
              </View>

              <View style={styles.actions}>
                <Pressable
                  onPress={openPractice}
                  style={[styles.primaryButton, styles.actionButton]}
                >
                  <Text style={styles.primaryButtonText}>
                    {activeMastery > 0
                      ? "Continue practice"
                      : "Start topic"}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => router.push(currentTopic ? { pathname: "/(tabs)/nomi", params: { topicId: currentTopic.id, topicName: currentTopic.name } } : "/(tabs)/nomi")}
                  style={styles.secondaryButton}
                >
                  <Text style={styles.secondaryButtonText}>
                    Ask Nomi
                  </Text>
                </Pressable>
              </View>

              <Text style={styles.evidenceNote}>
                {syncing
                  ? "Syncing learner evidence…"
                  : masterySource === "supabase"
                    ? "Progress is backed by assessed practice evidence."
                    : masterySource === "new-learner"
                      ? "Complete assessed Practice to establish your mastery."
                      : "Prototype learner state is active."}
              </Text>

              {syncError ? (
                <Text style={styles.errorText}>
                  {syncError}
                </Text>
              ) : null}
            </View>

            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionEyebrow}>
                  YOUR CURRICULUM
                </Text>
                <Text style={styles.sectionTitle}>
                  {parentName ?? "Your path"}
                </Text>
              </View>

              <Text style={styles.sectionMeta}>
                {completedCount}/{topics.length}
              </Text>
            </View>

            <View style={styles.curriculumCard}>
              {pathTopics.map((topic, index) => {
                const locked = topic.state === "locked";
                const completed = topic.state === "completed";
                const isLast = index === pathTopics.length - 1;

                return (
                  <View
                    key={topic.id}
                    style={[
                      styles.pathRow,
                      locked && styles.lockedCard,
                    ]}
                  >
                    <View style={styles.timeline}>
                      <View
                        style={[
                          styles.number,
                          locked && styles.lockedNumber,
                          completed && styles.completedNumber,
                        ]}
                      >
                        <Text
                          style={[
                            styles.numberText,
                            locked && styles.lockedText,
                          ]}
                        >
                          {completed ? "✓" : index + 2}
                        </Text>
                      </View>

                      {!isLast ? (
                        <View style={styles.timelineLine} />
                      ) : null}
                    </View>

                    <View
                      style={[
                        styles.pathContent,
                        !isLast && styles.pathContentBorder,
                      ]}
                    >
                      <Text
                        style={[
                          styles.pathTitle,
                          locked && styles.lockedText,
                        ]}
                      >
                        {topic.name}
                      </Text>

                      <Text
                        style={[
                          styles.pathDescription,
                          locked && styles.lockedDescription,
                        ]}
                      >
                        {topic.description}
                      </Text>

                      <Text style={styles.requirement}>
                        {completed
                          ? `${topic.mastery}/100 mastery`
                          : topic.state === "next"
                            ? "Ready after your current step"
                            : "Progress through the path to unlock"}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.cream,
  },

  screen: {
    padding: spacing.lg,
    paddingTop: (StatusBar.currentHeight ?? 0) + spacing.lg,
    paddingBottom: 72,
  },

  eyebrow: {
    color: colors.primaryPurple,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.2,
  },

  title: {
    color: colors.ink,
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: -1.2,
    lineHeight: 39,
    marginTop: spacing.sm,
    maxWidth: "90%",
  },

  description: {
    color: colors.slate,
    fontSize: 15,
    lineHeight: 22,
    marginTop: spacing.md,
    maxWidth: "94%",
  },

  subjectHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.xl,
  },

  subjectEyebrow: {
    color: colors.slate,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
  },

  subjectTitle: {
    color: colors.ink,
    fontSize: 21,
    fontWeight: "800",
    marginTop: 3,
  },

  subjectBadge: {
    backgroundColor: colors.lavender,
    borderRadius: radius.pill,
    maxWidth: "52%",
    paddingHorizontal: 12,
    paddingVertical: 7,
  },

  subjectBadgeText: {
    color: colors.primaryPurple,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.8,
  },

  statusCard: {
    backgroundColor: colors.white,
    borderRadius: 28,
    marginTop: spacing.md,
    padding: spacing.lg,
  },

  statusTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "800",
  },

  statusText: {
    color: colors.slate,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
  },

  completionCard: {
    backgroundColor: colors.white,
    borderRadius: 28,
    marginTop: spacing.md,
    padding: spacing.lg,
  },

  completeTag: {
    alignSelf: "flex-start",
    backgroundColor: colors.mint,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  completeTagText: {
    color: colors.ink,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.8,
  },

  completionTitle: {
    color: colors.ink,
    fontSize: 27,
    fontWeight: "800",
    letterSpacing: -0.7,
    lineHeight: 31,
    marginTop: spacing.md,
  },

  completionMeta: {
    color: colors.primaryPurple,
    fontSize: 11,
    fontWeight: "800",
    marginTop: 7,
  },

  completionText: {
    color: colors.slate,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 10,
  },

  primaryButton: {
    alignItems: "center",
    backgroundColor: colors.primaryPurple,
    borderRadius: radius.pill,
    marginTop: spacing.lg,
    paddingVertical: 15,
  },

  primaryButtonText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "900",
  },

  sectionHeader: {
    alignItems: "flex-end",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.xl,
  },

  sectionEyebrow: {
    color: colors.primaryPurple,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
  },

  sectionTitle: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: "800",
    marginTop: 4,
  },

  sectionMeta: {
    color: colors.primaryPurple,
    fontSize: 10,
    fontWeight: "900",
    paddingBottom: 2,
  },

  curriculumCard: {
    backgroundColor: colors.white,
    borderRadius: 28,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },

  pathRow: {
    alignItems: "stretch",
    flexDirection: "row",
    gap: 14,
  },

  timeline: {
    alignItems: "center",
    width: 38,
  },

  timelineLine: {
    backgroundColor: colors.mint,
    flex: 1,
    minHeight: 32,
    width: 2,
  },

  completedNumber: {
    alignItems: "center",
    backgroundColor: colors.mint,
    borderRadius: radius.pill,
    height: 36,
    justifyContent: "center",
    width: 36,
  },

  check: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "900",
  },

  pathContent: {
    flex: 1,
    paddingBottom: spacing.lg,
  },

  pathContentBorder: {
    borderBottomColor: colors.stone,
    borderBottomWidth: 1,
    marginBottom: spacing.md,
  },

  pathTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 20,
  },

  pathDescription: {
    color: colors.slate,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
  },

  requirement: {
    color: colors.slate,
    fontSize: 10,
    fontWeight: "700",
    marginTop: 8,
  },

  pathCompleteFooter: {
    alignItems: "center",
    flexDirection: "row",
    gap: 14,
    paddingTop: 2,
    paddingBottom: 6,
  },

  footerDot: {
    backgroundColor: colors.primaryPurple,
    borderRadius: radius.pill,
    height: 10,
    marginLeft: 13,
    width: 10,
  },

  footerCopy: {
    flex: 1,
  },

  footerEyebrow: {
    color: colors.primaryPurple,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
  },

  footerText: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "800",
    marginTop: 3,
  },

  nextUnit: {
    borderColor: colors.stone,
    borderRadius: 24,
    borderWidth: 1,
    marginTop: spacing.md,
    padding: spacing.lg,
  },

  nextUnitEyebrow: {
    color: colors.primaryPurple,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
  },

  nextUnitTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 21,
    marginTop: 6,
  },

  nextUnitText: {
    color: colors.slate,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 5,
  },

  currentCard: {
    backgroundColor: colors.white,
    borderRadius: 28,
    marginTop: spacing.md,
    padding: spacing.lg,
  },

  rowBetween: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  currentTag: {
    backgroundColor: colors.primaryPurple,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  currentTagText: {
    color: colors.white,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.8,
  },

  mastery: {
    color: colors.primaryPurple,
    fontSize: 16,
    fontWeight: "900",
  },

  topicTitle: {
    color: colors.ink,
    fontSize: 27,
    fontWeight: "800",
    letterSpacing: -0.7,
    marginTop: spacing.md,
  },

  topicDescription: {
    color: colors.slate,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },

  progressTrack: {
    backgroundColor: colors.stone,
    borderRadius: radius.pill,
    height: 9,
    marginTop: spacing.lg,
    overflow: "hidden",
  },

  progressFill: {
    backgroundColor: colors.primaryPurple,
    borderRadius: radius.pill,
    height: "100%",
  },

  progressLabel: {
    color: colors.ink,
    fontSize: 11,
    fontWeight: "800",
    marginTop: 8,
  },

  progressMeta: {
    color: colors.slate,
    fontSize: 11,
    marginTop: 8,
  },

  adaptiveBox: {
    backgroundColor: colors.lavender,
    borderRadius: radius.md,
    marginTop: spacing.lg,
    padding: spacing.md,
  },

  adaptiveEyebrow: {
    color: colors.primaryPurple,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
  },

  adaptiveTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "800",
    marginTop: 7,
  },

  adaptiveText: {
    color: colors.slate,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
  },

  misconception: {
    color: colors.ink,
    fontSize: 11,
    fontWeight: "700",
    lineHeight: 17,
    marginTop: 8,
  },

  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: spacing.lg,
  },

  actionButton: {
    flex: 1,
    marginTop: 0,
  },

  secondaryButton: {
    alignItems: "center",
    borderColor: colors.primaryPurple,
    borderRadius: radius.pill,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    paddingVertical: 14,
  },

  secondaryButtonText: {
    color: colors.primaryPurple,
    fontSize: 13,
    fontWeight: "900",
  },

  evidenceNote: {
    color: colors.slate,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 12,
    textAlign: "center",
  },

  errorText: {
    color: colors.ink,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 6,
    textAlign: "center",
  },

  number: {
    alignItems: "center",
    backgroundColor: colors.yellow,
    borderRadius: radius.pill,
    height: 36,
    justifyContent: "center",
    width: 36,
  },

  numberText: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "900",
  },

  lockedCard: {
    opacity: 0.62,
  },

  lockedNumber: {
    backgroundColor: colors.stone,
  },

  lockedText: {
    color: colors.slate,
  },

  lockedDescription: {
    color: colors.slate,
  },
});