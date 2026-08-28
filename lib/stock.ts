import Product from "@/models/Product";

/** A quantity of a product that was decremented and may need giving back. */
export interface StockReservation {
  productId: unknown;
  quantity: number;
}

/**
 * Hand back every unit taken by a reservation list.
 *
 * Best-effort and never throws into the caller: this runs on paths that are
 * already unwinding (a failed order) or already committed (an admin cancel),
 * where surfacing a second error would only obscure the first. A unit that
 * fails to return is a stock discrepancy Anchal can correct by hand; a throw
 * here would be a 500 on top of whatever went wrong.
 */
export async function releaseStock(reservations: StockReservation[]) {
  await Promise.allSettled(
    reservations.map((r) =>
      Product.updateOne({ _id: r.productId }, { $inc: { stock: r.quantity } })
    )
  );
}
