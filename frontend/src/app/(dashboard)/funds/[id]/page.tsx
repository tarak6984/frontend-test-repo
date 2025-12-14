"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  TrendingUp,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";

export default function FundDetailPage() {
  const params = useParams();
  const router = useRouter();
  const fundId = params.id as string;

  const {
    data: fundData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["fund", fundId, "details"],
    queryFn: async () => {
      try {
        const { data } = await api.get(`/funds/${fundId}/details`);
        return data;
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to load fund details");
        throw err;
      }
    },
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-full" />
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !fundData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Fund not found</h2>
        <p className="text-gray-600 mb-4">
          The fund you're looking for doesn't exist or you don't have access to it.
        </p>
        <Button onClick={() => router.push("/funds")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Funds
        </Button>
      </div>
    );
  }

  const { metrics, statusCounts, documentsByYear } = fundData;
  const years = Object.keys(documentsByYear).sort((a, b) => parseInt(b) - parseInt(a));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/funds")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {fundData.name}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="font-mono">
                {fundData.code}
              </Badge>
              {fundData.region && (
                <span className="text-sm text-gray-600">
                  {fundData.region}
                </span>
              )}
              {fundData.currency && (
                <span className="text-sm text-gray-600">
                  • {fundData.currency}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Documents
            </CardTitle>
            <FileText className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalDocuments}</div>
            <p className="text-xs text-gray-600 mt-1">
              All compliance documents
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Compliance Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.complianceRate}%</div>
            <Progress value={metrics.complianceRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.approvedDocuments}</div>
            <p className="text-xs text-gray-600 mt-1">
              {statusCounts.ARCHIVED > 0 && `+ ${statusCounts.ARCHIVED} archived`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Review
            </CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.pendingReview}</div>
            <p className="text-xs text-gray-600 mt-1">
              {statusCounts.REJECTED > 0 && `${statusCounts.REJECTED} rejected`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Document Status Overview</CardTitle>
          <CardDescription>
            Breakdown of documents by approval status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(statusCounts).map(([status, count]) => (
              <div key={status} className="text-center">
                <StatusBadge status={status as any} />
                <div className="text-2xl font-bold mt-2">{count}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Documents by Year */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Documents by Period</h2>
        {years.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No documents yet</h3>
              <p className="text-gray-600 text-center">
                No compliance documents have been uploaded for this fund.
              </p>
            </CardContent>
          </Card>
        ) : (
          years.map((year) => (
            <Card key={year}>
              <CardHeader>
                <CardTitle className="text-xl">
                  {year} Documents ({documentsByYear[year].length})
                </CardTitle>
                <CardDescription>
                  Documents with period ending in {year}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Period</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Uploaded By</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {documentsByYear[year].map((doc: any) => (
                        <TableRow key={doc.id}>
                          <TableCell className="font-medium">
                            <Link
                              href={`/documents/${doc.id}`}
                              className="hover:underline text-blue-600"
                            >
                              {doc.title}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{doc.type}</Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {format(new Date(doc.periodStart), "MMM d, yyyy")} -{" "}
                            {format(new Date(doc.periodEnd), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={doc.status} />
                          </TableCell>
                          <TableCell className="text-sm">
                            {doc.uploadedBy.name}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                            >
                              <Link href={`/documents/${doc.id}`}>
                                View Details
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Missing Documents Alert (Optional Enhancement) */}
      {metrics.pendingReview > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertCircle className="h-5 w-5" />
              Action Required
            </CardTitle>
            <CardDescription className="text-orange-700">
              There are {metrics.pendingReview} documents pending review for this fund.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}
