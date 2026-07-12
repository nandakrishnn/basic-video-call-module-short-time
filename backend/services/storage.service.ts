import { supabase } from '../lib/supabase'

const BUCKET = 'session-reports'

export const uploadPdf = async (fileName: string, buffer: Buffer): Promise<string> => {
  const { error } = await supabase.storage.from(BUCKET).upload(fileName, buffer, {
    contentType: 'application/pdf',
    upsert: true,
  })
  if (error) throw new Error('Failed to upload PDF')

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName)
  return data.publicUrl
}
