import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { invoicingApi } from '../../utils/api';
import { Search, Plus, X } from 'lucide-react';
import { hybridSearch } from '../../utils/fuzzySearch';
import { Client } from '../../types/invoicing';

interface ClientSearchProps {
  value: string; // client_id
  onChange: (client: Client | null) => void;
  onAddNew?: () => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export default function ClientSearch({
  value,
  onChange,
  onAddNew,
  placeholder = 'Search clients...',
  className = '',
  disabled = false
}: ClientSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Load all active clients - we'll do client-side fuzzy search
  const { data: allClients = [], isLoading } = useQuery({
    queryKey: ['clients', 'all'],
    queryFn: async () => {
      const response = await invoicingApi.getClients({ status: 'active' });
      return response.data || [];
    },
    staleTime: 30000, // Cache for 30 seconds
    refetchOnMount: true
  });

  useEffect(() => {
    // Sync with external value prop (client_id)
    if (value) {
      // Check if current selection matches the value
      const currentMatches = selectedClient && selectedClient.id === value;
      
      if (currentMatches) {
        // Already synced, ensure searchTerm matches
        const displayName = selectedClient.company 
          ? `${selectedClient.name} (${selectedClient.company})`
          : selectedClient.name;
        if (searchTerm !== displayName) {
          setSearchTerm(displayName);
        }
        return;
      }
      
      // Try to find the client in allClients
      const found = allClients.find((c: Client) => c.id === value);
      
      if (found) {
        setSelectedClient(found);
        const displayName = found.company 
          ? `${found.name} (${found.company})`
          : found.name;
        setSearchTerm(displayName);
      } else {
        // Client not found in list yet, but value is set - show the value
        setSearchTerm(value);
        // Keep selectedClient as null for now, it will be set when clients refresh
      }
    } else {
      // Value is empty, clear selection
      if (selectedClient || searchTerm) {
        setSelectedClient(null);
        setSearchTerm('');
      }
    }
  }, [value, allClients, selectedClient]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (client: Client) => {
    setSelectedClient(client);
    const displayName = client.company 
      ? `${client.name} (${client.company})`
      : client.name;
    setSearchTerm(displayName);
    setIsOpen(false);
    onChange(client);
  };

  const handleClear = () => {
    setSelectedClient(null);
    setSearchTerm('');
    onChange(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    setIsOpen(true);
    
    // If cleared, reset selection
    if (!term) {
      setSelectedClient(null);
      onChange(null);
    }
  };

  // Apply fuzzy search to clients for better matching - use allClients for client-side search
  // This matches the ProductSearch behavior: only show results that actually match
  const displayClients = useMemo(() => {
    if (!isOpen) {
      return [];
    }

    if (searchTerm.length >= 1) {
      // Use hybrid search for better multi-word and typo tolerance
      // Include name and company first for better relevance
      const searchFields: (keyof Client)[] = ['name', 'company', 'email', 'phone', 'city', 'state'];
      let results = hybridSearch(allClients, searchTerm, searchFields);
      
      // For multi-word searches, prefer results where ALL words matched
      // This makes the search stricter and more accurate
      const searchWords = searchTerm.toLowerCase().trim().split(/\s+/).filter(w => w.length > 0);
      if (searchWords.length > 1) {
        // Filter to prioritize clients where all words matched
        const allWordsMatched = results.filter((client: Client) => {
          const searchableText = [
            client.name,
            client.company,
            client.email,
            client.phone,
            client.city,
            client.state
          ]
            .filter(Boolean)
            .map(v => String(v).toLowerCase())
            .join(' ');
          
          // Check if all search words appear in the searchable text
          return searchWords.every(word => searchableText.includes(word));
        });
        
        // If we have results where all words matched, use those; otherwise use fuzzy results
        if (allWordsMatched.length > 0) {
          results = allWordsMatched;
        }
      }
      
      return results.slice(0, 20);
    }
    
    // Show first 10 clients when dropdown is open but no search term
    return allClients.slice(0, 10);
  }, [searchTerm, allClients, isOpen]);

  const displayValue = selectedClient 
    ? (selectedClient.company ? `${selectedClient.name} (${selectedClient.company})` : selectedClient.name)
    : (searchTerm || '');

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          onFocus={() => !disabled && setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full pl-10 pr-20 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-600"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 space-x-1">
          {selectedClient && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          {onAddNew && !disabled && (
            <button
              type="button"
              onClick={onAddNew}
              className="p-1 text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded"
              title="Add new client"
            >
              <Plus className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
          {isLoading && allClients.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">Loading clients...</div>
          ) : displayClients.length > 0 ? (
            <ul className="py-1">
              {displayClients.map((client: Client) => (
                <li
                  key={client.id}
                  onClick={() => handleSelect(client)}
                  className="px-4 py-2.5 hover:bg-teal-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900 truncate mb-1">
                        {client.name}
                        {client.company && (
                          <span className="text-gray-600 font-normal"> ({client.company})</span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
                        {client.email && (
                          <span className="truncate">{client.email}</span>
                        )}
                        {client.phone && (
                          <span className="truncate">• {client.phone}</span>
                        )}
                      </div>
                      {(client.city || client.state) && (
                        <div className="text-xs text-gray-500 mt-1 truncate">
                          {[client.city, client.state].filter(Boolean).join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : searchTerm.length >= 2 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              No clients found. {onAddNew && (
                <button
                  type="button"
                  onClick={onAddNew}
                  className="text-teal-600 hover:text-teal-700 font-medium ml-1"
                >
                  Add new client
                </button>
              )}
            </div>
          ) : (
            <div className="p-4 text-center text-sm text-gray-500">
              Start typing to search clients
            </div>
          )}
        </div>
      )}
    </div>
  );
}

