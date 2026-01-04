import { z } from "zod";

// Product validation schema
export const productSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Product name is required")
    .max(200, "Product name must be less than 200 characters"),
  description: z
    .string()
    .trim()
    .max(2000, "Description must be less than 2000 characters")
    .optional()
    .or(z.literal("")),
  price: z
    .string()
    .min(1, "Price is required")
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Price must be a positive number",
    })
    .refine((val) => parseFloat(val) <= 10000000, {
      message: "Price must be less than ₹1,00,00,000",
    }),
  original_price: z
    .string()
    .optional()
    .refine(
      (val) => !val || (!isNaN(parseFloat(val)) && parseFloat(val) >= 0),
      { message: "Original price must be a valid number" }
    )
    .refine((val) => !val || parseFloat(val) <= 10000000, {
      message: "Original price must be less than ₹1,00,00,000",
    }),
  category_id: z.string().optional(),
  stock_status: z.enum(["in_stock", "out_of_stock", "low_stock"], {
    errorMap: () => ({ message: "Invalid stock status" }),
  }),
  meesho_link: z
    .string()
    .trim()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
  featured: z.boolean(),
});

export type ProductFormData = z.infer<typeof productSchema>;

// Category validation schema
export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Category name is required")
    .max(100, "Category name must be less than 100 characters"),
  description: z
    .string()
    .trim()
    .max(500, "Description must be less than 500 characters")
    .optional()
    .or(z.literal("")),
  image_url: z
    .string()
    .trim()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
});

export type CategoryFormData = z.infer<typeof categorySchema>;

// Helper function to validate form data
export function validateProductForm(data: unknown): {
  success: boolean;
  data?: ProductFormData;
  errors?: Record<string, string>;
} {
  const result = productSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const errors: Record<string, string> = {};
  result.error.errors.forEach((err) => {
    if (err.path[0]) {
      errors[err.path[0] as string] = err.message;
    }
  });
  return { success: false, errors };
}

export function validateCategoryForm(data: unknown): {
  success: boolean;
  data?: CategoryFormData;
  errors?: Record<string, string>;
} {
  const result = categorySchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const errors: Record<string, string> = {};
  result.error.errors.forEach((err) => {
    if (err.path[0]) {
      errors[err.path[0] as string] = err.message;
    }
  });
  return { success: false, errors };
}
