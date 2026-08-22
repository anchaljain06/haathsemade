import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { parseBody } from "@/lib/validate";
import { createOrderSchema } from "@/schemas/zodValidations";
import Order from "@/models/Order";
import Product from "@/models/Product";
import RequestModel from "@/models/Request";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!user.phone) {
    return NextResponse.json({ error: "PHONE_REQUIRED" }, { status: 403 });
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

      if (product.inventoryMode === "READY_STOCK" && product.stock < quantity) {
        return NextResponse.json(
          {
            error: `Only ${product.stock} left of “${product.name}”`,
            productId: String(product._id),
            available: product.stock,
          },
          { status: 409 }
        );
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

  const order = await Order.create({
    userId: user._id,
    items: orderItems,
    totalAmount,
    shippingAddress,
    status: "PENDING_CONFIRMATION",
  });

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
