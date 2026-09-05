import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { NOMI_CHARACTER_ASSETS } from "@/components/nomi/nomi-character";
import { NOMI_LOGO_ASSETS } from "@/components/nomi/nomi-logo";
import { NOMI_WORDMARK_ASSETS } from "@/components/nomi/nomi-wordmark";
import { SUBJECT_3D_ASSETS } from "@/components/ui/subject-visual";

describe("Nomi production assets", () => {
  it("ships every mapped mascot, logo, wordmark, and subject source file", () => {
    for (const source of [
      ...Object.values(NOMI_CHARACTER_ASSETS),
      ...Object.values(NOMI_LOGO_ASSETS),
      ...Object.values(NOMI_WORDMARK_ASSETS),
      ...Object.values(SUBJECT_3D_ASSETS),
    ]) {
      expect(existsSync(join(process.cwd(), "public", source))).toBe(true);
    }
  });

  it("uses local extracted subject PNGs rather than a source sheet or external asset URL", () => {
    const subjectVisual = readFileSync(
      join(process.cwd(), "src/components/ui/subject-visual.tsx"),
      "utf8",
    );

    expect(subjectVisual).not.toContain("Subject 3D Icons.png");
    expect(subjectVisual).not.toMatch(/icons8|https?:\/\//i);
  });

  it("keeps the character lab on the production asset map, not geometry approximations", () => {
    const lab = readFileSync(join(process.cwd(), "src/app/character-lab/page.tsx"), "utf8");

    expect(lab).toContain("NOMI_CHARACTER_ASSETS");
    expect(lab).not.toContain("bodyPath");
    expect(lab).not.toContain("geometryForState");
    expect(lab).not.toContain("NomiMark");
  });

  it("removes legacy placeholder implementations after migration", () => {
    expect(existsSync(join(process.cwd(), "src/components/nomi/nomi-mark.tsx"))).toBe(false);
    expect(existsSync(join(process.cwd(), "src/components/nomi/nomi-mascot.tsx"))).toBe(false);
  });

  it("references generated PNG web identity assets instead of placeholder SVG icons", () => {
    const layout = readFileSync(join(process.cwd(), "src/app/layout.tsx"), "utf8");
    const manifest = JSON.parse(readFileSync(join(process.cwd(), "public/manifest.webmanifest"), "utf8")) as {
      icons: { src: string; type: string }[];
    };

    expect(layout).toContain("/icons/icon-16.png");
    expect(layout).toContain("/brand/nomi/social/nomi-site-preview.png");
    expect(layout).toContain('default: "Nomi | Adaptive AI Learning Companion"');
    expect(layout).toContain('siteName: "Nomi"');
    expect(layout).toContain('card: "summary_large_image"');
    expect(layout).not.toContain("/icons/icon.svg");
    expect(layout).not.toContain("/icons/apple-touch-icon.svg");
    expect(existsSync(join(process.cwd(), "public/brand/nomi/social/nomi-site-preview.png"))).toBe(true);

    for (const icon of manifest.icons) {
      expect(icon.type).toBe("image/png");
      expect(existsSync(join(process.cwd(), "public", icon.src))).toBe(true);
    }
  });
});
