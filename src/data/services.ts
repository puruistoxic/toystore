import { Service } from '../types/catalog';

export const services: Service[] = [
  {
    id: '1',
    name: 'CCTV Installation & Setup',
    description: 'Professional installation of high-definition surveillance systems with remote monitoring capabilities.',
    price: 15000,
    duration: '1-2 Days',
    category: 'cctv-installation',
    iconName: 'Camera',
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
    iconName: 'Navigation',
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
    iconName: 'Wrench',
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
    iconName: 'Settings',
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
    iconName: 'MessageCircle',
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

