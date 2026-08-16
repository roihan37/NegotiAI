// Shared types + negotiation analysis engine for NegotiAI.
//
// The real production analysis should be performed by Gemini.
// This file provides:
// 1. Shared TypeScript contracts
// 2. Formatting helpers
// 3. Select options for the UI
// 4. A deterministic fallback/mock engine for development
//
// NegotiationResult is the contract shared between the frontend
// and the future POST /api/negotiate endpoint backed by Gemini.

export type Leverage = 'low' | 'medium' | 'high'

export type Difficulty = 'easy' | 'medium' | 'hard'

export type Condition = 'new' | 'like-new' | 'good' | 'fair' | 'poor'

export type Platform =
  | 'marketplace'
  | 'whatsapp'
  | 'instagram'
  | 'facebook'
  | 'offline'
  | 'other'

/**
 * How urgently the buyer wants the product.
 *
 * This affects negotiation strategy because a buyer with low urgency
 * has more freedom to walk away and compare alternatives.
 */
export type Urgency =
  | 'browsing'
  | 'interested'
  | 'soon'
  | 'today'

/**
 * How likely the buyer is to purchase immediately if the price is right.
 */
export type WillingnessToBuy =
  | 'consider'
  | 'probably-buy'
  | 'buy-immediately'

/**
 * Negotiation tactic selected by the AI.
 *
 * The AI should NOT always use an anchor.
 * It should choose the tactic based on the situation.
 */
export type NegotiationTactic =
  | 'anchor'
  | 'ask-first'
  | 'interest-based'
  | 'immediate-close'
  | 'counter-offer'
  | 'walk-away'
  | 'no-negotiation'

export interface DealInput {
  productName: string
  sellerPrice: number
  budget: number

  condition: Condition
  platform: Platform

  urgency: Urgency
  willingnessToBuy: WillingnessToBuy

  /**
   * Whether the buyer has alternative sellers/products.
   *
   * This represents part of the buyer's BATNA.
   */
  hasAlternatives: boolean
}

export interface NegotiationResult {
  openingPrice: number
  targetPrice: number
  maximumPrice: number
  leverage: Leverage
  difficulty: Difficulty
  tactic: NegotiationTactic
  reasoning: string
  strategy: string
  nextMove: string
  suggestedMessage: string
}

export interface CounterOfferInput {
  deal: DealInput
  previousResult: NegotiationResult
  sellerResponse: string
}



/* -------------------------------------------------------------------------- */
/* Negotiation principles                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Negotiation framework used by the Gemini prompt.
 *
 * This is deliberately kept as a compact knowledge layer.
 * It is not a replacement for Gemini's reasoning.
 */
export const NEGOTIATION_PRINCIPLES = `
NEGOTIATION FRAMEWORK

1. BATNA
Consider the buyer's best alternative if the current deal fails.
If the buyer has alternatives, they have more freedom to walk away.

2. TARGET
The target price is the buyer's preferred realistic outcome.

3. RESERVATION POINT
The maximum price is the buyer's reservation point.
Never recommend exceeding the buyer's stated budget.

4. ZOPA
Consider the possible bargaining zone based on available information.
Never pretend to know the seller's reservation point without evidence.

5. ANCHORING
Consider making a first offer when there is enough information
to make a credible opening offer.
Do not use an extreme or obviously unrealistic anchor.

6. INTERESTS VS POSITIONS
Do not focus only on the stated price.
Consider urgency, convenience, product condition, payment certainty,
and other factors that may influence the seller.

7. TACTICAL EMPATHY
Acknowledge the seller's position when appropriate.
Avoid unnecessarily aggressive or confrontational language.

8. CALIBRATED QUESTIONS
When important information is missing, asking a useful question
can be better than immediately making a price offer.

9. CONCESSIONS
Avoid unnecessary large concessions.
Move toward the target gradually.

10. WALK-AWAY
If the seller's price exceeds the buyer's reservation point,
do not encourage the buyer to exceed their stated limit.

11. NO NEGOTIATION
Negotiation is not always necessary.
If the asking price is already close to the buyer's budget
or appears attractive based on the provided information,
the AI may recommend accepting or asking for additional value
instead of pushing the price lower.

12. DYNAMIC COMMUNICATION
Never use a fixed message template.
Choose the communication approach based on the situation.

The final message can:
- make an offer
- ask a question
- acknowledge the seller
- emphasize immediate payment
- mention alternatives when appropriate
- ask for the seller's best price
- make a counter-offer
- politely walk away

The AI should decide which approach is most appropriate.
`

