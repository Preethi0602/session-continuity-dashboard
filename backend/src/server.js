require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const jwt     = require('jsonwebtoken');
const bcrypt  = require('bcryptjs');

// LangChain imports
const { ChatAnthropic }     = require('@langchain/anthropic');
const { Document }           = require('@langchain/core/documents');
const { PromptTemplate }     = require('@langchain/core/prompts');
const { StringOutputParser } = require('@langchain/core/output_parsers');
const { RunnableSequence, RunnablePassthrough } = require('@langchain/core/runnables');

const app        = express();
const PORT       = process.env.PORT       || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// LangChain LLM
const llm = new ChatAnthropic({
  apiKey:    process.env.ANTHROPIC_API_KEY,
  model:     'claude-sonnet-4-5',
  maxTokens: 512,
});


// Local Embeddings (TF-IDF style)
// In production: Anthropic voyage-3 embeddings + pgvector


const VOCAB = [
  'anxiety','depression','sleep','mood','session','patient','progress',
  'improvement','ketamine','integration','exercise','journalling','flag',
  'medication','response','therapy','positive','negative','concern','breakthrough',
  'trauma','ptsd','stress','burnout','wellbeing','grounding','check','missed',
  'engaged','frustrated','hopeful','elevated','disrupted','consistent','treatment',
  'breathing','cognitive','reframing','dissociation','transition','postpartum',
  'identity','workplace','intrusive','thoughts','rating','history','baseline',
];

function localEmbed(text) {
  const words = text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/);
  const vec   = VOCAB.map((word) => {
    const count = words.filter((w) => w === word).length;
    return count / (words.length || 1);
  });
  const mag = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1;
  return vec.map((v) => v / mag);
}


// Simple In-memory vector store
// In production: pgvector + PostgreSQL


class SimpleVectorStore {
  constructor() { this.docs = []; }

  addDocuments(docs, vectors) {
    docs.forEach((doc, i) => {
      this.docs.push({ doc, vector: vectors[i] });
    });
  }

  cosineSimilarity(a, b) {
    const dot  = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dot / (magA * magB || 1);
  }

