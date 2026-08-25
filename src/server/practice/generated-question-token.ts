import "server-only";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import type { PracticeQuestion } from "@/domain/practice/types";
import { getQuestionTokenSecret } from "@/server/env";

const prefix = "aiq";

export type GeneratedQuestionPayload = {
  question: PracticeQuestion;
  hint: string;
  source: "ai_generated";
  issuedAt: number;
  expiresAt: number;
};

function encode(value: Buffer) {
  return value.toString("base64url");
}

function decode(value: string) {
  return Buffer.from(value, "base64url");
}

function key() {
  const secret = getQuestionTokenSecret();

  if (!secret) {
    return null;
  }

  return createHash("sha256").update(secret).digest();
}

export function isGeneratedQuestionToken(value: string) {
  return value.startsWith(`${prefix}.`);
}

export function sealGeneratedQuestion(input: { question: PracticeQuestion; hint: string; ttlSeconds?: number }): string | null {
  const secretKey = key();

  if (!secretKey) {
    return null;
  }

  const issuedAt = Date.now();
  const payload = Buffer.from(JSON.stringify({ question: input.question, hint: input.hint, source: "ai_generated", issuedAt, expiresAt: issuedAt + (input.ttlSeconds ?? 30 * 60) * 1000 } satisfies GeneratedQuestionPayload));
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", secretKey, iv);
  const encrypted = Buffer.concat([cipher.update(payload), cipher.final()]);
  const tag = cipher.getAuthTag();

  return [prefix, encode(iv), encode(encrypted), encode(tag)].join(".");
}

export function openGeneratedQuestion(token: string): GeneratedQuestionPayload | null {
  const secretKey = key();

  if (!secretKey || !isGeneratedQuestionToken(token)) {
    return null;
  }

  const [, iv, encrypted, tag] = token.split(".");

  if (!iv || !encrypted || !tag) {
    return null;
  }

  try {
    const decipher = createDecipheriv("aes-256-gcm", secretKey, decode(iv));
    decipher.setAuthTag(decode(tag));
    const payload = JSON.parse(Buffer.concat([decipher.update(decode(encrypted)), decipher.final()]).toString("utf8")) as GeneratedQuestionPayload;

    return payload.expiresAt >= Date.now() ? payload : null;
  } catch {
    return null;
  }
}
