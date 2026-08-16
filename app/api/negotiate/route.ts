import { NextRequest, NextResponse } from 'next/server'

import {
  analyzeNegotiationWithGemini,
  analyzeCounterOfferWithGemini,
} from '@/lib/gemini'

import type {
  DealInput,
  NegotiationResult,
  CounterOfferInput,
} from '@/lib/negotiation'

export const runtime = 'nodejs'

/**
 * POST /api/negotiate
 *
 * Handles:
 *
 * 1. Initial negotiation analysis
 *    {
 *      productName,
 *      sellerPrice,
 *      budget,
 *      condition,
 *      platform,
 *      ...
 *    }
 *
 * 2. Seller counter-offer analysis
 *    {
 *      deal,
 *      previousResult,
 *      sellerResponse
 *    }
 */
export async function POST(request: NextRequest) {
  try {
    /* ---------------------------------------------------------------------- */
    /* API KEY                                                                */
    /* ---------------------------------------------------------------------- */

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        {
          error: 'Gemini API key not configured',
        },
        {
          status: 500,
        },
      )
    }

    /* ---------------------------------------------------------------------- */
    /* PARSE BODY                                                             */
    /* ---------------------------------------------------------------------- */

    const body: unknown = await request.json()

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        {
          error: 'Invalid request body',
        },
        {
          status: 400,
        },
      )
    }

    /* ---------------------------------------------------------------------- */
    /* DETECT REQUEST TYPE                                                    */
    /* ---------------------------------------------------------------------- */

    /**
     * If sellerResponse exists, this is a seller counter-offer analysis.
     *
     * Otherwise, this is an initial negotiation analysis.
     */
    if (isCounterOfferRequest(body)) {
      return handleCounterOffer(body)
    }

    /* ---------------------------------------------------------------------- */
    /* INITIAL NEGOTIATION                                                    */
    /* ---------------------------------------------------------------------- */

    const validation = validateDealInput(body)

    if (!validation.valid) {
      return NextResponse.json(
        {
          error: `Invalid input: ${validation.error}`,
        },
        {
          status: 400,
        },
      )
    }

    const result =
      await analyzeNegotiationWithGemini(
        body as DealInput,
      )

    return NextResponse.json(result)
  } catch (error) {
    console.error('Negotiation API error:', error)

    const message =
      error instanceof Error
        ? error.message
        : 'Internal server error'

    return NextResponse.json(
      {
        error: message,
      },
      {
        status: 500,
      },
    )
  }
}

/* -------------------------------------------------------------------------- */
/* COUNTER-OFFER HANDLER                                                     */
/* -------------------------------------------------------------------------- */

async function handleCounterOffer(
  body: CounterOfferInput,
) {
  /* ------------------------------------------------------------------------ */
  /* Validate seller response                                                */
  /* ------------------------------------------------------------------------ */

  if (
    typeof body.sellerResponse !== 'string' ||
    !body.sellerResponse.trim()
  ) {
    return NextResponse.json(
      {
        error:
          'sellerResponse must be a non-empty string',
      },
      {
        status: 400,
      },
    )
  }

  /* ------------------------------------------------------------------------ */
  /* Validate original deal                                                  */
  /* ------------------------------------------------------------------------ */

  const dealValidation =
    validateDealInput(body.deal)

  if (!dealValidation.valid) {
    return NextResponse.json(
      {
        error: `Invalid deal: ${dealValidation.error}`,
      },
      {
        status: 400,
      },
    )
  }

  /* ------------------------------------------------------------------------ */
  /* Validate previous result                                                */
  /* ------------------------------------------------------------------------ */

  const resultValidation =
    validatePreviousResult(body.previousResult)

  if (!resultValidation.valid) {
    return NextResponse.json(
      {
        error: `Invalid previous result: ${resultValidation.error}`,
      },
      {
        status: 400,
      },
    )
  }

  /* ------------------------------------------------------------------------ */
  /* Analyze seller response                                                  */
  /* ------------------------------------------------------------------------ */

  const result =
    await analyzeCounterOfferWithGemini(
      body,
    )

  return NextResponse.json(result)
}

/* -------------------------------------------------------------------------- */
/* REQUEST TYPE GUARD                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Determines whether the request is:
 *
 * Initial analysis:
 * {
 *   productName,
 *   sellerPrice,
 *   budget,
 *   ...
 * }
 *
 * OR counter-offer analysis:
 * {
 *   deal,
 *   previousResult,
 *   sellerResponse
 * }
 */
function isCounterOfferRequest(
  body: unknown,
): body is CounterOfferInput {
  if (!body || typeof body !== 'object') {
    return false
  }

  const value = body as Record<string, unknown>

  return (
    'sellerResponse' in value &&
    'deal' in value &&
    'previousResult' in value
  )
}

/* -------------------------------------------------------------------------- */
/* DEAL VALIDATION                                                           */
/* -------------------------------------------------------------------------- */

