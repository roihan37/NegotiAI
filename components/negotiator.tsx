'use client'

import { useRef, useState } from 'react'
import { DealForm } from '@/components/deal-form'
import { ResultSkeleton } from '@/components/result-skeleton'
import { AnalysisResult } from '@/components/analysis-result'
import {
  type DealInput,
  type NegotiationResult,
} from '@/lib/negotiation'

export function Negotiator() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<NegotiationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const lastInput = useRef<DealInput | null>(null)
  const resultRef = useRef<HTMLDivElement>(null)

  async function runAnalysis(input: DealInput) {
    lastInput.current = input
    setLoading(true)
    setResult(null)
    setError(null)

    try {
      const response = await fetch('/api/negotiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `API error: ${response.status}`)
      }

      const result = (await response.json()) as NegotiationResult
      setResult(result)

      // Scroll to results
      window.setTimeout(() => {
        resultRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
      }, 80)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to analyze deal'
      setError(message)
      console.error('Analysis error:', err)
    } finally {
      setLoading(false)
    }
  }

  function handleRegenerate() {
    if (lastInput.current) {
      runAnalysis(lastInput.current)
    }
  }

  function handleReset() {
    setResult(null)
    setError(null)
    lastInput.current = null
    document
      .getElementById('deal-form')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section
      id="deal-form"
      className="mx-auto max-w-3xl scroll-mt-20 px-4 pb-16 sm:px-6"
    >
      <DealForm loading={loading} onAnalyze={(input) => runAnalysis(input)} />

      {error && (
        <div className="mt-8 rounded-lg bg-red-50 p-4 text-red-800">
          <p className="font-semibold">Error analyzing deal</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={handleReset}
            className="mt-2 text-sm font-medium text-red-600 hover:text-red-700"
          >
            Try again
          </button>
        </div>
      )}

      {(loading || result) && !error && (
        <div ref={resultRef} className="mt-8 scroll-mt-20">
          <div
            className="mb-8 h-px bg-gradient-to-r from-transparent via-border to-transparent"
            aria-hidden
          />
          {loading ? (
            <ResultSkeleton />
          ) : result ? (
            <AnalysisResult
              result={result}
              onReset={handleReset}
              onRegenerate={handleRegenerate}
            />
          ) : null}
        </div>
      )}
    </section>
  )
}
