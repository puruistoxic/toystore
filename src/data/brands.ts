import { Brand } from '../types/content';
import { generateSlug } from '../utils/seo';

export const brands: Brand[] = [
  {
    id: '1',
    name: 'CP Plus',
    slug: generateSlug('CP Plus'),
    description: 'CP Plus is a leading manufacturer of CCTV cameras, security systems, and video surveillance solutions. As authorized dealers, we offer the complete range of CP Plus products including bullet cameras, dome cameras, DVRs, NVRs, and video door phones.',
    shortDescription: 'Authorized dealer for CP Plus CCTV and security systems',
    category: 'cctv',
    logoUrl: 'https://logo.clearbit.com/cpplus.com',
    localLogo: '/images/partners/cpplus.png',
    website: 'https://www.cpplus.com',
    products: ['7', '8', '11'], // CP Plus products
    services: ['1', '3', '4'], // Services using CP Plus
    partnershipType: 'authorized-dealer',
    partnershipSince: '2018',
    certifications: ['Authorized Dealer Certificate', 'Service Partner'],
    image: '/images/brands/cpplus.jpg',
    seo: {
      title: 'CP Plus CCTV Cameras in Ramgarh | Authorized CP Plus Dealer | WAINSO',
      description: 'Buy genuine CP Plus CCTV cameras, DVRs, and security systems in Ramgarh, Jharkhand. Authorized dealer with warranty and support.',
      keywords: ['CP Plus Ramgarh', 'CP Plus CCTV', 'CP Plus dealer', 'CP Plus cameras']
    },
    features: [
      'Wide range of CCTV cameras',
      'High-quality video recording',
      'Weather-resistant designs',
      'Mobile app support',
      'Professional installation'
    ],
    warranty: '2-3 Years Manufacturer Warranty',
    support: '24/7 Technical Support',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15'
  },
  {
    id: '2',
    name: 'Hikvision',
    slug: generateSlug('Hikvision'),
    description: 'Hikvision is a world leader in video surveillance products and solutions. We are authorized dealers offering Hikvision IP cameras, analog cameras, DVRs, NVRs, and complete surveillance systems with professional installation.',
    shortDescription: 'Authorized dealer for Hikvision surveillance systems',
    category: 'cctv',
    logoUrl: 'https://logo.clearbit.com/hikvision.com',
    localLogo: '/images/partners/hikvision.png',
    website: 'https://www.hikvision.com',
    products: ['1', '9', '12'], // Hikvision products
    services: ['1', '3', '4'],
    partnershipType: 'authorized-dealer',
    partnershipSince: '2017',
    certifications: ['Authorized Dealer Certificate', 'Certified Installer'],
    image: '/images/brands/hikvision.jpg',
    seo: {
      title: 'Hikvision CCTV Cameras in Ramgarh | Authorized Hikvision Dealer | WAINSO',
      description: 'Buy genuine Hikvision CCTV cameras and surveillance systems in Ramgarh, Jharkhand. Authorized dealer with installation support.',
      keywords: ['Hikvision Ramgarh', 'Hikvision CCTV', 'Hikvision dealer', 'Hikvision cameras']
    },
    features: [
      '4K Ultra HD cameras',
      'Advanced AI features',
      'Night vision technology',
      'Cloud storage options',
      'Professional installation'
    ],
    warranty: '2-3 Years Manufacturer Warranty',
    support: 'Technical Support Available',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15'
  },
  {
    id: '3',
    name: 'Panasonic',
    slug: generateSlug('Panasonic'),
    description: 'Panasonic offers reliable security cameras and surveillance solutions. As authorized partners, we provide Panasonic security cameras with professional installation and support services.',
    shortDescription: 'Authorized partner for Panasonic security cameras',
    category: 'cctv',
    logoUrl: 'https://logo.clearbit.com/panasonic.com',
    localLogo: '/images/partners/panasonic.png',
    website: 'https://www.panasonic.com',
    products: [],
    services: ['1', '3', '4'],
    partnershipType: 'partner',
    partnershipSince: '2019',
    certifications: ['Partner Certificate'],
    image: '/images/brands/panasonic.jpg',
    seo: {
      title: 'Panasonic Security Cameras in Ramgarh | Panasonic Partner | WAINSO',
      description: 'Buy Panasonic security cameras and surveillance systems in Ramgarh, Jharkhand. Professional installation available.',
      keywords: ['Panasonic Ramgarh', 'Panasonic CCTV', 'Panasonic security cameras']
    },
    features: [
      'Reliable performance',
      'Easy installation',
      'Mobile monitoring',
      'Weather resistant',
      'Professional support'
    ],
    warranty: '2 Years Manufacturer Warranty',
    support: 'Installation and Support Available',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15'
  },
  {
    id: '4',
    name: 'Godrej',
    slug: generateSlug('Godrej'),
    description: 'Godrej is a trusted name in security solutions including lockers, safes, and security systems. We offer Godrej security products including digital lockers, safes, and access control systems.',
    shortDescription: 'Authorized dealer for Godrej security systems',
    category: 'security',
    logoUrl: 'https://logo.clearbit.com/godrej.com',
    localLogo: '/images/partners/godrej.png',
    website: 'https://www.godrej.com',
    products: ['10'], // Godrej products
    services: ['1', '5'],
    partnershipType: 'authorized-dealer',
    partnershipSince: '2020',
    certifications: ['Authorized Dealer Certificate'],
    image: '/images/brands/godrej.jpg',
    seo: {
      title: 'Godrej Security Systems in Ramgarh | Godrej Lockers & Safes | WAINSO',
      description: 'Buy Godrej security lockers, safes, and security systems in Ramgarh, Jharkhand. Authorized dealer with warranty.',
      keywords: ['Godrej Ramgarh', 'Godrej lockers', 'Godrej security systems']
    },
    features: [
      'Fire-resistant lockers',
      'Digital security systems',
      'Home and office solutions',
      'Long warranty period',
      'Professional installation'
    ],
    warranty: '5 Years Manufacturer Warranty',
    support: 'Installation and Support Available',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15'
  },
  {
    id: '5',
    name: 'Queclink',
    slug: generateSlug('Queclink'),
    description: 'Queclink is a leading manufacturer of GPS tracking devices and fleet management solutions. We offer Queclink GPS trackers for vehicles, assets, and personal tracking with professional installation.',
    shortDescription: 'Authorized dealer for Queclink GPS trackers',
    category: 'gps',
    logoUrl: 'https://logo.clearbit.com/queclink.com',
    localLogo: '/images/partners/queclink.png',
    website: 'https://www.queclink.com',
    products: ['2'], // Queclink products
    services: ['2', '3', '4'],
    partnershipType: 'authorized-dealer',
    partnershipSince: '2018',
    certifications: ['Authorized Dealer Certificate'],
    image: '/images/brands/queclink.jpg',
    seo: {
      title: 'Queclink GPS Trackers in Ramgarh | GPS Tracking Devices | WAINSO',
      description: 'Buy Queclink GPS tracking devices in Ramgarh, Jharkhand. Professional installation and fleet management solutions available.',
      keywords: ['Queclink GPS', 'GPS trackers Ramgarh', 'Queclink dealer']
    },
    features: [
      'Real-time tracking',
      'Fleet management',
      'Long battery life',
      'Mobile app support',
      'Professional installation'
    ],
    warranty: '1 Year Manufacturer Warranty',
    support: '24/7 Tracking Support',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15'
  },
  {
    id: '6',
    name: 'Teltonika',
    slug: generateSlug('Teltonika'),
    description: 'Teltonika provides advanced GPS tracking and fleet management solutions. We offer Teltonika GPS trackers for commercial vehicles, fleet management, and asset tracking.',
    shortDescription: 'Authorized dealer for Teltonika GPS tracking solutions',
    category: 'gps',
    logoUrl: 'https://logo.clearbit.com/teltonika.com',
    localLogo: '/images/partners/teltonika.png',
    website: 'https://www.teltonika.com',
    products: ['6'], // Teltonika products
    services: ['2', '3', '4'],
    partnershipType: 'authorized-dealer',
    partnershipSince: '2019',
    certifications: ['Authorized Dealer Certificate', 'Certified Installer'],
    image: '/images/brands/teltonika.jpg',
    seo: {
      title: 'Teltonika GPS Trackers in Ramgarh | Fleet Management Solutions | WAINSO',
      description: 'Buy Teltonika GPS tracking devices and fleet management solutions in Ramgarh, Jharkhand. Professional installation available.',
      keywords: ['Teltonika GPS', 'fleet management Ramgarh', 'Teltonika dealer']
    },
    features: [
      'Advanced fleet management',
      'Fuel monitoring',
      'Driver behavior analysis',
      'Route optimization',
      'Professional installation'
    ],
    warranty: '1 Year Manufacturer Warranty',
    support: 'Fleet Management Support',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15'
  },
  {
    id: '7',
    name: 'Dahua',
    slug: generateSlug('Dahua'),
    description: 'Dahua Technology is a leading provider of video surveillance solutions. We offer Dahua DVRs, NVRs, cameras, and complete surveillance systems with professional installation.',
    shortDescription: 'Authorized dealer for Dahua surveillance systems',
    category: 'cctv',
    logoUrl: 'https://logo.clearbit.com/dahuasecurity.com',
    localLogo: '/images/partners/dahua.png',
    website: 'https://www.dahuasecurity.com',
    products: ['3'], // Dahua products
    services: ['1', '3', '4'],
    partnershipType: 'authorized-dealer',
    partnershipSince: '2018',
    certifications: ['Authorized Dealer Certificate'],
    image: '/images/brands/dahua.jpg',
    seo: {
      title: 'Dahua CCTV Systems in Ramgarh | Dahua DVR NVR | WAINSO',
      description: 'Buy Dahua CCTV cameras, DVRs, and NVRs in Ramgarh, Jharkhand. Authorized dealer with installation support.',
      keywords: ['Dahua Ramgarh', 'Dahua CCTV', 'Dahua DVR', 'Dahua dealer']
    },
    features: [
      '4K recording systems',
      'H.265 compression',
      'Remote access',
      'Mobile app support',
      'Professional installation'
    ],
    warranty: '2 Years Manufacturer Warranty',
    support: 'Technical Support Available',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15'
  },
  {
    id: '8',
    name: 'Ezviz',
    slug: generateSlug('Ezviz'),
    description: 'Ezviz offers smart home security solutions including wireless cameras, video doorbells, and security systems. We provide Ezviz products with professional installation and support.',
    shortDescription: 'Authorized dealer for Ezviz smart security solutions',
    category: 'cctv',
    logoUrl: 'https://logo.clearbit.com/ezvizlife.com',
    localLogo: '/images/partners/ezviz.png',
    website: 'https://www.ezvizlife.com',
    products: ['5'], // Ezviz products
    services: ['1', '3', '4'],
    partnershipType: 'authorized-dealer',
    partnershipSince: '2020',
    certifications: ['Authorized Dealer Certificate'],
    image: '/images/brands/ezviz.jpg',
    seo: {
      title: 'Ezviz Security Cameras in Ramgarh | Wireless CCTV Systems | WAINSO',
      description: 'Buy Ezviz wireless security cameras and smart home security systems in Ramgarh, Jharkhand. Professional installation available.',
      keywords: ['Ezviz Ramgarh', 'Ezviz cameras', 'wireless CCTV', 'Ezviz dealer']
    },
    features: [
      'Wireless installation',
      'Smart home integration',
      'Cloud storage',
      'Mobile app control',
      'Easy setup'
    ],
    warranty: '2 Years Manufacturer Warranty',
    support: 'Installation and Support Available',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15'
  }
];




