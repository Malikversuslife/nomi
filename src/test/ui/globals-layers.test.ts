import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const globalsCssUrl = new URL("../../app/globals.css", import.meta.url);
const css = await readFile(fileURLToPath(globalsCssUrl), "utf8");

function layerContent(layerName: string): string {
  const marker = `@layer ${layerName} {`;
  const start = css.indexOf(marker);
  if (start < 0) return "";
  let depth = 1;
  let end = -1;
  for (let i = start + marker.length; i < css.length; i++) {
    if (css[i] === "{") depth++;
    else if (css[i] === "}") {
      depth--;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }
  return end < 0 ? "" : css.slice(start + marker.length, end);
}

describe("globals.css cascade layering", () => {
  it("places element resets inside @layer base so Tailwind utilities can win", () => {
    const base = layerContent("base");
    for (const selector of ["body {", "a {", "button,", "html {"]) {
      expect(base, `selector ${selector.trim()} should live inside @layer base`).toContain(selector);
    }
  });

  it("does not emit those element rules unlayered", () => {
    const base = layerContent("base");
    const outside = css.replace(`@layer base {${base}}`, "");
    for (const selector of ["body {", "a {"]) {
      expect(outside.replace(/\/\*[\s\S]*?\*\//g, ""), `stray unlayered ${selector}`).not.toContain(selector);
    }
  });
});