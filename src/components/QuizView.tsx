import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  AcademicSubject,
  Quiz,
  QuizQuestion,
  StudentLevel,
} from '../types';
import { MarkdownRenderer } from '../utils/markdown';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Award,
  CheckCircle2,
  HelpCircle,
  Play,
  Plus,
  RefreshCw,
  RotateCcw,
  Sparkles,
  Trophy,
  XCircle,
} from 'lucide-react';

interface QuizViewProps {
  quizzes: Quiz[];
  onAddQuiz: (quiz: Quiz) => void;
  onCompleteQuiz: (quizId: string, score: number, questions: QuizQuestion[]) => void;
  currentLevel: StudentLevel;
  selectedSubject: AcademicSubject;
}

export const QuizView: React.FC<QuizViewProps> = ({
  quizzes,
  onAddQuiz,
  onCompleteQuiz,
  currentLevel,
  selectedSubject,
}) => {
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [instantFeedbackMode, setInstantFeedbackMode] = useState(true);

  // Creation form state
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState<AcademicSubject>(selectedSubject !== 'All Subjects' ? selectedSubject : 'Physics & Science');
  const [difficulty, setDifficulty] = useState<StudentLevel>(currentLevel);
  const [questionCount, setQuestionCount] = useState(4);
  const [sourceText, setSourceText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleStartQuiz = (quiz: Quiz) => {
    setActiveQuiz(quiz);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setIsQuizCompleted(false);
  };

  const handleSelectAnswer = (questionId: string, answer: string) => {
    if (isQuizCompleted) return;
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleNextQuestion = () => {
    if (!activeQuiz) return;
    if (currentQuestionIndex < activeQuiz.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      handleFinishQuiz();
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleFinishQuiz = () => {
    if (!activeQuiz) return;

    let correctCount = 0;
    const updatedQuestions = activeQuiz.questions.map((q) => {
      const userAns = userAnswers[q.id] || '';
      const isCorrect = userAns.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
      if (isCorrect) correctCount++;
      return {
        ...q,
        userAnswer: userAns,
        isCorrect,
      };
    });

    const finalScore = Math.round((correctCount / activeQuiz.questions.length) * 100);
    setIsQuizCompleted(true);
    onCompleteQuiz(activeQuiz.id, finalScore, updatedQuestions);

    // Launch celebratory confetti if score >= 75%
    if (finalScore >= 75) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  const handleGenerateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!topic.trim() && !sourceText.trim()) || isLoading) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/gemini/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim() || 'Custom Knowledge Test',
          subject,
          difficulty,
          questionCount,
          sourceText: sourceText.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.questions || data.questions.length === 0) {
        throw new Error(data.error || 'Failed to generate quiz');
      }

      const newQuiz: Quiz = {
        id: `quiz-${Date.now()}`,
        title: data.title || `Quiz: ${topic}`,
        topic: data.topic || topic,
        subject: data.subject || subject,
        difficulty: data.difficulty || difficulty,
        questions: data.questions.map((q: any, i: number) => ({
          id: `q-${Date.now()}-${i}`,
          question: q.question,
          type: q.type || 'multiple_choice',
          options: q.options || ['True', 'False'],
          correctAnswer: q.correctAnswer,
          explanation: q.explanation || 'Pedagogical explanation of this concept.',
        })),
        createdAt: new Date().toISOString(),
      };

      onAddQuiz(newQuiz);
      handleStartQuiz(newQuiz);
      setTopic('');
      setSourceText('');
    } catch (err) {
      console.error('Quiz creation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // If a quiz is currently active and being taken
  if (activeQuiz) {
    const currentQ = activeQuiz.questions[currentQuestionIndex];
    const currentAnswer = userAnswers[currentQ?.id] || '';
    const hasAnsweredCurrent = !!currentAnswer;
    const isCurrentCorrect = currentAnswer.trim().toLowerCase() === currentQ?.correctAnswer.trim().toLowerCase();

    // Results calculation
    const totalQuestions = activeQuiz.questions.length;
    let correctCount = 0;
    activeQuiz.questions.forEach((q) => {
      if ((userAnswers[q.id] || '').trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()) {
        correctCount++;
      }
    });
    const scorePercent = Math.round((correctCount / totalQuestions) * 100);

    return (
      <div className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Top Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setActiveQuiz(null)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Exit Quiz</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-purple-500/10 px-3 py-1 text-xs font-bold text-purple-600 dark:text-purple-400">
              {activeQuiz.subject} • {activeQuiz.difficulty}
            </span>
          </div>
        </div>

        {/* QUIZ COMPLETED SUMMARY SCREEN */}
        {isQuizCompleted ? (
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-md dark:border-slate-800/80 dark:bg-slate-900 space-y-8">
            <div className="text-center space-y-3">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30">
                <Trophy className="h-10 w-10" />
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {scorePercent >= 80 ? 'Outstanding Mastery! 🎉' : scorePercent >= 60 ? 'Great Progress! 👏' : 'Keep Learning & Practicing! 📚'}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                You scored <strong className="text-slate-900 dark:text-white font-mono">{scorePercent}%</strong> ({correctCount} of {totalQuestions} correct) on {activeQuiz.title}.
              </p>

              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => handleStartQuiz(activeQuiz)}
                  className="flex items-center gap-2 rounded-2xl bg-purple-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-purple-700 transition"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Retake Quiz</span>
                </button>
                <button
                  onClick={() => setActiveQuiz(null)}
                  className="rounded-2xl border border-slate-200 px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 transition"
                >
                  Create or Choose Another Quiz
                </button>
              </div>
            </div>

            {/* Detailed Question Review with Explanations */}
            <div className="border-t border-slate-200 pt-6 dark:border-slate-800 space-y-5">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Detailed Answer Review & Misconceptions Explained
              </h3>

              <div className="space-y-4">
                {activeQuiz.questions.map((q, idx) => {
                  const studentAns = userAnswers[q.id] || '(No answer)';
                  const isCorrect = studentAns.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();

                  return (
                    <div
                      key={q.id}
                      className={`rounded-2xl border p-5 transition ${
                        isCorrect
                          ? 'border-emerald-200 bg-emerald-50/20 dark:border-emerald-900/30 dark:bg-emerald-950/10'
                          : 'border-rose-200 bg-rose-50/20 dark:border-rose-900/30 dark:bg-rose-950/10'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2 font-bold text-xs">
                          <span
                            className={`flex h-6 w-6 items-center justify-center rounded-full text-white font-bold text-xs ${
                              isCorrect ? 'bg-emerald-600' : 'bg-rose-600'
                            }`}
                          >
                            {isCorrect ? '✓' : '✗'}
                          </span>
                          <span className="text-slate-500">Question {idx + 1}</span>
                        </div>
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                            isCorrect
                              ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                              : 'bg-rose-500/20 text-rose-700 dark:text-rose-300'
                          }`}
                        >
                          {isCorrect ? 'Correct (+1)' : 'Incorrect'}
                        </span>
                      </div>

                      <h4 className="mt-3 font-semibold text-sm sm:text-base text-slate-900 dark:text-white">
                        {q.question}
                      </h4>

                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="rounded-xl border border-slate-200/80 bg-white p-2.5 dark:border-slate-800 dark:bg-slate-800/80">
                          <span className="text-slate-400 block text-[10px] uppercase font-bold mb-0.5">Your Choice</span>
                          <span className={`font-semibold ${isCorrect ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {studentAns}
                          </span>
                        </div>
                        <div className="rounded-xl border border-emerald-500/30 bg-emerald-50/40 p-2.5 dark:border-emerald-900/40 dark:bg-emerald-950/20">
                          <span className="text-emerald-700 dark:text-emerald-300 block text-[10px] uppercase font-bold mb-0.5">Correct Answer</span>
                          <span className="font-semibold text-emerald-800 dark:text-emerald-300">
                            {q.correctAnswer}
                          </span>
                        </div>
                      </div>

                      {/* Explanation */}
                      <div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
                        <span className="font-bold text-slate-900 dark:text-white block mb-1">
                          Why this is correct:
                        </span>
                        <MarkdownRenderer content={q.explanation} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* ACTIVE QUESTION CARD */
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs dark:border-slate-800/80 dark:bg-slate-900 space-y-6">
            {/* Question Progress bar */}
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span className="font-semibold">
                  Question <strong className="text-slate-900 dark:text-white">{currentQuestionIndex + 1}</strong> of {totalQuestions}
                </span>
                <span className="font-mono text-purple-600 dark:text-purple-400 font-bold">
                  {Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100)}%
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
                />
              </div>
            </div>

            {/* Question Statement */}
            <div className="py-2">
              <span className="text-xs uppercase tracking-wider font-bold text-purple-600 dark:text-purple-400">
                {currentQ.type === 'true_false' ? 'True / False Question' : 'Multiple Choice Question'}
              </span>
              <h3 className="mt-2 text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-relaxed">
                {currentQ.question}
              </h3>
            </div>

            {/* Answer Options */}
            <div className="space-y-3">
              {(currentQ.options || ['True', 'False']).map((opt, optIdx) => {
                const isSelected = currentAnswer === opt;
                let optionStyle = 'border-slate-200/80 bg-slate-50 hover:bg-slate-100 text-slate-800 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-200';

                if (isSelected) {
                  if (instantFeedbackMode) {
                    const isOptCorrect = opt.trim().toLowerCase() === currentQ.correctAnswer.trim().toLowerCase();
                    optionStyle = isOptCorrect
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-bold ring-2 ring-emerald-500/20'
                      : 'border-rose-500 bg-rose-500/10 text-rose-800 dark:text-rose-300 font-bold ring-2 ring-rose-500/20';
                  } else {
                    optionStyle = 'border-purple-500 bg-purple-500/10 text-purple-900 dark:text-purple-200 font-bold ring-2 ring-purple-500/20';
                  }
                } else if (instantFeedbackMode && hasAnsweredCurrent && opt.trim().toLowerCase() === currentQ.correctAnswer.trim().toLowerCase()) {
                  // Reveal correct answer if wrong answer was picked
                  optionStyle = 'border-emerald-500 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-semibold';
                }

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectAnswer(currentQ.id, opt)}
                    className={`w-full text-left rounded-2xl border p-4 text-xs sm:text-sm transition flex items-center justify-between ${optionStyle}`}
                  >
                    <span>{opt}</span>
                    {isSelected && instantFeedbackMode && (
                      <span>
                        {opt.trim().toLowerCase() === currentQ.correctAnswer.trim().toLowerCase() ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-rose-600" />
                        )}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Instant Feedback Explanation Box */}
            {instantFeedbackMode && hasAnsweredCurrent && (
              <div
                className={`rounded-2xl border p-4 text-xs leading-relaxed ${
                  isCurrentCorrect
                    ? 'border-emerald-500/30 bg-emerald-50/40 text-emerald-900 dark:bg-emerald-950/20 dark:text-emerald-200'
                    : 'border-amber-500/30 bg-amber-50/40 text-amber-900 dark:bg-amber-950/20 dark:text-amber-200'
                }`}
              >
                <div className="flex items-center gap-2 font-bold mb-1.5">
                  {isCurrentCorrect ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                  )}
                  <span>{isCurrentCorrect ? 'Correct reasoning!' : 'Concept Insight:'}</span>
                </div>
                <MarkdownRenderer content={currentQ.explanation} />
              </div>
            )}

            {/* Bottom Controls */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-5 dark:border-slate-800">
              <button
                onClick={handlePrevQuestion}
                disabled={currentQuestionIndex === 0}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-30 dark:border-slate-800 dark:text-slate-400"
              >
                Previous
              </button>

              <button
                onClick={handleNextQuestion}
                disabled={!hasAnsweredCurrent}
                className="flex items-center gap-1.5 rounded-2xl bg-purple-600 px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-purple-700 disabled:opacity-40 transition"
              >
                <span>{currentQuestionIndex === totalQuestions - 1 ? 'Finish & See Score' : 'Next Question'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // QUIZ LIST & GENERATOR VIEW
  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header Banner */}
      <div className="rounded-3xl border border-purple-500/20 bg-gradient-to-r from-purple-500/10 via-pink-500/5 to-transparent p-6 sm:p-8 dark:border-purple-500/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-700 dark:text-purple-300">
              <Award className="h-3.5 w-3.5" />
              <span>Interactive Knowledge Evaluation</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Quiz Generator & Mastery Evaluator
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
              Test your grasp of any topic with targeted multiple-choice and true/false questions. Receive instant scoring, celebrate achievements, and discover the reasoning behind each choice.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Generate Quiz Form (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800/80 dark:bg-slate-900">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <Plus className="h-4 w-4 text-purple-600" />
              <span>Create New Quiz</span>
            </h3>

            <form onSubmit={handleGenerateQuiz} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Subject
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value as AcademicSubject)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-medium text-slate-800 outline-none focus:border-purple-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 transition"
                >
                  <option value="Mathematics">Mathematics</option>
                  <option value="Physics & Science">Physics & Science</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Biology & Chemistry">Biology & Chemistry</option>
                  <option value="History & Humanities">History & Humanities</option>
                  <option value="Languages & Literature">Languages & Literature</option>
                  <option value="Economics & Finance">Economics & Finance</option>
                  <option value="General Knowledge">General Academic</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Topic to Test *
                </label>
                <input
                  type="text"
                  required
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. World War II Causes, Python Recursion, Genetics"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-purple-500 focus:bg-white dark:border-slate-800 dark:bg-slate-800/80 dark:text-white transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Difficulty
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as StudentLevel)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:border-purple-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 transition capitalize"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Questions Count
                  </label>
                  <select
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:border-purple-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 transition"
                  >
                    <option value={3}>3 Questions (Quick check)</option>
                    <option value={4}>4 Questions (Standard)</option>
                    <option value={6}>6 Questions (Deep review)</option>
                    <option value={8}>8 Questions (Comprehensive)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Or Paste Study Text to Quiz On (Optional)
                </label>
                <textarea
                  rows={3}
                  value={sourceText}
                  onChange={(e) => setSourceText(e.target.value)}
                  placeholder="Paste lecture excerpt or notes to turn into a test..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-purple-500 focus:bg-white dark:border-slate-800 dark:bg-slate-800/80 dark:text-white transition"
                />
              </div>

              <button
                type="submit"
                disabled={(!topic.trim() && !sourceText.trim()) || isLoading}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-purple-600 px-4 py-3 text-sm font-bold text-white shadow-md hover:bg-purple-700 disabled:opacity-50 transition active:scale-98"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Writing Questions & Explanations...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Generate & Launch Quiz</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Quizzes Gallery (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-xs dark:border-slate-800/80 dark:bg-slate-900 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="h-5 w-5 text-purple-600" />
                <span>Available Quizzes ({quizzes.length})</span>
              </h3>
            </div>

            <div className="space-y-3">
              {quizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className="group rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 sm:p-5 transition hover:border-purple-500/60 hover:bg-purple-50/20 dark:border-slate-800/80 dark:bg-slate-800/40 dark:hover:bg-purple-950/20"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-purple-500/10 px-2.5 py-0.5 text-[10px] font-bold text-purple-600 dark:text-purple-400">
                          {quiz.subject}
                        </span>
                        <span className="text-[11px] text-slate-400 capitalize">
                          {quiz.difficulty} • {quiz.questions.length} questions
                        </span>
                      </div>
                      <h4 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition">
                        {quiz.title}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-1">{quiz.topic}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      {quiz.score !== undefined && (
                        <div className="text-right">
                          <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            Best: {quiz.score}%
                          </span>
                        </div>
                      )}

                      <button
                        onClick={() => handleStartQuiz(quiz)}
                        className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-purple-700 transition"
                      >
                        <Play className="h-3.5 w-3.5" />
                        <span>Start Quiz</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
