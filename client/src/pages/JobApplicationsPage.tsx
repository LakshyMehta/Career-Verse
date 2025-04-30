
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getJobById } from "@/services/jobService";
import { getJobApplications, updateApplicationStatus } from "@/services/applicationService";
import { useAuth } from "@/contexts/AuthContext";
import { Spinner } from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { Application, ApplicationStatus, UpdateApplicationStatusData } from "@/interfaces/application";
import { User } from "@/interfaces/user";
import { AlertTriangle, FileText, ChevronLeft } from "lucide-react";

const JobApplicationsPage = () => {
  const { id: jobId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [statusUpdates, setStatusUpdates] = useState<Record<string, ApplicationStatus>>({});

  // Fetch job details
  const { 
    data: job, 
    isLoading: isJobLoading, 
    error: jobError 
  } = useQuery({
    queryKey: ["job", jobId],
    queryFn: () => getJobById(jobId!),
    enabled: !!jobId,
  });

  // Fetch applications for this job
  const { 
    data: applications, 
    isLoading: isApplicationsLoading, 
    error: applicationsError 
  } = useQuery({
    queryKey: ["jobApplications", jobId],
    queryFn: () => getJobApplications(jobId!),
    enabled: !!jobId,
  });

  // Update application status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ applicationId, status }: { applicationId: string; status: "selected" | "rejected" }) => 
      updateApplicationStatus(applicationId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobApplications", jobId] });
      toast({
        title: "Status Updated",
        description: "The application status has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update application status. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Check if current user has permission to access this page
  useEffect(() => {
    if (!isJobLoading && job && user) {
      // Check if user is not admin and not the job creator
      if (
        user.role !== "admin" && 
        (typeof job.createdBy === "string" ? job.createdBy !== user._id : job.createdBy._id !== user._id)
      ) {
        navigate("/jobs");
        toast({
          title: "Access Denied",
          description: "You don't have permission to view applications for this job.",
          variant: "destructive",
        });
      }
    }
  }, [job, user, isJobLoading, navigate]);

  // Handle status change
  const handleStatusChange = (applicationId: string, status: ApplicationStatus) => {
    setStatusUpdates({ ...statusUpdates, [applicationId]: status });
  };

  // Handle update button click
  const handleUpdateStatus = (applicationId: string) => {
    const newStatus = statusUpdates[applicationId];
    if (newStatus === "applied") {
      toast({
        title: "No Change",
        description: "Please select 'Selected' or 'Rejected' to update the status.",
      });
      return;
    }
    
    if (newStatus) {
      updateStatusMutation.mutate({ 
        applicationId, 
        status: newStatus as "selected" | "rejected" 
      });
    }
  };

  // Format date string
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isJobLoading || isApplicationsLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (jobError || !job) {
    return (
      <div className="container mx-auto py-8 px-4 flex flex-col items-center">
        <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-center mb-2">Job Not Found</h1>
        <p className="text-gray-600 mb-6">The job you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate("/jobs")}>Back to Jobs</Button>
      </div>
    );
  }

  if (applicationsError) {
    return (
      <div className="container mx-auto py-8 px-4 flex flex-col items-center">
        <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-center mb-2">Error Loading Applications</h1>
        <p className="text-gray-600 mb-6">There was a problem loading the applications for this job.</p>
        <Button onClick={() => navigate("/jobs")}>Back to Jobs</Button>
      </div>
    );
  }

  const hasApplications = applications && applications.length > 0;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <Button
            variant="outline"
            className="mb-2 md:mb-0"
            onClick={() => navigate(`/jobs/${jobId}`)}
          >
            <ChevronLeft className="mr-1 h-4 w-4" /> Back to Job
          </Button>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold">Applications for "{job.title}"</h1>
      </div>

      {!hasApplications ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">No Applications Yet</h2>
          <p className="text-gray-600 mb-4">This job hasn't received any applications yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Applicant</TableHead>
                  <TableHead>CV</TableHead>
                  <TableHead>Applied On</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications!.map((application) => {
                  const applicant = typeof application.applierId === 'string' 
                    ? { name: 'Unknown', email: 'Unknown' } 
                    : application.applierId as User;
                  
                  return (
                    <TableRow key={application._id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{applicant.name}</div>
                          <div className="text-sm text-gray-500">{applicant.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <a 
                          href={`http://localhost:5000/uploads/${application.cvUrl}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-600 hover:underline"
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          View CV
                        </a>
                      </TableCell>
                      <TableCell>{formatDate(application.createdAt)}</TableCell>
                      <TableCell>
                        <div className={`py-1 px-2 rounded-full text-xs font-medium w-fit
                          ${application.status === 'applied' ? 'bg-blue-100 text-blue-800' : 
                            application.status === 'selected' ? 'bg-green-100 text-green-800' : 
                            'bg-red-100 text-red-800'}`
                        }>
                          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Select 
                            defaultValue={application.status}
                            onValueChange={(value) => handleStatusChange(application._id, value as ApplicationStatus)}
                          >
                            <SelectTrigger className="w-[130px]">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="applied">Applied</SelectItem>
                              <SelectItem value="selected">Selected</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button 
                            size="sm"
                            onClick={() => handleUpdateStatus(application._id)}
                            disabled={!statusUpdates[application._id] || statusUpdates[application._id] === application.status}
                          >
                            Update
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobApplicationsPage;
