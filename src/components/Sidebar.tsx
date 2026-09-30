import React from 'react';
import {
  Award,
  BookOpen,
  Calendar,
  Flame,
  GraduationCap,
  HelpCircle,
  Layers,
  LayoutDashboard,
  MessageSquare,
  Moon,
  Settings,
  Sun,
  TrendingUp,
  X,
} from 'lucide-react';
import { StudentLevel } from '../types';

export type ActiveTab = 
  | 'dashboard'
  | 'tutor'
  | 'homework'
  | 'planner'
  | 'quiz'
  | 'flashcards'
  | 'summarizer'
  | 'progress'
  | 'settings';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isOpen: boolean;
  onClose: () => void;
  streakDays: number;
  studentLevel: StudentLevel;
  onLevelChange: (level: StudentLevel) => void;
  darkMode: boolean;
  onToggleTheme: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  onClose,
  streakDays,
  studentLevel,
  onLevelChange,
  darkMode,
  onToggleTheme,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tutor', label: 'AI Tutor', icon: MessageSquare, badge: 'Socratic' },
    { id: 'homework', label: 'Homework Helper', icon: HelpCircle, badge: 'Hints' },
    { id: 'planner', label: 'Study Planner', icon: Calendar },
    { id: 'quiz', label: 'Quiz Generator', icon: Award },
    { id: 'flashcards', label: 'Flashcards', icon: Layers },
    { id: 'summarizer', label: 'Summarizer', icon: BookOpen },
    { id: 'progress', label: 'Progress & Stats', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200/80 bg-white transition-transform duration-300 ease-in-out dark:border-slate-800 dark:bg-slate-950 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-18 items-center justify-between border-b border-slate-100 px-5 dark:border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/20">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">
                  MindBloom
                </span>
                <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Personal Learning Tutor
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Streak & Level Widget */}
        <div className="p-4">
          <div className="rounded-2xl border border-slate-200/70 bg-gradient-to-br from-slate-50 to-emerald-50/30 p-3.5 dark:border-slate-800/80 dark:from-slate-900 dark:to-emerald-950/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                  <Flame className="h-5 w-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-1 font-bold text-sm text-slate-800 dark:text-slate-200">
                    <span>{streakDays} Day Streak!</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Consistent active learner
                  </p>
                </div>
              </div>
            </div>

            {/* Level Quick Select */}
            <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-800/80">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Tutor Level</span>
                <span className="capitalize font-semibold text-emerald-600 dark:text-emerald-400">
                  {studentLevel}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-200/60 p-1 dark:bg-slate-800/80">
                {(['beginner', 'intermediate', 'advanced'] as StudentLevel[]).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => onLevelChange(lvl)}
                    className={`rounded-lg py-1 text-[11px] font-medium capitalize transition ${
                      studentLevel === lvl
                        ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white font-semibold'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-1 custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id as ActiveTab)}
                className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {'badge' in item && item.badge && (
                  <span
                    className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Theme & Status */}
        <div className="border-t border-slate-100 p-4 dark:border-slate-800/80">
          <div className="flex items-center justify-between">
            <button
              onClick={onToggleTheme}
              className="flex items-center gap-2 rounded-xl border border-slate-200/80 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 transition"
            >
              {darkMode ? (
                <>
                  <Sun className="h-4 w-4 text-amber-400" />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4 text-indigo-500" />
                  <span>Dark Mode</span>
                </>
              )}
            </button>

            <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              Gemini 3.8
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
