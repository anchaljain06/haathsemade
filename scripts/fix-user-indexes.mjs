/**
 * One-time index repair for the `users` collection.
 *
 * Mongoose does not convert an existing index to different options — it calls
 * createIndex, gets an IndexOptionsConflict, and does not surface it loudly.
 * So schema changes to `unique` / `sparse` are silently ignored on a collection
 * that already has the index. Both fixes here require an explicit drop.
 *
 *   email_1    non-unique -> unique
 *              Sign-in falls back to an email match (auth.ts) and findOne
 *              returns an arbitrary document, so a duplicate would attach a
 *              returning customer to the wrong account.
 *
 *   clerkId_1  sparse:false -> sparse:true
 *              The schema already declares sparse. The live index is not, so
 *              every document *missing* clerkId indexes as null and a unique
 *              index permits exactly one null. Every post-migration Google user
 *              lacks clerkId, so the second one to sign up hits E11000 and
 *              cannot sign in at all.
 *
 * Usage:  node scripts/fix-user-indexes.mjs [--email] [--clerkid]
 *         no flags = both.  Safe to re-run; verifies before and after.
 */
import fs from "node:fs";
import mongoose from "mongoose";

const args = process.argv.slice(2);
const doEmail = args.length === 0 || args.includes("--email");
const doClerk = args.length === 0 || args.includes("--clerkid");

const env = Object.fromEntries(
  fs.readFileSync(".env", "utf8").split("\n")
    .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);

await mongoose.connect(env.MONGODB_URI);
const users = mongoose.connection.collection("users");

const show = async (label) => {
  const idx = await users.indexes();
  console.log(`\n${label}`);
  for (const i of idx) {
    console.log(`  ${i.name.padEnd(12)} unique=${!!i.unique} sparse=${!!i.sparse}`);
  }
};

await show("before:");

if (doEmail) {
  const dupes = await users.aggregate([
    { $group: { _id: "$email", n: { $sum: 1 } } },
    { $match: { n: { $gt: 1 } } },
  ]).toArray();
  if (dupes.length) {
    console.error(`\nABORT: ${dupes.length} duplicate email(s); resolve before adding a unique index.`);
    await mongoose.disconnect();
    process.exit(1);
  }
  console.log("\nemail: 0 duplicates, safe to make unique");
  await users.dropIndex("email_1").catch((e) => console.log(`  (drop skipped: ${e.codeName ?? e.message})`));
  await users.createIndex({ email: 1 }, { unique: true, name: "email_1" });
  console.log("  email_1 recreated unique");
}

if (doClerk) {
  await users.dropIndex("clerkId_1").catch((e) => console.log(`  (drop skipped: ${e.codeName ?? e.message})`));
  await users.createIndex({ clerkId: 1 }, { unique: true, sparse: true, name: "clerkId_1" });
  console.log("  clerkId_1 recreated unique+sparse");
}

await show("after:");
await mongoose.disconnect();
