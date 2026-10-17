import { describe, expect, it } from "vitest";
import { isKeyRejection, readUserKey, rejectMissingKey, rejectModelFailure, USER_KEY_HEADER } from "./byok";

function fakeRes() {
  const res: any = { statusCode: 0, body: undefined, headers: {} as Record<string, string> };
  res.setHeader = (name: string, value: string) => {
    res.headers[name] = value;
    return res;
  };
  res.status = (code: number) => {
    res.statusCode = code;
    return res;
  };
  res.json = (body: unknown) => {
    res.body = body;
    return res;
  };
  return res;
}

const KEY = "AIzaSyExampleExampleExampleExample0123";

describe("readUserKey", () => {
  it("returns a trimmed key from the header", () => {
    expect(readUserKey({ [USER_KEY_HEADER]: `  ${KEY}  ` })).toBe(KEY);
  });

  it("uses the first value when the header repeats", () => {
    expect(readUserKey({ [USER_KEY_HEADER]: [KEY, "second-value-that-is-long-enough"] })).toBe(KEY);
  });

  it("treats a missing, short, long or spaced value as no key", () => {
    expect(readUserKey({})).toBeNull();
    expect(readUserKey({ [USER_KEY_HEADER]: "" })).toBeNull();
    expect(readUserKey({ [USER_KEY_HEADER]: "too-short" })).toBeNull();
    expect(readUserKey({ [USER_KEY_HEADER]: "x".repeat(257) })).toBeNull();
    expect(readUserKey({ [USER_KEY_HEADER]: "has a space inside the key" })).toBeNull();
  });

  it("does not look in the environment", () => {
    process.env.GEMINI_API_KEY = KEY;
    try {
      expect(readUserKey({})).toBeNull();
    } finally {
      delete process.env.GEMINI_API_KEY;
    }
  });
});

describe("refusals", () => {
  it("answers a missing key with 401 KEY_REQUIRED and no caching", () => {
    const res = fakeRes();
    rejectMissingKey(res);
    expect(res.statusCode).toBe(401);
    expect(res.body.code).toBe("KEY_REQUIRED");
    expect(res.headers["Cache-Control"]).toBe("no-store");
  });

  it("reports a refused key as KEY_INVALID, not as a service failure", () => {
    const res = fakeRes();
    rejectModelFailure(res, { status: 400, message: "API key not valid. Please pass a valid API key." });
    expect(res.statusCode).toBe(401);
    expect(res.body.code).toBe("KEY_INVALID");
  });

  it("reports any other failure as a 502 carrying the real reason, never a made-up result", () => {
    const res = fakeRes();
    rejectModelFailure(res, new Error("The model is overloaded.\n  Try later."));
    expect(res.statusCode).toBe(502);
    expect(res.body.code).toBe("MODEL_ERROR");
    expect(res.body.error).toContain("The model is overloaded. Try later.");
    expect(Object.keys(res.body).sort()).toEqual(["code", "error"]);
  });

  it("caps how much of a provider error is echoed back", () => {
    const res = fakeRes();
    rejectModelFailure(res, new Error("x".repeat(5000)));
    expect(res.body.error.length).toBeLessThan(400);
  });
});

describe("isKeyRejection", () => {
  it("recognises refusals of the key", () => {
    expect(isKeyRejection({ status: 401 })).toBe(true);
    expect(isKeyRejection({ code: 403 })).toBe(true);
    expect(isKeyRejection({ message: "API_KEY_INVALID" })).toBe(true);
    expect(isKeyRejection({ message: "PERMISSION_DENIED: caller lacks access" })).toBe(true);
  });

  it("does not mistake an overloaded service for a bad key", () => {
    expect(isKeyRejection({ status: 503, message: "UNAVAILABLE: high demand" })).toBe(false);
    expect(isKeyRejection({ status: 429, message: "RESOURCE_EXHAUSTED" })).toBe(false);
    expect(isKeyRejection(new Error("socket hang up"))).toBe(false);
  });
});
