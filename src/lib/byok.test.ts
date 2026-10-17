import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getUserKey,
  hasUserKey,
  KeyRequiredError,
  responseError,
  setUserKey,
  subscribeUserKey,
  USER_KEY_HEADER,
  withUserKey,
} from "./byok";

afterEach(() => setUserKey(""));

describe("the in-memory key", () => {
  it("starts empty and sends no header", () => {
    expect(hasUserKey()).toBe(false);
    expect(withUserKey({ "Content-Type": "application/json" })).toEqual({ "Content-Type": "application/json" });
  });

  it("is trimmed, held, and attached as the header once set", () => {
    setUserKey("  AIzaExampleKey0123456789  ");
    expect(getUserKey()).toBe("AIzaExampleKey0123456789");
    expect(withUserKey({ "Content-Type": "application/json" })).toEqual({
      "Content-Type": "application/json",
      [USER_KEY_HEADER]: "AIzaExampleKey0123456789",
    });
  });

  it("notifies subscribers on change and stops after unsubscribe", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeUserKey(listener);
    setUserKey("AIzaExampleKey0123456789");
    setUserKey("");
    expect(listener).toHaveBeenCalledTimes(2);
    unsubscribe();
    setUserKey("again-another-long-key-value");
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it("is never written to browser storage", () => {
    const store: Record<string, string> = {};
    const fake = { setItem: vi.fn((k: string, v: string) => (store[k] = v)), getItem: vi.fn(), removeItem: vi.fn(), clear: vi.fn() };
    vi.stubGlobal("localStorage", fake);
    vi.stubGlobal("sessionStorage", fake);
    try {
      setUserKey("AIzaExampleKey0123456789");
      expect(fake.setItem).not.toHaveBeenCalled();
    } finally {
      vi.unstubAllGlobals();
    }
  });
});

describe("responseError", () => {
  const reply = (status: number, body: unknown) => new Response(typeof body === "string" ? body : JSON.stringify(body), { status });

  it("turns a missing or refused key into a KeyRequiredError carrying the server's words", async () => {
    const missing = await responseError(reply(401, { error: "Add your key.", code: "KEY_REQUIRED" }), "Scan failed");
    expect(missing).toBeInstanceOf(KeyRequiredError);
    expect((missing as KeyRequiredError).code).toBe("KEY_REQUIRED");
    expect(missing.message).toBe("Add your key.");

    const invalid = await responseError(reply(401, { error: "Google said no.", code: "KEY_INVALID" }), "Scan failed");
    expect((invalid as KeyRequiredError).code).toBe("KEY_INVALID");
  });

  it("keeps a model failure as a plain error with the real reason", async () => {
    const err = await responseError(reply(502, { error: "The model request failed: overloaded", code: "MODEL_ERROR" }), "Scan failed");
    expect(err).not.toBeInstanceOf(KeyRequiredError);
    expect(err.message).toBe("The model request failed: overloaded");
  });

  it("falls back to a labelled status when the body is not JSON", async () => {
    const err = await responseError(reply(500, "<html>boom</html>"), "Scan failed");
    expect(err.message).toBe("Scan failed (HTTP 500)");
  });
});
