import {
  ArrowRight,
  Brain,
  Lightbulb,
  RotateCcw,
  Target,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { PriceOverview } from '@/components/price-overview'
import { NegotiationLeverage } from '@/components/negotiation-leverage'
import { SuggestedMessage } from '@/components/suggested-message'
import { type NegotiationResult } from '@/lib/negotiation'

function formatTactic(tactic: NegotiationResult['tactic']) {
  const labels: Record<NegotiationResult['tactic'], string> = {
    anchor: 'Anchoring',
    'ask-first': 'Ask First',
    'interest-based': 'Interest-Based',
    'immediate-close': 'Immediate Close',
    'counter-offer': 'Counter Offer',
    'walk-away': 'Walk Away',
    'no-negotiation': 'No Negotiation',
  }

  return labels[tactic]
}

function getTacticDescription(
  tactic: NegotiationResult['tactic'],
) {
  const descriptions: Record<
    NegotiationResult['tactic'],
    string
  > = {
    anchor:
      'Set a credible first offer to influence the direction of the negotiation.',
    'ask-first':
      'Gather more information before committing to a specific price.',
    'interest-based':
      'Use factors beyond price to create value for both sides.',
    'immediate-close':
      'Use transaction certainty and immediate payment as bargaining value.',
    'counter-offer':
      'Respond strategically to the seller instead of immediately accepting their counter.',
    'walk-away':
      'Protect your reservation point and be prepared to leave if the deal no longer makes sense.',
    'no-negotiation':
      'The current price does not require aggressive bargaining. Focus on closing or asking for additional value.',
  }

  return descriptions[tactic]
}

export function AnalysisResult({
  result,
  onReset,
  onRegenerate,
}: {
  result: NegotiationResult
  onReset: () => void
  onRegenerate: () => void
}) {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium tracking-[0.12em] text-primary">
            YOUR NEGOTIATION ANALYSIS
          </p>

          <h2 className="mt-1.5 text-2xl font-semibold tracking-tight text-balance">
            Here&apos;s your negotiation strategy
          </h2>
        </div>

        <Button
          variant="outline"
          size="lg"
          className="h-9"
          onClick={onReset}
        >
          <RotateCcw data-icon="inline-start" />
          Analyze another deal
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        {/* Price analysis */}
        <PriceOverview result={result} />

        {/* Negotiation leverage */}
        <NegotiationLeverage result={result} />

        {/* -------------------------------------------------------------- */}
        {/* Recommended tactic                                             */}
        {/* -------------------------------------------------------------- */}

        <section className="rounded-2xl border bg-background p-6">
          <div className="flex items-start gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Target className="size-5" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-muted-foreground">
                Recommended tactic
              </p>

              <h3 className="mt-1 text-xl font-semibold">
                {formatTactic(result.tactic)}
              </h3>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {getTacticDescription(result.tactic)}
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-xl bg-muted/50 p-4">
            <div className="flex items-center gap-2">
              <Brain className="size-4 text-primary" />

              <p className="text-sm font-medium">
                Why this tactic?
              </p>
            </div>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {result.reasoning}
            </p>
          </div>
        </section>

        {/* -------------------------------------------------------------- */}
        {/* AI Strategy                                                    */}
        {/* -------------------------------------------------------------- */}

        <section className="rounded-2xl border bg-background p-6">
          <div className="flex items-start gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Lightbulb className="size-5" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-muted-foreground">
                AI Strategy
              </p>

              <p className="mt-2 text-[15px] leading-7 text-foreground">
                {result.strategy}
              </p>
            </div>
          </div>
        </section>

        {/* -------------------------------------------------------------- */}
        {/* Next move                                                      */}
        {/* -------------------------------------------------------------- */}

        <section className="rounded-2xl border bg-background p-6">
          <div className="flex items-start gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ArrowRight className="size-5" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-muted-foreground">
                Your next move
              </p>

              <p className="mt-2 text-[15px] leading-7 text-foreground">
                {result.nextMove}
              </p>
            </div>
          </div>
        </section>

        {/* Suggested message */}
        <SuggestedMessage
          result={result}
          onRegenerate={onRegenerate}
        />
      </div>
    </div>
  )
}