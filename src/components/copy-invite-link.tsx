'use client'

import { useState } from 'react'

export function CopyInviteLink({ clubId, inviteCode }: { clubId: number; inviteCode: string }) {
  const [copied, setCopied] = useState(false)

  const inviteUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/clubs/${clubId}/join?code=${inviteCode}`

  async function handleCopy() {
    await navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="mt-2 rounded bg-coral px-3 py-1 text-sm text-white hover:bg-rose"
    >
      {copied ? 'Copied!' : 'Copy Invite Link'}
    </button>
  )
}
