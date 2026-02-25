'use server'

import { searchBooks } from '@/lib/books/open-library'
import type { BookSearchResult } from '@/lib/books/types'

export async function searchBooksAction(query: string): Promise<BookSearchResult[]> {
  if (!query.trim()) return []
  return searchBooks(query)
}
