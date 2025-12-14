"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { UploadCloud, X, FileText, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  fundId: z.string().min(1, "Fund is required"),
  type: z.string().min(1, "Document type is required"),
  periodStart: z.string(),
  periodEnd: z.string(),
  description: z.string().optional(),
  file: z.any(),
});

interface UploadDocumentModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface FileUploadStatus {
  file: File;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  progress?: number;
}

export function UploadDocumentModal({ open: controlledOpen, onOpenChange }: UploadDocumentModalProps = {}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [uploadStatuses, setUploadStatuses] = useState<FileUploadStatus[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();

  // Use controlled state if provided, otherwise use internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  const uploadCount = useState(() => {
    if (typeof window !== "undefined") {
      const count = parseInt(localStorage.getItem("uploadCount") || "0", 10);
      return count;
    }
    return 0;
  })[0];

  const { data: funds } = useQuery({
    queryKey: ["funds"],
    queryFn: async () => {
      const { data } = await api.get("/funds");
      return data;
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      fundId: "",
      type: "",
      periodStart: "",
      periodEnd: "",
      description: "",
    },
  });

  const uploadSingleFile = async (file: File, values: z.infer<typeof formSchema>, index: number) => {
    try {
      setUploadStatuses(prev => prev.map((item, i) => 
        i === index ? { ...item, status: 'uploading' as const, progress: 0 } : item
      ));

      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > 50) {
        console.warn("Large file detected, may take longer to process");
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", `${values.title}${uploadStatuses.length > 1 ? ` - ${file.name}` : ''}`);
      formData.append("fundId", values.fundId);
      formData.append("type", values.type);
      formData.append("periodStart", values.periodStart);
      formData.append("periodEnd", values.periodEnd);
      if (values.description)
        formData.append("description", values.description);

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Upload timeout")), 20000000);
      });

      const uploadPromise = api.post("/documents", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await Promise.race([uploadPromise, timeoutPromise]);

      setUploadStatuses(prev => prev.map((item, i) => 
        i === index ? { ...item, status: 'success' as const, progress: 100 } : item
      ));

      return { success: true };
    } catch (error: any) {
      const errorMsg = error.message === "Upload timeout" 
        ? "Upload timeout" 
        : error.response?.data?.message || "Upload failed";
      
      setUploadStatuses(prev => prev.map((item, i) => 
        i === index ? { ...item, status: 'error' as const, error: errorMsg } : item
      ));

      return { success: false, error: errorMsg };
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const files = Array.from(values.file as FileList);
    
    if (files.length === 0) {
      toast.error("Please select at least one file");
      return;
    }

    setIsUploading(true);
    setUploadStatuses(files.map(file => ({ file, status: 'pending' as const })));

    const results = [];
    for (let i = 0; i < files.length; i++) {
      const result = await uploadSingleFile(files[i], values, i);
      results.push(result);
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    if (successCount > 0) {
      toast.success(`${successCount} document${successCount > 1 ? 's' : ''} uploaded successfully`);
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["documents-all"] });
      
      if (typeof window !== "undefined") {
        const currentCount = parseInt(localStorage.getItem("uploadCount") || "0", 10);
        localStorage.setItem("uploadCount", String(currentCount + successCount));
      }
    }

    if (failCount > 0) {
      toast.error(`${failCount} document${failCount > 1 ? 's' : ''} failed to upload`);
    }

    setIsUploading(false);

    if (failCount === 0) {
      setTimeout(() => {
        setOpen(false);
        form.reset();
        setUploadStatuses([]);
      }, 1500);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UploadCloud className="mr-2 h-4 w-4" />
          Upload Document
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload New Document</DialogTitle>
          <DialogDescription>
            Submit a document for compliance review.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Q4 2024 Annual Report" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fundId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fund</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a fund" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {funds?.map((fund: any) => (
                        <SelectItem key={fund.id} value={fund.id}>
                          {fund.code} - {fund.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ANNUAL_REPORT">
                        Annual Report
                      </SelectItem>
                      <SelectItem value="COMPLIANCE_CERT">
                        Compliance Certificate
                      </SelectItem>
                      <SelectItem value="RISK_DISCLOSURE">
                        Risk Disclosure
                      </SelectItem>
                      <SelectItem value="REGULATORY_FILING">
                        Regulatory Filing
                      </SelectItem>
                      <SelectItem value="INTERNAL_MEMO">
                        Internal Memo
                      </SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="periodStart"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Period Start</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="periodEnd"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Period End</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Additional notes..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="file"
              render={({ field: { onChange, value, ...field } }) => (
                <FormItem>
                  <FormLabel>Files (Select one or multiple)</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      multiple
                      onChange={(e) => onChange(e.target.files)}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground mt-1">
                    Hold Ctrl (Windows) or Cmd (Mac) to select multiple files
                  </p>
                </FormItem>
              )}
            />
            {uploadStatuses.length > 0 && (
              <div className="space-y-2 mt-4 p-4 border rounded-md bg-gray-50 dark:bg-gray-800">
                <h4 className="font-semibold text-sm">Upload Progress</h4>
                {uploadStatuses.map((status, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    {status.status === 'pending' && <Loader2 className="h-4 w-4 text-gray-400" />}
                    {status.status === 'uploading' && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
                    {status.status === 'success' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                    {status.status === 'error' && <AlertCircle className="h-4 w-4 text-red-500" />}
                    <span className="flex-1 truncate">{status.file.name}</span>
                    {status.error && <span className="text-xs text-red-500">{status.error}</span>}
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  setUploadStatuses([]);
                }}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isUploading}>
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <UploadCloud className="mr-2 h-4 w-4" />
                    Upload Document{uploadStatuses.length > 1 ? 's' : ''}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
