/* =========================================================
   Root API Response
   ========================================================= */

export interface ExamSolutionResponse {
  message: string;
  data: ExamSolution;
}

/* =========================================================
   Exam Solution (Top-level data)
   ========================================================= */

export interface ExamSolution {
  _id: string;
  userId: string;
  assessmentId: string;
  currSection: number;
  ufmAttempts: number;
  assesmentSnapshot: AssessmentSection[];
  hasAgreed: boolean;
  isSubmitted: boolean;
  userDetails: unknown[];
  isEvaluated: boolean;
  feedback: unknown[];
  response: SectionResponse[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

/* =========================================================
   Section Response (User's attempt on a section)
   ========================================================= */

export interface codingAnswer {
  [key: string]: {
    code: string;
    tokens: [string];
  };
}

export interface quizAnswer {
  [key: string]: string | string[];
}

export interface SectionResponse {
  sectionId: ObjectId;
  sectionType: "quiz" | "coding";
  quizAnswers: quizAnswer[];
  codingAnswers: codingAnswer[];
  totalQuestions: number;
  correctAnswers: number;
  startedAt: string;
  pausedAt: string | null;
  durationUnavailaible: string;
  isSubmitted: boolean;
  _id: ObjectId;
}

/* =========================================================
   MongoDB ObjectId Type
   ========================================================= */

export interface ObjectId {
  $oid: string;
}

/* =========================================================
   Assessment Sections (Discriminated Union)
   ========================================================= */

export type AssessmentSection = QuizSection | CodingSection;

/* =========================================================
   Quiz Section
   ========================================================= */

export interface QuizSection {
  type: "quiz";
  sectionId: string;
  title: string;
  maxTime: number;
  maxScore: number;
  questions: QuizQuestion[];
  meta: SectionMeta;
}

/* =========================================================
   Coding Section
   ========================================================= */

export interface CodingSection {
  type: "coding";
  sectionId: string;
  title: string;
  maxTime: number;
  maxScore: number;
  problems: CodingProblem[];
  meta: SectionMeta;
}

/* =========================================================
   Section Meta
   ========================================================= */

export interface SectionMeta {
  totalQuestions: number;
  totalProblems: number;
}

/* =========================================================
   Quiz Questions (Discriminated Union)
   ========================================================= */

export type QuizQuestion = TextQuestion | MCQQuestion | MSQQuestion;

export interface BaseQuizQuestion {
  _id: string;
  question: string;
  marks: number;
  category: "Text" | "MCQ" | "MSQ";
}

/* ---------- Text Question ---------- */

export interface TextQuestion extends BaseQuizQuestion {
  category: "Text";
  answer: string;
}

/* ---------- MCQ Question ---------- */

export interface MCQQuestion extends BaseQuizQuestion {
  category: "MCQ";
  options: Option[];
}

/* ---------- MSQ Question ---------- */

export interface MSQQuestion extends BaseQuizQuestion {
  category: "MSQ";
  options: Option[];
}

/* =========================================================
   Quiz Option
   ========================================================= */

export interface Option {
  text: string;
}

/* =========================================================
   Coding Problem
   ========================================================= */

export interface CodingProblem {
  _id: string;
  title: string;
  difficulty: Difficulty;
  description: string;
  constraints: string[];
  inputFormat: string[];
  outputFormat: string[];
  examples: Example[];
  testCases: TestCase[];
  functionSignature: FunctionSignature[];
  hints: string[];
  timeLimit: number;
  memoryLimit: number;
  languagesSupported: string[];
}

/* =========================================================
   Supporting Types
   ========================================================= */

export type Difficulty = "Easy" | "Medium" | "Hard";

export interface Example {
  input: string | string[];
  output: string | string[];
  explanation: string;
}

export interface TestCase {
  input: string | string[];
  output: string | string[];
  hidden: boolean;
}

export interface FunctionSignature {
  language: string;
  signature: string;
}


export type SubmtiSectionResponse = {
   solutionId: string;
  sectionId: string;
  autoSubmit?: boolean;
  sectionType: string;
  response: codingAnswer | quizAnswer;
  current: number;
}