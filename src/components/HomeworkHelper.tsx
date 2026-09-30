import React, { useState } from 'react';
import {
  AcademicSubject,
  HomeworkHint,
  HomeworkItem,
  StudentLevel,
} from '../types';
import { MarkdownRenderer } from '../utils/markdown';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Eye,
  HelpCircle,
  KeyRound,
  Lightbulb,
  Lock,
  Plus,
  RefreshCw,
  Sparkles,
  Unlock,
} from 'lucide-react';

interface HomeworkHelperProps {
  homeworkList: HomeworkItem[];
  onAddHomework: (item: HomeworkItem) => void;
  onUpdateHomework: (item: HomeworkItem) => void;
  currentLevel: StudentLevel;
}

const SAMPLE_PROBLEMS = [
  {
    title: 'Physics Kinematics',
    subject: 'Physics & Science' as AcademicSubject,
    problem: 'A car accelerates uniformly from rest to 28 m/s in 7.0 seconds. How far does the car travel during this time?',
    attempt: 'I know v = 28 m/s, t = 7.0 s, and initial speed u = 0. I tried using d = v * t but that gave 196 m which felt too high for an accelerating car.',
  },
  {
    title: 'Calculus Optimization',
    subject: 'Mathematics' as AcademicSubject,
    problem: 'Find two positive numbers whose sum is 30 and whose product is as large as possible.',
    attempt: 'Let x and y be the numbers. x + y = 30, so y = 30 - x. Product P(x) = x(30 - x) = 30x - x^2. How do I prove the peak using derivatives?',
  },
  {
    title: 'Chemistry Molarity',
    subject: 'Biology & Chemistry' as AcademicSubject,
    problem: 'How many grams of NaCl (molar mass = 58.44 g/mol) are needed to prepare 250 mL of a 0.50 M solution?',
    attempt: 'I know M = moles / liters. 250 mL is 0.25 L. So moles = 0.50 * 0.25 = 0.125 moles. What is the next conversion to grams?',
  },
];

