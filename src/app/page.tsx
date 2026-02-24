import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) redirect('/dashboard')

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <h1 className="mb-4 text-4xl font-bold">TurnTogether</h1>
      <p className="mb-8 text-lg text-gray-600">Turn pages together. Your book club, always on.</p>
      <div className="flex gap-4">
        <Link href="/signup"
          className="rounded-md bg-black px-6 py-2 text-white hover:bg-gray-800">
          Get Started
        </Link>
        <Link href="/login"
          className="rounded-md border px-6 py-2 hover:bg-gray-50">
          Log In
        </Link>
      </div>
    </div>
  )
}
