"use client";

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { SIGN_IN, SIGN_UP } from './links'
import { Button, Wordmark } from './ui'

export default function Header({ dark, onToggle }: { dark: boolean; onToggle: () => void }) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 560)
    onScroll(); window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const toggle = (
    <button type="button" onClick={onToggle} aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'} className="grid size-10 place-items-center rounded-full border border-border text-foreground hover:border-primary">
      <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        {dark ? <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></> : <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />}
      </svg>
    </button>
  )

  return (
    <header className={`sticky top-0 z-50 border-b-2 bg-background/95 backdrop-blur transition-colors ${scrolled ? 'border-border' : 'border-transparent'}`}>
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 md:px-8">
        <a href="#top" aria-label="Nomi home"><Wordmark className="h-8" /></a>
        <div className="hidden items-center gap-3 lg:flex">
          {toggle}
          <Link href={SIGN_IN} className="px-3 py-2 text-[15px] font-semibold hover:text-primary">Sign in</Link>
          <Button href={SIGN_UP} className="!py-2.5">Start learning</Button>
        </div>
        <div className="flex items-center gap-2 lg:hidden">
          {scrolled && !open && <Button href={SIGN_UP} className="anim-pop !px-4 !py-2 !text-xs">Start</Button>}
          {toggle}
          <button type="button" aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen((o) => !o)} className="grid size-10 place-items-center rounded-full bg-foreground text-background">
            <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
              {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>
      {open && (
        <div id="mobile-menu" className="border-t border-border bg-background px-5 pb-6 lg:hidden">
          <div className="grid gap-3 pt-4">
            <Button href={SIGN_UP}>Start learning</Button>
            <Button href={SIGN_IN} variant="ghost">Sign in</Button>
          </div>
        </div>
      )}
    </header>
  )
}
