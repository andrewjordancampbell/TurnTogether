'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createDiscussion(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const clubId = Number(formData.get('club_id'))
  const bookId = Number(formData.get('book_id'))
  const chapterId = formData.get('chapter_id') ? Number(formData.get('chapter_id')) : null

  const { error } = await supabase.from('discussions').insert({
    club_id: clubId,
    book_id: bookId,
    chapter_id: chapterId,
    author_id: user.id,
    title: formData.get('title') as string,
    content: formData.get('content') as string,
  })

  if (error) throw new Error(error.message)
  revalidatePath(`/clubs/${clubId}/discussions`)
}

export async function addComment(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const discussionId = Number(formData.get('discussion_id'))
  const clubId = formData.get('club_id') as string

  const { error } = await supabase.from('comments').insert({
    discussion_id: discussionId,
    author_id: user.id,
    content: formData.get('content') as string,
  })

  if (error) throw new Error(error.message)
  revalidatePath(`/clubs/${clubId}/discussions/${discussionId}`)
}
