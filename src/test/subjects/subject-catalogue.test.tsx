// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { SubjectCatalogue, type CatalogueSubject } from "@/components/subjects/subject-catalogue";

const subjects: CatalogueSubject[] = [
  { slug: "mathematics", name: "Mathematics", description: "Numbers and algebra.", iconKey: "calculator", field: "Mathematics", searchTerms: ["maths"], availability: "available", artworkKind: "3d", enrolled: true },
  { slug: "physics", name: "Physics", description: "Motion and energy.", iconKey: "atom", field: "Sciences", searchTerms: ["mechanics"], availability: "available", artworkKind: "3d" },
  { slug: "computer-science", name: "Computer Science", description: "Programming and computing.", iconKey: "computer", field: "Computing", searchTerms: ["coding", "ict"], availability: "coming_soon", artworkKind: "icon" },
];

describe("SubjectCatalogue", () => {
  it("finds subjects by aliases and reports empty searches", () => {
    render(<SubjectCatalogue subjects={subjects} selected={null} onSelect={() => {}} />);
    fireEvent.change(screen.getByRole("searchbox", { name: "Search subjects" }), { target: { value: "ICT" } });
    const results = within(screen.getByRole("group", { name: "Browse subjects" }));
    expect(results.getByRole("button", { name: /Computer Science/ })).toBeInTheDocument();
    expect(results.queryByRole("button", { name: /Mathematics/ })).toBeNull();

    fireEvent.change(screen.getByRole("searchbox", { name: "Search subjects" }), { target: { value: "law" } });
    expect(screen.getByText("No subjects match that search.")).toBeInTheDocument();
  });

  it("filters by field and keeps coming-soon subjects discoverable", () => {
    render(<SubjectCatalogue subjects={subjects} selected={null} onSelect={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: "Sciences" }));
    const results = within(screen.getByRole("group", { name: "Browse subjects" }));
    expect(results.getByRole("button", { name: /Physics/ })).toBeInTheDocument();
    expect(results.queryByRole("button", { name: /Mathematics/ })).toBeNull();
  });

  it("prevents unavailable subjects from being selected during onboarding", () => {
    const onSelect = vi.fn();
    render(<SubjectCatalogue subjects={subjects} selected={null} onSelect={onSelect} selectionMode="onboarding" />);
    expect(screen.getByRole("radio", { name: /Computer Science/ })).toBeDisabled();
    fireEvent.click(screen.getByText("Computer Science"));
    expect(onSelect).not.toHaveBeenCalled();
  });
});
