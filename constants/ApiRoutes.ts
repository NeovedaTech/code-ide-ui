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
  SUBMIT_SECTION:         `${API}/api/v1/assesments/submit-section`,
  GET_SERVER_TIME:        `${API}/api/v1/assesments/server-sync`,
  GET_ASSESSMENT_SOLUTION:`${API}/api/v1/assesments/solution`,
  START_ASSESMENT:        `${API}/api/v1/assesments/start-assesment`,
  GET_SOLUTION:      (id: string) => `${API}/api/v1/assesments/solution/${id}`,
  GET_CERTIFICATE:   (id: string) => `${API}/api/v1/assesments/certificate/${id}`,
};

export const EXECUTION_ROUTES = {
  RUN_CODE:    `${API}/api/v1/code-execution/eval`,
  GET_OUTPUT:  `${API}/api/v1/code-execution/fetch`,
  SUBMIT_CODE: `${API}/api/v1/code-execution/submit`,
};

export const USER_ROUTES = {
  COMPLETED_ASSESSMENTS: (userId: string) => `${API}/api/v1/user/${userId}/completed-assessments`,
};
