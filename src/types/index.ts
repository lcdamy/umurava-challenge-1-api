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

export type ChallengeCategory =
    | 'Web Design'
    | 'UI/UX'
    | 'Frontend'
    | 'Backend'
    | 'Fullstack'
    | 'Mobile'
    | 'Data Science'
    | 'Cybersecurity'
    | 'Cloud Computing'
    | 'DevOps'
    | 'AI/ML'
    | 'IoT'
    | 'Blockchain'
    | 'AR/VR'
    | 'Game Development'
    | 'Robotics'
    | 'Digital Marketing'
    | 'Content Writing'
    | 'Graphic Design'
    | 'Video Editing'
    | 'Animation'
    | 'Music Production'
    | 'Photography'
    | '3D Modelling'
    | 'CAD Design'
    | 'Interior Design'
    | 'Fashion Design'
    | 'Product Design'
    | 'Architecture'
    | 'Civil Engineering'
    | 'Mechanical Engineering'
    | 'Electrical Engineering'
    | 'Aerospace Engineering'
    | 'Automotive Engineering';

declare module 'express-serve-static-core' {
  interface Request {
    user?: UserPayload;
  }
}
