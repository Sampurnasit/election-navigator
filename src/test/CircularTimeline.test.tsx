import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { CircularTimeline } from "../components/CircularTimeline";

// Mock the Lucide icons to avoid rendering issues in tests
vi.mock("lucide-react", async () => {
  const actual = await vi.importActual("lucide-react");
  return {
    ...actual,
    Calendar: () => <div data-testid="icon-calendar" />,
    ChevronLeft: () => <div data-testid="icon-chevron-left" />,
    ChevronRight: () => <div data-testid="icon-chevron-right" />,
    AlertCircle: () => <div data-testid="icon-alert" />,
    X: () => <div data-testid="icon-x" />,
    RotateCw: () => <div data-testid="icon-rotate" />,
  };
});

describe("CircularTimeline Component", () => {
  it("renders the election year", () => {
    render(<CircularTimeline />);
    expect(screen.getByText("2026")).toBeDefined();
  });

  it("renders the initial phase information", () => {
    render(<CircularTimeline />);
    // Assuming the first phase is "Voter Registration" or similar
    expect(screen.getByText(/Phase 1/i)).toBeDefined();
  });

  it("navigates to the next phase when clicking the next button", () => {
    render(<CircularTimeline />);
    const nextButton = screen.getByLabelText("Next phase");
    fireEvent.click(nextButton);
    expect(screen.getByText(/Phase 2/i)).toBeDefined();
  });

  it("shows the consequences modal when clicking the warning button", () => {
    render(<CircularTimeline />);
    const warningButton = screen.getByText(/What if I miss this?/i);
    fireEvent.click(warningButton);
    expect(screen.getByText(/Consequences/i)).toBeDefined();
  });

  it("closes the consequences modal when clicking the close button", () => {
    render(<CircularTimeline />);
    const warningButton = screen.getByText(/What if I miss this?/i);
    fireEvent.click(warningButton);
    
    const closeButton = screen.getByLabelText("Close consequences modal");
    fireEvent.click(closeButton);
    
    expect(screen.queryByText(/Consequences/i)).toBeNull();
  });
});
