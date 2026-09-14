"use client"

import { useEffect, useRef, useState } from "react"
import axios from "axios"
import { MessageCircle, Send, X } from "lucide-react"
import { apiUrl } from "@/constants/apiUrl"
import { apiErrorMessage } from "@/lib/apiError"

type ChatMessage = { role: "user" | "assistant"; text: string }

type ChatState = {
  conversationId: string | null
  token: string | null
  messages: ChatMessage[]
  handoffSuggested: boolean
  emailed: boolean
}

const STORAGE_KEY = "impressa_support_chat"
const EMPTY_CHAT: ChatState = { conversationId: null, token: null, messages: [], handoffSuggested: false, emailed: false }

const authHeaders = () => {
  const token = localStorage.getItem("impressa_token")
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// The support assistant, available on every page. The chat survives page changes for the browser tab.
export function SupportChat() {
  const [open, setOpen] = useState(false)
  const [chat, setChat] = useState<ChatState>(EMPTY_CHAT)
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [signedIn, setSignedIn] = useState(false)
  const [emailFormOpen, setEmailFormOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [note, setNote] = useState("")
  const [emailing, setEmailing] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY)
      if (saved) setChat({ ...EMPTY_CHAT, ...JSON.parse(saved) })
    } catch {
      // Storage can be unavailable in private browsing; the chat still works for this page.
    }
  }, [])

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(chat))
    } catch {}
  }, [chat])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" })
  }, [chat.messages.length, sending, open])

  const openChat = () => {
    setSignedIn(Boolean(localStorage.getItem("impressa_token")))
    setOpen(true)
  }

  const startOver = () => {
    setChat(EMPTY_CHAT)
    setError(null)
    setNotice(null)
    setEmailFormOpen(false)
  }

  const send = async () => {
    const text = input.trim()
    if (!text || sending) return

    setInput("")
    setError(null)
    setChat((current) => ({ ...current, messages: [...current.messages, { role: "user", text }] }))
    setSending(true)
    try {
      const res = await axios.post(
        `${apiUrl}/support/messages`,
        { message: text, conversationId: chat.conversationId ?? undefined, token: chat.token ?? undefined },
        { headers: authHeaders() }
      )
      setChat((current) => ({
        ...current,
        conversationId: res.data.conversationId,
        token: res.data.token,
        handoffSuggested: res.data.handoffSuggested,
        messages: [...current.messages, { role: "assistant", text: res.data.reply }],
      }))
    } catch (err) {
      setInput(text)
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        setChat(EMPTY_CHAT)
        setError("That chat had ended, so a new one has started. Send your message again.")
      } else {
        setChat((current) => ({ ...current, messages: current.messages.slice(0, -1) }))
        setError(apiErrorMessage(err, "Couldn't send your message. Try again."))
      }
    } finally {
      setSending(false)
    }
  }

  const emailTeam = async () => {
    setError(null)
    setEmailing(true)
    try {
      const res = await axios.post(
        `${apiUrl}/support/escalate`,
        {
          conversationId: chat.conversationId,
          token: chat.token,
          email: signedIn ? undefined : email.trim(),
          note: note.trim() || undefined,
        },
        { headers: authHeaders() }
      )
      setChat((current) => ({ ...current, emailed: true }))
      setEmailFormOpen(false)
      setNotice(res.data.message)
    } catch (err) {
      setError(apiErrorMessage(err, "Couldn't send it to our team. Try again."))
    } finally {
      setEmailing(false)
    }
  }

  const hasReply = chat.messages.some((message) => message.role === "assistant")

  if (!open) {
    return (
      <button
        type="button"
        onClick={openChat}
        className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-burgundy px-5 py-3 text-sm font-medium text-ivory shadow-lg transition hover:bg-burgundy/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2"
      >
        <MessageCircle className="h-5 w-5" aria-hidden="true" />
        Help
      </button>
    )
  }

  return (
    <div
      role="dialog"
      aria-label="Impressa support chat"
      className="fixed bottom-5 right-5 z-50 flex h-[min(600px,calc(100vh-2.5rem))] w-[min(380px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-xl border border-warmgray bg-ivory shadow-2xl"
    >
      <div className="flex items-center justify-between bg-navy px-4 py-3 text-ivory">
        <div>
          <p className="text-sm font-medium">Impressa support</p>
          <p className="text-xs text-ivory/70">Usually answers straight away</p>
        </div>
        <div className="flex items-center gap-3">
          {chat.messages.length > 0 ? (
            <button type="button" onClick={startOver} className="text-xs text-ivory/80 underline-offset-2 hover:underline">
              New chat
            </button>
          ) : null}
          <button type="button" onClick={() => setOpen(false)} aria-label="Close chat" className="rounded p-1 hover:bg-ivory/10">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4" aria-live="polite">
        <Bubble role="assistant">
          Hi! I'm Impressa's support assistant. Ask me about your orders, delivery, returns, refunds, your wallet or your account.
          {signedIn ? "" : " Sign in first if you'd like me to check an order."}
        </Bubble>
        {chat.messages.map((message, index) => (
          <Bubble key={index} role={message.role}>
            {message.text}
          </Bubble>
        ))}
        {sending ? <p className="text-xs text-navy/60">Typing…</p> : null}
        {notice ? <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{notice}</p> : null}
        {error ? (
          <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}
      </div>

      {hasReply && !chat.emailed ? (
        <div className="border-t border-warmgray bg-white px-4 py-3">
          {emailFormOpen ? (
            <div className="space-y-2">
              {!signedIn ? (
                <input
                  id="support-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Your email address"
                  aria-label="Your email address"
                  className="w-full rounded-md border border-warmgray px-3 py-2 text-sm text-navy focus:border-navy focus:outline-none"
                />
              ) : null}
              <textarea
                id="support-note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Anything to add? (optional)"
                aria-label="Note for the support team"
                rows={2}
                maxLength={500}
                className="w-full resize-none rounded-md border border-warmgray px-3 py-2 text-sm text-navy focus:border-navy focus:outline-none"
              />
              <div className="flex items-center justify-between">
                <button type="button" onClick={() => setEmailFormOpen(false)} className="text-sm text-navy/70 hover:text-navy">
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={emailTeam}
                  disabled={emailing || (!signedIn && !email.trim())}
                  className="rounded-md bg-navy px-4 py-2 text-sm text-ivory disabled:opacity-50"
                >
                  {emailing ? "Sending…" : "Send to support team"}
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setEmailFormOpen(true)}
              className={`text-sm underline-offset-2 hover:underline ${chat.handoffSuggested ? "font-medium text-burgundy" : "text-navy/70"}`}
            >
              {chat.handoffSuggested ? "Email this chat to our support team" : "Need a person? Email our support team"}
            </button>
          )}
        </div>
      ) : null}

      <form
        onSubmit={(event) => {
          event.preventDefault()
          void send()
        }}
        className="flex items-end gap-2 border-t border-warmgray bg-white px-3 py-3"
      >
        <textarea
          id="support-message"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault()
              void send()
            }
          }}
          placeholder="Type your question"
          aria-label="Your message"
          rows={1}
          maxLength={1000}
          className="max-h-28 flex-1 resize-none rounded-md border border-warmgray px-3 py-2 text-sm text-navy focus:border-navy focus:outline-none"
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          aria-label="Send message"
          className="flex h-10 w-10 items-center justify-center rounded-md bg-burgundy text-ivory disabled:opacity-50"
        >
          <Send className="h-4 w-4" aria-hidden="true" />
        </button>
      </form>
    </div>
  )
}

function Bubble({ role, children }: { role: "user" | "assistant"; children: React.ReactNode }) {
  return (
    <div className={`flex ${role === "user" ? "justify-end" : "justify-start"}`}>
      <p
        className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm leading-relaxed ${
          role === "user" ? "rounded-br-sm bg-navy text-ivory" : "rounded-bl-sm border border-warmgray bg-white text-navy"
        }`}
      >
        {children}
      </p>
    </div>
  )
}
