import { z } from "zod";

export const InvoiceFormSchema = z.object({
  id: z.string(),
  member_id: z.string().min(1, "Please select a member"),
  amount: z.coerce
    .number({ 
      invalid_type_error: "Please enter a number",
      required_error: "Amount is required" 
    })
    .gt(0, { message: 'Please enter an amount greater than $0' }),
  status: z.enum(['pending', 'paid'], {
    required_error: 'Please select an invoice status',
  }),
  created_at: z.string(),
});
export const InvoiceSchema = InvoiceFormSchema.omit({ id: true, created_at: true });