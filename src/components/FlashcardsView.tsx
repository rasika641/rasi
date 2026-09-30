import React, { useState, useEffect } from 'react';
import {
  AcademicSubject,
  Flashcard,
  FlashcardDeck,
} from '../types';
import { MarkdownRenderer } from '../utils/markdown';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Filter,
  FlipHorizontal,
  HelpCircle,
  Layers,
  Lightbulb,
  Plus,
  RefreshCw,
  RotateCcw,
  Shuffle,
  Sparkles,
  Zap,
} from 'lucide-react';

interface FlashcardsViewProps {
  decks: FlashcardDeck[];
  flashcards: Flashcard[];
  onAddDeck: (deck: FlashcardDeck, cards: Flashcard[]) => void;
  onUpdateCardRating: (cardId: string, rating: 'easy' | 'medium' | 'hard') => void;
  selectedSubject: AcademicSubject;
}

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({
  decks,
  flashcards,
  onAddDeck,
  onUpdateCardRating,
  selectedSubject,
}) => {
  const [selectedDeckId, setSelectedDeckId] = useState<string>(decks[0]?.id || '');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [filterRating, setFilterRating] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');

  // Generator modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState<AcademicSubject>(selectedSubject !== 'All Subjects' ? selectedSubject : 'Mathematics');
  const [cardCount, setCardCount] = useState(6);
  const [sourceNotes, setSourceNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const activeDeck = decks.find((d) => d.id === selectedDeckId) || decks[0];

  // Cards for active deck filtered
  const deckCards = flashcards.filter((c) => c.deckId === activeDeck?.id);
  const filteredCards = deckCards.filter((c) => {
    if (filterRating === 'all') return true;
    return c.difficultyRating === filterRating;
  });

  const currentCard = filteredCards[currentIndex] || filteredCards[0];

  // Reset flip when navigating
  useEffect(() => {
    setIsFlipped(false);
    setShowHint(false);
  }, [currentIndex, selectedDeckId, filterRating]);

  // Keyboard shortcut listener: Space flips, Arrow keys navigate, 1/2/3 rates
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.code === 'ArrowRight') {
        handleNextCard();
      } else if (e.code === 'ArrowLeft') {
        handlePrevCard();
      } else if (e.key === '1' && currentCard) {
        handleRate('hard');
      } else if (e.key === '2' && currentCard) {
        handleRate('medium');
      } else if (e.key === '3' && currentCard) {
        handleRate('easy');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentCard, filteredCards.length, currentIndex]);

  const handleNextCard = () => {
    if (currentIndex < filteredCards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0); // loop
    }
  };

  const handlePrevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else {
      setCurrentIndex(filteredCards.length - 1);
    }
  };

  const handleRate = (rating: 'easy' | 'medium' | 'hard') => {
    if (!currentCard) return;
    onUpdateCardRating(currentCard.id, rating);
    // Auto advance to next card
    handleNextCard();
  };

  const handleGenerateDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || isGenerating) return;

    setIsGenerating(true);
    try {
      const res = await fetch('/api/gemini/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          sourceText: sourceNotes.trim() || undefined,
          count: cardCount,
          subject,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.flashcards || data.flashcards.length === 0) {
        throw new Error(data.error || 'Failed to generate flashcards');
      }

      const newDeckId = `deck-${Date.now()}`;
      const newDeck: FlashcardDeck = {
        id: newDeckId,
        title: data.title || `${topic} Flashcards`,
        topic: data.topic || topic,
        subject: data.subject || subject,
        cardCount: data.flashcards.length,
        color: 'from-rose-600 to-pink-600',
        createdAt: new Date().toISOString(),
      };

      const newCards: Flashcard[] = data.flashcards.map((fc: any, i: number) => ({
        id: `card-${Date.now()}-${i}`,
        deckId: newDeckId,
        front: fc.front,
        back: fc.back,
        hint: fc.hint,
        difficultyRating: 'unrated',
        timesReviewed: 0,
      }));

      onAddDeck(newDeck, newCards);
      setSelectedDeckId(newDeckId);
      setCurrentIndex(0);
      setIsCreateOpen(false);
      setTopic('');
      setSourceNotes('');
    } catch (err) {
      console.error('Error creating deck:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header Banner */}
      <div className="rounded-3xl border border-rose-500/20 bg-gradient-to-r from-rose-500/10 via-pink-500/5 to-transparent p-6 sm:p-8 dark:border-rose-500/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-700 dark:text-rose-300">
              <Layers className="h-3.5 w-3.5" />
              <span>Active Recall & Spaced Repetition</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Interactive 3D Flashcards
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
              Strengthen long-term retention. Tap or press <kbd className="rounded bg-white/60 px-1.5 py-0.5 font-mono text-[11px] shadow-2xs dark:bg-slate-800">Space</kbd> to flip, and rate your confidence to reinforce challenging concepts.
            </p>
          </div>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 rounded-2xl bg-rose-600 px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-rose-700 transition active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>Generate Deck with AI</span>
          </button>
        </div>
      </div>

      {/* Decks Selection Bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200/80 pb-4 dark:border-slate-800">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-2">Decks:</span>
        {decks.map((deck) => {
          const isSelected = deck.id === activeDeck?.id;
          const count = flashcards.filter((c) => c.deckId === deck.id).length;
          return (
            <button
              key={deck.id}
              onClick={() => {
                setSelectedDeckId(deck.id);
                setCurrentIndex(0);
              }}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                isSelected
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800'
              }`}
            >
              <span>{deck.title}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* FLASHCARD STUDY VIEW */}
      {currentCard ? (
        <div className="mx-auto max-w-2xl space-y-6">
          {/* Card Top Meta & Filter */}
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 dark:text-white">
                Card {currentIndex + 1} of {filteredCards.length}
              </span>
              {currentCard.difficultyRating !== 'unrated' && (
                <span
                  className={`rounded-md px-2 py-0.5 text-[10px] font-bold capitalize ${
                    currentCard.difficultyRating === 'easy'
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                      : currentCard.difficultyRating === 'medium'
                      ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                      : 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
                  }`}
                >
                  {currentCard.difficultyRating}
                </span>
              )}
            </div>

            {/* Filter */}
            <div className="flex items-center gap-1">
              <Filter className="h-3.5 w-3.5 text-slate-400" />
              <select
                value={filterRating}
                onChange={(e) => {
                  setFilterRating(e.target.value as any);
                  setCurrentIndex(0);
                }}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
              >
                <option value="all">All Cards</option>
                <option value="hard">Hard Only</option>
                <option value="medium">Medium Only</option>
                <option value="easy">Easy Only</option>
              </select>
            </div>
          </div>

          {/* 3D Flip Card Container */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="group relative h-80 sm:h-96 w-full cursor-pointer [perspective:1000px]"
          >
            <div
              className={`relative h-full w-full rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-md transition-all duration-500 [transform-style:preserve-3d] dark:border-slate-800/80 dark:bg-slate-900 ${
                isFlipped ? '[transform:rotateY(180deg)]' : ''
              }`}
            >
              {/* FRONT OF CARD */}
              <div className="absolute inset-0 flex flex-col justify-between p-6 sm:p-8 [backface-visibility:hidden]">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                      <Zap className="h-3.5 w-3.5" />
                      <span>Question / Prompt</span>
                    </span>
                    <span className="text-[11px]">Click or press Space to reveal answer</span>
                  </div>

                  <div className="mt-8 sm:mt-12 text-center">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 dark:text-white leading-relaxed">
                      {currentCard.front}
                    </h3>
                  </div>
                </div>

                {/* Hint if available */}
                <div>
                  {currentCard.hint && (
                    <div className="pt-2 text-center">
                      {showHint ? (
                        <p className="inline-block rounded-xl bg-amber-500/10 px-3 py-1.5 text-xs text-amber-700 dark:text-amber-300 font-medium">
                          💡 Hint: {currentCard.hint}
                        </p>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowHint(true);
                          }}
                          className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-amber-600 transition"
                        >
                          <Lightbulb className="h-3.5 w-3.5" />
                          <span>Show Hint</span>
                        </button>
                      )}
                    </div>
                  )}

                  <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
                    <FlipHorizontal className="h-3.5 w-3.5 text-rose-500" />
                    <span>Flip Card</span>
                  </div>
                </div>
              </div>

              {/* BACK OF CARD */}
              <div className="absolute inset-0 flex flex-col justify-between p-6 sm:p-8 [backface-visibility:hidden] [transform:rotateY(180deg)] bg-rose-50/20 dark:bg-rose-950/10 rounded-3xl">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Explanation & Answer</span>
                    </span>
                    <span className="text-[11px]">Click to flip back</span>
                  </div>

                  <div className="mt-6 sm:mt-8 overflow-y-auto max-h-52 sm:max-h-60 pr-1 custom-scrollbar text-left text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                    <MarkdownRenderer content={currentCard.back} />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
                  <span className="text-[11px] text-slate-400">
                    Rate how well you knew this below:
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation & Spaced Repetition Buttons */}
          <div className="space-y-4">
            {/* Rating Buttons */}
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => handleRate('hard')}
                className="flex flex-col items-center justify-center rounded-2xl border border-rose-200 bg-rose-50/60 p-3 text-rose-700 shadow-2xs hover:bg-rose-100 hover:border-rose-400 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300 transition active:scale-95"
              >
                <span className="font-bold text-xs sm:text-sm">Hard (1)</span>
                <span className="text-[10px] text-rose-500/80">Needs frequent review</span>
              </button>

              <button
                onClick={() => handleRate('medium')}
                className="flex flex-col items-center justify-center rounded-2xl border border-amber-200 bg-amber-50/60 p-3 text-amber-700 shadow-2xs hover:bg-amber-100 hover:border-amber-400 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300 transition active:scale-95"
              >
                <span className="font-bold text-xs sm:text-sm">Medium (2)</span>
                <span className="text-[10px] text-amber-500/80">Understood with effort</span>
              </button>

              <button
                onClick={() => handleRate('easy')}
                className="flex flex-col items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50/60 p-3 text-emerald-700 shadow-2xs hover:bg-emerald-100 hover:border-emerald-400 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300 transition active:scale-95"
              >
                <span className="font-bold text-xs sm:text-sm">Easy (3)</span>
                <span className="text-[10px] text-emerald-500/80">Mastered concept</span>
              </button>
            </div>

            {/* Previous / Next Controls */}
            <div className="flex items-center justify-between pt-1">
              <button
                onClick={handlePrevCard}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 transition"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Prev (←)</span>
              </button>

              <div className="text-[11px] text-slate-400 hidden sm:block">
                Press <kbd className="rounded border px-1">Space</kbd> to Flip • <kbd className="rounded border px-1">←</kbd>/<kbd className="rounded border px-1">→</kbd> to Navigate
              </div>

              <button
                onClick={handleNextCard}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 transition"
              >
                <span>Next (→)</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-800 max-w-xl mx-auto">
          <Layers className="mx-auto h-10 w-10 text-slate-400" />
          <h4 className="mt-3 font-bold text-base text-slate-700 dark:text-slate-300">
            No Flashcards Found
          </h4>
          <p className="mt-1 text-xs text-slate-500">
            {filterRating !== 'all'
              ? `No cards marked as ${filterRating}. Switch the filter back to "All Cards".`
              : 'Generate your first flashcard deck using the button above!'}
          </p>
        </div>
      )}

      {/* CREATE DECK MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-rose-600" />
                <span>Generate Flashcard Deck</span>
              </h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGenerateDeck} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Academic Subject
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value as AcademicSubject)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-medium text-slate-800 outline-none focus:border-rose-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200"
                >
                  <option value="Mathematics">Mathematics</option>
                  <option value="Physics & Science">Physics & Science</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Biology & Chemistry">Biology & Chemistry</option>
                  <option value="History & Humanities">History & Humanities</option>
                  <option value="Languages & Literature">Languages & Literature</option>
                  <option value="Economics & Finance">Economics & Finance</option>
                  <option value="General Knowledge">General Knowledge</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Deck Topic *
                </label>
                <input
                  type="text"
                  required
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Mitochondria & Respiration, SQL Joins, French Irregular Verbs"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-rose-500 focus:bg-white dark:border-slate-800 dark:bg-slate-800/80 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Number of Cards
                </label>
                <select
                  value={cardCount}
                  onChange={(e) => setCardCount(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:border-rose-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200"
                >
                  <option value={5}>5 High-Yield Cards</option>
                  <option value={6}>6 Standard Cards</option>
                  <option value={8}>8 Comprehensive Cards</option>
                  <option value={10}>10 In-Depth Cards</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Source Notes or Chapter Content (Optional)
                </label>
                <textarea
                  rows={3}
                  value={sourceNotes}
                  onChange={(e) => setSourceNotes(e.target.value)}
                  placeholder="Paste specific textbook notes to extract flashcards from..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-rose-500 focus:bg-white dark:border-slate-800 dark:bg-slate-800/80 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!topic.trim() || isGenerating}
                  className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-5 py-2 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-50 transition"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Generating Cards...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Generate Deck</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
