import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Camera,
  Navigation,
  Settings,
  Wrench,
  MessageCircle,
  Clock,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { services } from '../data/services';
import type { Service } from '../types/catalog';
import SEO from '../components/SEO';

const Services: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', name: 'All Services' },
    { id: 'erp', name: 'ERP Development' },
    { id: 'networking', name: 'Networking & Infra' },
    { id: 'software', name: 'Web & Software' },
    { id: 'amc', name: 'Managed IT & AMC' },
    { id: 'security', name: 'Security & Surveillance' },
    { id: 'web-development', name: 'Website & Portals' },
    { id: 'invoicing-billing', name: 'Invoicing & Billing' },
    { id: 'inventory-management', name: 'Inventory Management' },
    { id: 'clinic-management', name: 'Clinic Management' },
    { id: 'lab-management', name: 'Lab Management' }
  ];

  const iconMap: Record<Service['iconName'], React.ReactElement> = {
    Camera: <Camera className="h-8 w-8" />,
    Navigation: <Navigation className="h-8 w-8" />,
    Settings: <Settings className="h-8 w-8" />,
    Wrench: <Wrench className="h-8 w-8" />,
    MessageCircle: <MessageCircle className="h-8 w-8" />
  };

  const filteredServices = useMemo(() => {
    if (selectedCategory === 'all') {
      return services;
    }
    return services.filter((service) => service.category === selectedCategory);
  }, [selectedCategory]);

  return (
    <>
      <SEO
        title="IT Services - ERP, Networking, Software, AMC, Security | WAINSO"
        description="Full-stack IT services: ERP development, networking & infra, web and software engineering, managed IT/AMC, and security deployments. Delivered across Jharkhand and pan-India."
        path="/services"
      />
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Our Services
            </h1>
            <p className="text-xl text-primary-100 max-w-2xl mx-auto">
              Consulting, build, and managed services across ERP, software, infrastructure, and security.
            </p>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap justify-center gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredServices.map((service) => {
            const quoteLink = `/quote-request?type=service&id=${service.id}`;

            return (
              <div key={service.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow group">
                <div className="p-8">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-primary-600 group-hover:scale-110 transition-transform">
                      {iconMap[service.iconName]}
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500 flex items-center justify-end">
                      <Clock className="h-4 w-4 mr-1" />
                      {service.duration}
                    </div>
                  </div>
                </div>

                <Link to={`/services/${service.slug}`}>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 hover:text-primary-600 transition-colors">
                    {service.name}
                  </h3>
                </Link>
                <p className="text-gray-600 mb-6">
                  {service.description}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Features</h4>
                    <ul className="space-y-1">
                      {service.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm text-gray-700">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Includes</h4>
                    <ul className="space-y-1">
                      {service.includes.map((item, index) => (
                        <li key={index} className="flex items-center text-sm text-gray-700">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    to={`/services/${service.slug}`}
                    className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors text-center flex items-center justify-center shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
                  >
                    View Details
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                  <Link
                    to={quoteLink}
                    className="flex-1 border-2 border-primary-600 text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-primary-600 hover:text-white transition-colors text-center"
                  >
                    Request Quote
                  </Link>
                </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Need a Custom Solution?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            We design and support IT solutions tailored to your industry, budget, and timelines.
          </p>
          <Link
            to="/contact"
            className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center"
          >
            Contact Us Today
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
    </>
  );
};

export default Services;
