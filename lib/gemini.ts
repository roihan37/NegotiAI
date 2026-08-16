
import { GoogleGenAI } from '@google/genai'
import type {
  DealInput,
  NegotiationResult,
  NegotiationTactic,
  Leverage,
  Difficulty,
  CounterOfferInput,
} from './negotiation'

import {
  formatRupiah,
  NEGOTIATION_PRINCIPLES,
  normalizeNegotiationPrices,
} from './negotiation'

const GEMINI_MODEL = 'gemini-3.6-flash'

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
})

/* -------------------------------------------------------------------------- */
/* Gemini structured output schema                                            */
/* -------------------------------------------------------------------------- */

const negotiationResponseSchema = {
  type: 'object',

  properties: {
    openingPrice: {
      type: 'number',
      description:
        'Recommended opening offer in Indonesian Rupiah. Must not exceed targetPrice or maximumPrice.',
    },

    targetPrice: {
      type: 'number',
      description:
        'Buyer target price in Indonesian Rupiah. Must not exceed maximumPrice.',
    },

    maximumPrice: {
      type: 'number',
      description:
        'Buyer reservation point in Indonesian Rupiah. Must never exceed the buyer budget.',
    },

    leverage: {
      type: 'string',
      enum: ['low', 'medium', 'high'],
      description:
        'Estimated negotiation leverage based only on the provided situation.',
    },

    difficulty: {
      type: 'string',
      enum: ['easy', 'medium', 'hard'],
      description:
        'Estimated difficulty of reaching the buyer target.',
    },

    tactic: {
      type: 'string',
      enum: [
        'anchor',
        'ask-first',
        'interest-based',
        'immediate-close',
        'counter-offer',
        'walk-away',
        'no-negotiation',
      ],
      description:
        'The single negotiation tactic that best fits the current situation.',
    },

    reasoning: {
      type: 'string',
      description:
        'Brief explanation of why this tactic is appropriate for the situation.',
    },

    strategy: {
      type: 'string',
      description:
        'Clear, practical negotiation strategy the buyer should follow.',
    },

    nextMove: {
      type: 'string',
      description:
        'What the buyer should do after the current negotiation move.',
    },

    suggestedMessage: {
      type: 'string',
      description:
        'A natural Indonesian message that implements the selected tactic. Do not use a fixed template.',
    },
  },

  required: [
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
  ],
}

/* -------------------------------------------------------------------------- */
/* Generate negotiation analysis                                               */
/* -------------------------------------------------------------------------- */

/**
 * Generate dynamic negotiation analysis using Gemini.
 *
 * Gemini is responsible for:
 * - choosing the negotiation tactic
 * - deciding whether to anchor or ask first
 * - considering BATNA / alternatives
 * - considering buyer urgency
 * - considering willingness to buy
 * - generating the negotiation message
 * - determining the next move
 *
 * This function does NOT use fixed message templates.
 */
export async function analyzeNegotiationWithGemini(
  input: DealInput,
): Promise<NegotiationResult> {
  validateDealInput(input)

  const prompt = buildPrompt(input)

  try {
    const interaction = await ai.interactions.create({
      model: GEMINI_MODEL,
      input: prompt,

      /**
       * Generation configuration for the Gemini model.
       *
       * For the Interactions API, model generation settings belong
       * in generation_config, not config.
       */
    //   generation_config: {
    //     temperature: 0.7,
    //     topP: 0.95,
    //     topK: 40,
    //   },

      /**
       * Force structured JSON output.
       */
      response_format: {
        type: 'text',
        mime_type: 'application/json',
        schema: negotiationResponseSchema,
      },
    })

    /**
     * Interactions API exposes the generated text through output_text.
     */
    const text = interaction.output_text?.trim() ?? ''

    if (!text) {
      throw new Error('Gemini returned an empty response')
    }

    return parseGeminiResponse(text)
  } catch (error) {
    console.error('Gemini API error:', error)

    if (error instanceof Error) {
      throw new Error(
        `Failed to analyze negotiation with Gemini: ${error.message}`,
      )
    }

    throw new Error(
      'Failed to analyze negotiation with Gemini',
    )
  }
}



