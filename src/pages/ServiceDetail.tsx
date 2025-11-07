import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle, Users, Star, MessageCircle, MapPin, Shield } from 'lucide-react';
import { services } from '../data/services';
import type { Service } from '../types/catalog';
import SEO from '../components/SEO';
import { generateServiceMetaDescription, generatePageTitle } from '../utils/seo';

const extendedServiceDetails: Record<string, {
  rating: number;
  reviews: number;
  requirements: string[];
  process: Array<{ step: number; title: string; description: string }>;
}> = {
  '1': {
    rating: 4.9,
    reviews: 47,
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
  },
  '2': {
    rating: 4.8,
    reviews: 36,
    requirements: [
      'Vehicle Access',
      '12V Power Source',
      'Driver Availability for Testing'
    ],
    process: [
      {
        step: 1,
        title: 'Requirement Gathering',
        description: 'Understand tracking objectives, fleet size, and reporting needs.'
      },
      {
        step: 2,
        title: 'Device Installation',
        description: 'Install trackers with minimal downtime and secure wiring.'
      },
      {
        step: 3,
        title: 'Software Setup',
        description: 'Configure tracking portal, alerts, and reporting templates.'
      },
      {
        step: 4,
        title: 'Training',
        description: 'Train fleet managers on monitoring tools and mobile apps.'
      }
    ]
  }
};

const ServiceDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const service: Service | undefined = services.find((item) => item.slug === slug);
  const extra = (service?.id && extendedServiceDetails[service.id]) || {
    rating: 4.7,
    reviews: 18,
    requirements: [
      'Project Brief',
      'Primary Contact Person',
      'Access to Installation or Consultation Areas'
    ],
    process: [
      {
        step: 1,
        title: 'Discovery Call',
        description: 'Understand your requirements, timelines, and desired outcomes.'
      },
      {
        step: 2,
        title: 'Scope Definition',
        description: 'Document scope, deliverables, and schedules for the engagement.'
      },
      {
        step: 3,
        title: 'Execution',
        description: 'Deliver the service with transparent communication and progress updates.'
      },
      {
        step: 4,
        title: 'Review & Sign-off',
        description: 'Validate outcomes, hand over documentation, and plan follow-up support if required.'
      }
    ]
  };

  if (!service) {
    return (
      <>
        <SEO
          title="Service Not Found | WAINSO"
          description="The service you are looking for may have been moved or no longer exists."
          path="/services/not-found"
        />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Service not found</h1>
            <p className="text-gray-600 mb-6">The service you are looking for may have been moved or no longer exists.</p>
            <Link
              to="/services"
              className="inline-flex items-center bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Services
            </Link>
          </div>
        </div>
      </>
    );
  }

  const serviceLocations = ['Ramgarh', 'Hazaribagh', 'Ranchi', 'Dhanbad', 'Bokaro', 'Jharkhand'];
  const metaDescription = generateServiceMetaDescription(service.name, 'Ramgarh, Jharkhand');
  const pageTitle = generatePageTitle(service.name, 'Ramgarh, Jharkhand');

  return (
    <>
      <SEO
        title={pageTitle}
        description={metaDescription}
        path={`/services/${service.slug}`}
        type="service"
        serviceSchema={{
          name: service.name,
          description: service.description,
          price: service.price,
          priceCurrency: 'INR',
          provider: {
            name: 'WAINSO',
            telephone: '+919899860975',
            email: 'wainsogps@gmail.com',
            address: {
              addressLocality: 'Ramgarh',
              addressRegion: 'Jharkhand',
              addressCountry: 'IN'
            }
          },
          areaServed: serviceLocations.map(loc => ({ name: loc })),
          rating: extra.rating ? {
            value: extra.rating,
            count: extra.reviews
          } : undefined
        }}
      />
      <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2 text-sm">
            <Link to="/services" className="text-gray-500 hover:text-primary-600">
              Services
            </Link>
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
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg p-8 md:p-10 border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center space-x-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-5 w-5 ${i < Math.floor(extra.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                  ))}
                  <span className="text-sm font-semibold text-gray-700 ml-2">{extra.rating}</span>
                </div>
                <div className="text-right bg-primary-50 rounded-lg px-4 py-2">
                  <div className="text-3xl font-bold text-primary-600">
                    ₹{service.price.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600 flex items-center justify-end">
                    <Clock className="h-4 w-4 mr-1" />
                    {service.duration}
                  </div>
                </div>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-5">{service.name}</h1>
              <p className="text-gray-600 text-lg mb-6 leading-relaxed pr-2">{service.description}</p>

              {/* Location Badge and Rating */}
              <div className="flex items-center flex-wrap gap-4 mb-4 pt-2">
                <div className="flex items-center text-sm text-gray-700 bg-blue-50 px-4 py-2 rounded-full border border-blue-100">
                  <MapPin className="h-4 w-4 mr-2 text-primary-600 flex-shrink-0" />
                  <span className="font-medium">Available in Ramgarh, Jharkhand</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Shield className="h-4 w-4 mr-1.5 text-green-600 flex-shrink-0" />
                  <span className="font-semibold">{extra.rating} out of 5</span>
                  <span className="mx-2">•</span>
                  <span>{extra.reviews} verified customer reviews</span>
                </div>
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
                {extra.requirements.map((requirement, index) => (
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
                {extra.process.map((step) => (
                  <div key={step.step} className="flex">
                    <div className="flex-shrink-0">
                      <div className="bg-primary-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-semibold">
                        {step.step}
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                      <p className="text-gray-600">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking Card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Book This Service</h3>
              <div className="space-y-5">
                <div className="text-center pb-2">
                  <div className="text-3xl font-bold text-primary-600 mb-2">
                    ₹{service.price.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Starting price
                  </div>
                </div>

                <Link
                  to={`/quote-request?type=service&id=${service.id}`}
                  className="w-full inline-flex items-center justify-center bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all mb-3"
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Request Quote
                </Link>

                <button className="w-full border border-primary-600 text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors mt-3">
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

            {/* Service Areas */}
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-6 border border-primary-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-primary-600" />
                Service Areas
              </h3>
              <p className="text-gray-700 text-sm mb-3">
                We provide professional {service.name.toLowerCase()} services in:
              </p>
              <div className="flex flex-wrap gap-2">
                {serviceLocations.map((location, idx) => (
                  <span
                    key={idx}
                    className="bg-white text-primary-700 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm"
                  >
                    {location}
                  </span>
                ))}
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
              <p className="text-gray-600 text-sm mb-4">
                Our experts are here to help you choose the right solution for your needs in Ramgarh, Jharkhand and surrounding areas.
              </p>
              <div className="space-y-3 text-sm">
                <a
                  href="tel:+919899860975"
                  className="flex items-center text-gray-700 hover:text-primary-600 transition-colors"
                >
                  <span className="font-medium mr-2">Phone:</span>
                  <span>+91 98998 60975</span>
                </a>
                <a
                  href="mailto:wainsogps@gmail.com"
                  className="flex items-center text-gray-700 hover:text-primary-600 transition-colors"
                >
                  <span className="font-medium mr-2">Email:</span>
                  <span>wainsogps@gmail.com</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default ServiceDetail;
