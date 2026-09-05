// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button, ButtonLink, buttonClasses } from "@/components/ui/button";
import { IconButton, iconButtonClasses } from "@/components/ui/icon-button";

describe("Button variant contract", () => {
  it("primary ships on-primary foreground inside the purple pill", () => {
    const classes = buttonClasses({ variant: "primary" });
    expect(classes).toContain("bg-nomi-purple-600");
    expect(classes).toContain("text-nomi-on-primary");
    expect(classes).toContain("hover:bg-nomi-purple-700");
    expect(classes).toContain("active:bg-nomi-purple-700");
  });

  it("primary disabled stays disabled grey rather than white on purple", () => {
    const classes = buttonClasses({ variant: "primary" });
    expect(classes).toContain("disabled:bg-nomi-disabled-bg");
    expect(classes).toContain("disabled:text-nomi-disabled-text");
  });

  it("secondary is NOT whitened - keeps ink foreground", () => {
    const classes = buttonClasses({ variant: "secondary" });
    expect(classes).toContain("text-nomi-ink");
    expect(classes).not.toContain("text-nomi-on-primary");
  });

  it("rendered native Button carries the primary contract", () => {
    cleanup();
    const { container } = render(<Button>Continue</Button>);
    const el = container.querySelector("button");
    expect(el).toHaveClass("bg-nomi-purple-600");
    expect(el).toHaveClass("text-nomi-on-primary");
    expect(el).toHaveClass("hover:bg-nomi-purple-700");
  });

  it("rendered ButtonLink (anchor) carries the primary contract", () => {
    cleanup();
    const { container } = render(<ButtonLink href="/practice">Continue practice</ButtonLink>);
    const el = container.querySelector("a");
    expect(el).toHaveClass("bg-nomi-purple-600");
    expect(el).toHaveClass("text-nomi-on-primary");
    expect(el).toHaveAttribute("href", "/practice");
  });
});

describe("IconButton variant contract", () => {
  it("primary icon button keeps on-primary foreground", () => {
    cleanup();
    const { container } = render(
      <IconButton variant="primary" aria-label="Continue" />,
    );
    const el = container.querySelector("button");
    expect(el).toHaveClass("bg-nomi-purple-600");
    expect(el).toHaveClass("text-nomi-on-primary");
  });

  it("secondary icon button stays muted rather than whitened", () => {
    const classes = iconButtonClasses("", "secondary");
    expect(classes).toContain("text-nomi-muted");
    expect(classes).not.toContain("text-nomi-on-primary");
  });
});