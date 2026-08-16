import { Info } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { leverageMeta, type NegotiationResult } from '@/lib/negotiation'

export function NegotiationLeverage({
  result,
}: {
  result: NegotiationResult
}) {
  const meta = leverageMeta[result.leverage]

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Negotiation leverage</CardTitle>
        <Badge variant="secondary" className="capitalize">
          {meta.label}
        </Badge>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Progress value={meta.value} aria-label={`Leverage: ${meta.label}`} />
        <p className="text-sm leading-relaxed text-muted-foreground">
          {meta.description}
        </p>
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Info className="size-3.5 shrink-0" />
          AI-estimated based on your inputs, not a verified market price.
        </p>
      </CardContent>
    </Card>
  )
}
