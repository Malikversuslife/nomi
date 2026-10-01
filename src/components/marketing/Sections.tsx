"use client";

import { NomiWordmark } from '@/components/nomi/nomi-wordmark'
import Image from 'next/image'
import Link from 'next/link'
import { UPCOMING_ICONS } from './upcoming-icons'
import { SECTIONS, SIGN_IN, SIGN_UP, SUBJECTS, UPCOMING } from './links'
import { Button, Eyebrow, Mascot, SubjectArt } from './ui'
import { useState, type ReactNode } from 'react'

const H2 = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <h2 className={`font-display text-[clamp(2.2rem,4.6vw,3.8rem)] font-extrabold leading-[1] tracking-[-0.03em] ${className}`}>{children}</h2>
)

function RailItems({ hidden = false }: { hidden?: boolean }) {
  const item = 'group flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-bold uppercase tracking-[0.08em]'
  return (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center gap-x-6 pr-6">
      {SUBJECTS.map((s) => (
        <li key={s.key}>
          <a href="#subjects" tabIndex={hidden ? -1 : undefined} className={`${item} text-muted-foreground hover:bg-muted hover:text-foreground`}>
            <span className="grid h-10 w-11 place-items-center"><SubjectArt subject={s.key} className="w-11 transition group-hover:-rotate-12 group-hover:scale-125" /></span>
            {s.name}
          </a>
        </li>
      ))}
      {UPCOMING.map((u) => (
        <li key={u.name} className={`${item} text-muted-foreground/70`}>
          <span className="grid h-10 w-11 place-items-center"><Image src={UPCOMING_ICONS[u.icon]} alt="" width={96} height={96} unoptimized className="w-8 transition group-hover:-rotate-12 group-hover:scale-125" /></span>
          {u.name}
          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] tracking-[0.06em] text-muted-foreground">Soon</span>
        </li>
      ))}
    </ul>
  )
}

export function SubjectRail() {
  return (
    <section aria-label="Subjects: Mathematics, Physics, Chemistry and Biology available now, more coming soon" className="marquee overflow-hidden border-y-2 border-border bg-background py-2">
      <div className="marquee-track flex w-max">
        <RailItems />
        <RailItems hidden />
      </div>
    </section>
  )
}

const STEPS = [
  { n: '01', title: 'Practise', body: 'Answer assessed questions at your level. Every response counts, right, wrong or unsure.', color: 'bg-yellow' },
  { n: '02', title: 'Nomi notices', body: 'Patterns in your answers reveal mastery, mistakes, misconceptions and confidence.', color: 'bg-pink' },
  { n: '03', title: 'Your next step adapts', body: 'Difficulty, explanation, reinforcement or a fresh challenge, chosen for you, right now.', color: 'bg-mint' },
]

export function Loop() {
  return (
    <section id="how-it-works" className="bg-accent-soft"><div className="mx-auto max-w-6xl px-5 py-24 md:px-8 lg:py-28">
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr] lg:items-end">
        <div><Eyebrow>How it works</Eyebrow><H2 className="mt-4 text-primary">one loop. always moving forward.</H2></div>
        <p className="max-w-lg text-lg text-muted-foreground lg:justify-self-end">Nomi isn’t a chatbot you have to know what to ask. It watches how you practise and quietly does the planning.</p>
      </div>
      <ol className="mt-16 grid gap-5 md:grid-cols-3">
        {STEPS.map((s, i) => (
          <li key={s.n} style={{ transitionDelay: `${i * 120}ms` }} className="reveal card-hover relative rounded-[28px] border-2 border-b-[6px] border-border bg-card p-7">
            <span className={`inline-grid size-12 place-items-center rounded-full font-display text-lg font-extrabold text-ink ${s.color}`}>{s.n}</span>
            <h3 className="mt-8 font-display text-2xl font-bold">{s.title}</h3>
            <p className="mt-3 leading-relaxed text-muted-foreground">{s.body}</p>
            {i < 2 && <span aria-hidden className="absolute -right-4 top-12 z-10 hidden size-8 place-items-center rounded-full bg-foreground text-sm text-background md:grid">→</span>}
          </li>
        ))}
      </ol>
      <p className="mt-6 text-center text-sm text-muted-foreground">…and then you practise again, a little sharper each time.</p>
    </div></section>
  )
}

