
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/Spinner";
import { AlertCircle, Users, Briefcase, FileText } from "lucide-react";
import { getAdminStats } from "@/services/adminService";

interface AdminStats {
  userCount: {
    total: number;
    employers: number;
    appliers: number;
    admins: number;
  };
  jobCount: number;
  applicationCount: number;
}

const AdminDashboardPage: React.FC = () => {
  const { data: stats, isLoading, error } = useQuery<AdminStats>({
    queryKey: ["admin-stats"],
    queryFn: getAdminStats,
  });

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-96 flex-col items-center justify-center text-center">
        <AlertCircle className="mb-2 h-8 w-8 text-destructive" />
        <h3 className="text-lg font-medium">Failed to load dashboard data</h3>
        <p className="text-sm text-muted-foreground">Please try again later.</p>
      </div>
    );
  }

  // If stats aren't available yet, show placeholder values
  const placeholderStats = {
    userCount: {
      total: 0,
      employers: 0,
      appliers: 0,
      admins: 0
    },
    jobCount: 0,
    applicationCount: 0
  };

  const displayStats = stats || placeholderStats;

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold">Dashboard Overview</h2>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="mr-2 h-4 w-4 text-gray-500" />
              <div className="text-2xl font-bold">{displayStats.userCount.total}</div>
            </div>
            <div className="mt-4 text-xs text-muted-foreground">
              <div className="flex justify-between py-1">
                <span>Employers:</span>
                <span>{displayStats.userCount.employers}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Job Seekers:</span>
                <span>{displayStats.userCount.appliers}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Administrators:</span>
                <span>{displayStats.userCount.admins}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Briefcase className="mr-2 h-4 w-4 text-gray-500" />
              <div className="text-2xl font-bold">{displayStats.jobCount}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <FileText className="mr-2 h-4 w-4 text-gray-500" />
              <div className="text-2xl font-bold">{displayStats.applicationCount}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
