import { useEffect } from 'react'

/* Adds .is-in to every .reveal element as it scrolls into view */
export function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('.reveal')
    if (typeof IntersectionObserver === 'undefined') {
      els.forEach((el) => el.classList.add('is-in'))
      return
    }
    const root = document.querySelector('.nomi-marketing')
    // Only hide content below the fold, so anything already visible never flashes
    els.forEach((el) => { if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-in') })
    root?.setAttribute('data-reveal', 'on')
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target) }
    }), { threshold: 0.15, rootMargin: '0px 0px -40px 0px' })
    els.forEach((el) => io.observe(el))
    return () => { io.disconnect(); root?.removeAttribute('data-reveal') }
  }, [])
}
