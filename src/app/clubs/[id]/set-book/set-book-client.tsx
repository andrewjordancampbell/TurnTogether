'use client'

import { useState } from 'react'
import { BookSearch } from '@/components/book-search'
import { setBookForClub } from './actions'
import type { BookSearchResult } from '@/lib/books/types'

export function SetBookClient({ clubId }: { clubId: number }) {
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleSelect(book: BookSearchResult) {
    setSaving(true)
    setError(null)
    const result = await setBookForClub(clubId, book)
    if (result?.error) {
      setError(result.error)
      setSaving(false)
    }
    // On success, the server action redirects
  }

  return (
    <>
      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}
      {saving && (
        <div className="mb-4 rounded-md bg-blue-50 p-3 text-sm text-blue-700">Setting book...</div>
      )}
      <BookSearch onSelect={handleSelect} />
    </>
  )
}
