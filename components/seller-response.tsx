'use client'

import { Loader2, MessageSquareText, Send } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from './ui/textarea'
// import { Textarea } from '@/components/ui/textarea'

export function SellerResponse({
  loading,
  onAnalyze,
}: {
  loading: boolean
  onAnalyze: (response: string) => void
}) {
  const [sellerResponse, setSellerResponse] = useState('')

  function handleSubmit() {
    const value = sellerResponse.trim()

    if (!value || loading) {
      return
    }

    onAnalyze(value)
  }

  return (
    <section className="rounded-2xl border bg-background p-6">
      <div className="flex items-start gap-4">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <MessageSquareText className="size-5" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-muted-foreground">
            Seller responded?
          </p>

          <h3 className="mt-1 text-xl font-semibold">
            Let AI analyze their response
          </h3>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Paste the seller&apos;s latest message and NegotiAI
            will determine your next move.
          </p>
        </div>
      </div>

      <div className="mt-5">
        <Textarea
          value={sellerResponse}
          onChange={(event) =>
            setSellerResponse(event.target.value)
          }
          placeholder='Example: "Maaf kak, Rp7,3 juta belum bisa. Paling Rp7,8 juta."'
          className="min-h-28 resize-none"
          disabled={loading}
        />
      </div>

      <div className="mt-4 flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={!sellerResponse.trim() || loading}
        >
          {loading ? (
            <>
              <Loader2
                data-icon="inline-start"
                className="animate-spin"
              />
              Analyzing response...
            </>
          ) : (
            <>
              <Send data-icon="inline-start" />
              Analyze seller response
            </>
          )}
        </Button>
      </div>
    </section>
  )
}