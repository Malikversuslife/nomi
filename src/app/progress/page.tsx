import { ConfigurationNotice } from "@/components/app-shell/configuration-notice";
import { FoundationShell } from "@/components/app-shell/foundation-shell";
import { ProgressExperience } from "@/components/progress/progress-experience";
import { hasSupabaseConfig } from "@/server/env";
import { buildProgressExperience } from "@/server/progress/presentation";
import { requireUser } from "@/server/supabase/auth";
import { createServerSupabaseClient } from "@/server/supabase/server";
import { getMobileCurriculum } from "@/server/data/mobile-curriculum";

export default async function ProgressPage() {
  if (!hasSupabaseConfig()) {
    return (
      <FoundationShell active="Progress">
        <ConfigurationNotice />
      </FoundationShell>
    );
  }

  const user = await requireUser();
  const [data, curriculum] = await Promise.all([buildProgressExperience(user.id), getMobileCurriculum(user.id)]);
  const supabase = await createServerSupabaseClient();
  const { data: latestProgress } = await supabase.from("topic_progress")
    .select("id,topic_id,mastery,difficulty")
    .eq("user_id", user.id).order("updated_at", { ascending: false }).limit(1).maybeSingle();
  const [misconceptionResult, attemptsResult] = latestProgress ? await Promise.all([
    supabase.from("misconception_state").select("category,status,occurrence_count")
      .eq("user_id", user.id).eq("topic_progress_id", latestProgress.id)
      .neq("status", "resolved").order("last_seen_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("practice_attempts").select("is_correct")
      .eq("user_id", user.id).eq("topic_id", latestProgress.topic_id)
      .order("created_at", { ascending: false }).limit(5),
  ]) : [{ data: null }, { data: [] }];
  const activeTopic = curriculum.topics.find((topic) => topic.id === latestProgress?.topic_id);
  const recentAttempts = attemptsResult.data ?? [];
  const correctCount = recentAttempts.filter((attempt) => attempt.is_correct === true).length;
  const misconception = misconceptionResult.data;

  return (
    <FoundationShell active="Progress">
      <div className="mx-auto max-w-[900px] space-y-8">
      {latestProgress ? <section className="space-y-4">
        <div className="nomi-feature rounded-[var(--nomi-radius-feature)] p-6">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-nomi-purple-600">{activeTopic?.name ?? "Current topic"} mastery</p>
          <p className="mt-2 font-display text-5xl font-extrabold text-nomi-purple-600">{latestProgress.mastery}<span className="ml-1 text-lg text-nomi-muted">/ 100</span></p>
          <p className="mt-2 text-xs font-semibold text-nomi-purple-600">Live learner data · Level {latestProgress.difficulty}</p>
        </div>
        {misconception ? <div className="nomi-card rounded-[var(--nomi-radius-feature)] p-6">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-nomi-purple-600">What Nomi has noticed</p>
          <div className="mt-2 flex items-center justify-between gap-3"><h2 className="font-display text-xl font-bold capitalize text-nomi-ink">{misconception.category.replace(/[_-]+/g, " ")}</h2><span className="rounded-full bg-nomi-purple-100 px-3 py-1 text-xs font-bold capitalize text-nomi-purple-600">{misconception.status}</span></div>
          <p className="mt-2 text-sm text-nomi-muted">{misconception.occurrence_count} misconception {misconception.occurrence_count === 1 ? "signal" : "signals"} recorded</p>
          <div className="mt-4 flex justify-between gap-2 text-[10px] font-semibold text-nomi-muted">{["Noticed", "Recurring", "Improving", "Resolved"].map((stage) => <span key={stage} className={stage.toLowerCase() === misconception.status || stage === "Noticed" && misconception.status === "active" ? "font-extrabold text-nomi-purple-600" : ""}>{stage}</span>)}</div>
        </div> : null}
        {recentAttempts.length ? <div className="nomi-card rounded-[var(--nomi-radius-feature)] p-6"><p className="text-xs font-bold uppercase tracking-[0.12em] text-nomi-purple-600">Recent assessed Practice</p><h2 className="mt-2 font-display text-2xl font-bold text-nomi-ink">{activeTopic?.name ?? "Current topic"}</h2><p className="mt-2 text-sm text-nomi-muted">{correctCount} / {recentAttempts.length} recent answers correct</p></div> : null}
      </section> : null}
      <ProgressExperience data={data} />
      </div>
    </FoundationShell>
  );
}
