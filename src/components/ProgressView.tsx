import React from 'react';
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Flame,
  HelpCircle,
  Layers,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  Zap,
} from 'lucide-react';
import { Quiz, StudentStats, StudyPlan } from '../types';

interface ProgressViewProps {
  stats: StudentStats;
  studyPlans: StudyPlan[];
  quizzes: Quiz[];
}

export const ProgressView: React.FC<ProgressViewProps> = ({
  stats,
  studyPlans,
  quizzes,
}) => {
  const completedSessionsTotal = studyPlans.reduce(
    (acc, plan) => acc + plan.sessions.filter((s) => s.isCompleted).length,
    0
  );

  const achievements = [
    {
      id: 'ach-1',
      title: '5-Day Streak Champion',
      description: 'Logged in and studied for 5 consecutive days',
      icon: Flame,
      color: 'from-amber-500 to-orange-500',
      unlocked: stats.streakDays >= 5,
      date: 'Earned today',
    },
    {
      id: 'ach-2',
      title: 'Quiz Ace (85%+ Average)',
      description: 'Maintained an average quiz score over 85%',
      icon: Award,
      color: 'from-purple-500 to-indigo-500',
      unlocked: stats.averageQuizScore >= 85,
      date: 'Earned this week',
    },
    {
      id: 'ach-3',
      title: 'Active Recall Master',
      description: 'Reviewed over 50 flashcards with spaced repetition',
      icon: Layers,
      color: 'from-rose-500 to-pink-500',
      unlocked: stats.flashcardsReviewed >= 50,
      date: 'Earned 3 days ago',
    },
    {
      id: 'ach-4',
      title: 'Deep Inquirer',
      description: 'Asked AI tutor 25+ conceptual questions',
      icon: Sparkles,
      color: 'from-emerald-500 to-teal-500',
      unlocked: stats.questionsAsked >= 25,
      date: 'Earned yesterday',
    },
    {
      id: 'ach-5',
      title: 'Homework Detective',
      description: 'Used progressive hints to solve 5+ homework problems',
      icon: HelpCircle,
      color: 'from-blue-500 to-cyan-500',
      unlocked: stats.homeworkProblemsSolved >= 5,
      date: 'Earned this month',
    },
  ];

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header Banner */}
      <div className="rounded-3xl border border-indigo-500/20 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent p-6 sm:p-8 dark:border-indigo-500/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Personal Learning Milestones</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Learning Analytics & Progress
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
              Celebrate your consistency, track mastery across subjects, review recent accomplishments, and stay motivated on your educational journey.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
              <Flame className="h-7 w-7" />
            </div>
            <div>
              <span className="block text-2xl font-black text-slate-900 dark:text-white">
                {stats.streakDays} Days
              </span>
              <span className="text-xs text-slate-500">Current Study Streak</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Stats Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800/80 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Total Study Time</span>
            <Clock className="h-4 w-4 text-blue-500" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {Math.floor(stats.totalStudyMinutes / 60)}h {stats.totalStudyMinutes % 60}m
            </span>
            <span className="block mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              Over 5 active days
            </span>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800/80 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Average Quiz Score</span>
            <Award className="h-4 w-4 text-purple-500" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {stats.averageQuizScore}%
            </span>
            <span className="block mt-1 text-xs text-slate-500 font-medium">
              Across {stats.quizzesCompleted} quizzes
            </span>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800/80 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Flashcards Retained</span>
            <Layers className="h-4 w-4 text-rose-500" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {stats.flashcardsReviewed}
            </span>
            <span className="block mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              Spaced repetition active
            </span>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800/80 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Sessions Completed</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {completedSessionsTotal}
            </span>
            <span className="block mt-1 text-xs text-slate-500 font-medium">
              In structured study plans
            </span>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Subject Mastery & Achievement Badges */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Subject Mastery Radar / Bars (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800/80 dark:bg-slate-900 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Target className="h-5 w-5 text-emerald-600" />
                <span>Subject Competency Breakdown</span>
              </h3>
              <span className="text-xs text-slate-400">Mastery Index</span>
            </div>

            <div className="space-y-4">
              {Object.entries(stats.subjectMastery).map(([subject, score]) => (
                <div key={subject} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {subject}
                    </span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {score}%
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Log */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800/80 dark:bg-slate-900 space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <span>Recent Learning History</span>
            </h3>

            <div className="space-y-3">
              {stats.recentActivities.map((act) => (
                <div
                  key={act.id}
                  className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 text-xs dark:border-slate-800 dark:bg-slate-800/50"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {act.title}
                    </span>
                    <span className="text-[10px] text-slate-400">{act.timestamp}</span>
                  </div>
                  <p className="mt-1 text-slate-500 dark:text-slate-400">{act.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Achievements & Badges (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800/80 dark:bg-slate-900 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-500" />
                <span>Earned Achievements</span>
              </h3>
              <span className="text-xs text-amber-600 dark:text-amber-400 font-bold">
                {achievements.filter((a) => a.unlocked).length} / {achievements.length} Unlocked
              </span>
            </div>

            <div className="space-y-3">
              {achievements.map((ach) => {
                const Icon = ach.icon;
                return (
                  <div
                    key={ach.id}
                    className={`flex items-start gap-4 rounded-2xl border p-4 transition ${
                      ach.unlocked
                        ? 'border-amber-200/80 bg-amber-50/30 dark:border-amber-900/40 dark:bg-amber-950/20'
                        : 'border-slate-200/60 bg-slate-50/50 opacity-60 dark:border-slate-800'
                    }`}
                  >
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-sm bg-gradient-to-tr ${ach.color}`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                          {ach.title}
                        </h4>
                        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                          {ach.unlocked ? ach.date : 'Locked'}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {ach.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