/* -------------------------------------------------------------------------- */
/* Formatting helpers                                                         */
/* -------------------------------------------------------------------------- */

const rupiah = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
})

/**
 * Format number into Indonesian Rupiah.
 *
 * Example:
 * 8500000 -> "Rp 8.500.000"
 */
export function formatRupiah(value: number): string {
  if (!Number.isFinite(value)) return ''

  return rupiah.format(value).replace(/^Rp\s?/, 'Rp ')
}

/**
 * Extract numeric value from a formatted Rupiah string.
 *
 * Example:
 * "Rp 8.500.000" -> 8500000
 */
export function parseRupiah(value: string): number {
  const digits = value.replace(/[^\d]/g, '')

  return digits ? Number.parseInt(digits, 10) : 0
}

/**
 * Format number into Indonesian million shorthand.
 *
 * Examples:
 * 7400000 -> "Rp7,4 juta"
 * 7000000 -> "Rp7 juta"
 */
export function formatJuta(value: number): string {
  if (!Number.isFinite(value)) return ''

  const juta = value / 1_000_000
  const rounded = Math.round(juta * 10) / 10

  const label = Number.isInteger(rounded)
    ? String(rounded)
    : rounded.toFixed(1).replace('.', ',')

  return `Rp${label} juta`
}

/* -------------------------------------------------------------------------- */
/* UI options                                                                 */
/* -------------------------------------------------------------------------- */

const conditionLabels: Record<Condition, string> = {
  new: 'Baru',
  'like-new': 'Seperti Baru',
  good: 'Baik',
  fair: 'Cukup',
  poor: 'Kurang Baik',
}

export const conditionOptions = (
  Object.keys(conditionLabels) as Condition[]
).map((value) => ({
  value,
  label: conditionLabels[value],
}))

