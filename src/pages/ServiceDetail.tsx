import React from 'react';
import { useParams } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle, Users, Star, MessageCircle } from 'lucide-react';

const ServiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  // Mock service data - in real app, fetch based on id
  const service = {
    id: '1',
    name: 'CCTV Installation & Setup',
    description: 'Professional installation of high-definition surveillance systems with remote monitoring capabilities. Our expert technicians ensure proper setup and configuration for optimal performance.',
    price: 15000,
    duration: '1-2 Days',
    category: 'cctv-installation',
    rating: 4.9,
    reviews: 47,
    features: [
      'HD IP Cameras with Night Vision',
      'Remote Mobile Access',
      'Motion Detection & Alerts',
      'Cloud Storage Options',
      'Professional Installation',
      'User Training Included',
      '24/7 Technical Support',
      '1 Year Warranty'
    ],
    includes: [
      'Site Survey & Planning',
      'Camera Installation',
      'DVR/NVR Setup',
      'Network Configuration',
      'Mobile App Setup',
      'User Training Session',
      'System Testing',
      'Documentation & Manuals'
    ],
    requirements: [
      'Stable Internet Connection',
      'Power Outlets Near Installation Points',
      'Access to Installation Areas',
      'Basic Network Knowledge (Optional)'
    ],
    process: [
      {
        step: 1,
        title: 'Initial Consultation',
        description: 'We assess your security needs and recommend the best camera placement and system configuration.'
      },
      {
        step: 2,
        title: 'Site Survey',
        description: 'Our technicians visit your location to plan the installation and identify any potential challenges.'
      },
      {
        step: 3,
        title: 'Installation',
        description: 'Professional installation of cameras, DVR/NVR, and network equipment with minimal disruption.'
      },
      {
        step: 4,
        title: 'Configuration & Testing',
        description: 'System setup, network configuration, and thorough testing to ensure everything works perfectly.'
      },
      {
        step: 5,
        title: 'Training & Handover',
        description: 'Complete training on system operation and mobile app usage, plus documentation handover.'
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2 text-sm">
            <a href="/services" className="text-gray-500 hover:text-primary-600">
              Services
            </a>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900">{service.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Service Header */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-5 w-5 ${i < Math.floor(service.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                  ))}
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900">
                    ₹{service.price.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500 flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {service.duration}
                  </div>
                </div>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {service.name}
              </h1>
              <p className="text-gray-600 text-lg mb-6">
                {service.description}
              </p>

              <div className="flex items-center text-sm text-gray-600">
                <span>{service.rating} rating</span>
                <span className="mx-2">•</span>
                <span>{service.reviews} reviews</span>
              </div>
            </div>

            {/* Features */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Service Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {service.features.map((feature, index) => (
                  <div key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* What's Included */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">What's Included</h2>
              <ul className="space-y-3">
                {service.includes.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Requirements */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Requirements</h2>
              <ul className="space-y-3">
                {service.requirements.map((requirement, index) => (
                  <li key={index} className="flex items-start">
                    <div className="h-2 w-2 bg-primary-600 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700">{requirement}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Process */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Process</h2>
              <div className="space-y-6">
                {service.process.map((step, index) => (
                  <div key={index} className="flex">
                    <div className="flex-shrink-0">
                      <div className="bg-primary-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-semibold">
                        {step.step}
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {step.title}
                      </h3>
                      <p className="text-gray-600">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Book This Service</h3>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600">
                    ₹{service.price.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">
                    Starting price
                  </div>
                </div>

                <button className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors">
                  Get Quote
                </button>

                <button className="w-full border border-primary-600 text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors">
                  <MessageCircle className="h-5 w-5 inline mr-2" />
                  Contact Us
                </button>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <Users className="h-4 w-4 mr-2" />
                  <span>Expert Technicians</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>Quick Response</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span>Quality Guaranteed</span>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
              <p className="text-gray-600 text-sm mb-4">
                Our experts are here to help you choose the right solution for your needs.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-600">
                  <span className="font-medium">Phone:</span>
                  <span className="ml-2">+91 98998 60975</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <span className="font-medium">Email:</span>
                  <span className="ml-2">wainsogps@gmail.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;