function buildCounterOfferPrompt(
  input: CounterOfferInput,
): string {
  const {
    deal,
    previousResult,
    sellerResponse,
    conversation = [],
  } = input

  const conversationText =
    conversation.length > 0
      ? conversation
          .map((message) => {
            const role =
              message.role === 'buyer'
                ? 'BUYER'
                : 'SELLER'

            return `${role}: ${message.content}`
          })
          .join('\n\n')
      : 'No previous conversation.'

  return `
You are NegotiAI, an AI negotiation strategy assistant
specializing in consumer negotiations in Indonesia.

This is NOT a new negotiation.

You are analyzing the seller's response to the buyer's
previous negotiation move.

Your job is to reassess the negotiation situation and
recommend the buyer's NEXT move.

Use the negotiation principles below.

${NEGOTIATION_PRINCIPLES}

==================================================
ORIGINAL DEAL
==================================================

Product:
${deal.productName}

Seller asking price:
${formatRupiah(deal.sellerPrice)}

Buyer budget:
${formatRupiah(deal.budget)}

Product condition:
${deal.condition}

Platform:
${deal.platform}

Buyer urgency:
${deal.urgency}

Buyer willingness to buy:
${deal.willingnessToBuy}

Buyer has alternatives:
${deal.hasAlternatives ? 'Yes' : 'No'}

==================================================
PREVIOUS AI ANALYSIS
==================================================

Opening price:
${formatRupiah(previousResult.openingPrice)}

Target price:
${formatRupiah(previousResult.targetPrice)}

Maximum price:
${formatRupiah(previousResult.maximumPrice)}

Previous tactic:
${previousResult.tactic}

Previous strategy:
${previousResult.strategy}

Previous suggested message:
${previousResult.suggestedMessage}

==================================================
NEGOTIATION HISTORY
==================================================

${conversationText}

==================================================
SELLER'S RESPONSE
==================================================

"${sellerResponse}"

==================================================
YOUR TASK
==================================================

Analyze the negotiation as an ongoing sequence of moves.

Do NOT analyze the latest seller response in isolation.

Consider:

1. The original seller asking price.

2. The buyer's original budget.

3. The buyer's original opening offer.

4. Every previous buyer concession.

5. Every previous seller concession.

6. The seller's latest position.

7. The buyer's current target price.

8. The buyer's private maximum price.

9. Whether the negotiation gap is becoming smaller.

10. Whether either side appears firm.

11. Whether the buyer still has a meaningful BATNA.

12. Whether continuing the negotiation creates enough
    benefit to justify another concession.

Determine:

- who has moved more
- who currently has stronger leverage
- whether the seller appears flexible
- whether another concession is justified
- whether a question is better than another offer
- whether immediate-close value should be used
- whether the buyer should stop negotiating
- whether accepting the seller's latest position is reasonable

Determine:

1. Whether the seller appears flexible.
2. Whether the seller made a concession.
3. Whether the seller introduced a counter-offer.
4. Whether the buyer should continue negotiating.
5. Whether the buyer should make another concession.
6. Whether asking a question is better.
7. Whether the buyer should use immediate-close value.
8. Whether the buyer should walk away.
9. What the buyer's next price should be, if a price is appropriate.

Do NOT assume the seller's true reservation price.

Do NOT invent information that is not contained in the
conversation.

Do NOT claim that the seller is definitely willing to accept
a certain price.

==================================================
TACTIC
==================================================

Choose exactly ONE:

- anchor
- ask-first
- interest-based
- immediate-close
- counter-offer
- walk-away
- no-negotiation

The tactic must reflect the CURRENT negotiation state,
not simply repeat the previous tactic.




For example:

If the seller gives a counter-offer, "counter-offer" may
be appropriate.

If the seller refuses to negotiate and the buyer has
alternatives, "walk-away" may be better.

If the seller asks for the buyer's best price, consider
whether revealing another price is strategically appropriate.

If the seller has already made a meaningful concession,
do not automatically demand another large discount.

==================================================
PRICE RULES
==================================================

The relationship MUST be:

openingPrice <= targetPrice <= maximumPrice

maximumPrice MUST NOT exceed:

${formatRupiah(deal.budget)}

maximumPrice MUST NOT exceed:

${formatRupiah(deal.sellerPrice)}

Never recommend a price above the buyer's budget.

Do not reveal the buyer's maximum price in the suggested
message unless the buyer explicitly chooses to do so.

The maximum price represents the buyer's private
reservation point.

==================================================
CONCESSION PRINCIPLES
==================================================

Treat concessions as meaningful negotiation moves.

Do not automatically make another concession after
every seller response.

When the buyer makes another concession:

- prefer smaller concessions as the negotiation progresses
- avoid repeatedly increasing the offer by large amounts
- do not reveal the buyer's reservation point
- do not move toward the maximum price without strategic reason

If the seller has already made a meaningful concession,
recognize that concession before recommending another
buyer concession.

If the seller has not moved at all, do not assume the buyer
must move again.

If the buyer has already made multiple concessions while
the seller has barely moved, consider:
- asking-first
- interest-based
- walk-away
- no-negotiation

The goal is not to maximize the number of negotiation rounds.

The goal is to achieve the best reasonable outcome for
the buyer while respecting the buyer's reservation point.

==================================================
COMMUNICATION
==================================================

Generate a NEW suggested message.

Do not simply repeat the previous message.

The message must directly respond to the seller's latest
statement.

Make it sound like a natural Indonesian buyer.

Keep it concise.

Do not use:
- fake urgency
- fake competing offers
- invented market prices
- manipulation
- threats
- dishonest claims

Do not make the buyer sound more committed than their
willingness-to-buy level supports.

If another price is appropriate, use the negotiation context
to choose it.

If no price should be given yet, ask a useful question.

If walking away is the best decision, provide a polite
message that maintains the buyer's boundary.

==================================================
NEXT MOVE
==================================================

Explain exactly what the buyer should do AFTER sending
the suggested message.

The next move should be actionable.

For example:
- wait for the seller's response
- make a smaller concession
- ask about included accessories
- stop negotiating
- walk away
- accept if the seller reaches the target

Do not give generic advice.

==================================================
IMPORTANT
==================================================

The previous AI strategy is context, not a rule.

You are allowed to change the tactic.

Do not blindly continue negotiating.

The seller's latest response is the most important new
information.

Return ONLY the structured JSON response.
`
}

