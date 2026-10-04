import type { TutorResponse } from "./types";

/** Keep web's offline replies aligned with the mobile tutor's local mode. */
export function fallbackTutorReply(message: string, topicName: string, mastery = 0, difficulty = 1): TutorResponse {
  const topic = topicName.toLowerCase();
  const context = `Your current ${topicName} mastery is ${mastery}/100 at difficulty ${difficulty}.`;
  const isFactorisation = topic.includes("factor") || topic.includes("quadratic");
  const example = topic.includes("completing")
    ? "Take x² + 6x + 5. Half of 6 is 3, so build (x + 3)² = x² + 6x + 9. Because we added 9 instead of 5, subtract 4: x² + 6x + 5 = (x + 3)² - 4."
    : topic.includes("quadratic formula")
      ? "For x² - 5x + 6 = 0, a = 1, b = -5 and c = 6. The discriminant is 25 - 24 = 1, so x = (5 ± 1) / 2. The roots are 2 and 3."
      : isFactorisation
        ? "Take x² + 5x + 6. Look for two numbers that multiply to 6 and add to 5: 2 and 3. So x² + 5x + 6 = (x + 2)(x + 3)."
        : `Tell me the specific ${topicName} step that feels unclear, and we can work through it together.`;
  const text = message.toLowerCase();
  if (text.includes("quiz") || text.includes("question") || text.includes("test")) {
    const question = topic.includes("completing")
      ? "Quick check: rewrite x² + 8x + 7 in completed-square form."
      : topic.includes("quadratic formula")
        ? "Quick check: for 2x² + 3x - 2 = 0, what is the discriminant?"
        : isFactorisation ? "Quick check: factorise x² + 7x + 10 completely." : `Quick check: what is the first step you would use for ${topicName}?`;
    return { message: `${context}\n\n${question}`, followUp: "What would your first step be?", suggestedAction: "none" };
  }
  return {
    message: `${context}\n\n${example}`,
    followUp: text.includes("example") ? "Want to try one yourself?" : "Want an example or a quick check?",
    suggestedAction: text.includes("example") ? "practice" : "example",
  };
}
