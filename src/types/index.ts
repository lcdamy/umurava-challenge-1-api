
export enum UserRole {
  Admin = 'admin',
  Participant = 'participant'
}

export interface UserPayload {
  phoneNumber: string;
  username: string;
  names: string;
  email: string;
  userRole: UserRole;
  profile_url: string;
}



declare module 'express-serve-static-core' {
  interface Request {
    user?: UserPayload;
  }
}

declare global {
  namespace Express {
      interface Request {
          user?: {
              email: string;
              [key: string]: any; // Add other properties if needed
          };
      }
  }
}
