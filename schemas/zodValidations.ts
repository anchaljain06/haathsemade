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