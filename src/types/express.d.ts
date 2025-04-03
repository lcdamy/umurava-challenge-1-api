// src/types/express.d.ts
import * as express from 'express';

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      names?: string;
      profile_url?: string;
      userRole?: string;
    }

    interface Request {
      user?: User;
    }
  }
}

// Required to make the file a module
export {};
