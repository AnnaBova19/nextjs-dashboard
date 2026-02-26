import { InvoiceStatus } from "./enums";

export type InvoicesTableType = {
  id: string;
  member_id: string;
  first_name: string;
  last_name: string;
  email: string;
  image_url: string;
  created_at: number;
  updated_at: number;
  amount: number;
  status: InvoiceStatus;
};

export type InvoiceForm = {
  id: string;
  member_id: string;
  amount: number;
  status: InvoiceStatus;
};