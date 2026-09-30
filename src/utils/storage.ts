import {
  ChatMessage,
  Flashcard,
  FlashcardDeck,
  HomeworkItem,
  Quiz,
  StudentStats,
  StudyPlan,
  SummarizerResult,
  UserPreferences,
} from '../types';

const STORAGE_KEYS = {
  PREFERENCES: 'mindbloom_preferences',
  STATS: 'mindbloom_stats',
  CHAT_MESSAGES: 'mindbloom_chat_messages',
  STUDY_PLANS: 'mindbloom_study_plans',
  QUIZZES: 'mindbloom_quizzes',
  DECKS: 'mindbloom_decks',
  FLASHCARDS: 'mindbloom_flashcards',
  SUMMARIES: 'mindbloom_summaries',
  HOMEWORK: 'mindbloom_homework',
};

export const defaultPreferences: UserPreferences = {
  studentName: 'Alex Rivera',
  defaultLevel: 'intermediate',
  preferredMode: 'socratic',
  theme: 'dark',
  dailyGoalMinutes: 45,
  enableVoiceTTS: true,
};

export const defaultStats: StudentStats = {
  streakDays: 5,
  lastActiveDate: new Date().toISOString().split('T')[0],
  totalStudyMinutes: 340,
  quizzesCompleted: 12,
  averageQuizScore: 86,
  flashcardsReviewed: 85,
  questionsAsked: 28,
  homeworkProblemsSolved: 9,
  subjectMastery: {
    'Mathematics': 82,
    'Physics & Science': 88,
    'Computer Science': 94,
    'Biology & Chemistry': 74,
    'History & Humanities': 68,
  },
  recentActivities: [
    {
      id: 'act-1',
      type: 'quiz',
      title: 'Completed Calculus Basics Quiz',
      detail: 'Scored 100% (5/5) with zero hints needed',
      timestamp: '2 hours ago',
    },
    {
      id: 'act-2',
      type: 'tutor',
      title: 'Explored Photosynthesis Light Reactions',
      detail: 'Discussed ATP synthase role with water wheel analogy',
      timestamp: 'Yesterday',
    },
    {
      id: 'act-3',
      type: 'flashcards',
      title: 'Reviewed 20 cards in Data Structures',
      detail: 'Marked 16 Easy, 4 Medium',
      timestamp: '2 days ago',
    },
    {
      id: 'act-4',
      type: 'study_plan',
      title: 'Created Quantum Computing Study Plan',
      detail: '3 sessions planned (75 mins)',
      timestamp: '3 days ago',
    },
  ],
};

export const defaultDecks: FlashcardDeck[] = [
  {
    id: 'deck-1',
    title: 'Calculus: Derivatives & Rates',
    topic: 'Calculus Differential Equations',
    subject: 'Mathematics',
    cardCount: 5,
    color: 'from-blue-600 to-indigo-600',
    createdAt: '2026-09-25T10:00:00Z',
  },
  {
    id: 'deck-2',
    title: 'Cellular Respiration & Bioenergetics',
    topic: 'Biology Energy Transfer',
    subject: 'Biology & Chemistry',
    cardCount: 5,
    color: 'from-emerald-600 to-teal-600',
    createdAt: '2026-09-26T11:00:00Z',
  },
  {
    id: 'deck-3',
    title: 'Algorithms & Big-O Notation',
    topic: 'Time & Space Complexity',
    subject: 'Computer Science',
    cardCount: 5,
    color: 'from-purple-600 to-pink-600',
    createdAt: '2026-09-27T09:30:00Z',
  },
];

