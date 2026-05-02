import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn utility", () => {
  it("merges tailwind classes correctly", () => {
    const result = cn("bg-red-500", "p-4", "bg-blue-500");
    // tailwind-merge should favor the last background color
    expect(result).toContain("bg-blue-500");
    expect(result).not.toContain("bg-red-500");
    expect(result).toContain("p-4");
  });

  it("handles conditional classes", () => {
    const isActive = true;
    const isError = false;
    const result = cn(
      "base-class",
      isActive && "active-class",
      isError && "error-class"
    );
    expect(result).toContain("base-class");
    expect(result).toContain("active-class");
    expect(result).not.toContain("error-class");
  });

  it("handles undefined and null inputs", () => {
    const result = cn("class-1", undefined, null, "class-2");
    expect(result).toBe("class-1 class-2");
  });
});
