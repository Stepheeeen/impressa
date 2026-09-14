import axios from "axios"

// Shows the backend's own message (e.g. "Password must be at least 8 characters.") instead of a generic one.
export function apiErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const message = err.response?.data?.error
    if (typeof message === "string" && message.trim()) return message
    if (!err.response) return "Network error. Check your connection and try again."
  }
  return fallback
}
