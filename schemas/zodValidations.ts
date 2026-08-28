import { z } from "zod";

export const addressSchema = z.object({
  label: z.string().min(1, "Label is required"),
  line1: z.string().min(5, "Address line 1 is required"),
  line2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().regex(/^\d{6}$/, "Pincode must be 6 digits"),
  isDefault: z.boolean().default(false),
});

export const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description is required"),
  images: z.array(z.string()).optional(),
  price: z.number({ error: "Price must be a number" }).gt(0, "Price must be greater than 0"),
  categoryId: z.string().min(1, "Category is required"),
  inventoryMode: z.enum(["READY_STOCK", "MADE_TO_ORDER", "CUSTOM_ONLY"]),
  isCustomizable: z.boolean().default(false),
  estimatedCraftTime: z.string().optional(),
  stock: z.number().min(0).default(0),
  isPublished: z.boolean().default(false),
});

export type ProductFormData = z.infer<typeof productSchema>;
export type AddressFormData = z.infer<typeof addressSchema>;

/* ------------------------------------------------------------------ *
 * API request schemas
 *
 * The schemas above are shared with the client forms. Everything below is
 * for validating untrusted request bodies inside route handlers — client
 * validation is bypassable, so every write route must parse its own input.
 * ------------------------------------------------------------------ */

const objectId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

/**
 * Note: prices are deliberately NOT accepted here. The order route looks up
 * the real price server-side (catalogue price for products, the admin's quoted
 * price for accepted requests) and recomputes the total, so a client-supplied
 * price is ignored rather than trusted.
 */
export const createOrderSchema = z.object({
  items: z
    .array(
      z.union([
        z.object({
          productId: objectId,
          quantity: z
            .number()
            .int()
            .min(1, "Quantity must be at least 1")
            .max(99),
        }),
        z.object({
          // A custom/made-to-order request the admin has quoted. Always one-off.
          requestId: objectId,
          quantity: z.literal(1).default(1),
        }),
      ])
    )
    .min(1, "Cart is empty"),
  shippingAddress: addressSchema,
});

export const deleteAddressSchema = z.object({
  index: z.number().int().min(0, "Invalid address index"),
});

/** Admin product create: reuses the form schema, ignoring unknown keys. */
export const adminCreateProductSchema = productSchema;

/** Admin product update: every field optional, but still validated. */
export const adminUpdateProductSchema = productSchema.partial();

export const adminOrderUpdateSchema = z.object({
  status: z
    .enum([
      "PENDING_CONFIRMATION",
      "PAYMENT_COMPLETED",
      "CRAFTING",
      "QUALITY_CHECK",
      "PACKED",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
    ])
    .optional(),
  courierName: z.string().max(120).optional(),
  trackingUrl: z.string().url("Must be a valid URL").optional(),
  estimatedDelivery: z.coerce.date().optional(),
});

export const adminRequestUpdateSchema = z.object({
  status: z
    .enum([
      "SUBMITTED",
      "UNDER_REVIEW",
      "NEED_DISCUSSION",
      "QUOTATION_READY",
      "REJECTED",
      "ACCEPTED",
    ])
    .optional(),
  quotedPrice: z.number().min(0).optional(),
  estimatedCraftTime: z.string().max(120).optional(),
  adminNotes: z.string().max(2000).optional(),
});

export const createRequestSchema = z.object({
  type: z.enum(["MADE_TO_ORDER", "CUSTOM_ONLY"]),
  productId: objectId.optional(),
  description: z.string().min(1, "description is required").max(4000),
  referenceLinks: z.array(z.string()).max(20).optional(),
  budget: z.number().min(0).optional(),
  neededBy: z.coerce.date().optional(),
});

export const profileUpdateSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  // Trimmed, then either empty or a real number. Empty has to stay legal so a
  // user with no phone yet can still save a name change — and trimming means a
  // whitespace-only value lands as "", which the PHONE_REQUIRED gate on
  // /api/orders and /api/requests correctly rejects. Without the trim, " " is
  // truthy and walks straight past that gate.
  phone: z
    .string()
    .trim()
    .max(20)
    .refine((v) => v === "" || /^\+?[0-9]{10,15}$/.test(v), {
      message: "Enter a valid phone number",
    })
    .optional(),
});

export const categoryCreateSchema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  image: z.string().optional(),
});

export const categoryUpdateSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  image: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const settingsUpdateSchema = z.object({
  whatsappNumber: z
    .string()
    .regex(/^\+?[0-9]{10,15}$/, "Enter a valid phone number"),
});
/**
 * Gallery uploads. `image` values are Cloudinary URLs the client got back from
 * the signed-upload widget, so they are constrained to that host rather than
 * accepted as any string — an arbitrary URL here would render as an <img> on
 * the public gallery.
 */
const cloudinaryUrl = z
  .string()
  .url("Must be a valid URL")
  .refine(
    (value) => {
      try {
        return new URL(value).hostname === "res.cloudinary.com";
      } catch {
        return false;
      }
    },
    "Image must be a res.cloudinary.com URL"
  );

export const galleryCreateSchema = z.object({
  images: z.array(cloudinaryUrl).min(1, "At least one image is required").max(20),
  type: z.enum(["INSPIRATION", "CUSTOMER_MEMORY"]).default("INSPIRATION"),
  title: z.string().max(160).optional(),
});

export const galleryUpdateSchema = z
  .object({
    isApproved: z.boolean().optional(),
    title: z.string().max(160).optional(),
  })
  // Every field is optional, so an empty body would otherwise parse cleanly
  // and turn into a no-op $set.
  .refine((body) => Object.keys(body).length > 0, "No fields to update");
