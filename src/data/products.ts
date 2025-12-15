import { Product } from '../types/catalog';
import { generateSlug } from '../utils/seo';

export const products: Product[] = [
  {
    id: '1',
    name: 'Mid-Market ERP Suite (On-Prem/Cloud)',
    slug: generateSlug('Mid-Market ERP Suite'),
    description: 'Modular ERP for finance, inventory, sales, and production with API-first integrations.',
    price: 185000,
    originalPrice: 210000,
    images: ['/api/placeholder/300/200'],
    category: 'erp',
    brand: 'WAINSO',
    model: 'ERP-MM-Cloud',
    inStock: true,
    stockQuantity: 6,
    rating: 4.9,
    reviews: 32,
    features: [
      'Finance & GST-ready',
      'Inventory & Procurement',
      'Production & BOM',
      'CRM & Order Mgmt',
      'REST & Webhooks'
    ],
    specifications: {
      Deployment: 'Cloud / On-Prem',
      Database: 'PostgreSQL',
      Users: '25 Base, expandable',
      Integration: 'REST, Webhooks, SSO',
      Support: '8x5 with upgrade path'
    },
    warranty: 'Annual maintenance & updates'
  },
  {
    id: '2',
    name: 'Business Laptop i7 (16GB/512GB/Win 11 Pro)',
    slug: generateSlug('Business Laptop i7 16GB 512GB Win 11 Pro'),
    description: 'Reliable business notebook with TPM, Wi‑Fi 6, and extended warranty options.',
    price: 72000,
    originalPrice: 78999,
    images: ['/api/placeholder/300/200'],
    category: 'hardware',
    brand: 'Dell',
    model: 'Latitude 5440',
    inStock: true,
    stockQuantity: 18,
    rating: 4.7,
    reviews: 21,
    features: [
      '13th Gen Intel i7',
      '16GB DDR5, 512GB SSD',
      'Wi‑Fi 6E, LTE Ready',
      'TPM & BitLocker',
      '3Y ProSupport'
    ],
    specifications: {
      CPU: 'Intel Core i7 13th Gen',
      Memory: '16GB DDR5',
      Storage: '512GB NVMe',
      Display: '14" FHD IPS',
      OS: 'Windows 11 Pro'
    },
    warranty: '3 Years ProSupport'
  },
  {
    id: '3',
    name: 'Next-Gen Firewall with UTM',
    slug: generateSlug('Next-Gen Firewall with UTM'),
    description: 'Security appliance with IPS, web filtering, SD-WAN, and VPN for branches and HO.',
    price: 95000,
    originalPrice: 112000,
    images: ['/api/placeholder/300/200'],
    category: 'networking',
    brand: 'Fortinet',
    model: 'FortiGate 60F',
    inStock: true,
    stockQuantity: 9,
    rating: 4.8,
    reviews: 27,
    features: [
      '1 Gbps Firewall Throughput',
      'SSL VPN & IPsec',
      'IPS/Web/App Control',
      'SD-WAN Ready',
      'Central Management'
    ],
    specifications: {
      Throughput: '1 Gbps FW, 700 Mbps IPS',
      Interfaces: '7x GE RJ45, 2x SFP',
      VPN: 'SSL/IPsec, 200 Tunnels',
      Management: 'FortiManager/Cloud',
      Power: 'External Adapter'
    },
    warranty: '1 Year UTM & Support'
  },
  {
    id: '4',
    name: '24-Port Managed PoE Switch',
    slug: generateSlug('24-Port Managed PoE Switch'),
    description: 'Layer-2 managed switch with PoE+ for APs, cameras, and VoIP with VLAN and QoS.',
    price: 38000,
    originalPrice: 42500,
    images: ['/api/placeholder/300/200'],
    category: 'networking',
    brand: 'Cisco',
    model: 'CBS250-24P-4G',
    inStock: true,
    stockQuantity: 14,
    rating: 4.6,
    reviews: 19,
    features: [
      '24x PoE+ Ports',
      '4x 1G SFP Uplinks',
      'VLAN & QoS',
      'Fanless Options',
      'Smart Management'
    ],
    specifications: {
      PoEBudget: '195W',
      Switching: '56 Gbps',
      Mount: 'Rack/Desk',
      Management: 'Web, CLI, SNMP',
      Warranty: 'Limited Lifetime'
    },
    warranty: 'Limited Lifetime'
  },
  {
    id: '5',
    name: 'Wi‑Fi 6 Access Point',
    slug: generateSlug('Wi-Fi 6 Access Point'),
    description: 'Enterprise Wi‑Fi 6 indoor access point with seamless roaming and captive portal.',
    price: 18500,
    originalPrice: 21500,
    images: ['/api/placeholder/300/200'],
    category: 'networking',
    brand: 'Aruba',
    model: 'Instant On AP25',
    inStock: true,
    stockQuantity: 25,
    rating: 4.7,
    reviews: 34,
    features: [
      'Wi‑Fi 6 (4x4:4)',
      'OFDMA & MU-MIMO',
      'Seamless Roaming',
      'App & Cloud Managed',
      'Guest Captive Portal'
    ],
    specifications: {
      Radios: 'Dual-band 2.4/5 GHz',
      Ports: '1x 2.5G PoE',
      Power: '802.3at PoE',
      Mount: 'Ceiling/Wall',
      Warranty: '2 Years'
    },
    warranty: '2 Years'
  },
  {
    id: '6',
    name: 'Hybrid Cloud Backup Appliance',
    slug: generateSlug('Hybrid Cloud Backup Appliance'),
    description: 'On-prem backup with cloud sync, ransomware protection, and instant recovery.',
    price: 145000,
    originalPrice: 158000,
    images: ['/api/placeholder/300/200'],
    category: 'hardware',
    brand: 'Veeam',
    model: 'V-Backup 8TB',
    inStock: true,
    stockQuantity: 4,
    rating: 4.5,
    reviews: 11,
    features: [
      'Inline Dedup & Compression',
      'Immutable Backups',
      'Cloud Tiering',
      'Instant VM Recovery',
      '365/Google Backup'
    ],
    specifications: {
      Capacity: '8TB usable',
      FormFactor: '1U Appliance',
      Connectivity: '2x10G SFP+, 4x1G',
      Power: 'Dual PSU',
      Support: '24x7'
    },
    warranty: '3 Years Support'
  },
  {
    id: '7',
    name: 'All-in-One CCTV Kit (4 Camera)',
    slug: generateSlug('All-in-One CCTV Kit 4 Camera'),
    description: 'IP CCTV kit with 4 cameras, NVR, storage, and remote mobile access.',
    price: 26500,
    originalPrice: 29999,
    images: ['/api/placeholder/300/200'],
    category: 'security',
    brand: 'Hikvision',
    model: 'Value IP Kit 4C',
    inStock: true,
    stockQuantity: 10,
    rating: 4.4,
    reviews: 17,
    features: [
      '4MP IP Cameras',
      '30m IR Night Vision',
      '8CH NVR',
      '1TB HDD Included',
      'Mobile App & Alerts'
    ],
    specifications: {
      Cameras: '4x 4MP Dome',
      NVR: '8CH with PoE',
      Storage: '1TB HDD',
      Weather: 'IP67 Cameras',
      Warranty: '2 Years'
    },
    warranty: '2 Years'
  },
  {
    id: '8',
    name: 'Windows 11 Pro Volume License',
    slug: generateSlug('Windows 11 Pro Volume License'),
    description: 'Volume licensing with activation support for secure business rollouts.',
    price: 12500,
    originalPrice: 13800,
    images: ['/api/placeholder/300/200'],
    category: 'software',
    brand: 'Microsoft',
    model: 'Win11Pro-OpenLic',
    inStock: true,
    stockQuantity: 40,
    rating: 4.3,
    reviews: 22,
    features: [
      'Volume Activation',
      'BitLocker & TPM',
      'Azure AD Ready',
      'Remote Desktop',
      'Long-term Servicing'
    ],
    specifications: {
      Delivery: 'Electronic License',
      Edition: 'Pro',
      Users: 'Per Device',
      Support: 'Activation Assistance',
      Compliance: 'GST Invoice'
    },
    warranty: 'License & support'
  },
  {
    id: '9',
    name: 'Rack Server for Virtualization',
    slug: generateSlug('Rack Server for Virtualization'),
    description: 'Dual-socket rack server sized for virtualization, ERP, and database workloads.',
    price: 265000,
    originalPrice: 289000,
    images: ['/api/placeholder/300/200'],
    category: 'hardware',
    brand: 'HPE',
    model: 'ProLiant DL380 Gen10',
    inStock: true,
    stockQuantity: 3,
    rating: 4.8,
    reviews: 14,
    features: [
      'Dual Xeon Silver',
      '64GB ECC RAM',
      '4x 1.92TB SSD',
      'iLO Remote Mgmt',
      'Redundant PSU'
    ],
    specifications: {
      CPU: '2x Xeon Silver',
      Memory: '64GB DDR4 ECC',
      Storage: '4x 1.92TB SSD',
      Network: '4x 1G, Optional 10G',
      RailKit: 'Included'
    },
    warranty: '3 Years NBD Onsite'
  },
  {
    id: '10',
    name: 'Custom CRM-ERP Connector Pack',
    slug: generateSlug('Custom CRM-ERP Connector Pack'),
    description: 'Pre-built connectors to sync leads, invoices, and inventory between CRM and ERP.',
    price: 42000,
    originalPrice: 48000,
    images: ['/api/placeholder/300/200'],
    category: 'software',
    brand: 'WAINSO',
    model: 'Connector Pack v2',
    inStock: true,
    stockQuantity: 12,
    rating: 4.6,
    reviews: 16,
    features: [
      'Bi-directional Sync',
      'Retry & Queues',
      'Audit Trails',
      'Webhook Ready',
      'Playbooks Included'
    ],
    specifications: {
      Platforms: 'Zoho/HubSpot/Salesforce to ERP',
      Auth: 'OAuth2/API Key',
      Logging: 'Centralized',
      Deployment: 'Cloud or On-Prem',
      Support: 'Implementation Assistance'
    },
    warranty: 'Implementation support'
  },
  {
    id: '11',
    name: 'Cervei.com Platform Subscription',
    slug: generateSlug('Cervei.com Platform Subscription'),
    description: 'Cervei cloud platform for multi-location operations with billing, inventory, and analytics built in.',
    price: 95000,
    originalPrice: 110000,
    images: ['/api/placeholder/300/200'],
    category: 'software',
    brand: 'Cervei',
    model: 'Cervei Cloud',
    inStock: true,
    stockQuantity: 15,
    rating: 4.7,
    reviews: 19,
    features: [
      'Multi-location & roles',
      'Billing & invoicing',
      'Inventory & catalog',
      'Dashboards & alerts',
      'API/ERP integrations'
    ],
    specifications: {
      Deployment: 'Cloud SaaS',
      Users: '25 base, scalable',
      Modules: 'Billing, Inventory, Analytics',
      Integration: 'REST/Webhooks',
      Support: '8x5 with onboarding'
    },
    warranty: 'Subscription support and updates'
  }
];

