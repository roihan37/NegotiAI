import { Sparkles, TrendingDown, Shuffle, ShieldCheck } from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { type NegotiationResult } from '@/lib/negotiation'

const points = [
  {
    icon: TrendingDown,
    title: 'Start low',
    text: 'Leave room for a counter offer.',
  },
  {
    icon: Shuffle,
    title: 'Stay flexible',
    text: 'Move gradually toward your target.',
  },
  {
    icon: ShieldCheck,
    title: 'Know your limit',
    text: "Don't exceed your stated budget.",
  },
]

export function StrategyCard({ result }: { result: NegotiationResult }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Sparkles className="size-3.5" />
          </span>
          AI Strategy
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <p className="text-sm leading-relaxed text-foreground/90">
          {result.strategy}
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {points.map((point) => (
            <div
              key={point.title}
              className="rounded-lg bg-muted/60 p-3.5"
            >
              <point.icon className="size-4 text-primary" />
              <p className="mt-2 text-sm font-medium">{point.title}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                {point.text}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
