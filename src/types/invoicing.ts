export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  tax_id?: string;
  website?: string;
  notes?: string;
  status: 'active' | 'inactive' | 'archived';
  created_at?: string;
  updated_at?: string;
}

export interface ProposalItem {
  description: string;
  quantity: number;
  price: number;
  total?: number;
  hsn_code?: string;
  product_id?: string;
  price_includes_gst?: boolean; // Whether the price already includes GST
}

export interface Proposal {
  id: string;
  proposal_number: string;
  client_id: string;
  client_name?: string;
  client_email?: string;
  client_phone?: string;
  client_company?: string;
  client_address?: string;
  client_city?: string;
  client_state?: string;
  client_country?: string;
  client_postal_code?: string;
  client_tax_id?: string;
  title: string;
  description?: string;
  items: ProposalItem[];
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount: number;
  total: number;
  currency: string;
  valid_until?: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  notes?: string;
  terms?: string;
  created_by?: number;
  created_at?: string;
  updated_at?: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  price: number;
  total?: number;
  hsn_code?: string;
  product_id?: string;
  price_includes_gst?: boolean; // Whether the price already includes GST
}

export interface Invoice {
  id: string;
  invoice_number: string;
  proposal_id?: string;
  client_id: string;
  client_name?: string;
  client_email?: string;
  client_phone?: string;
  client_company?: string;
  client_address?: string;
  client_city?: string;
  client_state?: string;
  client_country?: string;
  client_postal_code?: string;
  client_tax_id?: string;
  title: string;
  description?: string;
  items: InvoiceItem[];
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount: number;
  total: number;
  currency: string;
  issue_date: string;
  due_date: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'sent' | 'viewed' | 'partial' | 'paid' | 'overdue' | 'disputed' | 'on_hold' | 'cancelled' | 'refunded';
  invoice_type?: 'confirmed' | 'sharing';
  payment_terms?: string;
  notes?: string;
  terms?: string;
  paid_amount?: number;
  created_by?: number;
  created_at?: string;
  updated_at?: string;
}

export interface InvoicePayment {
  id: number;
  invoice_id: string;
  amount: number;
  payment_date: string;
  payment_method: 'cash' | 'bank_transfer' | 'cheque' | 'credit_card' | 'debit_card' | 'upi' | 'other';
  reference_number?: string;
  notes?: string;
  created_by?: number;
  created_by_username?: string;
  created_by_full_name?: string;
  created_at?: string;
  is_deleted?: number;
  deleted_by?: number;
  deleted_by_username?: string;
  deleted_by_full_name?: string;
  deleted_at?: string;
}

export interface InvoiceReminder {
  id: number;
  invoice_id: string;
  reminder_type: 'before_due' | 'on_due' | 'after_due' | 'custom';
  reminder_date: string;
  days_before_after: number;
  email_sent: boolean;
  email_sent_at?: string;
  email_subject?: string;
  email_body?: string;
  created_by?: number;
  created_at?: string;
}
