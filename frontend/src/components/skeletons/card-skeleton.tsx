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
