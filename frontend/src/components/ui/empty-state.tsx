"use client";

import { LucideIcon } from "lucide-react";
import { Button } from "./button";

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
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="relative">
        <div className="rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 mb-6">
          <Icon className="h-16 w-16 text-blue-600 dark:text-blue-400" />
        </div>
      </div>
      
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
    </div>
  );
}
