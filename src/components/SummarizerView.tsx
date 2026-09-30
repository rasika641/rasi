import React, { useState } from 'react';
import {
  Flashcard,
  FlashcardDeck,
  SummarizerResult,
} from '../types';
import { MarkdownRenderer } from '../utils/markdown';
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  FileText,
  HelpCircle,
  Layers,
  Lightbulb,
  Plus,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

interface SummarizerViewProps {
  onAddDeckFromSummary: (deck: FlashcardDeck, cards: Flashcard[]) => void;
}

const SAMPLE_NOTES = [
  {
    title: 'Photosynthesis & Light Reactions',
    text: `Photosynthesis is the biological process used by plants, algae, and cyanobacteria to convert light energy into chemical energy stored in carbohydrate molecules such as glucose.

The light-dependent reactions take place within the thylakoid membranes of chloroplasts. Chlorophyll molecules in Photosystem II (PSII) absorb photons of light, exciting electrons to a higher energy level. These high-energy electrons are passed through an electron transport chain to Photosystem I (PSI).

Crucially, water (H2O) is photolyzed into protons (H+), electrons, and molecular oxygen (O2) at PSII to replenish the lost electrons. This is why plants release oxygen into the atmosphere.

As electrons travel down the transport chain, protons are actively pumped across the thylakoid membrane into the thylakoid lumen, establishing a steep electrochemical proton gradient. Protons then flow down this gradient through ATP synthase via chemiosmosis, generating ATP from ADP and inorganic phosphate. Meanwhile, ferredoxin and NADP+ reductase facilitate the transfer of electrons at PSI to convert NADP+ into NADPH. Both ATP and NADPH are later consumed in the stroma during the light-independent Calvin cycle to fix carbon dioxide into sugars.`,
  },
  {
    title: 'Machine Learning: Gradient Descent & Loss',
    text: `Gradient descent is an iterative optimization algorithm used to minimize the cost or loss function in machine learning and deep learning models. The loss function quantifies the discrepancy between the model's predicted output and the true ground-truth labels.

To minimize this loss, the algorithm computes the partial derivatives of the loss function with respect to each model parameter (weights and biases)—this vector of partial derivatives is known as the gradient. The gradient indicates the direction of steepest ascent on the loss surface. Therefore, parameters are updated in the opposite direction (steepest descent) by subtracting a fraction of the gradient.

The size of the step taken in each iteration is governed by the learning rate hyperparameter (alpha). If the learning rate is too large, the algorithm may overshoot the minimum and diverge or oscillate uncontrollably. Conversely, if the learning rate is too small, training will be agonizingly slow and may become trapped in local minima or saddle points.

Common variants include:
1. Batch Gradient Descent: Computes the gradient over the entire dataset before making an update. Precise but computationally expensive for large datasets.
2. Stochastic Gradient Descent (SGD): Updates weights for each training sample individually. Fast and noisy, which helps jump out of shallow local minima.
3. Mini-batch Gradient Descent: Updates weights over small batches (typically 32 to 512 samples), balancing computational efficiency with vectorization and convergence stability.`,
  },
];

