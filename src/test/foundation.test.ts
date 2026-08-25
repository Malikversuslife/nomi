import { describe, expect, it } from "vitest";

describe("foundation", () => {
  it("keeps the initial application name stable", () => {
    expect("Nomi").toBe("Nomi");
  });
});
