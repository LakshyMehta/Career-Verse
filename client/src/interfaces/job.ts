
import { User } from './user'; // Assuming User interface is in user.ts

export interface Job {
  _id: string;
  title: string;
  description: string;
  location: string;
  createdBy: User | string; // Populated or just ID string
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateJobData { // For POST request
  title: string;
  description: string;
  location: string;
}

export type UpdateJobData = Partial<CreateJobData>; // For PUT request
