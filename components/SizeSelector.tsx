"use client"

import React from "react"
import { resolveSizeOptions } from "@/lib/sizePresets"

type Props = {
  category?: string
  current?: string | null
  onChange?: (value: string) => void
  readOnly?: boolean
  numericRange?: { min?: number; max?: number; step?: number }
  className?: string
}

/**
 * Simple select-based size selector that resolves presets by category.
 * - readOnly: renders a disabled select when true (good for cart display)
 */
export default function SizeSelector({
  category,
  current,
  onChange,
  readOnly = false,
  numericRange,
  className = "",
}: Props) {
  const options = resolveSizeOptions(category, numericRange)

  if (!options || options.length === 0) {
    // fallback: show current value if any
    return current ? <div className={`inline-block ${className}`}>Size: {current}</div> : null
  }

  return (
    <select
      value={current ?? ""}
      onChange={(e) => onChange && onChange(e.target.value)}
      disabled={readOnly}
      className={`text-xs rounded px-2 py-1 border border-warmgray/30 ${readOnly ? "bg-slate-50" : "bg-white"} ${className}`}
    >
      <option value="">{current ? `Selected: ${current}` : "Choose size"}</option>
      {options.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  )
}