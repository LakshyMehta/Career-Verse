
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminLayout from "@/components/AdminLayout";
import Index from "./pages/Index";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import JobListPage from "./pages/JobListPage";
import JobDetailPage from "./pages/JobDetailPage";
import MyApplicationsPage from "./pages/MyApplicationsPage";
import JobApplicationsPage from "./pages/JobApplicationsPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import AdminJobsPage from "./pages/AdminJobsPage";
import NotFound from "./pages/NotFound";
import PostJobPage from "./pages/PostJobPage";
import EditJobPage from "./pages/EditJobPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <div className="flex-1 pt-16"> {/* Add padding-top to account for fixed navbar */}
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                
                {/* Protected routes for all authenticated users */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/jobs" element={<JobListPage />} />
                  <Route path="/jobs/:id" element={<JobDetailPage />} />
                </Route>
                
                {/* Applier-only routes */}
                <Route element={<ProtectedRoute allowedRoles={["applier"]} />}>
                  <Route path="/applications" element={<MyApplicationsPage />} />
                </Route>
                
                {/* Admin-only routes */}
                <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route path="dashboard" element={<AdminDashboardPage />} />
                    <Route path="users" element={<AdminUsersPage />} />
                    <Route path="jobs" element={<AdminJobsPage />} />
                  </Route>
                </Route>
                
                {/* Employer/Admin-only routes */}
                <Route element={<ProtectedRoute allowedRoles={["employer", "admin"]} />}>
                  <Route path="/jobs/:id/applications" element={<JobApplicationsPage />} />
                  <Route path="/jobs/post" element={<PostJobPage />} />
                  <Route path="/employer/dashboard" element={<DashboardPage />} />
                  <Route path="/jobs/:jobId/edit" element={<EditJobPage />} />
                </Route>
                
                {/* Catch-all route for 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </div>
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
