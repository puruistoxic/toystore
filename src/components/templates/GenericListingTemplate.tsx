import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Building, Factory, Filter } from 'lucide-react';
import SEO from '../SEO';
import { ContentItem } from '../../types/content';

interface GenericListingTemplateProps {
  items: ContentItem[];
  type: 'location' | 'brand' | 'industry' | 'category';
  title: string;
  description: string;
  searchPlaceholder?: string;
  filterOptions?: Array<{ id: string; label: string; filter: (item: ContentItem) => boolean }>;
  renderCard?: (item: ContentItem) => React.ReactNode;
  getItemPath: (item: ContentItem) => string;
}

const GenericListingTemplate: React.FC<GenericListingTemplateProps> = ({
  items,
  type,
  title,
  description,
  searchPlaceholder = `Search ${type}s...`,
  filterOptions,
  renderCard,
  getItemPath
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const title = item.title || item.name || '';
      const matchesSearch =
        title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.shortDescription && item.shortDescription.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesFilter =
        selectedFilter === 'all' ||
        (filterOptions?.find((f) => f.id === selectedFilter)?.filter(item) ?? true);

      return matchesSearch && matchesFilter;
    });
  }, [items, searchTerm, selectedFilter, filterOptions]);

  const defaultRenderCard = (item: ContentItem) => {
    const displayTitle = item.title || item.name || 'Untitled';
    return (
      <Link
        to={getItemPath(item)}
        className="block bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 group"
      >
        {item.image && (
          <div className="relative h-48 overflow-hidden">
            <img
              src={item.image}
              alt={displayTitle}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/api/placeholder/400/300';
              }}
            />
          </div>
        )}
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
            {displayTitle}
          </h3>
        <p className="text-gray-600 mb-4 line-clamp-2">
          {item.shortDescription || item.description}
        </p>
        {item.stats && (
          <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
            {item.stats.projectsCompleted && (
              <span>{item.stats.projectsCompleted}+ Projects</span>
            )}
            {item.stats.customersServed && (
              <span>{item.stats.customersServed}+ Customers</span>
            )}
          </div>
        )}
        <span className="text-primary-600 font-semibold text-sm group-hover:underline">
          Learn more →
        </span>
      </div>
    </Link>
    );
  };

  return (
    <>
      <SEO
        title={`${title} | WAINSO`}
        description={description}
        path={`/${type}s`}
      />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{title}</h1>
          <p className="text-xl text-white/90 max-w-3xl">{description}</p>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="bg-white border-b border-gray-200 sticky top-[73px] z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Filters */}
            {filterOptions && filterOptions.length > 0 && (
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                >
                  <option value="all">All</option>
                  {filterOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredItems.length > 0 ? (
            <>
              <div className="mb-6">
                <p className="text-gray-600">
                  Showing <span className="font-semibold">{filteredItems.length}</span> {type}
                  {filteredItems.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredItems.map((item) => (
                  <React.Fragment key={item.id}>
                    {renderCard ? renderCard(item) : defaultRenderCard(item)}
                  </React.Fragment>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <p className="text-xl text-gray-600 mb-4">No {type}s found</p>
              <p className="text-gray-500">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default GenericListingTemplate;

