'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { createDiscussionSchema, addCommentSchema } from '@/lib/validations'

type ActionState = { error: string; success?: never } | { success: true; error?: never } | null

export async function createDiscussion(_prevState: ActionState, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const result = createDiscussionSchema.safeParse({
    club_id: Number(formData.get('club_id')),
    book_id: formData.get('book_id') ? Number(formData.get('book_id')) : undefined,
    chapter_id: formData.get('chapter_id') ? Number(formData.get('chapter_id')) : undefined,
    title: formData.get('title'),
    content: formData.get('content') || undefined,
  })

  if (!result.success) return { error: result.error.issues[0].message }

  const { error } = await supabase.from('discussions').insert({
    club_id: result.data.club_id,
    book_id: result.data.book_id ?? null,
    chapter_id: result.data.chapter_id ?? null,
    author_id: user.id,
    title: result.data.title,
    content: result.data.content ?? null,
  })

  if (error) return { error: error.message }
  revalidatePath(`/clubs/${result.data.club_id}/discussions`)
  return { success: true as const }
}

export async function addComment(_prevState: ActionState, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const result = addCommentSchema.safeParse({
    discussion_id: Number(formData.get('discussion_id')),
    club_id: formData.get('club_id'),
    content: formData.get('content'),
  })

  if (!result.success) return { error: result.error.issues[0].message }

  const { error } = await supabase.from('comments').insert({
    discussion_id: result.data.discussion_id,
    author_id: user.id,
    content: result.data.content,
  })

  if (error) return { error: error.message }
  revalidatePath(`/clubs/${result.data.club_id}/discussions/${result.data.discussion_id}`)
  return { success: true as const }
}
