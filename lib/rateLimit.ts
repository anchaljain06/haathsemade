import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";

/**
 * Fixed-window rate limiting, backed by Mongo.
 *
 * Deliberately not in-memory: on Vercel each lambda instance has its own heap,
 * so a burst spread across instances would each see a fresh counter and the
 * limit would not hold. Mongo is already a dependency and the collection is
 * tiny, so the extra round-trip buys a limit that is actually shared.
 *
 * The window bucket is part of the `_id`, so the increment and the check are
 * one atomic upsert — no read-then-write race. Documents carry `expiresAt` and
 * a TTL index reaps them, so the collection stays roughly the size of one
 * window's worth of active callers.
 */

const COLLECTION = "ratelimits";

/** Cached so the TTL index is only created once per process, not per request. */
let ttlIndexReady: Promise<unknown> | null = null;

function ensureTtlIndex() {
  if (!ttlIndexReady) {
    ttlIndexReady = mongoose.connection
      .collection(COLLECTION)
      .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
      // Reset on failure so a transient error doesn't disable cleanup for the
      // life of the process. A missing TTL index costs storage, not
      // correctness, so this never propagates.
      .catch(() => {
        ttlIndexReady = null;
      });
  }
  return ttlIndexReady;
}

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export async function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  await connectDB();
  await ensureTtlIndex();

  const now = Date.now();
  const windowStart = Math.floor(now / windowMs) * windowMs;
  const retryAfterSeconds = Math.max(
    1,
    Math.ceil((windowStart + windowMs - now) / 1000)
  );

  try {
    const collection = mongoose.connection.collection(COLLECTION);
    const res = await collection.findOneAndUpdate(
      { _id: `${key}:${windowStart}` as unknown as never },
      {
        $inc: { count: 1 },
        $setOnInsert: { expiresAt: new Date(windowStart + windowMs) },
      },
      { upsert: true, returnDocument: "after" }
    );

    // The driver returns the document directly on v6+, and { value } on older
    // versions. Accept either rather than pinning to one.
    const doc = (res && "value" in res ? res.value : res) as
      | { count?: number }
      | null;
    const count = doc?.count ?? 1;

    return {
      ok: count <= limit,
      remaining: Math.max(0, limit - count),
      retryAfterSeconds,
    };
  } catch {
    // Fail open. A limiter that 500s the checkout when Mongo hiccups is worse
    // than one that briefly lets a burst through — the order path still has
    // its own auth, validation and stock guards behind this.
    return { ok: true, remaining: limit, retryAfterSeconds };
  }
}

/** Ready-to-return 429 carrying a Retry-After header. */
export function rateLimitResponse(result: RateLimitResult, message: string) {
  return NextResponse.json(
    { error: "RATE_LIMITED", message },
    {
      status: 429,
      headers: { "Retry-After": String(result.retryAfterSeconds) },
    }
  );
}
