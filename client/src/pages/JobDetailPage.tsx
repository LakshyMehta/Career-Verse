import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getJobById, deleteJob } from "@/services/jobService";
import { applyForJob, checkApplicationStatus } from "@/services/applicationService"; // Ensure this fetches the new status object
import { useAuth } from "@/contexts/AuthContext";
import { Spinner } from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { MapPin, Calendar, Briefcase, User, AlertTriangle, Upload, CheckCircle, Clock, XCircle } from "lucide-react"; // Added Clock, XCircle

// Define the expected structure for the application status response
interface ApplicationStatusResponse {
    application: {
        _id: string; // Assuming you might need the ID later
        status: 'pending' | 'selected' | 'rejected';
    } | null;
}

const JobDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // Fetch job details
    const { data: job, isLoading: isLoadingJob, error: jobError } = useQuery({
        queryKey: ["job", id],
        queryFn: () => getJobById(id!),
        enabled: !!id,
    });

    // Query to fetch application status for the current user/job
    // Ensure checkApplicationStatus in applicationService returns ApplicationStatusResponse
    const { data: applicationData, isLoading: isLoadingStatus } = useQuery<ApplicationStatusResponse, Error>({
        queryKey: ['applicationStatus', id, user?._id], // Unique key per job and user
        queryFn: () => checkApplicationStatus(id!), // Assumes this service function is updated
        enabled: !!id && !!user && user.role === 'applier', // Only run if logged in as applier and job ID exists
        staleTime: 5 * 60 * 1000,
        retry: 1
    });

    // Extract application details and status
    const application = applicationData?.application;
    const applicationStatusValue = application?.status; // 'pending', 'selected', 'rejected', or undefined
    const hasApplied = !!application; // True if an application object exists

    // --- Delete job mutation (no changes needed here) ---
    const deleteMutation = useMutation({
        mutationFn: deleteJob,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["jobs"] });
            toast({ title: "Success", description: "Job deleted successfully" });
            navigate("/jobs");
        },
        onError: (error: any) => {
            const message = error?.response?.data?.message || "Failed to delete job";
            toast({ title: "Error", description: message, variant: "destructive" });
        },
    });

    // --- Apply for job mutation (no changes needed here, but onSuccess invalidates the right query) ---
    const applyMutation = useMutation({
        mutationFn: ({ jobId, file }: { jobId: string; file: File }) =>
            applyForJob(jobId, file),
        onSuccess: () => {
            // Invalidate the status query to refetch the application status (which should now be 'pending')
            queryClient.invalidateQueries({ queryKey: ['applicationStatus', id, user?._id] });
            queryClient.invalidateQueries({ queryKey: ["applications", user?._id] });
            setIsApplyDialogOpen(false);
            setSelectedFile(null);
            toast({ title: "Application Submitted", description: "Your application has been submitted successfully." });
        },
        onError: (error: any) => {
            const errorMessage = error?.response?.data?.message || "Failed to submit application. Please try again.";
            toast({ title: "Error", description: errorMessage, variant: "destructive" });
            // Decide whether to close dialog on error
        },
    });

    // --- Helper functions (formatDate, canModify, handleApplyClick, handleFileChange, handleApplySubmit, handleDeleteConfirm - no changes needed) ---
    const formatDate = (dateString?: string) => {
        // ... (keep existing implementation)
        if (!dateString) return "N/A";
        try {
            return new Date(dateString).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            });
        } catch (e) {
            return "Invalid Date";
        }
    };
    const canModify = () => {
        // ... (keep existing implementation)
        if (!user || !job) return false;
        if (user.role === "admin") return true;
        if (user.role === "employer") {
            const jobCreatorId = typeof job.createdBy === "string"
                ? job.createdBy
                : job.createdBy?._id;
            return jobCreatorId === user._id;
        }
        return false;
    };
    const handleApplyClick = () => {
        if (!hasApplied) { // Only open apply dialog if no application exists yet
            setSelectedFile(null);
            setIsApplyDialogOpen(true);
        }
        // If already applied, clicking the button does nothing (as it's disabled or shows status)
    };
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // ... (keep existing implementation)
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFile(e.target.files[0]);
        } else {
            setSelectedFile(null);
        }
    };
    const handleApplySubmit = (e: React.FormEvent) => {
        // ... (keep existing implementation)
        e.preventDefault();
        if (!selectedFile || !id) return; // Add file validation if needed
        applyMutation.mutate({ jobId: id, file: selectedFile });
    };
    const handleDeleteConfirm = () => {
        // ... (keep existing implementation)
        if (id) deleteMutation.mutate(id);
        setIsDeleteDialogOpen(false);
    };

    // Combine loading states for initial page load
    const isLoadingPage = isLoadingJob || (user?.role === 'applier' && isLoadingStatus);

    // --- Loading State (no changes needed) ---
    if (isLoadingPage) {
        return (
            <div className="flex h-[calc(100vh-10rem)] w-full items-center justify-center">
                <Spinner className="h-10 w-10" />
            </div>
        );
    }

    // --- Error State (no changes needed) ---
    if (jobError || !job) {
        return (
            <div className="container mx-auto py-8 px-4 flex flex-col items-center text-center">
                {/* ... (keep existing error display) */}
                <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
                <h1 className="text-2xl font-bold mb-2">Job Not Found</h1>
                <p className="text-gray-600 mb-6">
                    {jobError?.message || "The job you're looking for doesn't exist or may have been removed."}
                </p>
                <Button onClick={() => navigate("/jobs")}>Back to Jobs</Button>
            </div>
        );
    }

    // --- Helper function to get status display properties ---
    const getStatusDisplay = (status: 'pending' | 'selected' | 'rejected' | undefined | null) => {
        switch (status) {
            case 'pending':
                return {
                    text: "Application Submitted",
                    icon: Clock,
                    // Example Tailwind classes for a yellow/pending state badge appearance
                    className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 focus-visible:ring-yellow-500",
                    buttonVariant: "outline" as const // Use outline or a custom variant
                };
            case 'selected':
                return {
                    text: "Selected for Interview",
                    icon: CheckCircle,
                    // Example Tailwind classes for a green/success state
                    className: "bg-green-100 text-green-800 hover:bg-green-200 focus-visible:ring-green-500",
                    buttonVariant: "outline" as const
                };
            case 'rejected':
                return {
                    text: "Not Selected",
                    icon: XCircle,
                    // Example Tailwind classes for a red/destructive state
                    className: "bg-red-100 text-red-800 hover:bg-red-200 focus-visible:ring-red-500",
                    buttonVariant: "outline" as const
                };
            default: // Not applied or status unknown
                return {
                    text: "Apply Now",
                    icon: null,
                    className: "", // Default button styles apply
                    buttonVariant: "default" as const // Standard primary button
                };
        }
    };

    // Determine the display properties based on the current status
    const statusDisplay = getStatusDisplay(applicationStatusValue);
    const StatusIcon = statusDisplay.icon; // Get the icon component

    // Main component render logic
    return (
        <div className="container mx-auto py-8 px-4">
            {/* --- Back Button (no changes) --- */}
            <Button variant="outline" className="mb-6" onClick={() => navigate(-1)}>
                Back
            </Button>

            <Card className="w-full max-w-4xl mx-auto shadow-lg">
                {/* --- Card Header: Title, Location, Action Buttons --- */}
                <CardHeader className="border-b pb-6">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                        {/* --- Job Title and Location (no changes) --- */}
                        <div className="flex-grow">
                            <CardTitle className="text-2xl md:text-3xl font-bold">{job.title}</CardTitle>
                            <div className="flex items-center mt-2 text-gray-600">
                                <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                                <span>{job.location}</span>
                            </div>
                        </div>

                        {/* --- Action Buttons Area --- */}
                        <div className="flex flex-wrap gap-2 flex-shrink-0">
                            {/* --- Employer/Admin Buttons (no changes) --- */}
                            {canModify() && (
                                <>
                                    {/* View Applications, Edit, Delete buttons */}
                                    <Button variant="outline" size="sm" onClick={() => navigate(`/jobs/${job._id}/applications`)}>View Applications</Button>
                                    <Button variant="outline" size="sm" onClick={() => navigate(`/jobs/${job._id}/edit`)}>Edit</Button>
                                    <Button variant="destructive" size="sm" onClick={() => setIsDeleteDialogOpen(true)} disabled={deleteMutation.isPending}>
                                        {deleteMutation.isPending ? <Spinner className="mr-2 h-4 w-4 animate-spin" /> : null} Delete
                                    </Button>
                                </>
                            )}

                            {/* --- Applier Button (Apply Now / Status) --- */}
                            {user?.role === "applier" && (
                                <Button
                                    size="sm"
                                    onClick={handleApplyClick}
                                    // Disable if:
                                    // 1. An application already exists (regardless of status) - user shouldn't re-apply
                                    // 2. An application is currently being submitted
                                    // 3. The status is still loading
                                    disabled={hasApplied || applyMutation.isPending || isLoadingStatus}
                                    // Apply dynamic classes for status styling (only when applied)
                                    className={hasApplied ? statusDisplay.className : ""}
                                    // Optionally set variant based on status for more distinct styling
                                    // variant={hasApplied ? statusDisplay.buttonVariant : 'default'}
                                    aria-label={hasApplied ? statusDisplay.text : "Apply Now"}
                                >
                                    {/* Loading state while checking status */}
                                    {isLoadingStatus ? (
                                        <>
                                            <Spinner className="mr-2 h-4 w-4 animate-spin" /> Checking...
                                        </>
                                    ) : /* Loading state while submitting application */
                                        applyMutation.isPending ? (
                                            <>
                                                <Spinner className="mr-2 h-4 w-4 animate-spin" /> Applying...
                                            </>
                                        ) : /* Display Status if applied */
                                            hasApplied && StatusIcon ? (
                                                <>
                                                    <StatusIcon className="mr-2 h-4 w-4" /> {statusDisplay.text}
                                                </>
                                            ) : /* Default: Apply Now */
                                                (
                                                    statusDisplay.text
                                                )}
                                </Button>
                            )}
                        </div>
                    </div>
                </CardHeader>

                {/* --- Card Content: Description, Details (no changes needed) --- */}
                <CardContent className="py-6">
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-2 border-b pb-1">Job Description</h3>
                        <p className="whitespace-pre-line text-gray-700 leading-relaxed">{job.description}</p>
                    </div>
                    <div className="border-t pt-4 mt-6">
                        <h3 className="text-lg font-semibold mb-2 border-b pb-1">Details</h3>
                        <ul className="space-y-2 text-sm">
                            {/* ... (keep existing details list items) */}
                            <li className="flex items-center text-gray-600">
                                <Calendar className="h-5 w-5 mr-2 flex-shrink-0" />
                                <span>Posted on: {formatDate(job.createdAt)}</span>
                            </li>
                            <li className="flex items-center text-gray-600">
                                <User className="h-5 w-5 mr-2 flex-shrink-0" />
                                <span>Posted by: {typeof job.createdBy === 'object' && job.createdBy?.name ? job.createdBy.name : 'Employer'}</span>
                            </li>
                            <li className="flex items-center text-gray-600">
                                <Briefcase className="h-5 w-5 mr-2 flex-shrink-0" />
                                <span>Job ID: {job._id}</span>
                            </li>
                        </ul>
                    </div>
                </CardContent>

                {/* --- Card Footer (Optional, kept commented out) --- */}
                {/* <CardFooter className="border-t pt-4"> ... </CardFooter> */}
            </Card>

            {/* --- Delete Confirmation Dialog (no changes needed) --- */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                {/* ... (keep existing dialog content) */}
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete the job "{job.title}"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-end pt-4">
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={deleteMutation.isPending}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDeleteConfirm} disabled={deleteMutation.isPending}>
                            {deleteMutation.isPending ? <Spinner className="mr-2 h-4 w-4 animate-spin" /> : null} Delete Job
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* --- Apply Dialog (no changes needed) --- */}
            <Dialog open={isApplyDialogOpen} onOpenChange={setIsApplyDialogOpen}>
                {/* ... (keep existing dialog content, including form and upload logic) */}
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Apply for: {job?.title}</DialogTitle>
                        <DialogDescription>
                            Upload your CV/Resume to submit your application. Accepted formats: PDF, DOC, DOCX (Max 5MB).
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleApplySubmit}>
                        {/* ... File Upload Area ... */}
                        <div className="space-y-4 py-4">
                            <div className="grid w-full items-center gap-1.5">
                                <label htmlFor="cv-upload" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">CV/Resume File</label>
                                <div className="flex items-center justify-center w-full">
                                    <label htmlFor="cv-upload" className="flex flex-col items-center justify-center w-full h-36 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600 transition-colors duration-200 ease-in-out">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                                            <Upload className="w-8 h-8 mb-3 text-gray-500 dark:text-gray-400" />
                                            {selectedFile ? (
                                                <p className="text-sm text-green-600 dark:text-green-400 font-semibold break-all">Selected: {selectedFile.name}</p>
                                            ) : (
                                                <>
                                                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">PDF, DOC, DOCX (MAX. 5MB)</p>
                                                </>
                                            )}
                                        </div>
                                        <Input id="cv-upload" type="file" className="hidden" accept=".pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf" onChange={handleFileChange} disabled={applyMutation.isPending} />
                                    </label>
                                </div>
                            </div>
                        </div>
                        {/* --- Dialog Footer Buttons --- */}
                        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-end pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsApplyDialogOpen(false)} disabled={applyMutation.isPending}>Cancel</Button>
                            <Button type="submit" disabled={!selectedFile || applyMutation.isPending}>
                                {applyMutation.isPending ? (<><Spinner className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>) : ("Submit Application")}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default JobDetailPage;