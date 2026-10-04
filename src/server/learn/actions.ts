"use server";

import { revalidatePath } from "next/cache";
import { getSubjects } from "@/server/data/curriculum";
import { getCurrentUser } from "@/server/supabase/auth";
import { createServerSupabaseClient } from "@/server/supabase/server";

export async function addLearnerSubjectAction(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  const slug = formData.get("subjectSlug");
  if (!user || typeof slug !== "string") return;

  const subject = (await getSubjects()).find(
    (candidate) => candidate.slug === slug && candidate.availability === "available",
  );
  if (!subject) return;

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("learner_subjects").upsert(
    { user_id: user.id, subject_id: subject.id, status: "active" },
    { onConflict: "user_id,subject_id" },
  );
  if (error) throw new Error("Unable to add that subject right now.");

  revalidatePath("/learn");
  revalidatePath("/home");
  revalidatePath("/progress");
}
