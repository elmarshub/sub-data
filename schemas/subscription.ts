import { CATEGORIES } from "@/constants/categories";
import { z } from "zod";

export const subscriptionFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  price: z
    .string()
    .trim()
    .min(1, "Enter a valid price")
    .refine((value) => {
      const parsed = Number(value);
      return Number.isFinite(parsed) && parsed > 0;
    }, "Enter a valid price"),
  billing: z.enum(["Monthly", "Yearly"]),
  category: z.enum(CATEGORIES).nullable(),
});

export type SubscriptionFormValues = z.infer<typeof subscriptionFormSchema>;
