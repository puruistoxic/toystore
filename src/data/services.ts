import { Service } from '../types/catalog';
import { generateSlug } from '../utils/seo';

export const services: Service[] = [
  {
    id: '1',
    name: 'ERP Development & Implementation',
    slug: generateSlug('ERP Development & Implementation'),
    description: 'End-to-end ERP consulting, custom module development, integrations, and rollout with training.',
    price: 75000,
    duration: '3-8 Weeks',
    category: 'erp',
    iconName: 'Settings',
    features: [
      'Process Discovery & Blueprint',
      'Custom Module Build',
      'Legacy Data Migration',
      'API/ESB Integrations',
      'User & Admin Training',
      'Hypercare Support'
    ],
    includes: [
      'Discovery Workshops',
      'Solution Architecture',
      'Sandbox & UAT',
      'Cutover Plan',
      'Change Management',
      'Post-Go-Live Support'
    ]
  },
  {
    id: '2',
    name: 'Networking & Infrastructure',
    slug: generateSlug('Networking & Infrastructure'),
    description: 'Design and deployment of secure LAN/WAN, Wi‑Fi, servers, and storage with monitoring.',
    price: 35000,
    duration: '1-2 Weeks',
    category: 'networking',
    iconName: 'Navigation',
    features: [
      'LAN/WAN & SD-WAN',
      'Secure Wi‑Fi',
      'Firewalls & VPN',
      'Server & Storage Sizing',
      '24/7 Monitoring',
      'SLA Reporting'
    ],
    includes: [
      'Network Assessment',
      'Bill of Materials',
      'On-site Deployment',
      'Hardening & DR',
      'Monitoring Setup',
      'Runbook & Training'
    ]
  },
  {
    id: '3',
    name: 'Web & Software Engineering',
    slug: generateSlug('Web & Software Engineering'),
    description: 'Websites, portals, and custom applications integrated with CRM/ERP and analytics.',
    price: 28000,
    duration: '2-6 Weeks',
    category: 'software',
    iconName: 'MessageCircle',
    features: [
      'Corporate & Commerce Sites',
      'Custom Portals & Apps',
      'API Integrations',
      'Performance & SEO',
      'Analytics & Dashboards',
      'Secure DevOps'
    ],
    includes: [
      'UX & IA',
      'Tech Stack Selection',
      'Sprint Delivery',
      'Testing & QA',
      'Launch Support',
      'Training & Handover'
    ]
  },
  {
    id: '4',
    name: 'Managed IT & AMC',
    slug: generateSlug('Managed IT & AMC'),
    description: 'Proactive monitoring, patching, backups, and multi-vendor AMC with SLA-driven support.',
    price: 18000,
    duration: 'Monthly',
    category: 'amc',
    iconName: 'Wrench',
    features: [
      'Proactive Monitoring',
      'Patch Management',
      'Backup & DR Drills',
      'On-site & Remote Helpdesk',
      'Asset & License Tracking',
      'SLA Dashboard'
    ],
    includes: [
      'Health Checks',
      'Playbooks & SOPs',
      'Quarterly Reviews',
      'Vendor Coordination',
      'Incident Reports',
      '24/7 Support Options'
    ]
  },
  {
    id: '5',
    name: 'Security & Surveillance',
    slug: generateSlug('Security & Surveillance'),
    description: 'CCTV, access control, and video analytics integrated with your IT and compliance needs.',
    price: 22000,
    duration: '3-7 Days',
    category: 'security',
    iconName: 'Camera',
    features: [
      'IP CCTV & VMS',
      'Access Control',
      'Video Analytics',
      'Storage Planning',
      'Mobile & Web Access',
      'Compliance Reporting'
    ],
    includes: [
      'Site Survey',
      'Design & BOM',
      'Installation & Cabling',
      'VMS Configuration',
      'User Training',
      'Maintenance Plan'
    ]
  },
  {
    id: '6',
    name: 'Website & Portal Development',
    slug: generateSlug('Website & Portal Development'),
    description: 'Corporate websites, product landing pages, and customer portals built for performance, SEO, and lead capture.',
    price: 45000,
    duration: '2-6 Weeks',
    category: 'web-development',
    iconName: 'MessageCircle',
    features: [
      'Corporate & Product Sites',
      'Headless CMS Options',
      'SEO & Core Web Vitals',
      'Analytics & Tagging',
      'CRM/ERP Integrations',
      'Performance & Security'
    ],
    includes: [
      'Discovery & IA',
      'Design System Setup',
      'Build & Integrations',
      'QA & UAT',
      'Launch Support',
      'Training & Handover'
    ]
  },
  {
    id: '7',
    name: 'Invoicing & Billing Systems',
    slug: generateSlug('Invoicing & Billing Systems'),
    description: 'GST-compliant invoicing, estimates, collections, and receipts with role-based access and audit trails.',
    price: 38000,
    duration: '2-4 Weeks',
    category: 'invoicing-billing',
    iconName: 'Settings',
    features: [
      'GST-Compliant Invoices',
      'Estimates & Proforma',
      'Receipts & Collections',
      'Role-Based Access',
      'Audit Logs',
      'Reports & Exports'
    ],
    includes: [
      'Process Mapping',
      'Template Setup',
      'User & Role Config',
      'Tax & Series Setup',
      'UAT & Training',
      'Go-live Support'
    ]
  },
  {
    id: '8',
    name: 'Inventory Management',
    slug: generateSlug('Inventory Management'),
    description: 'Multi-location stock, procurement, GRN, and reorder automation with alerts and dashboards.',
    price: 52000,
    duration: '3-6 Weeks',
    category: 'inventory-management',
    iconName: 'Settings',
    features: [
      'Multi-Location Stock',
      'Procurement & GRN',
      'Reorder Automation',
      'Batch/Serial Tracking',
      'Alerts & Dashboards',
      'API/ERP Integration'
    ],
    includes: [
      'Data Model & Masters',
      'Workflow Setup',
      'Approval Rules',
      'Reporting Pack',
      'User Training',
      'Hypercare'
    ]
  },
  {
    id: '9',
    name: 'Clinic Management System',
    slug: generateSlug('Clinic Management System'),
    description: 'OPD management, appointments, EMR, prescriptions, and billing tailored for clinics.',
    price: 68000,
    duration: '4-8 Weeks',
    category: 'clinic-management',
    iconName: 'Settings',
    features: [
      'Appointments & Calendar',
      'Patient Records & EMR',
      'Prescriptions & Templates',
      'Billing & Payments',
      'Role & Consent Controls',
      'Reports & Analytics'
    ],
    includes: [
      'Requirement Workshops',
      'Template Configuration',
      'Data Migration (if any)',
      'User Onboarding',
      'UAT & Sign-off',
      'Support & AMC Options'
    ]
  },
  {
    id: '10',
    name: 'Lab Management System',
    slug: generateSlug('Lab Management System'),
    description: 'Sample tracking, test catalogue, billing, and report publishing for diagnostics labs.',
    price: 72000,
    duration: '4-8 Weeks',
    category: 'lab-management',
    iconName: 'Settings',
    features: [
      'Sample & Test Tracking',
      'Test Catalogue & Pricing',
      'Workflows & Approvals',
      'Billing & Payments',
      'Report Publishing',
      'Integrations & APIs'
    ],
    includes: [
      'Workflow Mapping',
      'Catalogue Setup',
      'Template & Branding',
      'Role-Based Access',
      'Training & UAT',
      'Go-live Hypercare'
    ]
  }
];

