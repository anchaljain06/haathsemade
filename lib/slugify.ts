import { randomBytes } from "crypto";

/**
 * Minimal shape of the Mongoose model methods `uniqueSlug` needs, so this
 * helper stays usable with any model without reaching for `any`.
 */
interface SlugLookupModel {
  exists(filter: Record<string, unknown>): Promise<unknown>;
}

const FALLBACK_BASE = "item";
const MAX_ATTEMPTS = 100;

/**
 * Builds a URL-safe slug from a product/category name.
 *
 * Diacritics are folded to their ASCII base (café -> cafe) rather than
 * dropped. Names written in a non-Latin script reduce to an empty string,
 * so callers should treat "" as "use a fallback base".
 */
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Returns a slug for `name` that no other document in `model` is using.
 * Appends -2, -3, ... on collision. Pass `excludeId` when renaming an
 * existing document so it doesn't collide with itself.
 */
export async function uniqueSlug(
  model: SlugLookupModel,
  name: string,
  excludeId?: string
): Promise<string> {
  const base = slugify(name) || FALLBACK_BASE;

  for (let n = 1; n <= MAX_ATTEMPTS; n++) {
    const candidate = n === 1 ? base : `${base}-${n}`;

    const query: Record<string, unknown> = { slug: candidate };
    if (excludeId) query._id = { $ne: excludeId };

    if (!(await model.exists(query))) return candidate;
  }

  // Pathological case (100+ products with the same name) — never collide.
  return `${base}-${randomBytes(4).toString("hex")}`;
}
