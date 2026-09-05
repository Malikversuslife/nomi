// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { NOMI_WORDMARK_ASSETS, NomiWordmark } from "@/components/nomi/nomi-wordmark";

describe("NomiWordmark", () => {
  it("uses the extracted approved PNG variants rather than custom SVG paths", () => {
    for (const [variant, source] of Object.entries(NOMI_WORDMARK_ASSETS)) {
      cleanup();
      const { container } = render(
        <NomiWordmark variant={variant as keyof typeof NOMI_WORDMARK_ASSETS} width={160} />,
      );

      expect(container.querySelector("img")).toHaveAttribute("src", source);
      expect(container.querySelector("svg")).toBeNull();
    }
  });

  it("keeps product identity accessible", () => {
    const { container } = render(<NomiWordmark />);
    expect(container.querySelector("img")).toHaveAttribute("alt", "");

    cleanup();
    const labelled = render(<NomiWordmark label="Nomi" />);
    expect(labelled.container.querySelector("img")).toHaveAttribute("alt", "Nomi");
  });
});
