// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import PublicNotFound from "@/app/page-not-found/page";
import NotFound, { metadata } from "@/app/not-found";

describe("NotFound", () => {
  it("uses Curious Nomi and a clear route back to home", () => {
    const { container, getByRole } = render(<NotFound />);

    expect(getByRole("heading", { level: 1, name: "Hmm, this page wandered off." })).toBeInTheDocument();
    expect(getByRole("link", { name: "Go home" })).toHaveAttribute("href", "/");
    expect(container.querySelector("img[data-state]")).toHaveAttribute("data-state", "curious");
    expect(container.querySelector("img[data-state]")).toHaveAttribute("width", "180");
  });

  it("keeps Back isolated to browser history", () => {
    const back = vi.spyOn(window.history, "back");
    const { getByRole } = render(<NotFound />);

    fireEvent.click(getByRole("button", { name: "Go back" }));
    expect(back).toHaveBeenCalledOnce();
    back.mockRestore();
  });

  it("sets a route-specific not-found title", () => {
    expect(metadata.title).toBe("Page not found");
  });

  it("exposes the same branded experience at the public /page-not-found route", () => {
    const { getByRole } = render(<PublicNotFound />);

    expect(getByRole("link", { name: "Go home" })).toHaveAttribute("href", "/");
  });
});
