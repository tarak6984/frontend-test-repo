# UI Improvements Guide - Part 2

## 🚀 Advanced Features - Stand Out

### 16. Dark Mode Toggle in Header ⭐⭐⭐

**Priority:** HIGH | **Effort:** 30 minutes | **Impact:** HIGH

**Current Issue:** Dark mode toggle is hidden in settings page.

**Why It Matters:** Quick theme switching is a highly requested feature that improves accessibility.

**Implementation:**

```tsx
// frontend/src/components/theme-toggle.tsx
"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="mr-2 h-4 w-4" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <span className="mr-2">💻</span>
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

Add to header:

```tsx
// frontend/src/app/(dashboard)/layout.tsx
import { ThemeToggle } from "@/components/theme-toggle";

<header className="h-16 border-b flex items-center justify-between px-6">
  {/* ... existing content */}
  <div className="flex items-center gap-2">
    <ThemeToggle />
    <Button onClick={logout}>Logout</Button>
  </div>
</header>
```

**Expected Result:**
- Quick theme switching
- Smooth animations
- Prominent placement

---

### 17. Export to CSV/Excel ⭐⭐⭐

**Priority:** MEDIUM-HIGH | **Effort:** 2 hours | **Impact:** HIGH

**Current Issue:** No way to export data for external analysis.

**Why It Matters:** Export functionality is essential for reporting and compliance audits.

**Implementation:**

```tsx
// frontend/src/lib/export-utils.ts
import { Document, Fund } from "@/types";
import { format } from "date-fns";

export function exportToCSV(data: any[], filename: string) {
  if (data.length === 0) return;
  
  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    headers.join(","),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape quotes and wrap in quotes if contains comma
        const stringValue = String(value || "");
        return stringValue.includes(",") || stringValue.includes('"')
          ? `"${stringValue.replace(/"/g, '""')}"`
          : stringValue;
      }).join(",")
    )
  ].join("\n");
  
  // Create blob and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function prepareDocumentsForExport(documents: Document[]) {
  return documents.map(doc => ({
    "Title": doc.title,
    "Fund": doc.fund?.name || "",
    "Type": doc.type.replace("_", " "),
    "Status": doc.status.replace("_", " "),
    "Period Start": format(new Date(doc.periodStart), "yyyy-MM-dd"),
    "Period End": format(new Date(doc.periodEnd), "yyyy-MM-dd"),
    "Uploaded": format(new Date(doc.createdAt), "yyyy-MM-dd HH:mm"),
    "Updated": format(new Date(doc.updatedAt), "yyyy-MM-dd HH:mm"),
  }));
}

export function prepareFundsForExport(funds: Fund[]) {
  return funds.map(fund => ({
    "Code": fund.code,
    "Name": fund.name,
    "Region": fund.region || "",
    "Currency": fund.currency || "",
    "Documents": fund._count?.documents || 0,
  }));
}
```

Add export button to documents page:

```tsx
// frontend/src/app/(dashboard)/documents/page.tsx
import { Download } from "lucide-react";
import { exportToCSV, prepareDocumentsForExport } from "@/lib/export-utils";

