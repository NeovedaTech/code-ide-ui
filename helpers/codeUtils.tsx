/* eslint-disable @typescript-eslint/no-explicit-any */
import { SubmissionsResponse, TokenList } from "@/types/execution";
import { post } from "./api";
import { EXECUTION_ROUTES } from "@/constants/ApiRoutes";

// Browser-safe Base64 encode/decode
export const encodeBase64 = (str: string) =>
  typeof str === "string" ? btoa(unescape(encodeURIComponent(str))) : "";

const decodeBase64 = (str: string) =>
  typeof str === "string" ? decodeURIComponent(escape(atob(str))) : "";

const getAuthHeaders = () => ({
  "X-Auth-User": process.env.REACT_APP_AUTH_USER || "",
  "X-Auth-Token": process.env.REACT_APP_AUTH_TOKEN || "",
});

export const fetchResultsInBatches = async (tokens: TokenList, problemId: string) => {
  const maxAttempts = 30;
  const delay = 1000;
  const tokenStrings = tokens.map((t) => (typeof t === "string" ? t : t.token));

  // Track which tokens are still pending
  const pendingTokens = new Set(tokenStrings);
  const results = new Map<string, any>();

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (pendingTokens.size === 0) break; // All done early

    try {
      const res = await post<SubmissionsResponse>(
        `${EXECUTION_ROUTES.GET_OUTPUT}`,
        { tokenStrings: Array.from(pendingTokens), problemId: problemId },
        {
          headers: getAuthHeaders(),
        },
      );

      // Process results and update pending tokens
      res.submissions.forEach((r: any, idx: number) => {
        const token = Array.from(pendingTokens)[idx];

        if ([3, 4, 5, 6, 11].includes(r.status?.id)) {
          // Status is complete
          results.set(token, {
            stdin: r.stdin ? decodeBase64(r.stdin).trim() : "",
            stdout: r.stdout ? decodeBase64(r.stdout).trim() : "",
            stderr: r.stderr ? decodeBase64(r.stderr).trim() : "",
            compile_error: r.compile_output
              ? decodeBase64(r.compile_output).trim()
              : "",
            time: r.time || "0",
            memory: r.memory || "0",
            status: r.status,
          });
          pendingTokens.delete(token);
        }
      });

      if (pendingTokens.size === 0) {
        return tokenStrings.map((t) => results.get(t)!);
      }

      await new Promise((resolve) => setTimeout(resolve, delay));
    } catch (err) {
      console.error("Batch fetch error:", err);
      // Return partial results + errors for pending tokens
      return tokenStrings.map((t) =>
        results.get(t) || {
          stdout: "",
          stderr: "Failed to fetch result.",
          compile_error: "",
          time: "0",
          memory: "0",
          status: { id: -1, description: "Fetch error" },
        }
      );
    }
  }

  // Timeout: return results for completed + timeout for pending
  return tokenStrings.map((t) =>
    results.get(t) || {
      stdout: "",
      stderr: "Timed out.",
      compile_error: "",
      time: "0",
      memory: "0",
      status: { id: -2, description: "Timed out" },
    }
  );
};


// ```
// ## Key improvements:

// - **Tracks completed results separately** so partial results don't timeout
// - **Only retries pending tokens** instead of all tokens
// - **Uses environment variables** for credentials
// - **Returns as soon as all results are ready** instead of waiting for the full timeout
// REACT_APP_AUTH_USER=your_user_token
// REACT_APP_AUTH_TOKEN=your_auth_token
// ```