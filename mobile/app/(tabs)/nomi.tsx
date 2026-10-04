import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useLearnerSession } from "@/auth/LearnerSessionContext";
import { useCurriculum } from "@/learn/useCurriculum";
import { AppIcon } from "@/components/AppIcon";
import { NomiMascot } from "@/components/NomiBrand";
import { supabase } from "@/lib/supabase";
import { usePracticeProgress } from "@/progress/PracticeProgressContext";
import { colors, radius, spacing } from "@/theme/tokens";

type TutorAction = "practice" | "review" | "example" | "none";

type TutorMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  followUp?: string | null;
  suggestedAction?: TutorAction | null;
};

type TutorResult = {
  content: string;
  followUp?: string | null;
  suggestedAction?: TutorAction | null;
};

const tutorApiBase =
  process.env.EXPO_PUBLIC_NOMI_API_URL?.replace(/\/$/, "") ?? "";

function deterministicExample(topicName: string) {
  const topic = topicName.toLowerCase();

  if (topic.includes("completing")) {
    return "Take x² + 6x + 5. Half of 6 is 3, so build (x + 3)² = x² + 6x + 9. Because we added 9 instead of 5, subtract 4: x² + 6x + 5 = (x + 3)² - 4.";
  }

  if (topic.includes("quadratic formula")) {
    return "For x² - 5x + 6 = 0, a = 1, b = -5 and c = 6. The discriminant is 25 - 24 = 1, so x = (5 ± 1) / 2. The roots are 2 and 3.";
  }

  return "Take x² + 5x + 6. Look for two numbers that multiply to 6 and add to 5: 2 and 3. So x² + 5x + 6 = (x + 2)(x + 3).";
}

function deterministicQuiz(topicName: string) {
  const topic = topicName.toLowerCase();

  if (topic.includes("completing")) {
    return {
      question:
        "Quick check: rewrite x² + 8x + 7 in completed-square form.",
      followUp: "What number goes inside the bracket after x?",
    };
  }

  if (topic.includes("quadratic formula")) {
    return {
      question:
        "Quick check: for 2x² + 3x - 2 = 0, what is the discriminant?",
      followUp: "Start with b² - 4ac. What values are a, b and c?",
    };
  }

  return {
    question: "Quick check: factorise x² + 7x + 10 completely.",
    followUp: "Which two numbers multiply to 10 and add to 7?",
  };
}

function tutorReply(
  message: string,
  topicName: string,
  mastery: number,
  difficulty: number,
  misconception: ReturnType<
    typeof usePracticeProgress
  >["misconception"],
): TutorResult {
  const text = message.toLowerCase();

  const context = misconception
    ? misconception.message
    : `Your current ${topicName} mastery is ${mastery}/100 at difficulty ${difficulty}.`;

  if (text.includes("worked example") || text.includes("example")) {
    return {
      content: `${context}\n\n${deterministicExample(topicName)}`,
      followUp: "Want to try one yourself?",
      suggestedAction: "practice",
    };
  }

  if (
    text.includes("quiz") ||
    text.includes("question") ||
    text.includes("test")
  ) {
    const quiz = deterministicQuiz(topicName);

    return {
      content: `${context}\n\n${quiz.question}`,
      followUp: quiz.followUp,
      suggestedAction: "none",
    };
  }

  return {
    content: `${context}\n\n${deterministicExample(topicName)}`,
    followUp: "Want an example or a quick check?",
    suggestedAction: "example",
  };
}

