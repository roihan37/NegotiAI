import { ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-mono text-sm font-medium tabular-nums">
        {value}
      </span>
    </div>
  )
}

export function ExampleScenario() {
  return (
    <section
      id="about"
      className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6 sm:py-20"
    >
      <div className="max-w-2xl">
        <h2 className="text-3xl font-semibold tracking-tight text-balance">
          See it in action
        </h2>
        <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
          A quick look at the numbers and message NegotiAI produces from a
          real-world deal.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>The deal</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Row label="Product" value="iPhone 14 128GB" />
            <Separator />
            <Row label="Seller price" value="Rp 8.500.000" />
            <Separator />
            <Row label="Your budget" value="Rp 7.500.000" />
          </CardContent>
        </Card>

        <Card className="bg-accent/40 ring-primary/15">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRight className="size-4 text-primary" />
              NegotiAI suggests
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Row label="Opening" value="Rp 7.000.000" />
            <Separator />
            <Row label="Target" value="Rp 7.400.000" />
            <Separator />
            <Row label="Maximum" value="Rp 7.500.000" />
            <figure className="mt-2 rounded-lg border-l-2 border-primary/40 bg-card px-4 py-3">
              <blockquote className="text-pretty text-sm leading-relaxed text-foreground/90">
                &ldquo;Kak, kalau Rp7,4 juta bisa? Kalau cocok saya bisa
                langsung checkout hari ini.&rdquo;
              </blockquote>
            </figure>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
