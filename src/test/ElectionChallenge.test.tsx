import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ElectionChallenge } from "../components/ElectionChallenge";

describe("ElectionChallenge Component", () => {
  it("renders the start screen initially", () => {
    render(<ElectionChallenge />);
    expect(screen.getByText(/CIVIC/i)).toBeDefined();
    expect(screen.getByText(/INITIATE CHALLENGE/i)).toBeDefined();
  });

  it("starts the game when clicking initiate", () => {
    render(<ElectionChallenge />);
    const startBtn = screen.getByText(/INITIATE CHALLENGE/i);
    fireEvent.click(startBtn);
    expect(screen.getByText(/Protocol Stage 1/i)).toBeDefined();
  });
});
