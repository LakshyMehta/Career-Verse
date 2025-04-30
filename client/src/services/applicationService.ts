
import api from "@/lib/axios";
import { Application, UpdateApplicationStatusData } from "@/interfaces/application";

// Get all applications for the currently logged-in user
export const getMyApplications = async (): Promise<Application[]> => {
  const response = await api.get("/applications/mine");
  return response.data;
};

// Apply for a job with CV file
export const applyForJob = async (jobId: string, cvFile: File): Promise<Application> => {
  const formData = new FormData();
  formData.append("cv", cvFile);
  
  const response = await api.post(`/applications/${jobId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  
  return response.data;
};

// *** New Function: Check if user has applied ***
export const checkApplicationStatus = async (jobId: string): Promise<{ hasApplied: boolean }> => {
  // The URL will be like /api/jobs/THE_JOB_ID/application-status
  const response = await api.get(`/applications/${jobId}/application-status`);
  return response.data; // Should return { hasApplied: true/false }
};

// Get all applications for a specific job (for employers/admins)
export const getJobApplications = async (jobId: string): Promise<Application[]> => {
  const response = await api.get(`/applications/job/${jobId}`);
  return response.data;
};

// Update application status (for employers/admins)
export const updateApplicationStatus = async (
  applicationId: string, 
  statusData: UpdateApplicationStatusData
): Promise<Application> => {
  const response = await api.patch(`/applications/${applicationId}/status`, statusData);
  return response.data;
};
