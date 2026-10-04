"use client";

import { useEffect, useState } from "react";
import Header from "./Header";
import Hero from "./Hero";
import { useReveal } from "./hooks";
import { Companion, FinalCTA, Footer, Loop, Story, SubjectRail, Subjects } from "./Sections";

/** Public marketing homepage. Styles are scoped to .nomi-marketing so app screens are unaffected. */
export default function MarketingPage({ signedIn }: { signedIn: boolean }) {
  const [dark, setDark] = useState(false);
  useReveal();

  useEffect(() => {
    const saved = localStorage.getItem("nomi-theme");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read persisted theme after hydration
    setDark(saved ? saved === "dark" : window.matchMedia?.("(prefers-color-scheme: dark)").matches === true);
  }, []);

  const toggle = () =>
    setDark((d) => {
      localStorage.setItem("nomi-theme", d ? "light" : "dark");
      return !d;
    });

  return (
    <div className={`nomi-marketing min-h-screen overflow-x-clip bg-background font-sans text-foreground ${dark ? "dark" : ""}`}>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-white">
        Skip to content
      </a>
      <Header dark={dark} onToggle={toggle} signedIn={signedIn} />
      <main id="main">
        <Hero signedIn={signedIn} />
        <SubjectRail />
        <Loop />
        <Story />
        <Companion />
        <Subjects />
        <FinalCTA signedIn={signedIn} />
      </main>
      <Footer signedIn={signedIn} />
    </div>
  );
}