/* Small composed UI cards for each story beat */
const Chip = ({ children, tone }: { children: ReactNode; tone: string }) => <span className={`rounded-full px-3 py-1 text-xs font-semibold text-ink ${tone}`}>{children}</span>

function DifficultyUI() {
  return (
    <div className="space-y-3">
      {[['Warm-up', 'Correct', 'bg-mint'], ['Core', 'Correct', 'bg-mint'], ['Stretch', 'Next up', 'bg-yellow']].map(([l, s, t], i) => (
        <div key={l} className="flex items-center justify-between rounded-2xl border border-border bg-background px-4 py-3.5" style={{ marginLeft: `${i * 1.25}rem` }}>
          <span className="font-medium">{l} question</span><Chip tone={t}>{s}</Chip>
        </div>
      ))}
      <p className="pt-2 text-sm text-muted-foreground">Two in a row, so Nomi raises the difficulty.</p>
    </div>
  )
}
function ExplainUI() {
  return (
    <div className="space-y-3">
      <div className="rounded-2xl bg-background p-4 text-sm leading-relaxed text-muted-foreground line-through decoration-pink/70">Momentum is the product of mass and velocity, p = mv.</div>
      <div className="rounded-2xl border-2 border-primary bg-background p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">Let’s try another way</p>
        <p className="mt-2 text-sm leading-relaxed">Imagine stopping a bowling ball and a tennis ball rolling at the same speed. Which is harder? That “hard to stop” feeling is momentum.</p>
      </div>
    </div>
  )
}
function MisconceptionUI() {
  return (
    <div className="space-y-3">
      <div className="rounded-2xl bg-background p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Misconception spotted</p>
        <p className="mt-1.5 font-medium">Thinks plants get their mass from the soil</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Chip tone="bg-pink">Photosynthesis</Chip><Chip tone="bg-accent-soft dark:bg-[#c9b8ff]">Carbon dioxide</Chip><Chip tone="bg-mint">3 targeted questions</Chip>
      </div>
    </div>
  )
}
function ProgressUI() {
  const rows = [['Balancing equations', 82, 'Improved'], ['Ionic bonding', 64, 'Steady'], ['Moles & mass', 38, 'Needs attention']] as const
  return (
    <ul className="space-y-4">
      {rows.map(([t, v, s]) => (
        <li key={t}>
          <div className="flex justify-between text-sm"><span className="font-medium">{t}</span><span className="text-muted-foreground">{s}</span></div>
          <div className="mt-2 h-2.5 rounded-full bg-background"><div className={`h-full rounded-full ${v > 70 ? 'bg-mint' : v > 50 ? 'bg-yellow' : 'bg-pink'}`} style={{ width: `${v}%` }} /></div>
        </li>
      ))}
      <li className="pt-1 text-xs text-muted-foreground">Illustrative example of a progress view.</li>
    </ul>
  )
}
function NextUI() {
  return (
    <div className="rounded-2xl bg-primary p-5 text-white">
      <p className="text-xs font-semibold uppercase tracking-wider text-white/75">Nomi recommends</p>
      <p className="mt-2 font-display text-2xl font-bold leading-tight">Revisit moles & mass: 10 minutes</p>
      <p className="mt-2 text-sm text-white/80">You were close last time. A short, focused set should lock it in.</p>
      <span className="mt-4 inline-block rounded-full bg-yellow px-4 py-2 text-sm font-semibold text-ink">Start session</span>
    </div>
  )
}

const STORIES = [
  { eyebrow: 'Assessed practice', title: 'Difficulty that moves with you.', body: "Every question is assessed. Get it right and Nomi stretches you; struggle and it steps back to rebuild the foundation. No more working through a set that's too easy or too hard.", ui: <DifficultyUI />, mood: 'challenge' },
  { eyebrow: 'Explanations', title: "If one explanation doesn't land, Nomi tries another.", body: 'A worked example, an everyday analogy, a smaller step. Nomi changes the approach rather than repeating the same words louder.', ui: <ExplainUI />, mood: 'supportive' },
  { eyebrow: 'Misconceptions', title: 'It spots the idea behind the mistake.', body: 'Wrong answers often share a cause. Nomi names the misconception and follows up with targeted reinforcement until it clears.', ui: <MisconceptionUI />, mood: 'reinforcing' },
  { eyebrow: 'Progress', title: 'See what improved, and what needs you.', body: 'Progress shows topic by topic, so you know where you have grown and where a little more attention will pay off.', ui: <ProgressUI />, mood: null },
  { eyebrow: 'Next action', title: 'Always know what to do next.', body: "Open Nomi and there's a useful next step waiting, chosen from everything it has noticed so far.", ui: <NextUI />, mood: 'encouraging' },
]

