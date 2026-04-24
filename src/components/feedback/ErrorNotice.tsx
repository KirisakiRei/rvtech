import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

type ErrorNoticeProps = {
  message: string
  className?: string
}

export function ErrorNotice({ message, className }: ErrorNoticeProps) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive',
        className,
      )}
      role="alert"
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <p>{message}</p>
    </div>
  )
}
