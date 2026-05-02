import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { LearningJourney } from "../components/LearningJourney";

describe("LearningJourney Component", () => {
  it("renders chapters", () => {
    render(<LearningJourney onAskAbout={vi.fn()} />);
    expect(screen.getByText(/The Foundation/i)).toBeDefined();
  });

  it("expands chapter on click", () => {
    render(<LearningJourney onAskAbout={vi.fn()} />);
    const chapter = screen.getByText(/The Foundation/i).closest("button");
    if (chapter) fireEvent.click(chapter);
    expect(screen.getByText(/What is a democracy/i)).toBeDefined();
  });
});