export const defaultFlashcards: Flashcard[] = [
  {
    id: 'card-1',
    deckId: 'deck-1',
    front: 'What is the limit definition of the derivative f\'(x)?',
    back: 'f\'(x) = lim (h -> 0) [f(x + h) - f(x)] / h. Geometrically, it represents the instantaneous slope of the tangent line.',
    hint: 'Think of secant line slopes as the two points merge together.',
    difficultyRating: 'easy',
    timesReviewed: 4,
  },
  {
    id: 'card-2',
    deckId: 'deck-1',
    front: 'State the Product Rule for differentiation.',
    back: 'd/dx [u(x) · v(x)] = u\'(x)v(x) + u(x)v\'(x). "Derivative of the first times second, plus first times derivative of the second."',
    hint: 'Two functions multiplying together.',
    difficultyRating: 'easy',
    timesReviewed: 3,
  },
  {
    id: 'card-3',
    deckId: 'deck-1',
    front: 'What is the Chain Rule and when do you use it?',
    back: 'd/dx [f(g(x))] = f\'(g(x)) · g\'(x). Used whenever you have a composite function (a function inside another function).',
    hint: 'Outer derivative evaluated at the inner, multiplied by inner derivative.',
    difficultyRating: 'medium',
    timesReviewed: 2,
  },
  {
    id: 'card-4',
    deckId: 'deck-1',
    front: 'What does a second derivative f\'\'(x) > 0 indicate about the graph?',
    back: 'The graph is concave upward (curves like a cup that holds water), and the slope is increasing.',
    hint: 'Concavity indicator.',
    difficultyRating: 'easy',
    timesReviewed: 3,
  },
  {
    id: 'card-5',
    deckId: 'deck-1',
    front: 'What is L\'Hôpital\'s Rule and its conditions?',
    back: 'If lim f(x)/g(x) yields 0/0 or ±∞/±∞, then lim f(x)/g(x) = lim f\'(x)/g\'(x), provided the limit exists.',
    hint: 'Indeterminate fractions.',
    difficultyRating: 'hard',
    timesReviewed: 2,
  },
  // Deck 2: Cellular Respiration
  {
    id: 'card-6',
    deckId: 'deck-2',
    front: 'Where does Glycolysis take place, and does it require oxygen?',
    back: 'In the cytoplasm (cytosol). It is anaerobic (does NOT require oxygen) and yields a net of 2 ATP and 2 NADH per glucose.',
    hint: 'First phase before mitochondria.',
    difficultyRating: 'easy',
    timesReviewed: 3,
  },
  {
    id: 'card-7',
    deckId: 'deck-2',
    front: 'What is the final electron acceptor in the Electron Transport Chain?',
    back: 'Molecular Oxygen (O₂). It binds with free electrons and protons (H⁺) to form water (H₂O).',
    hint: 'Why we breathe air.',
    difficultyRating: 'easy',
    timesReviewed: 4,
  },
  {
    id: 'card-8',
    deckId: 'deck-2',
    front: 'How does ATP Synthase generate ATP during oxidative phosphorylation?',
    back: 'Protons flow down their electrochemical gradient from the intermembrane space through ATP Synthase (chemiosmosis), rotating its rotor like a turbine to phosphorylate ADP into ATP.',
    hint: 'Think of a hydroelectric dam.',
    difficultyRating: 'medium',
    timesReviewed: 3,
  },
  {
    id: 'card-9',
    deckId: 'deck-2',
    front: 'What is the net ATP yield per glucose molecule from aerobic cellular respiration?',
    back: 'Approximately 30 to 32 ATP molecules under standard cellular conditions (2 from glycolysis, 2 from Krebs cycle, ~26-28 from oxidative phosphorylation).',
    hint: 'Total energy yield.',
    difficultyRating: 'hard',
    timesReviewed: 2,
  },
  {
    id: 'card-10',
    deckId: 'deck-2',
    front: 'What occurs during lactic acid fermentation in human muscle cells?',
    back: 'In oxygen debt, pyruvate is reduced to lactate by NADH, regenerating NAD⁺ so glycolysis can continue producing ATP anaerobically.',
    hint: 'Regeneration of NAD+ without oxygen.',
    difficultyRating: 'medium',
    timesReviewed: 2,
  },
  // Deck 3: Algorithms & Big-O
  {
    id: 'card-11',
    deckId: 'deck-3',
    front: 'What is the average and worst-case time complexity of QuickSort?',
    back: 'Average case: O(n log n). Worst case: O(n²) when the pivot chosen is consistently the smallest or largest element.',
    hint: 'Divide and conquer partitioning.',
    difficultyRating: 'medium',
    timesReviewed: 4,
  },
  {
    id: 'card-12',
    deckId: 'deck-3',
    front: 'What is the lookup, insertion, and deletion time complexity of a Hash Table?',
    back: 'O(1) average time complexity for all three operations. O(n) worst-case if severe hash collisions occur without dynamic resizing.',
    hint: 'Key-value constant time mapping.',
    difficultyRating: 'easy',
    timesReviewed: 5,
  },
  {
    id: 'card-13',
    deckId: 'deck-3',
    front: 'What is the difference between BFS (Breadth-First) and DFS (Depth-First)?',
    back: 'BFS uses a Queue and explores level-by-level (ideal for shortest paths in unweighted graphs). DFS uses a Stack (or recursion) and explores deep down a branch before backtracking.',
    hint: 'Queue vs Stack traversal.',
    difficultyRating: 'easy',
    timesReviewed: 4,
  },
  {
    id: 'card-14',
    deckId: 'deck-3',
    front: 'Explain what dynamic programming is in simple terms.',
    back: 'Breaking a complex problem down into overlapping subproblems, solving each subproblem once, and caching the results (memoization or tabulation) to avoid recalculating.',
    hint: 'Don\'t solve the same subproblem twice.',
    difficultyRating: 'medium',
    timesReviewed: 3,
  },
  {
    id: 'card-15',
    deckId: 'deck-3',
    front: 'What does Space Complexity O(1) mean?',
    back: 'Constant auxiliary space. The algorithm uses a fixed amount of additional memory regardless of the size of the input data.',
    hint: 'Memory usage independent of N.',
    difficultyRating: 'easy',
    timesReviewed: 5,
  },
];

