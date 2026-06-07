/**
 * Synthesis Engine — Frontend API Contract
 *
 * This file is the single source of truth for the frontend to understand:
 *  1. All TypeScript types returned by the backend
 *  2. Every API endpoint, its method, auth requirement, and shapes
 *  3. How to wire up an Axios client
 *
 * Backend base URL: http://localhost:4000   (set via NEXT_PUBLIC_API_URL)
 */

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 1: CORE TYPES
// ─────────────────────────────────────────────────────────────────────────────

/** The 5 fixed knowledge sources — permanent colour identity on the frontend */
export type StepSource =
  | 'NASA'
  | 'GITHUB'
  | 'LEETCODE'
  | 'HACKERNEWS'
  | 'STACKOVERFLOW';

/** Source → suggested brand colour (for badges/cards) */
export const SOURCE_COLORS: Record<StepSource, { bg: string; text: string; hex: string }> = {
  NASA:          { bg: 'bg-purple-100', text: 'text-purple-800', hex: '#7C3AED' },
  GITHUB:        { bg: 'bg-teal-100',   text: 'text-teal-800',   hex: '#0D9488' },
  LEETCODE:      { bg: 'bg-amber-100',  text: 'text-amber-800',  hex: '#D97706' },
  HACKERNEWS:    { bg: 'bg-orange-100', text: 'text-orange-800', hex: '#EA580C' },
  STACKOVERFLOW: { bg: 'bg-blue-100',   text: 'text-blue-800',   hex: '#2563EB' },
};

export interface User {
  id: string;
  email: string;
  username: string;
  createdAt: string; // ISO 8601
}

export interface TrailStep {
  id: string;
  stepNumber: number;         // 1–5
  source: StepSource;
  title: string;
  description: string;        // truncated text (max ~400-500 chars)
  url: string;                // link to original content
  imageUrl: string | null;    // only NASA steps have this
  metadata: TrailStepMetadata;
  excitementNote: string;     // e.g. "1,400 new stars in 48 hours"
}

/** Source-specific extras — varies per step */
export type TrailStepMetadata =
  | NASAMetadata
  | GitHubMetadata
  | LeetCodeMetadata
  | HNMetadata
  | SOMetadata;

export interface NASAMetadata {
  mediaType: 'image' | 'video';
  date: string;
}

export interface GitHubMetadata {
  stars: number;
  language: string | null;
  topics: string[];
  starsIn48h: number;
}

export interface LeetCodeMetadata {
  difficulty: 'Easy' | 'Medium' | 'Hard';
  acceptanceRate: number;
  topicTags: Array<{ name: string; slug: string }>;
}

export interface HNMetadata {
  points: number;
  comments: number;
  hoursAgo: number;
  hnId: string;
}

export interface SOMetadata {
  score: number;
  answerCount: number;
  tags: string[];
}

// NOTE: Trail, Completion, and Graph models have been removed from the backend.
// Please use the types exported in `feed.types.ts` for FeedCard payloads.

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 2: API CONTRACT (all endpoints, shapes, auth)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * AUTH
 * ─────
 * POST   /api/auth/register   → { user: User, token: string }
 * POST   /api/auth/login      → { user: User, token: string }
 * GET    /api/auth/me         → { user: User }                   🔒 JWT
 */

export interface RegisterBody {
  email: string;       // valid email
  username: string;    // 3–30 chars
  password: string;    // min 8 chars
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;   // store in localStorage as 'synthesis_token'
}

/**
 * TRAIL
 * ──────
 * GET    /api/trail/today      → Trail        🔒 JWT
 * GET    /api/trail/history    → Trail[]      🔒 JWT   (completed only, newest first)
 * GET    /api/trail/:id        → Trail        🔒 JWT
 *
 * NOTE: /api/trail/today may take 3–5 seconds on first call of the day
 *       as it hits 5 external APIs in parallel. Show a loading state.
 */

/**
 * COMPLETION
 * ───────────
 * POST   /api/completion         → { completion: Completion, message: string }   🔒 JWT
 * GET    /api/completion/status  → CompletionStatus                               🔒 JWT
 *
 * Enforcement:
 *   - synthesisAnswer must be ≥ 30 characters (server validates)
 *   - One completion per user per trail (server returns 409 on duplicate)
 *   - Once completed, GET /api/completion/status returns completed: true
 *     → use this to show the SessionLock screen
 */

export interface SubmitCompletionBody {
  trailId: string;          // UUID from today's trail
  synthesisAnswer: string;  // must be ≥ 30 chars
  timeSpentSecs: number;    // track how long the user spent
}

/**
 * KNOWLEDGE GRAPH
 * ────────────────
 * GET    /api/graph/me      → KnowledgeGraph   🔒 JWT
 * GET    /api/graph/stats   → GraphStats        🔒 JWT
 */

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 3: SUGGESTED AXIOS CLIENT SETUP
// ─────────────────────────────────────────────────────────────────────────────

/*
// lib/api-client.ts

import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // http://localhost:4000/api
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000, // 15s — trail generation can take 3–5s
});

// Attach JWT to every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('synthesis_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global 401 handler — redirect to login
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('synthesis_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
*/

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 4: SUGGESTED REACT QUERY HOOKS
// ─────────────────────────────────────────────────────────────────────────────

/*
// hooks/useTrail.ts

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { Trail, CompletionStatus } from './api-contract';

// Fetch today's trail
export function useTrail() {
  return useQuery<Trail>({
    queryKey: ['trail', 'today'],
    queryFn: () => apiClient.get<Trail>('/trail/today').then(r => r.data),
    staleTime: 1000 * 60 * 60, // 1 hour — trail doesn't change mid-day
  });
}

// Check if user has completed today's trail
export function useCompletionStatus() {
  return useQuery<CompletionStatus>({
    queryKey: ['completion', 'status'],
    queryFn: () => apiClient.get<CompletionStatus>('/completion/status').then(r => r.data),
    refetchOnWindowFocus: true,
  });
}
*/

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 5: FRONTEND STATE MACHINE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The trail experience has 3 possible states:
 *
 * 1. LOADING      — fetching trail + completion status
 * 2. IN_PROGRESS  — user is reading steps (steps revealed one at a time)
 * 3. LOCKED       — user has completed today's trail (show SessionLock)
 *
 * Step reveal flow:
 *   activeStep starts at 1
 *   User clicks "I've read this → next" → activeStep increments
 *   After step 5 → showSynthesis = true
 *   After submitting synthesis → POST /api/completion → refetch status → LOCKED
 *
 * Key invariants:
 *   - Steps 2–5 are NOT rendered until user advances past the previous step
 *   - The synthesis textarea enforces ≥ 30 chars on the FRONTEND too (match server)
 *   - timeSpentSecs should be tracked from when trail first loads
 */

export type TrailSessionState = 'LOADING' | 'IN_PROGRESS' | 'LOCKED';

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 6: ERROR HANDLING
// ─────────────────────────────────────────────────────────────────────────────

export interface ApiError {
  error: string;
  details?: Array<{ field: string; message: string }>; // validation errors only
}

/**
 * HTTP status codes the frontend should handle:
 *
 * 400  Validation failed     → show field-level errors from `details`
 * 401  Unauthorised          → Axios interceptor redirects to /login
 * 404  Not found             → show "not found" message
 * 409  Conflict              → "You've already completed today's trail"
 * 503  Trail generation fail → "Trail is building, try again in a moment"
 */
