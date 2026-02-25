'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import type { BookSearchResult } from '@/lib/books/types'

export async function setBookForClub(clubId: number, book: BookSearchResult) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Verify user is club admin
  const { data: membership } = await supabase
    .from('club_members')
    .select('role')
    .eq('club_id', clubId)
    .eq('user_id', user.id)
    .single()

  if (!membership || membership.role !== 'admin') {
    return { error: 'Only club admins can set the current book' }
  }

  // Upsert book into books table
  const { data: savedBook, error: bookError } = await supabase
    .from('books')
    .upsert({
      open_library_key: book.openLibraryKey,
      title: book.title,
      author_name: book.authorName,
      cover_url: book.coverUrl,
      isbn: book.isbn,
      page_count: book.pageCount,
      first_publish_year: book.firstPublishYear,
    }, {
      onConflict: 'open_library_key',
    })
    .select()
    .single()

  if (bookError) return { error: bookError.message }

  // Update club's current book
  const { error: updateError } = await supabase
    .from('clubs')
    .update({ current_book_id: savedBook.id })
    .eq('id', clubId)

  if (updateError) return { error: updateError.message }

  revalidatePath(`/clubs/${clubId}`)
  redirect(`/clubs/${clubId}`)
}
