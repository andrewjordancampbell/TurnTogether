import { BookSearch } from '@/components/book-search'

export default function BookSearchPage() {
  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Find a Book</h1>
      <BookSearch />
    </div>
  )
}