export const defaultQuizzes: Quiz[] = [
  {
    id: 'quiz-1',
    title: 'Differential Calculus & Real-World Rates',
    topic: 'Calculus: Derivatives, Tangents, and Applications',
    subject: 'Mathematics',
    difficulty: 'intermediate',
    createdAt: '2026-09-28T14:00:00Z',
    score: 100,
    totalQuestions: 4,
    questions: [
      {
        id: 'q-1',
        question: 'What is the derivative of f(x) = 3x⁴ - 5x² + 7?',
        type: 'multiple_choice',
        options: [
          'f\'(x) = 12x³ - 10x',
          'f\'(x) = 12x³ - 5x + 7',
          'f\'(x) = 7x³ - 10x',
          'f\'(x) = 12x⁴ - 10x²',
        ],
        correctAnswer: 'f\'(x) = 12x³ - 10x',
        explanation: 'Using the Power Rule (d/dx [xⁿ] = n·xⁿ⁻¹): d/dx[3x⁴] = 12x³, d/dx[-5x²] = -10x, and the derivative of a constant (7) is 0.',
        userAnswer: 'f\'(x) = 12x³ - 10x',
        isCorrect: true,
      },
      {
        id: 'q-2',
        question: 'If position s(t) = -16t² + 64t + 80 in feet, what is the velocity at t = 2 seconds?',
        type: 'multiple_choice',
        options: ['0 ft/s', '32 ft/s', '-32 ft/s', '64 ft/s'],
        correctAnswer: '0 ft/s',
        explanation: 'Velocity is the derivative of position: v(t) = s\'(t) = -32t + 64. At t = 2: v(2) = -32(2) + 64 = 0 ft/s (the object has reached its maximum height!).',
        userAnswer: '0 ft/s',
        isCorrect: true,
      },
      {
        id: 'q-3',
        question: 'True or False: If a function is continuous at x = a, it must also be differentiable at x = a.',
        type: 'true_false',
        options: ['True', 'False'],
        correctAnswer: 'False',
        explanation: 'False! Continuity is necessary but NOT sufficient for differentiability. A classic counterexample is f(x) = |x| at x = 0, which is continuous but has a sharp corner (no unique tangent slope).',
        userAnswer: 'False',
        isCorrect: true,
      },
      {
        id: 'q-4',
        question: 'If dy/dx = 0 at x = c and d²y/dx² < 0 at x = c, what feature does the graph have at x = c?',
        type: 'multiple_choice',
        options: [
          'Local Maximum',
          'Local Minimum',
          'Inflection Point',
          'Vertical Asymptote',
        ],
        correctAnswer: 'Local Maximum',
        explanation: 'By the Second Derivative Test, when slope is zero (horizontal tangent) and the curve is concave down (like an upside-down bowl, f\'\' < 0), the critical point is a local maximum.',
        userAnswer: 'Local Maximum',
        isCorrect: true,
      },
    ],
  },
];

