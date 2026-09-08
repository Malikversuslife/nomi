import { Pressable, StyleSheet, Text, View } from "react-native";

import { ScreenShell } from "@/components/ScreenShell";
import { colors, radius, spacing } from "@/theme/tokens";

export default function HomeScreen() {
  return (
    <ScreenShell
      eyebrow="Nomi"
      title="Ready when you are."
      description="Pick up exactly where you left off, with the next useful step already waiting."
    >
      <View style={styles.card}>
        <Text style={styles.label}>Continue learning</Text>
        <Text style={styles.topic}>Factorisation</Text>
        <Text style={styles.meta}>Mathematics · about 8 min</Text>
        <Pressable style={styles.button} accessibilityRole="button">
          <Text style={styles.buttonText}>Continue</Text>
        </Pressable>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    marginTop: spacing.xl,
    padding: spacing.lg,
  },
  label: { color: colors.slate, fontSize: 14, fontWeight: "600" },
  topic: { color: colors.ink, fontSize: 26, fontWeight: "700", marginTop: spacing.sm },
  meta: { color: colors.slate, fontSize: 15, marginTop: spacing.sm },
  button: {
    alignItems: "center",
    backgroundColor: colors.primaryPurple,
    borderRadius: radius.pill,
    marginTop: spacing.lg,
    paddingVertical: 15,
  },
  buttonText: { color: colors.white, fontSize: 16, fontWeight: "700" },
});
