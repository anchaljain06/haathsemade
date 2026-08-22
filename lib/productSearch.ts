/** Escapes regex metacharacters so a user's query can't act as a pattern. */
export function escapeRegex(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Mongo's `$text` only matches whole indexed words, so "bouq" never finds
 * "bouquet" and a shopper typing a partial name sees an empty page.
 *
 * The text index is still the primary search — it's indexed and gives word
 * stemming — so callers run it first and fall back to this substring filter
 * only when it returns nothing. That keeps the collection scan off the common
 * path while making partial words work.
 */
export function substringSearchFilter(q: string) {
  const pattern = new RegExp(escapeRegex(q), "i");
  return { $or: [{ name: pattern }, { description: pattern }] };
}

const INVENTORY_MODES = [
  "READY_STOCK",
  "MADE_TO_ORDER",
  "CUSTOM_ONLY",
] as const;

/**
 * `?mode=` arrives as an arbitrary string. Anything outside the enum is
 * dropped rather than handed to Mongo as a filter value.
 */
export function parseInventoryMode(
  value: string | null | undefined
): (typeof INVENTORY_MODES)[number] | undefined {
  return INVENTORY_MODES.find((mode) => mode === value);
}
