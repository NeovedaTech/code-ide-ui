import { ASSESMENT_ROUTES } from "@/constants/ApiRoutes";
import { get, post } from "@/helpers/api";
import { ExamSolutionResponse } from "@/types/assessment";

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
  const data = await get<{serverTime: string}>(`${ASSESMENT_ROUTES.GET_SERVER_TIME}`);
  return data;
};

export const startAssessment = async ({
  solutionId,
}: {
  solutionId: string;
}) => {
  const data = await post<{success: boolean, message: string}>(`${ASSESMENT_ROUTES.START_ASSESMENT}`, {
    solutionId,
  });
  return data;
};
