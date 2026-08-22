import { NextResponse } from "next/server";
import type { ZodType } from "zod";

/**
 * Parses and validates a request body against a Zod schema.
 *
 * Returns either `{ data }` or `{ response }` — a ready-to-return 400. Route
 * handlers should check for `response` first:
 *
 *   const parsed = await parseBody(req, createOrderSchema);
 *   if (parsed.response) return parsed.response;
 *   const { items } = parsed.data;
 *
 * Unknown keys are stripped by Zod, which also closes off mass assignment.
 */
export async function parseBody<T>(
  req: Request,
  schema: ZodType<T>
): Promise<{ data: T; response?: never } | { data?: never; response: NextResponse }> {
  let raw: unknown;

  try {
    raw = await req.json();
  } catch {
    return {
      response: NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      ),
    };
  }

  const result = schema.safeParse(raw);

  if (!result.success) {
    const issue = result.error.issues[0];
    const path = issue?.path.join(".");
    return {
      response: NextResponse.json(
        {
          error: path ? `${path}: ${issue.message}` : issue?.message ?? "Invalid request",
          issues: result.error.issues,
        },
        { status: 400 }
      ),
    };
  }

  return { data: result.data };
}
