import { describe, it, expect, vi, beforeEach } from 'vitest'
import { searchBooks, getBookByKey } from '../open-library'

const mockFetch = vi.fn()
global.fetch = mockFetch

describe('searchBooks', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  it('returns parsed book results from Open Library', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        docs: [{
          key: '/works/OL45883W',
          title: 'The Great Gatsby',
          author_name: ['F. Scott Fitzgerald'],
          cover_i: 5428170,
          first_publish_year: 1925,
          isbn: ['0451524934'],
          number_of_pages_median: 180,
        }],
      }),
    })

    const results = await searchBooks('great gatsby')

    expect(results).toHaveLength(1)
    expect(results[0]).toEqual({
      openLibraryKey: '/works/OL45883W',
      title: 'The Great Gatsby',
      authorName: 'F. Scott Fitzgerald',
      coverUrl: 'https://covers.openlibrary.org/b/id/5428170-M.jpg',
      firstPublishYear: 1925,
      isbn: '0451524934',
      pageCount: 180,
    })
  })

  it('returns empty array on API error', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false })
    const results = await searchBooks('nonexistent')
    expect(results).toEqual([])
  })
})

describe('getBookByKey', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  it('returns book detail from Open Library', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        title: 'The Great Gatsby',
        covers: [5428170],
        first_publish_date: '1925',
        description: 'A story of the fabulously wealthy Jay Gatsby.',
      }),
    })

    const result = await getBookByKey('/works/OL45883W')

    expect(result).toEqual({
      openLibraryKey: '/works/OL45883W',
      title: 'The Great Gatsby',
      authorName: 'Unknown',
      coverUrl: 'https://covers.openlibrary.org/b/id/5428170-M.jpg',
      firstPublishYear: 1925,
      isbn: null,
      pageCount: null,
      description: 'A story of the fabulously wealthy Jay Gatsby.',
    })
  })

  it('returns null on API error', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false })
    const result = await getBookByKey('/works/invalid')
    expect(result).toBeNull()
  })
})
