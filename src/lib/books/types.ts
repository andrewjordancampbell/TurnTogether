export interface BookSearchResult {
  openLibraryKey: string
  title: string
  authorName: string
  coverUrl: string | null
  firstPublishYear: number | null
  isbn: string | null
  pageCount: number | null
}

export interface BookDetail extends BookSearchResult {
  description: string | null
}
