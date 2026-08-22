/**
 * Makes Mongoose `.lean()` results safe to pass from a Server Component into a
 * Client Component.
 *
 * `.lean()` returns plain objects, but the values inside are still ObjectId and
 * Date instances, which React cannot serialize across the boundary. Round-
 * tripping through JSON turns them into strings.
 *
 * Keep list queries narrow with `.select()` so this stays cheap.
 */
export function serialize<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
