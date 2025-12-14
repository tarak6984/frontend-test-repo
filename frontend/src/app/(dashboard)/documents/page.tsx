"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Document, DocStatus, DocType } from "@/types";
import { TableSkeleton } from "@/components/skeletons/card-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { format } from "date-fns";
import {
  Loader2,
  Eye,
  Trash2,
  Columns3,
  Search,
  MessageSquare,
  Check,
  Upload,
  FileText,
} from "lucide-react";
import { UploadDocumentModal } from "@/components/dashboard/upload-document-modal";
import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function DocumentsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [visibleColumns, setVisibleColumns] = useState({
    title: true,
    fund: true,
    type: true,
    period: true,
    status: true,
    uploaded: true,
  });

  const {
    data: documents,
    isLoading,
    error,
  } = useQuery<Document[]>({
    queryKey: ["documents", statusFilter, typeFilter],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (statusFilter !== "all") params.append("status", statusFilter);
        if (typeFilter !== "all") params.append("type", typeFilter);
        const { data } = await api.get(`/documents?${params.toString()}`);
        return data;
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to load documents");
        throw err;
      }
    },
    retry: 1,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/documents/${id}`);
    },
    onSuccess: () => {
      toast.success("Document deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to delete document");
    },
  });

  const canUpload =
    user && ["ADMIN", "FUND_MANAGER", "COMPLIANCE_OFFICER"].includes(user.role);
  const isAdmin = user?.role === "ADMIN";

  // Filter documents by search query
  const filteredDocuments = documents?.filter(
    (doc) =>
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.fund?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.fund?.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: DocStatus) => {
    switch (status) {
      case DocStatus.APPROVED:
        return "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-300";
      case DocStatus.REJECTED:
        return "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900 dark:text-red-300";
      case DocStatus.IN_REVIEW:
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Documents</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            View and manage compliance documents.
          </p>
        </div>
        {canUpload && <UploadDocumentModal />}
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents, funds..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {Object.values(DocStatus).map((s) => (
                <SelectItem key={s} value={s}>
                  {s.replace("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {Object.values(DocType).map((t) => (
                <SelectItem key={t} value={t}>
                  {t.replace("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="flex shrink-0">
                <Columns3 className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuCheckboxItem
                checked={visibleColumns.title}
                onCheckedChange={(v) =>
                  setVisibleColumns({ ...visibleColumns, title: v })
                }
              >
                Title
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={visibleColumns.fund}
                onCheckedChange={(v) =>
                  setVisibleColumns({ ...visibleColumns, fund: v })
                }
              >
                Fund
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={visibleColumns.type}
                onCheckedChange={(v) =>
                  setVisibleColumns({ ...visibleColumns, type: v })
                }
              >
                Type
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={visibleColumns.period}
                onCheckedChange={(v) =>
                  setVisibleColumns({ ...visibleColumns, period: v })
                }
              >
                Period
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={visibleColumns.status}
                onCheckedChange={(v) =>
                  setVisibleColumns({ ...visibleColumns, status: v })
                }
              >
                Status
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={visibleColumns.uploaded}
                onCheckedChange={(v) =>
                  setVisibleColumns({ ...visibleColumns, uploaded: v })
                }
              >
                Uploaded
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton rows={10} />
      ) : filteredDocuments?.length === 0 ? (
        searchQuery || statusFilter !== "all" || typeFilter !== "all" ? (
          <EmptyState
            icon={FileText}
            title="No documents match your filters"
            description="Try adjusting your search terms or filters to find what you're looking for."
            action={{
              label: "Clear Filters",
              onClick: () => {
                setSearchQuery("");
                setStatusFilter("all");
                setTypeFilter("all");
              }
            }}
          />
        ) : (
          <EmptyState
            icon={Upload}
            title="No documents yet"
            description="Get started by uploading your first compliance document to begin tracking and managing your regulatory requirements."
            action={canUpload ? {
              label: "Upload Document",
              icon: Upload,
              onClick: () => {}
            } : undefined}
          />
        )
      ) : (
        <div className="block rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
          <div className="overflow-x-auto">
          <Table className="min-w-[800px]">
            <TableHeader>
              <TableRow>
                {visibleColumns.title && <TableHead className="min-w-[200px]">Title</TableHead>}
                {visibleColumns.fund && <TableHead className="min-w-[150px]">Fund</TableHead>}
                {visibleColumns.type && <TableHead className="min-w-[120px]">Type</TableHead>}
                {visibleColumns.period && <TableHead className="min-w-[100px]">Period</TableHead>}
                {visibleColumns.status && <TableHead className="min-w-[100px]">Status</TableHead>}
                {visibleColumns.uploaded && <TableHead className="min-w-[120px]">Uploaded</TableHead>}
                <TableHead className="text-right min-w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocuments?.map((doc) => (
                <TableRow key={doc.id}>
                  {visibleColumns.title && (
                    <TableCell className="font-medium whitespace-nowrap">{doc.title}</TableCell>
                  )}
                  {visibleColumns.fund && (
                    <TableCell className="whitespace-nowrap">{doc.fund?.name || doc.fundId}</TableCell>
                  )}
                  {visibleColumns.type && (
                    <TableCell className="whitespace-nowrap">
                      <Badge variant="outline">
                        {doc.type.replace("_", " ")}
                      </Badge>
                    </TableCell>
                  )}
                  {visibleColumns.period && (
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(doc.periodEnd), "MMM yyyy")}
                    </TableCell>
                  )}
                  {visibleColumns.status && (
                    <TableCell className="whitespace-nowrap">
                      <StatusBadge status={doc.status} animated />
                    </TableCell>
                  )}
                  {visibleColumns.uploaded && (
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(doc.createdAt), "dd MMM yyyy")}
                    </TableCell>
                  )}
                  <TableCell className="text-right space-x-2 whitespace-nowrap">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/documents/${doc.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        sessionStorage.setItem("chatSelectedDocs", JSON.stringify([doc]));
                        router.push("/chat");
                        toast.success("Document selected for chat");
                      }}
                      title="Chat about this document"
                    >
                      <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </Button>
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (
                            confirm(
                              "Are you sure you want to delete this document?"
                            )
                          ) {
                            deleteMutation.mutate(doc.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        </div>
      )}
    </div>
  );
}
