import { redirect } from "next/navigation";
import Link from "next/link";
import { ConfigurationNotice } from "@/components/app-shell/configuration-notice";
import { FoundationShell } from "@/components/app-shell/foundation-shell";
import { NomiCharacter } from "@/components/nomi/nomi-character";
import { ButtonLink } from "@/components/ui/button";
import { SubjectCard } from "@/components/curriculum/subject-card";
import { RecentLearning } from "@/components/learner/recent-learning";
import { deriveHomeViews } from "@/domain/home/presentation";
import { hasSupabaseConfig } from "@/server/env";
import { getSubjectsWithTopicHierarchy } from "@/server/data/curriculum";
import { getLearnerSubjects, getTopicProgress } from "@/server/data/learner";
import { getOnboardingStatus } from "@/server/onboarding/status";
import { requireUser } from "@/server/supabase/auth";
import { getMobileCurriculum } from "@/server/data/mobile-curriculum";

const DISPLAY_SUBJECTS = ["Mathematics", "Physics", "Chemistry", "Biology"];

export default async function HomeRoutePage() {
  if (!hasSupabaseConfig()) {
    return <FoundationShell active="Home"><ConfigurationNotice /></FoundationShell>;
  }

  const user = await requireUser();
  const status = await getOnboardingStatus(user.id);
  const [subjects, learnerSubjects, topicProgress, mobileCurriculum] = await Promise.all([
    getSubjectsWithTopicHierarchy(),
    getLearnerSubjects(user.id),
    getTopicProgress(user.id),
    getMobileCurriculum(user.id),
  ]);

  // A genuinely new learner lands in onboarding rather than a blank Home.
  // Skipped when there is no curriculum, so onboarding cannot trap them.
  if (status === "needs-onboarding" && subjects.length > 0) {
    redirect("/onboarding");
  }

  // Resolve the learner's enrolled subject name (no UUIDs exposed)
  let enrolledSubject: string | undefined;
  if (learnerSubjects.length > 0) {
    const learnerSubjectId = learnerSubjects[0]?.subject_id;
    if (typeof learnerSubjectId === "string") {
      enrolledSubject = subjects.find((s) => (s.id as string) === learnerSubjectId)?.name;
    }
  }

  // Truthful home views: real topic names and persisted practice timestamps.
  const home = deriveHomeViews(topicProgress, new Date());
  const current = mobileCurriculum.currentTopic;
  const completedCount = mobileCurriculum.topics.filter((topic) => topic.state === "completed").length;
  const totalCount = mobileCurriculum.topics.length;
  const practiceHref = current ? `/practice?topic=${encodeURIComponent(current.id)}` : "/learn";

  return (
    <FoundationShell active="Home">
      <div className="mx-auto max-w-[820px] space-y-8">
        <section className="nomi-feature relative min-h-52 overflow-hidden rounded-[var(--nomi-radius-feature)] p-7 sm:p-10">
          <div className="relative z-10 max-w-[70%]">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-nomi-purple-600">{mobileCurriculum.isPathComplete ? "Path complete" : "Today with Nomi"}</p>
            <h1 className="mt-3 font-display text-[2.15rem] font-semibold leading-[1.05] tracking-[-0.045em] text-nomi-ink sm:text-[2.75rem]">{mobileCurriculum.isPathComplete ? "Nice work. What should we learn next?" : "Ready for your next small win?"}</h1>
            <p className="mt-4 max-w-sm text-[0.95rem] leading-6 text-nomi-muted">{mobileCurriculum.isPathComplete ? "Your path is complete. Nomi can help you review or move forward." : "Nomi is using your assessed practice to choose what deserves your attention next."}</p>
          </div>
          <NomiCharacter state={mobileCurriculum.isPathComplete ? "celebrating" : "encouraging"} size={128} className="absolute bottom-1 right-2 sm:bottom-3 sm:right-6" />
        </section>

        <section>
          <div className="mb-3 flex justify-between text-xs font-bold uppercase tracking-[0.11em] text-nomi-muted"><span>{mobileCurriculum.isPathComplete ? "Mastered path" : "Next up"}</span><span className="normal-case tracking-normal text-nomi-purple-600">{mobileCurriculum.subject?.name ?? enrolledSubject ?? "Mathematics"}</span></div>
          <div className="nomi-card rounded-[var(--nomi-radius-feature)] p-6 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.11em] text-nomi-purple-600">{current?.parentName ?? "Your learning path"}</p>
                <h2 className="mt-2 font-display text-[1.7rem] font-semibold tracking-[-0.035em] text-nomi-ink">{current?.name ?? (mobileCurriculum.isPathComplete ? "Quadratic equations" : "Choose your next topic")}</h2>
                <p className="mt-1.5 text-sm text-nomi-muted">{current ? `${current.mastery}/100 mastery · ${current.difficulty}/10 difficulty` : `${completedCount} of ${totalCount} topics mastered`}</p>
              </div>
              <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-nomi-surface-subtle"><strong className="text-sm text-nomi-ink">{current?.mastery ?? (mobileCurriculum.isPathComplete ? 100 : 0)}%</strong><span className="text-[9px] text-nomi-muted">mastery</span></div>
            </div>
            <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-nomi-purple-50"><div className="h-full rounded-full bg-nomi-purple-600" style={{ width: `${current?.mastery ?? (mobileCurriculum.isPathComplete ? 100 : 0)}%` }} /></div>
            <ButtonLink href={practiceHref} className="mt-5 w-full">{mobileCurriculum.isPathComplete ? "Explore learning" : "Continue learning"}</ButtonLink>
          </div>
        </section>

        <Link href={current ? `/nomi?topic=${encodeURIComponent(current.id)}` : "/nomi"} className="nomi-card group flex items-center gap-5 rounded-[var(--nomi-radius-feature)] p-5 transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgb(0_0_0/0.08)]">
          <NomiCharacter state="curious" size={56} className="shrink-0" />
          <div><p className="text-xs font-bold uppercase tracking-[0.11em] text-nomi-purple-600">Nomi noticed</p><p className="mt-1 font-display text-[1.05rem] font-semibold tracking-[-0.02em] text-nomi-ink">{current ? `${current.name} is the clearest next move.` : "Let's find your next move."}</p><p className="mt-1 text-sm leading-6 text-nomi-muted">The next practice set will adapt around your recent accuracy and mistakes.</p></div>
        </Link>

        <section><div className="mb-2 flex justify-between text-[10px] font-extrabold uppercase tracking-[0.12em] text-nomi-muted"><span>Your path</span><span className="text-nomi-purple-600">{completedCount}/{totalCount}</span></div><div className="space-y-2">{mobileCurriculum.topics.map((topic) => {
          const content = <><span className="font-semibold text-nomi-ink">{topic.name}</span><span className="text-xs font-bold text-nomi-purple-600">{topic.state === "completed" ? "Mastered" : topic.state === "current" ? "Next up" : topic.state === "next" ? "Coming up" : "Locked"}</span></>;
          const className = "nomi-card flex min-h-14 items-center justify-between rounded-[var(--nomi-radius-large)] px-4 py-3 text-sm transition-[transform,box-shadow] duration-200 hover:-translate-y-px";
          return topic.state === "current" || topic.state === "completed"
            ? <Link key={topic.id} href={`/practice?topic=${encodeURIComponent(topic.id)}`} className={className}>{content}</Link>
            : <div key={topic.id} className={`${className} opacity-60`}>{content}</div>;
        })}</div></section>
      <SubjectCard subjects={DISPLAY_SUBJECTS} activeSubject={enrolledSubject} />

      <RecentLearning
        records={home.recentLearning.map((record) => ({
          topic: record.topic,
          lastPractised: record.lastPracticedLabel,
        }))}
      />
      </div>
    </FoundationShell>
  );
}
