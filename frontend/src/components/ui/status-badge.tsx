import { Badge } from "@/components/ui/badge";
import { DocStatus } from "@/types";
import { memo } from "react";
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

export const StatusBadge = memo(function StatusBadge({ 
  status, 
  showIcon = true, 
  size = "md",
  animated = false 
}: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig[DocStatus.PENDING];
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
        <Icon className={cn(iconSizes[size])} />
      )}
      {config.label}
    </Badge>
  );
});
