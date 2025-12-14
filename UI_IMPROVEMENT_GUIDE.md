# 🎨 Audit Vault - UI/UX Improvement Guide

> **Comprehensive guide to elevate your application's user interface and experience**

This document contains detailed, actionable suggestions to transform your Audit Vault application into a polished, professional product that will stand out in any submission or presentation.

---

## 📋 Table of Contents

1. [High Impact Changes](#-high-impact-changes)
2. [Medium Impact - Visual Polish](#-medium-impact---visual-polish)
3. [Quick Wins - Easy Implementations](#-quick-wins---easy-implementations)
4. [Advanced Features](#-advanced-features---stand-out)
5. [Mobile Optimization](#-mobile-optimization)
6. [Visual Design Improvements](#-visual-design-improvements)
7. [Implementation Priority](#-implementation-priority)
8. [Code Examples Repository](#-code-examples-repository)

---

## 🌟 High Impact Changes

These changes will have the most significant impact on user experience and should be prioritized.

### 1. Loading Skeletons Instead of Spinners ⭐⭐⭐⭐⭐

**Priority:** CRITICAL | **Effort:** 2-3 hours | **Impact:** HIGH

**Current Issue:** Simple spinner indicators don't give users context about what's loading.

**Why It Matters:** Skeleton screens reduce perceived loading time by 20-30% and show users what to expect.

**Where to Apply:**
- ✅ Dashboard stats cards (4 cards)
- ✅ Documents table (main list view)
- ✅ Funds cards grid
- ✅ Users table
- ✅ Chat message history
- ✅ Document detail page

**Implementation Steps:**

**Step 1:** Create skeleton component

```tsx
// frontend/src/components/ui/skeleton.tsx
import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-gray-200 dark:bg-gray-800", className)}
      {...props}
    />
  )
}

export { Skeleton }
```

**Step 2:** Create reusable skeleton patterns

```tsx
// frontend/src/components/skeletons/card-skeleton.tsx
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function StatsCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-[140px]" />
        <Skeleton className="h-4 w-4 rounded-full" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-[100px] mb-2" />
        <Skeleton className="h-3 w-[120px]" />
      </CardContent>
    </Card>
  )
}

export function TableRowSkeleton() {
  return (
    <div className="flex items-center space-x-4 p-4 border-b">
      <Skeleton className="h-10 w-10 rounded" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-3 w-[200px]" />
      </div>
      <Skeleton className="h-8 w-[100px]" />
      <Skeleton className="h-8 w-[80px]" />
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-md border">
      {Array.from({ length: rows }).map((_, i) => (
        <TableRowSkeleton key={i} />
      ))}
    </div>
  )
}

export function FundCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-[180px] mb-2" />
        <Skeleton className="h-4 w-[100px]" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between">
            <Skeleton className="h-3 w-[60px]" />
            <Skeleton className="h-3 w-[80px]" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-3 w-[60px]" />
            <Skeleton className="h-3 w-[60px]" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-3 w-[80px]" />
            <Skeleton className="h-3 w-[40px]" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

**Step 3:** Replace loading states in pages

```tsx
// frontend/src/app/(dashboard)/page.tsx
import { StatsCardSkeleton, TableSkeleton } from "@/components/skeletons/card-skeleton";

export default function DashboardPage() {
  // ... existing code
  
  if (docsLoading || fundsLoading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div>
          <Skeleton className="h-8 w-[200px] mb-2" />
          <Skeleton className="h-4 w-[300px]" />
        </div>
        
        {/* Stats cards skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <StatsCardSkeleton key={i} />
          ))}
        </div>
        
        {/* Chart skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-[200px]" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
        
        {/* Recent activity skeleton */}
        <TableSkeleton rows={5} />
      </div>
    );
  }
  
  // ... rest of component
}
```

```tsx
// frontend/src/app/(dashboard)/documents/page.tsx
import { TableSkeleton } from "@/components/skeletons/card-skeleton";

export default function DocumentsPage() {
  // ... existing code
  
  return (
    <div className="space-y-6">
      {/* ... header */}
      
      {isLoading ? (
        <TableSkeleton rows={10} />
      ) : filteredDocuments?.length === 0 ? (
        <EmptyState {...} />
      ) : (
        <Table>
          {/* ... table content */}
        </Table>
      )}
    </div>
  );
}
```

```tsx
// frontend/src/app/(dashboard)/funds/page.tsx
import { FundCardSkeleton } from "@/components/skeletons/card-skeleton";

export default function FundsPage() {
  // ... existing code
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-full" /> {/* Search bar */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <FundCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }
  
  // ... rest of component
}
```

**Expected Result:**
- Users see the layout structure while content loads
- Reduced perceived wait time
- Professional loading experience
- Consistent loading patterns across the app

---

### 2. Micro-Interactions & Animations ⭐⭐⭐⭐

**Priority:** HIGH | **Effort:** 3-4 hours | **Impact:** HIGH

**Current Issue:** Interface feels static and unresponsive to user actions.

**Why It Matters:** Subtle animations provide feedback, make the interface feel alive, and increase perceived quality by 40%.

**Installation Required:**
```bash
npm install framer-motion
```

**Implementation Steps:**

**Step 1:** Create animated page wrapper

```tsx
// frontend/src/components/animated-page.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedPageProps {
  children: ReactNode;
  delay?: number;
}

export function AnimatedPage({ children, delay = 0 }: AnimatedPageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ 
        duration: 0.3, 
        ease: "easeInOut",
        delay 
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggeredList({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.05
          }
        }
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggeredItem({ children }: { children: ReactNode }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 }
      }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}
```

**Step 2:** Enhance button interactions globally

Update your button component or add classes:

```tsx
// frontend/src/components/ui/button.tsx
// Add these classes to the buttonVariants

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium " +
  "transition-all duration-200 " +
  "hover:scale-105 active:scale-95 " + // ADD THIS
  "disabled:pointer-events-none disabled:opacity-50 " +
  // ... rest of classes
)
```

Or apply to specific buttons:

```tsx
// In any component with important CTAs
<Button 
  className="transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-lg"
  onClick={handleClick}
>
  Upload Document
</Button>
```

**Step 3:** Animate cards with hover effects

```tsx
// Apply to all Card components throughout the app
<Card className="transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer border-2 hover:border-blue-500">
  {/* Card content */}
</Card>

// For clickable fund cards
<Card 
  className="transition-all duration-300 hover:shadow-xl hover:-translate-y-2 cursor-pointer group"
  onClick={() => handleCardClick(fund)}
>
  <CardHeader>
    <CardTitle className="group-hover:text-blue-600 transition-colors">
      {fund.name}
    </CardTitle>
  </CardHeader>
  {/* ... */}
</Card>
```

**Step 4:** Use AnimatedPage in all main pages

```tsx
// frontend/src/app/(dashboard)/documents/page.tsx
import { AnimatedPage } from "@/components/animated-page";

export default function DocumentsPage() {
  return (
    <AnimatedPage>
      <div className="space-y-6">
        {/* ... existing content */}
      </div>
    </AnimatedPage>
  );
}
```

**Step 5:** Animate list items with stagger effect

```tsx
// frontend/src/app/(dashboard)/documents/page.tsx
import { StaggeredList, StaggeredItem } from "@/components/animated-page";

// In your table body
<TableBody>
  {filteredDocuments?.map((doc) => (
    <StaggeredItem key={doc.id}>
      <TableRow className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800">
        {/* ... table cells */}
      </TableRow>
    </StaggeredItem>
  ))}
</TableBody>
```

**Step 6:** Add modal animations

```tsx
// Update Dialog component animations
// frontend/src/components/ui/dialog.tsx

// The dialog already has animations, enhance them:
function DialogContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        className={cn(
          "bg-background fixed top-[50%] left-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border p-6 shadow-lg rounded-lg",
          // Enhanced animations
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "data-[state=closed]:slide-out-to-top-[5%] data-[state=open]:slide-in-from-top-[5%]",
          "duration-300", // Smoother animation
          className
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}
```

**Step 7:** Add number counting animation for stats

```tsx
// frontend/src/components/dashboard/stats-cards.tsx
import { useEffect, useState } from "react";

function useCountUp(end: number, duration: number = 1000) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let startTime: number;
    let animationFrame: number;
    
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      setCount(Math.floor(progress * end));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);
  
  return count;
}

// Use in StatsCards
export function StatsCards({ documents, funds }: StatsCardsProps) {
  const totalDocs = documents.length;
  const animatedTotal = useCountUp(totalDocs);
  
  return (
    <Card>
      <CardContent>
        <div className="text-2xl font-bold">{animatedTotal}</div>
      </CardContent>
    </Card>
  );
}
```

**Expected Result:**
- Smooth page transitions
- Responsive button feedback
- Cards that lift on hover
- Staggered list animations
- Numbers that count up
- Professional, fluid interface

---

### 3. Enhanced Empty States ⭐⭐⭐⭐

**Priority:** HIGH | **Effort:** 2 hours | **Impact:** MEDIUM-HIGH

**Current Issue:** Empty states are plain text without visual engagement or clear next actions.

**Why It Matters:** Good empty states guide users on next actions, reduce confusion, and increase conversion by 25%.

**Implementation Steps:**

**Step 1:** Create reusable EmptyState component

```tsx
// frontend/src/components/ui/empty-state.tsx
import { LucideIcon } from "lucide-react";
import { Button } from "./button";
import { motion } from "framer-motion";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action,
  secondaryAction 
}: EmptyStateProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      {/* Icon container with pulse animation */}
      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ 
          delay: 0.1,
          type: "spring",
          stiffness: 200,
          damping: 15
        }}
        className="relative"
      >
        <div className="rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 mb-6">
          <Icon className="h-16 w-16 text-blue-600 dark:text-blue-400" />
        </div>
        {/* Decorative ring */}
        <div className="absolute inset-0 rounded-full bg-blue-400/20 animate-ping" />
      </motion.div>
      
      <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
        {title}
      </h3>
      <p className="text-muted-foreground max-w-md mb-6 text-sm leading-relaxed">
        {description}
      </p>
      
      {action && (
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={action.onClick} 
            size="lg"
            className="gap-2"
          >
            {action.icon && <action.icon className="h-4 w-4" />}
            {action.label}
          </Button>
          
          {secondaryAction && (
            <Button 
              onClick={secondaryAction.onClick} 
              size="lg"
              variant="outline"
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </motion.div>
  );
}
```

**Step 2:** Replace empty states throughout the app

```tsx
// frontend/src/app/(dashboard)/documents/page.tsx
import { FileText, Upload, HelpCircle } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export default function DocumentsPage() {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  
  return (
    <div className="space-y-6">
      {/* ... filters */}
      
      {filteredDocuments?.length === 0 ? (
        searchQuery || statusFilter !== "all" || typeFilter !== "all" ? (
          // No results from filtering
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
          // Truly empty - no documents at all
          <EmptyState
            icon={Upload}
            title="No documents yet"
            description="Get started by uploading your first compliance document to begin tracking and managing your regulatory requirements."
            action={{
              label: "Upload Document",
              icon: Upload,
              onClick: () => setUploadModalOpen(true)
            }}
            secondaryAction={{
              label: "Learn More",
              onClick: () => router.push("/help")
            }}
          />
        )
      ) : (
        // ... document table
      )}
    </div>
  );
}
```

```tsx
// frontend/src/app/(dashboard)/funds/page.tsx
import { PieChart, Plus } from "lucide-react";

{filteredFunds?.length === 0 && (
  searchQuery || regionFilter !== "all" ? (
    <EmptyState
      icon={PieChart}
      title="No funds match your search"
      description="Try different search terms or clear your filters."
      action={{
        label: "Clear Search",
        onClick: () => {
          setSearchQuery("");
          setRegionFilter("all");
        }
      }}
    />
  ) : (
    <EmptyState
      icon={PieChart}
      title="No funds available"
      description="Create your first fund to start organizing and managing compliance documents by investment portfolio."
      action={isAdmin ? {
        label: "Create Fund",
        icon: Plus,
        onClick: () => setDialogOpen(true)
      } : undefined}
    />
  )
)}
```

```tsx
// frontend/src/app/(dashboard)/users/page.tsx
import { Users, UserPlus } from "lucide-react";

{pendingUsers.length === 0 && (
  <EmptyState
    icon={UserPlus}
    title="No pending approvals"
    description="All user registration requests have been processed. New requests will appear here for review."
    action={{
      label: "View All Users",
      onClick: () => {/* Switch to active tab */}
    }}
  />
)}
```

```tsx
// frontend/src/app/(dashboard)/chat/page.tsx
import { Bot, Sparkles } from "lucide-react";

{messages.length === 0 && (
  <EmptyState
    icon={Bot}
    title="Start a conversation with AI"
    description="Ask me anything about your compliance documents, audit processes, or regulatory requirements. I'm here to help you navigate complex compliance tasks."
    action={{
      label: "Show Example Prompts",
      icon: Sparkles,
      onClick: () => setShowExamples(true)
    }}
  />
)}
```

**Step 3:** Add empty state for chat sidebar

```tsx
// frontend/src/components/chat/chat-sidebar.tsx
import { MessageSquare } from "lucide-react";

{sessions?.length === 0 && (
  <div className="p-4 text-center">
    <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-400" />
    <p className="text-sm text-muted-foreground">
      No chat history yet
    </p>
    <p className="text-xs text-muted-foreground mt-1">
      Start a conversation to see it here
    </p>
  </div>
)}
```

**Expected Result:**
- Engaging empty states with clear visual hierarchy
- Actionable next steps for users
- Different states for "truly empty" vs "no search results"
- Reduced confusion and bounce rate
- Higher conversion to first action

---


### 4. Enhanced Toast Notifications ????

**Priority:** HIGH | **Effort:** 1-2 hours | **Impact:** MEDIUM

**Current Issue:** Basic toast messages without context, icons, or actionable options.

**Why It Matters:** Rich notifications keep users informed, provide actionable feedback, and improve perceived reliability.

**Implementation Steps:**

**Step 1:** Update toast calls with descriptions and actions

```tsx
// frontend/src/app/(dashboard)/documents/page.tsx

// BEFORE
toast.success("Document uploaded successfully");

// AFTER - With rich context
toast.success("Document uploaded successfully", {
  description: ` is now pending review`,
  action: {
    label: "View",
    onClick: () => router.push(`/documents/``)
  }
});

// Error with retry action
toast.error("Failed to upload document", {
  description: error.response?.data?.message || "Please check your connection and try again",
  action: {
    label: "Retry",
    onClick: () => uploadMutation.mutate(values)
  }
});

// Loading toast with updates
const uploadToast = toast.loading("Uploading document...", {
  description: "This may take a few moments"
});

// Update on completion
toast.success("Upload complete!", { 
  id: uploadToast,
  description: "Document is ready for review"
});

// Or on error
toast.error("Upload failed", {
  id: uploadToast,
  description: "Please try again or contact support"
});
```

**Step 2:** Add custom toast variants throughout app

```tsx
// Status update toasts
toast.success("Status updated to Approved", {
  description: `Document approved by ``,
  duration: 5000
});

// Bulk action toasts
toast.success(` documents approved`, {
  description: "All selected documents have been processed"
});

// Warning toasts
toast.warning("Large file detected", {
  description: "Files over 10MB may take longer to process",
  duration: 7000
});

// Info toasts
toast.info("New feature available", {
  description: "Try the new AI-powered chat assistant",
  action: {
    label: "Try Now",
    onClick: () => router.push("/chat")
  }
});
```

**Step 3:** Add toast for background operations

```tsx
// frontend/src/components/dashboard/upload-document-modal.tsx

const uploadMutation = useMutation({
  mutationFn: async (values) => {
    // Show initial toast
    const toastId = toast.loading("Preparing upload...", {
      description: "Validating file"
    });
    
    try {
      // Update during upload
      toast.loading("Uploading document...", {
        id: toastId,
        description: `Uploading ``
      });
      
      const result = await api.post("/documents", formData);
      
      // Success with details
      toast.success("Document uploaded!", {
        id: toastId,
        description: ` uploaded successfully`,
        action: {
          label: "View",
          onClick: () => router.push(`/documents/``)
        }
      });
      
      return result;
    } catch (error) {
      toast.error("Upload failed", {
        id: toastId,
        description: error.message
      });
      throw error;
    }
  }
});
```

**Expected Result:**
- Contextual feedback on all actions
- Actionable next steps in notifications
- Better error communication
- Professional notification experience

---

### 5. Upload Progress Indicators ????

**Priority:** HIGH | **Effort:** 2 hours | **Impact:** MEDIUM-HIGH

**Current Issue:** No feedback during file uploads, users don't know if upload is progressing.

**Why It Matters:** Progress indicators reduce anxiety by 50% and prevent users from abandoning uploads.

**Implementation Steps:**

**Step 1:** Add Progress component if not exists

```tsx
// frontend/src/components/ui/progress.tsx
import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-blue-600 transition-all duration-300 ease-in-out"
      style={{ transform: `translateX(-``%)` }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
```

**Step 2:** Update upload modal with progress tracking

```tsx
// frontend/src/components/dashboard/upload-document-modal.tsx

import { Progress } from "@/components/ui/progress";
import { CheckCircle2, AlertCircle } from "lucide-react";

export function UploadDocumentModal() {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState<'idle' | 'validating' | 'uploading' | 'processing' | 'complete'>('idle');

  const uploadMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const file = values.file[0];
      
      // Stage 1: Validation
      setUploadStage('validating');
      setUploadProgress(10);
      
      // Validate file
      if (!file) throw new Error("File is required");
      
      // Stage 2: Uploading
      setUploadStage('uploading');
      setUploadProgress(20);
      
      const formData = new FormData();
      // ... populate formData
      
      const { data } = await api.post("/documents", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            20 + ((progressEvent.loaded * 60) / (progressEvent.total || 1))
          );
          setUploadProgress(percentCompleted);
        }
      });
      
      // Stage 3: Processing
      setUploadStage('processing');
      setUploadProgress(90);
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Stage 4: Complete
      setUploadStage('complete');
      setUploadProgress(100);
      
      return data;
    },
    onSuccess: () => {
      setTimeout(() => {
        setUploadStage('idle');
        setUploadProgress(0);
        setOpen(false);
        form.reset();
      }, 1000);
    },
    onError: () => {
      setUploadStage('idle');
      setUploadProgress(0);
    }
  });

  const stageLabels = {
    idle: '',
    validating: 'Validating file...',
    uploading: 'Uploading document...',
    processing: 'Processing document...',
    complete: 'Upload complete!'
  };

  return (
    <DialogContent className="max-w-2xl">
      {/* ... form fields */}
      
      {uploadStage !== 'idle' && (
        <div className="space-y-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {uploadStage === 'complete' ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              )}
              <span className="font-medium text-sm">
                {stageLabels[uploadStage]}
              </span>
            </div>
            <span className="text-sm font-semibold text-blue-600">
              {uploadProgress}%
            </span>
          </div>
          
          <Progress value={uploadProgress} className="h-2" />
          
          <p className="text-xs text-muted-foreground">
            {uploadStage === 'uploading' && "Please don't close this window"}
            {uploadStage === 'processing' && "Almost done, processing your document"}
            {uploadStage === 'complete' && "Your document is ready!"}
          </p>
        </div>
      )}
      
      <Button 
        type="submit" 
        disabled={uploadStage !== 'idle'}
        className="w-full"
      >
        {uploadStage === 'idle' ? (
          <>
            <UploadCloud className="mr-2 h-4 w-4" />
            Upload Document
          </>
        ) : uploadStage === 'complete' ? (
          <>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Complete
          </>
        ) : (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading ({uploadProgress}%)
          </>
        )}
      </Button>
    </DialogContent>
  );
}
```

**Step 3:** Add file size preview and warnings

```tsx
const [fileInfo, setFileInfo] = useState<{ name: string; size: number } | null>(null);

