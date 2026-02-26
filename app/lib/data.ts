import postgres from 'postgres';
import {
  LatestInvoiceRaw,
  Revenue,
} from './definitions';
import { formatCurrency } from './utils';
import { InvoiceForm, InvoicesTableType } from '../dashboard/invoices/_lib/types';
import { MemberField, MemberForm, MembersTableType } from '../dashboard/members/_lib/types';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function fetchRevenue() {
  try {
    // Artificially delay a response for demo purposes.
    // Don't do this in production :)

    // Delay is added for testing purposes. Remove it in production!
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const data = await sql<Revenue[]>`SELECT * FROM revenue`;

    return data;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch revenue data.');
  }
}

export async function fetchLatestInvoices() {
  try {
    // Delay is added for testing purposes. Remove it in production!
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const data = await sql<LatestInvoiceRaw[]>`
      SELECT invoices.amount, members.first_name, members.last_name, members.image_url, members.email, invoices.id
      FROM invoices
      JOIN members ON invoices.member_id = members.id
      ORDER BY invoices.updated_at DESC
      LIMIT 5`;

    const latestInvoices = data.map((invoice) => ({
      ...invoice,
      name: `${invoice.first_name} ${invoice.last_name}`,
      amount: formatCurrency(invoice.amount),
    }));
    return latestInvoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the latest invoices.');
  }
}

export async function fetchCardData() {
  try {
    // You can probably combine these into a single SQL query
    // However, we are intentionally splitting them to demonstrate
    // how to initialize multiple queries in parallel with JS.
    const invoiceCountPromise = sql`SELECT COUNT(*) FROM invoices`;
    const memberCountPromise = sql`SELECT COUNT(*) FROM members`;
    const invoiceStatusPromise = sql`SELECT
         SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS "paid",
         SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS "pending"
         FROM invoices`;

    const data = await Promise.all([
      invoiceCountPromise,
      memberCountPromise,
      invoiceStatusPromise,
    ]);

    const numberOfInvoices = Number(data[0][0].count ?? '0');
    const numberOfMembers = Number(data[1][0].count ?? '0');
    const totalPaidInvoices = formatCurrency(data[2][0].paid ?? '0');
    const totalPendingInvoices = formatCurrency(data[2][0].pending ?? '0');

    return {
      numberOfMembers,
      numberOfInvoices,
      totalPaidInvoices,
      totalPendingInvoices,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
  }
}

// INVOICES
const INVOICES_ITEMS_PER_PAGE = 10;
export async function fetchFilteredInvoices(query: string, currentPage: number) {
  const offset = (currentPage - 1) * INVOICES_ITEMS_PER_PAGE;

  try {
    const invoices = await sql<InvoicesTableType[]>`
      SELECT
        invoices.id,
        invoices.amount,
        invoices.created_at,
        invoices.updated_at,
        invoices.status,
        members.first_name,
        members.last_name,
        members.email,
        members.image_url
      FROM invoices
      JOIN members ON invoices.member_id = members.id
      WHERE
        members.first_name ILIKE ${`%${query}%`} OR
        members.last_name ILIKE ${`%${query}%`} OR
        members.email ILIKE ${`%${query}%`} OR
        invoices.amount::text ILIKE ${`%${query}%`} OR
        invoices.status ILIKE ${`%${query}%`}
      ORDER BY invoices.updated_at DESC
      LIMIT ${INVOICES_ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    return invoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoices.');
  }
}

export async function fetchInvoicesPages(query: string) {
  try {
    const data = await sql`SELECT COUNT(*)
      FROM invoices
      JOIN members ON invoices.member_id = members.id
      WHERE
        members.first_name ILIKE ${`%${query}%`} OR
        members.last_name ILIKE ${`%${query}%`} OR
        members.email ILIKE ${`%${query}%`} OR
        invoices.amount::text ILIKE ${`%${query}%`} OR
        invoices.status ILIKE ${`%${query}%`}
    `;

    const totalPages = Math.ceil(Number(data[0].count) / INVOICES_ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of invoices.');
  }
}

export async function fetchInvoiceById(id: string) {
  try {
    const data = await sql<InvoiceForm[]>`
      SELECT
        invoices.id,
        invoices.member_id,
        invoices.amount,
        invoices.status
      FROM invoices
      WHERE invoices.id = ${id};
    `;

    const invoice = data.map((invoice) => ({
      ...invoice,
      // Convert amount from cents to dollars
      amount: invoice.amount / 100,
    }));

    return invoice[0];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoice.');
  }
}

export async function fetchMembers() {
  try {
    const members = await sql<MemberField[]>`
      SELECT
        id,
        first_name,
        last_name,
        image_url
      FROM members
      ORDER BY first_name ASC
    `;

    return members;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch all members.');
  }
}

// MEMBERS
const MEMBERS_ITEMS_PER_PAGE = 10;
export async function fetchFilteredMembers(query: string, currentPage: number) {
  const offset = (currentPage - 1) * MEMBERS_ITEMS_PER_PAGE;

  try {
    const data = await sql<MembersTableType[]>`
      SELECT
        members.id,
        members.first_name,
        members.last_name,
        members.email,
        members.image_url,
        COUNT(invoices.id) AS total_invoices,
        SUM(CASE WHEN invoices.status = 'pending' THEN invoices.amount ELSE 0 END) AS total_pending,
        SUM(CASE WHEN invoices.status = 'paid' THEN invoices.amount ELSE 0 END) AS total_paid
      FROM members
      LEFT JOIN invoices ON members.id = invoices.member_id
      WHERE
        members.first_name ILIKE ${`%${query}%`} OR
        members.last_name ILIKE ${`%${query}%`} OR
        members.email ILIKE ${`%${query}%`}
      GROUP BY members.id, members.first_name, members.last_name, members.email, members.image_url
      ORDER BY members.first_name ASC
      LIMIT ${MEMBERS_ITEMS_PER_PAGE} OFFSET ${offset}
	  `;

    const members = data.map((member) => ({
      ...member,
      total_pending: formatCurrency(member.total_pending),
      total_paid: formatCurrency(member.total_paid),
    }));

    return members;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch member table.');
  }
}

export async function fetchMembersPages(query: string) {
  try {
    const data = await sql`SELECT COUNT(*)
      FROM members
      WHERE
        members.first_name ILIKE ${`%${query}%`} OR
        members.last_name ILIKE ${`%${query}%`} OR
        members.email ILIKE ${`%${query}%`}
    `;

    const totalPages = Math.ceil(Number(data[0].count) / MEMBERS_ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of members.');
  }
}

export async function fetchMemberById(id: string) {
  try {
    const data = await sql<MemberForm[]>`
      SELECT
        members.id,
        members.first_name,
        members.last_name,
        members.email,
        members.image_url
      FROM members
      WHERE members.id = ${id};
    `;

    return data[0];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch member.');
  }
}
