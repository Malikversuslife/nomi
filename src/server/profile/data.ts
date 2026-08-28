import "server-only";
import { buildProfileSummary, memberSinceLabel } from "@/domain/profile/presentation";
import type { ProfileExperienceData } from "@/domain/profile/types";
import { getLearnerSubjects, getProfile, getTopicProgress } from "@/server/data/learner";
import { hasSupabaseConfig } from "@/server/env";
import { getCurrentUser } from "@/server/supabase/auth";

function nameFromJoin(row: unknown, key: string): string | null {
  const joined = (row as Record<string, unknown>)?.[key];

  if (Array.isArray(joined)) {
    const first = joined[0];

    if (first && typeof first === "object") {
      const name = (first as Record<string, unknown>).name;
      return typeof name === "string" ? name : null;
    }

    return null;
  }

  if (joined && typeof joined === "object") {
    const name = (joined as Record<string, unknown>).name;
    return typeof name === "string" ? name : null;
  }

  return null;
}

function topicNameFromRow(row: unknown): string | null {
  return nameFromJoin(row, "topics");
}

function subjectNameFromRow(row: unknown): string | null {
  return nameFromJoin(row, "subjects");
}

export async function getProfileExperienceData(
  userId: string,
  email: string,
): Promise<ProfileExperienceData> {
  const [profile, learnerSubjects, topicProgress] = await Promise.all([
    getProfile(userId),
    getLearnerSubjects(userId),
    getTopicProgress(userId),
  ]);

  const now = new Date();

  const fallbackName =
    profile?.display_name ?? (email.length > 0 ? email.split("@")[0] : "Learner");

  const summary = buildProfileSummary(
    {
      learnerSubjects: learnerSubjects.map((row) => ({
        status: row.status,
        name: subjectNameFromRow(row),
      })),
      topicProgress: topicProgress.map((row) => ({
        attemptedCount: row.attempted_count,
        lastPracticedAt: row.last_practiced_at,
        topicName: topicNameFromRow(row),
      })),
    },
    now,
  );

  return {
    displayName: fallbackName,
    email,
    memberSinceLabel: memberSinceLabel(profile?.created_at ?? null),
    preferences: {
      displayName: fallbackName,
      gradeYear: profile?.grade_year ?? null,
      dailyGoalMinutes: profile?.daily_goal_minutes ?? 20,
      explanationStyle: profile?.preferred_explanation_style ?? null,
    },
    summary,
    hasPracticeEvidence: summary.questionsAnswered > 0,
  };
}

export type AccountContext = {
  name: string | null;
  email: string | null;
};

export async function getAccountContext(): Promise<AccountContext | null> {
  if (!hasSupabaseConfig()) {
    return null;
  }

  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const profile = await getProfile(user.id);

  const metaName =
    user.user_metadata && typeof user.user_metadata.display_name === "string"
      ? user.user_metadata.display_name
      : null;

  return {
    name: profile?.display_name || metaName || null,
    email: user.email ?? null,
  };
}