export const SummarizerView: React.FC<SummarizerViewProps> = ({
  onAddDeckFromSummary,
}) => {
  const [inputText, setInputText] = useState('');
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SummarizerResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [revealedAnswers, setRevealedAnswers] = useState<Record<number, boolean>>({});
  const [addedCards, setAddedCards] = useState(false);

  const handleLoadSample = (sample: typeof SAMPLE_NOTES[0]) => {
    setTitle(sample.title);
    setInputText(sample.text);
  };

  const handleSummarize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    setIsLoading(true);
    setAddedCards(false);
    try {
      const res = await fetch('/api/gemini/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText.trim(),
          title: title.trim() || 'Study Notes Breakdown',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.executiveSummary) {
        throw new Error(data.error || 'Failed to summarize text');
      }

      const summaryRes: SummarizerResult = {
        id: `sum-${Date.now()}`,
        title: data.title || title || 'Summary',
        executiveSummary: data.executiveSummary,
        keyPoints: data.keyPoints || [],
        definitions: data.definitions || [],
        flashcards: data.flashcards || [],
        practiceQuestions: data.practiceQuestions || [],
        createdAt: new Date().toISOString(),
      };

      setResult(summaryRes);
    } catch (err) {
      console.error('Summarize error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopySummary = () => {
    if (!result) return;
    const textToCopy = `# ${result.title}

## Summary
${result.executiveSummary}

## Key Takeaways
${result.keyPoints.map((p) => `- ${p}`).join('\n')}

## Key Definitions
${result.definitions.map((d) => `**${d.term}**: ${d.definition} (e.g. ${d.example || ''})`).join('\n')}
`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateDeckFromSummary = () => {
    if (!result || !result.flashcards || result.flashcards.length === 0) return;

    const deckId = `deck-${Date.now()}`;
    const newDeck: FlashcardDeck = {
      id: deckId,
      title: `${result.title} (Summary)`,
      topic: result.title,
      subject: 'General Knowledge',
      cardCount: result.flashcards.length,
      color: 'from-teal-600 to-emerald-600',
      createdAt: new Date().toISOString(),
    };

    const cards: Flashcard[] = result.flashcards.map((f, i) => ({
      id: `card-sum-${Date.now()}-${i}`,
      deckId,
      front: f.front,
      back: f.back,
      difficultyRating: 'unrated',
      timesReviewed: 0,
    }));

    onAddDeckFromSummary(newDeck, cards);
    setAddedCards(true);
  };

  const toggleQuestionAnswer = (idx: number) => {
    setRevealedAnswers((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header Banner */}
      <div className="rounded-3xl border border-teal-500/20 bg-gradient-to-r from-teal-500/10 via-emerald-500/5 to-transparent p-6 sm:p-8 dark:border-teal-500/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-teal-500/10 px-3 py-1 text-xs font-semibold text-teal-700 dark:text-teal-300">
              <BookOpen className="h-3.5 w-3.5" />
              <span>Multi-Format Knowledge Extractor</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Study Material Summarizer
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
              Paste long chapters, transcripts, or messy notes. Gemini extracts a clean executive summary, key bullet points, essential vocabulary definitions, flashcards, and active practice questions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Load Sample:</span>
            {SAMPLE_NOTES.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => handleLoadSample(sample)}
                className="rounded-xl border border-slate-200/90 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs hover:border-teal-500 hover:text-teal-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 transition"
              >
                {sample.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Input text area (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800/80 dark:bg-slate-900">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <FileText className="h-4 w-4 text-teal-600" />
              <span>Paste Study Material</span>
            </h3>

            <form onSubmit={handleSummarize} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Title / Subject Label (Optional)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Chapter 4: Cellular Respiration"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-teal-500 focus:bg-white dark:border-slate-800 dark:bg-slate-800/80 dark:text-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Content to Analyze *
                </label>
                <textarea
                  required
                  rows={10}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Paste lecture notes, study guide, paper excerpt, or textbook section here..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-teal-500 focus:bg-white dark:border-slate-800 dark:bg-slate-800/80 dark:text-white transition"
                />
              </div>

              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-teal-600 px-4 py-3 text-sm font-bold text-white shadow-md hover:bg-teal-700 disabled:opacity-50 transition active:scale-98"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Extracting Key Concepts & Cards...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Generate Complete Breakdown</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Multi-Section Breakdown Result (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {result ? (
            <div className="space-y-6">
              {/* Header Action Bar */}
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-3 dark:border-slate-800">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                  {result.title}
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopySummary}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 transition"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy All'}</span>
                  </button>
                </div>
              </div>

              {/* 1. Executive Summary */}
              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800/80 dark:bg-slate-900 space-y-3">
                <div className="flex items-center gap-2 font-bold text-sm text-teal-700 dark:text-teal-400">
                  <BookOpen className="h-4 w-4" />
                  <span>Executive Summary</span>
                </div>
                <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  <MarkdownRenderer content={result.executiveSummary} />
                </div>
              </div>

              {/* 2. Key Points */}
              {result.keyPoints && result.keyPoints.length > 0 && (
                <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800/80 dark:bg-slate-900 space-y-3">
                  <div className="flex items-center gap-2 font-bold text-sm text-indigo-700 dark:text-indigo-400">
                    <Lightbulb className="h-4 w-4" />
                    <span>Essential Key Points</span>
                  </div>
                  <ul className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300 pl-4 list-disc marker:text-teal-500">
                    {result.keyPoints.map((point, i) => (
                      <li key={i} className="leading-relaxed">
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 3. Definitions Glossary */}
              {result.definitions && result.definitions.length > 0 && (
                <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800/80 dark:bg-slate-900 space-y-3">
                  <div className="flex items-center gap-2 font-bold text-sm text-purple-700 dark:text-purple-400">
                    <BookOpen className="h-4 w-4" />
                    <span>Important Definitions & Vocabulary</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {result.definitions.map((def, i) => (
                      <div
                        key={i}
                        className="rounded-2xl border border-slate-200/70 bg-slate-50 p-3.5 text-xs dark:border-slate-800 dark:bg-slate-800/50"
                      >
                        <span className="font-bold text-slate-900 dark:text-white block mb-1">
                          {def.term}
                        </span>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                          {def.definition}
                        </p>
                        {def.example && (
                          <p className="mt-1.5 text-[11px] text-purple-600 dark:text-purple-400 font-medium">
                            💡 {def.example}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. Generated Flashcards */}
              {result.flashcards && result.flashcards.length > 0 && (
                <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800/80 dark:bg-slate-900 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-sm text-rose-700 dark:text-rose-400">
                      <Layers className="h-4 w-4" />
                      <span>Extracted Flashcards ({result.flashcards.length})</span>
                    </div>

                    <button
                      onClick={handleCreateDeckFromSummary}
                      disabled={addedCards}
                      className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-rose-700 disabled:opacity-60 transition"
                    >
                      {addedCards ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          <span>Added to Decks!</span>
                        </>
                      ) : (
                        <>
                          <Plus className="h-3.5 w-3.5" />
                          <span>Save as Flashcard Deck</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {result.flashcards.map((card, i) => (
                      <div
                        key={i}
                        className="rounded-2xl border border-rose-200/70 bg-rose-50/20 p-3.5 text-xs dark:border-rose-900/30 dark:bg-rose-950/20 space-y-2"
                      >
                        <div className="font-bold text-slate-800 dark:text-slate-200">
                          Q: {card.front}
                        </div>
                        <div className="text-slate-600 dark:text-slate-400 border-t border-rose-100 pt-1.5 dark:border-rose-900/30">
                          A: {card.back}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. Practice Questions */}
              {result.practiceQuestions && result.practiceQuestions.length > 0 && (
                <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800/80 dark:bg-slate-900 space-y-3">
                  <div className="flex items-center gap-2 font-bold text-sm text-amber-700 dark:text-amber-400">
                    <HelpCircle className="h-4 w-4" />
                    <span>Practice Recall Questions</span>
                  </div>

                  <div className="space-y-3">
                    {result.practiceQuestions.map((q, i) => {
                      const isRevealed = !!revealedAnswers[i];
                      return (
                        <div
                          key={i}
                          className="rounded-2xl border border-slate-200/80 bg-slate-50 p-4 text-xs dark:border-slate-800 dark:bg-slate-800/50 space-y-2"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <span className="font-bold text-slate-900 dark:text-white leading-relaxed">
                              {i + 1}. {q.question}
                            </span>
                            <button
                              onClick={() => toggleQuestionAnswer(i)}
                              className="shrink-0 flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-teal-600 dark:text-teal-400 hover:bg-white dark:hover:bg-slate-800 transition"
                            >
                              <span>{isRevealed ? 'Hide Answer' : 'Show Answer'}</span>
                              {isRevealed ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                            </button>
                          </div>

                          {isRevealed && (
                            <div className="border-t border-slate-200/60 pt-2 text-slate-700 dark:text-slate-300 leading-relaxed dark:border-slate-700">
                              <strong>Answer:</strong> {q.answer}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-800">
              <BookOpen className="mx-auto h-10 w-10 text-slate-400" />
              <h4 className="mt-3 font-bold text-base text-slate-700 dark:text-slate-300">
                Ready to Summarize
              </h4>
              <p className="mt-1 text-xs text-slate-500">
                Paste your notes on the left or click one of the samples above to generate a complete educational breakdown.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
