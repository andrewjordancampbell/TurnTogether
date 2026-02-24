import Link from "next/link";
import { loginWithGoogle } from "../login/actions";
import { signup } from "./actions";

export default function SignupPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h1 className="text-center text-2xl font-bold text-stone-900">Join TurnTogether</h1>

        <form className="space-y-4">
          <div>
            <label htmlFor="display_name" className="block text-sm font-medium text-stone-700">
              Display Name
            </label>
            <input
              id="display_name"
              name="display_name"
              type="text"
              required
              className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2"
            />
          </div>

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

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-stone-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              minLength={6}
              required
              className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2"
            />
          </div>

          <button
            formAction={signup}
            className="w-full rounded-md bg-stone-900 py-2 text-sm font-medium text-white hover:bg-stone-700"
          >
            Create account
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-stone-200" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-2 text-stone-500">or</span>
          </div>
        </div>

        <form>
          <button
            formAction={loginWithGoogle}
            className="w-full rounded-md border border-stone-300 py-2 text-sm font-medium text-stone-800 hover:bg-stone-50"
          >
            Continue with Google
          </button>
        </form>

        <p className="text-center text-sm text-stone-600">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-stone-900 underline">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
