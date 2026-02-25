'use client'

import { useState } from 'react'
import { searchBooksAction } from '@/app/books/search/actions'
import { BookCard } from './book-card'
import type { BookSearchResult } from '@/lib/books/types'

export function BookSearch({ onSelect }: { onSelect?: (book: BookSearchResult) => void }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<BookSearchResult[]>([])
  const [loading, setLoading] = useState(false)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    const books = await searchBooksAction(query)
    setResults(books)
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a book..."
          className="flex-1 rounded-md border px-3 py-2"
        />
        <button type="submit" disabled={loading}
          className="rounded-md bg-black px-4 py-2 text-white hover:bg-gray-800 disabled:opacity-50">
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      <div className="space-y-2">
        {results.map((book) => (
          <button key={book.openLibraryKey} onClick={() => onSelect?.(book)}
            className="w-full text-left hover:bg-gray-50 rounded-lg">
            <BookCard book={book} />
          </button>
        ))}
      </div>
    </div>
  )
}