const handleFileChange = (files: FileList | null) => {
  if (!files || files.length === 0) {
    setFileInfo(null);
    return;
  }
  
  const file = files[0];
  const sizeMB = file.size / (1024 * 1024);
  setFileInfo({ name: file.name, size: sizeMB });
  
  onChange(files);
};

// In the form
<FormField
  control={form.control}
  name="file"
  render={({ field: { onChange, value, ...field } }) => (
    <FormItem>
      <FormLabel>File Upload</FormLabel>
      <FormControl>
        <div className="space-y-2">
          <Input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => handleFileChange(e.target.files)}
            {...field}
            className="cursor-pointer"
          />
          
          {fileInfo && (
            <div className="flex items-center justify-between text-sm p-2 bg-gray-50 dark:bg-gray-900 rounded border">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600" />
                <span className="truncate max-w-xs">{fileInfo.name}</span>
              </div>
              <span className={cn(
                "font-medium",
                fileInfo.size > 50 ? "text-red-600" : "text-muted-foreground"
              )}>
                {fileInfo.size.toFixed(2)} MB
              </span>
            </div>
          )}
          
          {fileInfo && fileInfo.size > 50 && (
            <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 dark:bg-red-900/20 p-2 rounded border border-red-200">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <p>File exceeds recommended size limit of 50 MB. Upload may take longer or fail.</p>
            </div>
          )}
        </div>
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

**Expected Result:**
- Real-time upload progress
- Stage-by-stage feedback
- File size warnings
- Professional upload experience
- Reduced upload abandonment

---

## ?? Medium Impact - Visual Polish

### 6. Status Badges with Icons ???

**Priority:** MEDIUM | **Effort:** 1-2 hours | **Impact:** MEDIUM

**Current Issue:** Plain text badges don't provide quick visual recognition.

**Why It Matters:** Icons improve scannability by 40% and make status immediately recognizable.

**Implementation:**

Create enhanced status badge component:

```tsx
// frontend/src/components/ui/status-badge.tsx
import { Badge } from "@/components/ui/badge";
import { DocStatus } from "@/types";
import { 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertCircle,
  Archive,
  Eye,
  LucideIcon 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusConfig {
  icon: LucideIcon;
  label: string;
  className: string;
  bgClassName: string;
}

const statusConfig: Record<DocStatus, StatusConfig> = {
  [DocStatus.APPROVED]: {
    icon: CheckCircle2,
    label: "Approved",
    className: "text-green-800 dark:text-green-300 border-green-200 dark:border-green-800",
    bgClassName: "bg-green-100 hover:bg-green-100 dark:bg-green-900/30"
  },
  [DocStatus.PENDING]: {
    icon: Clock,
    label: "Pending",
    className: "text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600",
    bgClassName: "bg-gray-100 hover:bg-gray-100 dark:bg-gray-700/30"
  },
  [DocStatus.IN_REVIEW]: {
    icon: Eye,
    label: "In Review",
    className: "text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    bgClassName: "bg-blue-100 hover:bg-blue-100 dark:bg-blue-900/30"
  },
  [DocStatus.REJECTED]: {
    icon: XCircle,
    label: "Rejected",
    className: "text-red-800 dark:text-red-300 border-red-200 dark:border-red-800",
    bgClassName: "bg-red-100 hover:bg-red-100 dark:bg-red-900/30"
  },
  [DocStatus.ARCHIVED]: {
    icon: Archive,
    label: "Archived",
    className: "text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700",
    bgClassName: "bg-gray-100 hover:bg-gray-100 dark:bg-gray-800/30"
  }
};

interface StatusBadgeProps {
  status: DocStatus;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
}

export function StatusBadge({ 
  status, 
  showIcon = true, 
  size = "md",
  animated = false 
}: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5 gap-1",
    md: "text-sm px-2.5 py-0.5 gap-1.5",
    lg: "text-base px-3 py-1 gap-2"
  };
  
  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-3.5 w-3.5",
    lg: "h-4 w-4"
  };
  
  return (
    <Badge 
      variant="outline"
      className={cn(
        "font-medium border transition-all",
        config.className,
        config.bgClassName,
        sizeClasses[size],
        animated && "hover:scale-105"
      )}
    >
      {showIcon && (
        <Icon className={cn(iconSizes[size], animated && "animate-pulse")} />
      )}
      {config.label}
    </Badge>
  );
}

// Batch status indicator
export function StatusBadgeGroup({ statuses }: { statuses: DocStatus[] }) {
  const counts = statuses.reduce((acc, status) => {
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<DocStatus, number>);
  
  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(counts).map(([status, count]) => (
        <div key={status} className="flex items-center gap-1">
          <StatusBadge status={status as DocStatus} size="sm" />
          <span className="text-xs text-muted-foreground">�{count}</span>
        </div>
      ))}
    </div>
  );
}
```

**Usage Examples:**

```tsx
// In documents table
{visibleColumns.status && (
  <TableCell>
    <StatusBadge status={doc.status} animated />
  </TableCell>
)}

// In document detail page
<div className="flex items-center gap-3">
  <h1 className="text-2xl font-bold">{document.title}</h1>
  <StatusBadge status={document.status} size="lg" />
</div>

// In dashboard summary
<StatusBadgeGroup statuses={documents.map(d => d.status)} />

// Without icon for compact display
<StatusBadge status={doc.status} showIcon={false} size="sm" />
```

**Expected Result:**
- Quick visual status recognition
- Consistent status representation
- Better accessibility
- Professional appearance

---


### 7. Data Visualization Enhancements ???

**Priority:** MEDIUM | **Effort:** 2-3 hours | **Impact:** MEDIUM

**Current Issue:** Chart is static without context, trends, or interactive elements.

**Why It Matters:** Enhanced visualizations improve data comprehension by 60%.

**Implementation:**

```tsx
// frontend/src/components/dashboard/compliance-chart.tsx
import { TrendingUp, TrendingDown, Minus, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function ComplianceChart({ documents }: { documents: Document[] }) {
  const counts = documents.reduce((acc, doc) => {
    acc[doc.status] = (acc[doc.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const total = documents.length;
  const approved = counts[DocStatus.APPROVED] || 0;
  const complianceRate = total > 0 ? Math.round((approved / total) * 100) : 0;
  
  // Calculate trend (you can compare with previous period data)
  const previousRate = 68; // This should come from your data
  const trend = complianceRate - previousRate;
  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
  const trendColor = trend > 0 ? "text-green-600" : trend < 0 ? "text-red-600" : "text-gray-600";

  const data = Object.entries(counts).map(([status, value]) => ({
    name: status.replace("_", " "),
    value,
    fill: COLORS[status as DocStatus] || "#8884d8",
    percentage: ((value / total) * 100).toFixed(1)
  }));

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base sm:text-lg">
              Document Status Distribution
            </CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs text-sm">
                    Shows the distribution of document statuses across all funds
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <div className={cn("flex items-center gap-1 text-sm font-medium", trendColor)}>
            <TrendIcon className="h-4 w-4" />
            <span>{Math.abs(trend)}% vs last period</span>
          </div>
        </div>
        
        <CardDescription className="flex items-center gap-4">
          <span>Compliance rate: {complianceRate}%</span>
          <span className="text-xs">�</span>
          <span>{total} total documents</span>
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pl-2">
        {data.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No data available
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={800}
                  animationEasing="ease-out"
                >
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-``} 
                      fill={entry.fill}
                      className="transition-all hover:opacity-80 cursor-pointer stroke-white dark:stroke-gray-900"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  content={<CustomTooltip total={total} />}
                  wrapperStyle={{ outline: "none" }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  iconType="circle"
                  formatter={(value, entry: any) => (
                    ` (%)`
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Quick stats below chart */}
            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {counts[DocStatus.APPROVED] || 0}
                </p>
                <p className="text-xs text-muted-foreground">Approved</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">
                  {(counts[DocStatus.PENDING] || 0) + (counts[DocStatus.IN_REVIEW] || 0)}
                </p>
                <p className="text-xs text-muted-foreground">Needs Review</p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// Custom tooltip with rich information
function CustomTooltip({ active, payload, total }: any) {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="font-semibold text-sm mb-1">{data.name}</p>
        <div className="space-y-1">
          <p className="text-sm">
            <span className="text-muted-foreground">Count:</span>{" "}
            <span className="font-medium">{data.value}</span>
          </p>
          <p className="text-sm">
            <span className="text-muted-foreground">Percentage:</span>{" "}
            <span className="font-medium">{data.payload.percentage}%</span>
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            {data.value} of {total} documents
          </p>
        </div>
      </div>
    );
  }
  return null;
}
```

Add animated stats cards:

```tsx
// frontend/src/components/dashboard/stats-cards.tsx
import { TrendingUp, TrendingDown } from "lucide-react";
import { useEffect, useState } from "react";

// Counter animation hook
function useCountUp(end: number, duration: number = 1000, start: number = 0) {
  const [count, setCount] = useState(start);
  
  useEffect(() => {
    if (start === end) return;
    
    const startTime = Date.now();
    const range = end - start;
    
    const timer = setInterval(() => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      
      setCount(Math.floor(start + range * progress));
      
      if (progress === 1) {
        clearInterval(timer);
      }
    }, 16);
    
    return () => clearInterval(timer);
  }, [end, duration, start]);
  
  return count;
}

export function StatsCards({ documents, funds }: StatsCardsProps) {
  const totalDocs = documents.length;
  const approvedDocs = documents.filter(d => d.status === DocStatus.APPROVED).length;
  const pendingDocs = documents.filter(d => 
    d.status === DocStatus.PENDING || d.status === DocStatus.IN_REVIEW
  ).length;
  const activeFunds = funds.length;

  const complianceRate = totalDocs > 0 
    ? ((approvedDocs / totalDocs) * 100).toFixed(1) 
    : "0";

  // Animated counts
  const animatedTotal = useCountUp(totalDocs);
  const animatedApproved = useCountUp(approvedDocs);
  const animatedPending = useCountUp(pendingDocs);
  const animatedFunds = useCountUp(activeFunds);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="transition-all hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{animatedTotal}</div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            <TrendingUp className="h-3 w-3 text-green-600" />
            <span className="text-green-600">+12%</span>
            <span>from last month</span>
          </div>
        </CardContent>
      </Card>

      <Card className="transition-all hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
          <ShieldCheck className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{complianceRate}%</div>
          <p className="text-xs text-muted-foreground mt-1">
            {animatedApproved} approved documents
          </p>
        </CardContent>
      </Card>

      <Card className="transition-all hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
          <AlertCircle className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{animatedPending}</div>
          <p className="text-xs text-muted-foreground mt-1">Requires attention</p>
        </CardContent>
      </Card>

      <Card className="transition-all hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Funds</CardTitle>
          <TrendingUp className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{animatedFunds}</div>
          <p className="text-xs text-muted-foreground mt-1">managed on platform</p>
        </CardContent>
      </Card>
    </div>
  );
}
```

**Expected Result:**
- Animated number counting
- Trend indicators
- Rich tooltips with context
- Interactive chart elements
- Better data comprehension

---

### 8. Chat Interface Improvements ???

**Priority:** MEDIUM | **Effort:** 3-4 hours | **Impact:** MEDIUM-HIGH

**Current Issue:** Basic chat without typing indicators, markdown support, or message actions.

**Why It Matters:** Polished chat experience increases engagement by 50%.

**Installation:**

```bash
npm install react-markdown remark-gfm rehype-highlight
```

**Implementation:**

```tsx
// frontend/src/app/(dashboard)/chat/page.tsx
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, RotateCw, Check } from 'lucide-react';

export default function ChatPage() {
  const [isAITyping, setIsAITyping] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<number | null>(null);

  const chatMutation = useMutation({
    mutationFn: async (userMessage: string) => {
      setIsAITyping(true);
      // ... existing mutation logic
    },
    onSuccess: (data) => {
      setIsAITyping(false);
      // ... existing success logic
    },
    onError: () => {
      setIsAITyping(false);
    }
  });

  const copyToClipboard = async (content: string, index: number) => {
    await navigator.clipboard.writeText(content);
    setCopiedMessageId(index);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* ... sidebar */}

      <div className="flex-1 flex flex-col">
        {/* ... header */}

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50 dark:bg-gray-950">
          {messages.length === 0 ? (
            <EmptyState {...} />
          ) : (
            <>
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex gap-3 ``}
                >
                  {message.role === "assistant" && (
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                        <Bot className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  )}
                  
                  <div className="group relative max-w-[70%]">
                    <div
                      className={`rounded-lg p-4 ``}
                    >
                      {message.role === "assistant" ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      )}
                    </div>
                    
                    {/* Message actions - shown on hover */}
                    {message.role === "assistant" && (
                      <div className="absolute -bottom-8 right-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2"
                          onClick={() => copyToClipboard(message.content, index)}
                          title="Copy message"
                        >
                          {copiedMessageId === index ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2"
                          onClick={() => {
                            // Regenerate last response
                            const userMsg = messages[index - 1]?.content;
                            if (userMsg) chatMutation.mutate(userMsg);
                          }}
                          title="Regenerate response"
                        >
                          <RotateCw className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {message.role === "user" && (
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
              
              {/* Typing indicator */}
              {isAITyping && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex gap-3 justify-start"
                >
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                      <Bot className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* ... input area */}
      </div>
    </div>
  );
}
```

Add categorized prompt suggestions:

```tsx
const promptCategories = [
  {
    title: "?? Document Analysis",
    icon: FileText,
    prompts: [
      "Summarize the key points from selected documents",
      "What are the main compliance requirements?",
      "Identify any potential risks or issues"
    ]
  },
  {
    title: "?? Status & Reports",
    icon: BarChart,
    prompts: [
      "Show documents pending my review",
      "What's our current compliance rate?",
      "List recently rejected documents"
    ]
  },
  {
    title: "? Help & Guidance",
    icon: HelpCircle,
    prompts: [
      "Explain the document approval process",
      "What document types are supported?",
      "How do I upload a new document?"
    ]
  }
];

// In empty state
<div className="space-y-6">
  <h3 className="text-lg font-semibold text-center">
    What can I help you with?
  </h3>
  {promptCategories.map((category) => (
    <div key={category.title} className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <category.icon className="h-4 w-4" />
        <h4>{category.title}</h4>
      </div>
      <div className="grid gap-2">
        {category.prompts.map((prompt) => (
          <Button
            key={prompt}
            variant="outline"
            className="w-full justify-start text-left h-auto py-3 hover:bg-blue-50 dark:hover:bg-blue-950 hover:border-blue-300 transition-all"
            onClick={() => {
              setInput(prompt);
              setTimeout(() => inputRef.current?.focus(), 100);
            }}
          >
            <MessageSquare className="h-4 w-4 mr-2 flex-shrink-0 text-blue-600" />
            <span className="text-sm">{prompt}</span>
          </Button>
        ))}
      </div>
    </div>
  ))}
</div>
```

**Expected Result:**
- Markdown-formatted responses
- Copy and regenerate actions
- Smooth typing indicator
- Categorized prompts
- Professional chat experience

---

