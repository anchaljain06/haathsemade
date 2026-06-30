export function buildOrderWhatsAppLink(
  adminNumber: string,
  orderId: string,
  items: { name: string; quantity: number; price: number }[],
  totalAmount: number
) {
  const itemLines = items
    .map((i) => `- ${i.name} x${i.quantity} (₹${i.price * i.quantity})`)
    .join("\n");

  const message = `Hi! I just placed an order.\n\nOrder ID: ${orderId}\n${itemLines}\n\nTotal: ₹${totalAmount}\n\nPlease confirm and let me know the payment details.`;

  return `https://wa.me/${adminNumber}?text=${encodeURIComponent(message)}`;
}

export function buildRequestWhatsAppLink(
  adminNumber: string,
  type: "MADE_TO_ORDER" | "CUSTOM_ONLY",
  description: string
) {
  const label = type === "MADE_TO_ORDER" ? "Made to Order" : "Custom Order";
  const message = `Hi! I submitted a ${label} request.\n\n${description}\n\nLooking forward to your quote!`;

  return `https://wa.me/${adminNumber}?text=${encodeURIComponent(message)}`;
}