import { useState } from "react";
import { Image, Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing } from "@/theme/tokens";

const mascotUri =
  "https://raw.githubusercontent.com/Malikversuslife/nomi/main/public/brand/nomi/mascot/thinking.png";

const answers = ["2(x + 4)", "4(x + 2)", "8(x + 1)", "4(x + 4)"];
const correctAnswer = "4(x + 2)";

export default function PracticeScreen() {
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  const isCorrect = checked && selected === correctAnswer;

  function handlePrimaryAction() {
    if (!selected) return;
    if (!checked) {
      setChecked(true);
      return;
    }
    setSelected(null);
    setChecked(false);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>MATHEMATICS · FACTORISATION</Text>
            <Text style={styles.progressText}>Question 1 of 5</Text>
          </View>
          <Image source={{ uri: mascotUri }} style={styles.mascot} resizeMode="contain" />
        </View>

        <View style={styles.progressTrack}><View style={styles.progressFill} /></View>

        <View style={styles.questionBlock}>
          <Text style={styles.prompt}>Factorise completely:</Text>
          <Text style={styles.expression}>4x + 8</Text>
          <Text style={styles.helper}>Choose the expression that takes out the greatest common factor.</Text>
        </View>

        <View style={styles.answers}>
          {answers.map((answer) => {
            const active = selected === answer;
            const correct = checked && answer === correctAnswer;
            const wrong = checked && active && answer !== correctAnswer;
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
              {isCorrect ? "You spotted the greatest common factor." : "Look for the largest number shared by both terms."}
            </Text>
            <Text style={styles.feedbackBody}>
              {isCorrect ? "4 is common to both 4x and 8, so 4x + 8 = 4(x + 2)." : "Try dividing both 4x and 8 by the same number first."}
            </Text>
          </View>
        ) : null}

        <Pressable
          accessibilityRole="button"
          disabled={!selected}
          onPress={handlePrimaryAction}
          style={[styles.button, !selected && styles.buttonDisabled]}
        >
          <Text style={styles.buttonText}>{checked ? "Next question" : "Check answer"}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.cream },
  screen: { flex: 1, padding: spacing.lg },
  header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  eyebrow: { color: colors.primaryPurple, fontSize: 11, fontWeight: "900", letterSpacing: 1.1 },
  progressText: { color: colors.slate, fontSize: 13, marginTop: 5 },
  mascot: { height: 72, width: 72 },
  progressTrack: { backgroundColor: colors.stone, borderRadius: radius.pill, height: 7, marginTop: spacing.md, overflow: "hidden" },
  progressFill: { backgroundColor: colors.mint, borderRadius: radius.pill, height: 7, width: "20%" },
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
  buttonDisabled: { opacity: 0.35 },
  buttonText: { color: colors.white, fontSize: 16, fontWeight: "800" },
});