function validateDealInput(
  input: unknown,
): {
  valid: boolean
  error?: string
} {
  if (!input || typeof input !== 'object') {
    return {
      valid: false,
      error: 'Request body must be an object',
    }
  }

  const value =
    input as Record<string, unknown>

  /* ------------------------------------------------------------------------ */
  /* Required fields                                                          */
  /* ------------------------------------------------------------------------ */

  const required = [
    'productName',
    'sellerPrice',
    'budget',
    'condition',
    'platform',
  ]

  for (const field of required) {
    if (!(field in value)) {
      return {
        valid: false,
        error: `Missing field: ${field}`,
      }
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Product name                                                             */
  /* ------------------------------------------------------------------------ */

  if (
    typeof value.productName !== 'string' ||
    !value.productName.trim()
  ) {
    return {
      valid: false,
      error:
        'productName must be a non-empty string',
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Seller price                                                             */
  /* ------------------------------------------------------------------------ */

  if (
    typeof value.sellerPrice !== 'number' ||
    !Number.isFinite(value.sellerPrice) ||
    value.sellerPrice <= 0
  ) {
    return {
      valid: false,
      error:
        'sellerPrice must be a number greater than zero',
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Budget                                                                   */
  /* ------------------------------------------------------------------------ */

  if (
    typeof value.budget !== 'number' ||
    !Number.isFinite(value.budget) ||
    value.budget <= 0
  ) {
    return {
      valid: false,
      error:
        'budget must be a number greater than zero',
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Condition                                                               */
  /* ------------------------------------------------------------------------ */

  const validConditions = [
    'new',
    'like-new',
    'good',
    'fair',
    'poor',
  ]

  if (
    typeof value.condition !== 'string' ||
    !validConditions.includes(value.condition)
  ) {
    return {
      valid: false,
      error:
        `condition must be one of: ${validConditions.join(', ')}`,
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Platform                                                                */
  /* ------------------------------------------------------------------------ */

  const validPlatforms = [
    'marketplace',
    'whatsapp',
    'instagram',
    'facebook',
    'offline',
    'other',
  ]

  if (
    typeof value.platform !== 'string' ||
    !validPlatforms.includes(value.platform)
  ) {
    return {
      valid: false,
      error:
        `platform must be one of: ${validPlatforms.join(', ')}`,
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Optional / newer negotiation fields                                      */
  /* ------------------------------------------------------------------------ */

  if (
    'urgency' in value &&
    typeof value.urgency !== 'string'
  ) {
    return {
      valid: false,
      error: 'urgency must be a string',
    }
  }

  if (
    'willingnessToBuy' in value &&
    typeof value.willingnessToBuy !== 'string'
  ) {
    return {
      valid: false,
      error:
        'willingnessToBuy must be a string',
    }
  }

  if (
    'hasAlternatives' in value &&
    typeof value.hasAlternatives !== 'boolean'
  ) {
    return {
      valid: false,
      error:
        'hasAlternatives must be a boolean',
    }
  }

  return {
    valid: true,
  }
}

/* -------------------------------------------------------------------------- */
/* PREVIOUS RESULT VALIDATION                                                */
/* -------------------------------------------------------------------------- */

function validatePreviousResult(
  input: unknown,
): {
  valid: boolean
  error?: string
} {
  if (!input || typeof input !== 'object') {
    return {
      valid: false,
      error:
        'previousResult must be an object',
    }
  }

  const value =
    input as Record<string, unknown>

  const required = [
    'openingPrice',
    'targetPrice',
    'maximumPrice',
    'leverage',
    'difficulty',
    'tactic',
    'reasoning',
    'strategy',
    'nextMove',
    'suggestedMessage',
  ]

  for (const field of required) {
    if (!(field in value)) {
      return {
        valid: false,
        error:
          `Missing field: ${field}`,
      }
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Price validation                                                         */
  /* ------------------------------------------------------------------------ */

  const prices = [
    'openingPrice',
    'targetPrice',
    'maximumPrice',
  ]

  for (const field of prices) {
    if (
      typeof value[field] !== 'number' ||
      !Number.isFinite(value[field] as number)
    ) {
      return {
        valid: false,
        error:
          `${field} must be a valid number`,
      }
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Enum validation                                                          */
  /* ------------------------------------------------------------------------ */

  const validLeverage = [
    'low',
    'medium',
    'high',
  ]

  if (
    typeof value.leverage !== 'string' ||
    !validLeverage.includes(value.leverage)
  ) {
    return {
      valid: false,
      error:
        `leverage must be one of: ${validLeverage.join(', ')}`,
    }
  }

  const validDifficulty = [
    'easy',
    'medium',
    'hard',
  ]

  if (
    typeof value.difficulty !== 'string' ||
    !validDifficulty.includes(
      value.difficulty,
    )
  ) {
    return {
      valid: false,
      error:
        `difficulty must be one of: ${validDifficulty.join(', ')}`,
    }
  }

  const validTactics = [
    'anchor',
    'ask-first',
    'interest-based',
    'immediate-close',
    'counter-offer',
    'walk-away',
    'no-negotiation',
  ]

  if (
    typeof value.tactic !== 'string' ||
    !validTactics.includes(value.tactic)
  ) {
    return {
      valid: false,
      error:
        `tactic must be one of: ${validTactics.join(', ')}`,
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Text validation                                                          */
  /* ------------------------------------------------------------------------ */

  const textFields = [
    'reasoning',
    'strategy',
    'nextMove',
    'suggestedMessage',
  ]

  for (const field of textFields) {
    if (
      typeof value[field] !== 'string' ||
      !(value[field] as string).trim()
    ) {
      return {
        valid: false,
        error:
          `${field} must be a non-empty string`,
      }
    }
  }

  return {
    valid: true,
  }
}