import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { PollMap } from "../components/PollMap";

// Mock the Google Maps SDK
vi.mock("@react-google-maps/api", () => ({
  GoogleMap: ({ children }: any) => <div data-testid="google-map">{children}</div>,
  useJsApiLoader: () => ({ isLoaded: true }),
  Marker: ({ onClick }: any) => <div data-testid="map-marker" onClick={onClick} />,
}));

// Mock the firebase integration
vi.mock("@/integrations/firebase", () => ({
  trackEvent: vi.fn(),
}));

describe("PollMap Component", () => {
  it("renders the map title", () => {
    render(<PollMap />);
    expect(screen.getByText(/Find Your Polling Station/i)).toBeDefined();
  });

  it("renders markers for polling stations", () => {
    render(<PollMap />);
    const markers = screen.getAllByTestId("map-marker");
    expect(markers.length).toBeGreaterThan(0);
  });

  it("shows details when a marker is clicked", () => {
    render(<PollMap />);
    const markers = screen.getAllByTestId("map-marker");
    fireEvent.click(markers[0]);
    expect(screen.getByText(/Get Directions/i)).toBeDefined();
  });
});
