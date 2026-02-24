import type { BookSearchResult } from '@/lib/books/types'

export function BookCard({ book }: { book: BookSearchResult }) {
  return (
    <div className="flex gap-4 rounded-lg border p-4">
      {book.coverUrl ? (
        <img src={book.coverUrl} alt={book.title}
          className="h-32 w-20 rounded object-cover" />
      ) : (
        <div className="flex h-32 w-20 items-center justify-center rounded bg-gray-100 text-xs text-gray-400">
          No cover
        </div>
      )}
      <div>
        <h3 className="font-semibold">{book.title}</h3>
        <p className="text-sm text-gray-600">{book.authorName}</p>
        {book.firstPublishYear && (
          <p className="text-xs text-gray-400">{book.firstPublishYear}</p>
        )}
        {book.pageCount && (
          <p className="text-xs text-gray-400">{book.pageCount} pages</p>
        )}
      </div>
    </div>
  )
}
