// src/pages/EditJobPage.tsx (or wherever you place your page components)

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext'; // Optional: If needed for authorization checks
import { getJobById, updateJob } from '@/services/jobService'; // Adjust path if needed
import { Job, UpdateJobData } from '@/interfaces/job'; // Adjust path if needed

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // For error display
import { Loader2 } from 'lucide-react'; // Loading spinner icon

const EditJobPage = () => {
  const { jobId } = useParams<{ jobId: string }>(); // Get job ID from URL parameters
  const navigate = useNavigate();
  const { user } = useAuth(); // Get user info if needed for checks

  const [job, setJob] = useState<Job | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) {
      setFetchError("No job ID provided in the URL.");
      setIsLoading(false);
      return;
    }

    const fetchJobDetails = async () => {
      setIsLoading(true);
      setFetchError(null);
      try {
        const fetchedJob = await getJobById(jobId);
        setJob(fetchedJob);
        setTitle(fetchedJob.title);
        setDescription(fetchedJob.description);
        setLocation(fetchedJob.location);

        // Optional: Basic authorization check (though backend should be primary)
        if (user && typeof fetchedJob.createdBy === 'object' && fetchedJob.createdBy?._id !== user._id) {
             console.warn("User attempting to edit a job they didn't create.");
             setFetchError("You are not authorized to edit this job listing.");
             // Optionally navigate away or disable the form
        }

      } catch (error: any) {
        console.error("Error fetching job details:", error);
        if (error.response?.status === 404) {
            setFetchError("Job listing not found.");
        } else if (error.response?.status === 403) {
             setFetchError("You are not authorized to view or edit this job listing.");
        }
        else {
            setFetchError("Failed to load job details. Please try again.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobDetails();
  }, [jobId, user]); // Rerun if jobId or user changes

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!jobId || !job) {
        setSubmitError("Cannot submit: Job data is missing.");
        return;
    }

    // Basic validation (optional)
    if (!title.trim() || !description.trim() || !location.trim()) {
        setSubmitError("Please fill in all fields.");
        return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const updatedData: UpdateJobData = {
      title,
      description,
      location,
    };

    try {
      await updateJob(jobId, updatedData);
      // Success! Navigate back to the employer dashboard (or job detail page)
      navigate('/dashboard'); // Adjust as needed
      // Consider adding a success toast notification here
    } catch (error: any) {
      console.error("Error updating job:", error);
       if (error.response?.status === 403) {
            setSubmitError("Authorization error: You cannot update this job.");
       } else {
           setSubmitError("Failed to update job listing. Please check your input and try again.");
       }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container flex h-[calc(100vh-10rem)] items-center justify-center px-4 py-24">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <p className="ml-2 text-gray-500 dark:text-gray-400">Loading job details...</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="container px-4 py-12 md:py-16 lg:py-20">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{fetchError}</AlertDescription>
        </Alert>
         <Button variant="outline" className="mt-4" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
        </Button>
      </div>
    );
  }

  // If job is loaded and no fetch error
  return (
    <div className="container px-4 py-12 md:py-16 lg:py-20">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">Edit Job Listing</h1>
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>{job?.title ?? 'Edit Job'}</CardTitle>
            <CardDescription>Update the details for this job posting.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* --- Title --- */}
            <div className="space-y-2">
              <Label htmlFor="title">Job Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Senior Frontend Developer"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* --- Location --- */}
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Remote or New York, NY"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* --- Description --- */}
            <div className="space-y-2">
              <Label htmlFor="description">Job Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the role, responsibilities, and requirements..."
                rows={8} // Adjust rows as needed
                required
                disabled={isSubmitting}
              />
            </div>

            {/* --- Submission Error Display --- */}
            {submitError && (
                <Alert variant="destructive" className="mt-4">
                    <AlertTitle>Update Failed</AlertTitle>
                    <AlertDescription>{submitError}</AlertDescription>
                </Alert>
            )}

          </CardContent>
          <CardFooter className="flex justify-end gap-2">
             <Button
                type="button" // Important: Prevents default form submission
                variant="outline"
                onClick={() => navigate('/dashboard')} // Navigate back on cancel
                disabled={isSubmitting}
             >
                Cancel
             </Button>
             <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                    </>
                ) : (
                    'Save Changes'
                )}
             </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default EditJobPage;