import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-6">
      <h2 className="mb-2 text-xl font-bold">Page Not Found</h2>
      <p className="mb-4 text-sm text-gray-600">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link
        href="/"
        className="rounded bg-black px-4 py-2 text-sm text-white hover:bg-gray-800"
      >
        Go home
      </Link>
    </div>
  )
}
