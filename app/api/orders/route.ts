import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { parseBody } from "@/lib/validate";
import { rateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { createOrderSchema } from "@/schemas/zodValidations";
import Order from "@/models/Order";
import Product from "@/models/Product";
import RequestModel from "@/models/Request";

/** A READY_STOCK line whose stock has been decremented and may need giving back. */
type Reservation = { productId: unknown; name: string; quantity: number };

/** Hand back every unit we took. Best-effort: never throws into the caller. */
async function releaseStock(reservations: Reservation[]) {
  await Promise.allSettled(
    reservations.map((r) =>
      Product.updateOne({ _id: r.productId }, { $inc: { stock: r.quantity } })
    )
  );
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!user.phone) {
    return NextResponse.json({ error: "PHONE_REQUIRED" }, { status: 403 });
  }

  // Keyed by user, not IP: the route is behind auth, and a shared IP (office,
  // mobile carrier NAT) would otherwise let one customer lock out another.
  const limit = await rateLimit(`orders:${user._id}`, 5, 60_000);
  if (!limit.ok) {
    return rateLimitResponse(
      limit,
      "Too many orders placed just now. Please wait a moment and try again."
    );
  }

  const parsed = await parseBody(req, createOrderSchema);
  if (parsed.response) return parsed.response;
  const { items, shippingAddress } = parsed.data;

  await connectDB();

  // Collapse duplicate productIds so someone can't split one item across
  // several entries to slip past the per-item stock check.
  const quantityById = new Map<string, number>();
  const requestIds = new Set<string>();

  for (const item of items) {
    if ("requestId" in item) {
      requestIds.add(item.requestId);
    } else {
      quantityById.set(
        item.productId,
        (quantityById.get(item.productId) ?? 0) + item.quantity
      );
    }
  }

  // Price and name come from the database, never from the request body.
  const orderItems: {
    productId?: unknown;
    name: string;
    image: string;
    price: number;
    quantity: number;
  }[] = [];

  // Filled during validation, drained into atomic $inc calls once every other
  // check has passed — so we never take stock for an order that then 409s.
  const toReserve: Reservation[] = [];

  if (quantityById.size > 0) {
    const products = await Product.find({
      _id: { $in: [...quantityById.keys()] },
      isPublished: true,
    })
      .select("name price images inventoryMode stock")
      .lean();

    if (products.length !== quantityById.size) {
      return NextResponse.json(
        { error: "One or more items are no longer available" },
        { status: 409 }
      );
    }

    for (const product of products as any[]) {
      const quantity = quantityById.get(String(product._id))!;

      if (product.inventoryMode === "CUSTOM_ONLY") {
        return NextResponse.json(
          {
            error: `“${product.name}” is custom-only — please submit a request first`,
          },
          { status: 409 }
        );
      }

      if (product.inventoryMode === "READY_STOCK") {
        // A cheap pre-check purely for the friendly "only N left" message. The
        // real guarantee is the guarded $inc below; this read can go stale.
        if (product.stock < quantity) {
          return NextResponse.json(
            {
              error: `Only ${product.stock} left of “${product.name}”`,
              productId: String(product._id),
              available: product.stock,
            },
            { status: 409 }
          );
        }

        toReserve.push({
          productId: product._id,
          name: product.name,
          quantity,
        });
      }

      orderItems.push({
        productId: product._id,
        name: product.name,
        image: product.images?.[0] ?? "",
        price: product.price,
        quantity,
      });
    }
  }

  if (requestIds.size > 0) {
    // Must be this user's own request, already accepted, and quoted by an admin.
    const requests = await RequestModel.find({
      _id: { $in: [...requestIds] },
      userId: user._id,
      status: "ACCEPTED",
      quotedPrice: { $gt: 0 },
    })
      .populate("productId", "name images")
      .lean();

    if (requests.length !== requestIds.size) {
      return NextResponse.json(
        { error: "A quoted request in your cart is no longer valid" },
        { status: 409 }
      );
    }

    for (const request of requests as any[]) {
      orderItems.push({
        productId: request.productId?._id,
        name: request.productId?.name ?? request.description.slice(0, 50),
        image: request.productId?.images?.[0] ?? "",
        price: request.quotedPrice,
        quantity: 1,
      });
    }
  }

  const totalAmount = orderItems.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0
  );

  // Reserve stock. The `stock: { $gte: quantity }` guard on the $inc *is* the
  // concurrency check: two customers racing for the last item both pass the
  // read above, but only one update matches a document. Anything already taken
  // when a later line fails is handed straight back.
  const reserved: Reservation[] = [];

  for (const line of toReserve) {
    const result = await Product.updateOne(
      { _id: line.productId, stock: { $gte: line.quantity } },
      { $inc: { stock: -line.quantity } }
    );

    if (result.modifiedCount !== 1) {
      await releaseStock(reserved);
      const current = await Product.findById(line.productId)
        .select("stock")
        .lean<{ stock?: number }>();

      return NextResponse.json(
        {
          error: `Only ${current?.stock ?? 0} left of “${line.name}”`,
          productId: String(line.productId),
          available: current?.stock ?? 0,
        },
        { status: 409 }
      );
    }

    reserved.push(line);
  }

  let order;
  try {
    order = await Order.create({
      userId: user._id,
      items: orderItems,
      totalAmount,
      shippingAddress,
      status: "PENDING_CONFIRMATION",
    });
  } catch (err) {
    // The order never existed, so the units we took are nobody's.
    await releaseStock(reserved);
    throw err;
  }

  return NextResponse.json({ order }, { status: 201 });
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const orders = await Order.find({ userId: user._id })
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({ orders });
}
