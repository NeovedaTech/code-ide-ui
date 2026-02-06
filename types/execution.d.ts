type TokenItem = {
  token: string;
};

export type TokenList = TokenItem[];

export type SubmissionStatus = {
  id: number;
  description: string;
};

export type Submission = {
  stdout: string | null;
  stdin: string | null;
  time: string | null;
  memory: number | null;
  stderr: string | null;
  token: string;
  compile_output: string | null;
  message: string | null;
  status: SubmissionStatus;
};

export type SubmissionsResponse = {
  submissions: Submission[];
};




export type ExecutionStatus = {
  id: number;
  description: string;
};

export type ExecutionResult = {
  stdout: string;
  stderr: string;
  stdin:string;
  compile_error: string;
  time: string;    // looks like seconds as a string
  memory: number;  // in KB
  status: ExecutionStatus;
};
export type Question = MSQQuestion | MCQQuestion | TextQuestion;


export type ExecutionResults = ExecutionResult[];

