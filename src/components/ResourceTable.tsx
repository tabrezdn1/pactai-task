"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useState, useMemo, useRef, useEffect } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ResourceWrapper, ProcessingState } from "@/types/resource";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  RefreshCw, 
  ChevronUp, 
  ChevronDown, 
  User, 
  FileText, 
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Pause,
  Sparkles,
  // X as XIcon
} from "lucide-react";

interface ResourceTableProps {
  data: ResourceWrapper[];
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
}

const getStateConfig = (state: ProcessingState) => {
  switch (state) {
    case ProcessingState.PROCESSING_STATE_COMPLETED:
      return {
        label: "Completed",
        variant: "default" as const,
        className: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-300",
        icon: CheckCircle2,
      };
    case ProcessingState.PROCESSING_STATE_PROCESSING:
      return {
        label: "Processing",
        variant: "secondary" as const,
        className: "bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-300 animate-pulse",
        icon: RefreshCw,
      };
    case ProcessingState.PROCESSING_STATE_FAILED:
      return {
        label: "Failed",
        variant: "destructive" as const,
        className: "bg-red-100 text-red-800 hover:bg-red-200 border-red-300",
        icon: XCircle,
      };
    case ProcessingState.PROCESSING_STATE_NOT_STARTED:
      return {
        label: "Not Started",
        variant: "outline" as const,
        className: "bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-300",
        icon: Pause,
      };
    default:
      return {
        label: "Unknown",
        variant: "outline" as const,
        className: "bg-gray-50 text-gray-700",
        icon: AlertCircle,
      };
  }
};

const formatDate = (dateString: string) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString));
};

const TableSkeleton = () => (
  <div className="space-y-2">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="flex space-x-4 p-3">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-5 w-18 rounded-full" />
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-48" />
        <Skeleton className="h-3 w-32" />
      </div>
    ))}
  </div>
);

const MAX_CELL_LENGTH = 48;

