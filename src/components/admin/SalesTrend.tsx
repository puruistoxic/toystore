import React from 'react';
import { TrendingUp } from 'lucide-react';

interface SalesTrendProps {
  data: Array<{
    month: string;
    invoice_count: number;
    revenue: number;
    paid: number;
  }>;
}

export default function SalesTrend({ data }: SalesTrendProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
  };

  const maxRevenue = Math.max(...data.map(d => d.revenue || 0), 1);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-teal-600" />
          <h3 className="text-lg font-semibold text-gray-900">Sales Trend (Last 12 Months)</h3>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No sales data available</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Chart Bars */}
          <div className="flex items-end justify-between space-x-2 h-64">
            {data.map((item, index) => {
              const revenueHeight = ((item.revenue || 0) / maxRevenue) * 100;
              const paidHeight = ((item.paid || 0) / maxRevenue) * 100;
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center group">
                  <div className="w-full flex flex-col items-center justify-end h-full space-y-1 mb-2">
                    {/* Revenue Bar */}
                    <div
                      className="w-full bg-teal-500 rounded-t hover:bg-teal-600 transition-colors relative group"
                      style={{ height: `${revenueHeight}%` }}
                      title={`Revenue: ${formatCurrency(item.revenue)}`}
                    >
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                          {formatCurrency(item.revenue)}
                        </div>
                      </div>
                    </div>
                    {/* Paid Bar */}
                    {paidHeight > 0 && (
                      <div
                        className="w-full bg-green-500 rounded-t hover:bg-green-600 transition-colors relative group"
                        style={{ height: `${paidHeight}%` }}
                        title={`Paid: ${formatCurrency(item.paid)}`}
                      >
                        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                            {formatCurrency(item.paid)}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-gray-600 text-center transform -rotate-45 origin-bottom-left whitespace-nowrap mt-2">
                    {formatMonth(item.month)}
                  </div>
                  <div className="text-xs font-medium text-gray-900 mt-1">
                    {item.invoice_count}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center space-x-6 pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-teal-500 rounded"></div>
              <span className="text-sm text-gray-600">Total Revenue</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-sm text-gray-600">Paid Amount</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-900">Numbers = Invoice Count</span>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            <div className="text-center">
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-lg font-bold text-gray-900">
                {formatCurrency(data.reduce((sum, d) => sum + (d.revenue || 0), 0))}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Total Paid</p>
              <p className="text-lg font-bold text-green-600">
                {formatCurrency(data.reduce((sum, d) => sum + (d.paid || 0), 0))}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Total Invoices</p>
              <p className="text-lg font-bold text-gray-900">
                {data.reduce((sum, d) => sum + (d.invoice_count || 0), 0)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