export const defaultStudyPlans: StudyPlan[] = [
  {
    id: 'plan-1',
    title: 'Mastering Quadratic Equations & Vertex Form',
    subject: 'Mathematics',
    level: 'intermediate',
    goal: 'Understand quadratic graphs, completing the square, and solving real optimization problems.',
    totalTimeMinutes: 90,
    createdAt: '2026-09-27T15:30:00Z',
    sessions: [
      {
        id: 'sess-1',
        sessionNumber: 1,
        title: 'Anatomy of a Parabola & Standard vs Vertex Form',
        durationMinutes: 25,
        description: 'Explore how changes in coefficients a, b, and c stretch, flip, and translate y = ax² + bx + c into y = a(x - h)² + k.',
        keyConcepts: [
          'Axis of symmetry at x = -b/(2a)',
          'Vertex coordinates (h, k)',
          'Direction of opening and y-intercept',
        ],
        revisionTips: ['Sketch 3 quick parabolas with positive, negative, and zero vertices.'],
        practiceTask: 'Convert f(x) = 2x² - 8x + 3 into vertex form by completing the square.',
        isCompleted: true,
      },
      {
        id: 'sess-2',
        sessionNumber: 2,
        title: 'Completing the Square & Deriving the Quadratic Formula',
        durationMinutes: 35,
        description: 'Master the geometric intuition of "completing an actual square area", step by step.',
        keyConcepts: [
          'Adding (b/2)² to both sides',
          'Factoring perfect square trinomials',
          'Discriminant b² - 4ac and roots nature',
        ],
        revisionTips: ['Check discriminant first: > 0 gives two real roots, = 0 gives one, < 0 gives complex roots.'],
        practiceTask: 'Solve 3x² + 6x - 2 = 0 using completing the square without looking at the formula.',
        isCompleted: true,
      },
      {
        id: 'sess-3',
        sessionNumber: 3,
        title: 'Real-World Applications & Active Practice',
        durationMinutes: 30,
        description: 'Solve maximum projectile heights, revenue optimization, and architectural arch designs.',
        keyConcepts: [
          'Interpreting the vertex as maximum or minimum',
          'Zeros as ground impact or break-even points',
        ],
        revisionTips: ['Always draw a quick diagram and identify what x and y represent physically.'],
        practiceTask: 'Find the dimensions of a rectangular garden with 100 meters of fencing that maximizes total area.',
        isCompleted: false,
      },
    ],
  },
];

export const defaultHomework: HomeworkItem[] = [
  {
    id: 'hw-1',
    problem: 'A ball is kicked from ground level at an angle of 30° above the horizontal with an initial velocity of 20 m/s. Assuming g = 9.8 m/s² and negligible air resistance, find the total time of flight and maximum height reached.',
    subject: 'Physics & Science',
    level: 'intermediate',
    studentAttempt: 'I separated the velocity into vx = 20 * cos(30) and vy = 20 * sin(30). I got vy = 10 m/s. Then I was unsure how to find maximum height without knowing time first.',
    revealedHintsCount: 2,
    isSolutionRevealed: false,
    createdAt: '2026-09-29T16:00:00Z',
    keyFormulas: [
      'v_0y = v_0 · sin(θ)',
      'v_y(t) = v_0y - g·t',
      'y(t) = v_0y·t - (1/2)g·t²',
      'v_y² = v_0y² - 2g·Δy',
    ],
    hints: [
      {
        hintNumber: 1,
        title: 'Concept & Vertical Separation',
        content: 'Your initial step was spot on! Horizontal and vertical motions are completely independent. At the very peak of flight, what is the ball\'s vertical velocity v_y? Remember, it stops climbing for an instant before falling.',
      },
      {
        hintNumber: 2,
        title: 'Finding Time to Peak',
        content: 'Since v_y = 0 at the peak and v_y(t) = v_0y - g·t, solve 0 = 10 - 9.8·t_peak. Once you have t_peak, the trajectory is symmetric so total time of flight is simply 2 × t_peak!',
      },
      {
        hintNumber: 3,
        title: 'Finding Maximum Height',
        content: 'You can either plug t_peak into y(t) = v_0y·t - (1/2)g·t², OR use the kinematic equation with no time: v_y² = v_0y² - 2g·h_max. Setting v_y = 0 gives h_max = (v_0y)² / (2g) = 100 / 19.6.',
      },
    ],
    fullSolution: '1. Resolve Components:\n   - v_0y = 20 · sin(30°) = 20 · 0.5 = 10 m/s\n   - v_0x = 20 · cos(30°) = 20 · 0.866 = 17.32 m/s\n\n2. Time to Peak:\n   - At peak, v_y = 0.\n   - v_y = v_0y - g·t_peak => 0 = 10 - 9.8·t_peak => t_peak = 10 / 9.8 ≈ 1.02 seconds.\n\n3. Total Flight Time:\n   - By symmetry, total time T = 2 × 1.02 s ≈ 2.04 seconds.\n\n4. Maximum Height:\n   - h_max = (v_0y)² / (2g) = (10)² / (2 · 9.8) = 100 / 19.6 ≈ 5.10 meters.',
    misconceptionsIdentified: 'Good job separating the initial velocity vector! A common misconception is thinking you must calculate time before finding height, but kinematics provides the work-energy equivalent formula v² = v₀² - 2gΔy which directly links vertical speed to height.',
  },
];

