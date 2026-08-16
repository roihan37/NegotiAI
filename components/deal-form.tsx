'use client'

import { useMemo, useState } from 'react'
import { Sparkles, Loader2, Info } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  conditionOptions,
  formatRupiah,
  parseRupiah,
  platformOptions,
  urgencyOptions,
  willingnessOptions,
  type Condition,
  type DealInput,
  type Platform,
  type Urgency,
  type WillingnessToBuy,
} from '@/lib/negotiation'

interface FormState {
  productName: string
  sellerPrice: string
  budget: string
  condition: Condition | ''
  platform: Platform | ''
  urgency: Urgency | ''
  willingnessToBuy: WillingnessToBuy | ''
  hasAlternatives: boolean
}

const initialState: FormState = {
  productName: '',
  sellerPrice: '',
  budget: '',
  condition: '',
  platform: '',
  urgency: '',
  willingnessToBuy: '',
  hasAlternatives: false,
}

export function DealForm({
  loading,
  onAnalyze,
}: {
  loading: boolean
  onAnalyze: (input: DealInput) => void
}) {
  const [values, setValues] = useState<FormState>(initialState)
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const sellerPriceNum = parseRupiah(values.sellerPrice)
  const budgetNum = parseRupiah(values.budget)

  const errors = useMemo(() => {
    const e: Partial<Record<keyof FormState, string>> = {}
    if (!values.productName.trim()) e.productName = 'Please enter the product name.'
    if (sellerPriceNum <= 0) e.sellerPrice = 'Enter a valid seller price.'
    if (budgetNum <= 0) e.budget = 'Enter a valid budget.'
    return e
  }, [values.productName, sellerPriceNum, budgetNum])

  const isComplete =
    values.productName.trim() !== '' &&
    sellerPriceNum > 0 &&
    budgetNum > 0 &&
    values.condition !== '' &&
    values.platform !== '' &&
    values.urgency !== '' &&
    values.willingnessToBuy !== ''

  const budgetAboveSeller =
    sellerPriceNum > 0 && budgetNum > 0 && budgetNum > sellerPriceNum

  function setRupiah(key: 'sellerPrice' | 'budget', raw: string) {
    const num = parseRupiah(raw)
    setValues((v) => ({ ...v, [key]: num ? formatRupiah(num) : '' }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setTouched({
      productName: true,
      sellerPrice: true,
      budget: true,
      condition: true,
      platform: true,
      urgency: true,
      willingnessToBuy: true,
    })
    if (!isComplete || Object.keys(errors).length > 0) return
    onAnalyze({
      productName: values.productName.trim(),
      sellerPrice: sellerPriceNum,
      budget: budgetNum,
      condition: values.condition as Condition,
      platform: values.platform as Platform,
      urgency: values.urgency as Urgency,
      willingnessToBuy: values.willingnessToBuy as WillingnessToBuy,
      hasAlternatives: values.hasAlternatives,
    })
  }

  return (
    <Card className="gap-0 py-0">
      <CardHeader className="gap-1 border-b p-6">
        <CardTitle className="text-lg">Tell us about your deal</CardTitle>
        <CardDescription>
          Give us a few details and we&apos;ll build your negotiation strategy.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} noValidate>
          <FieldGroup>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Field
                data-invalid={touched.productName && !!errors.productName}
                className="md:col-span-2"
              >
                <FieldLabel htmlFor="productName">Product name</FieldLabel>
                <Input
                  id="productName"
                  placeholder="e.g. iPhone 14 128GB"
                  value={values.productName}
                  aria-invalid={touched.productName && !!errors.productName}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, productName: e.target.value }))
                  }
                  onBlur={() =>
                    setTouched((t) => ({ ...t, productName: true }))
                  }
                />
                {touched.productName && errors.productName ? (
                  <FieldError>{errors.productName}</FieldError>
                ) : null}
              </Field>

              <Field data-invalid={touched.sellerPrice && !!errors.sellerPrice}>
                <FieldLabel htmlFor="sellerPrice">Seller price</FieldLabel>
                <Input
                  id="sellerPrice"
                  inputMode="numeric"
                  placeholder="Rp 8.500.000"
                  value={values.sellerPrice}
                  aria-invalid={touched.sellerPrice && !!errors.sellerPrice}
                  onChange={(e) => setRupiah('sellerPrice', e.target.value)}
                  onBlur={() =>
                    setTouched((t) => ({ ...t, sellerPrice: true }))
                  }
                />
                {touched.sellerPrice && errors.sellerPrice ? (
                  <FieldError>{errors.sellerPrice}</FieldError>
                ) : null}
              </Field>

              <Field data-invalid={touched.budget && !!errors.budget}>
                <FieldLabel htmlFor="budget">Your budget</FieldLabel>
                <Input
                  id="budget"
                  inputMode="numeric"
                  placeholder="Rp 7.500.000"
                  value={values.budget}
                  aria-invalid={touched.budget && !!errors.budget}
                  onChange={(e) => setRupiah('budget', e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, budget: true }))}
                />
                {touched.budget && errors.budget ? (
                  <FieldError>{errors.budget}</FieldError>
                ) : null}
              </Field>

              <Field>
                <FieldLabel htmlFor="condition">Product condition</FieldLabel>
                <Select
                  items={conditionOptions}
                  value={values.condition === '' ? null : values.condition}
                  onValueChange={(value) =>
                    setValues((v) => ({ ...v, condition: value as Condition }))
                  }
                >
                  <SelectTrigger id="condition" className="w-full">
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {conditionOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel htmlFor="platform">Platform</FieldLabel>
                <Select
                  items={platformOptions}
                  value={values.platform === '' ? null : values.platform}
                  onValueChange={(value) =>
                    setValues((v) => ({ ...v, platform: value as Platform }))
                  }
                >
                  <SelectTrigger id="platform" className="w-full">
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {platformOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel htmlFor="urgency">How urgent is this purchase?</FieldLabel>
                <Select
                  items={urgencyOptions}
                  value={values.urgency === '' ? null : values.urgency}
                  onValueChange={(value) =>
                    setValues((v) => ({ ...v, urgency: value as Urgency }))
                  }
                >
                  <SelectTrigger id="urgency" className="w-full">
                    <SelectValue placeholder="Select urgency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {urgencyOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel htmlFor="willingness">How likely are you to buy if the price is right?</FieldLabel>
                <Select
                  items={willingnessOptions}
                  value={values.willingnessToBuy === '' ? null : values.willingnessToBuy}
                  onValueChange={(value) =>
                    setValues((v) => ({ ...v, willingnessToBuy: value as WillingnessToBuy }))
                  }
                >
                  <SelectTrigger id="willingness" className="w-full">
                    <SelectValue placeholder="Select willingness" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {willingnessOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>

              <Field className="md:col-span-2">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="hasAlternatives"
                    checked={values.hasAlternatives}
                    onChange={(e) =>
                      setValues((v) => ({ ...v, hasAlternatives: e.target.checked }))
                    }
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <FieldLabel htmlFor="hasAlternatives" className="m-0 cursor-pointer">
                    I have alternative sellers/products to consider
                  </FieldLabel>
                </div>
              </Field>
            </div>

            {budgetAboveSeller ? (
              <Alert>
                <Info />
                <AlertDescription>
                  Your budget is already above the seller&apos;s asking price.
                  Negotiation may not be necessary.
                </AlertDescription>
              </Alert>
            ) : null}

            <div className="flex flex-col gap-2.5">
              <Button
                type="submit"
                size="lg"
                className="h-11 w-full"
                disabled={!isComplete || loading}
              >
                {loading ? (
                  <>
                    <Loader2 data-icon="inline-start" className="animate-spin" />
                    Analyzing your deal...
                  </>
                ) : (
                  <>
                    <Sparkles data-icon="inline-start" />
                    Analyze This Deal
                  </>
                )}
              </Button>
              <FieldDescription className="text-center">
                Your information is only used to generate your negotiation
                strategy.
              </FieldDescription>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
