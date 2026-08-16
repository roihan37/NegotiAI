import { Navbar } from '@/components/navbar'
import { Hero } from '@/components/hero'
import { Negotiator } from '@/components/negotiator'
import { HowItWorks } from '@/components/how-it-works'
import { ExampleScenario } from '@/components/example-scenario'
import { Footer } from '@/components/footer'

export default function Page() {
  return (
    <div id="top" className="min-h-dvh">
      <Navbar />
      <main>
        <Hero />
        <Negotiator />
        <div className="border-t border-border/70 bg-muted/30">
          <HowItWorks />
          <ExampleScenario />
        </div>
      </main>
      <Footer />
    </div>
  )
}
