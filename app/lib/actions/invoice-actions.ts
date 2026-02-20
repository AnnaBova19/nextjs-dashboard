'use server';

import { z } from 'zod';
import postgres from 'postgres';
import { revalidatePath } from 'next/cache';
import { InvoiceSchema } from '@/app/dashboard/invoices/_lib/schemas';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

const CreateInvoice = InvoiceSchema.omit({ id: true, created_at: true });
export async function createInvoice(data: z.infer<typeof CreateInvoice>) {
  const validated = CreateInvoice.safeParse(data);
  if (!validated.success) {
    return {
      success: false,
      errors: validated.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }

  const { customerId, amount, status } = validated.data;
  const amountInCents = Math.round(amount * 100); // convert the amount into cents

  try {
    await sql`
      INSERT INTO invoices (customer_id, amount, status)
      VALUES (${customerId}, ${amountInCents}, ${status})
    `;
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false, message: 'Database Error: Failed to Create Invoice.' };
  }

  revalidatePath('/dashboard/invoices');
  return { success: true, message: 'Invoice created successfully!' };
}

const UpdateInvoice = InvoiceSchema.omit({ id: true, created_at: true });
export async function updateInvoice(id: string, data: z.infer<typeof UpdateInvoice>) {
  const validated = UpdateInvoice.safeParse(data);
  if (!validated.success) {
    return {
      success: false,
      errors: validated.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Invoice.',
    };
  }

  const { customerId, amount, status } = validated.data;
  const amountInCents = amount * 100; // convert the amount into cents

  try {
    await sql`
      UPDATE invoices
      SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}, updated_at = NOW()
      WHERE id = ${id}
    `;
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false, message: 'Database Error: Failed to Update Invoice.' };
  }

  revalidatePath('/dashboard/invoices');
  return { success: true, message: 'Invoice updated successfully!' };
}

export async function deleteInvoice(id: string) {
  try {
    await sql`DELETE FROM invoices WHERE id = ${id}`;
    revalidatePath('/dashboard/invoices');
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to delete invoice.');
  }
}