
import React from "react";
import { Outlet, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Shield, Users, Briefcase } from "lucide-react";
import { Navigate } from "react-router-dom";

const AdminLayout: React.FC = () => {
  const { user } = useAuth();

  // Additional admin role check (ProtectedRoute already checks, but this is a safeguard)
  if (!user || user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 gap-8 md:grid-cols-[250px_1fr]">
        {/* Sidebar Navigation */}
        <aside className="rounded-lg border bg-card p-4 shadow-sm">
          <nav className="space-y-2">
            <Link 
              to="/admin/dashboard" 
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <Shield className="h-4 w-4" />
              Overview
            </Link>
            <Link 
              to="/admin/users" 
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <Users className="h-4 w-4" />
              User Management
            </Link>
            <Link 
              to="/admin/jobs" 
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <Briefcase className="h-4 w-4" />
              Job Management
            </Link>
          </nav>
        </aside>
        
        {/* Main Content Area */}
        <main className="rounded-lg border bg-card p-6 shadow-sm">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
