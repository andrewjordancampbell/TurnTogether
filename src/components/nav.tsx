import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { MobileNav } from './mobile-nav'

export async function Nav() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <nav className="border-b">
      <div className="mx-auto flex max-w-4xl items-center justify-between p-4">
        <Link href="/" className="text-lg font-bold">TurnTogether</Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-4 text-sm md:flex">
          <Link href="/discover" className="hover:underline">Discover</Link>
          {user ? (
            <>
              <Link href="/dashboard" className="hover:underline">Dashboard</Link>
              <Link href="/books/search" className="hover:underline">Search Books</Link>
              <Link href="/profile" className="hover:underline">Profile</Link>
              <form action="/auth/signout" method="post">
                <button className="hover:underline">Sign out</button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:underline">Log in</Link>
              <Link href="/signup" className="rounded bg-black px-3 py-1 text-white hover:bg-gray-800">
                Sign up
              </Link>
            </>
          )}
        </div>

        {/* Mobile nav */}
        <MobileNav isAuthenticated={!!user} />
      </div>
    </nav>
  )
}
