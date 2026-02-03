export const ASSESMENT_ROUTES = {
  SUBMIT_SECTION: "/api/v1/assesments/submit-section",
  GET_SERVER_TIME: "/api/v1/assesments/server-sync",
  GET_ASSESSMENT_SOLUTION: "/api/v1/assesments/solution",
  START_ASSESMENT: "/api/v1/assesments/start-assesment",
  GET_SOLUTION: (id:string) => `/api/v1/assesments/solution/${id}`
};

export const EXECUTION_ROUTES = {
  RUN_CODE: "/api/v1/code-execution/eval",
  GET_OUTPUT: "/api/v1/code-execution/fetch",
  SUBMIT_CODE: "/api/v1/code-execution/submit",
};
