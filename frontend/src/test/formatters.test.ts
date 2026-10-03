import { describe, it, expect } from "vitest";
import { formatINR, formatKm } from "../components/ui";

describe("formatINR", () => {
  it("formats numbers greater than 1 lakh correctly in Indian number format", () => {
    expect(formatINR(100000)).toBe("₹1 lakh");
    expect(formatINR(1500000)).toBe("₹15 lakh");
    expect(formatINR(7450000)).toBe("₹74.5 lakh");
    expect(formatINR(27500000)).toBe("₹275 lakh");
  });

  it("formats numbers under 1 lakh with standard Indian currency comma separators", () => {
    expect(formatINR(50000)).toBe("₹50,000");
    expect(formatINR(999)).toBe("₹999");
    expect(formatINR(0)).toBe("₹0");
  });

  it("handles string input correctly", () => {
    expect(formatINR("1500000")).toBe("₹15 lakh");
    expect(formatINR("45000")).toBe("₹45,000");
  });

  it("gracefully falls back on NaN or invalid strings", () => {
    expect(formatINR("invalid")).toBe("invalid");
  });
});

describe("formatKm", () => {
  it("formats kilometers with Indian locale thousands separator", () => {
    expect(formatKm(15000)).toBe("15,000 km");
    expect(formatKm(120500)).toBe("1,20,500 km");
    expect(formatKm(0)).toBe("0 km");
  });
});
