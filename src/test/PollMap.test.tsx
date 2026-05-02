import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { PollMap } from "../components/PollMap";
import { trackEvent } from "@/integrations/firebase";

// Mock the firebase integration
vi.mock("@/integrations/firebase", () => ({
  trackEvent: vi.fn(),
}));

describe("PollMap Component", () => {
  beforeEach(() => {
    // Mock window.open
    global.window.open = vi.fn();
    vi.clearAllMocks();
  });

  it("renders the locator title and description", () => {
    render(<PollMap />);
    expect(screen.getByText(/Polling Station Locator/i)).toBeDefined();
    expect(screen.getByText(/Find Your Polling Station/i)).toBeDefined();
    expect(screen.getByText(/Search by EPIC/i)).toBeDefined();
  });

  it("triggers redirect and tracking when ECI portal button is clicked", () => {
    render(<PollMap />);
    
    const button = screen.getByText(/Visit Official ECI Portal/i);
    fireEvent.click(button);
    
    expect(trackEvent).toHaveBeenCalledWith("eci_portal_redirect");
    expect(global.window.open).toHaveBeenCalledWith(
      "https://electoralsearch.eci.gov.in/",
      "_blank",
      "noopener,noreferrer"
    );
  });
});

