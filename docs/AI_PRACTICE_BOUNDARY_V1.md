# AI Practice Boundary V1

Milestone 5 adds controlled server-only AI support for practice question generation, hints/explanations, and concise misconception classification. It does not implement the full Nomi Tutor.

## Provider Architecture

AI calls are isolated under `src/server/ai/` and imported only from server code. The current provider implementation is OpenAI-compatible over `fetch`, behind the `AiJsonProvider` interface, so practice code is not coupled to one SDK.

Required live provider configuration is optional and server-only:

- `OPENAI_API_KEY`
- `OPENAI_MODEL`, default `gpt-4o-mini`
- `NOMI_AI_TIMEOUT_MS`, default `8000`
- `NOMI_AI_DISABLED`, default `false`

Generated practice question tokens require `NOMI_QUESTION_TOKEN_SECRET` with at least 32 characters. If the secret is missing, Nomi falls back to seeded questions rather than exposing trusted answer data to the client.

## Question Contract

The server supplies authoritative input:

- subject name
- canonical `topic_id`
- canonical topic name
- target difficulty selected by the adaptive engine
- intervention selected by the adaptive engine
- learner-state summary
- optional concept, grade/year, and explanation style

AI output is validated with Zod and supports only:

- `multiple_choice`
- `short_answer`

Multiple-choice output must have exactly one valid answer by option id. Short-answer output uses tightly normalized accepted answers compatible with the deterministic evaluator.

## Topic Integrity

AI may choose `concept_name` beneath the authoritative topic, but it may not replace the parent topic. Output is rejected if returned `topic_id` or `topic_name` conflicts with the server-controlled topic.

## Difficulty Alignment

The adaptive engine selects difficulty. AI receives the selected value and must not change it. Output is rejected if it returns a conflicting difficulty.

The shared prompt scale is:

```text
1-2 foundational recognition/basic single-step
3-4 straightforward application
5-6 multi-step standard grade-level
7-8 demanding transfer/application
9-10 advanced challenge
```

## Validation Rules

Generated content is rejected when it has:

- malformed JSON
- unsupported question type
- empty prompt, hint, explanation, option, or answer
- prompt, hint, explanation, concept, or answer above length limits
- fewer than 3 or more than 5 multiple-choice options
- duplicate option ids
- a multiple-choice correct answer not present in options
- hidden reasoning fields such as `chain_of_thought` or `hidden_reasoning`
- arbitrary unsafe metadata via strict schemas
- conflicting topic or difficulty values

Generation retries once with correction instructions, then falls back to seeded practice content.

## Persistence Strategy

AI-generated questions are not added to the canonical `practice_questions` bank in V1. Instead:

```text
AI-generated question
-> server validation
-> encrypted trusted question token
-> learner answer
-> deterministic evaluation
-> immutable practice_attempt snapshot
```

Seeded questions remain the deterministic fallback and test bank. The immutable attempt snapshot records `source = ai_generated` or `source = seeded` for auditability.

## Misconception Classification

AI classification runs only after incorrect answers when a provider is available. It returns concise structured data:

- `category`
- `misconception_key`
- `concept_name`
- `confidence`
- `evidence_summary`

Approved categories are:

- `conceptual_understanding`
- `calculation_error`
- `terminology_confusion`
- `skipped_step`
- `careless_mistake`
- `missing_prerequisite`
- `unknown`

Unknown arbitrary categories map safely to `unknown`. AI output is rejected if it attempts to decide lifecycle status. The deterministic Milestone 3 lifecycle engine remains authoritative for `active`, `recurring`, `improving`, and `resolved`.

## Fallbacks

Question generation failures fall back to closest seeded question selection. Classification failures fall back to deterministic seeded misconception metadata when available or no misconception update when no safe signal exists.

AI failures do not block practice submission persistence.

## Cost And Latency

Guardrails:

- server-side timeout
- one retry for question generation only
- no conversation history
- concise prompts
- no AI calls for deterministic evaluation, mastery, difficulty, counters, or persistence decisions
- no repeated classification after an attempt is already persisted

## Safe Output

Client-facing practice state may include correctness, answer label, explanation, hint, adaptive metrics, misconception-safe summary, and next question. It never exposes prompts, provider responses, raw metadata, access tokens, system instructions, or hidden reasoning.
