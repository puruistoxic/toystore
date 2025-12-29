import React, { useState } from 'react';
import { FileText, X, ChevronDown, ChevronUp } from 'lucide-react';
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

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-teal-700 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <FileText className="w-3 h-3 mr-1" />
        Templates
        {isOpen ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-20 mt-1 w-80 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-auto">
            <div className="p-2 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-700 uppercase">
                  {category.replace('_', ' ')} Templates
                </span>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
            <div className="p-2">
              {templates.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => handleSelect(template)}
                  className="w-full text-left p-2 mb-1 rounded hover:bg-teal-50 border border-transparent hover:border-teal-200 transition-colors"
                >
                  <div className="text-sm font-medium text-gray-900">{template.name}</div>
                  <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {template.content.split('\n')[0]}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

