import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "./api";
import type {
  AssessmentFilters, AssessmentFormData, ProblemFilters,
  Question, SolutionFilters,
} from "./types";

// ── Query Keys ────────────────────────────────────────────────────────────────
export const adminKeys = {
  metrics:        ["admin", "metrics"]               as const,
  assessments:    (f?: AssessmentFilters) => ["admin", "assessments", f]   as const,
  assessment:     (id: string)           => ["admin", "assessment", id]    as const,
  solutions:      (f?: SolutionFilters)  => ["admin", "solutions", f]      as const,
  solution:       (id: string)           => ["admin", "solution", id]      as const,
  problems:       (f?: ProblemFilters)   => ["admin", "problems", f]       as const,
  problem:        (id: string)           => ["admin", "problem", id]       as const,
  pools:          ["admin", "pools"]                 as const,
  pool:           (id: string)           => ["admin", "pool", id]          as const,
  roles:          ["admin", "roles"]                 as const,
  skills:         ["admin", "skills"]                as const,
  mappings:       ["admin", "mappings"]              as const,
};

// ── Metrics ───────────────────────────────────────────────────────────────────
export const useAdminMetrics = () =>
  useQuery({
    queryKey: adminKeys.metrics,
    queryFn:  () => api.fetchMetrics(),
    select:   (res) => res.data,
  });

// ── Assessments ───────────────────────────────────────────────────────────────
export const useAdminAssessments = (filters?: AssessmentFilters) =>
  useQuery({
    queryKey: adminKeys.assessments(filters),
    queryFn:  () => api.fetchAssessments(filters),
  });

export const useAdminAssessment = (id: string) =>
  useQuery({
    queryKey: adminKeys.assessment(id),
    queryFn:  () => api.fetchAssessmentById(id),
    select:   (res) => res.data,
    enabled:  !!id,
  });

export const useCreateAssessment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AssessmentFormData) => api.createAssessment(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "assessments"] }),
  });
};

export const useUpdateAssessment = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<AssessmentFormData>) => api.updateAssessment(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "assessments"] });
      qc.invalidateQueries({ queryKey: adminKeys.assessment(id) });
    },
  });
};

export const useDeleteAssessment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteAssessment(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "assessments"] }),
  });
};

// ── Solutions ─────────────────────────────────────────────────────────────────
export const useAdminSolutions = (filters?: SolutionFilters) =>
  useQuery({
    queryKey: adminKeys.solutions(filters),
    queryFn:  () => api.fetchSolutions(filters),
  });

export const useAdminSolution = (id: string) =>
  useQuery({
    queryKey: adminKeys.solution(id),
    queryFn:  () => api.fetchSolutionById(id),
    select:   (res) => res.data,
    enabled:  !!id,
  });

export const useAdminProctoringData = (solutionId: string) =>
  useQuery({
    queryKey: ["admin", "proctoring", solutionId],
    queryFn:  () => api.fetchProctoringData(solutionId),
    enabled:  !!solutionId,
    staleTime: 5 * 60_000, // presigned URLs are valid 1h, refetch after 5min
  });

// ── Problems ──────────────────────────────────────────────────────────────────
export const useAdminProblems = (filters?: ProblemFilters) =>
  useQuery({
    queryKey: adminKeys.problems(filters),
    queryFn:  () => api.fetchProblems(filters),
  });

export const useAdminProblem = (id: string) =>
  useQuery({
    queryKey: adminKeys.problem(id),
    queryFn:  () => api.fetchProblemById(id),
    select:   (res) => res.data,
    enabled:  !!id,
  });

export const useCreateProblem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createProblem,
    onSuccess:  () => qc.invalidateQueries({ queryKey: ["admin", "problems"] }),
  });
};

export const useUpdateProblem = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof api.updateProblem>[1]) => api.updateProblem(id, data),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ["admin", "problems"] });
      qc.invalidateQueries({ queryKey: adminKeys.problem(id) });
    },
  });
};

export const useDeleteProblem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deleteProblem,
    onSuccess:  () => qc.invalidateQueries({ queryKey: ["admin", "problems"] }),
  });
};

// ── Question Pools ────────────────────────────────────────────────────────────
export const useAdminPools = () =>
  useQuery({
    queryKey: adminKeys.pools,
    queryFn:  () => api.fetchPools(),
    select:   (res) => res.data,
  });

export const useAdminPool = (id: string) =>
  useQuery({
    queryKey: adminKeys.pool(id),
    queryFn:  () => api.fetchPoolById(id),
    select:   (res) => res.data,
    enabled:  !!id,
  });

export const useCreatePool = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createPool,
    onSuccess:  () => qc.invalidateQueries({ queryKey: adminKeys.pools }),
  });
};

export const useDeletePool = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deletePool,
    onSuccess:  () => qc.invalidateQueries({ queryKey: adminKeys.pools }),
  });
};

export const useAddQuestion = (poolId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (q: Omit<Question, "_id">) => api.addQuestion(poolId, q),
    onSuccess:  () => qc.invalidateQueries({ queryKey: adminKeys.pool(poolId) }),
  });
};

export const useDeleteQuestion = (poolId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (qId: string) => api.deleteQuestion(poolId, qId),
    onSuccess:  () => qc.invalidateQueries({ queryKey: adminKeys.pool(poolId) }),
  });
};

// ── Roles ─────────────────────────────────────────────────────────────────────
export const useAdminRoles = () =>
  useQuery({
    queryKey: adminKeys.roles,
    queryFn:  () => api.fetchRoles(),
    select:   (res) => res.data,
  });

export const useCreateRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createRole,
    onSuccess:  () => qc.invalidateQueries({ queryKey: adminKeys.roles }),
  });
};

export const useDeleteRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deleteRole,
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: adminKeys.roles });
      qc.invalidateQueries({ queryKey: adminKeys.mappings });
    },
  });
};

// ── Skills ────────────────────────────────────────────────────────────────────
export const useAdminSkills = () =>
  useQuery({
    queryKey: adminKeys.skills,
    queryFn:  () => api.fetchSkills(),
    select:   (res) => res.data,
  });

export const useCreateSkill = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createSkill,
    onSuccess:  () => qc.invalidateQueries({ queryKey: adminKeys.skills }),
  });
};

export const useDeleteSkill = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deleteSkill,
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: adminKeys.skills });
      qc.invalidateQueries({ queryKey: adminKeys.mappings });
    },
  });
};

// ── Mappings ──────────────────────────────────────────────────────────────────
export const useAdminMappings = () =>
  useQuery({
    queryKey: adminKeys.mappings,
    queryFn:  () => api.fetchMappings(),
    select:   (res) => res.data,
  });

export const useCreateMapping = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createMapping,
    onSuccess:  () => qc.invalidateQueries({ queryKey: adminKeys.mappings }),
  });
};

export const useDeleteMapping = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deleteMapping,
    onSuccess:  () => qc.invalidateQueries({ queryKey: adminKeys.mappings }),
  });
};
