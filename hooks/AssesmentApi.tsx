import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  evalCode,
  getAssesment,
  startAssessment,
  submitCode,
  submitSection,
  syncAssesment,
} from "./ApiCalls";
import { ExamSolutionResponse } from "@/types/assessment";

export const useGetAssesment = ({
  assessmentId,
  userId,
}: {
  assessmentId: string;
  userId: string;
}) => {
  return useQuery<ExamSolutionResponse>({
    queryKey: ["assesment", assessmentId, userId],
    queryFn: () => getAssesment(assessmentId, userId),
  });
};

export const useServerSync = () => {
  return useQuery<{ serverTime: string }>({
    queryKey: ["serverSync"],
    queryFn: () => syncAssesment(),
  });
};

export const useStartTest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: startAssessment,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["assesment"],
      });
    },
  });
};

export const useRunCode = () => {
  return useMutation({
    mutationFn: evalCode,
    onSuccess: () => {},
  });
};

export const useSubmitCode = () => {
  return useMutation({
    mutationFn: submitCode,
    onSuccess: () => {},
  });
};



export const useSubmitSection = () => {
  return useMutation({
    mutationFn: submitSection,
    onSuccess: () => {},
  });
};