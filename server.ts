import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const isProd = process.env.NODE_ENV === 'production';
const app = express();
app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI SDK as instructed in gemini-api skill
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const TUTOR_SYSTEM_INSTRUCTION = `You are MindBloom, an expert personal tutor. Your goal is not merely to provide answers, but to help the student understand the reasoning behind them. Adapt your explanation to the student's level, use simple examples, analogies, ask useful follow-up questions, and provide hints before complete solutions when appropriate. When the student makes a mistake, explain the misconception respectfully and show how to correct it. Always format mathematics, formulas, and code cleanly using Markdown and LaTeX-style notations.`;

// Helper to clean JSON responses from LLM
function cleanAndParseJSON(rawText: string, fallback: any = null): any {
  try {
    let clean = rawText.trim();
    if (clean.startsWith('```json')) {
      clean = clean.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (clean.startsWith('```')) {
      clean = clean.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    return JSON.parse(clean);
  } catch (err) {
    console.warn('Failed to parse JSON directly, attempting substring match:', err);
    try {
      const firstBrace = rawText.indexOf('{');
      const lastBrace = rawText.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        return JSON.parse(rawText.substring(firstBrace, lastBrace + 1));
      }
      const firstBracket = rawText.indexOf('[');
      const lastBracket = rawText.lastIndexOf(']');
      if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
        return JSON.parse(rawText.substring(firstBracket, lastBracket + 1));
      }
    } catch (inner) {
      console.error('Failed substring JSON parse:', inner);
    }
    return fallback;
  }
}

// Robust multi-model generator with automatic fallback in case of demand spikes
async function generateGeminiWithFallback(contents: any, config: any) {
  const models = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
  let lastErr: any = null;
  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config,
      });
      if (response && response.text) {
        return response;
      }
    } catch (err: any) {
      lastErr = err;
      console.warn(`Model ${model} encounter issue, trying alternative:`, err?.message || err);
    }
  }
  throw lastErr || new Error('All models unavailable');
}

// 1. AI Tutor Chat Endpoint
app.post('/api/gemini/tutor-chat', async (req: Request, res: Response) => {
  try {
    const { messages, level = 'intermediate', subject = 'General Knowledge', mode = 'socratic' } = req.body;
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    if (!apiKey) {
      return res.json({
        content: `**MindBloom Tutor Note:** (Demo Mode)\n\nI understand you're asking about this topic in **${subject}** at the **${level}** level!\n\nTo explain this clearly: imagine breaking down the central mechanism into two parts. In ${mode === 'socratic' ? 'Socratic inquiry mode, what do you think would happen if we altered the first variable?' : 'explanatory mode, the core principle is based on systematic causality.'}\n\n*Key Takeaway:* Learning is about building mental models, not memorization!`,
        followUps: [
          'Can you give me a real-world analogy?',
          'How does this apply to practical problem solving?',
          'What is the most common misconception about this?',
        ],
      });
    }

    const conversationHistory = messages.map(m => `${m.role === 'user' ? 'Student' : 'Tutor'}: ${m.content}`).join('\n\n');

    const prompt = `Student Level: ${level}
Subject: ${subject}
Tutoring Style: ${mode === 'socratic' ? 'Socratic Guidance (Guide the student with thoughtful questions, analogies, and intuition before giving the final answer)' : 'Direct Explanation with Step-by-Step Breakdown and Examples'}

Conversation History:
${conversationHistory}

Please provide your response as a JSON object with this exact structure:
{
  "content": "Your rich markdown response. Use bolding, bullet points, $$ math equations $$ if math, and friendly encouraging tone.",
  "followUps": ["3 short, engaging questions the student might want to ask next to deepen their understanding"],
  "keyTakeaway": "A one-sentence summary rule or mental model to remember"
}
Output valid JSON only.`;

    const response = await generateGeminiWithFallback(prompt, {
      systemInstruction: TUTOR_SYSTEM_INSTRUCTION,
        temperature: 0.7,
      }
    );

    const parsed = cleanAndParseJSON(response.text || '', null);
    if (parsed && parsed.content) {
      return res.json(parsed);
    }

    return res.json({
      content: response.text || 'I am ready to help you learn! What would you like to explore next?',
      followUps: [
        'Can you show me an example problem?',
        'How does this relate to foundational principles?',
        'Can you explain it with an everyday analogy?',
      ],
      keyTakeaway: 'Understanding the core concept unlocks the details.',
    });
  } catch (error: any) {
    console.error('Error in /api/gemini/tutor-chat:', error);
    res.status(500).json({
      error: error?.message || 'Failed to generate tutor response.',
      content: 'I ran into an issue connecting to Gemini. Please try asking again in a moment!',
      followUps: ['Try asking again', 'Summarize key points', 'Test with a simpler question'],
    });
  }
});

