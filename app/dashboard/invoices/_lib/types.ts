import { InvoiceStatus } from "./enums";

export type InvoicesTableType = {
  id: string;
  customer_id: string;
  first_name: string;
  last_name: string;
  email: string;
  image_url: string;
  date: string;
  amount: number;
  status: InvoiceStatus;
};

export type InvoiceForm = {
  id: string;
  customer_id: string;
  amount: number;
  status: InvoiceStatus;
};