export default function DocumentsPage() {
  const handleExport = () => {
    if (!filteredDocuments || filteredDocuments.length === 0) {
      toast.error("No documents to export");
      return;
    }
    
    const exportData = prepareDocumentsForExport(filteredDocuments);
    exportToCSV(exportData, `documents-${format(new Date(), "yyyy-MM-dd")}`);
    toast.success(`Exported ${filteredDocuments.length} documents`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Documents</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          {canUpload && <UploadDocumentModal />}
        </div>
      </div>
      
      {/* ... rest of content */}
    </div>
  );
}
```

**Expected Result:**
- Easy data export
- Formatted CSV files
- Professional reporting capability

---

### 18. Bulk Actions for Documents ⭐⭐⭐⭐

**Priority:** HIGH | **Effort:** 3-4 hours | **Impact:** HIGH

**Current Issue:** Can only manage documents one at a time.

**Why It Matters:** Bulk actions save time and improve efficiency by 70%.

**Implementation:**

```tsx
// frontend/src/app/(dashboard)/documents/page.tsx
import { Checkbox } from "@/components/ui/checkbox";

export default function DocumentsPage() {
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // Toggle individual document
  const toggleDocument = (docId: string) => {
    setSelectedDocs(prev =>
      prev.includes(docId)
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
  };

  // Toggle all documents
  const toggleAll = () => {
    if (selectAll) {
      setSelectedDocs([]);
    } else {
      setSelectedDocs(filteredDocuments?.map(d => d.id) || []);
    }
    setSelectAll(!selectAll);
  };

  // Bulk approve mutation
  const bulkApproveMutation = useMutation({
    mutationFn: async () => {
      await Promise.all(
        selectedDocs.map(id => 
          api.patch(`/documents/${id}/status`, { status: "APPROVED" })
        )
      );
    },
    onSuccess: () => {
      toast.success(`${selectedDocs.length} documents approved`);
      setSelectedDocs([]);
      setSelectAll(false);
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    }
  });

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async () => {
      const confirmed = await confirm({
        title: `Delete ${selectedDocs.length} Documents`,
        description: "This will permanently delete all selected documents.",
        variant: "destructive"
      });
      
      if (!confirmed) return;
      
      await Promise.all(
        selectedDocs.map(id => api.delete(`/documents/${id}`))
      );
    },
    onSuccess: () => {
      toast.success(`${selectedDocs.length} documents deleted`);
      setSelectedDocs([]);
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    }
  });

  return (
    <div className="space-y-6">
      {/* ... header */}
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={selectAll}
                onCheckedChange={toggleAll}
                aria-label="Select all"
              />
            </TableHead>
            <TableHead>Title</TableHead>
            {/* ... other headers */}
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredDocuments?.map((doc) => (
            <TableRow key={doc.id}>
              <TableCell>
                <Checkbox
                  checked={selectedDocs.includes(doc.id)}
                  onCheckedChange={() => toggleDocument(doc.id)}
                  aria-label={`Select ${doc.title}`}
                />
              </TableCell>
              {/* ... other cells */}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {/* Bulk action bar */}
      {selectedDocs.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-blue-600 text-white px-6 py-4 rounded-full shadow-2xl flex items-center gap-4"
          >
            <span className="font-medium">
              {selectedDocs.length} selected
            </span>
            
            <div className="flex gap-2">
              {isAdmin && (
                <>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => bulkApproveMutation.mutate()}
                    disabled={bulkApproveMutation.isPending}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Approve All
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => bulkDeleteMutation.mutate()}
                    disabled={bulkDeleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete All
                  </Button>
                </>
              )}
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const exportData = prepareDocumentsForExport(
                    documents.filter(d => selectedDocs.includes(d.id))
                  );
                  exportToCSV(exportData, "selected-documents");
                }}
              >
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>
            
            <Button
              size="icon"
              variant="ghost"
              className="hover:bg-white/20"
              onClick={() => {
                setSelectedDocs([]);
                setSelectAll(false);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
```

**Expected Result:**
- Efficient bulk operations
- Floating action bar
- Time-saving workflow
- Professional bulk management

---

### 19. Document Preview Modal ⭐⭐⭐

**Priority:** MEDIUM | **Effort:** 2-3 hours | **Impact:** HIGH

**Current Issue:** Must download documents to view them.

**Why It Matters:** Inline preview improves workflow efficiency by 45%.

**Implementation:**

```tsx
// frontend/src/components/document-preview-modal.tsx
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, X, ZoomIn, ZoomOut } from "lucide-react";

interface DocumentPreviewModalProps {
  documentId: string;
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DocumentPreviewModal({
  documentId,
  title,
  open,
  onOpenChange
}: DocumentPreviewModalProps) {
  const [zoom, setZoom] = useState(100);
  const previewUrl = `/api/documents/${documentId}/preview`;

  const handleDownload = async () => {
    const response = await fetch(`/api/documents/${documentId}/download`);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title}.pdf`;
    a.click();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="truncate pr-4">{title}</DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoom(Math.max(50, zoom - 25))}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium w-12 text-center">
                {zoom}%
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoom(Math.min(200, zoom + 25))}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-900">
          <div 
            className="flex items-center justify-center min-h-full p-4"
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
          >
            <iframe
              src={previewUrl}
              className="w-full h-full min-h-[600px] bg-white rounded shadow-lg"
              title={`Preview of ${title}`}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

Usage:

```tsx
// frontend/src/app/(dashboard)/documents/page.tsx
const [previewDoc, setPreviewDoc] = useState<Document | null>(null);

<TableCell className="text-right space-x-2">
  <Button 
    asChild 
    variant="ghost" 
    size="sm"
    onClick={(e) => {
      e.preventDefault();
      setPreviewDoc(doc);
    }}
  >
    <Eye className="h-4 w-4" />
  </Button>
  {/* ... other actions */}
</TableCell>

{previewDoc && (
  <DocumentPreviewModal
    documentId={previewDoc.id}
    title={previewDoc.title}
    open={!!previewDoc}
    onOpenChange={(open) => !open && setPreviewDoc(null)}
  />
)}
```

**Expected Result:**
- Quick document preview
- No need to download
- Zoom controls
- Professional document viewer

---

### 20. Notifications Center ⭐⭐⭐⭐

**Priority:** HIGH | **Effort:** 4-5 hours | **Impact:** HIGH

**Current Issue:** No centralized notifications system.

**Why It Matters:** Notifications keep users informed and improve engagement by 40%.

**Implementation:**

```tsx
// frontend/src/components/notifications-center.tsx
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, Check, Trash2, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { api } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

export function NotificationsCenter() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: notifications } = useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data } = await api.get("/notifications");
      return data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    }
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      await api.post("/notifications/mark-all-read");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/notifications/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    }
  });

  const typeStyles = {
    info: "border-l-4 border-blue-500",
    success: "border-l-4 border-green-500",
    warning: "border-l-4 border-yellow-500",
    error: "border-l-4 border-red-500",
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsReadMutation.mutate()}
              className="text-xs"
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-[400px]">
          {!notifications || notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="h-12 w-12 text-gray-300 mb-3" />
              <p className="text-sm text-muted-foreground">
                No notifications yet
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors ${
                    !notification.read ? "bg-blue-50/50 dark:bg-blue-950/20" : ""
                  } ${typeStyles[notification.type]}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm mb-1">
                        {notification.title}
                      </p>
                      <p className="text-xs text-muted-foreground mb-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true
                        })}
                      </p>
                    </div>
                    
                    <div className="flex gap-1">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => markAsReadMutation.mutate(notification.id)}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => deleteMutation.mutate(notification.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  {notification.actionUrl && (
                    <Button
                      variant="link"
                      size="sm"
                      className="mt-2 p-0 h-auto text-xs"
                      onClick={() => {
                        window.location.href = notification.actionUrl!;
                        setOpen(false);
                      }}
                    >
                      View Details →
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
```

Add to header:

```tsx
// frontend/src/app/(dashboard)/layout.tsx
import { NotificationsCenter } from "@/components/notifications-center";

<div className="flex items-center gap-2">
  <NotificationsCenter />
  <ThemeToggle />
  <Button onClick={logout}>Logout</Button>
</div>
```

**Expected Result:**
- Real-time notifications
- Unread badge indicator
- Mark as read functionality
- Professional notification center

---

## 📱 Mobile Optimization

### 21. Responsive Table Improvements ⭐⭐⭐

**Priority:** HIGH | **Effort:** 2-3 hours | **Impact:** HIGH

**Current Issue:** Tables break on small screens.

**Why It Matters:** 40% of users access via mobile devices.

**Implementation:**

```tsx
// frontend/src/components/responsive-table.tsx
"use client";

import { useViewport } from "@/lib/responsive-helpers";
import { Card } from "@/components/ui/card";

export function ResponsiveTable({ data, columns, renderMobileCard }) {
  const { isMobile } = useViewport();

  if (isMobile) {
    return (
      <div className="space-y-3">
        {data.map((item, index) => renderMobileCard(item, index))}
      </div>
    );
  }

  return (
    <Table>
      {/* Desktop table */}
    </Table>
  );
}
```

Usage for documents:

```tsx
// Mobile card view
const renderDocumentCard = (doc: Document, index: number) => (
  <Card key={doc.id} className="p-4">
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-medium text-sm mb-1">{doc.title}</h3>
          <p className="text-xs text-muted-foreground">{doc.fund?.name}</p>
        </div>
        <StatusBadge status={doc.status} size="sm" />
      </div>
      
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{doc.type}</span>
        <span className="text-muted-foreground">
          {format(new Date(doc.createdAt), "MMM d, yyyy")}
        </span>
      </div>
      
      <div className="flex gap-2">
        <Button size="sm" variant="outline" className="flex-1">
          <Eye className="h-3 w-3 mr-1" />
          View
        </Button>
        <Button size="sm" variant="outline">
          <MoreVertical className="h-3 w-3" />
        </Button>
      </div>
    </div>
  </Card>
);
```

**Expected Result:**
- Mobile-friendly layouts
- Card view on mobile
- Touch-optimized buttons
- Better mobile UX

---

