export type MathSegment = { type: "text"; value: string } | { type: "sup"; value: string };

const WORD_CHAR = /[A-Za-z0-9]/;

export function parseMathExpression(input: string): MathSegment[] {
  if (!input.includes("^")) {
    return [{ type: "text", value: input }];
  }

  const segments: MathSegment[] = [];
  let buffer = "";
  let index = 0;

  while (index < input.length) {
    const char = input[index];

    if (char === "^") {
      if (buffer) {
        segments.push({ type: "text", value: buffer });
        buffer = "";
      }

      index += 1;
      let sup = "";

      if (input[index] === "{") {
        index += 1;
        while (index < input.length && input[index] !== "}") {
          sup += input[index];
          index += 1;
        }
        index += 1;
      } else {
        while (index < input.length && WORD_CHAR.test(input[index])) {
          sup += input[index];
          index += 1;
        }
      }

      if (sup) {
        segments.push({ type: "sup", value: sup });
      } else {
        buffer += "^";
      }
    } else {
      buffer += char;
      index += 1;
    }
  }

  if (buffer) {
    segments.push({ type: "text", value: buffer });
  }

  const merged: MathSegment[] = [];
  for (const segment of segments) {
    const last = merged[merged.length - 1];
    if (segment.type === "text" && last && last.type === "text") {
      last.value += segment.value;
    } else {
      merged.push(segment);
    }
  }

  return merged;
}

export function MathText({ text, className }: { text: string; className?: string }) {
  const segments = parseMathExpression(text);

  return (
    <span className={className}>
      {segments.map((segment, index) =>
        segment.type === "sup" ? (
          <sup key={index}>{segment.value}</sup>
        ) : (
          <span key={index}>{segment.value}</span>
        ),
      )}
    </span>
  );
}