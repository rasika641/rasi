import React from 'react';
import {
  Flame,
  Menu,
  MessageSquare,
  Moon,
  Sparkles,
  Sun,
  User,
} from 'lucide-react';
import { AcademicSubject, StudentLevel } from '../types';
import { ActiveTab } from './Sidebar';

interface NavbarProps {
  onOpenSidebar: () => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  streakDays: number;
  studentName: string;
  studentLevel: StudentLevel;
  selectedSubject: AcademicSubject;
  onSubjectChange: (sub: AcademicSubject) => void;
  darkMode: boolean;
  onToggleTheme: () => void;
}

const SUBJECT_LIST: AcademicSubject[] = [
  'All Subjects',
  'Mathematics',
  'Physics & Science',
  'Computer Science',
  'Biology & Chemistry',
  'History & Humanities',
  'Languages & Literature',
  'Economics & Finance',
];

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSidebar,
  activeTab,
  setActiveTab,
  streakDays,
  studentName,
  studentLevel,
  selectedSubject,
  onSubjectChange,
  darkMode,
  onToggleTheme,
}) => {
  const getTabTitle = (tab: ActiveTab) => {
    switch (tab) {
      case 'dashboard': return 'Learning Dashboard';
      case 'tutor': return 'AI Socratic Tutor';
      case 'homework': return 'Homework Helper & Hints';
      case 'planner': return 'Smart Study Planner';
      case 'quiz': return 'Interactive Quiz Generator';
      case 'flashcards': return 'Flashcards & Spaced Repetition';
      case 'summarizer': return 'Study Material Summarizer';
      case 'progress': return 'Learning Analytics & Progress';
      case 'settings': return 'Preferences & Profile';
      default: return 'MindBloom Tutor';
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-18 w-full items-center justify-between border-b border-slate-200/80 bg-white/80 px-4 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/80 sm:px-6 lg:px-8">
      {/* Left section: Hamburger & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 lg:hidden"
          aria-label="Open Navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <h1 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
            <span>{getTabTitle(activeTab)}</span>
            {activeTab === 'tutor' && (
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <Sparkles className="h-3 w-3" />
                Adaptive
              </span>
            )}
          </h1>
          <p className="hidden md:block text-xs text-slate-500 dark:text-slate-400">
            Powered by Google Gemini 3.8 Flash • Level: <span className="capitalize font-medium text-emerald-600 dark:text-emerald-400">{studentLevel}</span>
          </p>
        </div>
      </div>

      {/* Right Section: Subject Filter, Streak, Quick Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Subject quick selector for views where subject is relevant */}
        {['tutor', 'quiz', 'planner', 'homework'].includes(activeTab) && (
          <div className="hidden md:flex items-center">
            <select
              value={selectedSubject}
              onChange={(e) => onSubjectChange(e.target.value as AcademicSubject)}
              className="rounded-xl border border-slate-200/80 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 outline-none hover:bg-slate-100 focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition"
            >
              {SUBJECT_LIST.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Quick Launch Ask Tutor */}
        {activeTab !== 'tutor' && (
          <button
            onClick={() => setActiveTab('tutor')}
            className="hidden sm:flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-emerald-700 transition"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Ask Tutor</span>
          </button>
        )}

        {/* Streak Pill */}
        <div
          title="Daily Study Streak"
          className="flex items-center gap-1 rounded-xl border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-600 dark:text-amber-400"
        >
          <Flame className="h-4 w-4" />
          <span>{streakDays}d</span>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          className="rounded-xl border border-slate-200/80 p-2 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 transition"
          aria-label="Toggle Dark Mode"
        >
          {darkMode ? (
            <Sun className="h-4 w-4 text-amber-400" />
          ) : (
            <Moon className="h-4 w-4 text-indigo-500" />
          )}
        </button>

        {/* Student Avatar / Profile */}
        <div
          onClick={() => setActiveTab('settings')}
          className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50/70 p-1 pr-3 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900/80 dark:hover:bg-slate-800 transition"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold text-xs">
            {studentName.charAt(0)}
          </div>
          <span className="hidden sm:inline text-xs font-medium text-slate-700 dark:text-slate-300">
            {studentName.split(' ')[0]}
          </span>
        </div>
      </div>
    </header>
  );
};
