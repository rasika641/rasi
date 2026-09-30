import React, { useState, useEffect } from 'react';
import {
  AcademicSubject,
  ChatMessage,
  Flashcard,
  FlashcardDeck,
  HomeworkItem,
  Quiz,
  QuizQuestion,
  StudentLevel,
  StudentStats,
  StudyPlan,
  TutorTeachingMode,
  UserPreferences,
} from './types';
import {
  defaultDecks,
  defaultFlashcards,
  defaultHomework,
  defaultPreferences,
  defaultQuizzes,
  defaultStats,
  defaultStudyPlans,
  getChatMessages,
  getDecks,
  getFlashcards,
  getHomework,
  getPreferences,
  getQuizzes,
  getStats,
  getStudyPlans,
  saveChatMessages,
  saveDecks,
  saveFlashcards,
  saveHomework,
  savePreferences,
  saveQuizzes,
  saveStudyPlans,
  updateStats,
} from './utils/storage';
import { ActiveTab, Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { AITutor } from './components/AITutor';
import { HomeworkHelper } from './components/HomeworkHelper';
import { StudyPlanner } from './components/StudyPlanner';
import { QuizView } from './components/QuizView';
import { FlashcardsView } from './components/FlashcardsView';
import { SummarizerView } from './components/SummarizerView';
import { ProgressView } from './components/ProgressView';
import { SettingsView } from './components/SettingsView';

export default function App() {
  // Navigation & UI state
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const savedTheme = localStorage.getItem('mindbloom_theme');
      if (savedTheme) return savedTheme === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return true;
    }
  });

  // Data states
  const [preferences, setPreferences] = useState<UserPreferences>(getPreferences);
  const [stats, setStats] = useState<StudentStats>(getStats);
  const [currentLevel, setCurrentLevel] = useState<StudentLevel>(preferences.defaultLevel);
  const [selectedSubject, setSelectedSubject] = useState<AcademicSubject>('All Subjects');

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(getChatMessages);
  const [isChatLoading, setIsChatLoading] = useState(false);

  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>(getStudyPlans);
  const [quizzes, setQuizzes] = useState<Quiz[]>(getQuizzes);
  const [decks, setDecks] = useState<FlashcardDeck[]>(getDecks);
  const [flashcards, setFlashcards] = useState<Flashcard[]>(getFlashcards);
  const [homeworkList, setHomeworkList] = useState<HomeworkItem[]>(getHomework);

  // Sync dark class on document element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('mindbloom_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('mindbloom_theme', 'light');
    }
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode((prev) => !prev);
  };

  // AI Tutor Send Message handler
  const handleSendTutorMessage = async (
    userText: string,
    level: StudentLevel,
    subject: AcademicSubject,
    mode: TutorTeachingMode
  ) => {
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userText,
      timestamp: 'Just now',
      subject: subject !== 'All Subjects' ? subject : undefined,
      level,
    };

    const newHistory = [...chatMessages, userMsg];
    setChatMessages(newHistory);
    saveChatMessages(newHistory);
    setIsChatLoading(true);

    try {
      const res = await fetch('/api/gemini/tutor-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.map((m) => ({ role: m.role, content: m.content })),
          level,
          subject: subject !== 'All Subjects' ? subject : 'General Knowledge',
          mode,
        }),
      });

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: data.content || data.reply || 'Let us explore this concept further!',
        timestamp: 'Just now',
        subject: subject !== 'All Subjects' ? subject : undefined,
        level,
        followUps: data.followUps || [],
        keyTakeaway: data.keyTakeaway,
      };

      const finalHistory = [...newHistory, assistantMsg];
      setChatMessages(finalHistory);
      saveChatMessages(finalHistory);

      // Increment stats questions asked
      const updated = updateStats((prev) => ({
        ...prev,
        questionsAsked: prev.questionsAsked + 1,
        recentActivities: [
          {
            id: `act-${Date.now()}`,
            type: 'tutor',
            title: `Explored: ${userText.slice(0, 35)}...`,
            detail: `${mode === 'socratic' ? 'Socratic' : 'Direct'} tutoring in ${subject}`,
            timestamp: 'Just now',
          },
          ...prev.recentActivities.slice(0, 9),
        ],
      }));
      setStats(updated);
    } catch (err) {
      console.error('Tutor chat failed:', err);
      const errorMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content:
          "I ran into an issue connecting with the tutor server. Please verify your connection or try asking again!",
        timestamp: 'Just now',
        followUps: ['Try asking again', 'Summarize with simpler terms'],
      };
      setChatMessages([...newHistory, errorMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleClearChatHistory = () => {
    const initial: ChatMessage[] = [
      {
        id: 'msg-init',
        role: 'assistant',
        content:
          "Welcome to a fresh tutoring session! What topic or problem would you like to explore today?",
        timestamp: 'Just now',
        followUps: [
          'Explain Quantum Mechanics simply',
          'Help me understand Calculus Derivatives',
          'How does DNA replication work?',
          'What were the main causes of the Industrial Revolution?',
        ],
      },
    ];
    setChatMessages(initial);
    saveChatMessages(initial);
  };

  // Study Plan handlers
  const handleAddPlan = (newPlan: StudyPlan) => {
    const updated = [newPlan, ...studyPlans];
    setStudyPlans(updated);
    saveStudyPlans(updated);

    const updatedStats = updateStats((prev) => ({
      ...prev,
      recentActivities: [
        {
          id: `act-${Date.now()}`,
          type: 'study_plan',
          title: `Created plan: ${newPlan.title}`,
          detail: `${newPlan.sessions.length} sessions (${newPlan.totalTimeMinutes}m total)`,
          timestamp: 'Just now',
        },
        ...prev.recentActivities.slice(0, 9),
      ],
    }));
    setStats(updatedStats);
  };

  const handleUpdatePlan = (updatedPlan: StudyPlan) => {
    const updated = studyPlans.map((p) => (p.id === updatedPlan.id ? updatedPlan : p));
    setStudyPlans(updated);
    saveStudyPlans(updated);
  };

  const handleDeletePlan = (planId: string) => {
    const updated = studyPlans.filter((p) => p.id !== planId);
    setStudyPlans(updated);
    saveStudyPlans(updated);
  };

  // Quiz handlers
  const handleAddQuiz = (newQuiz: Quiz) => {
    const updated = [newQuiz, ...quizzes];
    setQuizzes(updated);
    saveQuizzes(updated);
  };

  const handleCompleteQuiz = (quizId: string, score: number, questions: QuizQuestion[]) => {
    const updatedQuizzes = quizzes.map((q) =>
      q.id === quizId
        ? {
            ...q,
            score,
            completedAt: new Date().toISOString(),
            questions,
          }
        : q
    );
    setQuizzes(updatedQuizzes);
    saveQuizzes(updatedQuizzes);

    // Update global stats
    const updatedStats = updateStats((prev) => {
      const newTotal = prev.quizzesCompleted + 1;
      const newAvg = Math.round((prev.averageQuizScore * prev.quizzesCompleted + score) / newTotal);
      return {
        ...prev,
        quizzesCompleted: newTotal,
        averageQuizScore: newAvg,
        recentActivities: [
          {
            id: `act-${Date.now()}`,
            type: 'quiz',
            title: `Completed Quiz (${score}%)`,
            detail: `Scored ${score}% on knowledge check`,
            timestamp: 'Just now',
          },
          ...prev.recentActivities.slice(0, 9),
        ],
      };
    });
    setStats(updatedStats);
  };

  // Flashcards handlers
  const handleAddDeck = (newDeck: FlashcardDeck, newCards: Flashcard[]) => {
    const updatedDecks = [newDeck, ...decks];
    const updatedCards = [...flashcards, ...newCards];
    setDecks(updatedDecks);
    setFlashcards(updatedCards);
    saveDecks(updatedDecks);
    saveFlashcards(updatedCards);
  };

  const handleUpdateCardRating = (cardId: string, rating: 'easy' | 'medium' | 'hard') => {
    const updatedCards = flashcards.map((c) =>
      c.id === cardId
        ? {
            ...c,
            difficultyRating: rating,
            timesReviewed: c.timesReviewed + 1,
            lastReviewed: new Date().toISOString(),
          }
        : c
    );
    setFlashcards(updatedCards);
    saveFlashcards(updatedCards);

    const updatedStats = updateStats((prev) => ({
      ...prev,
      flashcardsReviewed: prev.flashcardsReviewed + 1,
    }));
    setStats(updatedStats);
  };

  // Homework handlers
  const handleAddHomework = (item: HomeworkItem) => {
    const updated = [item, ...homeworkList];
    setHomeworkList(updated);
    saveHomework(updated);

    const updatedStats = updateStats((prev) => ({
      ...prev,
      homeworkProblemsSolved: prev.homeworkProblemsSolved + 1,
      recentActivities: [
        {
          id: `act-${Date.now()}`,
          type: 'homework',
          title: `Homework Hints: ${item.subject}`,
          detail: 'Analyzed exercise with progressive pedagogical hints',
          timestamp: 'Just now',
        },
        ...prev.recentActivities.slice(0, 9),
      ],
    }));
    setStats(updatedStats);
  };

  const handleUpdateHomework = (updatedItem: HomeworkItem) => {
    const updated = homeworkList.map((h) => (h.id === updatedItem.id ? updatedItem : h));
    setHomeworkList(updated);
    saveHomework(updated);
  };

  // Preferences save & Reset
  const handleSavePreferences = (newPrefs: UserPreferences) => {
    setPreferences(newPrefs);
    setCurrentLevel(newPrefs.defaultLevel);
    savePreferences(newPrefs);
  };

  const handleResetData = () => {
    localStorage.clear();
    setPreferences(defaultPreferences);
    setStats(defaultStats);
    setStudyPlans(defaultStudyPlans);
    setQuizzes(defaultQuizzes);
    setDecks(defaultDecks);
    setFlashcards(defaultFlashcards);
    setHomeworkList(defaultHomework);
    handleClearChatHistory();
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 transition-colors duration-200 dark:bg-slate-950 dark:text-slate-100">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        streakDays={stats.streakDays}
        studentLevel={currentLevel}
        onLevelChange={setCurrentLevel}
        darkMode={darkMode}
        onToggleTheme={toggleTheme}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col lg:pl-72 min-h-screen">
        <Navbar
          onOpenSidebar={() => setIsSidebarOpen(true)}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          streakDays={stats.streakDays}
          studentName={preferences.studentName}
          studentLevel={currentLevel}
          selectedSubject={selectedSubject}
          onSubjectChange={setSelectedSubject}
          darkMode={darkMode}
          onToggleTheme={toggleTheme}
        />

        <main className="flex-1 pb-16">
          {activeTab === 'dashboard' && (
            <Dashboard
              stats={stats}
              studentName={preferences.studentName}
              studyPlans={studyPlans}
              quizzes={quizzes}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'tutor' && (
            <AITutor
              chatMessages={chatMessages}
              onSendMessage={handleSendTutorMessage}
              onClearHistory={handleClearChatHistory}
              currentLevel={currentLevel}
              onLevelChange={setCurrentLevel}
              selectedSubject={selectedSubject}
              onSubjectChange={setSelectedSubject}
              isLoading={isChatLoading}
            />
          )}

          {activeTab === 'homework' && (
            <HomeworkHelper
              homeworkList={homeworkList}
              onAddHomework={handleAddHomework}
              onUpdateHomework={handleUpdateHomework}
              currentLevel={currentLevel}
            />
          )}

          {activeTab === 'planner' && (
            <StudyPlanner
              studyPlans={studyPlans}
              onAddPlan={handleAddPlan}
              onUpdatePlan={handleUpdatePlan}
              onDeletePlan={handleDeletePlan}
              currentLevel={currentLevel}
              selectedSubject={selectedSubject}
            />
          )}

          {activeTab === 'quiz' && (
            <QuizView
              quizzes={quizzes}
              onAddQuiz={handleAddQuiz}
              onCompleteQuiz={handleCompleteQuiz}
              currentLevel={currentLevel}
              selectedSubject={selectedSubject}
            />
          )}

          {activeTab === 'flashcards' && (
            <FlashcardsView
              decks={decks}
              flashcards={flashcards}
              onAddDeck={handleAddDeck}
              onUpdateCardRating={handleUpdateCardRating}
              selectedSubject={selectedSubject}
            />
          )}

          {activeTab === 'summarizer' && (
            <SummarizerView onAddDeckFromSummary={handleAddDeck} />
          )}

          {activeTab === 'progress' && (
            <ProgressView
              stats={stats}
              studyPlans={studyPlans}
              quizzes={quizzes}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              preferences={preferences}
              onSavePreferences={handleSavePreferences}
              onResetData={handleResetData}
              darkMode={darkMode}
              onToggleTheme={toggleTheme}
            />
          )}
        </main>
      </div>
    </div>
  );
}