// 2. Homework Helper Endpoint (Hints-first workflow)
app.post('/api/gemini/homework', async (req: Request, res: Response) => {
  try {
    const { problem, studentAttempt = '', subject = 'Mathematics', level = 'intermediate' } = req.body;

    if (!problem) {
      return res.status(400).json({ error: 'Problem description is required.' });
    }

    if (!apiKey) {
      return res.json({
        problem,
        keyFormulas: ['Formula 1: Identify given variables', 'Formula 2: Apply fundamental conservation or balance law'],
        hints: [
          { hintNumber: 1, title: 'Concept Intuition', content: 'Break the problem down into what is given and what needs to be found. What underlying physical or mathematical law applies?' },
          { hintNumber: 2, title: 'Equation Setup', content: 'Set up your equation equating initial state to final state or setting up the algebraic relation.' },
          { hintNumber: 3, title: 'Execution Checkpoint', content: 'Substitute values carefully and check if your units match the required outcome.' },
        ],
        fullSolution: '1. Identify given values.\n2. Apply appropriate relation.\n3. Solve for unknown algebraically.\n4. Verify physical sense.',
        misconceptionsIdentified: studentAttempt ? 'Great start attempting the problem! Make sure to keep track of signs and order of operations.' : 'Always sketch a diagram or list knowns/unknowns first.',
      });
    }

    const prompt = `You are helping a student with homework.
Subject: ${subject}
Level: ${level}
Problem:
"""
${problem}
"""
${studentAttempt ? `Student's initial attempt / thought process:\n"""\n${studentAttempt}\n"""` : 'Student has not submitted an attempt yet.'}

Provide a pedagogical assistance package that guides the student with hints first.
Return a JSON object with this exact schema:
{
  "keyFormulas": ["List of 2-4 key equations, formulas, or rules needed for this problem"],
  "hints": [
    {
      "hintNumber": 1,
      "title": "Intuitive Idea & First Step",
      "content": "Hint focusing on concept without giving away the calculation."
    },
    {
      "hintNumber": 2,
      "title": "Equation Setup & Strategy",
      "content": "Hint on how to arrange the variables and what to isolate."
    },
    {
      "hintNumber": 3,
      "title": "Near-Solution Checkpoint",
      "content": "Specific guidance to cross the finish line."
    }
  ],
  "fullSolution": "Complete step-by-step verified solution with calculations, formula derivations, and clear concluding answer.",
  "misconceptionsIdentified": "${studentAttempt ? 'Respectful constructive feedback on student attempt, pinpointing what was correct and identifying any misconceptions.' : 'Common pitfalls students make on this type of problem and how to avoid them.'}"
}
Output valid JSON only.`;

    const response = await generateGeminiWithFallback(prompt, {
      systemInstruction: TUTOR_SYSTEM_INSTRUCTION,
        temperature: 0.4,
      }
    );

    const parsed = cleanAndParseJSON(response.text || '', null);
    if (parsed) {
      return res.json({ problem, ...parsed });
    }

    res.status(500).json({ error: 'Failed to parse homework assistance.' });
  } catch (error: any) {
    console.error('Error in /api/gemini/homework:', error);
    res.status(500).json({ error: error?.message || 'Error generating homework help' });
  }
});

// 3. Study Planner Endpoint
app.post('/api/gemini/study-plan', async (req: Request, res: Response) => {
  try {
    const { topic, totalTimeMinutes = 60, goal = '', subject = 'General Knowledge', level = 'intermediate' } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'Topic is required.' });
    }

    const prompt = `Create a structured, highly actionable study plan for a student.
Topic: ${topic}
Subject: ${subject}
Student Level: ${level}
Total Available Time: ${totalTimeMinutes} minutes
Specific Goal: ${goal || 'Master foundational understanding and practical application'}

Break this topic into 3 to 5 realistic, sequential study sessions that add up to ${totalTimeMinutes} minutes total. Include revision and active practice.

Return a JSON object matching this schema:
{
  "title": "Clear catchy title for the plan",
  "subject": "${subject}",
  "level": "${level}",
  "goal": "Summary of what student will achieve",
  "totalTimeMinutes": ${totalTimeMinutes},
  "sessions": [
    {
      "sessionNumber": 1,
      "title": "Session title",
      "durationMinutes": 20,
      "description": "What to do in this session and what to focus on",
      "keyConcepts": ["Concept 1", "Concept 2"],
      "revisionTips": ["Quick recall prompt or technique"],
      "practiceTask": "Specific micro-exercise or active recall test to perform"
    }
  ]
}
Output valid JSON only.`;

    const response = await generateGeminiWithFallback(prompt, {
      systemInstruction: TUTOR_SYSTEM_INSTRUCTION,
        temperature: 0.5,
      }
    );

    const parsed = cleanAndParseJSON(response.text || '', null);
    if (parsed && parsed.sessions) {
      return res.json(parsed);
    }

    res.status(500).json({ error: 'Failed to generate study plan.' });
  } catch (error: any) {
    console.error('Error in /api/gemini/study-plan:', error);
    res.status(500).json({ error: error?.message || 'Error generating study plan' });
  }
});

// 4. Quiz Generator Endpoint
app.post('/api/gemini/quiz', async (req: Request, res: Response) => {
  try {
    const { topic, subject = 'General', difficulty = 'intermediate', questionCount = 4, sourceText = '' } = req.body;

    if (!topic && !sourceText) {
      return res.status(400).json({ error: 'Topic or sourceText is required.' });
    }

    const prompt = `Generate a high quality educational quiz.
Topic: ${topic || 'Pasted Material'}
Subject: ${subject}
Difficulty: ${difficulty}
Total Questions: ${questionCount}
${sourceText ? `Source Text Material:\n"""\n${sourceText.slice(0, 3000)}\n"""` : ''}

Include a mix of multiple_choice and true_false questions.
For each question, provide detailed explanation explaining why the correct answer is right and why distractors are common misconceptions.

Return a JSON object:
{
  "title": "Title of Quiz",
  "topic": "${topic || 'Key Concepts'}",
  "subject": "${subject}",
  "difficulty": "${difficulty}",
  "questions": [
    {
      "id": "q-1",
      "question": "Clear question text?",
      "type": "multiple_choice",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Exact string of correct option",
      "explanation": "Detailed pedagogical explanation of why this answer is correct and what makes the other options incorrect."
    }
  ]
}
Output valid JSON only.`;

    const response = await generateGeminiWithFallback(prompt, {
      systemInstruction: TUTOR_SYSTEM_INSTRUCTION,
        temperature: 0.6,
      }
    );

    const parsed = cleanAndParseJSON(response.text || '', null);
    if (parsed && parsed.questions) {
      return res.json(parsed);
    }

    res.status(500).json({ error: 'Failed to generate quiz.' });
  } catch (error: any) {
    console.error('Error in /api/gemini/quiz:', error);
    res.status(500).json({ error: error?.message || 'Error generating quiz' });
  }
});

// 5. Summarizer Endpoint
app.post('/api/gemini/summarize', async (req: Request, res: Response) => {
  try {
    const { text, title = 'Study Notes' } = req.body;

    if (!text || text.trim().length < 20) {
      return res.status(400).json({ error: 'Please provide at least a few sentences to summarize.' });
    }

    const prompt = `Analyze and summarize the following study material thoroughly:
"""
${text.slice(0, 8000)}
"""

Generate a complete educational breakdown in JSON format matching this schema:
{
  "title": "${title}",
  "executiveSummary": "Clear, concise 2-3 paragraph summary capturing the core ideas in simple terms",
  "keyPoints": [
    "Bullet point 1",
    "Bullet point 2",
    "Bullet point 3",
    "Bullet point 4",
    "Bullet point 5"
  ],
  "definitions": [
    {
      "term": "Term Name",
      "definition": "Clear concise explanation",
      "example": "Real world analogy or example"
    }
  ],
  "flashcards": [
    {
      "front": "Question or prompt testing a core concept",
      "back": "Clear answer and explanation"
    }
  ],
  "practiceQuestions": [
    {
      "question": "Conceptual or analytical question",
      "answer": "Complete answer with reasoning"
    }
  ]
}
Output valid JSON only.`;

    const response = await generateGeminiWithFallback(prompt, {
      systemInstruction: TUTOR_SYSTEM_INSTRUCTION,
        temperature: 0.5,
      }
    );

    const parsed = cleanAndParseJSON(response.text || '', null);
    if (parsed && parsed.executiveSummary) {
      return res.json(parsed);
    }

    res.status(500).json({ error: 'Failed to generate summary.' });
  } catch (error: any) {
    console.error('Error in /api/gemini/summarize:', error);
    res.status(500).json({ error: error?.message || 'Error generating summary' });
  }
});

// 6. Flashcards Generator Endpoint
app.post('/api/gemini/flashcards', async (req: Request, res: Response) => {
  try {
    const { topic, sourceText = '', count = 6, subject = 'General' } = req.body;

    if (!topic && !sourceText) {
      return res.status(400).json({ error: 'Topic or sourceText is required.' });
    }

    const prompt = `Generate ${count} high-yield flashcards for learning and spaced repetition.
Topic: ${topic || 'Custom Material'}
Subject: ${subject}
${sourceText ? `Source Text:\n"""\n${sourceText.slice(0, 3000)}\n"""` : ''}

Create cards that focus on understanding, definitions, key formulas, mechanisms, and common misconceptions.

Return JSON schema:
{
  "title": "Deck title",
  "topic": "${topic || 'General'}",
  "subject": "${subject}",
  "flashcards": [
    {
      "front": "Clear front question, prompt, or term",
      "back": "Clear, comprehensive answer with reasoning",
      "hint": "Optional helpful tip or memory hook"
    }
  ]
}
Output valid JSON only.`;

    const response = await generateGeminiWithFallback(prompt, {
      systemInstruction: TUTOR_SYSTEM_INSTRUCTION,
        temperature: 0.6,
      }
    );

    const parsed = cleanAndParseJSON(response.text || '', null);
    if (parsed && parsed.flashcards) {
      return res.json(parsed);
    }

    res.status(500).json({ error: 'Failed to generate flashcards.' });
  } catch (error: any) {
    console.error('Error in /api/gemini/flashcards:', error);
    res.status(500).json({ error: error?.message || 'Error generating flashcards' });
  }
});

// Start the Express server with Vite middleware in dev mode
async function startServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    // In dev, serve index.html transformed by Vite for non-API routes
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        const indexPath = path.resolve(__dirname, 'index.html');
        let template = fs.readFileSync(indexPath, 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MindBloom Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
});
