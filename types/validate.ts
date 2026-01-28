import { MCQQuestion, MSQQuestion, TextQuestion } from "./assessment";
import { Question } from "./execution";

export function isMSQQuestion(question: Question): question is MSQQuestion {
  return question.category === "MSQ";
}

export function isMCQQuestion(question: Question): question is MCQQuestion {
  return question.category === "MCQ";
}

export function isTextQuestion(question: Question): question is TextQuestion {
  return question.category === "Text";
}