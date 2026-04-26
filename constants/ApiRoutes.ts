const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export const ROLE_SKILL_ROUTES = {
  ROLES: `${API}/api/v1/role-skill/roles`,
  SKILLS_BY_ROLE: (roleId: number) => `${API}/api/v1/role-skill/roles/${roleId}/skills`,
};

export const AUTH_ROUTES = {
  LOGIN:    `${API}/api/v1/auth/login`,
  REGISTER: `${API}/api/v1/auth/register`,
  LOGOUT:   `${API}/api/v1/auth/logout`,
  ME:       `${API}/api/v1/auth/me`,
};

export const ASSESMENT_ROUTES = {
  ALL:                    `${API}/api/v1/assesments/all`,
  INFO:              (id: string) => `${API}/api/v1/assesments/info/${id}`,
  SUBMIT_SECTION:         `${API}/api/v1/assesments/submit-section`,
  GET_SERVER_TIME:        `${API}/api/v1/assesments/server-sync`,
  GET_ASSESSMENT_SOLUTION:`${API}/api/v1/assesments/solution`,
  START_ASSESMENT:        `${API}/api/v1/assesments/start-assesment`,
  GET_SOLUTION:      (id: string) => `${API}/api/v1/assesments/solution/${id}`,
  GET_CERTIFICATE:   (id: string) => `${API}/api/v1/assesments/certificate/${id}`,
};

export const PROCTORING_ROUTES = {
  PRESIGNED_URL: `${API}/api/v1/proctoring/presigned-url`,
  LOG:           `${API}/api/v1/proctoring/log`,
  COMPLETE:      `${API}/api/v1/proctoring/complete`,
  SESSION:       (id: string) => `${API}/api/v1/proctoring/session/${id}`,
  ADMIN_DATA:    (id: string) => `${API}/api/v1/proctoring/${id}`,
  RELAY_CHUNK:   `${API}/api/v1/proctoring/relay-chunk`,
};

export const EXECUTION_ROUTES = {
  RUN_CODE:    `${API}/api/v1/code-execution/eval`,
  GET_OUTPUT:  `${API}/api/v1/code-execution/fetch`,
  SUBMIT_CODE: `${API}/api/v1/code-execution/submit`,
};

export const USER_ROUTES = {
  COMPLETED_ASSESSMENTS: (userId: string) => `${API}/api/v1/user/${userId}/completed-assessments`,
};

const ADMIN = `${API}/api/v1/admin`;

export const ADMIN_ROUTES = {
  METRICS:              `${ADMIN}/metrics`,
  ASSESSMENTS:          `${ADMIN}/assessments`,
  ASSESSMENT_BY_ID:     (id: string) => `${ADMIN}/assessments/${id}`,
  SOLUTIONS:            `${ADMIN}/solutions`,
  SOLUTION_BY_ID:       (id: string) => `${ADMIN}/solutions/${id}`,
  PROBLEMS:             `${ADMIN}/problems`,
  PROBLEM_BY_ID:        (id: string) => `${ADMIN}/problems/${id}`,
  QUESTION_POOLS:       `${ADMIN}/question-pools`,
  POOL_BY_ID:           (id: string) => `${ADMIN}/question-pools/${id}`,
  POOL_QUESTIONS:       (id: string) => `${ADMIN}/question-pools/${id}/questions`,
  POOL_QUESTION_BY_ID:  (poolId: string, qId: string) => `${ADMIN}/question-pools/${poolId}/questions/${qId}`,
  ROLES:                `${ADMIN}/roles`,
  ROLE_BY_ID:           (id: string) => `${ADMIN}/roles/${id}`,
  SKILLS:               `${ADMIN}/skills`,
  SKILL_BY_ID:          (id: string) => `${ADMIN}/skills/${id}`,
  ROLE_SKILL_MAPPINGS:  `${ADMIN}/role-skill-mappings`,
  MAPPING_BY_ID:        (id: string) => `${ADMIN}/role-skill-mappings/${id}`,
  VERIFY_PASSCODE:      `${API}/api/v1/assesments/verify-passcode`,
};