export default function NomiScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ topicId?: string; topicName?: string }>();
  const { topics, currentTopic } = useCurriculum("mathematics");
  const { displayName } = useLearnerSession();

  const {
    mastery,
    misconception,
    adaptivePractice,
    latestSession,
    activeTopicId,
    activeTopicName,
  } = usePracticeProgress();

  const topicId = params.topicId ?? activeTopicId ?? currentTopic?.id ?? null;
  const canonicalTopic = topics.find((topic) => topic.id === topicId);
  const topicName =
    canonicalTopic?.name ??
    (params.topicId === topicId ? params.topicName : null) ??
    (activeTopicId === topicId ? activeTopicName : null) ??
    (latestSession?.topicId === topicId ? latestSession.topic : null) ??
    "Factorisation";
  const relevantSession = latestSession?.topicId === topicId ? latestSession : null;
  const firstName = displayName?.split(" ")[0] ?? "there";

  const starters = useMemo(
    () => [
      {
        eyebrow: "EXPLAIN",
        title: `Explain ${topicName} another way`,
      },
      {
        eyebrow: "SHOW ME",
        title: "Walk me through a worked example",
      },
      {
        eyebrow: "CHECK ME",
        title: "Quiz me on the step I keep missing",
      },
    ],
    [topicName],
  );

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<TutorMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [aiMode, setAiMode] = useState<
    "server" | "fallback" | "error" | null
  >(null);
  const [tutorError, setTutorError] = useState<string | null>(null);

  const misconceptionLabel = misconception
    ? misconception.status === "recurring"
      ? "Recurring misconception"
      : misconception.status === "improving"
        ? "Improving misconception"
        : misconception.status === "resolved"
          ? "Resolved misconception"
          : "Active misconception"
    : "No active misconception";

  async function getTutorResponse(
    message: string,
    currentMessages: TutorMessage[],
  ): Promise<TutorResult> {
    setTutorError(null);

    if (!tutorApiBase) {
      setAiMode("fallback");
      setTutorError(
        "Tutor API URL is not configured. Using Nomi's deterministic local fallback.",
      );

      return tutorReply(
        message,
        topicName,
        mastery,
        adaptivePractice.difficulty,
        misconception,
      );
    }

    if (!supabase) {
      setAiMode("fallback");
      setTutorError(
        "Supabase client is not configured. Using Nomi's deterministic local fallback.",
      );

      return tutorReply(
        message,
        topicName,
        mastery,
        adaptivePractice.difficulty,
        misconception,
      );
    }

    const { data, error: sessionError } =
      await supabase.auth.getSession();

    const accessToken = data.session?.access_token;

    if (sessionError || !accessToken) {
      setAiMode("fallback");
      setTutorError(
        sessionError?.message ??
          "No authenticated tutor session is available. Using the local fallback.",
      );

      return tutorReply(
        message,
        topicName,
        mastery,
        adaptivePractice.difficulty,
        misconception,
      );
    }

    try {
      const transcript = currentMessages.slice(-12).map((item) => ({
        role: item.role,
        content:
          item.role === "assistant" && item.followUp
            ? `${item.content}\n\nTutor follow-up question: ${item.followUp}`
            : item.content,
      }));

      const response = await fetch(
        `${tutorApiBase}/api/mobile/tutor`,
        {
          method: "POST",
          headers: {
            authorization: `Bearer ${accessToken}`,
            "content-type": "application/json",
          },
          body: JSON.stringify({
            message,
            transcript,
          }),
        },
      );

      const raw = await response.text();

      let payload: {
        ok?: boolean;
        message?: string;
        followUp?: string | null;
        suggestedAction?: TutorAction;
        error?: string;
      } = {};

      try {
        payload = raw ? JSON.parse(raw) : {};
      } catch {
        setAiMode("fallback");
        setTutorError(
          `Tutor API returned invalid JSON (${response.status}). Using the local fallback.`,
        );

        return tutorReply(
          message,
          topicName,
          mastery,
          adaptivePractice.difficulty,
          misconception,
        );
      }

      if (response.ok && payload.ok && payload.message) {
        setAiMode("server");

        return {
          content: payload.message,
          followUp: payload.followUp,
          suggestedAction: payload.suggestedAction,
        };
      }

      setAiMode("fallback");
      setTutorError(
        payload.error ??
          payload.message ??
          `Tutor API request failed with status ${response.status}. Using the local fallback.`,
      );
    } catch (error) {
      setAiMode("fallback");
      setTutorError(
        error instanceof Error
          ? `${error.message} Using the local fallback.`
          : "Tutor API network request failed. Using the local fallback.",
      );
    }

    return tutorReply(
      message,
      topicName,
      mastery,
      adaptivePractice.difficulty,
      misconception,
    );
  }

  async function send(raw?: string) {
    const message = (raw ?? input).trim();

    if (!message || sending) return;

    const userMessage: TutorMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: message,
    };

    const current = [...messages, userMessage];

    setMessages(current);
    setInput("");
    setSending(true);

    const result = await getTutorResponse(
      message,
      current.slice(0, -1),
    );

    setMessages((items) => [
      ...items,
      {
        id: `a-${Date.now() + 1}`,
        role: "assistant",
        content: result.content,
        followUp: result.followUp,
        suggestedAction: result.suggestedAction,
      },
    ]);

    setSending(false);
  }

  function actionLabel(action: TutorAction) {
    if (action === "practice") return "Try assessed Practice";
    if (action === "review") return "Review the prerequisite";
    if (action === "example") return "Show me an example";
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.screen}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.intro}>
          <View style={styles.introCopy}>
            <Text style={styles.eyebrow}>NOMI</Text>

            <Text style={styles.title}>
              What should we work through?
            </Text>

            <Text style={styles.description}>
              I’m with you, {firstName}. We can unpack something,
              work through an example, or test an idea together.
            </Text>
          </View>

          <NomiMascot
            state="curious"
            size={104}
            style={styles.introMascot}
          />
        </View>

        <View style={styles.contextStrip}>
          <View style={styles.contextTop}>
            <View style={styles.contextCopy}>
              <Text style={styles.cardEyebrow}>CURRENT CONTEXT</Text>
              <Text style={styles.contextTopic}>{topicName}</Text>
            </View>

            <View style={styles.readyPill}>
              <View style={styles.readyDot} />
              <Text style={styles.readyText}>
                {aiMode === "server"
                  ? "AI CONNECTED"
                  : aiMode === "fallback"
                    ? "LOCAL MODE"
                    : "TUTOR READY"}
              </Text>
            </View>
          </View>

          <View style={styles.metrics}>
            <View style={styles.metric}>
              <Text style={styles.metricValue}>{mastery}</Text>
              <Text style={styles.metricLabel}>MASTERY</Text>
            </View>

            <View style={styles.metricDivider} />

            <View style={styles.metric}>
              <Text style={styles.metricValue}>
                {adaptivePractice.difficulty}
              </Text>
              <Text style={styles.metricLabel}>DIFFICULTY</Text>
            </View>

            <View style={styles.metricDivider} />

            <View style={[styles.metric, styles.metricWide]}>
              <Text
                style={styles.misconceptionValue}
                numberOfLines={2}
              >
                {misconceptionLabel}
              </Text>
              <Text style={styles.metricLabel}>NOMI NOTICED</Text>
            </View>
          </View>

          {relevantSession ? (
            <Text style={styles.latestEvidence}>
              Latest assessed Practice · {relevantSession.score}/
              {relevantSession.total} correct · {relevantSession.accuracy}%
              accuracy
            </Text>
          ) : null}

          {tutorError ? (
            <Text style={styles.errorNote}>{tutorError}</Text>
          ) : null}
        </View>

        {messages.length === 0 ? (
          <>
            <View style={styles.sectionHeading}>
              <Text style={styles.sectionLabel}>
                START A CONVERSATION
              </Text>
              <Text style={styles.sectionMeta}>Choose a direction</Text>
            </View>

            <View style={styles.starters}>
              {starters.map((item, index) => (
                <Pressable
                  key={item.title}
                  disabled={sending}
                  onPress={() => void send(item.title)}
                  style={styles.starter}
                >
                  <View style={styles.starterNumber}>
                    <Text style={styles.starterNumberText}>
                      0{index + 1}
                    </Text>
                  </View>

                  <View style={styles.starterCopy}>
                    <Text style={styles.starterEyebrow}>
                      {item.eyebrow}
                    </Text>
                    <Text style={styles.starterText}>
                      {item.title}
                    </Text>
                  </View>

                  <AppIcon
  name="chevron-right"
  size={16}
  color={colors.primaryPurple}
/>
                </Pressable>
              ))}
            </View>
          </>
        ) : (
          <View style={styles.thread}>
            <View style={styles.threadHeader}>
              <View>
                <Text style={styles.sectionLabel}>CONVERSATION</Text>
                <Text style={styles.threadTopic}>{topicName}</Text>
              </View>

              <NomiMascot
                state={sending ? "thinking" : "encouraging"}
                size={58}
              />
            </View>

            {messages.map((message) => (
              <View
                key={message.id}
                style={[
                  styles.messageRow,
                  message.role === "user" && styles.messageRowUser,
                ]}
              >
                {message.role === "assistant" ? (
                  <View style={styles.nomiAvatar}>
                    <NomiMascot state="encouraging" size={42} />
                  </View>
                ) : null}

                <View
                  style={[
                    styles.bubble,
                    message.role === "user"
                      ? styles.userBubble
                      : styles.nomiBubble,
                  ]}
                >
                  <Text
                    style={[
                      styles.bubbleLabel,
                      message.role === "user" &&
                        styles.userBubbleLabel,
                    ]}
                  >
                    {message.role === "user" ? "YOU" : "NOMI"}
                  </Text>

                  <Text
                    style={[
                      styles.bubbleText,
                      message.role === "user" &&
                        styles.userBubbleText,
                    ]}
                  >
                    {message.content}
                  </Text>

                  {message.role === "assistant" &&
                  message.followUp ? (
                    <Pressable
                      onPress={() => void send(message.followUp!)}
                      style={styles.followUp}
                    >
                      <Text style={styles.followUpLabel}>
                        KEEP GOING
                      </Text>
                      <Text style={styles.followUpText}>
                        {message.followUp}
                      </Text>
                    </Pressable>
                  ) : null}

                  {message.role === "assistant" &&
                  message.suggestedAction &&
                  message.suggestedAction !== "none" ? (
                    <Pressable
                      onPress={() =>
                        message.suggestedAction === "practice"
                          ? router.push(topicId ? { pathname: "/(tabs)/practice", params: { topicId, topicName } } : "/(tabs)/practice")
                          : void send(
                              message.suggestedAction === "review"
                                ? "Help me review the prerequisite first"
                                : "Show me a worked example",
                            )
                      }
                      style={styles.actionChip}
                    >
                      <Text style={styles.actionChipText}>
                        {actionLabel(message.suggestedAction)}
                      </Text>
                    </Pressable>
                  ) : null}
                </View>
              </View>
            ))}

            {sending ? (
              <View style={styles.messageRow}>
                <View style={styles.nomiAvatar}>
                  <NomiMascot state="thinking" size={42} />
                </View>

                <View style={[styles.bubble, styles.nomiBubble]}>
                  <Text style={styles.bubbleLabel}>NOMI</Text>
                  <Text style={styles.thinking}>
                    Thinking with your learner context…
                  </Text>
                </View>
              </View>
            ) : null}
          </View>
        )}

        <View style={styles.composerSection}>
          <View style={styles.composer}>
            <TextInput
              editable={!sending}
              value={input}
              onChangeText={setInput}
              placeholder={`Ask Nomi about ${topicName}...`}
              placeholderTextColor={colors.slate}
              multiline
              style={styles.input}
            />

            <Pressable
              disabled={!input.trim() || sending}
              onPress={() => void send()}
              style={[
                styles.sendButton,
                (!input.trim() || sending) && styles.sendDisabled,
              ]}
            >
              <AppIcon
  name="arrow-up"
  size={18}
  color={colors.white}
