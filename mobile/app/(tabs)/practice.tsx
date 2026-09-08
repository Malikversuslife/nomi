import { useMemo, useState } from "react";
import { Image, Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";

import { usePracticeProgress } from "@/progress/PracticeProgressContext";
import { colors, radius, spacing } from "@/theme/tokens";

const mascotBase =
  "https://raw.githubusercontent.com/Malikversuslife/nomi/main/public/brand/nomi/mascot";

type Question = {
  expression: string;
  answers: string[];
  correctAnswer: string;
  explanation: string;
};

const questions: Question[] = [
  {
    expression: "4x + 8",
    answers: ["2(x + 4)", "4(x + 2)", "8(x + 1)", "4(x + 4)"],
    correctAnswer: "4(x + 2)",
    explanation: "4 is common to both 4x and 8, so 4x + 8 = 4(x + 2).",
  },
  {
    expression: "6x + 18",
    answers: ["3(2x + 6)", "6(x + 3)", "6(x + 12)", "2(3x + 18)"],
    correctAnswer: "6(x + 3)",
    explanation: "6 is the greatest common factor of 6x and 18.",
  },
  {
    expression: "10x + 25",
    answers: ["5(2x + 5)", "10(x + 15)", "5(x + 20)", "25(x + 1)"],
    correctAnswer: "5(2x + 5)",
    explanation: "Both terms divide evenly by 5, and no larger common factor works.",
  },
  {
    expression: "12x + 16",
    answers: ["2(6x + 8)", "4(3x + 4)", "8(x + 2)", "4(3x + 12)"],
    correctAnswer: "4(3x + 4)",
    explanation: "The greatest common factor of 12 and 16 is 4.",
  },
  {
    expression: "15x + 20",
    answers: ["5(3x + 4)", "10(1.5x + 2)", "5(3x + 15)", "15(x + 5)"],
    correctAnswer: "5(3x + 4)",
    explanation: "5 is the greatest factor shared by 15x and 20.",
  },
];

export default function PracticeScreen() {
  const { recordSession } = usePracticeProgress();
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [outcomes, setOutcomes] = useState<boolean[]>([]);
  const [complete, setComplete] = useState(false);

  const question = questions[questionIndex];
  const isCorrect = checked && selected === question.correctAnswer;
  const progress = `${((questionIndex + 1) / questions.length) * 100}%` as const;
  const mascotUri = useMemo(() => {
    if (complete) return `${mascotBase}/celebrating.png`;
    if (!checked) return `${mascotBase}/thinking.png`;
    return isCorrect ? `${mascotBase}/encouraging.png` : `${mascotBase}/supportive.png`;
  }, [checked, complete, isCorrect]);

  function handlePrimaryAction() {
    if (!selected) return;

    if (!checked) {
      const correct = selected === question.correctAnswer;
      if (correct) setScore((current) => current + 1);
      setOutcomes((current) => [...current, correct]);
      setChecked(true);
      return;
    }

    if (questionIndex === questions.length - 1) {
      recordSession({
        subject: "Mathematics",
        topic: "Factorisation",
        outcomes,
        difficulty: 3,
      });
      setComplete(true);
      return;
    }

    setQuestionIndex((current) => current + 1);
    setSelected(null);
    setChecked(false);
  }

  function restartSession() {
    setQuestionIndex(0);
    setSelected(null);
    setChecked(false);
    setScore(0);
    setOutcomes([]);
    setComplete(false);
  }

  if (complete) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.completionScreen}>
          <Image source={{ uri: mascotUri }} style={styles.completionMascot} resizeMode="contain" />
          <Text style={styles.completionEyebrow}>PRACTICE COMPLETE</Text>
          <Text style={styles.completionTitle}>Nice work. You finished the set.</Text>
          <Text style={styles.completionScore}>{score} / {questions.length} correct</Text>
          <Text style={styles.completionBody}>
            Your ordered attempts have now been evaluated by Nomi's deterministic mastery engine.
          </Text>
          <Pressable style={[styles.button, styles.completionButton]} onPress={restartSession} accessibilityRole="button">
            <Text style={styles.buttonText}>Practice again</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>MATHEMATICS · FACTORISATION</Text>
            <Text style={styles.progressText}>Question {questionIndex + 1} of {questions.length}</Text>
          </View>
          <Image source={{ uri: mascotUri }} style={styles.mascot} resizeMode="contain" />
        </View>

        <View style={styles.progressTrack}><View style={[styles.progressFill, { width: progress }]} /></View>

        <View style={styles.questionBlock}>
          <Text style={styles.prompt}>Factorise completely:</Text>
          <Text style={styles.expression}>{question.expression}</Text>
          <Text style={styles.helper}>Choose the expression that takes out the greatest common factor.</Text>
        </View>

        <View style={styles.answers}>
          {question.answers.map((answer) => {
            const active = selected === answer;
            const correct = checked && answer === question.correctAnswer;
            const wrong = checked && active && answer !== question.correctAnswer;
            return (
              <Pressable
                key={answer}
                disabled={checked}
                onPress={() => setSelected(answer)}
                style={[styles.answer, active && styles.answerActive, correct && styles.answerCorrect, wrong && styles.answerWrong]}
              >
                <Text style={[styles.answerText, active && styles.answerTextActive]}>{answer}</Text>
              </Pressable>
            );
          })}
        </View>

        {checked ? (
          <View style={[styles.feedback, isCorrect ? styles.feedbackCorrect : styles.feedbackRetry]}>
            <Text style={styles.feedbackEyebrow}>{isCorrect ? "NICE WORK" : "ALMOST"}</Text>
            <Text style={styles.feedbackTitle}>
              {isCorrect ? "You found the greatest common factor." : "Look for the largest number shared by both terms."}
            </Text>
            <Text style={styles.feedbackBody}>
              {isCorrect ? question.explanation : `The correct factorisation is ${question.correctAnswer}. ${question.explanation}`}
            </Text>
          </View>
        ) : null}

        <Pressable
          accessibilityRole="button"
          disabled={!selected}
          onPress={handlePrimaryAction}
          style={[styles.button, !selected && styles.buttonDisabled]}
        >
          <Text style={styles.buttonText}>{checked ? (questionIndex === questions.length - 1 ? "Finish practice" : "Next question") : "Check answer"}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.cream },
  screen: { flex: 1, padding: spacing.lg },
  header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  headerCopy: { flex: 1, paddingRight: spacing.sm },
  eyebrow: { color: colors.primaryPurple, fontSize: 11, fontWeight: "900", letterSpacing: 1.1 },
  progressText: { color: colors.slate, fontSize: 13, marginTop: 5 },
  mascot: { height: 72, width: 72 },
  progressTrack: { backgroundColor: colors.stone, borderRadius: radius.pill, height: 7, marginTop: spacing.md, overflow: "hidden" },
  progressFill: { backgroundColor: colors.mint, borderRadius: radius.pill, height: 7 },
  questionBlock: { marginTop: spacing.xl },
  prompt: { color: colors.slate, fontSize: 16, fontWeight: "600" },
  expression: { color: colors.ink, fontSize: 46, fontWeight: "800", letterSpacing: -1.5, marginTop: spacing.sm },
  helper: { color: colors.slate, fontSize: 14, lineHeight: 21, marginTop: spacing.sm },
  answers: { gap: 10, marginTop: spacing.xl },
  answer: { backgroundColor: colors.white, borderColor: colors.stone, borderRadius: radius.md, borderWidth: 2, paddingHorizontal: spacing.lg, paddingVertical: 17 },
  answerActive: { borderColor: colors.primaryPurple, backgroundColor: colors.lavender },
  answerCorrect: { borderColor: colors.mint },
  answerWrong: { borderColor: colors.pink },
  answerText: { color: colors.ink, fontSize: 18, fontWeight: "700" },
  answerTextActive: { color: colors.primaryPurple },
  feedback: { borderRadius: radius.md, marginTop: spacing.md, padding: spacing.md },
  feedbackCorrect: { backgroundColor: colors.lavender },
  feedbackRetry: { backgroundColor: colors.pink },
  feedbackEyebrow: { color: colors.primaryPurple, fontSize: 10, fontWeight: "900", letterSpacing: 1.1 },
  feedbackTitle: { color: colors.ink, fontSize: 16, fontWeight: "800", lineHeight: 21, marginTop: 5 },
  feedbackBody: { color: colors.slate, fontSize: 13, lineHeight: 19, marginTop: 4 },
  button: { alignItems: "center", backgroundColor: colors.primaryPurple, borderRadius: radius.pill, marginTop: "auto", paddingVertical: 16 },
  completionButton: { alignSelf: "stretch", marginTop: spacing.xl },
  buttonDisabled: { opacity: 0.35 },
  buttonText: { color: colors.white, fontSize: 16, fontWeight: "800" },
  completionScreen: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl },
  completionMascot: { height: 150, width: 150, marginBottom: spacing.lg },
  completionEyebrow: { color: colors.primaryPurple, fontSize: 11, fontWeight: "900", letterSpacing: 1.2 },
  completionTitle: { color: colors.ink, fontSize: 30, fontWeight: "800", lineHeight: 35, marginTop: spacing.sm, textAlign: "center" },
  completionScore: { color: colors.primaryPurple, fontSize: 22, fontWeight: "900", marginTop: spacing.lg },
  completionBody: { color: colors.slate, fontSize: 15, lineHeight: 23, marginTop: spacing.md, textAlign: "center" },
});
