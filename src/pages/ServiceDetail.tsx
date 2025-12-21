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
      'Current workflows and pain points',
      'Data sources for migration',
      'Key users for UAT and sign-off',
      'Environment access (dev/test/prod)'
    ],
    process: [
      { step: 1, title: 'Discovery & Blueprint', description: 'Map processes, integrations, and KPIs. Finalize modules, scope, and success criteria.' },
      { step: 2, title: 'Architecture & Plan', description: 'Design data model, integrations, and rollout plan with clear milestones.' },
      { step: 3, title: 'Build & Configure', description: 'Develop modules, configure workflows, and set up roles and security.' },
      { step: 4, title: 'Testing & Migration', description: 'UAT cycles, data migration, and performance checks before cutover.' },
      { step: 5, title: 'Go-live & Hypercare', description: 'Cutover support, training, and hypercare with dashboards on adoption and uptime.' }
    ]
  },
  '2': {
    rating: 4.8,
    reviews: 36,
    requirements: [
      'Floor plans or rack details',
      'Internet/ISP details',
      'Existing IP scheme and VLAN needs'
    ],
    process: [
      { step: 1, title: 'Assess & Design', description: 'Capture coverage, capacity, and security needs. Produce high-level and low-level design.' },
      { step: 2, title: 'Bill of Materials', description: 'Finalize hardware, licenses, and accessories with delivery timelines.' },
      { step: 3, title: 'Deploy & Configure', description: 'Install, cable, and configure network, security, and Wi‑Fi with best practices.' },
      { step: 4, title: 'Validation & Handover', description: 'Run validation tests, document configurations, and hand over runbooks.' }
    ]
  },
  '3': {
    rating: 4.7,
    reviews: 29,
    requirements: [
      'Brand guidelines and copy references',
      'Feature list and integrations',
      'Staging credentials'
    ],
    process: [
      { step: 1, title: 'Product & UX Brief', description: 'Define journeys, SEO goals, and performance budgets.' },
      { step: 2, title: 'Build & Integrate', description: 'Develop web/app modules with API and analytics integration.' },
      { step: 3, title: 'QA & Launch', description: 'Cross-browser/device QA, performance tuning, and release.' },
      { step: 4, title: 'Enablement', description: 'Train admins, hand over documentation, and set up monitoring.' }
    ]
  },
  '4': {
    rating: 4.8,
    reviews: 33,
    requirements: [
      'Asset inventory (hardware/software)',
      'Access for remote/onsite',
      'Change window preferences'
    ],
    process: [
      { step: 1, title: 'Onboarding & Audit', description: 'Baseline health, patch levels, backups, and security posture.' },
      { step: 2, title: 'Runbooks & SLAs', description: 'Define SOPs, escalation, and reporting cadence.' },
      { step: 3, title: 'Operate & Optimize', description: '24/7 monitoring, incident response, and preventive maintenance.' },
      { step: 4, title: 'Review & Improve', description: 'Monthly reviews with KPI dashboards and improvement backlog.' }
    ]
  },
  '5': {
    rating: 4.6,
    reviews: 24,
    requirements: [
      'Site layout and coverage areas',
      'Network availability and power points',
      'Compliance requirements (if any)'
    ],
    process: [
      { step: 1, title: 'Survey & Design', description: 'Coverage planning, camera/access control placement, and storage sizing.' },
      { step: 2, title: 'Install & Integrate', description: 'Deploy CCTV/access control and integrate with VMS/network.' },
      { step: 3, title: 'Test & Secure', description: 'Validate feeds, alerts, retention, and harden devices.' },
      { step: 4, title: 'Train & Support', description: 'Train operators, hand over SOPs, and schedule maintenance.' }
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
      'Project brief and owners',
      'Integration points (if any)',
      'Preferred timelines and budget guardrails'
    ],
    process: [
      { step: 1, title: 'Discovery Call', description: 'Clarify goals, constraints, and timelines.' },
      { step: 2, title: 'Scope Definition', description: 'Document deliverables, access, and rollout plan.' },
      { step: 3, title: 'Execute', description: 'Deliver in sprints with demos and updates.' },
      { step: 4, title: 'Handover & Support', description: 'Train users and plan post-launch support.' }
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

  const serviceLocations = service.category === 'security'
    ? ['Ramgarh', 'Ramgarh Cantt', 'Hazaribagh', 'Ranchi', 'Dhanbad', 'Bokaro', 'Jamshedpur', 'Giridih', 'Deoghar', 'Jharkhand', 'India']
    : undefined;
  const metaDescription = generateServiceMetaDescription(service.name, service.category === 'security' ? 'Ramgarh, Jharkhand' : '');
  const pageTitle = generatePageTitle(service.name, service.category === 'security' ? 'Ramgarh, Jharkhand' : '');

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
          price: 0, // Pricing removed - set to 0 for schema compatibility
          priceCurrency: 'INR',
          provider: {
            name: 'WAINSO',
            telephone: '+919899860975',
            email: 'wainsogps@gmail.com',
            address: service.category === 'security' ? {
              addressLocality: 'Ramgarh',
              addressRegion: 'Jharkhand',
              addressCountry: 'IN'
            } : undefined
          },
          areaServed: serviceLocations?.map(loc => ({ name: loc })),
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
                {service.category === 'security' && (
                  <div className="flex items-center text-sm text-gray-700 bg-blue-50 px-4 py-2 rounded-full border border-blue-100">
                    <MapPin className="h-4 w-4 mr-2 text-primary-600 flex-shrink-0" />
                    <span className="font-medium">Available in Ramgarh, Jharkhand</span>
                  </div>
                )}
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

                <Link
                  to={`/quote-request?type=service&id=${service.id}`}
                  className="w-full inline-flex items-center justify-center bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all mb-3"
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Request Quote
                </Link>

                <Link
                  to="/contact"
                  className="w-full inline-flex items-center justify-center border border-primary-600 text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors mt-3"
                >
                  <MessageCircle className="h-5 w-5 inline mr-2" />
                  Contact Us
                </Link>
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
            {service.category === 'security' && serviceLocations && (
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
            )}

            {/* Contact Info */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
              <p className="text-gray-600 text-sm mb-4">
                Our experts are here to help you choose the right solution for your needs with nationwide support.
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