  async similaritySearch(query, k = 3) {
    const queryVec = localEmbed(query);
    return this.docs
      .map(({ doc, vector }) => ({
        doc,
        score: this.cosineSimilarity(queryVec, vector),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, k)
      .map(({ doc }) => doc);
  }
}

// Users (PostgreSQL in production)
const users = [
  {
    id:           1,
    name:         'Preethi Kotturu',
    email:        'preethi@betterucare.com',
    passwordHash: bcrypt.hashSync('demo123', 10),
    role:         'coordinator',
    initials:     'PK',
  },
];

//Patient data (PostgreSQL in production)
const patients = {
  'sarah-kim': {
    id: 'sarah-kim',
    name: 'Sarah Kim',
    initials: 'SK',
    session: { current: 4, total: 6 },
    program: 'Ketamine Therapy',
    nextSession: 'Today at 3:00 PM',
    flags: [
      { id: 1, label: 'Missed Monday check-in', severity: 'warning', isNew: true },
    ],
    medications: [
      { name: 'Ketamine (home kit)', status: 'Active', updatedDaysAgo: 3 },
    ],
    lastSession: {
      daysAgo: 7,
      rating:  8,
      note:    'Patient reported strong positive response to integration exercise. Mood noticeably improved.',
    },
    sessionHistory: [
      { sessionNumber: 1, rating: 5, note: 'Initial session. Patient anxious but engaged. Baseline established. Sleep issues mentioned.' },
      { sessionNumber: 2, rating: 7, note: 'Noticeable improvement in mood. Patient responded well to ketamine. Sleep still disrupted.' },
      { sessionNumber: 3, rating: 7, note: 'Continued progress. Sleep quality remains a concern. Patient missing some check-ins.' },
      { sessionNumber: 4, rating: 8, note: 'Strong positive response to integration exercise. Mood improved. Sleep mentioned again as ongoing issue.' },
    ],
    moodTrends: [
      { label: 'Anxiety',           score: 4, max: 10, trend: 'down'    },
      { label: 'Depression',        score: 3, max: 10, trend: 'down'    },
      { label: 'Sleep quality',     score: 5, max: 10, trend: 'neutral' },
      { label: 'Overall wellbeing', score: 7, max: 10, trend: 'up'      },
    ],
  },

  'james-okafor': {
    id: 'james-okafor',
    name: 'James Okafor',
    initials: 'JO',
    session: { current: 2, total: 6 },
    program: 'Holistic Psychiatry',
    nextSession: 'Tomorrow at 11:00 AM',
    flags: [
      { id: 1, label: 'Reported increased anxiety this week', severity: 'warning', isNew: true },
      { id: 2, label: 'Medication adjustment pending review', severity: 'critical', isNew: false },
    ],
    medications: [
      { name: 'Sertraline 50mg', status: 'Active', updatedDaysAgo: 14 },
      { name: 'Melatonin 5mg',   status: 'Active', updatedDaysAgo: 14 },
    ],
    lastSession: {
      daysAgo: 10,
      rating:  6,
      note:    'Patient expressed frustration with slow progress. Breathing exercises introduced.',
    },
    sessionHistory: [
      { sessionNumber: 1, rating: 5, note: 'First session. Patient guarded. History of treatment-resistant depression shared.' },
      { sessionNumber: 2, rating: 6, note: 'Some opening up. Anxiety still high. Breathing exercises introduced with moderate success.' },
    ],
    moodTrends: [
      { label: 'Anxiety',           score: 7, max: 10, trend: 'up'      },
      { label: 'Depression',        score: 6, max: 10, trend: 'neutral' },
      { label: 'Sleep quality',     score: 4, max: 10, trend: 'down'    },
      { label: 'Overall wellbeing', score: 4, max: 10, trend: 'down'    },
    ],
  },

  'maya-patel': {
    id: 'maya-patel',
    name: 'Maya Patel',
    initials: 'MP',
    session: { current: 6, total: 6 },
    program: 'Ketamine Therapy',
    nextSession: 'Friday at 2:00 PM',
    flags: [],
    medications: [
      { name: 'Ketamine (home kit)', status: 'Active', updatedDaysAgo: 1 },
    ],
    lastSession: {
      daysAgo: 5,
      rating:  9,
      note:    'Excellent session. Patient reports feeling the best she has in years. Transition plan discussed.',
    },
    sessionHistory: [
      { sessionNumber: 1, rating: 6, note: 'Nervous but hopeful. History of PTSD from childhood trauma.' },
      { sessionNumber: 2, rating: 7, note: 'First ketamine session. Mild dissociation. Patient felt safe throughout.' },
      { sessionNumber: 3, rating: 8, note: 'Breakthrough moment. Patient connected with suppressed memories in a healing way.' },
      { sessionNumber: 4, rating: 8, note: 'Integration focus. Journalling working well. Sleep improving significantly.' },
      { sessionNumber: 5, rating: 9, note: 'Major reduction in PTSD symptoms. Mood consistently elevated.' },
      { sessionNumber: 6, rating: 9, note: 'Final session prep. Patient feels ready for transition. Remarkable transformation.' },
    ],
    moodTrends: [
      { label: 'Anxiety',           score: 2, max: 10, trend: 'down' },
      { label: 'Depression',        score: 2, max: 10, trend: 'down' },
      { label: 'Sleep quality',     score: 9, max: 10, trend: 'up'   },
      { label: 'Overall wellbeing', score: 9, max: 10, trend: 'up'   },
    ],
  },

  'derek-santos': {
    id: 'derek-santos',
    name: 'Derek Santos',
    initials: 'DS',
    session: { current: 1, total: 6 },
    program: 'Integration Coaching',
    nextSession: 'Wednesday at 4:00 PM',
    flags: [
      { id: 1, label: 'New patient — first session upcoming', severity: 'info', isNew: true },
    ],
    medications: [
      { name: 'No current medications', status: 'Inactive', updatedDaysAgo: 0 },
    ],
    lastSession: {
      daysAgo: 0,
      rating:  0,
      note:    'No sessions completed yet. First session scheduled. Patient completed intake form.',
    },
    sessionHistory: [
      { sessionNumber: 0, rating: 0, note: 'Intake completed. Burnout and chronic anxiety from high-pressure work environment.' },
    ],
    moodTrends: [
      { label: 'Anxiety',           score: 8, max: 10, trend: 'neutral' },
      { label: 'Depression',        score: 5, max: 10, trend: 'neutral' },
      { label: 'Sleep quality',     score: 4, max: 10, trend: 'neutral' },
      { label: 'Overall wellbeing', score: 4, max: 10, trend: 'neutral' },
    ],
  },

  'lisa-chen': {
    id: 'lisa-chen',
    name: 'Lisa Chen',
    initials: 'LC',
    session: { current: 3, total: 6 },
    program: 'Holistic Psychiatry',
    nextSession: 'Thursday at 10:00 AM',
    flags: [],
    medications: [
      { name: 'Bupropion 150mg',  status: 'Active', updatedDaysAgo: 7 },
      { name: 'Vitamin D 2000IU', status: 'Active', updatedDaysAgo: 7 },
    ],
    lastSession: {
      daysAgo: 8,
      rating:  7,
      note:    'Steady progress. Cognitive reframing techniques showing results. Workplace stress emerging as primary trigger.',
    },
    sessionHistory: [
      { sessionNumber: 1, rating: 6, note: 'Postpartum depression history. Struggling with identity after returning to work.' },
      { sessionNumber: 2, rating: 7, note: 'Introduced cognitive reframing. Patient receptive and intellectually engaged.' },
      { sessionNumber: 3, rating: 7, note: 'Progress on intrusive thoughts. Workplace stress emerging as primary trigger.' },
    ],
    moodTrends: [
      { label: 'Anxiety',           score: 5, max: 10, trend: 'down' },
      { label: 'Depression',        score: 4, max: 10, trend: 'down' },
      { label: 'Sleep quality',     score: 6, max: 10, trend: 'up'   },
      { label: 'Overall wellbeing', score: 6, max: 10, trend: 'up'   },
    ],
  },
};


// RAG Pipeline


const vectorStores = new Map();

async function buildVectorStore(patient) {
  console.log(`[RAG] Building vector store for ${patient.id}...`);

  const docs = patient.sessionHistory.map(
    (s) => new Document({
      pageContent: `Session ${s.sessionNumber} (rated ${s.rating}/10): ${s.note}`,
      metadata: { patientId: patient.id, sessionNumber: s.sessionNumber, rating: s.rating },
    })
  );

  docs.push(new Document({
    pageContent: `Current mood scores: ${patient.moodTrends
      .map((m) => `${m.label} ${m.score}/${m.max} trending ${m.trend}`)
      .join(', ')}`,
    metadata: { patientId: patient.id, type: 'mood' },
  }));

  const store   = new SimpleVectorStore();
  const vectors = docs.map((d) => localEmbed(d.pageContent));
  store.addDocuments(docs, vectors);

  vectorStores.set(patient.id, store);
  console.log(`[RAG] Vector store built for ${patient.id} — ${docs.length} documents indexed`);
  return store;
}

async function runRAGChain(patient) {
  let store = vectorStores.get(patient.id);
  if (!store) store = await buildVectorStore(patient);

  const query        = 'patient progress mood trends sleep issues flags treatment response';
  const relevantDocs = await store.similaritySearch(query, 3);

  console.log(`[RAG] Retrieved ${relevantDocs.length} relevant documents for ${patient.id}`);

  const promptTemplate = PromptTemplate.fromTemplate(`
You are an AI clinical assistant helping care coordinators at Better U prepare for sessions.

Patient: {patientName}
Program: {program}
Current session: {currentSession} of {totalSessions}
Active flags: {flags}
Medications: {medications}

Most relevant session context (retrieved via semantic search):
{context}

Based on this clinical data, provide a coordinator briefing.
Respond ONLY with valid JSON, no other text:
{{
  "summary": "2-3 sentences summarizing patient progress and current state",
  "suggestedFocus": ["Specific focus area 1", "Specific focus area 2", "Specific focus area 3"]
}}
`);

  const chain = RunnableSequence.from([
    RunnablePassthrough.assign({
      context: () => relevantDocs.map((d) => d.pageContent).join('\n\n'),
    }),
    promptTemplate,
    llm,
    new StringOutputParser(),
  ]);

  const response = await chain.invoke({
    patientName:    patient.name,
    program:        patient.program,
    currentSession: patient.session.current,
    totalSessions:  patient.session.total,
    flags:          patient.flags.map((f) => f.label).join(', ') || 'None',
    medications:    patient.medications.map((m) => m.name).join(', '),
    context:        relevantDocs.map((d) => d.pageContent).join('\n\n'),
  });

  const cleaned = response
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i,    '')
    .replace(/```\s*$/i,    '')
    .trim();

  return JSON.parse(cleaned);
}

// Summary cache
const summaryCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000;

async function generateAISummary(patient) {
  const cached = summaryCache.get(patient.id);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    console.log(`[Cache hit] ${patient.id}`);
    return {
      ...cached.data,
      generatedMinutesAgo: Math.floor((Date.now() - cached.timestamp) / 60000) || 1,
    };
  }

  console.log(`[LangChain + RAG] Generating summary for ${patient.id}...`);
  const parsed = await runRAGChain(patient);

  const result = {
    text:                parsed.summary,
    suggestedFocus:      parsed.suggestedFocus,
    generatedMinutesAgo: 0,
    generatedBy:         'LangChain + RAG',
    model:               'claude-sonnet-4-5',
  };

  summaryCache.set(patient.id, { data: result, timestamp: Date.now() });
  console.log(`[LangChain + RAG] Done for ${patient.id}`);
  return result;
}


// AUTH Middleware


const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer '))
    return res.status(401).json({ error: 'No token provided' });
  try {
    req.user = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

const requireRole = (role) => (req, res, next) => {
  if (req.user.role !== role && req.user.role !== 'admin')
    return res.status(403).json({ error: 'Insufficient permissions' });
  next();
};


// ROUTES


app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Authorization

app.post('/api/v1/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password required' });

  const user = users.find((u) => u.email === email.toLowerCase());
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name, initials: user.initials },
    JWT_SECRET,
    { expiresIn: '8h' }
  );

  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, initials: user.initials },
  });
});

app.post('/api/v1/auth/logout', (_req, res) => {
  res.json({ message: 'Logged out successfully' });
});

app.get('/api/v1/auth/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

// Patients 

app.get('/api/v1/patients', authenticate, requireRole('coordinator'), (_req, res) => {
  const list = Object.values(patients).map((p) => ({
    id:          p.id,
    name:        p.name,
    initials:    p.initials,
    session:     p.session,
    program:     p.program,
    nextSession: p.nextSession,
    flagCount:   p.flags.length,
  }));
  res.json({ data: list });
});

app.get(
  '/api/v1/patients/:id/summary',
  authenticate,
  requireRole('coordinator'),
  async (req, res) => {
    try {
      const p = patients[req.params.id];
      if (!p) return res.status(404).json({ error: 'Patient not found' });
      const aiSummary = await generateAISummary(p);
      res.json({ data: { ...p, aiSummary } });
    } catch (error) {
      console.error('[Error]', error.message);
      const p = patients[req.params.id];
      res.json({
        data: {
          ...p,
          aiSummary: {
            text:                'AI summary temporarily unavailable. Please review session notes manually.',
            suggestedFocus:      ['Review last session notes', 'Check mood trends', 'Address active flags'],
            generatedMinutesAgo: null,
            generatedBy:         'fallback',
          },
        },
      });
    }
  }
);

app.get('/api/v1/patients/:id/mood', authenticate, requireRole('coordinator'), (req, res) => {
  const p = patients[req.params.id];
  if (!p) return res.status(404).json({ error: 'Patient not found' });
  res.json({ data: p.moodTrends });
});

app.get(
  '/api/v1/patients/:id/ai-summary',
  authenticate,
  requireRole('coordinator'),
  async (req, res) => {
    try {
      const p = patients[req.params.id];
      if (!p) return res.status(404).json({ error: 'Patient not found' });
      const aiSummary = await generateAISummary(p);
      res.json({ data: aiSummary });
    } catch (error) {
      res.status(500).json({ error: 'Failed to generate AI summary' });
    }
  }
);

app.post(
  '/api/v1/patients/:id/rebuild-index',
  authenticate,
  requireRole('coordinator'),
  async (req, res) => {
    const p = patients[req.params.id];
    if (!p) return res.status(404).json({ error: 'Patient not found' });
    vectorStores.delete(p.id);
    summaryCache.delete(p.id);
    await buildVectorStore(p);
    res.json({ message: `Vector store rebuilt for ${p.name}` });
  }
);

app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong' });
});

app.listen(PORT, () => {
  console.log(`Session Continuity API running on port ${PORT}`);
  console.log(`Anthropic API key: ${process.env.ANTHROPIC_API_KEY ? 'loaded ✓' : 'MISSING ✗'}`);
  console.log(`JWT Secret: ${JWT_SECRET !== 'dev-secret-change-in-production' ? 'custom ✓' : 'using dev default'}`);
  console.log(`LangChain + RAG: ready ✓`);
});

module.exports = app;