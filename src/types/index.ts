import { Request } from 'express-serve-static-core';


export enum UserRole {
    Admin = 'admin',
    Participant = 'participant'
  }
  
  export interface UserPayload {
    id: number;
    username: string;
    userRole: UserRole;
  }
  
  
  declare module 'express-serve-static-core' {
    interface Request {
      user?: UserPayload;
    }
  }
  