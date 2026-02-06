/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback } from "react";
import axios from "axios";
import { fetchResultsInBatches } from "./codeUtils";
const getLanguageId = (lang: string) => {
  const map = {
    cpp: 54,
    c: 50,
    java: 62,
    python: 71,
  };
  return map[lang as keyof typeof map] || 71;
};

interface Token {
  token: string;
}

interface Tokens {
  tokens: Token[];
}


export const useCodeExecutor = ({
  CODE_EXECUTION_API,
  headers,
}: {
  CODE_EXECUTION_API: string;
  headers: any;
}) => {
  const runTests = useCallback(
    async ({
      code,
      language,
      testCases,
      problemName,
      problemId,
    }: {
      code: string;
      language: string;
      testCases: any[];
      problemName: string;
      problemId: string;
    }) => {
      const results: any[] = [];
      let passedCount = 0,
        totalTime = 0,
        totalMemory = 0;

      try {
        // const submissions = testCases.map(test => ({
        //   source_code: encodeBase64(code),
        //   language_id: getLanguageId(language),
        //   stdin: encodeBase64(test.input),
        //   cpu_time_limit: 5,
        //   memory_limit: 128000
        // }))

        // const submitRes = await axios.post(
        //   `${CODE_EXECUTION_API}/submissions/batch?base64_encoded=true&wait=false`,
        //   { submissions },
        //   { headers }
        // )

        // const tokens = submitRes.data || []

        const res = await axios.post(
          `/api/v1/judge0/eval`,
          {
            code,
            language,
            problemId,
          },
          { withCredentials: true },
        );
        const data = res.data;
        const tokens = data.tokens;
        const outputs = await fetchResultsInBatches(
          tokens,
          problemId
        );

        outputs.forEach((output: any, index: number) => {
          const test = testCases[index];
          const decodedOutput = (output.stdout || "").trim();
          const expectedOutput = test.output.trim();
          const passed = decodedOutput === expectedOutput;

          if (passed) passedCount++;
          totalTime += parseFloat(output.time || 0);
          totalMemory += parseInt(output.memory || 0);

          results.push({
            input: test.input,
            output: decodedOutput,
            expected: expectedOutput,
            passed,
            error: output.stderr || output.compile_error || "",
          });
        });

        const avgTime = totalTime / testCases.length;
        const avgMemory = totalMemory / testCases.length;

        const summary = {
          passed: passedCount,
          failed: testCases.length - passedCount,
          total: testCases.length,
          avgTime: avgTime.toFixed(3),
          avgMemory: avgMemory.toFixed(2),
        };

        // const geminiRes = await axios.post(`${BASE_URL}/api/code/review`, {
        //   sourceCode: code,
        //   problem: problemName
        // }, {withCredentials:true})

        // const review = cleanGeminiResponse(geminiRes.data.data)
        // console.log(results);
        // console.log(review)
        // console.log(summary);
        return { summary, results, review: {} };
      } catch (err) {
        console.error(err);
        return { summary: null, results: [], review: null };
      }
    },
    [CODE_EXECUTION_API, getLanguageId, headers],
  );

  return { runTests };
};

export const evalTokens = async (tokens: Tokens[]) => {
    
    const tokenStrings = tokens.map(t => t.tokens.map(t => t.token).join(","))
};