function TruncatedCell({ text }: { text: string }) {
  if (!text || text.length <= MAX_CELL_LENGTH) {
    return <span>{text}</span>;
  }
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="truncate cursor-help inline-block max-w-xs align-bottom">{text.slice(0, MAX_CELL_LENGTH)}…</span>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs whitespace-pre-line break-words text-xs bg-white text-gray-900 shadow-lg border">
          {text}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function ResourceTable({ data, loading = false, error = null, onRefresh }: ResourceTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  // Hold the user-entered page number (1-indexed for UX)
  const [pageInput, setPageInput] = useState("1");
  // Page size state with sensible default
  const [pageSize, setPageSize] = useState(100);

  // Keep the page input in sync whenever the active page changes
  useEffect(() => {
    setPageInput((page + 1).toString());
  }, [page]);

  // Scroll table back to top whenever the page changes
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0 });
    }
  }, [page]);

  // Search logic only
  const filteredData = useMemo(() => {
    let filtered = data;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter((row) => {
        const { patientId } = row.resource.metadata.identifier;
        const { resourceType, state } = row.resource.metadata;
        const desc = row.resource.humanReadableStr || "";
        const ai = row.resource.aiSummary || "";
        return (
          patientId.toLowerCase().includes(q) ||
          resourceType.toLowerCase().includes(q) ||
          state.toLowerCase().includes(q) ||
          desc.toLowerCase().includes(q) ||
          ai.toLowerCase().includes(q)
        );
      });
    }
    return filtered;
  }, [data, search]);

  // Reset to first page when search results change
  useEffect(() => {
    setPage(0);
  }, [search, filteredData.length]);

  // Reset to first page when pageSize changes
  useEffect(() => {
    setPage(0);
  }, [pageSize]);

  const pageCount = Math.max(1, Math.ceil(filteredData.length / pageSize));

  // Available page-size options based on data size
  const pageSizeOptions = useMemo(() => {
    const bases = [25, 50, 100, 250, 500, 1000];
    const opts = bases.filter((n) => n <= filteredData.length);
    // Always include current pageSize and last page size if dataset smaller than min base
    if (!opts.includes(pageSize)) opts.push(pageSize);
    if (filteredData.length > 0 && !opts.includes(filteredData.length)) opts.push(filteredData.length);
    return Array.from(new Set(opts)).sort((a, b) => a - b);
  }, [filteredData.length, pageSize]);

  const pageData = useMemo(
    () => filteredData.slice(page * pageSize, page * pageSize + pageSize),
    [filteredData, page, pageSize]
  );

  // Callback to jump to a specific page based on the pageInput value
  const handleGoToPage = () => {
    const num = parseInt(pageInput, 10);
    if (!isNaN(num)) {
      const target = Math.min(Math.max(num - 1, 0), pageCount - 1);
      setPage(target);
    }
  };

  // Standard columns with sorting only
  const columns: ColumnDef<ResourceWrapper>[] = useMemo(() => [
    {
      accessorKey: "resource.metadata.identifier.patientId",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 hover:bg-transparent font-semibold text-left text-xs"
        >
          <User className="mr-1 h-3 w-3" />
          Patient ID
          {column.getIsSorted() === "asc" ? (
            <ChevronUp className="ml-1 h-3 w-3" />
          ) : column.getIsSorted() === "desc" ? (
            <ChevronDown className="ml-1 h-3 w-3" />
          ) : null}
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-medium text-blue-600 text-sm">
          {row.original.resource.metadata.identifier.patientId}
        </div>
      ),
    },
    {
      accessorKey: "resource.metadata.resourceType",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 hover:bg-transparent font-semibold text-xs"
        >
          <FileText className="mr-1 h-3 w-3" />
          Resource Type
          {column.getIsSorted() === "asc" ? (
            <ChevronUp className="ml-1 h-3 w-3" />
          ) : column.getIsSorted() === "desc" ? (
            <ChevronDown className="ml-1 h-3 w-3" />
          ) : null}
        </Button>
      ),
      cell: ({ row }) => (
        <Badge variant="outline" className="font-medium text-xs">
          {row.original.resource.metadata.resourceType}
        </Badge>
      ),
    },
    {
      accessorKey: "resource.metadata.state",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 hover:bg-transparent font-semibold text-xs"
        >
          Status
          {column.getIsSorted() === "asc" ? (
            <ChevronUp className="ml-1 h-3 w-3" />
          ) : column.getIsSorted() === "desc" ? (
            <ChevronDown className="ml-1 h-3 w-3" />
          ) : null}
        </Button>
      ),
      cell: ({ row }) => {
        const state = row.original.resource.metadata.state;
        const config = getStateConfig(state);
        const Icon = config.icon;
        
        return (
          <Badge className={`${config.className} text-xs`}>
            <Icon className="mr-1 h-2.5 w-2.5" />
            {config.label}
          </Badge>
        );
      },
    },
    {
      accessorKey: "resource.metadata.createdTime",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 hover:bg-transparent font-semibold text-xs"
        >
          <Calendar className="mr-1 h-3 w-3" />
          Created
          {column.getIsSorted() === "asc" ? (
            <ChevronUp className="ml-1 h-3 w-3" />
          ) : column.getIsSorted() === "desc" ? (
            <ChevronDown className="ml-1 h-3 w-3" />
          ) : null}
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-xs text-gray-600">
          {formatDate(row.original.resource.metadata.createdTime)}
        </div>
      ),
    },
    {
      accessorKey: "resource.metadata.fetchTime",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 hover:bg-transparent font-semibold text-xs"
        >
          <Clock className="mr-1 h-3 w-3" />
          Fetched
          {column.getIsSorted() === "asc" ? (
            <ChevronUp className="ml-1 h-3 w-3" />
          ) : column.getIsSorted() === "desc" ? (
            <ChevronDown className="ml-1 h-3 w-3" />
          ) : null}
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-xs text-gray-600">
          {formatDate(row.original.resource.metadata.fetchTime)}
        </div>
      ),
    },
    {
      accessorKey: "resource.metadata.processedTime",
      header: "Processed",
      cell: ({ row }) => {
        const processedTime = row.original.resource.metadata.processedTime;
        return processedTime ? (
          <div className="text-xs text-gray-600">
            {formatDate(processedTime)}
          </div>
        ) : (
          <span className="text-xs text-gray-400 italic">Pending</span>
        );
      },
    },
    {
      accessorKey: "resource.humanReadableStr",
      header: "Description",
      cell: ({ row }) => (
        <TruncatedCell text={row.original.resource.humanReadableStr} />
      ),
    },
    {
      accessorKey: "resource.aiSummary",
      header: () => (
        <div className="flex items-center text-xs">
          <Sparkles className="mr-1 h-3 w-3 text-purple-500" />
          AI Summary
        </div>
      ),
      cell: ({ row }) => {
        const summary = row.original.resource.aiSummary;
        return summary ? (
          <TruncatedCell text={summary} />
        ) : (
          <span className="text-xs text-gray-400 italic">No summary available</span>
        );
      },
    },
  ], []);

  const table = useReactTable({
    data: pageData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  // Virtualizer setup
  const containerRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: table.getRowModel().rows.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => 44,
    overscan: 8,
  });

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="pt-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              {onRefresh && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onRefresh}
                  className="ml-4"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Retry
                </Button>
              )}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Resource Status Table
            </CardTitle>
            <CardDescription className="mt-1 text-sm">
              {loading ? "Loading resource data..." : `${filteredData.length} resources found`}
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
            <Input
              type="text"
              placeholder="Search resources..."
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
              className="w-48 text-xs"
              disabled={loading}
            />
            {onRefresh && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onRefresh}
                disabled={loading}
                className="hover:bg-blue-50 hover:border-blue-300 text-xs"
              >
                <RefreshCw className={`h-3 w-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="border rounded-lg overflow-hidden bg-white">
          {loading ? (
            <div className="p-4">
              <TableSkeleton />
            </div>
          ) : (
            <div ref={containerRef} className="max-h-[600px] overflow-y-auto">
              <Table>
                <TableHeader className="bg-gray-50/80">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="hover:bg-gray-50/80">
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className="font-semibold text-gray-700 py-3 text-xs"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
                {/* Virtualized body */}
                <TableBody>
                  {/* top spacer */}
                  <tr style={{ height: rowVirtualizer.getVirtualItems()[0]?.start ?? 0 }} />

                  {rowVirtualizer.getVirtualItems().map(virtualRow => {
                    const row = table.getRowModel().rows[virtualRow.index];
                    return (
                      <TableRow
                        key={row.id}
                        className="hover:bg-gray-50/50 transition-colors duration-150 border-gray-100"
                        data-state={row.getIsSelected() && "selected"}
                        style={{ height: virtualRow.size }}
                      >
                        {row.getVisibleCells().map(cell => (
                          <TableCell key={cell.id} className="py-3">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  })}

                  {/* bottom spacer */}
                  <tr
                    style={{
                      height:
                        rowVirtualizer.getTotalSize() -
                        (rowVirtualizer.getVirtualItems().at(-1)?.end ?? 0),
                    }}
                  />
                </TableBody>
              </Table>
            </div>
          )}
        </div>
        {/* Pagination / page-size controls */}
        {!loading && filteredData.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 py-2 text-xs text-gray-600">
            <span>
              Page {page + 1} of {pageCount}
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Rows per page dropdown */}
              <select
                value={pageSize}
                onChange={(e) => setPageSize(parseInt(e.target.value, 10))}
                className="h-7 border rounded px-2 bg-white text-xs"
              >
                {pageSizeOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt} / page
                  </option>
                ))}
              </select>

              <Button
                size="sm"
                variant="outline"
                disabled={page === 0}
                onClick={() => setPage(prev => Math.max(prev - 1, 0))}
              >
                Prev
              </Button>
              {/* Direct page navigation */}
              <Input
                type="number"
                min={1}
                max={pageCount}
                value={pageInput}
                onChange={(e) => setPageInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleGoToPage();
                  }
                }}
                className="w-24 h-7 text-center text-xs px-2"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={handleGoToPage}
              >
                Go
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={page + 1 >= pageCount}
                onClick={() => setPage(prev => Math.min(prev + 1, pageCount - 1))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 