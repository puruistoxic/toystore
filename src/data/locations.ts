import { Location } from '../types/content';
import { generateSlug } from '../utils/seo';

export const locations: Location[] = [
  {
    id: '1',
    name: 'Ramgarh',
    slug: generateSlug('Ramgarh'),
    state: 'Jharkhand',
    country: 'India',
    description: 'WAINSO provides comprehensive security and tracking solutions in Ramgarh, Jharkhand. Our expert team serves residential, commercial, and industrial clients across the city with professional CCTV installation, GPS tracking, and maintenance services.',
    shortDescription: 'Professional security solutions in Ramgarh, Jharkhand',
    services: ['1', '2', '3', '4', '5'], // All services available
    products: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'], // All products
    landmarks: ['Block Chowk', 'Gola Road', 'Patratu', 'Ramgarh Cantt'],
    coverageAreas: ['Ramgarh City', 'Ramgarh Cantt', 'Patratu', 'Gola', 'Chitarpur'],
    image: '/images/locations/ramgarh.jpg',
    seo: {
      title: 'CCTV Installation in Ramgarh | GPS Tracking Services Ramgarh, Jharkhand | WAINSO',
      description: 'Professional CCTV installation, GPS tracking, and security solutions in Ramgarh, Jharkhand. Authorized dealers for CP Plus, Hikvision, and more. Free consultation available.',
      keywords: ['CCTV installation Ramgarh', 'GPS tracking Ramgarh', 'security systems Ramgarh', 'CCTV camera Ramgarh', 'Ramgarh security services']
    },
    stats: {
      projectsCompleted: 150,
      customersServed: 120,
      yearsActive: 8
    },
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15'
  },
  {
    id: '2',
    name: 'Ramgarh Cantt',
    slug: generateSlug('Ramgarh Cantt'),
    state: 'Jharkhand',
    country: 'India',
    description: 'Serving Ramgarh Cantt with premium security solutions including CCTV systems, GPS tracking, and comprehensive maintenance services. Our team specializes in both residential and commercial installations.',
    shortDescription: 'Premium security solutions in Ramgarh Cantt',
    services: ['1', '2', '3', '4', '5'],
    products: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
    landmarks: ['Cantonment Area', 'Military Station', 'Block Chowk'],
    coverageAreas: ['Ramgarh Cantt', 'Cantonment Area', 'Nearby Residential Areas'],
    image: '/images/locations/ramgarh-cantt.jpg',
    seo: {
      title: 'CCTV Installation in Ramgarh Cantt | Security Services Ramgarh Cantt | WAINSO',
      description: 'Expert CCTV installation and GPS tracking services in Ramgarh Cantt, Jharkhand. Professional security solutions for homes and businesses.',
      keywords: ['CCTV Ramgarh Cantt', 'security systems Ramgarh Cantt', 'GPS tracking Ramgarh Cantt']
    },
    stats: {
      projectsCompleted: 80,
      customersServed: 65,
      yearsActive: 6
    },
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15'
  },
  {
    id: '3',
    name: 'Hazaribagh',
    slug: generateSlug('Hazaribagh'),
    state: 'Jharkhand',
    country: 'India',
    description: 'Comprehensive security and tracking services in Hazaribagh. We provide professional CCTV installation, GPS vehicle tracking, and maintenance services for businesses and homes.',
    shortDescription: 'Complete security solutions in Hazaribagh',
    services: ['1', '2', '3', '4', '5'],
    products: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
    landmarks: ['Hazaribagh Town', 'Canary Hill', 'Hazaribagh Lake'],
    coverageAreas: ['Hazaribagh City', 'Barkagaon', 'Katkamsandi'],
    image: '/images/locations/hazaribagh.jpg',
    seo: {
      title: 'CCTV Installation in Hazaribagh | GPS Tracking Hazaribagh, Jharkhand | WAINSO',
      description: 'Professional CCTV and GPS tracking services in Hazaribagh, Jharkhand. Expert installation and maintenance available.',
      keywords: ['CCTV Hazaribagh', 'GPS tracking Hazaribagh', 'security systems Hazaribagh']
    },
    stats: {
      projectsCompleted: 60,
      customersServed: 50,
      yearsActive: 5
    },
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15'
  },
  {
    id: '4',
    name: 'Ranchi',
    slug: generateSlug('Ranchi'),
    state: 'Jharkhand',
    country: 'India',
    description: 'Leading security solutions provider in Ranchi, the capital of Jharkhand. We offer state-of-the-art CCTV systems, GPS tracking, and professional installation services.',
    shortDescription: 'Advanced security solutions in Ranchi',
    services: ['1', '2', '3', '4', '5'],
    products: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
    landmarks: ['Ranchi City', 'Hatia', 'Kanke', 'Harmu'],
    coverageAreas: ['Ranchi City', 'Hatia', 'Kanke', 'Harmu', 'Doranda'],
    image: '/images/locations/ranchi.jpg',
    seo: {
      title: 'CCTV Installation in Ranchi | GPS Tracking Services Ranchi, Jharkhand | WAINSO',
      description: 'Professional CCTV installation and GPS tracking services in Ranchi, Jharkhand. Authorized dealers with warranty.',
      keywords: ['CCTV Ranchi', 'GPS tracking Ranchi', 'security systems Ranchi', 'CCTV installation Ranchi']
    },
    stats: {
      projectsCompleted: 200,
      customersServed: 180,
      yearsActive: 7
    },
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15'
  },
  {
    id: '5',
    name: 'Dhanbad',
    slug: generateSlug('Dhanbad'),
    state: 'Jharkhand',
    country: 'India',
    description: 'Expert security and tracking services in Dhanbad. Specializing in industrial CCTV systems, fleet GPS tracking, and comprehensive security solutions.',
    shortDescription: 'Industrial security solutions in Dhanbad',
    services: ['1', '2', '3', '4', '5'],
    products: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
    landmarks: ['Dhanbad City', 'Jharia', 'Sindri'],
    coverageAreas: ['Dhanbad City', 'Jharia', 'Sindri', 'Bokaro'],
    image: '/images/locations/dhanbad.jpg',
    seo: {
      title: 'CCTV Installation in Dhanbad | GPS Tracking Dhanbad, Jharkhand | WAINSO',
      description: 'Professional CCTV and GPS tracking services in Dhanbad, Jharkhand. Industrial and commercial security solutions.',
      keywords: ['CCTV Dhanbad', 'GPS tracking Dhanbad', 'industrial CCTV Dhanbad']
    },
    stats: {
      projectsCompleted: 120,
      customersServed: 100,
      yearsActive: 6
    },
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15'
  },
  {
    id: '6',
    name: 'Bokaro',
    slug: generateSlug('Bokaro'),
    state: 'Jharkhand',
    country: 'India',
    description: 'Comprehensive security solutions in Bokaro Steel City. We provide CCTV installation, GPS tracking, and maintenance services for residential and commercial properties.',
    shortDescription: 'Complete security solutions in Bokaro',
    services: ['1', '2', '3', '4', '5'],
    products: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
    landmarks: ['Bokaro Steel City', 'Sector Areas', 'City Centre'],
    coverageAreas: ['Bokaro Steel City', 'Sector 1-12', 'Chas'],
    image: '/images/locations/bokaro.jpg',
    seo: {
      title: 'CCTV Installation in Bokaro | GPS Tracking Bokaro, Jharkhand | WAINSO',
      description: 'Professional CCTV installation and GPS tracking services in Bokaro Steel City, Jharkhand.',
      keywords: ['CCTV Bokaro', 'GPS tracking Bokaro', 'security systems Bokaro']
    },
    stats: {
      projectsCompleted: 90,
      customersServed: 75,
      yearsActive: 5
    },
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15'
  },
  {
    id: '7',
    name: 'Jamshedpur',
    slug: generateSlug('Jamshedpur'),
    state: 'Jharkhand',
    country: 'India',
    description: 'Premium security and tracking services in Jamshedpur. We offer advanced CCTV systems, GPS tracking solutions, and professional installation for homes and businesses.',
    shortDescription: 'Premium security solutions in Jamshedpur',
    services: ['1', '2', '3', '4', '5'],
    products: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
    landmarks: ['Jamshedpur City', 'Bistupur', 'Sakchi', 'Kadma'],
    coverageAreas: ['Jamshedpur City', 'Bistupur', 'Sakchi', 'Kadma', 'Telco'],
    image: '/images/locations/jamshedpur.jpg',
    seo: {
      title: 'CCTV Installation in Jamshedpur | GPS Tracking Jamshedpur, Jharkhand | WAINSO',
      description: 'Expert CCTV installation and GPS tracking services in Jamshedpur, Jharkhand. Professional security solutions.',
      keywords: ['CCTV Jamshedpur', 'GPS tracking Jamshedpur', 'security systems Jamshedpur']
    },
    stats: {
      projectsCompleted: 110,
      customersServed: 95,
      yearsActive: 6
    },
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15'
  }
];




