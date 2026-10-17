// Bring your own key, client side.
//
// The visitor's Gemini key lives in this module's memory and nowhere else: not localStorage, not
// sessionStorage, not a cookie, not the URL. Reloading the page forgets it, on purpose. It leaves the
// tab only as a request header on the calls that need a model, and the server uses it for that one
// call without storing or logging it.

export const USER_KEY_HEADER = "x-user-gemini-key";

let userKey = "";
const listeners = new Set<() => void>();

export function setUserKey(key: string): void {
  userKey = key.trim();
  listeners.forEach((listener) => listener());
}

export function getUserKey(): string {
  return userKey;
}

export function hasUserKey(): boolean {
  return userKey.length > 0;
}

export function subscribeUserKey(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Request headers with the visitor's key attached, when they have given one. */
export function withUserKey(headers: Record<string, string> = {}): Record<string, string> {
  return userKey ? { ...headers, [USER_KEY_HEADER]: userKey } : headers;
}

/** The server refused a model call because there was no key, or because Google refused the one sent. */
export class KeyRequiredError extends Error {
  readonly code: "KEY_REQUIRED" | "KEY_INVALID";
  constructor(code: "KEY_REQUIRED" | "KEY_INVALID", message: string) {
    super(message);
    this.name = "KeyRequiredError";
    this.code = code;
  }
}

/** Turn a failed response into the error the user should read, carrying the server's own words. */
export async function responseError(res: Response, fallback: string): Promise<Error> {
  const body = await res.json().catch(() => ({} as { error?: string; code?: string }));
  const message = typeof body?.error === "string" && body.error ? body.error : `${fallback} (HTTP ${res.status})`;
  if (res.status === 401 && (body?.code === "KEY_REQUIRED" || body?.code === "KEY_INVALID")) {
    return new KeyRequiredError(body.code, message);
  }
  return new Error(message);
}
