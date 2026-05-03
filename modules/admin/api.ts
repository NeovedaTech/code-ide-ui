import { get, post, put } from "@/helpers/api";
import { ADMIN_ROUTES, PROCTORING_ROUTES } from "@/constants/ApiRoutes";
import type {
  AdminProctoringData, Assessment, AssessmentFilters, AssessmentFormData,
  DashboardMetrics, PaginatedResponse, Problem, ProblemFilters,
  QuestionPool, Question, Role, RoleSkillMapping, Skill, Solution, SolutionFilters,
} from "./types";

// ── DELETE helper (not in the shared api.ts) ──────────────────────────────────
async function del<T>(path: string): Promise<T> {
  const res = await fetch(path, {
    method: "DELETE",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || "Something went wrong");
  }
  return res.json();
}

// ── Metrics ───────────────────────────────────────────────────────────────────
export const fetchMetrics = () =>
  get<{ success: boolean; data: DashboardMetrics }>(ADMIN_ROUTES.METRICS);

// ── Assessments ───────────────────────────────────────────────────────────────
export const fetchAssessments = (filters?: AssessmentFilters) =>
  get<PaginatedResponse<Assessment>>(ADMIN_ROUTES.ASSESSMENTS, filters as Record<string, unknown>);

export const fetchAssessmentById = (id: string) =>
  get<{ success: boolean; data: Assessment }>(ADMIN_ROUTES.ASSESSMENT_BY_ID(id));

export const createAssessment = (data: AssessmentFormData) =>
  post<{ success: boolean; data: Assessment }>(ADMIN_ROUTES.ASSESSMENTS, data);

export const updateAssessment = (id: string, data: Partial<AssessmentFormData>) =>
  put<{ success: boolean; data: Assessment }>(ADMIN_ROUTES.ASSESSMENT_BY_ID(id), data);

export const deleteAssessment = (id: string) =>
  del<{ success: boolean; message: string }>(ADMIN_ROUTES.ASSESSMENT_BY_ID(id));

// ── Solutions ─────────────────────────────────────────────────────────────────
export const fetchSolutions = (filters?: SolutionFilters) =>
  get<PaginatedResponse<Solution>>(ADMIN_ROUTES.SOLUTIONS, filters as Record<string, unknown>);

export const fetchSolutionById = (id: string) =>
  get<{ success: boolean; data: Solution }>(ADMIN_ROUTES.SOLUTION_BY_ID(id));

export const fetchProctoringData = (solutionId: string) =>
  get<AdminProctoringData>(PROCTORING_ROUTES.ADMIN_DATA(solutionId));

// ── Problems ──────────────────────────────────────────────────────────────────
export const fetchProblems = (filters?: ProblemFilters) =>
  get<PaginatedResponse<Problem>>(ADMIN_ROUTES.PROBLEMS, filters as Record<string, unknown>);

export const fetchProblemById = (id: string) =>
  get<{ success: boolean; data: Problem }>(ADMIN_ROUTES.PROBLEM_BY_ID(id));

export const createProblem = (data: Partial<Problem>) =>
  post<{ success: boolean; data: Problem }>(ADMIN_ROUTES.PROBLEMS, data);

export const updateProblem = (id: string, data: Partial<Problem>) =>
  put<{ success: boolean; data: Problem }>(ADMIN_ROUTES.PROBLEM_BY_ID(id), data);

export const deleteProblem = (id: string) =>
  del<{ success: boolean; message: string }>(ADMIN_ROUTES.PROBLEM_BY_ID(id));

// ── Question Pools ────────────────────────────────────────────────────────────
export const fetchPools = () =>
  get<{ success: boolean; data: QuestionPool[] }>(ADMIN_ROUTES.QUESTION_POOLS);

export const fetchPoolById = (id: string) =>
  get<{ success: boolean; data: QuestionPool }>(ADMIN_ROUTES.POOL_BY_ID(id));

export const createPool = (data: { name: string; questions?: Question[] }) =>
  post<{ success: boolean; data: QuestionPool }>(ADMIN_ROUTES.QUESTION_POOLS, data);

export const updatePool = (id: string, data: Partial<QuestionPool>) =>
  put<{ success: boolean; data: QuestionPool }>(ADMIN_ROUTES.POOL_BY_ID(id), data);

export const deletePool = (id: string) =>
  del<{ success: boolean; message: string }>(ADMIN_ROUTES.POOL_BY_ID(id));

export const addQuestion = (poolId: string, question: Omit<Question, "_id">) =>
  post<{ success: boolean; data: QuestionPool }>(ADMIN_ROUTES.POOL_QUESTIONS(poolId), question);

export const updateQuestion = (poolId: string, qId: string, data: Partial<Question>) =>
  put<{ success: boolean; data: QuestionPool }>(ADMIN_ROUTES.POOL_QUESTION_BY_ID(poolId, qId), data);

export const deleteQuestion = (poolId: string, qId: string) =>
  del<{ success: boolean; data: QuestionPool }>(ADMIN_ROUTES.POOL_QUESTION_BY_ID(poolId, qId));

// ── Roles ─────────────────────────────────────────────────────────────────────
export const fetchRoles = () =>
  get<{ success: boolean; data: Role[] }>(ADMIN_ROUTES.ROLES);

export const createRole = (data: { name: string }) =>
  post<{ success: boolean; data: Role }>(ADMIN_ROUTES.ROLES, data);

export const updateRole = (id: string, data: { name: string }) =>
  put<{ success: boolean; data: Role }>(ADMIN_ROUTES.ROLE_BY_ID(id), data);

export const deleteRole = (id: string) =>
  del<{ success: boolean; message: string }>(ADMIN_ROUTES.ROLE_BY_ID(id));

// ── Skills ────────────────────────────────────────────────────────────────────
export const fetchSkills = () =>
  get<{ success: boolean; data: Skill[] }>(ADMIN_ROUTES.SKILLS);

export const createSkill = (data: { name: string }) =>
  post<{ success: boolean; data: Skill }>(ADMIN_ROUTES.SKILLS, data);

export const updateSkill = (id: string, data: { name: string }) =>
  put<{ success: boolean; data: Skill }>(ADMIN_ROUTES.SKILL_BY_ID(id), data);

export const deleteSkill = (id: string) =>
  del<{ success: boolean; message: string }>(ADMIN_ROUTES.SKILL_BY_ID(id));

// ── Role-Skill Mappings ───────────────────────────────────────────────────────
export const fetchMappings = () =>
  get<{ success: boolean; data: RoleSkillMapping[] }>(ADMIN_ROUTES.ROLE_SKILL_MAPPINGS);

export const createMapping = (data: { role: string; skill: string; level: string }) =>
  post<{ success: boolean; data: RoleSkillMapping }>(ADMIN_ROUTES.ROLE_SKILL_MAPPINGS, data);

export const deleteMapping = (id: string) =>
  del<{ success: boolean; message: string }>(ADMIN_ROUTES.MAPPING_BY_ID(id));
