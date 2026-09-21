import { safeAuditFetch } from "../services/api";

export async function analyzeHypeClaims(videoOrTextUrl: string, transcriptText?: string) {
  const generateFallbackClaims = () => ({
    verdict: "UNVERIFIED_SOURCE",
    hypeScore: 50,
    discernmentNotes: [
      "Live claims backend function unreachable.",
      "Manual Discernment Required: Review return guarantees, verified bank statements, and licensing boundaries."
    ],
    isHeuristic: true
  });

  const response = await safeAuditFetch(
    "/api/claims/analyze",
    {
      method: "POST",
      body: JSON.stringify({ url: videoOrTextUrl, text: transcriptText }),
    },
    generateFallbackClaims
  );

  return response;
}
