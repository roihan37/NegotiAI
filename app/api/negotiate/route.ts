import { NextRequest, NextResponse } from 'next/server'
import { analyzeNegotiationWithGemini } from '@/lib/gemini'
import type { DealInput, NegotiationResult } from '@/lib/negotiation'

export const runtime = 'nodejs'

/**
 * POST /api/negotiate
 * Analyzes a deal using Gemini API
 */
export async function POST(request: NextRequest) {
  try {
    // Validate API key exists
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 },
      )
    }

    // Parse request body
    const body = (await request.json()) as DealInput

    // Validate input
    const validation = validateDealInput(body)
    if (!validation.valid) {
      return NextResponse.json(
        { error: `Invalid input: ${validation.error}` },
        { status: 400 },
      )
    }

    // Analyze with Gemini
    const result = await analyzeNegotiationWithGemini(body)

    // Return result
    return NextResponse.json(result)
  } catch (error) {
    console.error('API error:', error)

    const message =
      error instanceof Error ? error.message : 'Internal server error'

    return NextResponse.json(
      { error: message },
      { status: 500 },
    )
  }
}

/**
 * Validate DealInput structure and values
 */
function validateDealInput(
  input: any,
): { valid: boolean; error?: string } {
  if (!input || typeof input !== 'object') {
    return { valid: false, error: 'Request body must be an object' }
  }

  const required = ['productName', 'sellerPrice', 'budget', 'condition', 'platform']
  for (const field of required) {
    if (!(field in input)) {
      return { valid: false, error: `Missing field: ${field}` }
    }
  }

  if (typeof input.productName !== 'string' || !input.productName.trim()) {
    return { valid: false, error: 'productName must be a non-empty string' }
  }

  if (typeof input.sellerPrice !== 'number' || input.sellerPrice < 0) {
    return { valid: false, error: 'sellerPrice must be a non-negative number' }
  }

  if (typeof input.budget !== 'number' || input.budget < 0) {
    return { valid: false, error: 'budget must be a non-negative number' }
  }

  const validConditions = ['new', 'like-new', 'good', 'fair', 'poor']
  if (!validConditions.includes(input.condition)) {
    return {
      valid: false,
      error: `condition must be one of: ${validConditions.join(', ')}`,
    }
  }

  const validPlatforms = [
    'marketplace',
    'whatsapp',
    'instagram',
    'facebook',
    'offline',
    'other',
  ]
  if (!validPlatforms.includes(input.platform)) {
    return {
      valid: false,
      error: `platform must be one of: ${validPlatforms.join(', ')}`,
    }
  }

  return { valid: true }
}
