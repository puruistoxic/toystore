import React, { useState } from 'react';
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

const Services: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const services = [
    {
      id: '1',
      name: 'CCTV Installation & Setup',
      description: 'Professional installation of high-definition surveillance systems with remote monitoring capabilities.',
      price: 15000,
      duration: '1-2 Days',
      category: 'cctv-installation',
      icon: <Camera className="h-8 w-8" />,
      features: [
        'HD IP Cameras',
        'Remote Mobile Access',
        'Night Vision',
        'Motion Detection',
        'Cloud Storage',
        'Professional Installation'
      ],
      includes: [
        'Site Survey',
        'Camera Installation',
        'DVR/NVR Setup',
        'Mobile App Configuration',
        'User Training',
        '1 Year Warranty'
      ]
    },
    {
      id: '2',
      name: 'GPS Vehicle Tracking',
      description: 'Real-time vehicle tracking with advanced features like geofencing and fuel monitoring.',
      price: 12000,
      duration: '1 Day',
      category: 'gps-installation',
      icon: <Navigation className="h-8 w-8" />,
      features: [
        'Real-time Tracking',
        'Geofencing Alerts',
        'Fuel Monitoring',
        'Driver Behavior Analysis',
        'Route Optimization',
        'Mobile App Access'
      ],
      includes: [
        'GPS Device Installation',
        'SIM Card Setup',
        'Software Configuration',
        'User Training',
        'Monthly Reports',
        '1 Year Support'
      ]
    },
    {
      id: '3',
      name: 'Equipment Maintenance',
      description: 'Comprehensive maintenance services for CCTV, GPS, and other security equipment.',
      price: 5000,
      duration: '2-4 Hours',
      category: 'maintenance',
      icon: <Wrench className="h-8 w-8" />,
      features: [
        'Preventive Maintenance',
        'System Health Check',
        'Software Updates',
        'Hardware Cleaning',
        'Performance Optimization',
        '24/7 Support'
      ],
      includes: [
        'System Inspection',
        'Cleaning & Calibration',
        'Software Updates',
        'Performance Report',
        'Recommendations',
        'Emergency Support'
      ]
    },
    {
      id: '4',
      name: 'Repair & Troubleshooting',
      description: 'Expert repair services for all types of security and tracking equipment.',
      price: 3000,
      duration: '1-3 Hours',
      category: 'repair',
      icon: <Settings className="h-8 w-8" />,
      features: [
        'Hardware Repair',
        'Software Issues',
        'Network Problems',
        'Component Replacement',
        'System Recovery',
        'Data Backup'
      ],
      includes: [
        'Diagnostic Check',
        'Repair or Replacement',
        'System Testing',
        'Documentation',
        'Warranty on Repairs',
        'Follow-up Support'
      ]
    },
    {
      id: '5',
      name: 'Security Consultation',
      description: 'Expert consultation for designing comprehensive security solutions for your business.',
      price: 8000,
      duration: '1 Day',
      category: 'consultation',
      icon: <MessageCircle className="h-8 w-8" />,
      features: [
        'Security Assessment',
        'Custom Solution Design',
        'Technology Recommendations',
        'Cost Analysis',
        'Implementation Plan',
        'ROI Calculation'
      ],
      includes: [
        'Site Visit',
        'Security Audit',
        'Detailed Report',
        'Solution Design',
        'Implementation Timeline',
        'Budget Planning'
      ]
    }
  ];

  const categories = [
    { id: 'all', name: 'All Services' },
    { id: 'cctv-installation', name: 'CCTV Installation' },
    { id: 'gps-installation', name: 'GPS Tracking' },
    { id: 'maintenance', name: 'Maintenance' },
    { id: 'repair', name: 'Repair' },
    { id: 'consultation', name: 'Consultation' }
  ];

  const filteredServices = selectedCategory === 'all' 
    ? services 
    : services.filter(service => service.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Services
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Professional security, tracking, and maintenance solutions tailored to your business needs
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
          {filteredServices.map((service) => (
            <div key={service.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="p-8">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-primary-600">
                    {service.icon}
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      ₹{service.price.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {service.duration}
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {service.name}
                </h3>
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
                    to={`/services/${service.id}`}
                    className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors text-center flex items-center justify-center"
                  >
                    View Details
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                  <Link
                    to="/contact"
                    className="flex-1 border-2 border-primary-600 text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-primary-600 hover:text-white transition-colors text-center"
                  >
                    Get Quote
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Need a Custom Solution?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            We provide tailored security and tracking solutions for businesses of all sizes
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
  );
};

export default Services;
