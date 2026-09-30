export type StudentLevel = 'beginner' | 'intermediate' | 'advanced';

export type AcademicSubject = 
  | 'All Subjects'
  | 'Mathematics'
  | 'Physics & Science'
  | 'Computer Science'
  | 'Biology & Chemistry'
  | 'History & Humanities'
  | 'Languages & Literature'
  | 'Economics & Finance'
  | 'General Knowledge';

export type TutorTeachingMode = 'socratic' | 'direct';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  subject?: AcademicSubject;
  level?: StudentLevel;
  followUps?: string[];
  analogies?: string[];
  keyTakeaway?: string;
  isStreaming?: boolean;
}

export interface HomeworkHint {
  hintNumber: number;
  title: string;
  content: string;
}

export interface HomeworkItem {
  id: string;
  problem: string;
  subject: AcademicSubject;
  level: StudentLevel;
  studentAttempt?: string;
  hints: HomeworkHint[];
  fullSolution: string;
  keyFormulas?: string[];
  misconceptionsIdentified?: string;
  revealedHintsCount: number;
  isSolutionRevealed: boolean;
  createdAt: string;
}

export interface StudySession {
  id: string;
  sessionNumber: number;
  title: string;
  durationMinutes: number;
  description: string;
  keyConcepts: string[];
  revisionTips?: string[];
  practiceTask?: string;
  isCompleted: boolean;
}

export interface StudyPlan {
  id: string;
  title: string;
  subject: AcademicSubject;
  level: StudentLevel;
  goal: string;
  totalTimeMinutes: number;
  sessions: StudySession[];
  createdAt: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  options?: string[];
  correctAnswer: string;
  explanation: string;
  userAnswer?: string;
  isCorrect?: boolean;
}

export interface Quiz {
  id: string;
  title: string;
  topic: string;
  subject: AcademicSubject;
  difficulty: StudentLevel;
  questions: QuizQuestion[];
  createdAt: string;
  completedAt?: string;
  score?: number;
  totalQuestions?: number;
}

export interface Flashcard {
  id: string;
  deckId: string;
  front: string;
  back: string;
  hint?: string;
  difficultyRating: 'easy' | 'medium' | 'hard' | 'unrated';
  timesReviewed: number;
  lastReviewed?: string;
}

export interface FlashcardDeck {
  id: string;
  title: string;
  topic: string;
  subject: AcademicSubject;
  cardCount: number;
  color: string;
  createdAt: string;
}

export interface KeyDefinition {
  term: string;
  definition: string;
  example?: string;
}

export interface SummarizerResult {
  id: string;
  title: string;
  executiveSummary: string;
  keyPoints: string[];
  definitions: KeyDefinition[];
  flashcards: Array<{ front: string; back: string }>;
  practiceQuestions: Array<{ question: string; answer: string; explanation?: string }>;
  createdAt: string;
}

export interface ActivityItem {
  id: string;
  type: 'tutor' | 'quiz' | 'study_plan' | 'flashcards' | 'homework' | 'summary';
  title: string;
  detail: string;
  timestamp: string;
}

export interface StudentStats {
  streakDays: number;
  lastActiveDate: string;
  totalStudyMinutes: number;
  quizzesCompleted: number;
  averageQuizScore: number;
  flashcardsReviewed: number;
  questionsAsked: number;
  homeworkProblemsSolved: number;
  subjectMastery: Record<string, number>; // 0 - 100
  recentActivities: ActivityItem[];
}

export interface UserPreferences {
  studentName: string;
  defaultLevel: StudentLevel;
  preferredMode: TutorTeachingMode;
  theme: 'light' | 'dark' | 'system';
  dailyGoalMinutes: number;
  enableVoiceTTS: boolean;
}
