import React from 'react';
import {
  ArrowRight,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Flame,
  HelpCircle,
  Layers,
  MessageSquare,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { Quiz, StudentStats, StudyPlan } from '../types';
import { ActiveTab } from './Sidebar';

interface DashboardProps {
  stats: StudentStats;
  studentName: string;
  studyPlans: StudyPlan[];
  quizzes: Quiz[];
  setActiveTab: (tab: ActiveTab) => void;
  onOpenStudyPlan?: (planId: string) => void;
  onOpenQuiz?: (quizId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  stats,
  studentName,
  studyPlans,
  quizzes,
  setActiveTab,
  onOpenStudyPlan,
  onOpenQuiz,
}) => {
  const latestPlan = studyPlans[0];
  const activePlanProgress = latestPlan
    ? Math.round(
        (latestPlan.sessions.filter((s) => s.isCompleted).length /
          latestPlan.sessions.length) *
          100
      )
    : 0;

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 p-6 sm:p-8 text-white shadow-xl shadow-emerald-900/10">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI-Powered Personal Tutor Active</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
            Ready to explore, {studentName.split(' ')[0]}? 🚀
          </h2>

          <p className="text-sm sm:text-base text-emerald-50 leading-relaxed">
            "Education is not the learning of facts, but the training of the mind to think."
            <span className="block text-xs text-emerald-200 mt-1 font-medium">— Albert Einstein</span>
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('tutor')}
              className="flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-xs sm:text-sm font-bold text-emerald-900 shadow-md hover:bg-emerald-50 hover:shadow-lg transition active:scale-95"
            >
              <MessageSquare className="h-4 w-4 text-emerald-600" />
              <span>Ask AI Tutor Any Concept</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              onClick={() => setActiveTab('homework')}
              className="flex items-center gap-2 rounded-2xl bg-emerald-950/40 border border-white/20 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-emerald-950/60 backdrop-blur-md transition active:scale-95"
            >
              <HelpCircle className="h-4 w-4 text-amber-300" />
              <span>Get Homework Hints</span>
            </button>
          </div>
        </div>

        {/* Decorative background glow circles */}
        <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute right-20 -bottom-16 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {/* Total Study Time */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs dark:border-slate-800/80 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Study Time</span>
            <div className="rounded-xl bg-blue-500/10 p-2 text-blue-600 dark:text-blue-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {Math.floor(stats.totalStudyMinutes / 60)}h {stats.totalStudyMinutes % 60}m
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <TrendingUp className="h-3 w-3" />
              <span>+45m vs last week</span>
            </div>
          </div>
        </div>

        {/* Quizzes Completed */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs dark:border-slate-800/80 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Quizzes Taken</span>
            <div className="rounded-xl bg-purple-500/10 p-2 text-purple-600 dark:text-purple-400">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {stats.quizzesCompleted}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span>Avg Score: </span>
              <span className="font-bold text-purple-600 dark:text-purple-400">{stats.averageQuizScore}%</span>
            </div>
          </div>
        </div>

        {/* Flashcards Reviewed */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs dark:border-slate-800/80 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Flashcards Mastered</span>
            <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {stats.flashcardsReviewed}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="h-3 w-3" />
              <span>15 reviewed today</span>
            </div>
          </div>
        </div>

        {/* Active Streak */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs dark:border-slate-800/80 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Active Streak</span>
            <div className="rounded-xl bg-amber-500/10 p-2 text-amber-600 dark:text-amber-400">
              <Flame className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {stats.streakDays} Days 🔥
            </div>
            <div className="mt-1 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span>Goal: 7 days milestone</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Feature Cards */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-500" />
            <span>Learning Tools</span>
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">Select any tool to begin</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card 1: AI Tutor */}
          <div
            onClick={() => setActiveTab('tutor')}
            className="group cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:-translate-y-0.5 hover:border-emerald-500/60 hover:shadow-md dark:border-slate-800/80 dark:bg-slate-900"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition">
                <MessageSquare className="h-5 w-5" />
              </div>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                Socratic
              </span>
            </div>
            <h4 className="mt-4 font-bold text-base text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
              AI Tutor & Explainer
            </h4>
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Ask about any concept. Get analogies, step-by-step reasoning, and patient guidance.
            </p>
          </div>

          {/* Card 2: Homework Helper */}
          <div
            onClick={() => setActiveTab('homework')}
            className="group cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:-translate-y-0.5 hover:border-amber-500/60 hover:shadow-md dark:border-slate-800/80 dark:bg-slate-900"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:bg-amber-600 group-hover:text-white transition">
                <HelpCircle className="h-5 w-5" />
              </div>
              <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                Hints-First
              </span>
            </div>
            <h4 className="mt-4 font-bold text-base text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition">
              Homework Helper
            </h4>
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Paste tricky problems. Get progressive hints and misconception checks without giving away answers.
            </p>
          </div>

          {/* Card 3: Study Planner */}
          <div
            onClick={() => setActiveTab('planner')}
            className="group cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:-translate-y-0.5 hover:border-blue-500/60 hover:shadow-md dark:border-slate-800/80 dark:bg-slate-900"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition">
                <Calendar className="h-5 w-5" />
              </div>
              <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                Sessions
              </span>
            </div>
            <h4 className="mt-4 font-bold text-base text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
              Smart Study Planner
            </h4>
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Enter your topic and available study time to generate structured sessions with Pomodoro timer.
            </p>
          </div>

          {/* Card 4: Quiz Generator */}
          <div
            onClick={() => setActiveTab('quiz')}
            className="group cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:-translate-y-0.5 hover:border-purple-500/60 hover:shadow-md dark:border-slate-800/80 dark:bg-slate-900"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition">
                <Award className="h-5 w-5" />
              </div>
              <span className="rounded-full bg-purple-500/10 px-2 py-0.5 text-[11px] font-semibold text-purple-600 dark:text-purple-400">
                Interactive
              </span>
            </div>
            <h4 className="mt-4 font-bold text-base text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition">
              Quiz Generator
            </h4>
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Generate custom quizzes with multiple choice, true/false, score tracker, and deep answer explanations.
            </p>
          </div>

          {/* Card 5: Flashcards */}
          <div
            onClick={() => setActiveTab('flashcards')}
            className="group cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:-translate-y-0.5 hover:border-rose-500/60 hover:shadow-md dark:border-slate-800/80 dark:bg-slate-900"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 group-hover:bg-rose-600 group-hover:text-white transition">
                <Layers className="h-5 w-5" />
              </div>
              <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                3D Flip
              </span>
            </div>
            <h4 className="mt-4 font-bold text-base text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition">
              Interactive Flashcards
            </h4>
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Train with spaced repetition. Flip cards in 3D, rate difficulty, and build mastery decks.
            </p>
          </div>

          {/* Card 6: Summarizer */}
          <div
            onClick={() => setActiveTab('summarizer')}
            className="group cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:-translate-y-0.5 hover:border-teal-500/60 hover:shadow-md dark:border-slate-800/80 dark:bg-slate-900"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 group-hover:bg-teal-600 group-hover:text-white transition">
                <BookOpen className="h-5 w-5" />
              </div>
              <span className="rounded-full bg-teal-500/10 px-2 py-0.5 text-[11px] font-semibold text-teal-600 dark:text-teal-400">
                Notes & Terms
              </span>
            </div>
            <h4 className="mt-4 font-bold text-base text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition">
              Note Summarizer
            </h4>
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Paste long articles or study notes. Extract executive summary, key definitions, and practice questions.
            </p>
          </div>
        </div>
      </div>

      {/* Two Column Section: Active Study Plan & Subject Mastery */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: In-progress Study Plan */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <span>Current Study Plan</span>
            </h3>
            <button
              onClick={() => setActiveTab('planner')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 transition flex items-center gap-1"
            >
              <span>View All Plans</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {latestPlan ? (
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800/80 dark:bg-slate-900">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    {latestPlan.subject} • {latestPlan.totalTimeMinutes} min total
                  </div>
                  <h4 className="mt-2 text-lg font-bold text-slate-900 dark:text-white">
                    {latestPlan.title}
                  </h4>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-xl">
                    {latestPlan.goal}
                  </p>
                </div>

                <div className="sm:text-right">
                  <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    {activePlanProgress}%
                  </div>
                  <span className="text-[11px] text-slate-400">Completed</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                  style={{ width: `${activePlanProgress}%` }}
                />
              </div>

              {/* Sessions breakdown list preview */}
              <div className="mt-5 space-y-2.5">
                {latestPlan.sessions.slice(0, 3).map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-xs dark:bg-slate-800/60"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${
                          session.isCompleted
                            ? 'bg-emerald-500 text-white'
                            : 'border border-slate-300 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400'
                        }`}
                      >
                        {session.isCompleted ? <CheckCircle2 className="h-3.5 w-3.5" /> : session.sessionNumber}
                      </div>
                      <span className={`font-medium ${session.isCompleted ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                        {session.title}
                      </span>
                    </div>
                    <span className="text-slate-400 font-mono text-[11px]">{session.durationMinutes}m</span>
                  </div>
                ))}
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  onClick={() => {
                    if (onOpenStudyPlan) onOpenStudyPlan(latestPlan.id);
                    setActiveTab('planner');
                  }}
                  className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition"
                >
                  <span>Continue Next Session</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-800">
              <Calendar className="mx-auto h-8 w-8 text-slate-400" />
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                No active study plan yet
              </p>
              <button
                onClick={() => setActiveTab('planner')}
                className="mt-3 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition"
              >
                Create a Study Plan with AI
              </button>
            </div>
          )}
        </div>

        {/* Right 1 Col: Subject Mastery & Recent Activity */}
        <div className="space-y-6">
          {/* Subject Mastery */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800/80 dark:bg-slate-900">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Target className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Subject Mastery</span>
            </h4>
            <div className="mt-4 space-y-3.5">
              {Object.entries(stats.subjectMastery).map(([subj, score]) => (
                <div key={subj}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-slate-700 dark:text-slate-300">{subj}</span>
                    <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">{score}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity Mini Feed */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800/80 dark:bg-slate-900">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="h-4 w-4 text-indigo-500" />
              <span>Recent Activity</span>
            </h4>
            <div className="mt-4 space-y-3">
              {stats.recentActivities.slice(0, 3).map((act) => (
                <div key={act.id} className="border-l-2 border-emerald-500/40 pl-3">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {act.title}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {act.detail} • <span className="italic">{act.timestamp}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
