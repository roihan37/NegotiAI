import { Sparkles } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

const links = [
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'About', href: '#about' },
  { label: 'Privacy', href: '#' },
]

export function Footer() {
  return (
    <footer className="border-t border-border/70">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        {/* Disclaimer */}
        <p className="mx-auto max-w-3xl text-center text-xs leading-relaxed text-muted-foreground">
          NegotiAI provides AI-generated negotiation suggestions based on the
          information you provide. It does not guarantee market prices, seller
          acceptance, or savings.
        </p>

        <Separator className="my-10" />

        <div className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
          <div className="max-w-xs">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Sparkles className="size-3.5" />
              </span>
              <span className="text-sm font-semibold tracking-tight">
                NegotiAI
              </span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Smart negotiation powered by AI.
            </p>
          </div>

          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-border/70 pt-6">
          <span className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} NegotiAI
          </span>
          <span className="text-xs text-muted-foreground">
            Powered by Gemini
          </span>
        </div>
      </div>
    </footer>
  )
}
