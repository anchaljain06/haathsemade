import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/getCurrentUser";
import Product from "@/models/Product";
import { slugify } from "@/lib/slugify";

/**
 * One-time migration: backfill `slug` on products created before the field
 * existed in the schema (Mongoose silently discarded it until then).
 *
 * Idempotent — products that already have a slug are left alone, so it is safe
 * to re-run. Delete this route once it has been run against production.
 */
export async function POST() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  // Bypass the schema so documents missing the now-required slug can be read.
  const collection = Product.collection;

  const stale = await collection
    .find(
      { $or: [{ slug: { $exists: false } }, { slug: null }, { slug: "" }] },
      { projection: { name: 1 } }
    )
    .toArray();

  const taken = new Set<string>(
    (
      await collection
        .find({ slug: { $type: "string", $ne: "" } }, { projection: { slug: 1 } })
        .toArray()
    ).map((d) => d.slug as string)
  );

  const updated: { id: string; slug: string }[] = [];

  for (const doc of stale) {
    const base = slugify(String(doc.name ?? "")) || "item";

    let candidate = base;
    for (let n = 2; taken.has(candidate); n++) candidate = `${base}-${n}`;
    taken.add(candidate);

    await collection.updateOne({ _id: doc._id }, { $set: { slug: candidate } });
    updated.push({ id: String(doc._id), slug: candidate });
  }

  // Safe to build the unique index only once every document has a slug.
  await Product.syncIndexes();

  return NextResponse.json({
    scanned: stale.length,
    updated,
    indexesSynced: true,
  });
}
