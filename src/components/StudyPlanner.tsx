import React, { useState, useEffect } from 'react';
import {
  AcademicSubject,
  StudentLevel,
  StudyPlan,
  StudySession,
} from '../types';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  FileCheck,
  Pause,
  Play,
  Plus,
  RefreshCw,
  RotateCcw,
  Sparkles,
  Target,
  Trash2,
  Volume2,
} from 'lucide-react';

interface StudyPlannerProps {
  studyPlans: StudyPlan[];
  onAddPlan: (plan: StudyPlan) => void;
  onUpdatePlan: (plan: StudyPlan) => void;
  onDeletePlan: (planId: string) => void;
  currentLevel: StudentLevel;
  selectedSubject: AcademicSubject;
}

export const StudyPlanner: React.FC<StudyPlannerProps> = ({
  studyPlans,
  onAddPlan,
  onUpdatePlan,
  onDeletePlan,
  currentLevel,
  selectedSubject,
}) => {
  const [topic, setTopic] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [goal, setGoal] = useState('');
  const [subject, setSubject] = useState<AcademicSubject>(selectedSubject !== 'All Subjects' ? selectedSubject : 'Mathematics');
  const [isLoading, setIsLoading] = useState(false);
  const [activePlanId, setActivePlanId] = useState<string>(studyPlans[0]?.id || '');

  // Session Focus Timer State (Pomodoro)
  const [timerSecondsLeft, setTimerSecondsLeft] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [activeSessionTitle, setActiveSessionTitle] = useState('Session Focus Timer');

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSecondsLeft > 0) {
      interval = setInterval(() => {
        setTimerSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (timerSecondsLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      // Play a gentle alert beep via Web Audio API
      playTimerChime();
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSecondsLeft]);

  const playTimerChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.5); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.8);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.8);
    } catch (e) {
      console.warn('Audio chime failed:', e);
    }
  };

  const handleStartSessionTimer = (session: StudySession) => {
    setActiveSessionTitle(session.title);
    setTimerSecondsLeft(session.durationMinutes * 60);
    setIsTimerRunning(true);
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/gemini/study-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          totalTimeMinutes: durationMinutes,
          goal: goal.trim() || `Master core foundations of ${topic.trim()}`,
          subject,
          level: currentLevel,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.sessions) {
        throw new Error(data.error || 'Failed to generate study plan');
      }

      const newPlan: StudyPlan = {
        id: `plan-${Date.now()}`,
        title: data.title || `Mastery Plan: ${topic}`,
        subject: data.subject || subject,
        level: currentLevel,
        goal: data.goal || goal || 'Understand and apply core concepts',
        totalTimeMinutes: data.totalTimeMinutes || durationMinutes,
        sessions: (data.sessions || []).map((s: any, idx: number) => ({
          id: `sess-${Date.now()}-${idx}`,
          sessionNumber: s.sessionNumber || idx + 1,
          title: s.title || `Session ${idx + 1}`,
          durationMinutes: s.durationMinutes || 20,
          description: s.description || '',
          keyConcepts: s.keyConcepts || [],
          revisionTips: s.revisionTips || [],
          practiceTask: s.practiceTask || '',
          isCompleted: false,
        })),
        createdAt: new Date().toISOString(),
      };

      onAddPlan(newPlan);
      setActivePlanId(newPlan.id);
      setTopic('');
      setGoal('');
    } catch (err) {
      console.error('Error creating study plan:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const currentPlan = studyPlans.find((p) => p.id === activePlanId) || studyPlans[0];

  const handleToggleSessionComplete = (sessionId: string) => {
    if (!currentPlan) return;
    const updatedSessions = currentPlan.sessions.map((s) =>
      s.id === sessionId ? { ...s, isCompleted: !s.isCompleted } : s
    );
    const updatedPlan = { ...currentPlan, sessions: updatedSessions };
    onUpdatePlan(updatedPlan);
  };

  const completedCount = currentPlan
    ? currentPlan.sessions.filter((s) => s.isCompleted).length
    : 0;
  const progressPercent = currentPlan
    ? Math.round((completedCount / currentPlan.sessions.length) * 100)
    : 0;

  const timerMinutes = Math.floor(timerSecondsLeft / 60);
  const timerSeconds = timerSecondsLeft % 60;

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header Banner */}
      <div className="rounded-3xl border border-blue-500/20 bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-transparent p-6 sm:p-8 dark:border-blue-500/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300">
              <Calendar className="h-3.5 w-3.5" />
              <span>Session Optimization & Spaced Revision</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Smart Study Planner
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
              Enter what you want to learn and how much time you have. MindBloom constructs a step-by-step roadmap broken into focused sessions with active recall checks and revision milestones.
            </p>
          </div>

          {/* Quick presets */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Quick Time:</span>
            {[30, 45, 60, 90, 120].map((mins) => (
              <button
                key={mins}
                onClick={() => setDurationMinutes(mins)}
                className={`rounded-xl px-2.5 py-1 text-xs font-bold transition ${
                  durationMinutes === mins
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {mins}m
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form & Focus Timer (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Create Plan Form */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800/80 dark:bg-slate-900">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <Plus className="h-4 w-4 text-blue-600" />
              <span>Generate New Plan with Gemini</span>
            </h3>

            <form onSubmit={handleCreatePlan} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Subject
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value as AcademicSubject)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-medium text-slate-800 outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 transition"
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
                  Topic or Chapter Title *
                </label>
                <input
                  type="text"
                  required
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Photosynthesis, Organic Chemistry Reactions, Binary Trees"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500 focus:bg-white dark:border-slate-800 dark:bg-slate-800/80 dark:text-white transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Available Time (minutes)
                  </label>
                  <input
                    type="number"
                    min={15}
                    max={360}
                    step={5}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-900 outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-800 dark:text-white transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Target Level
                  </label>
                  <div className="rounded-xl border border-slate-200 bg-slate-100/60 px-3.5 py-2 text-xs font-bold text-slate-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 capitalize">
                    {currentLevel}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Specific Learning Goal (Optional)
                </label>
                <input
                  type="text"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="e.g. Prepare for midterm exam, understand intuition"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500 focus:bg-white dark:border-slate-800 dark:bg-slate-800/80 dark:text-white transition"
                />
              </div>

              <button
                type="submit"
                disabled={!topic.trim() || isLoading}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-md hover:bg-blue-700 disabled:opacity-50 transition active:scale-98"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Structuring Sessions & Revision...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Generate Personalized Study Plan</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Interactive Focus Timer Widget */}
          <div className="rounded-3xl border border-slate-200/80 bg-gradient-to-br from-slate-900 to-indigo-950 p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                <span>Active Session Timer</span>
              </span>
              {isTimerRunning && (
                <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Focusing
                </span>
              )}
            </div>

            <p className="mt-2 text-xs font-medium text-slate-300 line-clamp-1">
              {activeSessionTitle}
            </p>

            <div className="my-6 text-center">
              <span className="font-mono text-5xl sm:text-6xl font-black tracking-tight text-white">
                {String(timerMinutes).padStart(2, '0')}:{String(timerSeconds).padStart(2, '0')}
              </span>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className={`flex items-center gap-2 rounded-2xl px-6 py-2.5 text-xs font-bold shadow-md transition active:scale-95 ${
                  isTimerRunning
                    ? 'bg-amber-500 text-slate-900 hover:bg-amber-400'
                    : 'bg-emerald-500 text-slate-900 hover:bg-emerald-400'
                }`}
              >
                {isTimerRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                <span>{isTimerRunning ? 'Pause Timer' : 'Start Focus'}</span>
              </button>

              <button
                onClick={() => {
                  setIsTimerRunning(false);
                  setTimerSecondsLeft(25 * 60);
                }}
                className="flex items-center gap-1 rounded-2xl bg-white/10 px-3 py-2.5 text-xs font-medium hover:bg-white/20 transition text-slate-300"
                title="Reset to 25m"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Saved Plans List */}
          {studyPlans.length > 0 && (
            <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800/80 dark:bg-slate-900">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-3">
                Saved Study Plans ({studyPlans.length})
              </h4>
              <div className="space-y-2">
                {studyPlans.map((plan) => {
                  const isSelected = currentPlan?.id === plan.id;
                  const completed = plan.sessions.filter((s) => s.isCompleted).length;
                  return (
                    <div
                      key={plan.id}
                      onClick={() => setActivePlanId(plan.id)}
                      className={`group cursor-pointer flex items-center justify-between rounded-2xl p-3 text-xs transition border ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50/50 font-medium text-slate-900 dark:border-blue-500/80 dark:bg-blue-950/20 dark:text-white'
                          : 'border-slate-100 bg-slate-50/70 hover:bg-slate-100 text-slate-600 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex-1 pr-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-blue-600 dark:text-blue-400">{plan.subject}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{plan.totalTimeMinutes}m</span>
                        </div>
                        <p className="mt-1 line-clamp-1 font-semibold">{plan.title}</p>
                        <span className="text-[10px] text-slate-400">
                          {completed} / {plan.sessions.length} sessions done
                        </span>
                      </div>

                      {studyPlans.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeletePlan(plan.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 transition"
                          title="Delete plan"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Sessions Roadmap (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {currentPlan ? (
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-xs dark:border-slate-800/80 dark:bg-slate-900 space-y-6">
              {/* Plan Overview Card */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-0.5 text-xs font-bold text-blue-600 dark:text-blue-400">
                      {currentPlan.subject} • Level: {currentPlan.level}
                    </span>
                    <h3 className="mt-2 text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                      {currentPlan.title}
                    </h3>
                    <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                      🎯 Goal: {currentPlan.goal}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="font-mono text-2xl font-black text-blue-600 dark:text-blue-400">
                      {progressPercent}%
                    </span>
                    <span className="block text-[10px] text-slate-400">
                      {completedCount} of {currentPlan.sessions.length} Completed
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Sessions List */}
              <div className="space-y-4 pt-2">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Compass className="h-4 w-4 text-blue-600" />
                  <span>Sequential Learning Sessions</span>
                </h4>

                <div className="space-y-4">
                  {currentPlan.sessions.map((session) => (
                    <div
                      key={session.id}
                      className={`rounded-2xl border p-5 transition ${
                        session.isCompleted
                          ? 'border-emerald-200/80 bg-emerald-50/30 dark:border-emerald-900/40 dark:bg-emerald-950/20'
                          : 'border-slate-200/80 bg-slate-50/60 dark:border-slate-800/80 dark:bg-slate-850/50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => handleToggleSessionComplete(session.id)}
                            className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-xl transition ${
                              session.isCompleted
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'border-2 border-slate-300 hover:border-emerald-500 dark:border-slate-700'
                            }`}
                            title={session.isCompleted ? 'Mark incomplete' : 'Mark completed'}
                          >
                            {session.isCompleted && <CheckCircle2 className="h-4 w-4" />}
                          </button>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-400">
                                Session {session.sessionNumber}
                              </span>
                              <span className="rounded bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400 font-mono">
                                ⏱️ {session.durationMinutes} mins
                              </span>
                            </div>
                            <h5
                              className={`mt-1 font-bold text-base ${
                                session.isCompleted
                                  ? 'line-through text-slate-500'
                                  : 'text-slate-900 dark:text-white'
                              }`}
                            >
                              {session.title}
                            </h5>
                          </div>
                        </div>

                        {/* Start timer button */}
                        <button
                          onClick={() => handleStartSessionTimer(session)}
                          className="shrink-0 flex items-center gap-1 rounded-xl bg-blue-500/10 px-3 py-1.5 text-xs font-bold text-blue-700 dark:text-blue-300 hover:bg-blue-500/20 transition"
                        >
                          <Play className="h-3 w-3" />
                          <span>Load in Timer</span>
                        </button>
                      </div>

                      {/* Description */}
                      <p className="mt-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed pl-9">
                        {session.description}
                      </p>

                      {/* Key Concepts Tags */}
                      {session.keyConcepts && session.keyConcepts.length > 0 && (
                        <div className="mt-3 pl-9 flex flex-wrap gap-1.5">
                          {session.keyConcepts.map((concept, i) => (
                            <span
                              key={i}
                              className="rounded-lg bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 border border-slate-200/60 dark:bg-slate-800 dark:border-slate-700/60 dark:text-slate-300"
                            >
                              💡 {concept}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Practice Task & Revision Tips */}
                      {(session.practiceTask || (session.revisionTips && session.revisionTips.length > 0)) && (
                        <div className="mt-3.5 pl-9 space-y-1.5 border-t border-slate-200/60 pt-2.5 dark:border-slate-800/80">
                          {session.practiceTask && (
                            <div className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-1.5">
                              <Target className="h-3.5 w-3.5 shrink-0 text-emerald-500 mt-0.5" />
                              <span>
                                <strong>Active Practice:</strong> {session.practiceTask}
                              </span>
                            </div>
                          )}
                          {session.revisionTips && session.revisionTips[0] && (
                            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-start gap-1.5">
                              <FileCheck className="h-3.5 w-3.5 shrink-0 text-indigo-400 mt-0.5" />
                              <span>
                                <strong>Revision Tip:</strong> {session.revisionTips[0]}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-800">
              <Calendar className="mx-auto h-10 w-10 text-slate-400" />
              <h4 className="mt-3 font-bold text-base text-slate-700 dark:text-slate-300">
                No Plan Selected
              </h4>
              <p className="mt-1 text-xs text-slate-500">
                Generate a study plan on the left to start organizing your study sessions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
