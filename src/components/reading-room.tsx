'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface Participant {
  userId: string
  displayName: string
  onlineAt: string
}

interface ChatMessage {
  userId: string
  displayName: string
  text: string
  timestamp: string
}

export function ReadingRoom({ clubId, userId, displayName }: {
  clubId: string
  userId: string
  displayName: string
}) {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [supabase] = useState(() => createClient())
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    const channel = supabase.channel(`room-${clubId}`)
    channelRef.current = channel

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        const users = Object.values(state).flat() as unknown as Participant[]
        setParticipants(users)
      })
      .on('broadcast', { event: 'chat' }, ({ payload }) => {
        setMessages((prev) => [...prev, payload as ChatMessage])
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            userId,
            displayName,
            onlineAt: new Date().toISOString(),
          })
        }
      })

    return () => {
      channelRef.current = null
      supabase.removeChannel(channel)
    }
  }, [clubId, userId, displayName, supabase])

  function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || !channelRef.current) return

    const message: ChatMessage = {
      userId,
      displayName,
      text: input,
      timestamp: new Date().toISOString(),
    }

    channelRef.current.send({
      type: 'broadcast',
      event: 'chat',
      payload: message,
    })

    // Supabase broadcast doesn't echo back to the sender,
    // so add the message to local state immediately.
    setMessages((prev) => [...prev, message])
    setInput('')
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Participants sidebar */}
      <div className="hidden w-48 rounded-lg border p-4 sm:block">
        <h3 className="mb-3 text-sm font-semibold">
          Reading Now ({participants.length})
        </h3>
        <div className="space-y-2">
          {participants.map((p) => (
            <div key={p.userId} className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-400" />
              <span className="text-sm">{p.displayName}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex flex-1 flex-col rounded-lg border">
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {messages.map((msg, i) => (
            <div key={i} className="text-sm">
              <span className="font-medium">{msg.displayName}: </span>
              <span>{msg.text}</span>
            </div>
          ))}
          {messages.length === 0 && (
            <p className="text-center text-gray-400 text-sm">
              Welcome to the reading room. Chat while you read!
            </p>
          )}
        </div>
        <form onSubmit={sendMessage} className="flex border-t p-3 gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Say something..."
            className="flex-1 rounded border px-3 py-1 text-sm"
          />
          <button type="submit"
            className="rounded bg-black px-3 py-1 text-sm text-white hover:bg-gray-800">
            Send
          </button>
        </form>
      </div>
    </div>
  )
}
