'use client'

import { useState } from 'react'

export function CopyInviteLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        readOnly
        value={url}
        className="flex-1 rounded border bg-gray-50 px-3 py-1 text-sm"
      />
      <button
        onClick={handleCopy}
        className="rounded bg-black px-3 py-1 text-sm text-white hover:bg-gray-800"
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  )
}
