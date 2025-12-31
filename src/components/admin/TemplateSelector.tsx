import React, { useState } from 'react';
import { FileText, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../../utils/api';

interface ProposalTemplate {
  id: string;
  name: string;
  category: 'warranty' | 'payment' | 'notes' | 'terms' | 'work_completion';
  content: string;
}

interface TemplateSelectorProps {
  category: 'warranty' | 'payment' | 'notes' | 'terms' | 'work_completion';
  onSelect: (content: string) => void;
  currentValue?: string;
  disabled?: boolean;
}

export default function TemplateSelector({ category, onSelect, currentValue, disabled = false }: TemplateSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Fetch templates from API
  const { data: templates = [], isLoading } = useQuery<ProposalTemplate[]>({
    queryKey: ['templates', category],
    queryFn: async () => {
      const response = await api.get('/content/templates', {
        params: { category, is_active: true }
      });
      return response.data || [];
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const handleSelect = (template: ProposalTemplate) => {
    // For work_completion, replace the value (it's a single line field)
    if (category === 'work_completion') {
      onSelect(template.content.trim());
    } else if (currentValue && currentValue.trim()) {
      // If there's existing content, append the template
      onSelect(currentValue + '\n\n' + template.content);
    } else {
      // Otherwise, just set the template
      onSelect(template.content);
    }
    setIsOpen(false);
  };

  if (isLoading) {
    return (
      <button
        type="button"
        disabled
        className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-400 bg-gray-50 border border-gray-200 rounded-lg"
      >
        <FileText className="w-3 h-3 mr-1" />
        Loading...
      </button>
    );
  }

  if (templates.length === 0) {
    return null;
  }

  const getCategoryLabel = (cat: string) => {
    const labels: Record<string, string> = {
      warranty: 'Warranty',
      payment: 'Payment Terms',
      notes: 'Notes',
      terms: 'Terms & Conditions',
      work_completion: 'Work Completion'
    };
    return labels[cat] || cat.replace('_', ' ');
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        disabled={disabled}
        className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-teal-700 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <FileText className="w-3 h-3 mr-1" />
        Templates
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 py-4">
            {/* Background overlay */}
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={() => setIsOpen(false)}
            ></div>

            {/* Modal panel */}
            <div className="relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all w-full max-w-lg">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {getCategoryLabel(category)} Templates
                  </h3>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 hover:text-gray-500 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="max-h-[60vh] overflow-y-auto">
                  {templates.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-8">
                      No templates available for this category.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {templates.map((template) => (
                        <button
                          key={template.id}
                          type="button"
                          onClick={() => handleSelect(template)}
                          className="w-full text-left p-3 rounded-lg hover:bg-teal-50 border border-gray-200 hover:border-teal-300 transition-colors"
                        >
                          <div className="text-sm font-medium text-gray-900 mb-1">{template.name}</div>
                          <div className="text-xs text-gray-500 line-clamp-2">
                            {template.content.replace(/<[^>]*>/g, '').split('\n')[0]}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

