// ── Pagination ────────────────────────────────────────────────────────────────
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: Pagination;
}

// ── Metrics ───────────────────────────────────────────────────────────────────
export interface RecentSubmission {
  _id: string;
  userId:       { _id: string; name: string; email: string };
  assessmentId: { _id: string; name: string };
  ufmAttempts:  number;
  feedback:     unknown[];
  updatedAt:    string;
  isEvaluated:  boolean;
}

export interface SkillStat {
  skillName: string;
  count: number;
}

export interface DashboardMetrics {
  totalAssessments:  number;
  submittedToday:    number;
  pendingEvaluation: number;
  totalCandidates:   number;
  flaggedSolutions:  number;
  certificatesSent:  number;
  recentSubmissions: RecentSubmission[];
  submissionsBySkill: SkillStat[];
}

// ── Assessment ────────────────────────────────────────────────────────────────
export interface AssessmentSection {
  _id:           string;
  title:         string;
  type:          "quiz" | "coding" | "mixed";
  maxTime:       number;
  maxScore:      number;
  maxQuestion:   number;
  description?:  string;
  questionPool?: string | null;
  problemPool:   string[];
}

export interface Assessment {
  _id:             string;
  name:            string;
  slug:            string;
  skillId?:        number | null;
  sections:        AssessmentSection[];
  isProctored:     boolean;
  isAvEnabled:     boolean;
  isScreenCapture: boolean;
  passCodeEnabled: boolean;
  isPublished:     boolean;
  isActive:        boolean;
  attemptCount?:   number;
  createdAt:       string;
  updatedAt:       string;
}

export interface AssessmentFormData {
  name:            string;
  slug:            string;
  skillId?:        number | null;
  sections:        Omit<AssessmentSection, "_id">[];
  isProctored:     boolean;
  isAvEnabled:     boolean;
  isScreenCapture: boolean;
  passCodeEnabled: boolean;
  passCode?:       string;
  isPublished:     boolean;
}

// ── Solution ──────────────────────────────────────────────────────────────────
export interface SolutionUser {
  _id:        string;
  name:       string;
  email:      string;
  userId:     string;
  skillLevel?: string;
}

export interface SolutionAssessment {
  _id:             string;
  name:            string;
  slug:            string;
  isProctored:     boolean;
  isAvEnabled:     boolean;
  isScreenCapture: boolean;
}

export interface Solution {
  _id:            string;
  userId:         SolutionUser;
  assessmentId:   SolutionAssessment;
  currSection:    number;
  ufmAttempts:    number;
  hasAgreed:      boolean;
  isSubmitted:    boolean;
  isEvaluated:    boolean;
  certificateSent:boolean;
  notified:       boolean;
  feedback:       unknown[];
  proctoringData: ProctoringData;
  createdAt:      string;
  updatedAt:      string;
}

export interface ProctoringData {
  isProctored:           boolean;
  isAvEnabled:           boolean;
  isScreenCapture:       boolean;
  isEnabled:             boolean;
  recordingStatus:       "not_started" | "active" | "interrupted" | "completed" | "n/a";
  screenRecordingStatus: "not_started" | "active" | "interrupted" | "completed" | "n/a";
  violationCount:        number;
  sessionCount:          number;
}

// ── Problem ───────────────────────────────────────────────────────────────────
export interface TestCase {
  _id?:   string;
  input:  unknown;
  output: unknown;
  hidden: boolean;
}

export interface FunctionSignature {
  language:  string;
  signature: string;
}

export interface Problem {
  _id:                string;
  title:              string;
  difficulty:         "Easy" | "Medium" | "Hard";
  description?:       string;
  constraints:        string[];
  inputFormat:        string[];
  outputFormat:       string[];
  examples:           { input: unknown; output: unknown; explanation?: string }[];
  testCases:          TestCase[];
  functionSignature:  FunctionSignature[];
  hints:              string[];
  timeLimit:          number;
  memoryLimit:        number;
  languagesSupported: string[];
  createdAt:          string;
  updatedAt:          string;
}

// ── Question Pool ─────────────────────────────────────────────────────────────
export interface QuestionOption {
  _id?:      string;
  text?:     string;
  image?:    string;
  isCorrect: boolean;
}

export interface Question {
  _id?:      string;
  question:  string;
  image?:    string;
  marks:     number;
  negative:  number;
  topic?:    string;
  category:  "MCQ" | "MSQ" | "Text";
  answer?:   string;
  options:   QuestionOption[];
}

export interface QuestionPool {
  _id:       string;
  name:      string;
  questions: Question[];
  problem?:  { _id: string; title: string; difficulty: string } | null;
  createdAt: string;
  updatedAt: string;
}

// ── Role / Skill ──────────────────────────────────────────────────────────────
export interface Role {
  _id:    string;
  roleId: number;
  name:   string;
}

export interface Skill {
  _id:     string;
  skillId: number;
  name:    string;
}

export interface RoleSkillMapping {
  _id:   string;
  role:  Role;
  skill: Skill;
  level: "beginner" | "intermediate" | "advanced";
}

// ── Proctoring ────────────────────────────────────────────────────────────────
export interface ProctoringLog {
  eventType: string;
  timestamp: string;
  detail?: string;
}

export interface PlaybackChunk {
  chunkIndex: number;
  url: string | null;
  expiresIn?: number;
  error?: string;
}

export interface AdminProctoringData {
  solutionId:                string;
  violationCount:            number;
  recordingStatus:           string;
  recordingStartedAt:        string | null;
  recordingEndedAt:          string | null;
  screenRecordingStatus?:    string;
  screenRecordingStartedAt?: string | null;
  screenRecordingEndedAt?:   string | null;
  logs:                      ProctoringLog[];
  playback:                  PlaybackChunk[];
  screenPlayback:            PlaybackChunk[];
}

// ── Query filter params ───────────────────────────────────────────────────────
export interface SolutionFilters {
  assessmentId?:  string;
  minViolations?: number;
  isEvaluated?:   boolean;
  isSubmitted?:   boolean;
  page?:          number;
  limit?:         number;
}

export interface AssessmentFilters {
  skillId?:    number;
  isPublished?: boolean;
  page?:       number;
  limit?:      number;
}

export interface ProblemFilters {
  difficulty?: string;
  language?:   string;
  search?:     string;
  page?:       number;
  limit?:      number;
}