/>
            </Pressable>
          </View>

          <Text style={styles.composerHint}>
            Ask for an explanation, example, hint or quick check.
          </Text>
        </View>

        <View style={styles.evidenceBoundary}>
          <View style={styles.boundaryCopy}>
            <Text style={styles.boundaryEyebrow}>
              ASSESSMENT BOUNDARY
            </Text>

            <Text style={styles.boundaryTitle}>
              Conversation helps you learn. Practice measures it.
            </Text>

            <Text style={styles.boundaryBody}>
              Talking with Nomi never changes your mastery score.
              Only assessed Practice becomes learner evidence.
            </Text>
          </View>

          <Pressable
            onPress={() => router.push(topicId ? { pathname: "/(tabs)/practice", params: { topicId, topicName } } : "/(tabs)/practice")}
            style={styles.practiceButton}
          >
            <Text style={styles.practiceButtonText}>
              Go to assessed Practice
            </Text>
          </Pressable>
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

  screen: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: 56,
  },

  intro: {
    minHeight: 190,
    position: "relative",
    overflow: "hidden",
  },

  introCopy: {
    maxWidth: "78%",
    zIndex: 2,
  },

  eyebrow: {
    color: colors.primaryPurple,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.3,
  },

  title: {
    color: colors.ink,
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: -1.1,
    lineHeight: 35,
    marginTop: 8,
  },

  description: {
    color: colors.slate,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 12,
  },

  introMascot: {
    bottom: 4,
    position: "absolute",
    right: -8,
  },

  contextStrip: {
    backgroundColor: colors.lavender,
    borderRadius: 28,
    padding: spacing.lg,
  },

  contextTop: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },

  contextCopy: {
    flex: 1,
  },

  cardEyebrow: {
    color: colors.primaryPurple,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.1,
  },

  contextTopic: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: -0.4,
    marginTop: 5,
  },

  readyPill: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    flexDirection: "row",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 7,
  },

  readyDot: {
    backgroundColor: colors.mint,
    borderRadius: radius.pill,
    height: 7,
    width: 7,
  },

  readyText: {
    color: colors.ink,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.5,
  },

  metrics: {
    alignItems: "stretch",
    flexDirection: "row",
    marginTop: spacing.lg,
  },

  metric: {
    justifyContent: "flex-end",
    minWidth: 58,
  },

  metricWide: {
    flex: 1,
    minWidth: 0,
  },

  metricDivider: {
    backgroundColor: colors.white,
    marginHorizontal: 12,
    width: 1,
  },

  metricValue: {
    color: colors.primaryPurple,
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: -0.7,
  },

  misconceptionValue: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: "900",
    lineHeight: 15,
  },

  metricLabel: {
    color: colors.slate,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.8,
    marginTop: 4,
  },

  latestEvidence: {
    color: colors.slate,
    fontSize: 10,
    lineHeight: 15,
    marginTop: spacing.md,
  },

  errorNote: {
    color: colors.ink,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 6,
  },

  sectionHeading: {
    alignItems: "flex-end",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.xl,
  },

  sectionLabel: {
    color: colors.slate,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.1,
  },

  sectionMeta: {
    color: colors.slate,
    fontSize: 10,
  },

  starters: {
    backgroundColor: colors.white,
    borderRadius: 28,
    marginTop: spacing.sm,
    overflow: "hidden",
    paddingHorizontal: spacing.md,
  },

  starter: {
    alignItems: "center",
    borderBottomColor: colors.stone,
    borderBottomWidth: 1,
    flexDirection: "row",
    minHeight: 82,
  },

  starterNumber: {
    alignItems: "center",
    backgroundColor: colors.lavender,
    borderRadius: radius.pill,
    height: 36,
    justifyContent: "center",
    width: 36,
  },

  starterNumberText: {
    color: colors.primaryPurple,
    fontSize: 9,
    fontWeight: "900",
  },

  starterCopy: {
    flex: 1,
    marginLeft: 12,
  },

  starterEyebrow: {
    color: colors.primaryPurple,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.9,
  },

  starterText: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 18,
    marginTop: 3,
  },

  starterArrow: {
    color: colors.primaryPurple,
    fontSize: 20,
    marginLeft: 8,
  },

  thread: {
    marginTop: spacing.xl,
  },

  threadHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },

  threadTopic: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "900",
    marginTop: 4,
  },

  messageRow: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },

  messageRowUser: {
    justifyContent: "flex-end",
  },

  nomiAvatar: {
    alignItems: "center",
    height: 44,
    justifyContent: "center",
    width: 44,
  },

  bubble: {
    borderRadius: 22,
    padding: spacing.md,
  },

  userBubble: {
    backgroundColor: colors.primaryPurple,
    maxWidth: "82%",
  },

  nomiBubble: {
    backgroundColor: colors.white,
    maxWidth: "82%",
  },

  bubbleLabel: {
    color: colors.primaryPurple,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 6,
  },

  userBubbleLabel: {
    color: colors.white,
    opacity: 0.72,
  },

  bubbleText: {
    color: colors.ink,
    fontSize: 14,
    lineHeight: 21,
  },

  userBubbleText: {
    color: colors.white,
  },

  thinking: {
    color: colors.slate,
    fontSize: 13,
    fontStyle: "italic",
    lineHeight: 19,
  },

  followUp: {
    backgroundColor: colors.cream,
    borderRadius: 16,
    marginTop: 12,
    padding: 12,
  },

  followUpLabel: {
    color: colors.primaryPurple,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.8,
  },

  followUpText: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
    marginTop: 4,
  },

  actionChip: {
    alignSelf: "flex-start",
    borderColor: colors.primaryPurple,
    borderRadius: radius.pill,
    borderWidth: 1,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  actionChipText: {
    color: colors.primaryPurple,
    fontSize: 11,
    fontWeight: "900",
  },

  composerSection: {
    marginTop: spacing.md,
  },

  composer: {
    alignItems: "flex-end",
    backgroundColor: colors.white,
    borderRadius: 24,
    flexDirection: "row",
    gap: 8,
    padding: 8,
  },

  input: {
    color: colors.ink,
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    maxHeight: 110,
    minHeight: 48,
    paddingHorizontal: 10,
    paddingVertical: 13,
  },

  sendButton: {
    alignItems: "center",
    backgroundColor: colors.primaryPurple,
    borderRadius: radius.pill,
    height: 44,
    justifyContent: "center",
    width: 44,
  },

  sendDisabled: {
    opacity: 0.25,
  },

  sendText: {
    color: colors.white,
    fontSize: 21,
    fontWeight: "900",
    lineHeight: 23,
  },

  composerHint: {
    color: colors.slate,
    fontSize: 9,
    lineHeight: 14,
    marginTop: 7,
    paddingHorizontal: 4,
  },

  evidenceBoundary: {
    backgroundColor: colors.white,
    borderRadius: 28,
    marginTop: spacing.xl,
    padding: spacing.lg,
  },

  boundaryCopy: {
    paddingHorizontal: 2,
  },

  boundaryEyebrow: {
    color: colors.primaryPurple,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
  },

  boundaryTitle: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: "900",
    lineHeight: 21,
    marginTop: 5,
  },

  boundaryBody: {
    color: colors.slate,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 6,
  },

  practiceButton: {
    alignItems: "center",
    backgroundColor: colors.primaryPurple,
    borderRadius: radius.pill,
    marginTop: spacing.md,
    paddingVertical: 15,
  },

  practiceButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "900",
  },
});