export function Story() {
  return (
    <section id="what-nomi-adapts" className="bg-accent-soft pb-24 lg:pb-32">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="mx-auto max-w-3xl border-t-2 border-primary/15 pt-24 text-center">
          <Eyebrow>What Nomi adapts</Eyebrow>
          <H2 className="mt-4">A little less guessing.<br /><span className="text-primary">A lot more learning.</span></H2>
        </div>
        <div className="mt-20 space-y-24 lg:space-y-32">
          {STORIES.map((s, i) => (
            <article key={s.title} className="reveal grid items-center gap-10 lg:grid-cols-2 lg:gap-20">
              <div className={i % 2 ? 'lg:order-2' : ''}>
                <Eyebrow>{s.eyebrow}</Eyebrow>
                <h3 className="mt-3 font-display text-[clamp(1.9rem,3.4vw,2.8rem)] font-extrabold lowercase leading-[1.05] tracking-[-0.02em] text-primary">{s.title}</h3>
                <p className="mt-5 max-w-md text-lg leading-relaxed text-muted-foreground">{s.body}</p>
              </div>
              <div className="relative">
                <div className="card-hover rotate-[-1.5deg] rounded-[32px] border-2 border-b-[8px] border-border bg-card p-6 sm:p-8">{s.ui}</div>
                {s.mood && <Mascot mood={s.mood} alt={`Nomi looking ${s.mood}`} className={`absolute -top-10 w-20 sm:w-24 lg:-top-14 lg:w-28 ${i % 2 ? '-left-2 lg:-left-12' : '-right-2 lg:-right-10'}`} />}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

const MOODS = [
  { mood: 'encouraging', when: 'When you are stuck', how: 'Breaks the problem down and offers a gentler way in.' },
  { mood: 'challenge', when: 'When you are on a roll', how: 'Raises the bar with a harder question to stretch you.' },
  { mood: 'thinking', when: 'When a mistake repeats', how: 'Looks for the misconception underneath and targets it.' },
  { mood: 'supportive', when: 'When confidence dips', how: 'Reassures you, eases the pace and rebuilds from what you know.' },
  { mood: 'reinforcing', when: 'When an idea needs repeating', how: 'Brings it back in a fresh form until it sticks.' },
  { mood: 'celebrating', when: 'When something clicks', how: 'Marks the win, then moves you to what comes next.' },
]

export function Companion() {
  const [active, setActive] = useState(0)
  const m = MOODS[active]
  return (
    <section className="bg-ink text-white"><div className="mx-auto max-w-6xl px-5 py-24 md:px-8 lg:py-32">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
        <div className="reveal">
          <Eyebrow>Meet your companion</Eyebrow>
          <H2 className="mt-4 uppercase italic text-yellow">Nomi reads the moment.</H2>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-white/75">Warm when it’s hard, playful when it’s going well, honest when something needs another look. Pick a moment to see how Nomi responds.</p>
          <div role="tablist" aria-label="Learning moments" className="mt-8 flex flex-wrap gap-2">
            {MOODS.map((x, i) => (
              <button key={x.mood} role="tab" id={`mood-${i}`} aria-selected={i === active} aria-controls="mood-panel" onClick={() => setActive(i)}
                className={`rounded-2xl border-2 border-b-4 px-4 py-2.5 text-sm font-bold transition active:translate-y-[2px] active:border-b-2 ${i === active ? 'border-mint bg-mint text-ink' : 'border-white/15 text-white/80 hover:border-white/40'}`}>
                {x.when}
              </button>
            ))}
          </div>
        </div>
        <div id="mood-panel" role="tabpanel" aria-labelledby={`mood-${active}`} className="relative grid place-items-center">
          <div aria-hidden className="absolute size-72 rounded-full bg-primary/40 blur-3xl sm:size-96" />
          <div key={m.mood} className="anim-pop relative flex flex-col items-center text-center">
            <Mascot mood={m.mood} alt={`Nomi looking ${m.mood}`} className="w-56 sm:w-72" />
            <p className="card-hover mt-4 max-w-xs rounded-3xl border-2 border-white/15 bg-white/5 px-5 py-4 text-lg font-medium">{m.how}</p>
          </div>
        </div>
      </div>
    </div></section>
  )
}

export function Subjects() {
  return (
    <section id="subjects" className="py-24 lg:py-32">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="relative"><Mascot mood="neutral" alt="Nomi, ready to start" className="mb-4 w-24 sm:w-28" /><Eyebrow>Subjects</Eyebrow><H2 className="mt-4 lowercase text-primary">four subjects to start.</H2></div>
          <p className="max-w-sm text-muted-foreground">Built for secondary school learners. More subjects can be added over time as they’re ready.</p>
        </div>
        <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {SUBJECTS.map((s) => (
            <li key={s.key} className={`reveal card-hover group flex flex-col rounded-[28px] border-2 border-b-[6px] border-black/5 p-6 dark:border-white/10 ${s.tint}`}>
              <SubjectArt subject={s.key} alt={`${s.name} illustration`} className="card-art mx-auto w-40" />
              <h3 className="mt-4 font-display text-2xl font-bold">{s.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.blurb}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export function FinalCTA() {
  return (
    <section className="relative">
      <div className="mx-auto max-w-3xl px-5 pb-10 pt-8 text-center">
        <h2 className="font-display text-[clamp(2.4rem,5.5vw,4.2rem)] font-extrabold lowercase leading-[1] tracking-[-0.03em] text-primary">your next small win starts here.</h2>
        <div className="mx-auto mt-8 grid max-w-xs gap-3">
          <Button href={SIGN_UP}>Start learning</Button>
          <Button href={SIGN_IN} variant="ghost">Sign in</Button>
        </div>
      </div>
      <div className="relative mt-6 h-64 overflow-hidden md:h-80" aria-hidden>
        <svg viewBox="0 0 1440 200" preserveAspectRatio="none" className="absolute bottom-0 h-[70%] w-full fill-purple"><path d="M0 80C240 0 420 140 720 70s520-20 720 30V200H0Z" /></svg>
        <div className="absolute inset-x-0 bottom-0 mx-auto flex max-w-4xl items-end justify-center gap-4 px-5">
          <SubjectArt subject="chemistry" className="anim-bob mb-16 w-16 md:w-24" />
          <SubjectArt subject="physics" className="anim-bob mb-24 w-14 [animation-delay:-2s] md:w-20" />
          <Mascot mood="celebrating" className="relative w-40 md:w-56" />
          <SubjectArt subject="mathematics" className="anim-bob mb-24 w-14 [animation-delay:-4s] md:w-20" />
          <SubjectArt subject="biology" className="anim-bob mb-16 w-16 [animation-delay:-1s] md:w-24" />
        </div>
      </div>
    </section>
  )
}

export function Footer() {
  const link = 'text-white/80 hover:text-white'
  return (
    <footer className="bg-purple text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 border-t border-white/20 px-5 py-14 md:flex-row md:justify-between md:px-8">
        <div><NomiWordmark variant="inverse" width={126} label="Nomi" className="h-9 w-auto" /><p className="mt-4 max-w-xs text-sm text-white/80">Nomi learns how you learn.</p></div>
        <div className="grid grid-cols-2 gap-12 text-sm">
          <nav aria-label="Product"><p className="font-bold">Product</p><ul className="mt-3 space-y-2">{SECTIONS.map((s) => <li key={s.id}><a className={link} href={`#${s.id}`}>{s.label}</a></li>)}</ul></nav>
          <nav aria-label="Account"><p className="font-bold">Account</p><ul className="mt-3 space-y-2"><li><Link className={link} href={SIGN_IN}>Sign in</Link></li><li><Link className={link} href={SIGN_UP}>Start learning</Link></li></ul></nav>
        </div>
      </div>
      <p className="mx-auto max-w-6xl px-5 pb-10 text-xs text-white/70 md:px-8">© {new Date().getFullYear()} Nomi. All rights reserved. · 3D subject icons by <a className="underline hover:text-white" href="https://icons8.com" target="_blank" rel="noreferrer">Icons8</a></p>
    </footer>
  )
}
