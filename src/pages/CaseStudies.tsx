import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, TrendingUp, Building, MapPin } from 'lucide-react';
import SEO from '../components/SEO';
import { caseStudies } from '../data/caseStudies';
import { industries } from '../data/industries';
import { locations } from '../data/locations';
import { hybridSearch } from '../utils/fuzzySearch';
import { CaseStudy } from '../types/content';

const CaseStudies: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');

  const filteredCaseStudies = useMemo(() => {
    let filtered = caseStudies;
    
    // Apply filters first
    filtered = filtered.filter((cs: any) => {
      const matchesIndustry = selectedIndustry === 'all' || cs.industry === selectedIndustry;
      const matchesLocation = selectedLocation === 'all' || cs.location === selectedLocation;
      return matchesIndustry && matchesLocation;
    });
    
    // Apply smart fuzzy search
    if (searchTerm) {
      // Note: industry and location are IDs, so we search by their resolved names
      // For now, search in title, description, and shortDescription
      const searchFields: (keyof CaseStudy)[] = ['title', 'description', 'shortDescription'];
      filtered = hybridSearch(filtered, searchTerm, searchFields);
    }
    
    return filtered;
  }, [searchTerm, selectedIndustry, selectedLocation]);

  return (
    <>
      <SEO
        title="Case Studies | Our Success Stories | WAINSO"
        description="Explore our successful security and tracking implementations. Real case studies from various industries and locations."
        path="/case-studies"
      />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Success Stories</h1>
          <p className="text-xl text-white/90 max-w-3xl">
            Explore real-world implementations of our security and tracking solutions across various industries and locations.
          </p>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="bg-white border-b border-gray-200 sticky top-[73px] z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search case studies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
              >
                <option value="all">All Industries</option>
                {industries.map((industry) => (
                  <option key={industry.id} value={industry.id}>
                    {industry.name}
                  </option>
                ))}
              </select>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
              >
                <option value="all">All Locations</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredCaseStudies.length > 0 ? (
            <>
              <div className="mb-6">
                <p className="text-gray-600">
                  Showing <span className="font-semibold">{filteredCaseStudies.length}</span> case
                  {filteredCaseStudies.length !== 1 ? ' studies' : ' study'}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredCaseStudies.map((cs) => {
                  const industry = industries.find((i) => i.id === cs.industry);
                  const location = locations.find((l) => l.id === cs.location);

                  return (
                    <Link
                      key={cs.id}
                      to={`/case-studies/${cs.slug}`}
                      className="block bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 group"
                    >
                      {cs.images && cs.images.length > 0 && (
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={cs.images[0]}
                            alt={cs.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/api/placeholder/400/300';
                            }}
                          />
                        </div>
                      )}
                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-3">
                          {industry && (
                            <span className="px-2 py-1 bg-primary-50 text-primary-700 rounded text-xs font-medium">
                              {industry.name}
                            </span>
                          )}
                          {location && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {location.name}
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
                          {cs.title}
                        </h3>
                        <p className="text-gray-600 mb-4 line-clamp-2">{cs.shortDescription}</p>
                        {cs.results && cs.results.length > 0 && (
                          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                            <div className="flex items-center">
                              <TrendingUp className="h-4 w-4 mr-1" />
                              {cs.results[0].value} {cs.results[0].metric}
                            </div>
                          </div>
                        )}
                        <span className="text-primary-600 font-semibold text-sm group-hover:underline">
                          Read case study →
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <p className="text-xl text-gray-600 mb-4">No case studies found</p>
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

export default CaseStudies;