function validateCounterOfferInput(
  input: CounterOfferInput,
): void {
  if (!input || typeof input !== 'object') {
    throw new Error('Counter-offer input is required')
  }

  if (
    typeof input.sellerResponse !== 'string' ||
    !input.sellerResponse.trim()
  ) {
    throw new Error('Seller response is required')
  }

  if (!input.deal) {
    throw new Error('Deal information is required')
  }

  validateDealInput(input.deal)

  if (!input.previousResult) {
    throw new Error(
      'Previous negotiation result is required',
    )
  }

  if (
    !input.conversation ||
    !Array.isArray(input.conversation)
  ) {
    throw new Error(
      'Conversation history must be an array',
    )
  }

  for (const message of input.conversation) {
    if (
      !message ||
      typeof message !== 'object'
    ) {
      throw new Error(
        'Invalid conversation message',
      )
    }

    if (
      message.role !== 'buyer' &&
      message.role !== 'seller'
    ) {
      throw new Error(
        'Conversation role must be buyer or seller',
      )
    }

    if (
      typeof message.content !== 'string' ||
      !message.content.trim()
    ) {
      throw new Error(
        'Conversation message content is required',
      )
    }
  }
}

export async function analyzeCounterOfferWithGemini(
  input: CounterOfferInput,
): Promise<NegotiationResult> {
  validateCounterOfferInput(input)

  const prompt =
    buildCounterOfferPrompt(input)

  try {
    const interaction =
      await ai.interactions.create({
        model: GEMINI_MODEL,
        input: prompt,

        response_format: {
          type: 'text',
          mime_type: 'application/json',
          schema:
            negotiationResponseSchema,
        },
      })

    const text =
      interaction.output_text?.trim() ?? ''

    if (!text) {
      throw new Error(
        'Gemini returned an empty response',
      )
    }

    return parseGeminiResponse(text)
  } catch (error) {
    console.error(
      'Gemini counter-offer error:',
      error,
    )

    if (error instanceof Error) {
      throw new Error(
        `Failed to analyze seller response: ${error.message}`,
      )
    }

    throw new Error(
      'Failed to analyze seller response',
    )
  }
}


/* -------------------------------------------------------------------------- */
/* Prompt                                                                     */
/* -------------------------------------------------------------------------- */

