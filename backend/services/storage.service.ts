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

const PUBLIC_URL_MARKER = `/storage/v1/object/public/${BUCKET}/`

/**
 * The object's path in the bucket, recovered from either form stored in pdf_url.
 *
 * Rows written before the bucket was made private hold a full public URL. Making
 * the bucket private is what breaks those URLs, so they cannot simply be handed
 * back — but the file itself is untouched, and its path is the tail of the URL.
 * Recovering it lets an existing report be signed like any other.
 */
const toObjectPath = (pathOrUrl: string): string => {
  if (!/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl

  const markerAt = pathOrUrl.indexOf(PUBLIC_URL_MARKER)
  if (markerAt === -1) return pathOrUrl

  const tail = pathOrUrl.slice(markerAt + PUBLIC_URL_MARKER.length)
  return decodeURIComponent(tail.split('?')[0] ?? tail)
}

/** A time-limited link to a stored report. */
export const getSignedPdfUrl = async (
  pathOrUrl: string,
  expiresInSeconds: number,
): Promise<string | null> => {
  const objectPath = toObjectPath(pathOrUrl)

  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(objectPath, expiresInSeconds)
  if (error || !data) {
    console.error(`Failed to sign report URL for ${objectPath}:`, error)
    return null
  }
  return data.signedUrl
}
