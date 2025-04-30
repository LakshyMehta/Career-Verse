
import { User } from './user';
import { Job } from './job';

export type ApplicationStatus = "applied" | "selected" | "rejected";

export interface Application {
  _id: string;
  jobId: Job | string; // Populated or just ID
  applierId: User | string; // Populated or just ID
  cvUrl: string; // Filename - frontend constructs full URL
  status: ApplicationStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateApplicationStatusData { // For PATCH request
  status: "selected" | "rejected";
}
