import { User, Store } from 'lucide-react'
import type { NegotiationMessage } from '@/lib/negotiation'

export function NegotiationChat({
  messages,
}: {
  messages: NegotiationMessage[]
}) {
  if (messages.length === 0) {
    return null
  }

  return (
    <section className="rounded-2xl border bg-background p-6">
      <div>
        <p className="text-sm font-medium text-muted-foreground">
          Negotiation history
        </p>

        <h3 className="mt-1 text-xl font-semibold">
          Conversation context
        </h3>
      </div>

      <div className="mt-5 flex flex-col gap-4">
        {messages.map((message) => {
          const isBuyer =
            message.role === 'buyer'

          return (
            <div
              key={message.id}
              className={`flex gap-3 ${
                isBuyer
                  ? 'justify-end'
                  : 'justify-start'
              }`}
            >
              {!isBuyer && (
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
                  <Store className="size-4" />
                </div>
              )}

              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  isBuyer
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <p className="mb-1 text-xs font-medium opacity-70">
                  {isBuyer ? 'You' : 'Seller'}
                </p>

                <p className="text-sm leading-6">
                  {message.content}
                </p>
              </div>

              {isBuyer && (
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <User className="size-4 text-primary" />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}