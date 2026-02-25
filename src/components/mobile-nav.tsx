'use client'

import { useState } from 'react'
import Link from 'next/link'

export function MobileNav({ isAuthenticated }: { isAuthenticated: boolean }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 text-sm"
        aria-label="Toggle menu"
      >
        {open ? (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-14 z-50 border-b bg-white p-4">
          <div className="flex flex-col gap-3 text-sm">
            <Link href="/discover" onClick={() => setOpen(false)} className="hover:underline">Discover</Link>
            {isAuthenticated ? (
              <>
                <Link href="/dashboard" onClick={() => setOpen(false)} className="hover:underline">Dashboard</Link>
                <Link href="/books/search" onClick={() => setOpen(false)} className="hover:underline">Search Books</Link>
                <Link href="/profile" onClick={() => setOpen(false)} className="hover:underline">Profile</Link>
                <form action="/auth/signout" method="post">
                  <button className="hover:underline">Sign out</button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)} className="hover:underline">Log in</Link>
                <Link href="/signup" onClick={() => setOpen(false)} className="rounded bg-black px-3 py-1 text-center text-white hover:bg-gray-800">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
