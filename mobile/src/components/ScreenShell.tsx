import type { PropsWithChildren } from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";

import { colors, spacing } from "@/theme/tokens";

type ScreenShellProps = PropsWithChildren<{
  eyebrow?: string;
  title: string;
  description: string;
}>;

export function ScreenShell({ eyebrow, title, description, children }: ScreenShellProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.cream },
  container: { flex: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.xl },
  eyebrow: {
    color: colors.primaryPurple,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1.2,
    marginBottom: spacing.sm,
    textTransform: "uppercase",
  },
  title: { color: colors.ink, fontSize: 36, fontWeight: "700", lineHeight: 40 },
  description: {
    color: colors.slate,
    fontSize: 17,
    lineHeight: 25,
    marginTop: spacing.md,
    maxWidth: 440,
  },
});
