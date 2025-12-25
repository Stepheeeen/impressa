export const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];

// Preset size maps for various categories
export const SIZE_PRESETS: Record<string, string[] | "numeric"> = {
  clothing: SIZE_OPTIONS,
  "luxury dress": SIZE_OPTIONS,
  shorts: ["28", "30", "32", "34", "36", "38", "40"],
  bags: ["Small", "Medium", "Large"],
  shoes: "numeric",
  accessories: ["One Size"],
};

/**
 * Resolve size options for a category.
 * - If preset is an array -> returns that array
 * - If preset is "numeric" -> returns numeric range as strings (use provided min/max or defaults)
 * - If unknown category -> returns empty array
 */
export function resolveSizeOptions(
  category?: string,
  opts?: { min?: number; max?: number; step?: number }
): string[] {
  if (!category) return [];

  const key = category.toLowerCase().trim();
  // try direct match then fallback to substring match
  const preset =
    SIZE_PRESETS[key] ||
    Object.keys(SIZE_PRESETS).find((k) => key.includes(k))?.replace(/\s+/g, "") &&
      SIZE_PRESETS[Object.keys(SIZE_PRESETS).find((k) => key.includes(k)) as string];

  if (!preset) return [];

  if (preset === "numeric") {
    const min = opts?.min ?? 36;
    const max = opts?.max ?? 46;
    const step = opts?.step ?? 1;
    const out: string[] = [];
    for (let s = min; s <= max; s += step) out.push(String(s));
    return out;
  }

  return Array.isArray(preset) ? preset : [];
}