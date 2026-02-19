export type CustomersTableType = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  image_url: string;
  total_invoices: number;
  total_pending: number;
  total_paid: number;
};

export type FormattedCustomersTable = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  image_url: string;
  total_invoices: number;
  total_pending: string;
  total_paid: string;
};

export type CustomerField = {
  id: string;
  first_name: string;
  last_name: string;
};

export type CustomerForm = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  image_url: string;
};