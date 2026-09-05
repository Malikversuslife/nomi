// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  NOMI_CHARACTER_ASSETS,
  NOMI_CHARACTER_SIZES,
  NOMI_CHARACTER_STATES,
  NomiCharacter,
  characterAssetForState,
  characterStateForAsset,
  type NomiCharacterState,
} from "@/components/nomi/nomi-character";

describe("NomiCharacter", () => {
  it("maps every canonical mood to one approved production image", () => {
    expect(NOMI_CHARACTER_STATES).toHaveLength(8);

    for (const state of NOMI_CHARACTER_STATES) {
      expect(NOMI_CHARACTER_ASSETS[state]).toBe(`/brand/nomi/mascot/${state}.png`);
      expect(characterAssetForState(state)).toBe(NOMI_CHARACTER_ASSETS[state]);
    }
  });

  it("falls back to neutral when an integration input is unknown", () => {
    expect(characterStateForAsset("unknown")).toBe("neutral");
    expect(characterAssetForState("unknown")).toBe(NOMI_CHARACTER_ASSETS.neutral);
  });

  it("renders a real image for every valid state and never a reconstructed SVG", () => {
    for (const state of NOMI_CHARACTER_STATES) {
      cleanup();
      const { container } = render(<NomiCharacter state={state} size="lg" />);
      const image = container.querySelector("img");

      expect(image).toHaveAttribute("src", NOMI_CHARACTER_ASSETS[state]);
      expect(image).toHaveAttribute("data-state", state);
      expect(container.querySelector("svg")).toBeNull();
    }
  });

  it("keeps typed sizes and numeric dimensions as rendering controls", () => {
    const expectedPx: Record<(typeof NOMI_CHARACTER_SIZES)[number], number> = {
      xs: 24,
      sm: 32,
      md: 40,
      lg: 64,
      xl: 80,
      hero: 128,
    };

    for (const size of NOMI_CHARACTER_SIZES) {
      cleanup();
      const { container } = render(<NomiCharacter size={size} />);
      expect(container.querySelector("img")).toHaveAttribute("width", String(expectedPx[size]));
      expect(container.querySelector("img")).toHaveAttribute("height", String(expectedPx[size]));
    }

    cleanup();
    const numeric = render(<NomiCharacter size={96} />);
    expect(numeric.container.querySelector("img")).toHaveAttribute("width", "96");
  });

  it("uses empty alt text when decorative and a concise alt when meaningful", () => {
    const { container } = render(<NomiCharacter state="thinking" />);
    expect(container.querySelector("img")).toHaveAttribute("alt", "");
    expect(container.querySelector("img")).toHaveAttribute("aria-hidden", "true");

    cleanup();
    const labelled = render(<NomiCharacter state="thinking" label="Nomi is thinking" />);
    expect(labelled.container.querySelector("img")).toHaveAttribute("alt", "Nomi is thinking");
    expect(labelled.container.querySelector("img")).not.toHaveAttribute("aria-hidden");
  });

  it("preserves the surface API without manually recoloring source artwork", () => {
    const { container } = render(<NomiCharacter state="celebrating" surface="brand" />);
    expect(container.querySelector("img")).toHaveAttribute("data-surface", "brand");
    expect(container.querySelector("img")).toHaveAttribute(
      "src",
      NOMI_CHARACTER_ASSETS.celebrating,
    );
  });

  it("keeps className and unknown typed state fallback behavior", () => {
    const { container } = render(
      <NomiCharacter state={"boosted" as NomiCharacterState} className="mx-auto shrink-0" />,
    );
    const image = container.querySelector("img");

    expect(image).toHaveClass("mx-auto", "shrink-0");
    expect(image).toHaveAttribute("data-state", "neutral");
  });
});
