import type { Metadata } from "next";
import MarketingPage from "@/components/marketing/MarketingPage";

export const metadata: Metadata = {
  title: { absolute: "Nomi | Adaptive AI Learning Companion" },
  description: "Nomi is an adaptive AI learning companion for secondary school maths and science. It notices how you practise and chooses your next step.",
};

export default function HomePage() {
  return <MarketingPage />;
}
