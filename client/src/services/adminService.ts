
import api from "@/lib/axios";
import { User, UserRole } from "@/interfaces/user";
import { Job } from "@/interfaces/job";

// User management
export const getUsers = async (role?: UserRole): Promise<User[]> => {
  const url = role ? `/admin/users/${role}s` : "/admin/users";
  const response = await api.get(url);
  return response.data;
};

export const deleteUser = async (userId: string): Promise<void> => {
  await api.delete(`/admin/users/${userId}`);
};

// Job management
export const getAdminJobs = async (): Promise<Job[]> => {
  const response = await api.get("/admin/jobs");
  return response.data;
};

// Dashboard statistics
export const getAdminStats = async () => {
  const response = await api.get("/admin/stats");
  return response.data;
};


export const deleteJob = async (jobId: string): Promise<void> => {
  const response = await api.delete(`/admin/jobs/${jobId}`);
  return response.data;
};
