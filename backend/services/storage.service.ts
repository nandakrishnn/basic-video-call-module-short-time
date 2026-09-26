import { supabase } from '../lib/supabase'

const BUCKET = 'session-reports'

/**
 * Stores the report and returns its path in the bucket — not a URL.
 *
 * The bucket is private: a session report is a clinical document, and a public
 * URL would be readable by anyone who came across it, with no login. Callers
 * mint a short-lived signed URL with getSignedPdfUrl when they need one.
 */
export const uploadPdf = async (fileName: string, buffer: Buffer): Promise<string> => {
  const { error } = await supabase.storage.from(BUCKET).upload(fileName, buffer, {
    contentType: 'application/pdf',
    upsert: true,
  })
  if (error) throw new Error('Failed to upload PDF')

  return fileName
}

/**
 * A time-limited link to a stored report.
 *
 * Rows written before the bucket was made private hold a full public URL rather
 * than a path; those are returned unchanged so existing reports keep working.
 */
export const getSignedPdfUrl = async (
  pathOrUrl: string,
  expiresInSeconds: number,
): Promise<string | null> => {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl

  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(pathOrUrl, expiresInSeconds)
  if (error || !data) {
    console.error(`Failed to sign report URL for ${pathOrUrl}:`, error)
    return null
  }
  return data.signedUrl
}
