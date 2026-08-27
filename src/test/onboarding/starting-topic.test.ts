import { describe, expect, it } from "vitest";
import {
  findStartingTopic,
  type OnboardingTopicNode,
} from "@/domain/onboarding/presentation";

const node = (
  id: string,
  name: string,
  children: OnboardingTopicNode[] = [],
): OnboardingTopicNode => ({ id, name, children });

const mathematics = [
  node("unit-algebra", "Algebra", [
    node("group-quadratic-equations", "Quadratic equations", [
      node("topic-factorisation", "Factorisation"),
      node("topic-completing-the-square", "Completing the square"),
    ]),
  ]),
];

const physics = [
  node("unit-motion", "Motion", [
    node("topic-speed-and-velocity", "Speed and velocity"),
    node("topic-acceleration", "Acceleration"),
  ]),
];

describe("findStartingTopic", () => {
  it("returns the first leaf in sort order with full unit and group context", () => {
    expect(findStartingTopic("Mathematics", mathematics)).toEqual({
      subjectName: "Mathematics",
      unitName: "Algebra",
      groupName: "Quadratic equations",
      topicName: "Factorisation",
    });
  });

  it("returns a unit-level leaf with no group context", () => {
    expect(findStartingTopic("Physics", physics)).toEqual({
      subjectName: "Physics",
      unitName: "Motion",
      groupName: null,
      topicName: "Speed and velocity",
    });
  });

  it("returns null when there are no topics", () => {
    expect(findStartingTopic("Mathematics", [])).toBeNull();
  });

  it("picks the first unit's first leaf when a subject has multiple units", () => {
    expect(
      findStartingTopic("Chemistry", [
        node("unit-atomic-structure", "Atomic structure", [
          node("topic-subatomic-particles", "Subatomic particles"),
        ]),
        node("unit-chemical-reactions", "Chemical reactions", [
          node("topic-balancing-equations", "Balancing equations"),
        ]),
      ]),
    ).toEqual({
      subjectName: "Chemistry",
      unitName: "Atomic structure",
      groupName: null,
      topicName: "Subatomic particles",
    });
  });

  it("never exposes internal ids in its result", () => {
    const text = JSON.stringify(findStartingTopic("Mathematics", mathematics));
    expect(text).not.toContain("unit-algebra");
    expect(text).not.toContain("group-quadratic-equations");
    expect(text).not.toContain("topic-factorisation");
  });
});