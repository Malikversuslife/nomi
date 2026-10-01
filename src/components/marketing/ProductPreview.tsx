"use client";

import { useState } from 'react'
import { Mascot } from './ui'

const OPTIONS = [
  { v: 'x = 4', correct: true },
  { v: 'x = 5.33', correct: false },
  { v: 'x = 6', correct: false },
]

/* Playable Nomi practice question: assessed answer → misconception → next step */
export default function ProductPreview({ className = '' }: { className?: string }) {
  const [pick, setPick] = useState<number | null>(null)
  const chosen = pick === null ? null : OPTIONS[pick]

  return (
    <div className={`card-hover rounded-[28px] border-2 border-b-[6px] border-border bg-card p-5 text-left sm:p-6 ${className}`}>
      <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
        <span className="rounded-full bg-accent-soft px-3 py-1 text-primary">Mathematics · Linear equations</span>
        <span>Try it</span>
      </div>
      <p className="mt-4 text-[15px] font-medium">Solve for x</p>
      <p className="mt-1 font-display text-3xl font-bold tracking-tight">3(x + 2) = 18</p>
      <div className="mt-4 grid grid-cols-3 gap-2" role="group" aria-label="Answer options">
        {OPTIONS.map((o, i) => {
          const state = pick === i ? (o.correct ? 'border-mint bg-mint/15' : 'border-pink bg-pink/15 anim-shake') : 'border-border hover:bg-muted'
          return (
            <button key={o.v} type="button" aria-pressed={pick === i} onClick={() => setPick(i)}
              className={`rounded-2xl border-2 border-b-4 px-2 py-3 text-sm font-bold transition active:translate-y-[2px] active:border-b-2 ${state}`}>
              {o.v}
            </button>
          )
        })}
      </div>
      <div aria-live="polite">
        {chosen && (
          <div key={pick} className="anim-pop">
            <div className="mt-4 flex gap-3 rounded-2xl bg-muted p-4">
              <Mascot mood={chosen.correct ? 'celebrating' : 'thinking'} className="w-14 shrink-0" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{chosen.correct ? 'Nice work' : 'Nomi noticed'}</p>
                <p className="mt-1 text-sm leading-relaxed">
                  {chosen.correct ? 'You expanded the brackets correctly. Ready for something harder?' : chosen.v === 'x = 5.33' ? 'It looks like the 3 was only multiplied by x, not by the 2 inside the brackets. That’s a common one.' : 'Close! Remember to multiply out the brackets before solving.'}
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl bg-ink p-4 text-white dark:bg-white dark:text-ink">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-mint dark:text-[#0f8a65]">Next step</p>
                <p className="mt-0.5 text-sm font-medium">{chosen.correct ? 'A stretch question with brackets on both sides' : 'Two quick questions on expanding brackets'}</p>
              </div>
              <button type="button" onClick={() => setPick(null)} aria-label="Try the question again" className="grid size-9 shrink-0 place-items-center rounded-full bg-yellow text-ink transition hover:rotate-[-90deg]">↺</button>
            </div>
          </div>
        )}
        {!chosen && <p className="mt-4 text-sm text-muted-foreground">Pick an answer to see how Nomi responds.</p>}
      </div>
    </div>
  )
}
