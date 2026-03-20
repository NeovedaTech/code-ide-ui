"use client";

import { useAssessmentBySolutionId } from "@/hooks/AssesmentApi";
import { CheckCircle2, XCircle, Clock, Award, Code, FileText, AlertCircle, TrendingUp, Target, Copy, Check, Download } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ConfirmBox, useConfirmBox } from "@/shared/ConfirmBox";
import { ASSESMENT_ROUTES } from "@/constants/ApiRoutes";

interface AssessmentPreviewProps {
    solutionId: string;
}

export default function AssessmentPreview({ solutionId }: AssessmentPreviewProps) {
    const { data: solution, isLoading, error } = useAssessmentBySolutionId({ solutionId });
    const router = useRouter();
    const [copiedCert, setCopiedCert] = useState(false);
    const { isOpen: isEvaluatingModalOpen, openModal: openEvaluatingModal, closeModal: closeEvaluatingModal } = useConfirmBox();
    const certId = `KAI-${solutionId}`;

    const handleCopyCertId = () => {
        navigator.clipboard.writeText(certId);
        setCopiedCert(true);
        setTimeout(() => setCopiedCert(false), 2000);
    };

    useEffect(() => {
        if (solution && !solution.isEvaluated) {
            openEvaluatingModal();
            const timer = setTimeout(() => {
                router.refresh();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [solution, openEvaluatingModal, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-slate-600 font-medium">Loading assessment...</p>
                </div>
            </div>
        );
    }

    if (error || !solution) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Assessment Not Found</h2>
                    <p className="text-slate-600">Unable to load assessment data. Please try again.</p>
                </div>
            </div>
        );
    }

    const assessmentData = solution;

    // Calculate overall statistics
    const totalSections = assessmentData.assesmentSnapshot.length;
    const quizSection = assessmentData.response.find((r: any) => r.sectionType === "quiz");
    const codingSection = assessmentData.response.find((r: any) => r.sectionType === "coding");

    const quizSnapshot = assessmentData.assesmentSnapshot.find((s: any) => s.type === "quiz");
    const codingSnapshot = assessmentData.assesmentSnapshot.find((s: any) => s.type === "coding");

    // Check if quiz section has valid data
    const hasQuizData = quizSection && quizSnapshot && quizSnapshot.type === "quiz" && quizSnapshot.questions.length > 0;

    // Check if coding section has valid data
    const hasCodingData = codingSection && codingSnapshot && codingSnapshot.type === "coding" && codingSnapshot.problems.length > 0;

    // Calculate max scores based on actual question/test case counts
    let totalMaxScore = 0;
    let quizMaxScore = 0;
    let codingMaxScore = 0;

    if (hasQuizData) {
        // Sum actual marks from each question instead of snapshot maxScore
        quizMaxScore = (quizSnapshot.questions || []).reduce(
            (sum: number, q: any) => sum + (q.marks || 1), 0
        );
        totalMaxScore += quizMaxScore;
    }

    if (hasCodingData) {
        // Each test case = 1 mark; sum total test cases across all problems
        const codingAnswers = codingSection.codingAnswers?.[0] || {};
        let codingTotal = 0;

        Object.keys(codingAnswers).forEach((key) => {
            if (codingAnswers[key]?.total) {
                codingTotal += codingAnswers[key].total;
            }
        });

        codingMaxScore = codingTotal;
        totalMaxScore += codingMaxScore;
    }

    const quizScore = hasQuizData ? (quizSection?.correctAnswers || 0) : 0;
    const codingScore = hasCodingData ? calculateCodingScore(codingSection, codingSnapshot) : 0;
    const totalScore = quizScore + codingScore;
    const percentageScore = totalMaxScore > 0 ? ((totalScore / totalMaxScore) * 100).toFixed(1) : 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-8">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
                        <div className="flex items-start justify-between">
                            <div>
                                <h1 className="text-4xl font-bold mb-2">Assessment Report</h1>
                                <p className="text-blue-100 text-lg">
                                    Submitted: {new Date(assessmentData.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                                <div className="flex items-center gap-2 mt-3">
                                    <Award className="w-4 h-4 text-yellow-300" />
                                    <span className="text-yellow-300 text-xs font-semibold tracking-wide uppercase">Certificate ID</span>
                                    <code className="text-white text-xs bg-white/10 rounded px-2 py-0.5 font-mono">{certId}</code>
                                    <button
                                        onClick={handleCopyCertId}
                                        className="p-1 rounded hover:bg-white/20 transition-colors text-white"
                                        title="Copy Certificate ID"
                                    >
                                        {copiedCert ? <Check className="w-3.5 h-3.5 text-green-300" /> : <Copy className="w-3.5 h-3.5" />}
                                    </button>
                                    <a
                                        href={ASSESMENT_ROUTES.GET_CERTIFICATE(solutionId)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 px-2.5 py-1 rounded bg-yellow-400/20 hover:bg-yellow-400/30 text-yellow-300 text-xs font-semibold transition-colors"
                                    >
                                        <Download className="w-3 h-3" /> Certificate
                                    </a>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-5xl font-bold">{percentageScore}%</div>
                                <div className="text-blue-100">Overall Score</div>
                            </div>
                        </div>
                    </div>

                    {/* Score Breakdown Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8">
                        {hasQuizData && (
                            <ScoreCard
                                icon={<FileText className="w-8 h-8" />}
                                title="Quiz Score"
                                score={quizScore}
                                maxScore={quizMaxScore}
                                color="blue"
                            />
                        )}
                        {hasCodingData && (
                            <ScoreCard
                                icon={<Code className="w-8 h-8" />}
                                title="Coding Score"
                                score={codingScore}
                                maxScore={codingMaxScore}
                                color="purple"
                            />
                        )}
                        <ScoreCard
                            icon={<Award className="w-8 h-8" />}
                            title="Total Score"
                            score={totalScore}
                            maxScore={totalMaxScore}
                            color="green"
                        />
                    </div>
                </div>

                {/* Quiz Section - Only shows if quiz data exists */}
                {hasQuizData && (
                    <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-blue-100 rounded-xl">
                                <FileText className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-slate-800">{quizSnapshot.title}</h2>
                                <p className="text-slate-600">Multiple Choice Questions</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                            <StatCard
                                label="Questions Attempted"
                                value={`${Object.keys(quizSection.quizAnswers?.[0] || {}).length}/${quizSnapshot.questions.length}`}
                                icon={<Target />}
                            />
                            <StatCard
                                label="Correct Answers"
                                value={quizSection.correctAnswers || 0}
                                icon={<CheckCircle2 />}
                                color="green"
                            />
                            <StatCard
                                label="Time Limit"
                                value={`${quizSnapshot.maxTime} min`}
                                icon={<Clock />}
                            />
                            <StatCard
                                label="Max Score"
                                value={quizSnapshot.maxScore}
                                icon={<Award />}
                                color="blue"
                            />
                        </div>

                        <QuizAnswersBreakdown
                            questions={quizSnapshot.questions || []}
                            userAnswers={quizSection.quizAnswers?.[0] || {}}
                        />
                    </div>
                )}

                {/* Coding Section - Only shows if coding data exists */}
                {hasCodingData && (
                    <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-purple-100 rounded-xl">
                                <Code className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-slate-800">{codingSnapshot.title}</h2>
                                <p className="text-slate-600">Programming Challenges</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                            <StatCard
                                label="Problems"
                                value={codingSnapshot.problems.length}
                                icon={<Code />}
                            />
                            <StatCard
                                label="Test Cases Passed"
                                value={calculateTotalPassedTests(codingSection)}
                                icon={<CheckCircle2 />}
                                color="green"
                            />
                            <StatCard
                                label="Time Limit"
                                value={`${codingSnapshot.maxTime} min`}
                                icon={<Clock />}
                            />
                            <StatCard
                                label="Max Score"
                                value={codingMaxScore}
                                icon={<Award />}
                                color="purple"
                            />
                        </div>

                        <CodingProblemsBreakdown
                            problems={codingSnapshot.problems || []}
                            userAnswers={codingSection.codingAnswers?.[0] || {}}
                        />
                    </div>
                )}

                {/* Performance Insights */}
                <PerformanceInsights
                    quizSection={hasQuizData ? quizSection : null}
                    codingSection={hasCodingData ? codingSection : null}
                    quizSnapshot={hasQuizData ? quizSnapshot : null}
                    codingSnapshot={hasCodingData ? codingSnapshot : null}
                />
            </div>

            <ConfirmBox
                isOpen={isEvaluatingModalOpen}
                onClose={closeEvaluatingModal}
                onConfirm={router.refresh}
                title="Assessment Still Evaluating"
                content="Your assessment is still being evaluated. Please refresh the page in 5 seconds."
                confirmText="Refresh Now"
                cancelText="Close"
                closeOnBackdropClick={false}
            />
        </div>
    );
}

// Helper Components


interface ScoreCardProps {
    icon: React.ReactNode;
    title: string;
    score: number;
    maxScore: number;
    color: 'blue' | 'purple' | 'green';
}

function ScoreCard({ icon, title, score, maxScore, color }: ScoreCardProps) {
    const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
    const colorClasses = {
        blue: 'from-blue-500 to-blue-600 bg-blue-100 text-blue-600',
        purple: 'from-purple-500 to-purple-600 bg-purple-100 text-purple-600',
        green: 'from-green-500 to-green-600 bg-green-100 text-green-600'
    };

    return (
        <div className="border-2 border-slate-100 rounded-2xl p-6 hover:shadow-lg transition-shadow">
            <div className={`inline-flex p-3 rounded-xl ${colorClasses[color].split(' ')[2]} ${colorClasses[color].split(' ')[3]} mb-4`}>
                {icon}
            </div>
            <h3 className="text-slate-600 font-medium mb-2">{title}</h3>
            <div className="flex items-baseline gap-2 mb-3">
                <span className="text-4xl font-bold text-slate-800">{score}</span>
                <span className="text-xl text-slate-400">/ {maxScore}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                    className={`h-full bg-gradient-to-r ${colorClasses[color].split(' ')[0]} ${colorClasses[color].split(' ')[1]} transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}

interface StatCardProps {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    color?: 'green' | 'blue' | 'purple';
}

function StatCard({ label, value, icon, color = 'blue' }: StatCardProps) {
    const colorClasses = {
        green: 'bg-green-50 text-green-600',
        blue: 'bg-blue-50 text-blue-600',
        purple: 'bg-purple-50 text-purple-600'
    };

    return (
        <div className="bg-slate-50 rounded-xl p-4">
            <div className={`inline-flex p-2 rounded-lg ${colorClasses[color]} mb-2`}>
                {/* {React.cloneElement(icon as React.ReactElement, { className: 'w-4 h-4' })} */}
            </div>
            <div className="text-2xl font-bold text-slate-800">{value}</div>
            <div className="text-sm text-slate-600">{label}</div>
        </div>
    );
}

interface QuizAnswersBreakdownProps {
    questions: any[];
    userAnswers: Record<string, string | string[]>;
}

function QuizAnswersBreakdown({ questions, userAnswers }: QuizAnswersBreakdownProps) {
    if (!questions || questions.length === 0) {
        return null;
    }

    const answeredQuestions = questions.filter(q => userAnswers[q._id]);

    if (answeredQuestions.length === 0) {
        return (
            <div className="text-center py-8 text-slate-500">
                <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No questions were attempted</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Answer Breakdown</h3>
            {answeredQuestions.map((question, index) => {
                const userAnswer = userAnswers[question._id];
                const correctOption = question.options.find((opt: any) => opt.isCorrect);
                const isCorrect = userAnswer === correctOption?.text;

                return (
                    <div key={question._id} className={`border-2 rounded-xl p-6 ${isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                        <div className="flex items-start gap-4">
                            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${isCorrect ? 'bg-green-500' : 'bg-red-500'}`}>
                                {isCorrect ? (
                                    <CheckCircle2 className="w-6 h-6 text-white" />
                                ) : (
                                    <XCircle className="w-6 h-6 text-white" />
                                )}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="px-3 py-1 bg-slate-200 text-slate-700 rounded-full text-sm font-medium">
                                        Question {index + 1}
                                    </span>
                                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                        {question.marks} {question.marks === 1 ? 'mark' : 'marks'}
                                    </span>
                                </div>
                                <pre className="text-slate-800 font-mono text-sm mb-4 whitespace-pre-wrap bg-white p-4 rounded-lg">
                                    {question.question}
                                </pre>
                                <div className="space-y-2">
                                    <div className="flex items-start gap-2">
                                        <span className="font-semibold text-slate-700 min-w-[120px]">Your Answer:</span>
                                        <span className={`${isCorrect ? 'text-green-700' : 'text-red-700'} font-medium`}>
                                            {userAnswer}
                                        </span>
                                    </div>
                                    {!isCorrect && (
                                        <div className="flex items-start gap-2">
                                            <span className="font-semibold text-slate-700 min-w-[120px]">Correct Answer:</span>
                                            <span className="text-green-700 font-medium">{correctOption?.text}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

interface CodingProblemsBreakdownProps {
    problems: any[];
    userAnswers: Record<string, any>;
}

function CodingProblemsBreakdown({ problems, userAnswers }: CodingProblemsBreakdownProps) {
    if (!problems || problems.length === 0) {
        return null;
    }

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Problem Solutions</h3>
            {problems.map((problem, index) => {
                const submission = userAnswers[problem._id];
                const hasSolution = submission && submission.code;
                const passedTests = submission?.passed || 0;
                const totalTests = submission?.total || 0;
                const percentage = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;

                return (
                    <div key={problem._id} className="border-2 border-slate-200 rounded-xl overflow-hidden">
                        <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="px-3 py-1 bg-slate-700 text-white rounded-full text-sm font-medium">
                                            Problem {index + 1}
                                        </span>
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${problem.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                                            problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                            {problem.difficulty}
                                        </span>
                                    </div>
                                    <h4 className="text-2xl font-bold text-slate-800">{problem.title}</h4>
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-bold text-slate-800">{passedTests}/{totalTests}</div>
                                    <div className="text-sm text-slate-600">Tests Passed</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <div className="bg-white rounded-lg p-3">
                                    <div className="text-sm text-slate-600">Time Limit</div>
                                    <div className="text-lg font-bold text-slate-800">{problem.timeLimit}ms</div>
                                </div>
                                <div className="bg-white rounded-lg p-3">
                                    <div className="text-sm text-slate-600">Memory Limit</div>
                                    <div className="text-lg font-bold text-slate-800">{problem.memoryLimit / 1000}MB</div>
                                </div>
                                <div className="bg-white rounded-lg p-3">
                                    <div className="text-sm text-slate-600">Attempts</div>
                                    <div className="text-lg font-bold text-slate-800">{submission?.tokens?.length || 0}</div>
                                </div>
                            </div>

                            <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-500 ${percentage === 100 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                                        percentage > 0 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                                            'bg-gradient-to-r from-red-500 to-red-600'
                                        }`}
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                        </div>

                        {hasSolution ? (
                            <div className="p-6">
                                <h5 className="font-bold text-slate-800 mb-3">Your Solution ({submission.language})</h5>
                                <pre className="bg-slate-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm font-mono">
                                    {submission.code}
                                </pre>
                            </div>
                        ) : (
                            <div className="p-6 text-center text-slate-500">
                                <Code className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>No solution submitted</p>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

interface PerformanceInsightsProps {
    quizSection: any;
    codingSection: any;
    quizSnapshot: any;
    codingSnapshot: any;
}

function PerformanceInsights({ quizSection, codingSection, quizSnapshot, codingSnapshot }: PerformanceInsightsProps) {
    const insights = [];

    // Quiz insights - only if quiz data exists
    if (quizSection && quizSnapshot && quizSnapshot.questions && quizSnapshot.questions.length > 0) {
        const attemptedCount = Object.keys(quizSection.quizAnswers?.[0] || {}).length;
        const totalQuestions = quizSnapshot.questions.length;
        const attemptRate = (attemptedCount / totalQuestions) * 100;
        const accuracy = attemptedCount > 0 ? (quizSection.correctAnswers / attemptedCount) * 100 : 0;

        if (attemptRate < 50) {
            insights.push({
                type: 'warning',
                title: 'Low Completion Rate',
                message: `You attempted only ${attemptedCount} out of ${totalQuestions} questions (${attemptRate.toFixed(0)}%). Try to attempt all questions in future assessments.`
            });
        }

        if (accuracy < 40 && attemptedCount > 0) {
            insights.push({
                type: 'error',
                title: 'Low Accuracy',
                message: `Your accuracy was ${accuracy.toFixed(1)}%. Consider reviewing fundamental concepts before attempting assessments.`
            });
        } else if (accuracy >= 70) {
            insights.push({
                type: 'success',
                title: 'Good Accuracy',
                message: `You achieved ${accuracy.toFixed(1)}% accuracy on attempted questions. Great job!`
            });
        }
    }

    // Coding insights - only if coding data exists
    if (codingSection && codingSnapshot && codingSnapshot.problems && codingSnapshot.problems.length > 0) {
        const totalTestsPassed = calculateTotalPassedTests(codingSection);
        const totalTests = calculateTotalTests(codingSection);
        const codingSuccessRate = totalTests > 0 ? (Number(totalTestsPassed.split('/')[0]) / totalTests) * 100 : 0;

        if (codingSuccessRate === 0 && totalTests > 0) {
            insights.push({
                type: 'error',
                title: 'No Test Cases Passed',
                message: 'None of your solutions passed any test cases. Review the problem requirements and test your code with sample inputs before submitting.'
            });
        } else if (codingSuccessRate > 0 && codingSuccessRate < 50) {
            insights.push({
                type: 'warning',
                title: 'Partial Solutions',
                message: `You passed ${totalTestsPassed.split('/')[0]} out of ${totalTests} test cases. Work on edge cases and complete implementations.`
            });
        } else if (codingSuccessRate >= 80) {
            insights.push({
                type: 'success',
                title: 'Excellent Coding Performance',
                message: `You passed ${totalTestsPassed.split('/')[0]} out of ${totalTests} test cases (${codingSuccessRate.toFixed(0)}%). Outstanding work!`
            });
        }
    }

    if (insights.length === 0) {
        return null;
    }

    return (
        <div className="bg-white rounded-3xl shadow-xl p-8 mt-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-amber-100 rounded-xl">
                    <TrendingUp className="w-6 h-6 text-amber-600" />
                </div>
                <h2 className="text-3xl font-bold text-slate-800">Performance Insights</h2>
            </div>

            <div className="space-y-4">
                {insights.map((insight, index) => (
                    <div
                        key={index}
                        className={`border-l-4 rounded-lg p-4 ${insight.type === 'success' ? 'bg-green-50 border-green-500' :
                            insight.type === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                                'bg-red-50 border-red-500'
                            }`}
                    >
                        <h4 className={`font-bold mb-1 ${insight.type === 'success' ? 'text-green-800' :
                            insight.type === 'warning' ? 'text-yellow-800' :
                                'text-red-800'
                            }`}>
                            {insight.title}
                        </h4>
                        <p className="text-slate-700">{insight.message}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Helper Functions

function calculateCodingScore(codingSection: any, codingSnapshot: any): number {
    if (!codingSection) return 0;

    const codingAnswers = codingSection.codingAnswers?.[0] || {};
    let totalPassed = 0;

    Object.keys(codingAnswers).forEach((key) => {
        if (codingAnswers[key]?.passed) {
            totalPassed += codingAnswers[key].passed;
        }
    });

    return totalPassed;
}

function calculateTotalPassedTests(codingSection: any): string {
    if (!codingSection) return '0/0';

    const codingAnswers = codingSection.codingAnswers?.[0] || {};
    let totalPassed = 0;
    let totalTests = 0;

    Object.keys(codingAnswers).forEach((key) => {
        if (codingAnswers[key]?.passed) {
            totalPassed += codingAnswers[key].passed;
        }
        if (codingAnswers[key]?.total) {
            totalTests += codingAnswers[key].total;
        }
    });

    return totalTests > 0 ? `${totalPassed}/${totalTests}` : '0/0';
}

function calculateTotalTests(codingSection: any): number {
    if (!codingSection) return 0;

    const codingAnswers = codingSection.codingAnswers?.[0] || {};
    let totalTests = 0;

    Object.keys(codingAnswers).forEach((key) => {
        if (codingAnswers[key]?.total) {
            totalTests += codingAnswers[key].total;
        }
    });

    return totalTests;
}