import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Receipt, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp,
  Mail,
  FileText
} from 'lucide-react';

interface InvoiceStatsProps {
  stats: {
    total_invoices: number;
    draft_count: number;
    sent_count: number;
    paid_count: number;
    partial_count: number;
    overdue_count: number;
    pending_approval_count: number;
    disputed_count: number;
    total_revenue: number;
    total_paid: number;
    total_outstanding: number;
  };
}

export default function InvoiceStats({ stats }: InvoiceStatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const statCards = [
    {
      title: 'Total Invoices',
      value: stats.total_invoices || 0,
      icon: Receipt,
      color: 'bg-blue-500',
      link: '/admin/invoices'
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.total_revenue || 0),
      icon: DollarSign,
      color: 'bg-green-500',
      link: '/admin/invoices'
    },
    {
      title: 'Paid Amount',
      value: formatCurrency(stats.total_paid || 0),
      icon: CheckCircle,
      color: 'bg-teal-500',
      link: '/admin/invoices?status=paid'
    },
    {
      title: 'Outstanding',
      value: formatCurrency(stats.total_outstanding || 0),
      icon: AlertCircle,
      color: 'bg-orange-500',
      link: '/admin/invoices?status=overdue'
    }
  ];

  const statusCards = [
    {
      title: 'Draft',
      value: stats.draft_count || 0,
      color: 'bg-gray-100 text-gray-800',
      link: '/admin/invoices?status=draft'
    },
    {
      title: 'Pending Approval',
      value: stats.pending_approval_count || 0,
      color: 'bg-amber-100 text-amber-800',
      link: '/admin/invoices?status=pending_approval'
    },
    {
      title: 'Sent',
      value: stats.sent_count || 0,
      color: 'bg-blue-100 text-blue-800',
      link: '/admin/invoices?status=sent'
    },
    {
      title: 'Partial',
      value: stats.partial_count || 0,
      color: 'bg-yellow-100 text-yellow-800',
      link: '/admin/invoices?status=partial'
    },
    {
      title: 'Paid',
      value: stats.paid_count || 0,
      color: 'bg-green-100 text-green-800',
      link: '/admin/invoices?status=paid'
    },
    {
      title: 'Overdue',
      value: stats.overdue_count || 0,
      color: 'bg-red-100 text-red-800',
      link: '/admin/invoices?status=overdue'
    },
    {
      title: 'Disputed',
      value: stats.disputed_count || 0,
      color: 'bg-orange-100 text-orange-800',
      link: '/admin/invoices?status=disputed'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              to={card.link}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-teal-300 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                </div>
                <div className={`${card.color} p-3 rounded-lg group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Status Breakdown */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoice Status Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {statusCards.map((card) => (
            <Link
              key={card.title}
              to={card.link}
              className="text-center p-4 rounded-lg border border-gray-200 hover:shadow-md transition-all"
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${card.color} mb-2`}>
                <span className="text-lg font-bold">{card.value}</span>
              </div>
              <p className="text-xs font-medium text-gray-700">{card.title}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
