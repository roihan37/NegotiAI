import { Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export function Hero() {
  return (
    <section className="mx-auto max-w-3xl px-4 pt-16 pb-10 text-center sm:px-6 sm:pt-24 sm:pb-14">
      <Badge
        variant="secondary"
        className="mb-6 gap-1.5 rounded-full border border-border/70 bg-card px-3 py-1 font-normal text-muted-foreground"
      >
        <Sparkles className="size-3.5 text-primary" />
        AI-Powered Negotiation Assistant
      </Badge>

      <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
        Negotiate smarter.
        <br />
        Pay what feels right.
      </h1>

      <p className="mx-auto mt-5 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
        Tell us about the deal. NegotiAI analyzes your budget and the
        seller&apos;s price to help you decide what to offer and what to say.
      </p>

      <div className="mt-8 flex flex-col items-center gap-2">
        <Button
          render={<a href="#deal-form" />}
          nativeButton={false}
          size="lg"
          className="h-11 px-6 text-sm"
        >
          Start Negotiating
        </Button>
        <span className="text-xs text-muted-foreground">
          No account required
        </span>
      </div>
    </section>
  )
}
