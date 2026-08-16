import { ClipboardList, Cpu, Route, Send } from 'lucide-react'
import { Card } from '@/components/ui/card'

const steps = [
  {
    number: '01',
    icon: ClipboardList,
    title: 'Enter the deal',
    text: "Tell us the seller's price, your budget, and product details.",
  },
  {
    number: '02',
    icon: Cpu,
    title: 'AI analyzes',
    text: 'NegotiAI evaluates your negotiation situation.',
  },
  {
    number: '03',
    icon: Route,
    title: 'Get your strategy',
    text: 'Receive an opening price, target price, maximum price, and negotiation strategy.',
  },
  {
    number: '04',
    icon: Send,
    title: 'Make your move',
    text: 'Use the suggested message to start the negotiation.',
  },
]

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6 sm:py-20"
    >
      <div className="max-w-2xl">
        <h2 className="text-3xl font-semibold tracking-tight text-balance">
          How NegotiAI works
        </h2>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step) => (
          <Card
            key={step.number}
            className="gap-0 p-5 transition-shadow hover:ring-foreground/15"
          >
            <div className="flex items-center justify-between">
              <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <step.icon className="size-4" />
              </span>
              <span className="font-mono text-sm text-muted-foreground/70">
                {step.number}
              </span>
            </div>
            <h3 className="mt-4 text-base font-medium">{step.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {step.text}
            </p>
          </Card>
        ))}
      </div>
    </section>
  )
}
