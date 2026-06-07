import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth.routes';
import { feedRouter } from './routes/feed.routes';
import { requireAuth } from './middleware/auth.middleware';

export const app = express();

// ─────────────────────────────────────────────
// Middleware
// ─────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json());

// ─────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/feed', feedRouter);

// Route removed

// ─────────────────────────────────────────────
// Health check
// ─────────────────────────────────────────────
app.get('/health', (_, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
  });
});

// ─────────────────────────────────────────────
// 404 handler
// ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});
