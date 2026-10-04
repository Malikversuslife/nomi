import { useRouter } from "expo-router";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useLearnerSession } from "@/auth/LearnerSessionContext";
import { AppIcon } from "@/components/AppIcon";
import { NomiMascot, NomiWordmark } from "@/components/NomiBrand";
import { useCurriculum } from "@/learn/useCurriculum";
import { colors, radius, spacing } from "@/theme/tokens";

export default function HomeScreen() {
  const router = useRouter();
  const { user, displayName } = useLearnerSession();

  const {
    subject,
    topics,
    currentTopic,
    parentName,
    isPathComplete,
    loading,
    error,
  } = useCurriculum("mathematics");

  const completedCount = topics.filter(
    (topic) => topic.state === "completed",
  ).length;

  const totalCount = topics.length;

  const progressPercent =
    totalCount > 0
      ? Math.round((completedCount / totalCount) * 100)
      : 0;

  const profileInitial = (
    displayName ??
    user?.email ??
    "N"
  )
    .charAt(0)
    .toUpperCase();

  const lessonTitle = isPathComplete
    ? "Quadratic equations"
    : currentTopic?.name ?? "Your next topic";

  const mastery = isPathComplete
    ? 100
    : currentTopic?.mastery ?? 0;

  function handlePrimaryAction() {
    if (isPathComplete) {
      router.push("/(tabs)/learn");
      return;
    }

    if (currentTopic && subject) {
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

      return;
    }

    router.push("/(tabs)/learn");
  }

  return (
    <SafeAreaView
      edges={["top"]}
      style={styles.safeArea}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <NomiWordmark width={92} />

          <View style={styles.headerActions}>
            <Pressable
              onPress={() =>
                router.push("/notifications")
              }
              style={styles.iconButton}
            >
              <AppIcon
                name="notification"
                color={colors.ink}
                size={21}
              />
            </Pressable>

            <Pressable
              onPress={() => router.push(user ? "/profile" : "/auth")}
              style={styles.profile}
            >
              <Text style={styles.profileText}>
                {profileInitial}
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroCopy}>
            <Text style={styles.kicker}>
              {isPathComplete
                ? "PATH COMPLETE"
                : "TODAY WITH NOMI"}
            </Text>

            <Text style={styles.heroTitle}>
              {isPathComplete
                ? "Nice work.\nWhat should we learn next?"
                : "Ready for your\nnext small win?"}
            </Text>

            <Text style={styles.heroBody}>
              {isPathComplete
                ? "Your Quadratic equations path is complete. Nomi can now help you review what matters or move forward."
                : "Nomi is using your assessed practice to choose what deserves your attention next."}
            </Text>
          </View>

          <NomiMascot
            state={
              isPathComplete
                ? "celebrating"
                : "encouraging"
            }
            size={122}
            style={styles.heroMascot}
          />
        </View>

        <View style={styles.sectionHeading}>
          <Text style={styles.sectionLabel}>
            {isPathComplete
              ? "MASTERED PATH"
              : "NEXT UP"}
          </Text>

          <Text style={styles.sectionMeta}>
            {subject?.name ?? "Mathematics"}
          </Text>
        </View>

        <View style={styles.lessonCard}>
          <View style={styles.lessonTop}>
            <View style={styles.lessonTitleWrap}>
              <Text style={styles.lessonEyebrow}>
                {(parentName ?? "ALGEBRA").toUpperCase()}
              </Text>

              <Text style={styles.lessonTitle}>
                {loading
                  ? "Loading your learner state…"
                  : lessonTitle}
              </Text>

              <Text style={styles.lessonMeta}>
                {error
                  ? error
                  : isPathComplete
                    ? `Mastered · ${completedCount} topics`
                    : `${mastery}/100 mastery · ${currentTopic?.difficulty ?? 1}/10 difficulty`}
              </Text>
            </View>

            <View style={styles.masteryBubble}>
              <Text style={styles.masteryValue}>
                {mastery}%
              </Text>
              <Text style={styles.masteryLabel}>
                mastery
              </Text>
            </View>
          </View>

          {!isPathComplete ? (
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.max(
                      2,
                      mastery,
                    )}%`,
                  },
                ]}
              />
            </View>
          ) : null}

          <Pressable
            style={[
              styles.primaryButton,
              isPathComplete &&
                styles.primaryButtonComplete,
            ]}
            onPress={handlePrimaryAction}
          >
            <Text style={styles.primaryButtonText}>
              {isPathComplete
                ? "Explore what’s next"
                : "Continue learning"}
            </Text>
          </Pressable>
        </View>

        <View style={styles.nomiInsight}>
          <NomiMascot
            state={
              isPathComplete
                ? "reinforcing"
                : "curious"
            }
            size={72}
          />

          <View style={styles.insightCopy}>
            <Text style={styles.insightEyebrow}>
              NOMI NOTICED
            </Text>

            <Text style={styles.insightTitle}>
              {isPathComplete
                ? "You’re ready to move on."
                : `${lessonTitle} is the clearest next move.`}
            </Text>

            <Text style={styles.insightBody}>
              {isPathComplete
                ? "Your evidence is strong across Quadratic equations. I’ll keep weaker concepts in your review mix so they stay fresh."
                : "The next practice set will adapt around your recent accuracy and mistakes."}
            </Text>
          </View>
        </View>

        <View style={styles.pathSection}>
          <View style={styles.sectionHeading}>
            <Text style={styles.sectionLabel}>
              YOUR PATH
            </Text>

            <Text style={styles.sectionMeta}>
              {completedCount}/{totalCount || 0}
            </Text>
          </View>

          <View style={styles.topicList}>
            {topics.map((topic, index) => {
              const completed =
                topic.state === "completed";

              return (
                <View
                  key={topic.id}
                  style={styles.topicRow}
                >
                  <View style={styles.topicRail}>
                    <View
                      style={[
                        styles.topicDot,
                        completed &&
                          styles.topicDotDone,
                      ]}
                    >
                      {completed ? (
                        <Text
                          style={
                            styles.topicCheck
                          }
                        >
                          ✓
                        </Text>
                      ) : (
                        <Text
                          style={
                            styles.topicNumber
                          }
                        >
                          {index + 1}
                        </Text>
                      )}
                    </View>

                    {index <
                    topics.length - 1 ? (
                      <View
                        style={[
                          styles.topicConnector,
                          completed &&
                            styles.topicConnectorDone,
                        ]}
                      />
                    ) : null}
                  </View>

                  <View style={styles.topicCopy}>
                    <Text
                      style={styles.topicName}
                    >
                      {topic.name}
                    </Text>

                    <Text
                      style={
                        styles.topicStatus
                      }
                    >
                      {completed
                        ? "Mastered"
                        : topic.state ===
                            "current"
                          ? "In progress"
                          : "Up next"}
                    </Text>
                  </View>

                  {completed ? (
                    <View
                      style={
                        styles.masteredBadge
                      }
                    >
                      <Text
                        style={
                          styles.masteredBadgeText
                        }
                      >
                        MASTERED
                      </Text>
                    </View>
                  ) : null}
                </View>
              );
            })}
          </View>

          {!isPathComplete ? (
            <Text style={styles.pathSummary}>
              {progressPercent}% of this path
              completed
            </Text>
          ) : (
            <Text style={styles.pathSummary}>
              This learning path is complete.
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.cream,
  },

  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
  },

  topBar: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 48,
  },

  headerActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },

  iconButton: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    height: 42,
    justifyContent: "center",
    width: 42,
  },

  profile: {
    alignItems: "center",
    backgroundColor: colors.lavender,
    borderRadius: radius.pill,
    height: 42,
    justifyContent: "center",
    width: 42,
  },

  profileText: {
    color: colors.primaryPurple,
    fontSize: 15,
    fontWeight: "900",
  },

  heroCard: {
    backgroundColor: colors.lavender,
    borderRadius: 30,
    marginTop: spacing.lg,
    minHeight: 224,
    overflow: "hidden",
    padding: spacing.lg,
    position: "relative",
  },

  heroCopy: {
    maxWidth: "63%",
    zIndex: 2,
  },

  kicker: {
    color: colors.primaryPurple,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.3,
  },

  heroTitle: {
    color: colors.ink,
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: -1,
    lineHeight: 33,
    marginTop: 8,
  },

  heroBody: {
    color: colors.slate,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 12,
  },

  heroMascot: {
    bottom: 4,
    position: "absolute",
    right: -2,
  },

  sectionHeading: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.xl,
  },

  sectionLabel: {
    color: colors.slate,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.2,
  },

  sectionMeta: {
    color: colors.primaryPurple,
    fontSize: 10,
    fontWeight: "900",
  },

  lessonCard: {
    backgroundColor: colors.white,
    borderRadius: 28,
    marginTop: spacing.sm,
    padding: spacing.lg,
  },

  lessonTop: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },

  lessonTitleWrap: {
    flex: 1,
  },

  lessonEyebrow: {
    color: colors.primaryPurple,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1.1,
  },

  lessonTitle: {
    color: colors.ink,
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: -0.7,
    lineHeight: 28,
    marginTop: 5,
  },

  lessonMeta: {
    color: colors.slate,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 5,
  },

  masteryBubble: {
    alignItems: "center",
    backgroundColor:
      colors.warmSurface ?? colors.lavender,
    borderRadius: 20,
    height: 66,
    justifyContent: "center",
    width: 66,
  },

  masteryValue: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: "900",
  },

  masteryLabel: {
    color: colors.slate,
    fontSize: 8,
    marginTop: 1,
  },

  progressTrack: {
    backgroundColor: colors.stone,
    borderRadius: radius.pill,
    height: 7,
    marginTop: spacing.lg,
    overflow: "hidden",
  },

  progressFill: {
    backgroundColor: colors.primaryPurple,
    borderRadius: radius.pill,
    height: 7,
  },

  primaryButton: {
    alignItems: "center",
    backgroundColor: colors.primaryPurple,
    borderRadius: radius.pill,
    marginTop: spacing.lg,
    paddingVertical: 15,
  },

  primaryButtonComplete: {
    marginTop: spacing.md,
  },

  primaryButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "900",
  },

  nomiInsight: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 26,
    flexDirection: "row",
    gap: 12,
    marginTop: spacing.md,
    padding: spacing.md,
  },

  insightCopy: {
    flex: 1,
  },

  insightEyebrow: {
    color: colors.primaryPurple,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1.1,
  },

  insightTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "900",
    lineHeight: 20,
    marginTop: 4,
  },

  insightBody: {
    color: colors.slate,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 4,
  },

  pathSection: {
    marginTop: spacing.sm,
  },

  topicList: {
    backgroundColor: colors.white,
    borderRadius: 26,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },

  topicRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    minHeight: 68,
  },

  topicRail: {
    alignItems: "center",
    alignSelf: "stretch",
    width: 34,
  },

  topicDot: {
    alignItems: "center",
    backgroundColor: colors.stone,
    borderRadius: radius.pill,
    height: 28,
    justifyContent: "center",
    marginTop: 8,
    width: 28,
    zIndex: 2,
  },

  topicDotDone: {
    backgroundColor: colors.mint,
  },

  topicNumber: {
    color: colors.slate,
    fontSize: 9,
    fontWeight: "900",
  },

  topicCheck: {
    color: colors.ink,
    fontSize: 11,
    fontWeight: "900",
  },

  topicConnector: {
    backgroundColor: colors.stone,
    flex: 1,
    width: 2,
  },

  topicConnectorDone: {
    backgroundColor: colors.mint,
  },

  topicCopy: {
    flex: 1,
    paddingBottom: 14,
    paddingLeft: 10,
    paddingTop: 8,
  },

  topicName: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "900",
    lineHeight: 18,
  },

  topicStatus: {
    color: colors.slate,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 2,
  },

  masteredBadge: {
    backgroundColor: colors.lavender,
    borderRadius: radius.pill,
    marginLeft: 8,
    marginTop: 10,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },

  masteredBadgeText: {
    color: colors.primaryPurple,
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 0.6,
  },

  pathSummary: {
    color: colors.slate,
    fontSize: 10,
    marginTop: spacing.sm,
  },
});