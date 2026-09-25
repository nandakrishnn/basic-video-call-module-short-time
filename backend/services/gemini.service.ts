import { HarmBlockThreshold, HarmCategory } from '@google/generative-ai'
import { CONFIG } from '../constants/config'
import { genAI } from '../lib/gemini'

const SYSTEM_PROMPT = `You are a clinical documentation assistant helping a
physiotherapist tidy up their session notes for a patient's medical record.

You must use ONLY the information explicitly present in the raw notes below.
Do not invent, assume, infer, or add any clinical detail, symptom,
measurement, treatment, diagnosis, or patient statement that is not
explicitly stated in the raw notes. This is a real medical record — adding
fabricated clinical content is a patient-safety violation, not a helpful
embellishment.

Your job is limited to:
1. Fixing grammar and spelling
2. Organizing what was actually written into the structure below
3. Light rephrasing into clear clinical language, without changing meaning or adding facts

Format the output exactly as:

PRESENTING COMPLAINT:
[complaint]

TREATMENT PROVIDED:
[treatment]

PATIENT RESPONSE:
[response]

RECOMMENDATIONS:
[recommendations]

NEXT STEPS:
[next steps]

For any section the raw notes do not cover, write exactly: Not documented.
If the raw notes are too sparse, garbled, or unclear to confidently extract
meaning for a section, write "Not documented" for that section rather than
guessing or filling in plausible-sounding clinical content.

Return only the formatted notes. Nothing else.`

// Physiotherapy notes describe injury, pain and physical manipulation, which
// the default medium thresholds can score as harmful and block outright. These
// are clinician-authored records for a medical file, so only high-confidence
// hits should stop a request.
const SAFETY_SETTINGS = [
  HarmCategory.HARM_CATEGORY_HARASSMENT,
  HarmCategory.HARM_CATEGORY_HATE_SPEECH,
  HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
  HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
].map((category) => ({ category, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH }))

/**
 * Google returns 503 "This model is currently experiencing high demand" under
 * load, and 429 when rate limited. Both are explicitly temporary, so they are
 * retried rather than surfaced — a physio writing up notes should not have to
 * care that the model was briefly busy.
 */
const TRANSIENT_STATUSES = new Set([429, 500, 502, 503, 504])

export class TransientAiError extends Error {}

const statusOf = (err: unknown): number | undefined =>
  typeof err === 'object' && err !== null && 'status' in err
    ? (err as { status?: number }).status
    : undefined

const isTransient = (err: unknown): boolean => {
  const status = statusOf(err)
  return status !== undefined && TRANSIENT_STATUSES.has(status)
}

const wait = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

export const enhanceNotesWithAI = async (rawNotes: string): Promise<string> => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set — note enhancement cannot run.')
  }

  const models = [CONFIG.gemini.model, ...(CONFIG.gemini.fallbackModel ? [CONFIG.gemini.fallbackModel] : [])]
  let lastError: unknown

  for (let attempt = 0; attempt < CONFIG.gemini.maxAttempts; attempt++) {
    // Later attempts fall back to the lighter model — when the primary is
    // saturated, a different one usually is not.
    const modelName = models[Math.min(attempt, models.length - 1)] as string

    try {
      return await generateOnce(modelName, rawNotes)
    } catch (err) {
      lastError = err
      if (!isTransient(err) || attempt === CONFIG.gemini.maxAttempts - 1) break
      // Backoff with jitter, so concurrent retries don't align on the same tick.
      await wait(CONFIG.gemini.retryBaseMs * 2 ** attempt + Math.random() * 250)
    }
  }

  if (isTransient(lastError)) {
    throw new TransientAiError(`Gemini is busy (HTTP ${statusOf(lastError)}) after ${CONFIG.gemini.maxAttempts} attempts.`)
  }
  throw lastError
}

const generateOnce = async (modelName: string, rawNotes: string): Promise<string> => {
  const model = genAI.getGenerativeModel({
    model: modelName,
    // Passed as a real system instruction rather than a leading user turn, so
    // the "invent nothing" rule is weighted as instruction, not as content the
    // model may treat as part of the notes.
    systemInstruction: SYSTEM_PROMPT,
    safetySettings: SAFETY_SETTINGS,
    generationConfig: {
      temperature: CONFIG.gemini.temperature,
      maxOutputTokens: CONFIG.gemini.maxOutputTokens,
    },
  })

  const result = await model.generateContent(rawNotes)
  const { response } = result

  // A blocked prompt or a candidate stopped for safety leaves .text() throwing
  // an opaque error, so surface the real reason for the log instead.
  const blockReason = response.promptFeedback?.blockReason
  if (blockReason) {
    throw new Error(`Gemini blocked the prompt (${blockReason}).`)
  }

  const finishReason = response.candidates?.[0]?.finishReason
  if (finishReason && finishReason !== 'STOP' && finishReason !== 'MAX_TOKENS') {
    throw new Error(`Gemini returned no usable output (finishReason: ${finishReason}).`)
  }

  const text = response.text().trim()
  if (!text) throw new Error('Gemini returned an empty response.')

  return text
}