export const HomeworkHelper: React.FC<HomeworkHelperProps> = ({
  homeworkList,
  onAddHomework,
  onUpdateHomework,
  currentLevel,
}) => {
  const [problemText, setProblemText] = useState('');
  const [studentAttempt, setStudentAttempt] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<AcademicSubject>('Mathematics');
  const [isLoading, setIsLoading] = useState(false);
  const [activeItem, setActiveItem] = useState<HomeworkItem | null>(homeworkList[0] || null);

  const handleSelectSample = (sample: typeof SAMPLE_PROBLEMS[0]) => {
    setSelectedSubject(sample.subject);
    setProblemText(sample.problem);
    setStudentAttempt(sample.attempt);
  };

  const handleGenerateHelp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!problemText.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/gemini/homework', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problem: problemText.trim(),
          studentAttempt: studentAttempt.trim(),
          subject: selectedSubject,
          level: currentLevel,
        }),
      });

      const data = await res.json();
      if (!res.ok && !data.hints) {
        throw new Error(data.error || 'Failed to get homework help');
      }

      const newItem: HomeworkItem = {
        id: `hw-${Date.now()}`,
        problem: problemText.trim(),
        subject: selectedSubject,
        level: currentLevel,
        studentAttempt: studentAttempt.trim() || undefined,
        hints: data.hints || [
          {
            hintNumber: 1,
            title: 'Concept Setup',
            content: 'Identify what values are given and what the core target variable is.',
          },
        ],
        fullSolution: data.fullSolution || 'Step-by-step solution.',
        keyFormulas: data.keyFormulas || [],
        misconceptionsIdentified: data.misconceptionsIdentified,
        revealedHintsCount: 1, // reveal 1st hint initially
        isSolutionRevealed: false,
        createdAt: new Date().toISOString(),
      };

      onAddHomework(newItem);
      setActiveItem(newItem);
      setProblemText('');
      setStudentAttempt('');
    } catch (err) {
      console.error('Homework help error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevealNextHint = (item: HomeworkItem) => {
    if (item.revealedHintsCount < item.hints.length) {
      const updated = {
        ...item,
        revealedHintsCount: item.revealedHintsCount + 1,
      };
      setActiveItem(updated);
      onUpdateHomework(updated);
    }
  };

  const handleRevealSolution = (item: HomeworkItem) => {
    const updated = {
      ...item,
      isSolutionRevealed: true,
    };
    setActiveItem(updated);
    onUpdateHomework(updated);
  };

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header Banner */}
      <div className="rounded-3xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent p-6 sm:p-8 dark:border-amber-500/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300">
              <KeyRound className="h-3.5 w-3.5" />
              <span>Pedagogical Hints-First System</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Homework Helper & Step Solver
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
              Never get stuck without learning. MindBloom provides <strong>progressive hints</strong> first to spark your understanding, detects common misconceptions, and displays formulas clearly.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Try Sample:</span>
            {SAMPLE_PROBLEMS.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectSample(sample)}
                className="rounded-xl border border-slate-200/90 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs hover:border-amber-500 hover:text-amber-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 transition"
              >
                {sample.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Input Form (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800/80 dark:bg-slate-900">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <Plus className="h-4 w-4 text-emerald-600" />
              <span>Enter Homework Problem</span>
            </h3>

            <form onSubmit={handleGenerateHelp} className="space-y-4">
              {/* Subject selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Academic Subject
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value as AcademicSubject)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-medium text-slate-800 outline-none focus:border-amber-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 transition"
                >
                  <option value="Mathematics">Mathematics</option>
                  <option value="Physics & Science">Physics & Science</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Biology & Chemistry">Biology & Chemistry</option>
                  <option value="Economics & Finance">Economics & Finance</option>
                  <option value="General Knowledge">General Academic</option>
                </select>
              </div>

              {/* Problem statement */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Problem Description / Exercise *
                </label>
                <textarea
                  required
                  rows={4}
                  value={problemText}
                  onChange={(e) => setProblemText(e.target.value)}
                  placeholder="Paste or type the problem text, numbers, or question..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-amber-500 focus:bg-white dark:border-slate-800 dark:bg-slate-800/80 dark:text-white dark:placeholder-slate-500 transition"
                />
              </div>

              {/* Student's Attempt */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <span>Your Initial Attempt</span>
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-normal">(Recommended)</span>
                  </label>
                </div>
                <textarea
                  rows={3}
                  value={studentAttempt}
                  onChange={(e) => setStudentAttempt(e.target.value)}
                  placeholder="What have you tried so far? Where did you get stuck? (MindBloom will check your thought process)"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-amber-500 focus:bg-white dark:border-slate-800 dark:bg-slate-800/80 dark:text-white dark:placeholder-slate-500 transition"
                />
              </div>

              <button
                type="submit"
                disabled={!problemText.trim() || isLoading}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-amber-600 px-4 py-3 text-sm font-bold text-white shadow-md hover:bg-amber-700 disabled:opacity-50 transition active:scale-98"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Analyzing Problem & Formulating Hints...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Get Progressive Hints & Guidance</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Past Homework Items List */}
          {homeworkList.length > 0 && (
            <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800/80 dark:bg-slate-900">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-3">
                Recent Homework Problems ({homeworkList.length})
              </h4>
              <div className="space-y-2">
                {homeworkList.map((hw) => {
                  const isSelected = activeItem?.id === hw.id;
                  return (
                    <button
                      key={hw.id}
                      onClick={() => setActiveItem(hw)}
                      className={`w-full text-left rounded-2xl p-3 text-xs transition border ${
                        isSelected
                          ? 'border-amber-500 bg-amber-500/10 font-medium text-slate-900 dark:text-white'
                          : 'border-slate-100 bg-slate-50/70 hover:bg-slate-100 text-slate-600 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                          {hw.subject}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {hw.isSolutionRevealed ? 'Solution viewed' : `${hw.revealedHintsCount} hints active`}
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-2 font-medium">{hw.problem}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Progressive Hints & Solution Workspace (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {activeItem ? (
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800/80 dark:bg-slate-900 space-y-6">
              {/* Problem Statement Card */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/60">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span className="font-bold text-amber-600 dark:text-amber-400">{activeItem.subject}</span>
                  <span>Level: {activeItem.level}</span>
                </div>
                <h3 className="font-semibold text-base text-slate-900 dark:text-white leading-relaxed">
                  {activeItem.problem}
                </h3>

                {activeItem.studentAttempt && (
                  <div className="mt-3 rounded-xl bg-white p-3 text-xs border border-slate-200/70 dark:bg-slate-900 dark:border-slate-800">
                    <span className="font-bold text-slate-500 block mb-1">Your attempt:</span>
                    <p className="text-slate-700 dark:text-slate-300 italic">{activeItem.studentAttempt}</p>
                  </div>
                )}
              </div>

              {/* Misconception Feedback if available */}
              {activeItem.misconceptionsIdentified && (
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-xs dark:bg-emerald-950/20">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300 mb-1">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Thought Process Review:</span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {activeItem.misconceptionsIdentified}
                  </p>
                </div>
              )}

              {/* Key Formulas Pill Box */}
              {activeItem.keyFormulas && activeItem.keyFormulas.length > 0 && (
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <span>Key Formulas & Governing Equations</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {activeItem.keyFormulas.map((f, i) => (
                      <span
                        key={i}
                        className="rounded-xl border border-indigo-200/80 bg-indigo-50/80 px-3 py-1 font-mono text-xs font-semibold text-indigo-700 dark:border-indigo-800/80 dark:bg-indigo-950/40 dark:text-indigo-300"
                      >
                        📐 {f}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Progressive Hints Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-amber-500" />
                    <span>Progressive Hints ({activeItem.revealedHintsCount} of {activeItem.hints.length} unlocked)</span>
                  </h4>

                  {activeItem.revealedHintsCount < activeItem.hints.length && (
                    <button
                      onClick={() => handleRevealNextHint(activeItem)}
                      className="flex items-center gap-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-300 hover:bg-amber-500/25 transition"
                    >
                      <Unlock className="h-3.5 w-3.5" />
                      <span>Unlock Hint #{activeItem.revealedHintsCount + 1}</span>
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {activeItem.hints.map((hint, idx) => {
                    const isUnlocked = idx < activeItem.revealedHintsCount;
                    return (
                      <div
                        key={hint.hintNumber}
                        className={`rounded-2xl border p-4 transition ${
                          isUnlocked
                            ? 'border-amber-200 bg-amber-50/40 dark:border-amber-900/40 dark:bg-amber-950/20'
                            : 'border-slate-200 bg-slate-100/50 opacity-60 dark:border-slate-800 dark:bg-slate-900/40'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs flex items-center gap-2 text-slate-800 dark:text-slate-200">
                            {isUnlocked ? (
                              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-white font-bold text-[10px]">
                                {hint.hintNumber}
                              </span>
                            ) : (
                              <Lock className="h-4 w-4 text-slate-400" />
                            )}
                            <span>Hint {hint.hintNumber}: {hint.title}</span>
                          </span>

                          <span className="text-[10px] text-slate-400 font-medium">
                            {isUnlocked ? 'Unlocked' : 'Locked'}
                          </span>
                        </div>

                        {isUnlocked ? (
                          <div className="mt-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed pl-7">
                            <MarkdownRenderer content={hint.content} />
                          </div>
                        ) : (
                          <p className="mt-2 text-xs text-slate-400 italic pl-7">
                            Try working through the previous hint first!
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Full Step-by-Step Solution Section */}
              <div className="border-t border-slate-200 pt-5 dark:border-slate-800">
                {!activeItem.isSolutionRevealed ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-6 text-center dark:border-slate-800 dark:bg-slate-900/50">
                    <Lock className="mx-auto h-8 w-8 text-slate-400" />
                    <h5 className="mt-2 font-bold text-sm text-slate-800 dark:text-slate-200">
                      Full Step-by-Step Solution is Hidden
                    </h5>
                    <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
                      Try solving the problem using the hints first. When you are ready to verify your work, unlock the complete breakdown.
                    </p>
                    <button
                      onClick={() => handleRevealSolution(activeItem)}
                      className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition shadow-sm"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Reveal Full Step-by-Step Solution</span>
                    </button>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-emerald-500/30 bg-emerald-50/20 p-5 dark:border-emerald-500/20 dark:bg-emerald-950/20 space-y-3">
                    <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                      <div className="flex items-center gap-2 font-bold text-sm text-emerald-800 dark:text-emerald-300">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Complete Step-by-Step Verified Solution</span>
                      </div>
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                        Unlocked
                      </span>
                    </div>

                    <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                      <MarkdownRenderer content={activeItem.fullSolution} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-800">
              <HelpCircle className="mx-auto h-10 w-10 text-slate-400" />
              <h4 className="mt-3 font-bold text-base text-slate-700 dark:text-slate-300">
                No Homework Problem Selected
              </h4>
              <p className="mt-1 text-xs text-slate-500">
                Enter your homework problem on the left or click one of the sample problems to see progressive hints.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
