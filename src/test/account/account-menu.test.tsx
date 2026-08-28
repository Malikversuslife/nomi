// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";
vi.mock("server-only", () => ({}));

import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { AccountMenu } from "@/components/account/account-menu";

function openMenu() {
  const trigger = screen.getByRole("button", { name: "Account menu for Ada Lovelace" });
  fireEvent.click(trigger);
  return trigger;
}

describe("AccountMenu", () => {
  it("starts closed with the right accessibility state", () => {
    render(<AccountMenu name="Ada Lovelace" email="ada@example.com" />);

    const trigger = screen.getByRole("button", { name: "Account menu for Ada Lovelace" });
    expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("opens to Profile, Notifications, Settings and Sign out", () => {
    render(<AccountMenu name="Ada Lovelace" email="ada@example.com" />);
    const trigger = openMenu();

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Profile" })).toHaveAttribute(
      "href",
      "/profile",
    );
    expect(screen.getByRole("menuitem", { name: "Notifications" })).toHaveAttribute(
      "href",
      "/notifications",
    );
    expect(screen.getByRole("menuitem", { name: "Settings" })).toHaveAttribute(
      "href",
      "/settings",
    );

    const signOut = screen.getByRole("menuitem", { name: "Sign out" });
    expect(signOut.tagName.toLowerCase()).toBe("button");
    expect(signOut).toHaveAttribute("type", "submit");
  });

  it("shows name and email on the sidebar trigger", () => {
    render(<AccountMenu name="Ada Lovelace" email="ada@example.com" />);

    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
    expect(screen.getByText("ada@example.com")).toBeInTheDocument();
  });

  it("shows an avatar-only compact trigger on mobile", () => {
    render(<AccountMenu name="Ada Lovelace" email="ada@example.com" compact />);

    const trigger = screen.getByRole("button", { name: "Account menu for Ada Lovelace" });
    expect(trigger).toBeInTheDocument();
    expect(screen.queryByText("ada@example.com")).not.toBeInTheDocument();
  });

  it("closes on Escape and returns focus to the trigger", () => {
    render(<AccountMenu name="Ada Lovelace" email="ada@example.com" />);
    openMenu();

    fireEvent.keyDown(document, { key: "Escape" });

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Account menu for Ada Lovelace" }),
    ).toHaveFocus();
  });

  it("closes after choosing a menu item", () => {
    render(<AccountMenu name="Ada Lovelace" email="ada@example.com" />);
    openMenu();

    fireEvent.click(screen.getByRole("menuitem", { name: "Profile" }));

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("closes on outside pointer interaction", () => {
    render(<AccountMenu name="Ada Lovelace" email="ada@example.com" />);
    openMenu();

    fireEvent.pointerDown(document.body);

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("supports arrow key navigation through the menu", () => {
    render(<AccountMenu name="Ada Lovelace" email="ada@example.com" />);
    openMenu();

    const menu = screen.getByRole("menu");
    expect(screen.getByRole("menuitem", { name: "Profile" })).toHaveFocus();

    fireEvent.keyDown(menu, { key: "ArrowDown" });
    expect(screen.getByRole("menuitem", { name: "Notifications" })).toHaveFocus();

    fireEvent.keyDown(menu, { key: "ArrowDown" });
    expect(screen.getByRole("menuitem", { name: "Settings" })).toHaveFocus();

    fireEvent.keyDown(menu, { key: "ArrowDown" });
    expect(screen.getByRole("menuitem", { name: "Sign out" })).toHaveFocus();

    fireEvent.keyDown(menu, { key: "ArrowUp" });
    expect(screen.getByRole("menuitem", { name: "Settings" })).toHaveFocus();
  });
});