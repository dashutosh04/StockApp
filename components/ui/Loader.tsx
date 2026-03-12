import { Skeleton } from '@/components/ui/skeleton'

export function CardSkeleton() {
  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-32 bg-white/5" />
        <Skeleton className="h-6 w-16 bg-white/5" />
      </div>
      <Skeleton className="h-10 w-48 bg-white/5" />
      <Skeleton className="h-4 w-full bg-white/5" />
      <Skeleton className="h-4 w-3/4 bg-white/5" />
    </div>
  )
}

export function ChartSkeleton() {
  return (
    <div className="glass rounded-2xl p-6">
      <Skeleton className="h-6 w-40 bg-white/5 mb-6" />
      <Skeleton className="h-64 w-full bg-white/5 rounded-xl" />
    </div>
  )
}

export default function Loader({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      <div className="relative">
        <div className="w-10 h-10 border-2 border-primary/20
                        rounded-full" />
        <div className="absolute inset-0 w-10 h-10 border-2
                        border-primary border-t-transparent
                        rounded-full animate-spin" />
      </div>
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  )
}