function buildPrompt(input: DealInput): string {
  return `
You are NegotiAI, an AI negotiation strategy assistant specializing
in consumer negotiations in Indonesia.

Your job is NOT simply to generate a bargaining message.

Your job is to:

1. Analyze the negotiation situation.
2. Identify the buyer's negotiation position.
3. Consider BATNA and alternatives.
4. Consider the buyer's target and reservation point.
5. Consider whether an anchor is appropriate.
6. Decide whether asking a question is better than making an offer.
7. Select exactly one negotiation tactic.
8. Determine a reasonable price strategy.
9. Generate a natural Indonesian message based on the selected tactic.
10. Explain what the buyer should do next.

Use the negotiation principles below as your strategic framework.

${NEGOTIATION_PRINCIPLES}

==================================================
DEAL INFORMATION
==================================================

Product:
${input.productName}

Seller asking price:
${formatRupiah(input.sellerPrice)}

Buyer budget:
${formatRupiah(input.budget)}

Product condition:
${input.condition}

Platform:
${input.platform}

Buyer urgency:
${input.urgency}

Buyer willingness to buy:
${input.willingnessToBuy}

Buyer has alternative sellers/products:
${input.hasAlternatives ? 'Yes' : 'No'}

==================================================
CORE OBJECTIVES
==================================================

1. Protect the buyer's budget.

2. Never recommend a maximum price above the buyer's stated budget.

3. Treat the buyer's budget as the reservation point.

4. Do not pretend to know the seller's minimum acceptable price.

5. Do not pretend to know the actual market value unless market
   data is explicitly provided.

6. Use product condition as contextual information, not as a
   fixed mathematical discount.

7. Consider alternatives as part of the buyer's BATNA.

8. Consider urgency carefully.

9. Consider willingness to buy carefully.

10. Do not assume making an offer is always the best move.

11. Choose exactly ONE tactic.

==================================================
TACTIC OPTIONS
==================================================

anchor

Use when:
- there is enough information to make a credible opening offer
- an initial price can reasonably shape the negotiation

ask-first

Use when:
- important information is missing
- seller flexibility is unclear
- asking a question is strategically better than guessing a price

interest-based

Use when:
- condition, convenience, urgency, payment certainty,
  or another non-price interest can improve the negotiation

immediate-close

Use when:
- buyer is ready to transact quickly
- immediate payment or checkout provides meaningful value to seller

counter-offer

Use when:
- seller has already provided a counter-offer
- or a specific response to the seller's price is strategically appropriate

walk-away

Use when:
- seller price is beyond the buyer's reservation point
- buyer has sufficient alternatives
- continuing is unlikely to be beneficial

no-negotiation

Use when:
- asking price is already close to budget
- aggressive negotiation provides little benefit
- asking for additional value is more appropriate

==================================================
PRICE RULES
==================================================

The following relationship MUST always be true:

openingPrice <= targetPrice <= maximumPrice

maximumPrice MUST NOT exceed:

${formatRupiah(input.budget)}

maximumPrice MUST NOT exceed:

${formatRupiah(input.sellerPrice)}

Prices should normally be rounded to the nearest Rp50.000.

Do not create arbitrary prices merely to satisfy a formula.

If asking-first is selected:
openingPrice may equal targetPrice.

If no-negotiation is selected:
openingPrice and targetPrice may equal maximumPrice.

==================================================
COMMUNICATION RULES
==================================================

The suggested message must be dynamically generated from
the selected tactic.

DO NOT use a fixed template.

The message must sound like a real Indonesian buyer.

Tone:
- polite
- natural
- concise
- confident
- non-confrontational

Avoid:
- robotic language
- excessive formality
- manipulation
- fake urgency
- invented market prices
- invented competing offers
- threats
- dishonest statements

If the buyer has alternatives, do not automatically mention them.

Only mention alternatives if strategically useful.

If the buyer is ready to buy immediately, the message may mention
immediate payment or checkout.

If ask-first is selected, ask a useful question instead of forcing
a price offer.

If walk-away is selected, preserve the relationship while
maintaining the buyer's limit.

==================================================
IMPORTANT
==================================================

Do not follow a fixed formula.

Do not always offer 5%, 10%, or 15% below the seller's price.

Do not always generate the same type of message.

The tactic, reasoning, strategy, next move, prices, and message
must depend on the actual situation.

Return ONLY the structured JSON response matching the provided schema.
`
}

