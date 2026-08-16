'use client'

import { useEffect, useState } from 'react'
import { Check, Copy, MessageSquareQuote, RefreshCw } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { type NegotiationResult } from '@/lib/negotiation'

export function SuggestedMessage({
  result,
  onRegenerate,
}: {
  result: NegotiationResult
  onRegenerate: () => void
}) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const t = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(t)
  }, [copied])

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(result.suggestedMessage)
      setCopied(true)
    } catch {
      // Clipboard unavailable — silently ignore.
    }
  }

  return (
    <Card className="bg-card ring-primary/15">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-md bg-primary/10 text-primary">
            <MessageSquareQuote className="size-3.5" />
          </span>
          Suggested message
        </CardTitle>
        <CardDescription>Ready to send</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <figure className="rounded-lg border-l-2 border-primary/40 bg-muted/50 px-4 py-3.5">
          <blockquote className="text-pretty text-[0.95rem] leading-relaxed text-foreground/90">
            &ldquo;{result.suggestedMessage}&rdquo;
          </blockquote>
        </figure>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            onClick={handleCopy}
            size="lg"
            className="h-10"
            aria-live="polite"
          >
            {copied ? (
              <Check data-icon="inline-start" />
            ) : (
              <Copy data-icon="inline-start" />
            )}
            {copied ? 'Copied' : 'Copy message'}
          </Button>
          <Button
            onClick={onRegenerate}
            variant="outline"
            size="lg"
            className="h-10"
          >
            <RefreshCw data-icon="inline-start" />
            Generate another
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
