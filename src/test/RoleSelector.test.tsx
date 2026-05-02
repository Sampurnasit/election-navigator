import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { RoleSelector } from "../components/RoleSelector";

describe("RoleSelector Component", () => {
  it("renders role options", () => {
    render(<RoleSelector active={null} onChange={vi.fn()} />);
    expect(screen.getByText(/First-Time Voter/i)).toBeDefined();
    expect(screen.getByText(/Veteran Voter/i)).toBeDefined();
  });

  it("calls onChange when a role is clicked", () => {
    const handleChange = vi.fn();
    render(<RoleSelector active={null} onChange={handleChange} />);
    
    const roleBtn = screen.getByText(/First-Time Voter/i).closest("button");
    if (roleBtn) fireEvent.click(roleBtn);
    
    expect(handleChange).toHaveBeenCalledWith("first-time");
  });
});
