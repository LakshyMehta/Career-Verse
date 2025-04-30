
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMyApplications } from "@/services/applicationService";
import { Spinner } from "@/components/Spinner";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Briefcase, 
  FileText, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock 
} from "lucide-react";
import { ApplicationStatus } from "@/interfaces/application";

const StatusBadge = ({ status }: { status: ApplicationStatus }) => {
  const statusMap = {
    applied: {
      icon: <Clock className="h-4 w-4 mr-1" />,
      text: "Applied",
      className: "bg-blue-100 text-blue-800",
    },
    selected: {
      icon: <CheckCircle className="h-4 w-4 mr-1" />,
      text: "Selected",
      className: "bg-green-100 text-green-800",
    },
    rejected: {
      icon: <XCircle className="h-4 w-4 mr-1" />,
      text: "Rejected",
      className: "bg-red-100 text-red-800",
    },
  };

  const { icon, text, className } = statusMap[status];

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {icon}
      {text}
    </span>
  );
};

const MyApplicationsPage = () => {
  const { user } = useAuth();
  
  // Fetch applications for the current user
  const { data: applications, isLoading, error } = useQuery({
    queryKey: ["applications", "mine"],
    queryFn: getMyApplications,
    enabled: !!user && user.role === "applier",
  });

  // Format date string
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4 flex flex-col items-center">
        <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-center mb-2">Error Loading Applications</h1>
        <p className="text-gray-600 mb-6">There was a problem loading your applications.</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  if (!applications || applications.length === 0) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">My Applications</h1>
        <Card className="w-full max-w-4xl mx-auto">
          <CardContent className="pt-6 flex flex-col items-center justify-center min-h-[300px]">
            <Briefcase className="h-16 w-16 text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-center mb-2">No Applications Yet</h2>
            <p className="text-gray-500 text-center mb-6">
              You haven't applied for any jobs yet. Browse available positions and submit your first application!
            </p>
            <Button onClick={() => window.location.href = "/jobs"}>
              Browse Jobs
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">My Applications</h1>
      
      <div className="space-y-6 max-w-4xl mx-auto">
        {applications.map((application) => {
          const job = typeof application.jobId === "string" 
            ? { title: "Loading...", _id: application.jobId } 
            : application.jobId;
            
          return (
            <Card key={application._id} className="w-full">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{job.title}</CardTitle>
                    <CardDescription>
                      Application ID: {application._id}
                    </CardDescription>
                  </div>
                  <StatusBadge status={application.status} />
                </div>
              </CardHeader>
              
              <CardContent className="pb-4">
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Applied on: {formatDate(application.createdAt)}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <FileText className="h-4 w-4 mr-2" />
                    <span>CV: </span>
                    <a 
                      href={`http://localhost:5000/uploads/${application.cvUrl}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="ml-1 text-blue-600 hover:underline"
                    >
                      View CV
                    </a>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="border-t pt-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.location.href = `/jobs/${typeof job === "string" ? job : job._id}`}
                >
                  View Job Details
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default MyApplicationsPage;
