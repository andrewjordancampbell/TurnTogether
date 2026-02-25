'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { resetPassword } from './actions'

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState(resetPassword, null)

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h1 className="text-center text-2xl font-bold text-stone-900">Reset Password</h1>

        {state?.success ? (
          <div className="rounded-md bg-green-50 border border-green-200 p-3 text-sm text-green-700">
            Check your email for a password reset link.
          </div>
        ) : (
          <form action={formAction} className="space-y-4">
            {state?.error && (
              <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                {state.error}
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-stone-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2"
              />
            </div>
            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-md bg-stone-900 py-2 text-sm font-medium text-white hover:bg-stone-700 disabled:opacity-50"
            >
              {pending ? 'Sending...' : 'Send reset link'}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-stone-600">
          <Link href="/login" className="font-medium text-stone-900 underline">
            Back to login
          </Link>
        </p>
      </div>
    </main>
  )
}
