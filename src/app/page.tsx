import type { Metadata } from "next";
import MarketingPage from "@/components/marketing/MarketingPage";
import { getCurrentUser } from "@/server/supabase/auth";

export const metadata: Metadata = {
  title: { absolute: "Nomi | Adaptive AI Learning Companion" },
  description: "Nomi is an adaptive AI learning companion for secondary school maths and science. It notices how you practise and chooses your next step.",
};

export default async function HomePage() {
  const user = await getCurrentUser();
  return <MarketingPage signedIn={Boolean(user)} />;
}
