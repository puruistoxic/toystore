import React from 'react';
import { useParams } from 'react-router-dom';
import ProposalForm from '../../components/admin/ProposalForm';

export default function ProposalEdit() {
  const { id } = useParams<{ id: string }>();
  return <ProposalForm mode="edit" proposalId={id} />;
}
