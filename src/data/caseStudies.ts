import { CaseStudy } from '../types/content';
import { generateSlug } from '../utils/seo';

export const caseStudies: CaseStudy[] = [
  {
    id: '1',
    title: 'Complete CCTV System for Kumar Electronics Store',
    slug: generateSlug('Complete CCTV System for Kumar Electronics Store'),
    description: 'Installed comprehensive CCTV surveillance system for a retail electronics store in Ramgarh, covering sales floor, storage, and cash counter areas.',
    shortDescription: 'Retail store CCTV installation in Ramgarh',
    industry: '1', // Retail
    location: '1', // Ramgarh
    services: ['1', '3'], // CCTV Installation, Maintenance
    products: ['1', '3', '7', '8'], // CP Plus and Hikvision cameras
    brand: '1', // CP Plus
    client: {
      name: 'Kumar Electronics',
      type: 'Retail Store',
      logo: '/images/clients/kumar-electronics.jpg'
    },
    challenge: 'Store owner needed comprehensive surveillance to prevent theft and monitor customer behavior during peak hours.',
    solution: 'Installed 8 HD IP cameras covering all critical areas including entrance, sales floor, storage, and cash counter. Set up DVR with remote access and mobile app integration.',
    results: [
      { metric: 'Theft Reduction', value: '60%', improvement: 'decrease' },
      { metric: 'Customer Satisfaction', value: '95%', improvement: 'increase' },
      { metric: 'Coverage Area', value: '100%', improvement: 'complete' }
    ],
    images: ['/images/case-studies/kumar-electronics-1.jpg', '/images/case-studies/kumar-electronics-2.jpg'],
    testimonial: '1',
    featured: true,
    publishedAt: '2024-01-15',
    seo: {
      title: 'Retail Store CCTV Installation Case Study | Kumar Electronics | WAINSO',
      description: 'Case study: Complete CCTV system installation for retail electronics store in Ramgarh. Results and benefits.',
      keywords: ['retail CCTV case study', 'store surveillance', 'electronics store security']
    },
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15'
  },
  {
    id: '2',
    title: 'Shopping Mall Security System',
    slug: generateSlug('Shopping Mall Security System'),
    description: 'Large-scale CCTV installation for a shopping mall covering multiple floors, parking areas, and common spaces.',
    shortDescription: 'Shopping mall comprehensive security system',
    industry: '1',
    location: '4', // Ranchi
    services: ['1', '3', '5'],
    products: ['1', '3', '12'],
    brand: '2', // Hikvision
    client: {
      name: 'City Mall',
      type: 'Shopping Mall',
      logo: '/images/clients/city-mall.jpg'
    },
    challenge: 'Need for comprehensive security coverage across multiple floors, parking, and common areas with centralized monitoring.',
    solution: 'Installed 50+ HD cameras with centralized NVR system, access control, and 24/7 monitoring station.',
    results: [
      { metric: 'Security Coverage', value: '100%', improvement: 'complete' },
      { metric: 'Incident Response Time', value: '2 minutes', improvement: 'reduction' },
      { metric: 'Customer Safety', value: '99%', improvement: 'satisfaction' }
    ],
    images: ['/images/case-studies/city-mall-1.jpg'],
    testimonial: '2',
    featured: true,
    publishedAt: '2024-01-20',
    seo: {
      title: 'Shopping Mall Security System Case Study | City Mall | WAINSO',
      description: 'Case study: Large-scale CCTV installation for shopping mall with centralized monitoring system.',
      keywords: ['mall security', 'shopping center CCTV', 'mall surveillance system']
    },
    createdAt: '2024-01-20',
    updatedAt: '2024-01-20'
  },
  {
    id: '3',
    title: 'Fleet GPS Tracking for Manufacturing Company',
    slug: generateSlug('Fleet GPS Tracking for Manufacturing Company'),
    description: 'Implemented GPS tracking system for manufacturing company fleet with real-time monitoring and route optimization.',
    shortDescription: 'Fleet GPS tracking for industrial vehicles',
    industry: '2', // Manufacturing
    location: '5', // Dhanbad
    services: ['2', '3'],
    products: ['2', '6'],
    brand: '5', // Queclink
    client: {
      name: 'Singh Industries',
      type: 'Manufacturing Company',
      logo: '/images/clients/singh-industries.jpg'
    },
    challenge: 'Company needed to track 20+ vehicles, optimize routes, and reduce fuel costs while ensuring driver safety.',
    solution: 'Installed GPS trackers on all vehicles with fleet management software, real-time tracking, geofencing, and fuel monitoring.',
    results: [
      { metric: 'Fuel Cost Reduction', value: '25%', improvement: 'decrease' },
      { metric: 'Route Efficiency', value: '30%', improvement: 'increase' },
      { metric: 'Vehicle Utilization', value: '40%', improvement: 'increase' }
    ],
    images: ['/images/case-studies/singh-industries-1.jpg'],
    testimonial: '3',
    featured: true,
    publishedAt: '2024-01-25',
    seo: {
      title: 'Fleet GPS Tracking Case Study | Manufacturing Company | WAINSO',
      description: 'Case study: GPS tracking system implementation for manufacturing company fleet with significant cost savings.',
      keywords: ['fleet GPS tracking', 'manufacturing fleet management', 'GPS case study']
    },
    createdAt: '2024-01-25',
    updatedAt: '2024-01-25'
  }
];