export const defaultChatMessages: ChatMessage[] = [
  {
    id: 'msg-1',
    role: 'assistant',
    content: "Hello Alex! 👋 I'm **MindBloom**, your personal AI tutor. Whether you're untangling tricky physics problems, exploring philosophical ideas, mastering calculus, or writing code, I'm here to guide you step-by-step.\n\nWhat concept or topic are you learning today?",
    timestamp: 'Just now',
    followUps: [
      'Explain Quantum Entanglement simply',
      'How does gradient descent work in machine learning?',
      'Help me understand the Doppler Effect',
      'Why is Euler\'s identity e^(iπ) + 1 = 0 so famous?',
    ],
  },
];

// Helper to load or initialize
export function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(item) as T;
  } catch (err) {
    console.warn(`Error reading localStorage for key ${key}:`, err);
    return fallback;
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving localStorage for key ${key}:`, err);
  }
}

export function getPreferences(): UserPreferences {
  return loadFromStorage(STORAGE_KEYS.PREFERENCES, defaultPreferences);
}

export function savePreferences(prefs: UserPreferences): void {
  saveToStorage(STORAGE_KEYS.PREFERENCES, prefs);
}

export function getStats(): StudentStats {
  return loadFromStorage(STORAGE_KEYS.STATS, defaultStats);
}

export function updateStats(updater: (prev: StudentStats) => StudentStats): StudentStats {
  const current = getStats();
  const updated = updater(current);
  saveToStorage(STORAGE_KEYS.STATS, updated);
  return updated;
}

export function getChatMessages(): ChatMessage[] {
  return loadFromStorage(STORAGE_KEYS.CHAT_MESSAGES, defaultChatMessages);
}

export function saveChatMessages(messages: ChatMessage[]): void {
  saveToStorage(STORAGE_KEYS.CHAT_MESSAGES, messages);
}

export function getStudyPlans(): StudyPlan[] {
  return loadFromStorage(STORAGE_KEYS.STUDY_PLANS, defaultStudyPlans);
}

export function saveStudyPlans(plans: StudyPlan[]): void {
  saveToStorage(STORAGE_KEYS.STUDY_PLANS, plans);
}

export function getQuizzes(): Quiz[] {
  return loadFromStorage(STORAGE_KEYS.QUIZZES, defaultQuizzes);
}

export function saveQuizzes(quizzes: Quiz[]): void {
  saveToStorage(STORAGE_KEYS.QUIZZES, quizzes);
}

export function getDecks(): FlashcardDeck[] {
  return loadFromStorage(STORAGE_KEYS.DECKS, defaultDecks);
}

export function saveDecks(decks: FlashcardDeck[]): void {
  saveToStorage(STORAGE_KEYS.DECKS, decks);
}

export function getFlashcards(): Flashcard[] {
  return loadFromStorage(STORAGE_KEYS.FLASHCARDS, defaultFlashcards);
}

export function saveFlashcards(cards: Flashcard[]): void {
  saveToStorage(STORAGE_KEYS.FLASHCARDS, cards);
}

export function getHomework(): HomeworkItem[] {
  return loadFromStorage(STORAGE_KEYS.HOMEWORK, defaultHomework);
}

export function saveHomework(items: HomeworkItem[]): void {
  saveToStorage(STORAGE_KEYS.HOMEWORK, items);
}

export function getSummaries(): SummarizerResult[] {
  return loadFromStorage(STORAGE_KEYS.SUMMARIES, []);
}

export function saveSummaries(summaries: SummarizerResult[]): void {
  saveToStorage(STORAGE_KEYS.SUMMARIES, summaries);
}
