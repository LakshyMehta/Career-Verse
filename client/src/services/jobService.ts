
import api from "@/lib/axios";
import { Job, CreateJobData, UpdateJobData } from "@/interfaces/job";

// Get all jobs
export const getAllJobs = async (): Promise<Job[]> => {
  const response = await api.get("/jobs");
  return response.data;
};

// Get a specific job by ID
export const getJobById = async (id: string): Promise<Job> => {
  const response = await api.get(`/jobs/${id}`);
  return response.data;
};

// Get jobs for a specific user (employer)
export const getMyJobs = async (): Promise<Job[]> => {
  const response = await api.get(`/jobs/my`);
  return response.data;
};

// Create a new job
export const createJob = async (jobData: CreateJobData): Promise<Job> => {
  const response = await api.post("/jobs", jobData);
  return response.data;
};

// Update a job
export const updateJob = async (id: string, jobData: UpdateJobData): Promise<Job> => {
  const response = await api.put(`/jobs/${id}`, jobData);
  return response.data;
};

// Delete a job
export const deleteJob = async (id: string): Promise<void> => {
  await api.delete(`/jobs/${id}`);
};
