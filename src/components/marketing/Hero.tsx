import { SIGN_IN, SIGN_UP } from './links'
import ProductPreview from './ProductPreview'
import { Button, Mascot, SubjectArt } from './ui'

export default function Hero() {
  return (
    <section id="top" className="mx-auto grid lg:min-h-[min(calc(100svh-72px),860px)] max-w-6xl items-center gap-12 px-5 py-14 md:px-8 lg:grid-cols-2 lg:gap-16">
      <div className="relative mx-auto w-full max-w-[480px] anim-rise">
        <SubjectArt subject="mathematics" className="anim-bob absolute -left-4 top-0 w-24 sm:w-28" />
        <SubjectArt subject="biology" className="anim-bob absolute -right-2 top-10 w-20 [animation-delay:-2s] sm:w-24" />
        <div className="flex justify-center">
          <Mascot mood="curious" eager alt="Nomi, a friendly purple character, looking curious" className="relative w-56 sm:w-72" />
        </div>
        <ProductPreview className="relative -mt-6" />
      </div>
      <div className="mx-auto max-w-md text-center anim-rise [animation-delay:.1s] lg:mx-0">
        <p className="text-sm font-bold uppercase tracking-[0.14em] text-muted-foreground">Your adaptive learning companion</p>
        <h1 className="mt-4 font-display text-[clamp(2.4rem,5vw,3.6rem)] font-extrabold leading-[1.02] tracking-[-0.03em]">
          Learning that <span className="text-primary">learns you.</span>
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
          Nomi notices how you perform as you practise and chooses what should come next.
        </p>
        <div className="mx-auto mt-8 grid max-w-sm gap-3">
          <Button href={SIGN_UP}>Start learning</Button>
          <Button href={SIGN_IN} variant="ghost">I already have an account</Button>
        </div>
      </div>
    </section>
  )
}
