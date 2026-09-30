import React, { useState, useRef, useEffect } from 'react';
import {
  AcademicSubject,
  ChatMessage,
  StudentLevel,
  TutorTeachingMode,
} from '../types';
import { MarkdownRenderer } from '../utils/markdown';
import {
  ArrowRight,
  BookOpen,
  Bot,
  Check,
  Compass,
  Copy,
  GraduationCap,
  Lightbulb,
  MessageSquare,
  RefreshCw,
  Send,
  Sparkles,
  Trash2,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface AITutorProps {
  chatMessages: ChatMessage[];
  onSendMessage: (userText: string, level: StudentLevel, subject: AcademicSubject, mode: TutorTeachingMode) => Promise<void>;
  onClearHistory: () => void;
  currentLevel: StudentLevel;
  onLevelChange: (lvl: StudentLevel) => void;
  selectedSubject: AcademicSubject;
  onSubjectChange: (sub: AcademicSubject) => void;
  isLoading: boolean;
}

const STARTER_PROMPTS = [
  {
    topic: 'Physics',
    subject: 'Physics & Science' as AcademicSubject,
    question: 'Why do astronauts feel weightless in orbit if gravity is still pulling on them?',
  },
  {
    topic: 'Calculus',
    subject: 'Mathematics' as AcademicSubject,
    question: 'Why does the derivative of e^x equal e^x? Give me an intuitive analogy.',
  },
  {
    topic: 'Computer Science',
    subject: 'Computer Science' as AcademicSubject,
    question: 'Explain what a Hash Table collision is and how chaining resolves it.',
  },
  {
    topic: 'Biology',
    subject: 'Biology & Chemistry' as AcademicSubject,
    question: 'How do mRNA vaccines train the immune system without causing illness?',
  },
];

export const AITutor: React.FC<AITutorProps> = ({
  chatMessages,
  onSendMessage,
  onClearHistory,
  currentLevel,
  onLevelChange,
  selectedSubject,
  onSubjectChange,
  isLoading,
}) => {
  const [inputText, setInputText] = useState('');
  const [teachingMode, setTeachingMode] = useState<TutorTeachingMode>('socratic');
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isLoading]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = inputText.trim();
    if (!text || isLoading) return;

    setInputText('');
    await onSendMessage(text, currentLevel, selectedSubject, teachingMode);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Browser SpeechSynthesis read-aloud
  const handleToggleSpeak = (id: string, text: string) => {
    if (!('speechSynthesis' in window)) return;

    if (speakingMessageId === id) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Strip markdown symbols for natural reading
    const cleanSpeech = text
      .replace(/[#*`_~$$]/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);

    setSpeakingMessageId(id);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex h-[calc(100vh-4.5rem)] flex-col bg-slate-50/50 dark:bg-slate-950">
      {/* Control Header: Mode, Level, and Subject Bar */}
      <div className="border-b border-slate-200/80 bg-white px-4 py-3 dark:border-slate-800/80 dark:bg-slate-900 shadow-2xs">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
          {/* Mode Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Teaching Mode:</span>
            <div className="flex rounded-xl bg-slate-100 p-0.5 dark:bg-slate-800">
              <button
                onClick={() => setTeachingMode('socratic')}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                  teachingMode === 'socratic'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                }`}
                title="Socratic Guide: Guides you with questions and intuition before answers"
              >
                <Compass className="h-3.5 w-3.5" />
                <span>Socratic Guide</span>
              </button>
              <button
                onClick={() => setTeachingMode('direct')}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                  teachingMode === 'direct'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                }`}
                title="Direct Explanation: Explains concepts step-by-step with analogies"
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span>Direct Explainer</span>
              </button>
            </div>
          </div>

          {/* Level Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Level:</span>
            <div className="flex rounded-xl bg-slate-100 p-0.5 dark:bg-slate-800">
              {(['beginner', 'intermediate', 'advanced'] as StudentLevel[]).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => onLevelChange(lvl)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium capitalize transition ${
                    currentLevel === lvl
                      ? 'bg-white font-bold text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>

            {/* Clear history */}
            <button
              onClick={onClearHistory}
              title="Clear conversation"
              className="ml-2 rounded-xl p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 transition"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Welcome / Initial Guidance Card if few messages */}
          {chatMessages.length <= 1 && (
            <div className="rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 via-teal-500/5 to-transparent p-5 sm:p-6 dark:border-emerald-500/20">
              <div className="flex items-center gap-2.5 font-bold text-sm text-emerald-800 dark:text-emerald-300">
                <Sparkles className="h-4 w-4" />
                <span>Socratic AI Tutor Ready</span>
              </div>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                I adapt to your comprehension level (<strong>{currentLevel}</strong>) and teach through intuition, practical analogies, and step-by-step guidance. Pick a starter question below or type anything!
              </p>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {STARTER_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      onSubjectChange(prompt.subject);
                      onSendMessage(prompt.question, currentLevel, prompt.subject, teachingMode);
                    }}
                    className="flex flex-col text-left rounded-2xl border border-slate-200/80 bg-white/90 p-3 hover:border-emerald-500 hover:bg-emerald-50/40 dark:border-slate-800 dark:bg-slate-900/90 dark:hover:bg-emerald-950/20 transition group"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      {prompt.topic}
                    </span>
                    <span className="mt-1 text-xs text-slate-700 dark:text-slate-300 font-medium group-hover:text-emerald-900 dark:group-hover:text-emerald-200">
                      {prompt.question}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Conversation Feed */}
          {chatMessages.map((msg) => {
            const isUser = msg.role === 'user';
            const isSpeaking = speakingMessageId === msg.id;

            return (
              <div
                key={msg.id}
                className={`flex gap-3 sm:gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-sm mt-0.5">
                    <Bot className="h-5 w-5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[78%] rounded-3xl p-4 sm:p-5 shadow-xs transition-all ${
                    isUser
                      ? 'bg-emerald-600 text-white rounded-tr-none'
                      : 'border border-slate-200/80 bg-white dark:border-slate-800/80 dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-tl-none'
                  }`}
                >
                  {/* Tutor Header if assistant */}
                  {!isUser && (
                    <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-emerald-600 dark:text-emerald-400">
                          MindBloom Tutor
                        </span>
                        {msg.subject && (
                          <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                            {msg.subject}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleToggleSpeak(msg.id, msg.content)}
                          title={isSpeaking ? 'Stop speaking' : 'Read aloud'}
                          className={`rounded-lg p-1 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition ${
                            isSpeaking ? 'text-emerald-600 animate-pulse' : ''
                          }`}
                        >
                          {isSpeaking ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                        </button>
                        <button
                          onClick={() => handleCopyMessage(msg.id, msg.content)}
                          title="Copy message"
                          className="rounded-lg p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                        >
                          {copiedId === msg.id ? (
                            <Check className="h-3.5 w-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Body Content */}
                  {isUser ? (
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                  ) : (
                    <MarkdownRenderer content={msg.content} />
                  )}

                  {/* Key Takeaway Callout */}
                  {!isUser && msg.keyTakeaway && (
                    <div className="mt-3.5 rounded-2xl border border-indigo-500/20 bg-indigo-50/60 p-3 dark:bg-indigo-950/30">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-indigo-700 dark:text-indigo-300">
                        <Lightbulb className="h-3.5 w-3.5" />
                        <span>Core Mental Model:</span>
                      </div>
                      <p className="mt-1 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                        {msg.keyTakeaway}
                      </p>
                    </div>
                  )}

                  {/* Follow-up Inquiry Questions */}
                  {!isUser && msg.followUps && msg.followUps.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <p className="text-[11px] font-bold text-slate-400 mb-2 flex items-center gap-1">
                        <GraduationCap className="h-3.5 w-3.5 text-emerald-500" />
                        <span>Follow-up questions to explore:</span>
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.followUps.map((question, qIdx) => (
                          <button
                            key={qIdx}
                            onClick={() => onSendMessage(question, currentLevel, selectedSubject, teachingMode)}
                            className="flex items-center gap-1.5 rounded-xl border border-slate-200/90 bg-slate-50/80 px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-800 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300 transition text-left"
                          >
                            <span>{question}</span>
                            <ArrowRight className="h-3 w-3 shrink-0 opacity-60" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-sm">
                <Bot className="h-5 w-5" />
              </div>
              <div className="rounded-3xl rounded-tl-none border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
                <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>MindBloom is formulating pedagogical breakdown...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Bar */}
      <div className="border-t border-slate-200/80 bg-white p-3 sm:p-4 dark:border-slate-800/80 dark:bg-slate-900 shadow-lg">
        <form onSubmit={handleSubmit} className="mx-auto max-w-4xl">
          <div className="relative flex items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 focus-within:border-emerald-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-500/20 dark:border-slate-800 dark:bg-slate-800/70 dark:focus-within:border-emerald-500 dark:focus-within:bg-slate-900 transition">
            <textarea
              ref={inputRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Ask about any topic in ${selectedSubject}... (e.g. "Why does water expand when freezing?")`}
              rows={2}
              className="max-h-36 min-h-[48px] w-full resize-none bg-transparent px-3 py-1.5 text-sm text-slate-900 placeholder-slate-400 outline-none dark:text-white dark:placeholder-slate-500"
            />

            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md transition hover:bg-emerald-700 disabled:opacity-40 disabled:pointer-events-none active:scale-95"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-2 flex items-center justify-between px-1 text-[11px] text-slate-400">
            <span>
              Tip: Press <kbd className="rounded border border-slate-300 px-1 py-0.5 font-mono dark:border-slate-700">Enter</kbd> to send, <kbd className="rounded border border-slate-300 px-1 py-0.5 font-mono dark:border-slate-700">Shift+Enter</kbd> for newline
            </span>
            <span className="hidden sm:inline">
              Mode: <strong className="capitalize text-slate-600 dark:text-slate-300">{teachingMode}</strong>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};
