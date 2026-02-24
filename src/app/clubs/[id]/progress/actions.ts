'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProgress(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const clubId = Number(formData.get('club_id'))
  const bookId = Number(formData.get('book_id'))
  const currentChapter = Number(formData.get('current_chapter'))
  const currentPage = formData.get('current_page') ? Number(formData.get('current_page')) : null
  const totalPages = formData.get('total_pages') ? Number(formData.get('total_pages')) : null

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
      current_page: currentPage,
      percent_complete: percentComplete,
      last_read_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id,book_id,club_id',
    })

  if (error) throw new Error(error.message)
  revalidatePath(`/clubs/${clubId}`)
}
