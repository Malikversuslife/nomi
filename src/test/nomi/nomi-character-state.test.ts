import { describe, expect, it } from "vitest";
import { characterStateForIntervention } from "@/components/nomi/nomi-character-state";

describe("characterStateForIntervention", () => {
  it("maps known deterministic interventions to their approved companion states", () => {
    expect(characterStateForIntervention("reinforce")).toBe("reinforcing");
    expect(characterStateForIntervention("simplify")).toBe("supportive");
    expect(characterStateForIntervention("worked_example")).toBe("thinking");
    expect(characterStateForIntervention("increase_challenge")).toBe("challenge");
    expect(characterStateForIntervention("continue")).toBe("encouraging");
  });

  it("does not invent a reaction when there is no recognised intervention", () => {
    expect(characterStateForIntervention(undefined)).toBe("neutral");
    expect(characterStateForIntervention("unknown-engine-value")).toBe("neutral");
  });
});