export const platformOptions: {
  value: Platform
  label: string
}[] = [
  { value: 'marketplace', label: 'Marketplace' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook Marketplace' },
  { value: 'offline', label: 'Toko Offline' },
  { value: 'other', label: 'Lainnya' },
]

export const urgencyOptions: {
  value: Urgency
  label: string
}[] = [
  {
    value: 'browsing',
    label: 'Sekadar melihat-lihat',
  },
  {
    value: 'interested',
    label: 'Tertarik',
  },
  {
    value: 'soon',
    label: 'Ingin membeli segera',
  },
  {
    value: 'today',
    label: 'Ingin membeli hari ini',
  },
]

export const willingnessOptions: {
  value: WillingnessToBuy
  label: string
}[] = [
  {
    value: 'consider',
    label: 'Masih mempertimbangkan',
  },
  {
    value: 'probably-buy',
    label: 'Kemungkinan besar membeli',
  },
  {
    value: 'buy-immediately',
    label: 'Siap beli jika harga cocok',
  },
]

/* -------------------------------------------------------------------------- */
/* Price helpers                                                              */
/* -------------------------------------------------------------------------- */

const PRICE_STEP = 50_000

function roundTo(value: number, step: number = PRICE_STEP): number {
  return Math.round(value / step) * step
}

/**
 * Ensure the three prices always follow:
 *
 * openingPrice <= targetPrice <= maximumPrice
 *
 * This protects the UI from invalid mock or AI-generated values.
 */
export function normalizeNegotiationPrices(
  openingPrice: number,
  targetPrice: number,
  maximumPrice: number,
): {
  openingPrice: number
  targetPrice: number
  maximumPrice: number
} {
  const safeMaximum = Math.max(0, roundTo(maximumPrice))

  const safeTarget = Math.min(
    safeMaximum,
    Math.max(0, roundTo(targetPrice)),
  )

  const safeOpening = Math.min(
    safeTarget,
    Math.max(0, roundTo(openingPrice)),
  )

  return {
    openingPrice: safeOpening,
    targetPrice: safeTarget,
    maximumPrice: safeMaximum,
  }
}

/* -------------------------------------------------------------------------- */
/* Mock analysis engine                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Condition influence used ONLY by the mock engine.
 *
 * This is not a market pricing model.
 * Gemini should reason using the actual negotiation context.
 */
const conditionFactor: Record<Condition, number> = {
  new: -0.04,
  'like-new': -0.02,
  good: 0,
  fair: 0.03,
  poor: 0.06,
}

/**
 * Determine leverage for the mock engine.
 *
 * This is intentionally simple because the real strategy
 * should come from Gemini.
 */
function calculateMockLeverage(input: DealInput): Leverage {
  const { sellerPrice, budget, condition, hasAlternatives, urgency } = input

  if (sellerPrice <= 0) {
    return 'low'
  }

  const priceGap = (sellerPrice - budget) / sellerPrice

  let score = 0

  // Smaller gap means stronger buyer position.
  if (priceGap <= 0.05) score += 3
  else if (priceGap <= 0.12) score += 2
  else if (priceGap <= 0.20) score += 1

  // Poor condition creates more negotiation room.
  score += conditionFactor[condition] * 20

  // Alternatives strengthen BATNA.
  if (hasAlternatives) {
    score += 2
  }

  // Low urgency makes walking away easier.
  if (urgency === 'browsing') {
    score += 1
  }

  if (score >= 4) return 'high'
  if (score >= 2) return 'medium'

  return 'low'
}

function calculateDifficulty(leverage: Leverage): Difficulty {
  switch (leverage) {
    case 'high':
      return 'easy'

    case 'medium':
      return 'medium'

    case 'low':
      return 'hard'
  }
}

/**
 * Select a tactic for the fallback engine.
 *
 * Gemini should make this decision dynamically in production.
 */
function selectMockTactic(input: DealInput): NegotiationTactic {
  const { sellerPrice, budget, condition, urgency, hasAlternatives } = input

  if (budget <= 0 || sellerPrice <= 0) {
    return 'ask-first'
  }

  // Asking price already meets or is below the buyer's budget.
  const budgetGap = (sellerPrice - budget) / sellerPrice

  if (budgetGap <= 0.02 && condition === 'new') {
    return 'no-negotiation'
  }

  // Seller is significantly above the buyer's limit.
  if (sellerPrice > budget * 1.25) {
    if (hasAlternatives || urgency === 'browsing') {
      return 'walk-away'
    }

    return 'ask-first'
  }

  // Buyer wants to purchase immediately.
  if (urgency === 'today') {
    return 'immediate-close'
  }

  // Existing alternatives make an anchor more credible.
  if (hasAlternatives) {
    return 'anchor'
  }

  // Poor condition creates room to negotiate based on condition.
  if (condition === 'fair' || condition === 'poor') {
    return 'interest-based'
  }

  return 'ask-first'
}

/* -------------------------------------------------------------------------- */
/* Dynamic mock message generation                                            */
/* -------------------------------------------------------------------------- */

/**
 * These are not intended to imitate a fixed production template.
 *
 * They simulate different strategic decisions so the UI can be developed
 * before Gemini is connected.
 */
function buildMockMessage(
  input: DealInput,
  tactic: NegotiationTactic,
  openingPrice: number,
  targetPrice: number,
): string {
  const opening = formatJuta(openingPrice)
  const target = formatJuta(targetPrice)

  switch (tactic) {
    case 'anchor':
      return `Kak, saya cukup tertarik dengan barangnya. Saya sedang membandingkan beberapa opsi juga. Kalau di ${opening} memungkinkan, saya bisa lanjut pertimbangkan serius.`

    case 'ask-first':
      return `Kak, untuk barang ini masih bisa nego? Saya sedang membandingkan beberapa opsi sebelum menentukan pilihan.`

    case 'interest-based':
      if (input.condition === 'poor' || input.condition === 'fair') {
        return `Kak, karena ada beberapa kondisi yang perlu saya pertimbangkan, kira-kira harga terbaik yang masih bisa diberikan berapa ya?`
      }
      return `Kak, saya tertarik dengan barangnya. Kalau saya lanjut ambil, kira-kira harga terbaik yang masih memungkinkan berapa ya?`

    case 'immediate-close':
      return `Kak, kalau saya bisa langsung checkout atau transfer hari ini, apakah bisa di ${target}?`

    case 'counter-offer':
      return `Kalau saya di ${target}, apakah masih memungkinkan, Kak? Kalau cocok saya bisa langsung lanjut.`

    case 'walk-away':
      return `Terima kasih informasinya, Kak. Budget saya memang maksimal ${formatRupiah(input.budget)}. Kalau nantinya bisa di kisaran itu, saya masih sangat tertarik.`

    case 'no-negotiation':
      return `Kak, harganya sudah cukup dekat dengan budget saya. Apakah ada bonus atau tambahan lain yang bisa didapat kalau saya langsung ambil?`
  }
}

/* -------------------------------------------------------------------------- */
/* Dynamic mock strategy                                                      */
/* -------------------------------------------------------------------------- */

function buildMockReasoning(
  input: DealInput,
  tactic: NegotiationTactic,
  leverage: Leverage,
): string {
  const {
    sellerPrice,
    budget,
    condition,
    urgency,
    hasAlternatives,
  } = input

  const gap =
    sellerPrice > 0
      ? Math.round(((sellerPrice - budget) / sellerPrice) * 100)
      : 0

  switch (tactic) {
    case 'anchor':
      return `Kamu memiliki alternatif dan selisih harga sekitar ${Math.max(
        0,
        gap,
      )}%. Kondisi ini memberi ruang untuk membuat penawaran awal yang cukup kredibel tanpa harus langsung mendekati batas budget.`

    case 'ask-first':
      return `Informasi tentang posisi seller belum cukup untuk membuat anchor yang kuat. Lebih aman menggali fleksibilitas harga terlebih dahulu.`

    case 'interest-based':
      return `Kondisi barang ${condition} memberikan alasan objektif untuk membicarakan harga atau nilai transaksi, bukan sekadar meminta diskon.`

    case 'immediate-close':
      return `Karena kamu ingin membeli ${urgency === 'today' ? 'hari ini' : 'segera'}, kepastian transaksi dapat digunakan sebagai nilai tawar. Seller mendapatkan keuntungan dari proses yang cepat.`

    case 'counter-offer':
      return `Posisi buyer masih memiliki ruang untuk memberikan counter-offer tanpa melewati batas budget. Fokuskan konsesi secara bertahap.`

    case 'walk-away':
      return `Harga seller terlalu jauh dari budget atau posisi tawarmu kurang kuat. ${hasAlternatives ? 'Karena kamu memiliki alternatif, BATNA-mu cukup membantu.' : 'Tanpa alternatif yang jelas, sebaiknya tetap menjaga batas budget.'}`

    case 'no-negotiation':
      return `Harga seller sudah relatif dekat dengan budget dan kondisi barang mendukung. Daripada menekan harga terlalu jauh, lebih baik meminta nilai tambahan atau langsung mempertimbangkan transaksi.`
  }
}

function buildMockStrategy(
  input: DealInput,
  tactic: NegotiationTactic,
  openingPrice: number,
  targetPrice: number,
  maximumPrice: number,
): string {
  switch (tactic) {
    case 'anchor':
      return `Mulai dengan anchor sekitar ${formatRupiah(
        openingPrice,
      )}. Jangan langsung memberikan batas maksimalmu. Jika seller melakukan counter-offer, naikkan penawaran secara bertahap menuju target ${formatRupiah(
        targetPrice,
      )}.`

    case 'ask-first':
      return `Jangan langsung membuka angka. Cari tahu terlebih dahulu seberapa fleksibel seller terhadap harga. Setelah mendapat informasi tambahan, baru tentukan apakah perlu memberikan offer.`

    case 'interest-based':
      return `Gunakan kondisi barang sebagai dasar pembicaraan. Fokus pada alasan objektif mengapa harga perlu disesuaikan, bukan sekadar meminta diskon.`

    case 'immediate-close':
      return `Manfaatkan kepastian transaksi sebagai leverage. Tawarkan ${formatRupiah(
        targetPrice,
      )} dengan menekankan bahwa kamu siap menyelesaikan transaksi segera.`

    case 'counter-offer':
      return `Berikan counter-offer sekitar ${formatRupiah(
        targetPrice,
      )}. Hindari langsung bergerak ke batas ${formatRupiah(
        maximumPrice,
      )} agar masih memiliki ruang untuk satu konsesi terakhir.`

    case 'walk-away':
      return `Jangan mengejar transaksi jika harga tetap melewati ${formatRupiah(
        maximumPrice,
      )}. Gunakan batas budget sebagai reservation point dan tetap buka kemungkinan jika seller mengubah penawaran.`

    case 'no-negotiation':
      return `Harga sudah cukup dekat dengan budget. Daripada menawar secara agresif, pertimbangkan meminta bonus, garansi tambahan, ongkir, atau nilai lain dari transaksi.`
  }
}

/**
 * Deterministic fallback/mock engine.
 *
 * IMPORTANT:
 * This is only for UI development and fallback behavior.
 *
 * In production, Gemini should dynamically determine:
 * - tactic
 * - reasoning
 * - strategy
 * - message
 * - next move
 */
export function analyzeDeal(input: DealInput): NegotiationResult {
  const {
    sellerPrice,
    budget,
  } = input

  const safeSellerPrice = Math.max(0, sellerPrice)
  const safeBudget = Math.max(0, budget)

  /**
   * Reservation point:
   * Never exceed the user's stated budget or seller asking price.
   */
  const maximumPrice = roundTo(
    Math.min(safeBudget, safeSellerPrice),
  )

  const leverage = calculateMockLeverage(input)
  const difficulty = calculateDifficulty(leverage)
  const tactic = selectMockTactic(input)

  /**
   * If there is no valid price, return a safe result.
   */
  if (maximumPrice <= 0) {
    return {
      openingPrice: 0,
      targetPrice: 0,
      maximumPrice: 0,
      leverage: 'low',
      difficulty: 'hard',
      tactic: 'ask-first',
      reasoning:
        'Informasi harga belum cukup untuk menentukan strategi negosiasi.',
      strategy:
        'Masukkan harga seller dan budget yang valid sebelum melakukan negosiasi.',
      nextMove:
        'Lengkapi informasi harga terlebih dahulu.',
      suggestedMessage:
        'Kak, boleh diinformasikan harga terbaik untuk barang ini?',
    }
  }

  /**
   * The mock engine uses different price behavior depending on tactic.
   *
   * This is intentionally not presented as a real market valuation.
   */
  let openingPrice: number
  let targetPrice: number

  switch (tactic) {
    case 'anchor':
      targetPrice = maximumPrice * 0.98
      openingPrice = maximumPrice * 0.92
      break

    case 'ask-first':
      targetPrice = maximumPrice * 0.98
      openingPrice = targetPrice
      break

    case 'interest-based':
      targetPrice = maximumPrice * 0.97
      openingPrice = maximumPrice * 0.91
      break

    case 'immediate-close':
      targetPrice = maximumPrice * 0.99
      openingPrice = targetPrice
      break

    case 'counter-offer':
      targetPrice = maximumPrice * 0.98
      openingPrice = targetPrice
      break

    case 'walk-away':
      targetPrice = maximumPrice
      openingPrice = maximumPrice
      break

    case 'no-negotiation':
      targetPrice = maximumPrice
      openingPrice = maximumPrice
      break
  }

  const normalized = normalizeNegotiationPrices(
    openingPrice,
    targetPrice,
    maximumPrice,
  )

  const reasoning = buildMockReasoning(
    input,
    tactic,
    leverage,
  )

  const strategy = buildMockStrategy(
    input,
    tactic,
    normalized.openingPrice,
    normalized.targetPrice,
    normalized.maximumPrice,
  )

  const suggestedMessage = buildMockMessage(
    input,
    tactic,
    normalized.openingPrice,
    normalized.targetPrice,
  )

  let nextMove: string

  switch (tactic) {
    case 'anchor':
      nextMove = `Jika seller melakukan counter-offer, jangan langsung menerima. Evaluasi apakah masih berada di bawah ${formatRupiah(
        normalized.maximumPrice,
      )}.`

      break

    case 'ask-first':
      nextMove =
        'Gunakan jawaban seller untuk menentukan apakah perlu memberikan angka pembuka.'

      break

    case 'interest-based':
      nextMove =
        'Jika seller menolak, tanyakan apakah ada nilai tambahan seperti bonus, garansi, atau ongkir.'

      break

    case 'immediate-close':
      nextMove = `Jika seller menerima atau mendekati ${formatRupiah(
        normalized.targetPrice,
      )}, pertimbangkan menyelesaikan transaksi.`

      break

    case 'counter-offer':
      nextMove = `Jika seller masih di atas ${formatRupiah(
        normalized.maximumPrice,
      )}, jangan menaikkan budget hanya untuk mengejar transaksi.`

      break

    case 'walk-away':
      nextMove = `Jika seller tidak turun hingga ${formatRupiah(
        normalized.maximumPrice,
      )}, lanjutkan mencari alternatif lain.`

      break

    case 'no-negotiation':
      nextMove =
        'Pertimbangkan menerima harga atau meminta nilai tambahan sebelum checkout.'

      break
  }

  return {
    ...normalized,
    leverage,
    difficulty,
    tactic,
    reasoning,
    strategy,
    nextMove,
    suggestedMessage,
  }
}

/* -------------------------------------------------------------------------- */
/* Metadata for UI                                                            */
/* -------------------------------------------------------------------------- */

export const leverageMeta: Record<
  Leverage,
  {
    label: string
    value: number
    description: string
  }
> = {
  low: {
    label: 'Low',
    value: 30,
    description:
      'Posisi tawar relatif terbatas. Seller berada cukup jauh di atas budget atau buyer memiliki sedikit alternatif.',
  },

  medium: {
    label: 'Medium',
    value: 60,
    description:
      'Ada ruang negosiasi yang cukup, tetapi hasil tetap bergantung pada fleksibilitas seller.',
  },

  high: {
    label: 'High',
    value: 88,
    description:
      'Buyer memiliki posisi yang relatif kuat karena budget dekat dengan harga seller atau memiliki alternatif.',
  },
}

export const tacticMeta: Record<
  NegotiationTactic,
  {
    label: string
    description: string
  }
> = {
  anchor: {
    label: 'Anchoring',
    description:
      'Membuat penawaran awal yang kredibel untuk membentuk titik referensi negosiasi.',
  },

  'ask-first': {
    label: 'Ask First',
    description:
      'Menggali fleksibilitas seller sebelum menentukan angka penawaran.',
  },

  'interest-based': {
    label: 'Interest-Based',
    description:
      'Menggunakan kepentingan dan kondisi transaksi sebagai dasar negosiasi.',
  },

  'immediate-close': {
    label: 'Immediate Close',
    description:
      'Menggunakan kepastian transaksi cepat sebagai nilai tawar.',
  },

  'counter-offer': {
    label: 'Counter Offer',
    description:
      'Memberikan penawaran balik secara bertahap tanpa langsung mencapai batas budget.',
  },

  'walk-away': {
    label: 'Walk Away',
    description:
      'Menjaga reservation point dan tidak mengejar transaksi yang melewati batas.',
  },

  'no-negotiation': {
    label: 'No Negotiation',
    description:
      'Menilai bahwa negosiasi harga agresif tidak diperlukan dalam situasi ini.',
  },
}