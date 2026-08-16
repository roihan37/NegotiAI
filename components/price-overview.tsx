import { ArrowDownRight, Target, ShieldCheck } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { formatRupiah, type NegotiationResult } from '@/lib/negotiation'

interface PriceCardProps {
  label: string
  value: number
  helper: string
  icon: React.ReactNode
  highlight?: boolean
}

function PriceCard({ label, value, helper, icon, highlight }: PriceCardProps) {
  return (
    <Card
      className={cn(
        'gap-0 p-5 transition-shadow',
        highlight
          ? 'bg-accent/50 ring-primary/25'
          : 'hover:ring-foreground/15',
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">
          {label}
        </span>
        <span
          className={cn(
            'flex size-7 items-center justify-center rounded-md',
            highlight
              ? 'bg-primary/10 text-primary'
              : 'bg-muted text-muted-foreground',
          )}
        >
          {icon}
        </span>
      </div>
      <p className="mt-3 font-mono text-2xl font-semibold tracking-tight tabular-nums">
        {formatRupiah(value)}
      </p>
      <p
        className={cn(
          'mt-1 text-xs',
          highlight ? 'text-primary/80' : 'text-muted-foreground',
        )}
      >
        {helper}
      </p>
    </Card>
  )
}

export function PriceOverview({ result }: { result: NegotiationResult }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <PriceCard
        label="Opening price"
        value={result.openingPrice}
        helper="Where to start"
        icon={<ArrowDownRight className="size-4" />}
      />
      <PriceCard
        label="Target price"
        value={result.targetPrice}
        helper="Your ideal outcome"
        icon={<Target className="size-4" />}
      />
      <PriceCard
        label="Maximum"
        value={result.maximumPrice}
        helper="Don't exceed your budget"
        icon={<ShieldCheck className="size-4" />}
        highlight
      />
    </div>
  )
}
