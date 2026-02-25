'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { updateProgressSchema } from '@/lib/validations'

type ActionState = { error: string; success?: never } | { success: true; error?: never } | null

export async function updateProgress(_prevState: ActionState, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const result = updateProgressSchema.safeParse({
    club_id: Number(formData.get('club_id')),
    book_id: Number(formData.get('book_id')),
    current_chapter: Number(formData.get('current_chapter') || 0),
    current_page: formData.get('current_page') ? Number(formData.get('current_page')) : undefined,
    total_pages: formData.get('total_pages') ? Number(formData.get('total_pages')) : undefined,
  })

  if (!result.success) return { error: result.error.issues[0].message }

  const { club_id: clubId, book_id: bookId, current_chapter: currentChapter, current_page: currentPage, total_pages: totalPages } = result.data

  const percentComplete = totalPages && currentPage
    ? Math.min(100, Math.round((currentPage / totalPages) * 100))
    : 0

  const { error } = await supabase
    .from('reading_progress')
    .upsert({
      user_id: user.id,
      book_id: bookId,
      club_id: clubId,
      current_chapter: currentChapter,
      current_page: currentPage ?? null,
      percent_complete: percentComplete,
      last_read_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id,book_id,club_id',
    })

  if (error) return { error: error.message }
  revalidatePath(`/clubs/${clubId}`)
  return { success: true as const }
}
