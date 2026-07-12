import { genAI } from '../lib/gemini'

const SYSTEM_PROMPT = `You are a clinical assistant helping a physiotherapist
write professional session notes. Take the raw notes
provided and:
1. Fix all grammar and spelling errors
2. Structure them professionally
3. Use clear clinical language
4. Format the output exactly as:

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

Return only the formatted notes. Nothing else.`

export const enhanceNotesWithAI = async (rawNotes: string): Promise<string> => {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
  const result = await model.generateContent([SYSTEM_PROMPT, rawNotes])
  return result.response.text()
}
