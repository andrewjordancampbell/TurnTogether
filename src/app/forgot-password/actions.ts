'use server'

import { createClient } from '@/lib/supabase/server'

type ActionState = { error: string; success?: never } | { success: true; error?: never } | null

export async function resetPassword(_prevState: ActionState, formData: FormData) {
  const email = formData.get('email') as string

  if (!email?.trim()) return { error: 'Email is required' }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  if (!siteUrl) return { error: 'Site URL not configured' }

  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/reset-password`,
  })

  if (error) return { error: error.message }
  return { success: true as const }
}
