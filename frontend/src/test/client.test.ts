import { describe, it, expect, beforeEach, vi } from "vitest";
import { setTokens, getAccessToken, subscribeToAuthChanges, ApiError } from "../lib/api/client";

describe("API Client & Auth Storage", () => {
  beforeEach(() => {
    localStorage.clear();
    setTokens(null);
  });

  it("stores and retrieves access token correctly", () => {
    expect(getAccessToken()).toBeNull();
    setTokens({ access_token: "mock-access-token", refresh_token: "mock-refresh-token" });
    expect(getAccessToken()).toBe("mock-access-token");
  });

  it("clears tokens from storage when set to null", () => {
    setTokens({ access_token: "mock-token", refresh_token: "mock-refresh" });
    expect(getAccessToken()).toBe("mock-token");
    setTokens(null);
    expect(getAccessToken()).toBeNull();
    expect(localStorage.getItem("quantaliez_auto_tokens")).toBeNull();
  });

  it("notifies subscribers when tokens change", () => {
    const callback = vi.fn();
    const unsubscribe = subscribeToAuthChanges(callback);

    setTokens({ access_token: "test-token", refresh_token: "test-refresh" });
    expect(callback).toHaveBeenCalledWith({ access_token: "test-token", refresh_token: "test-refresh" });

    setTokens(null);
    expect(callback).toHaveBeenCalledWith(null);

    unsubscribe();
    setTokens({ access_token: "after-unsubscribe", refresh_token: "test" });
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it("constructs ApiError with correct status and message", () => {
    const error = new ApiError(404, "Vehicle not found");
    expect(error.status).toBe(404);
    expect(error.message).toBe("Vehicle not found");
    expect(error instanceof Error).toBe(true);
  });
});
