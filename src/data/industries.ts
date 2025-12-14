import { Industry } from '../types/content';
import { generateSlug } from '../utils/seo';

export const industries: Industry[] = [
  {
    id: '1',
    name: 'Retail & Shopping',
    slug: generateSlug('Retail & Shopping'),
    description: 'Comprehensive security solutions for retail stores, shopping malls, and commercial establishments. Protect your inventory, monitor customer flow, and prevent theft with our advanced CCTV and security systems.',
    shortDescription: 'Security solutions for retail stores and shopping centers',
    icon: 'ShoppingBag',
    services: ['1', '3', '4', '5'],
    products: ['1', '3', '7', '8', '9', '12'],
    useCases: [
      {
        title: 'Store Surveillance',
        description: 'Monitor sales floor, cash counters, and storage areas with HD cameras',
        image: '/images/industries/retail-surveillance.jpg'
      },
      {
        title: 'Loss Prevention',
        description: 'Reduce theft and inventory shrinkage with advanced motion detection',
        image: '/images/industries/loss-prevention.jpg'
      },
      {
        title: 'Customer Analytics',
        description: 'Track customer behavior and optimize store layout',
        image: '/images/industries/customer-analytics.jpg'
      }
    ],
    caseStudies: ['1', '2'],
    testimonials: ['1', '2'],
    image: '/images/industries/retail.jpg',
    seo: {
      title: 'Retail Security Solutions | CCTV for Retail Stores | WAINSO',
      description: 'Professional CCTV and security systems for retail stores, shopping malls, and commercial establishments. Protect your business with advanced surveillance.',
      keywords: ['retail security', 'store CCTV', 'shopping mall security', 'retail surveillance']
    },
    stats: {
      clientsServed: 80,
      projectsCompleted: 120
    },
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15'
  },
  {
    id: '2',
    name: 'Manufacturing & Industrial',
    slug: generateSlug('Manufacturing & Industrial'),
    description: 'Industrial-grade security and monitoring solutions for manufacturing facilities, warehouses, and industrial plants. Monitor production areas, secure perimeters, and track assets with our specialized systems.',
    shortDescription: 'Industrial security and monitoring solutions',
    icon: 'Factory',
    services: ['1', '2', '3', '4', '5'],
    products: ['1', '2', '3', '6', '7', '8', '9', '12'],
    useCases: [
      {
        title: 'Production Monitoring',
        description: 'Monitor production lines and quality control areas',
        image: '/images/industries/production-monitoring.jpg'
      },
      {
        title: 'Fleet Management',
        description: 'Track vehicles and equipment with GPS systems',
        image: '/images/industries/fleet-management.jpg'
      },
      {
        title: 'Perimeter Security',
        description: 'Secure facility perimeters with advanced CCTV systems',
        image: '/images/industries/perimeter-security.jpg'
      }
    ],
    caseStudies: ['3'],
    testimonials: ['3'],
    image: '/images/industries/manufacturing.jpg',
    seo: {
      title: 'Industrial Security Solutions | Manufacturing CCTV Systems | WAINSO',
      description: 'Industrial-grade CCTV and GPS tracking solutions for manufacturing facilities and warehouses. Professional installation and support.',
      keywords: ['industrial security', 'manufacturing CCTV', 'warehouse security', 'industrial surveillance']
    },
    stats: {
      clientsServed: 45,
      projectsCompleted: 65
    },
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15'
  },
  {
    id: '3',
    name: 'Healthcare & Hospitals',
    slug: generateSlug('Healthcare & Hospitals'),
    description: 'Secure healthcare facilities with advanced CCTV systems that ensure patient safety, protect sensitive areas, and monitor access. HIPAA-compliant security solutions for hospitals and clinics.',
    shortDescription: 'Security solutions for healthcare facilities',
    icon: 'Heart',
    services: ['1', '3', '4', '5'],
    products: ['1', '3', '7', '8', '9', '10', '12'],
    useCases: [
      {
        title: 'Patient Safety',
        description: 'Monitor patient areas and ensure safety protocols',
        image: '/images/industries/patient-safety.jpg'
      },
      {
        title: 'Access Control',
        description: 'Secure sensitive areas like pharmacies and labs',
        image: '/images/industries/access-control.jpg'
      },
      {
        title: 'Parking Security',
        description: 'Monitor parking areas and visitor access',
        image: '/images/industries/parking-security.jpg'
      }
    ],
    caseStudies: ['4'],
    testimonials: ['4'],
    image: '/images/industries/healthcare.jpg',
    seo: {
      title: 'Healthcare Security Solutions | Hospital CCTV Systems | WAINSO',
      description: 'Professional security systems for hospitals and healthcare facilities. HIPAA-compliant CCTV solutions for patient safety.',
      keywords: ['hospital security', 'healthcare CCTV', 'medical facility security', 'hospital surveillance']
    },
    stats: {
      clientsServed: 25,
      projectsCompleted: 35
    },
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15'
  },
  {
    id: '4',
    name: 'Education & Schools',
    slug: generateSlug('Education & Schools'),
    description: 'Comprehensive security solutions for schools, colleges, and educational institutions. Protect students, staff, and facilities with advanced CCTV systems and access control.',
    shortDescription: 'Security solutions for educational institutions',
    icon: 'GraduationCap',
    services: ['1', '3', '4', '5'],
    products: ['1', '3', '7', '8', '9', '12'],
    useCases: [
      {
        title: 'Campus Security',
        description: 'Monitor campus areas, entrances, and common spaces',
        image: '/images/industries/campus-security.jpg'
      },
      {
        title: 'Classroom Monitoring',
        description: 'Ensure student safety and monitor activities',
        image: '/images/industries/classroom-monitoring.jpg'
      },
      {
        title: 'Visitor Management',
        description: 'Track and manage visitor access to facilities',
        image: '/images/industries/visitor-management.jpg'
      }
    ],
    caseStudies: ['5'],
    testimonials: ['5'],
    image: '/images/industries/education.jpg',
    seo: {
      title: 'School Security Solutions | Educational Institution CCTV | WAINSO',
      description: 'Professional security systems for schools and educational institutions. Protect students and facilities with advanced CCTV.',
      keywords: ['school security', 'education CCTV', 'campus security', 'school surveillance']
    },
    stats: {
      clientsServed: 30,
      projectsCompleted: 40
    },
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15'
  },
  {
    id: '5',
    name: 'Transportation & Logistics',
    slug: generateSlug('Transportation & Logistics'),
    description: 'Fleet management and security solutions for transportation companies, logistics providers, and delivery services. Track vehicles, optimize routes, and secure facilities with our integrated systems.',
    shortDescription: 'Fleet management and logistics security solutions',
    icon: 'Truck',
    services: ['2', '3', '4', '5'],
    products: ['2', '6'],
    useCases: [
      {
        title: 'Fleet Tracking',
        description: 'Real-time GPS tracking for vehicles and assets',
        image: '/images/industries/fleet-tracking.jpg'
      },
      {
        title: 'Route Optimization',
        description: 'Optimize delivery routes and reduce fuel costs',
        image: '/images/industries/route-optimization.jpg'
      },
      {
        title: 'Warehouse Security',
        description: 'Secure warehouses and distribution centers',
        image: '/images/industries/warehouse-security.jpg'
      }
    ],
    caseStudies: ['6'],
    testimonials: ['6'],
    image: '/images/industries/transportation.jpg',
    seo: {
      title: 'Fleet Management Solutions | GPS Tracking for Logistics | WAINSO',
      description: 'Professional GPS tracking and fleet management solutions for transportation and logistics companies. Real-time tracking and route optimization.',
      keywords: ['fleet management', 'GPS tracking logistics', 'transportation security', 'fleet tracking']
    },
    stats: {
      clientsServed: 60,
      projectsCompleted: 85
    },
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15'
  },
  {
    id: '6',
    name: 'Residential & Home',
    slug: generateSlug('Residential & Home'),
    description: 'Home security solutions for residential properties. Protect your family and property with CCTV cameras, security systems, and smart home integration.',
    shortDescription: 'Home security and surveillance solutions',
    icon: 'Home',
    services: ['1', '3', '4', '5'],
    products: ['1', '5', '7', '8', '9', '10', '11', '12'],
    useCases: [
      {
        title: 'Home Surveillance',
        description: 'Monitor your home 24/7 with HD cameras',
        image: '/images/industries/home-surveillance.jpg'
      },
      {
        title: 'Smart Home Integration',
        description: 'Integrate security with smart home systems',
        image: '/images/industries/smart-home.jpg'
      },
      {
        title: 'Remote Monitoring',
        description: 'Access your security system from anywhere',
        image: '/images/industries/remote-monitoring.jpg'
      }
    ],
    caseStudies: ['7'],
    testimonials: ['7', '8'],
    image: '/images/industries/residential.jpg',
    seo: {
      title: 'Home Security Solutions | Residential CCTV Systems | WAINSO',
      description: 'Professional home security and CCTV systems for residential properties. Protect your family with advanced surveillance solutions.',
      keywords: ['home security', 'residential CCTV', 'home surveillance', 'house security']
    },
    stats: {
      clientsServed: 200,
      projectsCompleted: 250
    },
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15'
  },
  {
    id: '7',
    name: 'Banking & Finance',
    slug: generateSlug('Banking & Finance'),
    description: 'High-security solutions for banks, financial institutions, and ATMs. Advanced CCTV systems with facial recognition, access control, and compliance features.',
    shortDescription: 'High-security solutions for financial institutions',
    icon: 'Banknote',
    services: ['1', '3', '4', '5'],
    products: ['1', '3', '7', '8', '9', '10', '12'],
    useCases: [
      {
        title: 'ATM Security',
        description: 'Secure ATM locations with advanced surveillance',
        image: '/images/industries/atm-security.jpg'
      },
      {
        title: 'Branch Security',
        description: 'Comprehensive security for bank branches',
        image: '/images/industries/branch-security.jpg'
      },
      {
        title: 'Compliance Monitoring',
        description: 'Meet regulatory requirements with proper surveillance',
        image: '/images/industries/compliance-monitoring.jpg'
      }
    ],
    caseStudies: ['8'],
    testimonials: ['9'],
    image: '/images/industries/banking.jpg',
    seo: {
      title: 'Bank Security Solutions | Financial Institution CCTV | WAINSO',
      description: 'High-security CCTV systems for banks and financial institutions. Compliance-ready surveillance solutions.',
      keywords: ['bank security', 'financial CCTV', 'ATM security', 'banking surveillance']
    },
    stats: {
      clientsServed: 15,
      projectsCompleted: 20
    },
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15'
  },
  {
    id: '8',
    name: 'Hospitality & Hotels',
    slug: generateSlug('Hospitality & Hotels'),
    description: 'Security solutions for hotels, restaurants, and hospitality businesses. Protect guests, staff, and property with professional CCTV and access control systems.',
    shortDescription: 'Security solutions for hospitality businesses',
    icon: 'Hotel',
    services: ['1', '3', '4', '5'],
    products: ['1', '3', '7', '8', '9', '12'],
    useCases: [
      {
        title: 'Guest Safety',
        description: 'Ensure guest safety throughout the property',
        image: '/images/industries/guest-safety.jpg'
      },
      {
        title: 'Lobby & Common Areas',
        description: 'Monitor lobbies, restaurants, and common spaces',
        image: '/images/industries/lobby-monitoring.jpg'
      },
      {
        title: 'Parking Security',
        description: 'Secure parking areas and vehicle access',
        image: '/images/industries/parking-security.jpg'
      }
    ],
    caseStudies: ['9'],
    testimonials: ['10'],
    image: '/images/industries/hospitality.jpg',
    seo: {
      title: 'Hotel Security Solutions | Hospitality CCTV Systems | WAINSO',
      description: 'Professional security systems for hotels and hospitality businesses. Protect guests and property with advanced CCTV.',
      keywords: ['hotel security', 'hospitality CCTV', 'restaurant security', 'hotel surveillance']
    },
    stats: {
      clientsServed: 35,
      projectsCompleted: 45
    },
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15'
  }
];






