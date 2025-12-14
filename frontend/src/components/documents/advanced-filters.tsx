"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Filter, CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { DocStatus, DocType } from "@/types";

export interface AdvancedFilters {
  searchQuery: string;
  status: string[];
  type: string[];
  fundIds: string[];
  dateFrom?: Date;
  dateTo?: Date;
  uploadedBy?: string;
}

interface AdvancedFiltersProps {
  filters: AdvancedFilters;
  onFiltersChange: (filters: AdvancedFilters) => void;
  funds?: any[];
  users?: any[];
}

export function AdvancedFiltersPanel({
  filters,
  onFiltersChange,
  funds = [],
  users = [],
}: AdvancedFiltersProps) {
  const [open, setOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<AdvancedFilters>(filters);

  const handleApply = () => {
    onFiltersChange(localFilters);
    setOpen(false);
  };

  const handleReset = () => {
    const resetFilters: AdvancedFilters = {
      searchQuery: "",
      status: [],
      type: [],
      fundIds: [],
      dateFrom: undefined,
      dateTo: undefined,
      uploadedBy: undefined,
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  const hasActiveFilters = 
    localFilters.status.length > 0 ||
    localFilters.type.length > 0 ||
    localFilters.fundIds.length > 0 ||
    localFilters.dateFrom ||
    localFilters.dateTo ||
    localFilters.uploadedBy;

  const toggleArrayFilter = (key: keyof AdvancedFilters, value: string) => {
    const current = localFilters[key] as string[];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    setLocalFilters({ ...localFilters, [key]: updated });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 relative">
          <Filter className="h-4 w-4" />
          <span className="hidden sm:inline">Advanced Filters</span>
          {hasActiveFilters && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">
              {localFilters.status.length + localFilters.type.length + localFilters.fundIds.length}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto w-full sm:max-w-md">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-lg">Advanced Filters</SheetTitle>
          <SheetDescription className="text-xs">
            Narrow down your document search with multiple criteria
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 py-4">
          {/* Full-text Search */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Search in all fields</Label>
            <Input
              placeholder="Search title, description, file name..."
              value={localFilters.searchQuery}
              onChange={(e) =>
                setLocalFilters({ ...localFilters, searchQuery: e.target.value })
              }
              className="h-9 text-sm"
            />
          </div>

          {/* Status Filter */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Status</Label>
            <div className="grid grid-cols-2 gap-1.5">
              {Object.values(DocStatus).map((status) => (
                <Button
                  key={status}
                  type="button"
                  variant={
                    localFilters.status.includes(status) ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => toggleArrayFilter("status", status)}
                  className="justify-start h-8 text-xs px-2 border-gray-200 dark:border-gray-700"
                >
                  {status.replace("_", " ")}
                </Button>
              ))}
            </div>
          </div>

          {/* Type Filter */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Document Type</Label>
            <div className="grid grid-cols-2 gap-1.5">
              {Object.values(DocType).map((type) => (
                <Button
                  key={type}
                  type="button"
                  variant={
                    localFilters.type.includes(type) ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => toggleArrayFilter("type", type)}
                  className="justify-start h-8 text-xs px-2 border-gray-200 dark:border-gray-700"
                >
                  {type.replace("_", " ")}
                </Button>
              ))}
            </div>
          </div>

          {/* Fund Filter */}
          {funds.length > 0 && (
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Funds</Label>
              <div className="space-y-1 max-h-32 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-md p-1.5">
                {funds.map((fund) => (
                  <Button
                    key={fund.id}
                    type="button"
                    variant={
                      localFilters.fundIds.includes(fund.id) ? "default" : "ghost"
                    }
                    size="sm"
                    onClick={() => toggleArrayFilter("fundIds", fund.id)}
                    className="w-full justify-start h-7 text-xs px-2"
                  >
                    {fund.name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Date Range */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Date Range</Label>
            <div className="grid grid-cols-2 gap-1.5">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "justify-start text-left font-normal h-9 text-xs px-2 border-gray-200 dark:border-gray-700",
                      !localFilters.dateFrom && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
                    {localFilters.dateFrom ? (
                      format(localFilters.dateFrom, "PP")
                    ) : (
                      <span>From</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={localFilters.dateFrom}
                    onSelect={(date) =>
                      setLocalFilters({ ...localFilters, dateFrom: date })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "justify-start text-left font-normal h-9 text-xs px-2 border-gray-200 dark:border-gray-700",
                      !localFilters.dateTo && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
                    {localFilters.dateTo ? (
                      format(localFilters.dateTo, "PP")
                    ) : (
                      <span>To</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={localFilters.dateTo}
                    onSelect={(date) =>
                      setLocalFilters({ ...localFilters, dateTo: date })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        <SheetFooter className="flex gap-2 pt-4">
          <Button variant="outline" onClick={handleReset} size="sm" className="flex-1 h-9 text-xs">
            <X className="mr-1.5 h-3.5 w-3.5" />
            Clear All
          </Button>
          <Button onClick={handleApply} size="sm" className="flex-1 h-9 text-xs">
            Apply Filters
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
