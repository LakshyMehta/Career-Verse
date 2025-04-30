import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// --- Import Interfaces ---
import { Application, ApplicationStatus } from "@/interfaces/application";
import { Job } from "@/interfaces/job";

// --- Import API Service Functions ---
import { getMyApplications } from '@/services/applicationService'; // Adjust path if needed
// Corrected imports for jobService
import { getAllJobs, getMyJobs } from '@/services/jobService'; // Adjust path if needed

// --- Helper to format dates (Using relative time version for better UX) ---
const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    const now = new Date();
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }

    const diffTime = now.getTime() - date.getTime(); // Difference in milliseconds
    const diffSeconds = Math.floor(diffTime / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30); // Approximate
    const diffYears = Math.floor(diffDays / 365); // Approximate

    if (diffYears > 0) return `Posted ${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
    if (diffMonths > 0) return `Posted ${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
    if (diffWeeks > 0) return `Posted ${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
    if (diffDays > 0) return `Posted ${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `Posted ${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffMinutes > 0) return `Posted ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    return 'Posted just now';

  } catch (error) {
    console.error("Error formatting date:", error);
    return "Date unavailable";
  }
};

// --- ApplierDashboard Component ---
const ApplierDashboard = () => {
  const navigate = useNavigate();
  const [myApplications, setMyApplications] = useState<Application[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]); // State for recommended jobs
  const [isLoadingApps, setIsLoadingApps] = useState<boolean>(true);
  const [isLoadingJobs, setIsLoadingJobs] = useState<boolean>(true);
  const [errorApps, setErrorApps] = useState<string | null>(null);
  const [errorJobs, setErrorJobs] = useState<string | null>(null);

  useEffect(() => {
    // --- Fetch User's Applications ---
    const fetchApplications = async () => {
      setIsLoadingApps(true);
      setErrorApps(null);
      try {
        const apps = await getMyApplications();
        setMyApplications(apps);
      } catch (err) {
        console.error("Error fetching applications:", err);
        setErrorApps("Failed to load your applications. Please try again later.");
      } finally {
        setIsLoadingApps(false);
      }
    };

    // --- Fetch "Recommended" (All) Jobs ---
    const fetchJobs = async () => {
      setIsLoadingJobs(true);
      setErrorJobs(null);
      try {
        const jobs = await getAllJobs();
        // Limit the jobs to the first 2 *before* setting state
        setRecommendedJobs(jobs.slice(0, 2));
      } catch (err) {
        console.error("Error fetching jobs:", err);
        setErrorJobs("Failed to load recommended jobs.");
      } finally {
        setIsLoadingJobs(false);
      }
    };

    fetchApplications();
    fetchJobs();
  }, []); // Runs once on mount

  const renderApplicationStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'applied':
        return <Badge variant="secondary">Applied</Badge>;
      case 'selected':
        return <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white">Selected</Badge>; // Added text-white for contrast
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };


  return (
    <div className="space-y-6">
      {/* --- Job Applications Card --- */}
      <Card>
        <CardHeader>
          <CardTitle>My Job Applications</CardTitle>
          <CardDescription>Track your current job applications</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingApps && <p>Loading applications...</p>}
          {errorApps && <p className="text-red-500">{errorApps}</p>}
          {!isLoadingApps && !errorApps && (
            <>
              {myApplications.length === 0 ? (
                <>
                  <p className="text-gray-500 dark:text-gray-400">You haven't applied to any jobs yet.</p>
                  <Button className="mt-4" onClick={() => navigate('/jobs')}>
                    Browse Jobs
                  </Button>
                </>
              ) : (
                <div className="space-y-4">
                  {myApplications.map((app) => {
                    // --- Type Guard to check if jobId is populated ---
                    const job = typeof app.jobId === 'object' && app.jobId !== null ? app.jobId : null;
                    if (!job) {
                      console.warn(`Job details missing for application ${app._id}`);
                      return ( // Render something minimal if job details are missing
                        <div key={app._id} className="rounded-lg border p-4 opacity-70">
                          <h3 className="font-medium italic">Job details unavailable</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Applied on {formatDate(app.createdAt)}</p>
                          {renderApplicationStatusBadge(app.status)}
                        </div>
                      );
                    }
                    return (
                      <div key={app._id} className="rounded-lg border p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
                        <div className="flex-grow">
                          <Link to={`/jobs/${job._id}`} className="hover:underline">
                            <h3 className="font-medium">{job.title}</h3>
                          </Link>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {job.location} • Applied {formatDate(app.createdAt)}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          {renderApplicationStatusBadge(app.status)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* --- Recommended Jobs Card (Shows max 2) --- */}
      <Card>
        <CardHeader>
          <CardTitle>Recommended Jobs</CardTitle>
          <CardDescription>
            Jobs you might be interested in
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingJobs && <p>Loading jobs...</p>}
          {errorJobs && <p className="text-red-500">{errorJobs}</p>}
          {!isLoadingJobs && !errorJobs && (
            <>
              {recommendedJobs.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">No job recommendations available right now.</p>
              ) : (
                <div className="space-y-4">
                  {/* Map directly over the state which is already sliced */}
                  {recommendedJobs.map((job) => (
                    <div key={job._id} className="rounded-lg border p-4">
                      <Link to={`/jobs/${job._id}`} className="hover:underline">
                        <h3 className="font-medium">{job.title}</h3>
                      </Link>
                      {/* Attempt to display company name if createdBy is populated */}
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {(typeof job.createdBy === 'object' && job.createdBy && 'name' in job.createdBy) ? `${job.createdBy.name} • ` : ''}
                        {job.location}
                      </p>
                      <div className="mt-2 flex justify-end">
                        <Button size="sm" onClick={() => navigate(`/jobs/${job._id}`)}>
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Button className="mt-4" variant="outline" onClick={() => navigate('/jobs')}>
                Browse All Jobs
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};


// --- EmployerDashboard Component (Now fetches data) ---
const EmployerDashboard = () => {
  const navigate = useNavigate();
  const [myJobs, setMyJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmployerJobs = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const jobs = await getMyJobs(); // Use the employer-specific service function
        setMyJobs(jobs);
      } catch (err) {
        console.error("Error fetching employer jobs:", err);
        setError("Failed to load your job listings. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployerJobs();
  }, []); // Empty dependency array ensures this runs once on mount

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Your Job Listings</CardTitle>
          <CardDescription>Manage your active job postings</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && <p>Loading your job listings...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {!isLoading && !error && (
            <>
              {myJobs.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">You haven't posted any jobs yet.</p>
              ) : (
                <div className="space-y-4">
                  {myJobs.map((job) => (
                    <div key={job._id} className="rounded-lg border p-4">
                      <Link to={`/jobs/${job._id}`} className="hover:underline">
                        <h3 className="font-medium">{job.title}</h3>
                      </Link>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {job.location} • {formatDate(job.createdAt)}
                        {/* Note: Applicant count isn't available from getMyJobs based on provided info. Needs backend update if required. */}
                      </p>
                      <div className="mt-3 flex flex-wrap justify-end gap-2">
                        {/* Navigate to a page showing applicants for this job */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/jobs/${job._id}/applications`)} // Example route
                        >
                          View Applicants
                        </Button>
                        {/* Navigate to the job editing page */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/jobs/${job._id}/edit`)} // Example route
                        >
                          Edit
                        </Button>
                        {/* Optional: Add delete button */}
                        {/* <Button size="sm" variant="destructive" onClick={() => handleDeleteJob(job._id)}> Delete </Button> */}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
          {/* "Post a New Job" button is always visible */}
          <Button className="mt-4" asChild>
            <Link to="/jobs/post">Post a New Job</Link>
          </Button>
        </CardContent>
      </Card>

      {/* Optional: Company Profile Card */}
      {/* <Card> ... </Card> */}
    </div>
  );
};


// --- Main DashboardPage component ---
const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect admin users away from this dashboard
    if (user?.role === "admin") {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [user, navigate]);

  // Handle loading state for the user context or redirection
  if (!user || user.role === "admin") {
    // Using a slightly more informative loading state
    return (
      <div className="container flex h-[calc(100vh-10rem)] items-center justify-center px-4 py-24">
        <p className="text-gray-500 dark:text-gray-400">Loading dashboard...</p>
      </div>
    );
  }

  // Render the appropriate dashboard based on user role
  return (
    <div className="container px-4 py-12 md:py-16 lg:py-20">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">
        Welcome back, {user.name}!
      </h1>

      {user.role === "employer" ? (
        <EmployerDashboard /> // Render the dynamic EmployerDashboard
      ) : (
        // Assume any non-employer, non-admin user is an applier
        <ApplierDashboard />
      )}
    </div>
  );
};

export default DashboardPage;