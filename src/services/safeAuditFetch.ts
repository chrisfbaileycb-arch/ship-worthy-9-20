export interface SafeFetchResponse<T> {
  data: T | null;
  isFallback: boolean;
  error?: string;
  diagnostic?: string;
}

export async function safeAuditFetch<T>(
  url: string,
  options: RequestInit = {},
  offlineFallbackGenerator?: () => T
): Promise<SafeFetchResponse<T>> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3-second rapid timeout for instant fallback

    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const json = await response.json();
    return { data: json, isFallback: false };
  } catch (err: any) {
    const isNetworkError =
      err.name === "TypeError" || 
      err.name === "AbortError" || 
      err.message?.includes("Failed to fetch");

    const diagnostic = isNetworkError
      ? "Backend Service Unavailable (Check Supabase edge function deployment, server proxy, or CORS headers)."
      : (err.message || "Unknown audit runtime exception.");

    // If a client-side heuristic generator is supplied, run offline mode
    if (offlineFallbackGenerator) {
      return {
        data: offlineFallbackGenerator(),
        isFallback: true,
        diagnostic,
      };
    }

    return {
      data: null,
      isFallback: false,
      error: diagnostic,
    };
  }
}
