import type { BookSearchResult, BookDetail } from './types'

const BASE_URL = 'https://openlibrary.org'
const COVERS_URL = 'https://covers.openlibrary.org'

export async function searchBooks(query: string, limit = 10): Promise<BookSearchResult[]> {
  try {
    const params = new URLSearchParams({
      q: query,
      limit: String(limit),
      fields: 'key,title,author_name,cover_i,first_publish_year,isbn,number_of_pages_median',
    })

    const res = await fetch(`${BASE_URL}/search.json?${params}`, {
      headers: { 'User-Agent': 'TurnTogether (turntogether@example.com)' },
    })

    if (!res.ok) return []

    const data = await res.json()

    return data.docs.map((doc: Record<string, unknown>) => ({
      openLibraryKey: doc.key as string,
      title: doc.title as string,
      authorName: Array.isArray(doc.author_name) ? doc.author_name[0] : 'Unknown',
      coverUrl: doc.cover_i
        ? `${COVERS_URL}/b/id/${doc.cover_i}-M.jpg`
        : null,
      firstPublishYear: (doc.first_publish_year as number) ?? null,
      isbn: Array.isArray(doc.isbn) ? doc.isbn[0] : null,
      pageCount: (doc.number_of_pages_median as number) ?? null,
    }))
  } catch {
    return []
  }
}

export async function getBookByKey(key: string): Promise<BookDetail | null> {
  try {
    const res = await fetch(`${BASE_URL}${key}.json`, {
      headers: { 'User-Agent': 'TurnTogether (turntogether@example.com)' },
    })

    if (!res.ok) return null

    const data = await res.json()

    return {
      openLibraryKey: key,
      title: data.title,
      authorName: 'Unknown', // Requires separate author fetch
      coverUrl: data.covers?.[0]
        ? `${COVERS_URL}/b/id/${data.covers[0]}-M.jpg`
        : null,
      firstPublishYear: data.first_publish_date
        ? parseInt(data.first_publish_date)
        : null,
      isbn: null,
      pageCount: null,
      description: typeof data.description === 'string'
        ? data.description
        : data.description?.value ?? null,
    }
  } catch {
    return null
  }
}
