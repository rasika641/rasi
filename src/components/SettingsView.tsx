import React, { useState } from 'react';
import { StudentLevel, TutorTeachingMode, UserPreferences } from '../types';
import {
  Bell,
  Check,
  Compass,
  GraduationCap,
  Moon,
  RotateCcw,
  Save,
  Settings,
  Sparkles,
  Sun,
  User,
  Volume2,
} from 'lucide-react';

interface SettingsViewProps {
  preferences: UserPreferences;
  onSavePreferences: (prefs: UserPreferences) => void;
  onResetData: () => void;
  darkMode: boolean;
  onToggleTheme: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  preferences,
  onSavePreferences,
  onResetData,
  darkMode,
  onToggleTheme,
}) => {
  const [name, setName] = useState(preferences.studentName);
  const [level, setLevel] = useState<StudentLevel>(preferences.defaultLevel);
  const [mode, setMode] = useState<TutorTeachingMode>(preferences.preferredMode);
  const [dailyGoal, setDailyGoal] = useState(preferences.dailyGoalMinutes);
  const [voiceTTS, setVoiceTTS] = useState(preferences.enableVoiceTTS);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSavePreferences({
      ...preferences,
      studentName: name.trim() || 'Alex Rivera',
      defaultLevel: level,
      preferredMode: mode,
      dailyGoalMinutes: dailyGoal,
      enableVoiceTTS: voiceTTS,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header Banner */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs dark:border-slate-800/80 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Settings className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Tutor Preferences & Profile
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Customize how MindBloom AI personalizes its explanations, hints, and learning sessions.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Card */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800/80 dark:bg-slate-900 space-y-5">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <User className="h-4 w-4 text-emerald-600" />
            <span>Student Profile</span>
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Your Preferred Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full max-w-md rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs sm:text-sm text-slate-900 outline-none focus:border-emerald-500 focus:bg-white dark:border-slate-800 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Default Academic Level
              </label>
              <div className="grid grid-cols-3 max-w-md gap-2">
                {(['beginner', 'intermediate', 'advanced'] as StudentLevel[]).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setLevel(lvl)}
                    className={`rounded-xl border p-2.5 text-xs font-semibold capitalize transition ${
                      level === lvl
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
              <p className="mt-1.5 text-[11px] text-slate-400">
                Beginner uses simplified analogies; Intermediate includes formulas; Advanced dives deep into rigor.
              </p>
            </div>
          </div>
        </div>

        {/* Tutoring Behavior Preferences */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800/80 dark:bg-slate-900 space-y-5">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Compass className="h-4 w-4 text-indigo-600" />
            <span>Tutor Behavior & Pedagogy</span>
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Default Teaching Approach
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 max-w-xl gap-3">
                <div
                  onClick={() => setMode('socratic')}
                  className={`cursor-pointer rounded-2xl border p-4 text-xs transition ${
                    mode === 'socratic'
                      ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/30'
                      : 'border-slate-200 hover:bg-slate-50 dark:border-slate-800'
                  }`}
                >
                  <div className="font-bold text-slate-900 dark:text-white mb-1">
                    Socratic Guide (Recommended)
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                    Guides you with thoughtful questions, builds intuition step-by-step, and probes your understanding.
                  </p>
                </div>

                <div
                  onClick={() => setMode('direct')}
                  className={`cursor-pointer rounded-2xl border p-4 text-xs transition ${
                    mode === 'direct'
                      ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/30'
                      : 'border-slate-200 hover:bg-slate-50 dark:border-slate-800'
                  }`}
                >
                  <div className="font-bold text-slate-900 dark:text-white mb-1">
                    Direct Explainer
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                    Provides comprehensive explanations, clear definitions, and worked examples immediately.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Daily Study Goal (Minutes)
              </label>
              <input
                type="number"
                min={15}
                max={300}
                step={15}
                value={dailyGoal}
                onChange={(e) => setDailyGoal(Number(e.target.value))}
                className="w-36 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div className="flex items-center justify-between max-w-md pt-2">
              <div>
                <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 block">
                  Audio Speech Synthesis
                </span>
                <span className="text-[11px] text-slate-400">
                  Enable "Read Aloud" buttons on tutor explanations
                </span>
              </div>
              <input
                type="checkbox"
                checked={voiceTTS}
                onChange={(e) => setVoiceTTS(e.target.checked)}
                className="h-4 w-4 accent-emerald-600 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Theme Settings */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800/80 dark:bg-slate-900 space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            {darkMode ? <Moon className="h-4 w-4 text-indigo-400" /> : <Sun className="h-4 w-4 text-amber-500" />}
            <span>Interface Appearance</span>
          </h3>

          <div className="flex items-center justify-between max-w-md">
            <div>
              <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 block">
                {darkMode ? 'Dark Mode Active' : 'Light Mode Active'}
              </span>
              <span className="text-[11px] text-slate-400">
                Easier on the eyes during late-night study sessions
              </span>
            </div>
            <button
              type="button"
              onClick={onToggleTheme}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 transition"
            >
              Toggle {darkMode ? 'Light' : 'Dark'}
            </button>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-emerald-700 transition active:scale-95"
          >
            <Save className="h-4 w-4" />
            <span>Save Preferences</span>
          </button>

          {savedSuccess && (
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <Check className="h-4 w-4" />
              <span>Preferences Saved Successfully!</span>
            </span>
          )}

          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-1.5 text-xs text-rose-500 hover:text-rose-700 transition"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </form>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600">
              <RotateCcw className="h-6 w-6" />
            </div>
            <h4 className="font-bold text-base text-slate-900 dark:text-white">
              Reset to Sample Data?
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              This will restore the original demo sample quizzes, decks, study plans, and learning streak.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 dark:border-slate-800 dark:text-slate-400"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onResetData();
                  setShowResetConfirm(false);
                }}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 transition"
              >
                Yes, Reset All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
