import { ASSESMENT_ROUTES, EXECUTION_ROUTES } from "@/constants/ApiRoutes";
import { get, post, put } from "@/helpers/api";
import {
  ExamSolutionResponse,
  SubmtiSectionResponse,
  codingAnswer,
  quizAnswer,
} from "@/types/assessment";
import { TokenList } from "@/types/execution";

export const getAssesment = async (assessmentId: string, userId: string) => {
  const data = await post<ExamSolutionResponse>(
    `${ASSESMENT_ROUTES.GET_ASSESSMENT_SOLUTION}`,
    {
      userId,
      assessmentId,
    },
  );

  return data;
};

export const syncAssesment = async () => {
  const data = await get<{ serverTime: string }>(
    `${ASSESMENT_ROUTES.GET_SERVER_TIME}`,
  );
  return data;
};

export const startAssessment = async ({
  solutionId,
}: {
  solutionId: string;
}) => {
  const data = await post<{ success: boolean; message: string }>(
    `${ASSESMENT_ROUTES.START_ASSESMENT}`,
    {
      solutionId,
    },
  );
  return data;
};

export const evalCode = async ({
  code,
  language,
  problemId,
}: {
  code: string;
  language: string;
  problemId: string;
}) => {
  const res = await post<TokenList>(`${EXECUTION_ROUTES.SUBMIT_CODE}`, {
    code,
    language,
    problemId,
  });
  return res;
};

export const submitCode = async ({
  code,
  language,
  problemId,
  sectionId,
  solutionId,
}: {
  code: string;
  language: string;
  problemId: string;
  sectionId: string;
  solutionId: string;
}) => {
  const data = await post<TokenList>(
    `${EXECUTION_ROUTES.SUBMIT_CODE}`,
    {
      code,
      language,
      problemId,
      sectionId,
      solutionId,
    },
  );
  return data;
};

export const submitSection = async (formData: SubmtiSectionResponse) => {
  const data = await put<{success: boolean, message: string}>(`${ASSESMENT_ROUTES.SUBMIT_SECTION}`, formData);
  return data;
};
