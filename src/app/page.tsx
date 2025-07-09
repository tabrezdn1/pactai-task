"use client";

import { ResourceTable } from "@/components/ResourceTable";
import { useResourceData } from "@/hooks/useResourceData";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, 
  Database, 
  TrendingUp, 
  Users, 
  CheckCircle2,
  RefreshCw,
  XCircle,
  Clock
} from "lucide-react";

export default function Home() {
  const { data, loading, error, refetch } = useResourceData();

  const getStatusCounts = () => {
    return {
      completed: data.filter(r => r.resource.metadata.state === "PROCESSING_STATE_COMPLETED").length,
      processing: data.filter(r => r.resource.metadata.state === "PROCESSING_STATE_PROCESSING").length,
      failed: data.filter(r => r.resource.metadata.state === "PROCESSING_STATE_FAILED").length,
      notStarted: data.filter(r => r.resource.metadata.state === "PROCESSING_STATE_NOT_STARTED").length,
    };
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <main className="container mx-auto py-6 px-4 space-y-6">
        {/* Compact Header Section */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            <Database className="h-3.5 w-3.5" />
            <span>Live Data Dashboard</span>
          </div>
          
          <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
            EHR Resource Dashboard
          </h1>
          
          <p className="text-base text-gray-600 max-w-xl mx-auto">
            Monitor and manage electronic health records with real-time processing status
          </p>
        </div>

        {/* Compact Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="relative overflow-hidden border-0 shadow-md bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-xs font-medium">Completed</p>
                  <p className="text-2xl font-bold">{statusCounts.completed}</p>
                </div>
                <div className="h-8 w-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-md bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-xs font-medium">Processing</p>
                  <p className="text-2xl font-bold">{statusCounts.processing}</p>
                </div>
                <div className="h-8 w-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-md bg-gradient-to-br from-red-500 to-red-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-xs font-medium">Failed</p>
                  <p className="text-2xl font-bold">{statusCounts.failed}</p>
                </div>
                <div className="h-8 w-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <XCircle className="h-4 w-4" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-md bg-gradient-to-br from-gray-500 to-gray-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-100 text-xs font-medium">Pending</p>
                  <p className="text-2xl font-bold">{statusCounts.notStarted}</p>
                </div>
                <div className="h-8 w-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <Clock className="h-4 w-4" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Compact Quick Stats */}
        <div className="flex flex-wrap gap-3 justify-center">
          <Badge variant="outline" className="px-3 py-1.5 text-xs">
            <Activity className="h-3 w-3 mr-1.5" />
            {data.length} Total Resources
          </Badge>
          <Badge variant="outline" className="px-3 py-1.5 text-xs">
            <Users className="h-3 w-3 mr-1.5" />
            {new Set(data.map(r => r.resource.metadata.identifier.patientId)).size} Unique Patients
          </Badge>
          <Badge variant="outline" className="px-3 py-1.5 text-xs">
            <TrendingUp className="h-3 w-3 mr-1.5" />
            {Math.round((statusCounts.completed / Math.max(data.length, 1)) * 100)}% Success Rate
          </Badge>
        </div>

        {/* Main Table */}
        <ResourceTable 
          data={data} 
          loading={loading} 
          error={error} 
          onRefresh={refetch}
        />

        {/* Compact Footer */}
        <div className="text-center py-4">
          <p className="text-xs text-gray-500">
            Powered by Next.js, TanStack Table, and shadcn/ui • Data from JSONPlaceholder API
          </p>
        </div>
      </main>
    </div>
  );
}
