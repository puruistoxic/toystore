import React from 'react';
import { useParams } from 'react-router-dom';
import InvoiceForm from '../../components/admin/InvoiceForm';

export default function InvoiceEdit() {
  const { id } = useParams<{ id: string }>();
  return <InvoiceForm mode="edit" invoiceId={id} />;
}
