import { z } from "zod";

export const InvoiceSchema = z.object({
  id: z.string(),
  customerId: z.string().min(1, "Please select a customer."),
  amount: z.coerce
    .number({ 
      invalid_type_error: "Please enter a number",
      required_error: "Amount is required" 
    })
    .gt(0, { message: 'Please enter an amount greater than $0.' }),
  status: z.enum(['pending', 'paid'], {
    required_error: 'Please select an invoice status.',
  }),
  created_at: z.string(),
});