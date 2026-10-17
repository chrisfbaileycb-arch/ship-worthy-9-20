import { GoogleGenAI } from "@google/genai";
import type { Request, Response } from "express";

// Bring your own key.
//
// Model-backed routes run on the visitor's Gemini key, sent with each request in a header and used
// for that one call. The server never reads a model key from its environment, never stores one, and
// never logs one, so there is no operator key for anyone to spend. A request with no key is refused
// outright: it is not answered with a canned report, because a report nobody analysed is worse than
// no report.

export const USER_KEY_HEADER = "x-user-gemini-key";

export const KEY_REQUIRED_CODE = "KEY_REQUIRED";
export const KEY_INVALID_CODE = "KEY_INVALID";
export const MODEL_ERROR_CODE = "MODEL_ERROR";

type HeaderBag = Record<string, string | string[] | undefined>;

/** The visitor's key from the request headers, or null if absent or not shaped like a key. */
export function readUserKey(headers: HeaderBag): string | null {
  const raw = headers[USER_KEY_HEADER];
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (typeof value !== "string") return null;
  const key = value.trim();
  if (key.length < 16 || key.length > 256 || /\s/.test(key)) return null;
  return key;
}

/** A Gemini client bound to this request's key, or null when the request carries none. */
export function geminiClientFor(req: Request): GoogleGenAI | null {
  const apiKey = readUserKey(req.headers);
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey, httpOptions: { headers: { "User-Agent": "aistudio-build" } } });
}

export function rejectMissingKey(res: Response): void {
  res.setHeader("Cache-Control", "no-store");
  res.status(401).json({
    error: "This analysis runs on your own Gemini API key. Add it in the key field at the top of the page; it stays in this tab's memory and is never stored.",
    code: KEY_REQUIRED_CODE,
  });
}

/** Does a provider error mean the key itself was refused, rather than the service being unwell? */
export function isKeyRejection(err: any): boolean {
  const status = err?.status ?? err?.code ?? err?.error?.code;
  const message = String(err?.message ?? err ?? "");
  return (
    status === 401 ||
    status === 403 ||
    /API key not valid|API_KEY_INVALID|PERMISSION_DENIED|UNAUTHENTICATED/i.test(message)
  );
}

/** Report a failed model call as what it was. Never substitutes made-up output for a failure. */
export function rejectModelFailure(res: Response, err: any): void {
  res.setHeader("Cache-Control", "no-store");
  if (isKeyRejection(err)) {
    res.status(401).json({
      error: "Google rejected the API key you supplied. Check it, or create a new one in Google AI Studio.",
      code: KEY_INVALID_CODE,
    });
    return;
  }
  const detail = String(err?.message ?? err ?? "unknown error").replace(/\s+/g, " ").slice(0, 300);
  res.status(502).json({ error: `The model request failed: ${detail}`, code: MODEL_ERROR_CODE });
}
