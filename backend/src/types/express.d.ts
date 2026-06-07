import { Request } from 'express';

// Augment Express Request to carry decoded JWT user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      };
    }
  }
}

export {};
