import { describe, expect, it } from "vitest";
import { parseMathExpression } from "@/components/practice/math-text";

describe("parseMathExpression", () => {
  it("renders a careted exponent as a superscript", () => {
    expect(parseMathExpression("x^2 + 5x + 6")).toEqual([
      { type: "text", value: "x" },
      { type: "sup", value: "2" },
      { type: "text", value: " + 5x + 6" },
    ]);
  });

  it("supports braced exponents", () => {
    expect(parseMathExpression("x^{2} + 3")).toEqual([
      { type: "text", value: "x" },
      { type: "sup", value: "2" },
      { type: "text", value: " + 3" },
    ]);
  });

  it("handles a caret without a following token as literal text", () => {
    expect(parseMathExpression("x^ + y")).toEqual([{ type: "text", value: "x^ + y" }]);
  });

  it("passes plain text through unchanged", () => {
    expect(parseMathExpression("Factorise the quadratic.")).toEqual([
      { type: "text", value: "Factorise the quadratic." },
    ]);
  });

  it("supports multiple exponents", () => {
    expect(parseMathExpression("x^2 + y^2")).toEqual([
      { type: "text", value: "x" },
      { type: "sup", value: "2" },
      { type: "text", value: " + y" },
      { type: "sup", value: "2" },
    ]);
  });
});