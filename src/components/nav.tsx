import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { MobileNav } from './mobile-nav'

export async function Nav() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <nav className="border-b border-purple/30">
      <div className="mx-auto flex max-w-4xl items-center justify-between p-4">
        <Link href="/" className="text-lg font-bold">TurnTogether</Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-4 text-sm md:flex">
          <Link href="/discover" className="hover:text-peach hover:underline">Discover</Link>
          {user ? (
            <>
              <Link href="/dashboard" className="hover:text-peach hover:underline">Dashboard</Link>
              <Link href="/books/search" className="hover:text-peach hover:underline">Search Books</Link>
              <Link href="/profile" className="hover:text-peach hover:underline">Profile</Link>
              <form action="/auth/signout" method="post">
                <button className="hover:text-peach hover:underline">Sign out</button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-peach hover:underline">Log in</Link>
              <Link href="/signup" className="rounded bg-coral px-3 py-1 text-white hover:bg-rose">
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
