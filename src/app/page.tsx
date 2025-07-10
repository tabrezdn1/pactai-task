"use client";

import { ResourceTable } from "@/components/ResourceTable";
import { useResourceData } from "@/hooks/useResourceData";
import { ProgressBar } from "@/components/ui/progress";
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
  // Default to fetching 100 records to keep initial payload small
  const { data, loading, error, refetch, progress } = useResourceData(100);

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
      <main className="container mx-auto py-2 px-4 flex flex-col min-h-screen">
        {/* Compact Header Section */}
        <div className="text-center space-y-2 pb-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            <Database className="h-3.5 w-3.5" />
            <span>Live Data Dashboard</span>
          </div>
          
          <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
            EHR Resource Dashboard
          </h1>
          
          <p className="text-sm text-gray-600 max-w-lg mx-auto">
            Monitor and manage electronic health records with real-time processing status
          </p>
        </div>

        {/* Compact Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-2">
          <Card className="relative overflow-hidden border-0 shadow-sm bg-gradient-to-br from-emerald-500 to-emerald-600 text-white py-3">
            <CardContent className="p-2">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-emerald-100 text-[10px] font-medium leading-none">Completed</p>
                  <p className="text-lg font-bold leading-tight">{statusCounts.completed}</p>
                </div>
                <div className="h-5 w-5 bg-white/20 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="h-3 w-3" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-sm bg-gradient-to-br from-blue-500 to-blue-600 text-white py-3">
            <CardContent className="p-2">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-blue-100 text-[10px] font-medium leading-none">Processing</p>
                  <p className="text-lg font-bold leading-tight">{statusCounts.processing}</p>
                </div>
                <div className="h-5 w-5 bg-white/20 rounded-lg flex items-center justify-center">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-sm bg-gradient-to-br from-red-500 to-red-600 text-white py-3">
            <CardContent className="p-2">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-red-100 text-[10px] font-medium leading-none">Failed</p>
                  <p className="text-lg font-bold leading-tight">{statusCounts.failed}</p>
                </div>
                <div className="h-5 w-5 bg-white/20 rounded-lg flex items-center justify-center">
                  <XCircle className="h-3 w-3" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-sm bg-gradient-to-br from-gray-500 to-gray-600 text-white py-3">
            <CardContent className="p-2">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-gray-100 text-[10px] font-medium leading-none">Pending</p>
                  <p className="text-lg font-bold leading-tight">{statusCounts.notStarted}</p>
                </div>
                <div className="h-5 w-5 bg-white/20 rounded-lg flex items-center justify-center">
                  <Clock className="h-3 w-3" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Compact Quick Stats */}
        <div className="flex flex-wrap gap-3 justify-center mb-2 text-xs">
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

        {/* Load full dataset on demand */}
        <div className="flex justify-center mb-4">
          <button
            className="inline-flex items-center px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded-md disabled:opacity-50"
            onClick={() => refetch(1_000_000)}
            disabled={loading || data.length >= 1_000_000}
          >
            <Database className="h-3.5 w-3.5 mr-1" />
            Load 1&nbsp;Million Records
          </button>
        </div>

        {/* Progress bar for dataset fetch */}
        {loading && (
          <div className="mx-auto w-full max-w-lg mb-4 flex flex-col items-center gap-1">
            <ProgressBar value={progress} />
            <span className="text-[10px] text-gray-500">{Math.round(progress)}%</span>
          </div>
        )}

        {/* Main Table */}
        <div className="flex-grow overflow-hidden">
          <ResourceTable 
            data={data} 
            loading={loading} 
            error={error} 
            onRefresh={() => refetch()}
          />
        </div>

        {/* Compact Footer */}
        <footer className="text-center py-2">
          <p className="text-[10px] text-gray-400">
            Powered by Next.js, TanStack Table, and shadcn/ui • Mock EHR data generated with Faker
          </p>
        </footer>
      </main>
    </div>
  );
}