/* -------------------------------------------------------------------------- */
/* Input validation                                                            */
/* -------------------------------------------------------------------------- */

function validateDealInput(input: DealInput): void {
  if (!input.productName?.trim()) {
    throw new Error('Product name is required')
  }

  if (!Number.isFinite(input.sellerPrice) || input.sellerPrice <= 0) {
    throw new Error('Seller price must be greater than zero')
  }

  if (!Number.isFinite(input.budget) || input.budget <= 0) {
    throw new Error('Buyer budget must be greater than zero')
  }

  if (!input.condition) {
    throw new Error('Product condition is required')
  }

  if (!input.platform) {
    throw new Error('Platform is required')
  }

  if (!input.urgency) {
    throw new Error('Buyer urgency is required')
  }

  if (!input.willingnessToBuy) {
    throw new Error('Buyer willingness is required')
  }

  if (typeof input.hasAlternatives !== 'boolean') {
    throw new Error('Alternative information is required')
  }
}

/* -------------------------------------------------------------------------- */
/* Parse + validate Gemini response                                            */
/* -------------------------------------------------------------------------- */

function parseGeminiResponse(
  text: string,
): NegotiationResult {
  try {
    const parsed: unknown = JSON.parse(text)

    if (!isRecord(parsed)) {
      throw new Error('Gemini response is not an object')
    }

    const requiredFields = [
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

    for (const field of requiredFields) {
      if (!(field in parsed)) {
        throw new Error(
          `Missing required field: ${field}`,
        )
      }
    }

    const openingPrice = Number(parsed.openingPrice)
    const targetPrice = Number(parsed.targetPrice)
    const maximumPrice = Number(parsed.maximumPrice)

    if (
      !Number.isFinite(openingPrice) ||
      !Number.isFinite(targetPrice) ||
      !Number.isFinite(maximumPrice)
    ) {
      throw new Error('Invalid price values from Gemini')
    }

    if (
      !isLeverage(parsed.leverage) ||
      !isDifficulty(parsed.difficulty) ||
      !isNegotiationTactic(parsed.tactic)
    ) {
      throw new Error('Invalid enum value from Gemini')
    }

    if (
      typeof parsed.reasoning !== 'string' ||
      typeof parsed.strategy !== 'string' ||
      typeof parsed.nextMove !== 'string' ||
      typeof parsed.suggestedMessage !== 'string'
    ) {
      throw new Error('Invalid text fields from Gemini')
    }

    /**
     * Normalize:
     *
     * opening <= target <= maximum
     */
    const normalized = normalizeNegotiationPrices(
      openingPrice,
      targetPrice,
      maximumPrice,
    )

    return {
      openingPrice: normalized.openingPrice,
      targetPrice: normalized.targetPrice,
      maximumPrice: normalized.maximumPrice,

      leverage: parsed.leverage,
      difficulty: parsed.difficulty,
      tactic: parsed.tactic,

      reasoning: parsed.reasoning.trim(),
      strategy: parsed.strategy.trim(),
      nextMove: parsed.nextMove.trim(),
      suggestedMessage: parsed.suggestedMessage.trim(),
    }
  } catch (error) {
    console.error(
      'Failed to parse Gemini response:',
      text,
    )

    if (error instanceof Error) {
      throw new Error(
        `Invalid response format from Gemini: ${error.message}`,
      )
    }

    throw new Error(
      'Invalid response format from Gemini',
    )
  }
}

/* -------------------------------------------------------------------------- */
/* Type guards                                                                */
/* -------------------------------------------------------------------------- */

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value)
  )
}

function isLeverage(
  value: unknown,
): value is Leverage {
  return (
    value === 'low' ||
    value === 'medium' ||
    value === 'high'
  )
}

function isDifficulty(
  value: unknown,
): value is Difficulty {
  return (
    value === 'easy' ||
    value === 'medium' ||
    value === 'hard'
  )
}

function isNegotiationTactic(
  value: unknown,
): value is NegotiationTactic {
  return (
    value === 'anchor' ||
    value === 'ask-first' ||
    value === 'interest-based' ||
    value === 'immediate-close' ||
    value === 'counter-offer' ||
    value === 'walk-away' ||
    value === 'no-negotiation'
  )
}