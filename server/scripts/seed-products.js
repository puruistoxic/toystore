// Seed products for GPS & Security Systems business
// Run with: node server/scripts/seed-products.js
// Note: Run seed-masters.js first to ensure categories and brands exist

const { initDatabase, getPool } = require('../db');
const { v4: uuidv4 } = require('uuid');
const { seedMasters } = require('./seed-masters');

function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const products = [
  // ========== CCTV CAMERAS ==========
  {
    name: 'Hikvision 4MP IP Bullet Camera',
    description: 'High-definition 4MP IP bullet camera with night vision up to 30m, weather-resistant IP67 rating, and motion detection. Perfect for outdoor surveillance.',
    short_description: '4MP IP bullet camera with night vision and weather resistance',
    price: 6500,
    category: 'CCTV Camera',
    brand: 'Hikvision',
    hsn_code: '8528',
    features: JSON.stringify([
      '4MP (2560×1440) Resolution',
      '30m IR Night Vision',
      'Weather Resistant IP67',
      'Motion Detection',
      'H.265+ Compression',
      'Mobile App Support'
    ]),
    specifications: JSON.stringify({
      'Resolution': '4MP (2560×1440)',
      'Lens': '2.8mm Fixed',
      'Night Vision': '30m IR Range',
      'Weather Rating': 'IP67',
      'Power': '12V DC / PoE',
      'Storage': 'MicroSD up to 128GB'
    }),
    warranty: '2 Years Manufacturer Warranty',
    seo_title: 'Hikvision 4MP IP Bullet Camera - Best Price in India',
    seo_description: 'Buy Hikvision 4MP IP Bullet Camera with night vision and weather resistance. Best price with warranty.',
    seo_keywords: JSON.stringify(['hikvision', '4mp camera', 'ip camera', 'bullet camera', 'cctv'])
  },
  {
    name: 'CP Plus 2MP Dome Camera',
    description: 'Professional 2MP dome camera with 1080P Full HD resolution, IR night vision, and vandal-resistant design. Ideal for indoor and outdoor use.',
    short_description: '2MP dome camera with Full HD and night vision',
    price: 2900,
    category: 'CCTV Camera',
    brand: 'CP Plus',
    hsn_code: '8528',
    features: JSON.stringify([
      '2MP 1080P Full HD',
      '30m IR Night Vision',
      'Vandal Resistant',
      'Wide Dynamic Range',
      'Motion Detection',
      'Easy Installation'
    ]),
    specifications: JSON.stringify({
      'Resolution': '2MP (1920×1080)',
      'Lens': '2.8-12mm Vari-focal',
      'Night Vision': '30m IR Range',
      'Weather Rating': 'IP67',
      'Power': '12V DC / PoE'
    }),
    warranty: '2 Years Manufacturer Warranty',
    seo_title: 'CP Plus 2MP Dome Camera - HD Security Camera',
    seo_description: 'CP Plus 2MP dome camera with Full HD resolution and night vision. Best price with warranty.',
    seo_keywords: JSON.stringify(['cp plus', '2mp camera', 'dome camera', 'hd camera', 'cctv'])
  },
  {
    name: 'Dahua 5MP Bullet Camera',
    description: 'Advanced 5MP bullet camera with superior image quality, 40m night vision range, and intelligent video analytics. Perfect for high-security areas.',
    short_description: '5MP bullet camera with advanced night vision',
    price: 7500,
    category: 'CCTV Camera',
    brand: 'Dahua',
    hsn_code: '8528',
    features: JSON.stringify([
      '5MP Ultra HD Resolution',
      '40m IR Night Vision',
      'Smart Motion Detection',
      'Weather Resistant IP67',
      'H.265 Compression',
      'Mobile App Access'
    ]),
    specifications: JSON.stringify({
      'Resolution': '5MP (2880×1620)',
      'Lens': '2.7-13.5mm Motorized Zoom',
      'Night Vision': '40m IR Range',
      'Weather Rating': 'IP67',
      'Power': '12V DC / PoE'
    }),
    warranty: '3 Years Manufacturer Warranty',
    seo_title: 'Dahua 5MP Bullet Camera - Ultra HD Security',
    seo_description: 'Dahua 5MP bullet camera with ultra HD resolution and advanced features. Best price available.',
    seo_keywords: JSON.stringify(['dahua', '5mp camera', 'ultra hd', 'bullet camera', 'security'])
  },
  {
    name: 'Hikvision 2MP Turret Camera',
    description: 'Compact 2MP turret camera with excellent low-light performance, vandal-resistant design, and easy installation. Great for residential and commercial use.',
    short_description: '2MP turret camera with low-light performance',
    price: 3200,
    category: 'CCTV Camera',
    brand: 'Hikvision',
    hsn_code: '8528',
    features: JSON.stringify([
      '2MP 1080P Full HD',
      'Excellent Low-Light',
      'Vandal Resistant',
      'WDR Technology',
      'Motion Detection',
      'Compact Design'
    ]),
    specifications: JSON.stringify({
      'Resolution': '2MP (1920×1080)',
      'Lens': '2.8mm Fixed',
      'Night Vision': '30m IR Range',
      'Weather Rating': 'IP67',
      'Power': '12V DC / PoE'
    }),
    warranty: '2 Years Manufacturer Warranty',
    seo_title: 'Hikvision 2MP Turret Camera - Compact Security',
    seo_description: 'Hikvision 2MP turret camera with excellent performance. Best price with warranty.',
    seo_keywords: JSON.stringify(['hikvision', 'turret camera', '2mp', 'compact camera'])
  },
  {
    name: 'CP Plus 4MP PTZ Camera',
    description: 'Professional 4MP PTZ (Pan-Tilt-Zoom) camera with 360° rotation, 20x optical zoom, and intelligent tracking. Perfect for large area surveillance.',
    short_description: '4MP PTZ camera with 360° rotation and zoom',
    price: 25000,
    category: 'CCTV Camera',
    brand: 'CP Plus',
    hsn_code: '8528',
    features: JSON.stringify([
      '4MP HD Resolution',
      '360° Pan & 90° Tilt',
      '20x Optical Zoom',
      'Auto Tracking',
      'Preset Positions',
      'Weather Resistant IP66'
    ]),
    specifications: JSON.stringify({
      'Resolution': '4MP (2560×1440)',
      'Zoom': '20x Optical + 4x Digital',
      'Pan Range': '360° Continuous',
      'Tilt Range': '-10° to 90°',
      'Weather Rating': 'IP66',
      'Power': '24V AC / PoE+'
    }),
    warranty: '2 Years Manufacturer Warranty',
    seo_title: 'CP Plus 4MP PTZ Camera - Pan Tilt Zoom',
    seo_description: 'CP Plus 4MP PTZ camera with 360° rotation and auto tracking. Professional surveillance solution.',
    seo_keywords: JSON.stringify(['ptz camera', 'pan tilt zoom', '4mp', 'auto tracking'])
  },

  // ========== DVRs & NVRs ==========
  {
    name: 'Hikvision 8 Channel DVR',
    description: '8-channel digital video recorder with 4K resolution support, H.265 compression, and remote access. Includes mobile app for monitoring.',
    short_description: '8-channel DVR with 4K support and remote access',
    price: 12000,
    category: 'DVR/NVR',
    brand: 'Hikvision',
    features: JSON.stringify([
      '8 Channel Recording',
      '4K Resolution Support',
      'H.265 Compression',
      'Remote Access',
      'Mobile App',
      'HDMI & VGA Output'
    ]),
    specifications: JSON.stringify({
      'Channels': '8',
      'Resolution': '4K (3840×2160)',
      'Storage': 'Up to 6TB HDD',
      'Compression': 'H.264/H.265',
      'Network': 'Gigabit Ethernet',
      'Output': 'HDMI, VGA, BNC'
    }),
    warranty: '2 Years Manufacturer Warranty',
    seo_title: 'Hikvision 8 Channel DVR - 4K Recording',
    seo_description: 'Hikvision 8-channel DVR with 4K support and remote access. Best price with warranty.',
    seo_keywords: JSON.stringify(['dvr', '8 channel', 'hikvision', '4k', 'video recorder'])
  },
  {
    name: 'Dahua 16 Channel NVR',
    description: '16-channel network video recorder with PoE support, 4K recording, and intelligent video analytics. Perfect for large installations.',
    short_description: '16-channel NVR with PoE and 4K recording',
    price: 18000,
    category: 'DVR/NVR',
    brand: 'Dahua',
    hsn_code: '8528',
    features: JSON.stringify([
      '16 Channel Recording',
      'PoE Support',
      '4K Resolution',
      'Intelligent Analytics',
      'Remote Access',
      'Mobile App'
    ]),
    specifications: JSON.stringify({
      'Channels': '16',
      'PoE Ports': '16',
      'Resolution': '4K per Channel',
      'Storage': 'Up to 10TB HDD',
      'Compression': 'H.265+',
      'Network': 'Gigabit Ethernet'
    }),
    warranty: '3 Years Manufacturer Warranty',
    seo_title: 'Dahua 16 Channel NVR - PoE Network Recorder',
    seo_description: 'Dahua 16-channel NVR with PoE support and 4K recording. Professional solution.',
    seo_keywords: JSON.stringify(['nvr', '16 channel', 'poe', 'dahua', 'network recorder'])
  },
  {
    name: 'CP Plus 4 Channel DVR Kit',
    description: 'Complete 4-channel CCTV kit with DVR, 4 cameras, 1TB hard disk, cables, and power adapters. Ready to install solution.',
    short_description: 'Complete 4-channel CCTV kit with all accessories',
    price: 18000,
    category: 'CCTV Kit',
    brand: 'CP Plus',
    hsn_code: '8528',
    features: JSON.stringify([
      '4 Channel DVR',
      '4 HD Cameras Included',
      '1TB HDD Included',
      'All Cables & Accessories',
      'Mobile App Access',
      'Easy Installation'
    ]),
    specifications: JSON.stringify({
      'Channels': '4',
      'Cameras': '4x 2MP Bullet Cameras',
      'Storage': '1TB HDD',
      'Resolution': '1080P per Channel',
      'Mobile App': 'CP Plus Mobile',
      'Warranty': '2 Years'
    }),
    warranty: '2 Years Manufacturer Warranty',
    seo_title: 'CP Plus 4 Channel CCTV Kit - Complete Package',
    seo_description: 'CP Plus 4-channel CCTV kit with cameras, DVR, and all accessories. Ready to install.',
    seo_keywords: JSON.stringify(['cctv kit', '4 channel', 'complete package', 'cctv installation'])
  },

  // ========== GPS TRACKING DEVICES ==========
  {
    name: 'Personal GPS Tracker with SIM',
    description: 'Compact personal GPS tracker with built-in SIM card, real-time tracking, geofencing, and SOS button. Long battery life up to 30 days.',
    short_description: 'Personal GPS tracker with real-time tracking and SOS',
    price: 4500,
    category: 'GPS Device',
    brand: 'Queclink',
    hsn_code: '8526',
    features: JSON.stringify([
      'Real-time GPS Tracking',
      'Geofencing Alerts',
      'SOS Emergency Button',
      '30 Days Battery Life',
      'Waterproof Design',
      'Mobile App Access'
    ]),
    specifications: JSON.stringify({
      'Battery': '5000mAh',
      'Standby Time': '30 Days',
      'GPS Accuracy': '3-5 meters',
      'Network': '2G/3G/4G',
      'Operating Temperature': '-20°C to +70°C',
      'Waterproof': 'IP65'
    }),
    warranty: '1 Year Manufacturer Warranty',
    seo_title: 'Personal GPS Tracker - Real-time Tracking Device',
    seo_description: 'Personal GPS tracker with SIM card, real-time tracking, and SOS button. Best price in India.',
    seo_keywords: JSON.stringify(['gps tracker', 'personal tracker', 'real-time tracking', 'sos button'])
  },
  {
    name: 'Vehicle GPS Tracker OBD',
    description: 'OBD-II GPS tracker for vehicles with real-time tracking, fuel monitoring, driver behavior analysis, and route optimization. Easy plug-and-play installation.',
    short_description: 'OBD GPS tracker for vehicles with fuel monitoring',
    price: 5500,
    category: 'GPS Device',
    brand: 'Teltonika',
    hsn_code: '8526',
    features: JSON.stringify([
      'OBD-II Plug & Play',
      'Real-time Tracking',
      'Fuel Monitoring',
      'Driver Behavior Analysis',
      'Route Optimization',
      'Geofencing Alerts'
    ]),
    specifications: JSON.stringify({
      'Interface': 'OBD-II',
      'GPS Accuracy': '2-5 meters',
      'Network': '4G LTE',
      'Battery': 'Backup Battery',
      'Installation': 'Plug & Play',
      'Mobile App': 'Fleet Management'
    }),
    warranty: '1 Year Manufacturer Warranty',
    seo_title: 'Vehicle GPS Tracker OBD - Fleet Management',
    seo_description: 'OBD-II GPS tracker for vehicles with fuel monitoring and driver behavior analysis. Best price.',
    seo_keywords: JSON.stringify(['vehicle tracker', 'obd tracker', 'fleet management', 'gps tracking'])
  },
  {
    name: 'Fleet GPS Tracker with Fuel Sensor',
    description: 'Advanced fleet GPS tracker with built-in fuel sensor, real-time location tracking, driver behavior monitoring, and comprehensive fleet management features.',
    short_description: 'Fleet GPS tracker with fuel sensor and analytics',
    price: 8500,
    category: 'GPS Device',
    brand: 'Teltonika',
    hsn_code: '8526',
    features: JSON.stringify([
      'Fleet Management',
      'Fuel Level Monitoring',
      'Driver Behavior Analysis',
      'Route Optimization',
      'Real-time Alerts',
      'Comprehensive Reports'
    ]),
    specifications: JSON.stringify({
      'GPS': 'High Precision',
      'Fuel Sensor': 'Built-in',
      'Connectivity': '4G LTE',
      'Battery': 'Backup Battery',
      'Installation': 'Professional',
      'Reporting': 'Advanced Analytics'
    }),
    warranty: '1 Year Manufacturer Warranty',
    seo_title: 'Fleet GPS Tracker - Fuel Monitoring System',
    seo_description: 'Fleet GPS tracker with fuel sensor and driver behavior analysis. Complete fleet management solution.',
    seo_keywords: JSON.stringify(['fleet tracker', 'gps tracking', 'fuel monitoring', 'fleet management'])
  },
  {
    name: 'Motorcycle GPS Tracker',
    description: 'Compact GPS tracker designed for motorcycles and two-wheelers. Waterproof design, vibration detection, and anti-theft features with real-time tracking.',
    short_description: 'GPS tracker for motorcycles with anti-theft features',
    price: 3500,
    category: 'GPS Device',
    brand: 'Queclink',
    hsn_code: '8526',
    features: JSON.stringify([
      'Compact Design',
      'Waterproof IP67',
      'Vibration Detection',
      'Anti-theft Alerts',
      'Real-time Tracking',
      'Long Battery Life'
    ]),
    specifications: JSON.stringify({
      'Battery': '3000mAh',
      'Standby Time': '20 Days',
      'GPS Accuracy': '5 meters',
      'Network': '2G/3G/4G',
      'Waterproof': 'IP67',
      'Installation': 'Hidden Mount'
    }),
    warranty: '1 Year Manufacturer Warranty',
    seo_title: 'Motorcycle GPS Tracker - Anti-theft Device',
    seo_description: 'GPS tracker for motorcycles with anti-theft and vibration detection. Best price available.',
    seo_keywords: JSON.stringify(['motorcycle tracker', 'bike tracker', 'anti-theft', 'gps device'])
  },

  // ========== INSTALLATION SERVICES ==========
  {
    name: 'CCTV Installation Service',
    description: 'Professional CCTV camera installation service including site survey, camera mounting, cable routing, DVR setup, and mobile app configuration. Includes 1 year service warranty.',
    short_description: 'Professional CCTV installation with service warranty',
    price: 2000,
    category: 'Installation Service',
    brand: 'Service',
    hsn_code: '9983',
    features: JSON.stringify([
      'Site Survey',
      'Professional Installation',
      'Cable Routing',
      'DVR/NVR Setup',
      'Mobile App Configuration',
      '1 Year Service Warranty'
    ]),
    specifications: JSON.stringify({
      'Service Type': 'Installation',
      'Warranty': '1 Year Service',
      'Includes': 'All Setup & Configuration',
      'Support': 'Phone & On-site',
      'Response Time': '24-48 Hours'
    }),
    warranty: '1 Year Service Warranty',
    seo_title: 'CCTV Installation Service - Professional Setup',
    seo_description: 'Professional CCTV installation service with site survey and 1 year warranty. Expert technicians.',
    seo_keywords: JSON.stringify(['cctv installation', 'camera installation', 'security setup', 'professional service'])
  },
  {
    name: 'GPS Tracker Installation Service',
    description: 'Professional GPS tracker installation service including device mounting, SIM card activation, mobile app setup, and testing. Includes training and 6 months support.',
    short_description: 'GPS tracker installation with app setup and training',
    price: 1500,
    category: 'Installation Service',
    brand: 'Service',
    hsn_code: '9983',
    features: JSON.stringify([
      'Device Installation',
      'SIM Card Activation',
      'Mobile App Setup',
      'Testing & Calibration',
      'User Training',
      '6 Months Support'
    ]),
    specifications: JSON.stringify({
      'Service Type': 'Installation',
      'Support': '6 Months',
      'Includes': 'Setup & Training',
      'Response Time': '24 Hours',
      'Training': 'Included'
    }),
    warranty: '6 Months Service Support',
    seo_title: 'GPS Tracker Installation - Professional Service',
    seo_description: 'Professional GPS tracker installation with app setup and user training. Expert service.',
    seo_keywords: JSON.stringify(['gps installation', 'tracker setup', 'fleet installation', 'professional service'])
  },
  {
    name: 'Complete Security System Installation',
    description: 'Complete security system installation including CCTV cameras, DVR/NVR, access control, alarm systems, and integration. Includes site survey, installation, and 1 year maintenance.',
    short_description: 'Complete security system installation and integration',
    price: 5000,
    category: 'Installation Service',
    brand: 'Service',
    hsn_code: '9983',
    features: JSON.stringify([
      'Complete System Setup',
      'CCTV Integration',
      'Access Control Setup',
      'Alarm System Integration',
      'Site Survey',
      '1 Year Maintenance'
    ]),
    specifications: JSON.stringify({
      'Service Type': 'Complete Installation',
      'Warranty': '1 Year Maintenance',
      'Includes': 'All Systems Integration',
      'Support': '24/7 Support',
      'Response Time': '12 Hours'
    }),
    warranty: '1 Year Maintenance Warranty',
    seo_title: 'Complete Security System Installation',
    seo_description: 'Complete security system installation with CCTV, access control, and alarm integration. Professional service.',
    seo_keywords: JSON.stringify(['security installation', 'complete system', 'cctv integration', 'professional setup'])
  },

  // ========== MAINTENANCE SERVICES ==========
  {
    name: 'CCTV Maintenance Service (Annual)',
    description: 'Annual CCTV maintenance service including camera cleaning, DVR checkup, cable inspection, software updates, and performance optimization. Quarterly visits included.',
    short_description: 'Annual CCTV maintenance with quarterly visits',
    price: 3000,
    category: 'Maintenance Service',
    brand: 'Service',
    hsn_code: '9987',
    features: JSON.stringify([
      'Camera Cleaning',
      'DVR/NVR Checkup',
      'Cable Inspection',
      'Software Updates',
      'Performance Optimization',
      'Quarterly Visits'
    ]),
    specifications: JSON.stringify({
      'Service Type': 'Annual Maintenance',
      'Visits': '4 Quarterly Visits',
      'Includes': 'Full System Checkup',
      'Support': 'Phone Support',
      'Response Time': '48 Hours'
    }),
    warranty: 'Annual Service Contract',
    seo_title: 'CCTV Maintenance Service - Annual Contract',
    seo_description: 'Annual CCTV maintenance service with quarterly visits and full system checkup. Best maintenance plan.',
    seo_keywords: JSON.stringify(['cctv maintenance', 'annual service', 'camera maintenance', 'system checkup'])
  },
  {
    name: 'GPS Tracker Maintenance Service',
    description: 'GPS tracker maintenance service including device health check, SIM card verification, battery replacement, software updates, and performance optimization.',
    short_description: 'GPS tracker maintenance and health check',
    price: 2000,
    category: 'Maintenance Service',
    brand: 'Service',
    hsn_code: '9987',
    features: JSON.stringify([
      'Device Health Check',
      'SIM Card Verification',
      'Battery Replacement',
      'Software Updates',
      'Performance Optimization',
      'Remote Support'
    ]),
    specifications: JSON.stringify({
      'Service Type': 'Maintenance',
      'Visits': 'As Required',
      'Includes': 'Full Device Checkup',
      'Support': 'Remote & On-site',
      'Response Time': '24 Hours'
    }),
    warranty: 'Service Contract',
    seo_title: 'GPS Tracker Maintenance - Device Health Check',
    seo_description: 'GPS tracker maintenance service with device health check and battery replacement. Expert service.',
    seo_keywords: JSON.stringify(['gps maintenance', 'tracker service', 'device checkup', 'battery replacement'])
  },

  // ========== ACCESSORIES ==========
  {
    name: 'CCTV Cable RG59 with Power',
    description: 'High-quality RG59 coaxial cable with integrated power cable for CCTV cameras. 100 meters length, weather-resistant, and suitable for outdoor use.',
    short_description: 'RG59 CCTV cable with integrated power, 100m',
    price: 1200,
    category: 'Accessories',
    brand: 'Generic',
    hsn_code: '8528',
    features: JSON.stringify([
      'RG59 Coaxial Cable',
      'Integrated Power Cable',
      '100 Meters Length',
      'Weather Resistant',
      'Outdoor Use',
      'High Quality'
    ]),
    specifications: JSON.stringify({
      'Cable Type': 'RG59 + Power',
      'Length': '100 Meters',
      'Conductor': 'Copper',
      'Weather Rating': 'UV Resistant',
      'Suitable For': 'Outdoor Installation'
    }),
    warranty: '1 Year Warranty',
    seo_title: 'CCTV Cable RG59 with Power - 100 Meters',
    seo_description: 'High-quality RG59 CCTV cable with integrated power cable. 100 meters length, weather resistant.',
    seo_keywords: JSON.stringify(['cctv cable', 'rg59', 'power cable', 'cctv accessories'])
  },
  {
    name: 'BNC Connector Pack (20 Pieces)',
    description: 'Professional BNC connectors pack with 20 pieces. High-quality connectors for CCTV camera installations. Easy to install and weather resistant.',
    short_description: 'BNC connector pack with 20 pieces',
    price: 500,
    category: 'Accessories',
    brand: 'Generic',
    hsn_code: '8528',
    features: JSON.stringify([
      '20 Pieces Pack',
      'High Quality',
      'Easy Installation',
      'Weather Resistant',
      'Professional Grade',
      'Compatible with RG59'
    ]),
    specifications: JSON.stringify({
      'Quantity': '20 Pieces',
      'Type': 'BNC Connector',
      'Compatible': 'RG59 Cable',
      'Material': 'Gold Plated',
      'Weather Rating': 'Waterproof'
    }),
    warranty: '1 Year Warranty',
    seo_title: 'BNC Connector Pack - 20 Pieces',
    seo_description: 'Professional BNC connector pack with 20 pieces. High-quality connectors for CCTV installation.',
    seo_keywords: JSON.stringify(['bnc connector', 'cctv connector', 'cable connector', 'installation accessories'])
  },
  {
    name: '12V DC Power Adapter (2A)',
    description: '12V DC power adapter with 2A output for CCTV cameras. Weather-resistant design, suitable for indoor and outdoor use. Includes 3-meter cable.',
    short_description: '12V 2A power adapter for CCTV cameras',
    price: 300,
    category: 'Accessories',
    brand: 'Generic',
    hsn_code: '8528',
    features: JSON.stringify([
      '12V DC Output',
      '2A Current Rating',
      'Weather Resistant',
      '3 Meter Cable',
      'LED Indicator',
      'Short Circuit Protection'
    ]),
    specifications: JSON.stringify({
      'Output': '12V DC, 2A',
      'Input': '100-240V AC',
      'Cable Length': '3 Meters',
      'Protection': 'Short Circuit',
      'Weather Rating': 'IP65'
    }),
    warranty: '1 Year Warranty',
    seo_title: '12V DC Power Adapter - CCTV Camera Power Supply',
    seo_description: '12V DC power adapter with 2A output for CCTV cameras. Weather resistant with 3-meter cable.',
    seo_keywords: JSON.stringify(['power adapter', '12v adapter', 'cctv power', 'dc adapter'])
  },
  {
    name: 'CCTV Camera Mount Bracket',
    description: 'Universal CCTV camera mount bracket for wall and ceiling installation. Adjustable angle, weather-resistant, and compatible with all standard cameras.',
    short_description: 'Universal CCTV camera mount bracket',
    price: 250,
    category: 'Accessories',
    brand: 'Generic',
    hsn_code: '8528',
    features: JSON.stringify([
      'Universal Design',
      'Wall & Ceiling Mount',
      'Adjustable Angle',
      'Weather Resistant',
      'Easy Installation',
      'Sturdy Construction'
    ]),
    specifications: JSON.stringify({
      'Mount Type': 'Universal',
      'Installation': 'Wall/Ceiling',
      'Material': 'Stainless Steel',
      'Weather Rating': 'IP65',
      'Weight Capacity': '2 kg'
    }),
    warranty: '1 Year Warranty',
    seo_title: 'CCTV Camera Mount Bracket - Universal Mount',
    seo_description: 'Universal CCTV camera mount bracket for wall and ceiling installation. Adjustable and weather resistant.',
    seo_keywords: JSON.stringify(['camera mount', 'cctv bracket', 'mounting bracket', 'camera installation'])
  },

  // ========== SECURITY SYSTEMS ==========
  {
    name: 'Video Door Phone System',
    description: '4-inch color video door phone system with hands-free operation, night vision, two-way audio, and door release function. Complete system with indoor monitor and outdoor camera.',
    short_description: '4-inch video door phone with night vision',
    price: 12500,
    category: 'Security System',
    brand: 'CP Plus',
    hsn_code: '8531',
    features: JSON.stringify([
      '4 Inch Color Display',
      'Hands-Free Operation',
      'Night Vision',
      'Two-Way Audio',
      'Door Release Function',
      'Multiple Unit Support'
    ]),
    specifications: JSON.stringify({
      'Display': '4 Inch Color LCD',
      'Night Vision': 'Built-in IR LEDs',
      'Audio': 'Two-Way Communication',
      'Door Release': '12V Relay Output',
      'Power': '12V DC Adapter',
      'Range': '100 Meters'
    }),
    warranty: '1 Year Manufacturer Warranty',
    seo_title: 'Video Door Phone System - 4 Inch Display',
    seo_description: '4-inch color video door phone system with night vision and door release. Complete security solution.',
    seo_keywords: JSON.stringify(['video door phone', 'door phone', 'intercom', 'security system'])
  },
  {
    name: 'Digital Door Lock',
    description: 'Smart digital door lock with fingerprint, PIN, and card access. Anti-theft features, low battery alert, and emergency key access. Suitable for homes and offices.',
    short_description: 'Smart digital door lock with fingerprint and PIN',
    price: 15000,
    category: 'Security System',
    brand: 'Godrej',
    hsn_code: '8531',
    features: JSON.stringify([
      'Fingerprint Access',
      'PIN Code Access',
      'Card Access',
      'Anti-theft Features',
      'Low Battery Alert',
      'Emergency Key Access'
    ]),
    specifications: JSON.stringify({
      'Access Methods': 'Fingerprint, PIN, Card, Key',
      'Fingerprint Capacity': '100 Users',
      'PIN Capacity': '100 Codes',
      'Battery': '4x AA Batteries',
      'Battery Life': '12 Months',
      'Material': 'Zinc Alloy'
    }),
    warranty: '2 Years Manufacturer Warranty',
    seo_title: 'Digital Door Lock - Fingerprint & PIN Access',
    seo_description: 'Smart digital door lock with fingerprint, PIN, and card access. Anti-theft features included.',
    seo_keywords: JSON.stringify(['digital lock', 'fingerprint lock', 'smart lock', 'door security'])
  },

  // ========== ADDITIONAL CCTV CAMERAS ==========
  {
    name: 'Hikvision 8MP IP Dome Camera',
    description: 'Ultra-high definition 8MP IP dome camera with advanced night vision, wide dynamic range, and intelligent analytics. Perfect for high-security applications.',
    short_description: '8MP IP dome camera with advanced features',
    price: 12000,
    category: 'CCTV Camera',
    brand: 'Hikvision',
    hsn_code: '8528',
    features: JSON.stringify(['8MP Ultra HD', 'Advanced Night Vision', 'WDR Technology', 'Intelligent Analytics', 'Vandal Resistant', 'IP67 Rating']),
    specifications: JSON.stringify({'Resolution': '8MP (3840×2160)', 'Lens': '2.8-12mm Vari-focal', 'Night Vision': '50m IR', 'Weather Rating': 'IP67'}),
    warranty: '3 Years Manufacturer Warranty',
    seo_title: 'Hikvision 8MP IP Dome Camera - Ultra HD',
    seo_description: '8MP IP dome camera with ultra HD resolution and advanced analytics. Best price with warranty.',
    seo_keywords: JSON.stringify(['hikvision', '8mp camera', 'ultra hd', 'dome camera'])
  },
  {
    name: 'Dahua 4MP Wireless Camera',
    description: '4MP wireless WiFi camera with easy installation, mobile app access, and cloud storage support. Perfect for home and small business use.',
    short_description: '4MP wireless WiFi camera with cloud storage',
    price: 4500,
    category: 'Wireless Camera',
    brand: 'Dahua',
    hsn_code: '8528',
    features: JSON.stringify(['4MP HD', 'WiFi Connectivity', 'Mobile App', 'Cloud Storage', 'Night Vision', 'Motion Detection']),
    specifications: JSON.stringify({'Resolution': '4MP', 'Connectivity': 'WiFi 2.4GHz/5GHz', 'Night Vision': '30m', 'Storage': 'Cloud/MicroSD'}),
    warranty: '2 Years Manufacturer Warranty',
    seo_title: 'Dahua 4MP Wireless Camera - WiFi Security',
    seo_description: '4MP wireless WiFi camera with easy installation and cloud storage. Best price available.',
    seo_keywords: JSON.stringify(['wireless camera', 'wifi camera', '4mp', 'dahua'])
  },
  {
    name: 'Axis P3245-LVE Network Camera',
    description: 'Professional Axis network camera with Lightfinder technology, excellent low-light performance, and advanced video analytics.',
    short_description: 'Professional Axis network camera with Lightfinder',
    price: 18000,
    category: 'IP Camera',
    brand: 'Axis',
    hsn_code: '8528',
    features: JSON.stringify(['Lightfinder Technology', 'Excellent Low-Light', 'Advanced Analytics', 'H.265 Compression', 'PoE Support', 'Weather Resistant']),
    specifications: JSON.stringify({'Resolution': '5MP', 'Low-Light': 'Color in 0.1 lux', 'Compression': 'H.265', 'Power': 'PoE'}),
    warranty: '3 Years Manufacturer Warranty',
    seo_title: 'Axis P3245 Network Camera - Professional',
    seo_description: 'Professional Axis network camera with Lightfinder technology. Best price with warranty.',
    seo_keywords: JSON.stringify(['axis camera', 'network camera', 'lightfinder', 'professional'])
  },
  {
    name: 'Samsung 2MP Analog Camera',
    description: 'High-quality 2MP analog CCTV camera with excellent image quality, weather resistance, and easy installation. Compatible with all DVR systems.',
    short_description: '2MP analog camera for DVR systems',
    price: 2800,
    category: 'Analog Camera',
    brand: 'Samsung',
    hsn_code: '8528',
    features: JSON.stringify(['2MP HD', 'Analog Output', 'Weather Resistant', 'Night Vision', 'Wide Dynamic Range', 'Easy Installation']),
    specifications: JSON.stringify({'Resolution': '2MP', 'Output': 'Analog BNC', 'Night Vision': '30m', 'Weather Rating': 'IP66'}),
    warranty: '2 Years Manufacturer Warranty',
    seo_title: 'Samsung 2MP Analog Camera - HD CCTV',
    seo_description: '2MP analog CCTV camera with excellent image quality. Compatible with all DVR systems.',
    seo_keywords: JSON.stringify(['samsung camera', 'analog camera', '2mp', 'cctv'])
  },
  {
    name: 'Xiaomi Mi 360° Security Camera',
    description: 'Smart 360° security camera with pan and tilt, night vision, two-way audio, and AI-powered motion tracking. Perfect for home security.',
    short_description: '360° smart security camera with AI tracking',
    price: 3500,
    category: 'Wireless Camera',
    brand: 'Xiaomi',
    hsn_code: '8528',
    features: JSON.stringify(['360° View', 'AI Motion Tracking', 'Night Vision', 'Two-Way Audio', 'Cloud Storage', 'Mobile App']),
    specifications: JSON.stringify({'Resolution': '2MP', 'View': '360° Pan & Tilt', 'Night Vision': '10m', 'Storage': 'Cloud/MicroSD'}),
    warranty: '1 Year Manufacturer Warranty',
    seo_title: 'Xiaomi Mi 360° Security Camera - Smart Home',
    seo_description: '360° smart security camera with AI tracking and two-way audio. Best price in India.',
    seo_keywords: JSON.stringify(['xiaomi camera', '360 camera', 'smart camera', 'home security'])
  },

  // ========== ADDITIONAL DVRs & NVRs ==========
  {
    name: 'Hikvision 32 Channel NVR',
    description: 'High-performance 32-channel network video recorder with PoE support, 4K recording, and advanced video analytics. Perfect for large installations.',
    short_description: '32-channel NVR with PoE and 4K recording',
    price: 35000,
    category: 'DVR/NVR',
    brand: 'Hikvision',
    hsn_code: '8528',
    features: JSON.stringify(['32 Channels', 'PoE Support', '4K Recording', 'Advanced Analytics', 'Remote Access', 'Mobile App']),
    specifications: JSON.stringify({'Channels': '32', 'PoE Ports': '32', 'Resolution': '4K per Channel', 'Storage': 'Up to 48TB'}),
    warranty: '3 Years Manufacturer Warranty',
    seo_title: 'Hikvision 32 Channel NVR - Large Installation',
    seo_description: '32-channel NVR with PoE support and 4K recording. Perfect for large surveillance systems.',
    seo_keywords: JSON.stringify(['nvr', '32 channel', 'hikvision', 'poe'])
  },
  {
    name: 'CP Plus 4 Channel DVR Kit with 1TB',
    description: 'Complete 4-channel CCTV kit with DVR, 4 HD cameras, 1TB hard disk, cables, and all accessories. Ready to install solution.',
    short_description: 'Complete 4-channel CCTV kit with 1TB HDD',
    price: 15000,
    category: 'CCTV Kit',
    brand: 'CP Plus',
    hsn_code: '8528',
    features: JSON.stringify(['4 Channel DVR', '4 HD Cameras', '1TB HDD', 'All Cables', 'Mobile App', 'Easy Installation']),
    specifications: JSON.stringify({'Channels': '4', 'Cameras': '4x 2MP', 'Storage': '1TB HDD', 'Resolution': '1080P'}),
    warranty: '2 Years Manufacturer Warranty',
    seo_title: 'CP Plus 4 Channel CCTV Kit - Complete Package',
    seo_description: 'Complete 4-channel CCTV kit with cameras, DVR, and 1TB storage. Ready to install.',
    seo_keywords: JSON.stringify(['cctv kit', '4 channel', 'complete package', 'cctv'])
  },
  {
    name: 'Dahua 8 Channel PoE NVR Kit',
    description: 'Complete 8-channel PoE NVR kit with 8 IP cameras, PoE switch, and all accessories. Professional installation solution.',
    short_description: '8-channel PoE NVR kit with IP cameras',
    price: 45000,
    category: 'CCTV Kit',
    brand: 'Dahua',
    hsn_code: '8528',
    features: JSON.stringify(['8 Channel PoE NVR', '8 IP Cameras', 'PoE Switch', 'All Accessories', '4K Support', 'Mobile App']),
    specifications: JSON.stringify({'Channels': '8', 'Cameras': '8x 4MP IP', 'PoE': 'Built-in', 'Resolution': '4K'}),
    warranty: '3 Years Manufacturer Warranty',
    seo_title: 'Dahua 8 Channel PoE NVR Kit - Professional',
    seo_description: 'Complete 8-channel PoE NVR kit with IP cameras. Professional surveillance solution.',
    seo_keywords: JSON.stringify(['poe nvr kit', '8 channel', 'dahua', 'ip cameras'])
  },

  // ========== ADDITIONAL GPS DEVICES ==========
  {
    name: 'Concox GT06 GPS Tracker',
    description: 'Compact GPS tracker with real-time tracking, geofencing, and long battery life. Perfect for personal and vehicle tracking.',
    short_description: 'Compact GPS tracker with real-time tracking',
    price: 2800,
    category: 'GPS Device',
    brand: 'Concox',
    hsn_code: '8526',
    features: JSON.stringify(['Real-time Tracking', 'Geofencing', 'Long Battery', 'Waterproof', 'Mobile App', 'SOS Button']),
    specifications: JSON.stringify({'Battery': '5000mAh', 'Standby': '30 Days', 'GPS Accuracy': '5m', 'Network': '2G/3G/4G'}),
    warranty: '1 Year Manufacturer Warranty',
    seo_title: 'Concox GT06 GPS Tracker - Real-time Tracking',
    seo_description: 'Compact GPS tracker with real-time tracking and geofencing. Best price available.',
    seo_keywords: JSON.stringify(['concox', 'gps tracker', 'real-time tracking', 'vehicle tracker'])
  },
  {
    name: 'Calamp LMU-3030 Fleet Tracker',
    description: 'Advanced fleet GPS tracker with fuel monitoring, driver behavior analysis, and comprehensive fleet management features.',
    short_description: 'Advanced fleet GPS tracker with fuel monitoring',
    price: 12000,
    category: 'GPS Device',
    brand: 'Calamp',
    hsn_code: '8526',
    features: JSON.stringify(['Fleet Management', 'Fuel Monitoring', 'Driver Behavior', 'Route Optimization', 'Real-time Alerts', 'Advanced Reports']),
    specifications: JSON.stringify({'GPS': 'High Precision', 'Fuel Sensor': 'Supported', 'Connectivity': '4G LTE', 'Installation': 'Professional'}),
    warranty: '1 Year Manufacturer Warranty',
    seo_title: 'Calamp LMU-3030 Fleet Tracker - Advanced',
    seo_description: 'Advanced fleet GPS tracker with fuel monitoring and driver behavior analysis.',
    seo_keywords: JSON.stringify(['calamp', 'fleet tracker', 'gps tracking', 'fleet management'])
  },

  // ========== ADDITIONAL ACCESSORIES ==========
  {
    name: '16 Port PoE Switch',
    description: '16-port Power over Ethernet switch for IP camera installations. Supports 802.3af/at PoE standard with 150W total power budget.',
    short_description: '16-port PoE switch for IP cameras',
    price: 8500,
    category: 'PoE Switch',
    brand: 'TP-Link',
    hsn_code: '8528',
    features: JSON.stringify(['16 PoE Ports', '802.3af/at', '150W Power Budget', 'Gigabit Ethernet', 'Auto Detection', 'LED Indicators']),
    specifications: JSON.stringify({'Ports': '16 PoE + 2 Uplink', 'PoE Standard': '802.3af/at', 'Power Budget': '150W', 'Speed': 'Gigabit'}),
    warranty: '3 Years Manufacturer Warranty',
    seo_title: '16 Port PoE Switch - IP Camera Network',
    seo_description: '16-port PoE switch for IP camera installations. Supports 802.3af/at standard.',
    seo_keywords: JSON.stringify(['poe switch', '16 port', 'ip camera', 'network switch'])
  },
  {
    name: '2TB Surveillance Hard Disk',
    description: '2TB surveillance-grade hard disk drive designed for 24/7 DVR/NVR recording. High reliability and performance.',
    short_description: '2TB surveillance HDD for DVR/NVR',
    price: 5500,
    category: 'Hard Disk Drive',
    brand: 'Generic',
    hsn_code: '8528',
    features: JSON.stringify(['2TB Capacity', 'Surveillance Grade', '24/7 Operation', 'High Reliability', 'Low Power', 'Quiet Operation']),
    specifications: JSON.stringify({'Capacity': '2TB', 'Interface': 'SATA 6Gb/s', 'RPM': '7200', 'Cache': '64MB'}),
    warranty: '3 Years Manufacturer Warranty',
    seo_title: '2TB Surveillance Hard Disk - DVR Storage',
    seo_description: '2TB surveillance-grade hard disk for DVR/NVR recording. High reliability and performance.',
    seo_keywords: JSON.stringify(['surveillance hdd', '2tb', 'dvr storage', 'hard disk'])
  },
  {
    name: '4TB Surveillance Hard Disk',
    description: '4TB surveillance-grade hard disk drive for extended recording capacity. Perfect for large installations.',
    short_description: '4TB surveillance HDD for extended recording',
    price: 9500,
    category: 'Hard Disk Drive',
    brand: 'Generic',
    hsn_code: '8528',
    features: JSON.stringify(['4TB Capacity', 'Surveillance Grade', 'Extended Recording', 'High Reliability', '24/7 Operation', 'Low Power']),
    specifications: JSON.stringify({'Capacity': '4TB', 'Interface': 'SATA 6Gb/s', 'RPM': '7200', 'Cache': '128MB'}),
    warranty: '3 Years Manufacturer Warranty',
    seo_title: '4TB Surveillance Hard Disk - Extended Storage',
    seo_description: '4TB surveillance-grade hard disk for extended recording capacity. Best price available.',
    seo_keywords: JSON.stringify(['surveillance hdd', '4tb', 'extended storage', 'hard disk'])
  },

  // ========== ADDITIONAL SECURITY SYSTEMS ==========
  {
    name: 'ZKTeco Access Control System',
    description: 'Complete access control system with card reader, biometric scanner, and controller. Supports up to 10,000 users.',
    short_description: 'Access control system with card and biometric',
    price: 18000,
    category: 'Access Control System',
    brand: 'ZKTeco',
    hsn_code: '8531',
    features: JSON.stringify(['Card Access', 'Biometric Scanner', '10,000 Users', 'Time Attendance', 'Door Lock Control', 'Mobile App']),
    specifications: JSON.stringify({'Users': '10,000', 'Access Methods': 'Card, Fingerprint, PIN', 'Doors': '4', 'Network': 'TCP/IP'}),
    warranty: '2 Years Manufacturer Warranty',
    seo_title: 'ZKTeco Access Control System - Complete',
    seo_description: 'Complete access control system with card reader and biometric scanner. Best price.',
    seo_keywords: JSON.stringify(['access control', 'zkteco', 'biometric', 'card reader'])
  },
  {
    name: 'Wireless Alarm System',
    description: 'Complete wireless alarm system with motion sensors, door/window sensors, and control panel. Easy installation and mobile app control.',
    short_description: 'Wireless alarm system with sensors',
    price: 12000,
    category: 'Alarm System',
    brand: 'Generic',
    hsn_code: '8531',
    features: JSON.stringify(['Wireless Sensors', 'Motion Detection', 'Door/Window Sensors', 'Mobile App', 'Siren', 'Easy Installation']),
    specifications: JSON.stringify({'Sensors': 'Up to 32', 'Range': '100m', 'Battery': 'Long Life', 'Network': 'WiFi'}),
    warranty: '1 Year Manufacturer Warranty',
    seo_title: 'Wireless Alarm System - Home Security',
    seo_description: 'Complete wireless alarm system with motion and door sensors. Easy installation.',
    seo_keywords: JSON.stringify(['alarm system', 'wireless', 'motion sensor', 'home security'])
  },

  // ========== INDIAN BRAND CCTV CAMERAS ==========
  {
    name: 'Realme 2MP WiFi Camera',
    description: 'Affordable 2MP WiFi security camera with mobile app, night vision, and cloud storage. Perfect for home security.',
    short_description: '2MP WiFi camera with mobile app',
    price: 1999,
    category: 'Wireless Camera',
    brand: 'Realme',
    hsn_code: '8528',
    features: JSON.stringify(['2MP HD', 'WiFi Connectivity', 'Mobile App', 'Night Vision', 'Cloud Storage', 'Motion Detection']),
    specifications: JSON.stringify({'Resolution': '2MP', 'Connectivity': 'WiFi', 'Night Vision': '10m', 'Storage': 'Cloud/MicroSD'}),
    warranty: '1 Year Manufacturer Warranty',
    seo_title: 'Realme 2MP WiFi Camera - Affordable Home Security',
    seo_description: 'Affordable 2MP WiFi security camera with mobile app and night vision. Best price in India.',
    seo_keywords: JSON.stringify(['realme camera', 'wifi camera', '2mp', 'home security'])
  },
  {
    name: 'iBall 2MP Dome Camera',
    description: 'Budget-friendly 2MP dome camera with Full HD resolution and night vision. Perfect for small businesses and homes.',
    short_description: 'Budget 2MP dome camera with night vision',
    price: 1500,
    category: 'CCTV Camera',
    brand: 'iBall',
    hsn_code: '8528',
    features: JSON.stringify(['2MP Full HD', 'Night Vision', 'Weather Resistant', 'Easy Installation', 'Mobile App', 'Motion Detection']),
    specifications: JSON.stringify({'Resolution': '2MP (1920×1080)', 'Night Vision': '20m', 'Weather Rating': 'IP65', 'Power': '12V DC'}),
    warranty: '1 Year Manufacturer Warranty',
    seo_title: 'iBall 2MP Dome Camera - Budget Security',
    seo_description: 'Budget-friendly 2MP dome camera with Full HD and night vision. Best price available.',
    seo_keywords: JSON.stringify(['iball camera', 'dome camera', '2mp', 'budget cctv'])
  },
  {
    name: 'Zebronics 4MP Bullet Camera',
    description: '4MP bullet camera with excellent image quality, night vision, and weather resistance. Great value for money.',
    short_description: '4MP bullet camera with night vision',
    price: 3500,
    category: 'CCTV Camera',
    brand: 'Zebronics',
    hsn_code: '8528',
    features: JSON.stringify(['4MP HD', 'Night Vision', 'Weather Resistant IP67', 'Motion Detection', 'Mobile App', 'Easy Installation']),
    specifications: JSON.stringify({'Resolution': '4MP (2560×1440)', 'Night Vision': '30m', 'Weather Rating': 'IP67', 'Power': '12V DC'}),
    warranty: '1 Year Manufacturer Warranty',
    seo_title: 'Zebronics 4MP Bullet Camera - Value for Money',
    seo_description: '4MP bullet camera with excellent image quality and night vision. Great value for money.',
    seo_keywords: JSON.stringify(['zebronics camera', 'bullet camera', '4mp', 'cctv'])
  },
  {
    name: 'Intex 2MP CCTV Kit',
    description: 'Complete 2MP CCTV kit with 4 cameras, 4-channel DVR, 500GB HDD, and all accessories. Ready to install.',
    short_description: 'Complete 2MP CCTV kit with 4 cameras',
    price: 12000,
    category: 'CCTV Kit',
    brand: 'Intex',
    hsn_code: '8528',
    features: JSON.stringify(['4 Channel DVR', '4x 2MP Cameras', '500GB HDD', 'All Cables', 'Mobile App', 'Easy Installation']),
    specifications: JSON.stringify({'Channels': '4', 'Cameras': '4x 2MP', 'Storage': '500GB HDD', 'Resolution': '1080P'}),
    warranty: '1 Year Manufacturer Warranty',
    seo_title: 'Intex 2MP CCTV Kit - Complete Package',
    seo_description: 'Complete 2MP CCTV kit with 4 cameras, DVR, and 500GB storage. Ready to install.',
    seo_keywords: JSON.stringify(['intex cctv kit', '2mp', 'complete package', 'cctv'])
  },

  // ========== JIO SERVICES ==========
  {
    name: 'JioFiber Connection (100 Mbps)',
    description: 'JioFiber 100 Mbps broadband connection with unlimited data, free voice calls, and OTT subscriptions. Installation included.',
    short_description: 'JioFiber 100 Mbps unlimited connection',
    price: 699,
    category: 'Internet Service',
    brand: 'Jio',
    hsn_code: '9983',
    features: JSON.stringify(['100 Mbps Speed', 'Unlimited Data', 'Free Voice Calls', 'OTT Subscriptions', 'Installation Included', '24/7 Support']),
    specifications: JSON.stringify({'Speed': '100 Mbps', 'Data': 'Unlimited', 'Installation': 'Free', 'Contract': 'Monthly'}),
    warranty: 'Service Warranty',
    seo_title: 'JioFiber 100 Mbps - Unlimited Broadband',
    seo_description: 'JioFiber 100 Mbps connection with unlimited data and OTT subscriptions. Best broadband plan.',
    seo_keywords: JSON.stringify(['jiofiber', '100 mbps', 'broadband', 'unlimited'])
  },
  {
    name: 'JioFiber Connection (150 Mbps)',
    description: 'JioFiber 150 Mbps broadband connection with unlimited data, free voice calls, and premium OTT subscriptions.',
    short_description: 'JioFiber 150 Mbps unlimited connection',
    price: 999,
    category: 'Internet Service',
    brand: 'Jio',
    hsn_code: '9983',
    features: JSON.stringify(['150 Mbps Speed', 'Unlimited Data', 'Free Voice Calls', 'Premium OTT', 'Installation Included', '24/7 Support']),
    specifications: JSON.stringify({'Speed': '150 Mbps', 'Data': 'Unlimited', 'Installation': 'Free', 'Contract': 'Monthly'}),
    warranty: 'Service Warranty',
    seo_title: 'JioFiber 150 Mbps - High Speed Broadband',
    seo_description: 'JioFiber 150 Mbps connection with unlimited data and premium OTT. High-speed broadband.',
    seo_keywords: JSON.stringify(['jiofiber', '150 mbps', 'broadband', 'high speed'])
  },
  {
    name: 'JioFiber Connection (300 Mbps)',
    description: 'JioFiber 300 Mbps ultra-fast broadband connection with unlimited data, free voice calls, and all OTT subscriptions.',
    short_description: 'JioFiber 300 Mbps ultra-fast connection',
    price: 1499,
    category: 'Internet Service',
    brand: 'Jio',
    hsn_code: '9983',
    features: JSON.stringify(['300 Mbps Speed', 'Unlimited Data', 'Free Voice Calls', 'All OTT Subscriptions', 'Installation Included', 'Priority Support']),
    specifications: JSON.stringify({'Speed': '300 Mbps', 'Data': 'Unlimited', 'Installation': 'Free', 'Contract': 'Monthly'}),
    warranty: 'Service Warranty',
    seo_title: 'JioFiber 300 Mbps - Ultra Fast Broadband',
    seo_description: 'JioFiber 300 Mbps ultra-fast connection with unlimited data and all OTT subscriptions.',
    seo_keywords: JSON.stringify(['jiofiber', '300 mbps', 'ultra fast', 'broadband'])
  },
  {
    name: 'Jio WiFi Router Installation',
    description: 'Professional Jio WiFi router installation service including setup, configuration, and testing. Includes 1 month support.',
    short_description: 'Jio WiFi router installation and setup',
    price: 500,
    category: 'Installation Service',
    brand: 'Jio',
    hsn_code: '9983',
    features: JSON.stringify(['Router Installation', 'WiFi Setup', 'Configuration', 'Testing', '1 Month Support', 'Professional Service']),
    specifications: JSON.stringify({'Service Type': 'Installation', 'Support': '1 Month', 'Includes': 'Setup & Configuration'}),
    warranty: '1 Month Service Support',
    seo_title: 'Jio WiFi Router Installation - Professional Setup',
    seo_description: 'Professional Jio WiFi router installation and setup service. Expert technicians.',
    seo_keywords: JSON.stringify(['jio wifi', 'router installation', 'wifi setup', 'installation service'])
  },
  {
    name: 'JioFiber Installation Service',
    description: 'Professional JioFiber installation service including fiber cable laying, router setup, and connection testing. Includes 1 month support.',
    short_description: 'JioFiber installation and setup service',
    price: 1000,
    category: 'Installation Service',
    brand: 'Jio',
    hsn_code: '9983',
    features: JSON.stringify(['Fiber Installation', 'Router Setup', 'Connection Testing', 'WiFi Configuration', '1 Month Support', 'Professional Service']),
    specifications: JSON.stringify({'Service Type': 'Installation', 'Support': '1 Month', 'Includes': 'Complete Setup'}),
    warranty: '1 Month Service Support',
    seo_title: 'JioFiber Installation - Professional Service',
    seo_description: 'Professional JioFiber installation service with fiber laying and router setup. Expert service.',
    seo_keywords: JSON.stringify(['jiofiber installation', 'fiber installation', 'broadband setup', 'installation service'])
  },
  {
    name: 'JioFiber Maintenance Service',
    description: 'JioFiber maintenance service including connection checkup, router optimization, speed testing, and troubleshooting.',
    short_description: 'JioFiber maintenance and troubleshooting',
    price: 300,
    category: 'Maintenance Service',
    brand: 'Jio',
    hsn_code: '9987',
    features: JSON.stringify(['Connection Checkup', 'Router Optimization', 'Speed Testing', 'Troubleshooting', 'Performance Tuning', 'Remote Support']),
    specifications: JSON.stringify({'Service Type': 'Maintenance', 'Includes': 'Full Checkup', 'Support': 'Remote & On-site'}),
    warranty: 'Service Contract',
    seo_title: 'JioFiber Maintenance - Connection Checkup',
    seo_description: 'JioFiber maintenance service with connection checkup and troubleshooting. Expert service.',
    seo_keywords: JSON.stringify(['jiofiber maintenance', 'broadband maintenance', 'connection checkup', 'troubleshooting'])
  },
  {
    name: 'Jio WiFi Router Replacement',
    description: 'Jio WiFi router replacement service for damaged or faulty routers. Includes installation and configuration.',
    short_description: 'Jio WiFi router replacement service',
    price: 2000,
    category: 'Installation Service',
    brand: 'Jio',
    hsn_code: '9983',
    features: JSON.stringify(['Router Replacement', 'Installation', 'Configuration', 'Testing', 'Support', 'Professional Service']),
    specifications: JSON.stringify({'Service Type': 'Replacement', 'Includes': 'Router + Installation', 'Support': 'Included'}),
    warranty: 'Service Warranty',
    seo_title: 'Jio WiFi Router Replacement - Professional',
    seo_description: 'Jio WiFi router replacement service with installation and configuration. Expert service.',
    seo_keywords: JSON.stringify(['jio router replacement', 'wifi router', 'replacement service', 'router installation'])
  },

  // ========== IT SUPPORT SERVICES ==========
  {
    name: 'Computer Service Visit Charge',
    description: 'On-site computer service visit charge for diagnosis, repair, and support. Includes travel and basic diagnosis.',
    short_description: 'On-site computer service visit charge',
    price: 300,
    category: 'Visit Charge',
    brand: 'Service',
    hsn_code: '9983',
    features: JSON.stringify(['On-site Visit', 'Travel Included', 'Basic Diagnosis', 'Expert Technician', 'Same Day Service', 'Professional Support']),
    specifications: JSON.stringify({'Service Type': 'Visit Charge', 'Includes': 'Travel + Diagnosis', 'Response': 'Same Day'}),
    warranty: 'Service Warranty',
    seo_title: 'Computer Service Visit Charge - On-site Support',
    seo_description: 'On-site computer service visit charge with expert technician. Same day service available.',
    seo_keywords: JSON.stringify(['computer service', 'visit charge', 'on-site support', 'computer repair'])
  },
  {
    name: 'Windows Installation Service',
    description: 'Professional Windows operating system installation service including OS installation, driver setup, and basic configuration.',
    short_description: 'Windows OS installation and setup',
    price: 800,
    category: 'Software Service',
    brand: 'Microsoft',
    hsn_code: '9983',
    features: JSON.stringify(['Windows Installation', 'Driver Setup', 'Basic Configuration', 'System Optimization', 'Data Backup', 'Professional Service']),
    specifications: JSON.stringify({'Service Type': 'Installation', 'OS': 'Windows 10/11', 'Includes': 'Full Setup'}),
    warranty: 'Service Warranty',
    seo_title: 'Windows Installation Service - Professional Setup',
    seo_description: 'Professional Windows installation service with driver setup and configuration. Expert technicians.',
    seo_keywords: JSON.stringify(['windows installation', 'os installation', 'windows setup', 'computer service'])
  },
  {
    name: 'Antivirus Installation (Norton)',
    description: 'Norton antivirus installation and configuration service. Includes 1 year subscription activation and setup.',
    short_description: 'Norton antivirus installation and setup',
    price: 1200,
    category: 'Software Service',
    brand: 'Norton',
    hsn_code: '9983',
    features: JSON.stringify(['Antivirus Installation', '1 Year Subscription', 'Configuration', 'System Scan', 'Real-time Protection', 'Professional Setup']),
    specifications: JSON.stringify({'Service Type': 'Installation', 'Antivirus': 'Norton', 'Subscription': '1 Year'}),
    warranty: 'Service Warranty',
    seo_title: 'Norton Antivirus Installation - 1 Year Subscription',
    seo_description: 'Norton antivirus installation with 1 year subscription and professional setup. Best protection.',
    seo_keywords: JSON.stringify(['norton antivirus', 'antivirus installation', 'computer security', 'virus protection'])
  },
  {
    name: 'Antivirus Installation (Quick Heal)',
    description: 'Quick Heal antivirus installation and configuration service. Includes 1 year subscription activation and setup.',
    short_description: 'Quick Heal antivirus installation and setup',
    price: 900,
    category: 'Software Service',
    brand: 'Quick Heal',
    hsn_code: '9983',
    features: JSON.stringify(['Antivirus Installation', '1 Year Subscription', 'Configuration', 'System Scan', 'Real-time Protection', 'Indian Brand']),
    specifications: JSON.stringify({'Service Type': 'Installation', 'Antivirus': 'Quick Heal', 'Subscription': '1 Year'}),
    warranty: 'Service Warranty',
    seo_title: 'Quick Heal Antivirus Installation - Indian Brand',
    seo_description: 'Quick Heal antivirus installation with 1 year subscription. Indian brand, best price.',
    seo_keywords: JSON.stringify(['quick heal', 'antivirus installation', 'indian antivirus', 'virus protection'])
  },
  {
    name: 'Antivirus Installation (Kaspersky)',
    description: 'Kaspersky antivirus installation and configuration service. Includes 1 year subscription activation and setup.',
    short_description: 'Kaspersky antivirus installation and setup',
    price: 1500,
    category: 'Software Service',
    brand: 'Kaspersky',
    hsn_code: '9983',
    features: JSON.stringify(['Antivirus Installation', '1 Year Subscription', 'Configuration', 'System Scan', 'Advanced Protection', 'Professional Setup']),
    specifications: JSON.stringify({'Service Type': 'Installation', 'Antivirus': 'Kaspersky', 'Subscription': '1 Year'}),
    warranty: 'Service Warranty',
    seo_title: 'Kaspersky Antivirus Installation - Advanced Protection',
    seo_description: 'Kaspersky antivirus installation with 1 year subscription and advanced protection. Best security.',
    seo_keywords: JSON.stringify(['kaspersky', 'antivirus installation', 'advanced protection', 'computer security'])
  },
  {
    name: 'Computer Hardware Repair',
    description: 'Computer hardware repair service including motherboard, RAM, hard disk, power supply, and other component repairs.',
    short_description: 'Computer hardware repair service',
    price: 500,
    category: 'IT Support Service',
    brand: 'Service',
    hsn_code: '9987',
    features: JSON.stringify(['Hardware Diagnosis', 'Component Repair', 'Replacement Parts', 'Testing', 'Warranty', 'Professional Service']),
    specifications: JSON.stringify({'Service Type': 'Repair', 'Includes': 'Diagnosis + Repair', 'Warranty': '90 Days'}),
    warranty: '90 Days Service Warranty',
    seo_title: 'Computer Hardware Repair - Professional Service',
    seo_description: 'Computer hardware repair service with expert technicians. 90 days warranty on repairs.',
    seo_keywords: JSON.stringify(['computer repair', 'hardware repair', 'pc repair', 'computer service'])
  },
  {
    name: 'Computer Software Troubleshooting',
    description: 'Computer software troubleshooting service including virus removal, system optimization, error fixing, and performance tuning.',
    short_description: 'Software troubleshooting and optimization',
    price: 400,
    category: 'IT Support Service',
    brand: 'Service',
    hsn_code: '9987',
    features: JSON.stringify(['Virus Removal', 'System Optimization', 'Error Fixing', 'Performance Tuning', 'Data Recovery', 'Professional Service']),
    specifications: JSON.stringify({'Service Type': 'Troubleshooting', 'Includes': 'Full System Check', 'Support': 'Remote & On-site'}),
    warranty: 'Service Warranty',
    seo_title: 'Computer Software Troubleshooting - Expert Service',
    seo_description: 'Computer software troubleshooting with virus removal and system optimization. Expert technicians.',
    seo_keywords: JSON.stringify(['software troubleshooting', 'virus removal', 'system optimization', 'computer repair'])
  },
  {
    name: 'Network Setup Service',
    description: 'Network setup service including router configuration, WiFi setup, network troubleshooting, and optimization.',
    short_description: 'Network setup and WiFi configuration',
    price: 600,
    category: 'Network Setup',
    brand: 'Service',
    hsn_code: '9983',
    features: JSON.stringify(['Router Configuration', 'WiFi Setup', 'Network Troubleshooting', 'Optimization', 'Security Setup', 'Professional Service']),
    specifications: JSON.stringify({'Service Type': 'Setup', 'Includes': 'Complete Network Setup', 'Support': 'Included'}),
    warranty: 'Service Warranty',
    seo_title: 'Network Setup Service - WiFi Configuration',
    seo_description: 'Network setup service with router configuration and WiFi setup. Expert technicians.',
    seo_keywords: JSON.stringify(['network setup', 'wifi setup', 'router configuration', 'network service'])
  },
  {
    name: 'Office 365 Installation',
    description: 'Microsoft Office 365 installation and configuration service. Includes subscription activation and setup.',
    short_description: 'Office 365 installation and setup',
    price: 1000,
    category: 'Software Service',
    brand: 'Microsoft',
    hsn_code: '9983',
    features: JSON.stringify(['Office 365 Installation', 'Subscription Activation', 'Configuration', 'Email Setup', 'Cloud Setup', 'Professional Service']),
    specifications: JSON.stringify({'Service Type': 'Installation', 'Software': 'Office 365', 'Includes': 'Full Setup'}),
    warranty: 'Service Warranty',
    seo_title: 'Office 365 Installation - Professional Setup',
    seo_description: 'Office 365 installation and configuration service with subscription activation. Expert setup.',
    seo_keywords: JSON.stringify(['office 365', 'microsoft office', 'office installation', 'software service'])
  },
  {
    name: 'Data Recovery Service',
    description: 'Professional data recovery service for deleted files, formatted drives, and corrupted data. High success rate.',
    short_description: 'Professional data recovery service',
    price: 2000,
    category: 'IT Support Service',
    brand: 'Service',
    hsn_code: '9987',
    features: JSON.stringify(['Data Recovery', 'Deleted Files', 'Formatted Drives', 'Corrupted Data', 'High Success Rate', 'Professional Service']),
    specifications: JSON.stringify({'Service Type': 'Data Recovery', 'Success Rate': 'High', 'Support': 'Expert Technicians'}),
    warranty: 'Service Warranty',
    seo_title: 'Data Recovery Service - Professional Recovery',
    seo_description: 'Professional data recovery service for deleted files and corrupted data. High success rate.',
    seo_keywords: JSON.stringify(['data recovery', 'file recovery', 'deleted files', 'data rescue'])
  },
  {
    name: 'Computer Format & Reinstall',
    description: 'Complete computer format and reinstall service including data backup, OS installation, driver setup, and software installation.',
    short_description: 'Computer format and reinstall service',
    price: 1200,
    category: 'IT Support Service',
    brand: 'Service',
    hsn_code: '9987',
    features: JSON.stringify(['Data Backup', 'Format & Reinstall', 'OS Installation', 'Driver Setup', 'Software Installation', 'Professional Service']),
    specifications: JSON.stringify({'Service Type': 'Format & Reinstall', 'Includes': 'Complete Setup', 'Data Backup': 'Included'}),
    warranty: 'Service Warranty',
    seo_title: 'Computer Format & Reinstall - Complete Service',
    seo_description: 'Complete computer format and reinstall service with data backup. Expert technicians.',
    seo_keywords: JSON.stringify(['computer format', 'reinstall', 'os reinstall', 'computer service'])
  },
  {
    name: 'Laptop Screen Replacement',
    description: 'Laptop screen replacement service for all brands. Includes screen replacement, testing, and warranty.',
    short_description: 'Laptop screen replacement service',
    price: 2500,
    category: 'IT Support Service',
    brand: 'Service',
    hsn_code: '9987',
    features: JSON.stringify(['Screen Replacement', 'All Brands', 'Original Parts', 'Testing', 'Warranty', 'Professional Service']),
    specifications: JSON.stringify({'Service Type': 'Replacement', 'Warranty': '90 Days', 'Parts': 'Original/Compatible'}),
    warranty: '90 Days Service Warranty',
    seo_title: 'Laptop Screen Replacement - All Brands',
    seo_description: 'Laptop screen replacement service for all brands with warranty. Expert technicians.',
    seo_keywords: JSON.stringify(['laptop screen', 'screen replacement', 'laptop repair', 'display replacement'])
  },
  {
    name: 'Printer Setup & Configuration',
    description: 'Printer setup and configuration service including installation, driver setup, network configuration, and testing.',
    short_description: 'Printer setup and configuration',
    price: 400,
    category: 'IT Support Service',
    brand: 'Service',
    hsn_code: '9983',
    features: JSON.stringify(['Printer Installation', 'Driver Setup', 'Network Configuration', 'Testing', 'Troubleshooting', 'Professional Service']),
    specifications: JSON.stringify({'Service Type': 'Setup', 'Includes': 'Complete Configuration', 'Support': 'Included'}),
    warranty: 'Service Warranty',
    seo_title: 'Printer Setup & Configuration - Professional',
    seo_description: 'Printer setup and configuration service with driver installation and network setup. Expert service.',
    seo_keywords: JSON.stringify(['printer setup', 'printer installation', 'printer configuration', 'it service'])
  },

  // ========== ADDITIONAL INDIAN BRAND PRODUCTS ==========
  {
    name: 'Realme 4MP WiFi Camera Pro',
    description: 'Advanced 4MP WiFi security camera with AI motion detection, two-way audio, and cloud storage. Perfect for home and office.',
    short_description: '4MP WiFi camera with AI detection',
    price: 2999,
    category: 'Wireless Camera',
    brand: 'Realme',
    hsn_code: '8528',
    features: JSON.stringify(['4MP HD', 'AI Motion Detection', 'Two-Way Audio', 'Cloud Storage', 'Night Vision', 'Mobile App']),
    specifications: JSON.stringify({'Resolution': '4MP', 'AI Features': 'Motion Detection', 'Audio': 'Two-Way', 'Storage': 'Cloud/MicroSD'}),
    warranty: '1 Year Manufacturer Warranty',
    seo_title: 'Realme 4MP WiFi Camera Pro - AI Detection',
    seo_description: 'Advanced 4MP WiFi camera with AI motion detection and two-way audio. Best price in India.',
    seo_keywords: JSON.stringify(['realme camera', '4mp wifi', 'ai camera', 'home security'])
  },
  {
    name: 'iBall 4 Channel DVR Kit',
    description: 'Complete 4-channel CCTV kit with DVR, 4 cameras, 500GB HDD, and all accessories. Budget-friendly solution.',
    short_description: 'Complete 4-channel CCTV kit budget',
    price: 10000,
    category: 'CCTV Kit',
    brand: 'iBall',
    hsn_code: '8528',
    features: JSON.stringify(['4 Channel DVR', '4 Cameras', '500GB HDD', 'All Cables', 'Mobile App', 'Budget Friendly']),
    specifications: JSON.stringify({'Channels': '4', 'Cameras': '4x 2MP', 'Storage': '500GB', 'Resolution': '1080P'}),
    warranty: '1 Year Manufacturer Warranty',
    seo_title: 'iBall 4 Channel CCTV Kit - Budget Package',
    seo_description: 'Complete 4-channel CCTV kit with cameras and DVR. Budget-friendly solution.',
    seo_keywords: JSON.stringify(['iball cctv kit', '4 channel', 'budget cctv', 'complete package'])
  },
  {
    name: 'Zebronics 8 Channel DVR',
    description: '8-channel DVR with 1080P recording, mobile app access, and remote viewing. Great value for money.',
    short_description: '8-channel DVR with mobile app',
    price: 8000,
    category: 'DVR/NVR',
    brand: 'Zebronics',
    hsn_code: '8528',
    features: JSON.stringify(['8 Channels', '1080P Recording', 'Mobile App', 'Remote Viewing', 'H.264 Compression', 'HDMI Output']),
    specifications: JSON.stringify({'Channels': '8', 'Resolution': '1080P', 'Storage': 'Up to 4TB', 'Compression': 'H.264'}),
    warranty: '1 Year Manufacturer Warranty',
    seo_title: 'Zebronics 8 Channel DVR - Value for Money',
    seo_description: '8-channel DVR with 1080P recording and mobile app. Great value for money.',
    seo_keywords: JSON.stringify(['zebronics dvr', '8 channel', 'dvr', 'cctv recorder'])
  },

  // ========== ADDITIONAL JIO SERVICES ==========
  {
    name: 'JioFiber Connection (500 Mbps)',
    description: 'JioFiber 500 Mbps ultra-fast broadband connection with unlimited data, free voice calls, and all premium OTT subscriptions.',
    short_description: 'JioFiber 500 Mbps ultra-fast connection',
    price: 2499,
    category: 'Internet Service',
    brand: 'Jio',
    hsn_code: '9983',
    features: JSON.stringify(['500 Mbps Speed', 'Unlimited Data', 'Free Voice Calls', 'All Premium OTT', 'Installation Included', 'Priority Support']),
    specifications: JSON.stringify({'Speed': '500 Mbps', 'Data': 'Unlimited', 'Installation': 'Free', 'Contract': 'Monthly'}),
    warranty: 'Service Warranty',
    seo_title: 'JioFiber 500 Mbps - Ultra Fast Broadband',
    seo_description: 'JioFiber 500 Mbps ultra-fast connection with unlimited data and all premium OTT.',
    seo_keywords: JSON.stringify(['jiofiber', '500 mbps', 'ultra fast', 'broadband'])
  },
  {
    name: 'JioFiber Connection (1 Gbps)',
    description: 'JioFiber 1 Gbps gigabit broadband connection with unlimited data, free voice calls, and all premium services.',
    short_description: 'JioFiber 1 Gbps gigabit connection',
    price: 3999,
    category: 'Internet Service',
    brand: 'Jio',
    hsn_code: '9983',
    features: JSON.stringify(['1 Gbps Speed', 'Unlimited Data', 'Free Voice Calls', 'All Premium Services', 'Installation Included', 'VIP Support']),
    specifications: JSON.stringify({'Speed': '1 Gbps', 'Data': 'Unlimited', 'Installation': 'Free', 'Contract': 'Monthly'}),
    warranty: 'Service Warranty',
    seo_title: 'JioFiber 1 Gbps - Gigabit Broadband',
    seo_description: 'JioFiber 1 Gbps gigabit connection with unlimited data and all premium services.',
    seo_keywords: JSON.stringify(['jiofiber', '1 gbps', 'gigabit', 'broadband'])
  },
  {
    name: 'Jio WiFi Extender Setup',
    description: 'Jio WiFi extender setup service for extending WiFi coverage. Includes installation, configuration, and testing.',
    short_description: 'Jio WiFi extender setup service',
    price: 400,
    category: 'Installation Service',
    brand: 'Jio',
    hsn_code: '9983',
    features: JSON.stringify(['WiFi Extender Setup', 'Coverage Extension', 'Configuration', 'Testing', 'Support', 'Professional Service']),
    specifications: JSON.stringify({'Service Type': 'Setup', 'Includes': 'Installation & Configuration', 'Support': 'Included'}),
    warranty: 'Service Warranty',
    seo_title: 'Jio WiFi Extender Setup - Coverage Extension',
    seo_description: 'Jio WiFi extender setup service for extending WiFi coverage. Expert installation.',
    seo_keywords: JSON.stringify(['jio wifi extender', 'wifi extender setup', 'wifi coverage', 'installation'])
  },
  {
    name: 'JioFiber Speed Upgrade Service',
    description: 'JioFiber speed upgrade service for existing connections. Includes plan upgrade and speed optimization.',
    short_description: 'JioFiber speed upgrade service',
    price: 200,
    category: 'Maintenance Service',
    brand: 'Jio',
    hsn_code: '9987',
    features: JSON.stringify(['Plan Upgrade', 'Speed Optimization', 'Configuration', 'Testing', 'Support', 'Professional Service']),
    specifications: JSON.stringify({'Service Type': 'Upgrade', 'Includes': 'Plan Change & Optimization', 'Support': 'Included'}),
    warranty: 'Service Warranty',
    seo_title: 'JioFiber Speed Upgrade - Plan Upgrade',
    seo_description: 'JioFiber speed upgrade service with plan upgrade and speed optimization. Expert service.',
    seo_keywords: JSON.stringify(['jiofiber upgrade', 'speed upgrade', 'plan upgrade', 'broadband upgrade'])
  },

  // ========== ADDITIONAL IT SERVICES ==========
  {
    name: 'IT Support Visit Charge (Urgent)',
    description: 'Urgent on-site IT support visit charge with same-day service. Includes travel and priority diagnosis.',
    short_description: 'Urgent IT support visit charge',
    price: 500,
    category: 'Visit Charge',
    brand: 'Service',
    hsn_code: '9983',
    features: JSON.stringify(['Urgent Service', 'Same Day', 'Priority Support', 'Travel Included', 'Expert Technician', 'Professional Service']),
    specifications: JSON.stringify({'Service Type': 'Urgent Visit', 'Response': 'Same Day', 'Includes': 'Travel + Priority Diagnosis'}),
    warranty: 'Service Warranty',
    seo_title: 'IT Support Visit Charge - Urgent Service',
    seo_description: 'Urgent IT support visit charge with same-day service. Priority support available.',
    seo_keywords: JSON.stringify(['it support', 'urgent service', 'same day', 'visit charge'])
  },
  {
    name: 'Windows 11 Upgrade Service',
    description: 'Windows 11 upgrade service from Windows 10. Includes backup, upgrade, driver installation, and optimization.',
    short_description: 'Windows 11 upgrade service',
    price: 1000,
    category: 'Software Service',
    brand: 'Microsoft',
    hsn_code: '9983',
    features: JSON.stringify(['Windows 11 Upgrade', 'Data Backup', 'Driver Installation', 'System Optimization', 'Configuration', 'Professional Service']),
    specifications: JSON.stringify({'Service Type': 'Upgrade', 'OS': 'Windows 11', 'Includes': 'Complete Upgrade'}),
    warranty: 'Service Warranty',
    seo_title: 'Windows 11 Upgrade Service - Professional',
    seo_description: 'Windows 11 upgrade service with backup and optimization. Expert technicians.',
    seo_keywords: JSON.stringify(['windows 11', 'upgrade service', 'os upgrade', 'computer service'])
  },
  {
    name: 'Laptop Cleaning Service',
    description: 'Professional laptop cleaning service including internal cleaning, thermal paste replacement, and performance optimization.',
    short_description: 'Professional laptop cleaning service',
    price: 600,
    category: 'IT Support Service',
    brand: 'Service',
    hsn_code: '9987',
    features: JSON.stringify(['Internal Cleaning', 'Thermal Paste Replacement', 'Performance Optimization', 'Dust Removal', 'Testing', 'Professional Service']),
    specifications: JSON.stringify({'Service Type': 'Cleaning', 'Includes': 'Complete Cleaning', 'Warranty': '30 Days'}),
    warranty: '30 Days Service Warranty',
    seo_title: 'Laptop Cleaning Service - Professional',
    seo_description: 'Professional laptop cleaning service with thermal paste replacement. Expert service.',
    seo_keywords: JSON.stringify(['laptop cleaning', 'laptop service', 'thermal paste', 'laptop maintenance'])
  },
  {
    name: 'Email Setup Service',
    description: 'Email setup service for Outlook, Gmail, and other email clients. Includes configuration and testing.',
    short_description: 'Email setup and configuration',
    price: 300,
    category: 'IT Support Service',
    brand: 'Service',
    hsn_code: '9983',
    features: JSON.stringify(['Email Configuration', 'Multiple Clients', 'Testing', 'Troubleshooting', 'Support', 'Professional Service']),
    specifications: JSON.stringify({'Service Type': 'Setup', 'Includes': 'Configuration & Testing', 'Support': 'Included'}),
    warranty: 'Service Warranty',
    seo_title: 'Email Setup Service - Professional',
    seo_description: 'Email setup service for Outlook, Gmail, and other clients. Expert configuration.',
    seo_keywords: JSON.stringify(['email setup', 'outlook setup', 'gmail setup', 'email configuration'])
  },
  {
    name: 'Computer RAM Upgrade',
    description: 'Computer RAM upgrade service including RAM installation, testing, and optimization. All brands supported.',
    short_description: 'Computer RAM upgrade service',
    price: 800,
    category: 'IT Support Service',
    brand: 'Service',
    hsn_code: '9987',
    features: JSON.stringify(['RAM Installation', 'All Brands', 'Testing', 'Optimization', 'Warranty', 'Professional Service']),
    specifications: JSON.stringify({'Service Type': 'Upgrade', 'Includes': 'RAM + Installation', 'Warranty': '90 Days'}),
    warranty: '90 Days Service Warranty',
    seo_title: 'Computer RAM Upgrade - All Brands',
    seo_description: 'Computer RAM upgrade service with installation and testing. All brands supported.',
    seo_keywords: JSON.stringify(['ram upgrade', 'computer upgrade', 'memory upgrade', 'it service'])
  },
  {
    name: 'SSD Installation Service',
    description: 'SSD installation service including SSD installation, OS migration, and performance optimization.',
    short_description: 'SSD installation and OS migration',
    price: 1500,
    category: 'IT Support Service',
    brand: 'Service',
    hsn_code: '9987',
    features: JSON.stringify(['SSD Installation', 'OS Migration', 'Data Transfer', 'Performance Optimization', 'Testing', 'Professional Service']),
    specifications: JSON.stringify({'Service Type': 'Installation', 'Includes': 'SSD + OS Migration', 'Warranty': '90 Days'}),
    warranty: '90 Days Service Warranty',
    seo_title: 'SSD Installation Service - OS Migration',
    seo_description: 'SSD installation service with OS migration and performance optimization. Expert service.',
    seo_keywords: JSON.stringify(['ssd installation', 'ssd upgrade', 'os migration', 'computer upgrade'])
  },
  {
    name: 'WiFi Password Reset Service',
    description: 'WiFi password reset and router configuration service. Includes password change and device reconnection.',
    short_description: 'WiFi password reset service',
    price: 250,
    category: 'IT Support Service',
    brand: 'Service',
    hsn_code: '9983',
    features: JSON.stringify(['Password Reset', 'Router Configuration', 'Device Reconnection', 'Testing', 'Support', 'Quick Service']),
    specifications: JSON.stringify({'Service Type': 'Configuration', 'Includes': 'Password Reset & Setup', 'Response': 'Quick'}),
    warranty: 'Service Warranty',
    seo_title: 'WiFi Password Reset Service - Quick',
    seo_description: 'WiFi password reset and router configuration service. Quick and professional.',
    seo_keywords: JSON.stringify(['wifi password', 'password reset', 'router configuration', 'wifi service'])
  },
  {
    name: 'Computer Virus Removal',
    description: 'Professional computer virus removal service including deep scan, malware removal, and system protection setup.',
    short_description: 'Professional virus removal service',
    price: 500,
    category: 'IT Support Service',
    brand: 'Service',
    hsn_code: '9987',
    features: JSON.stringify(['Deep Scan', 'Virus Removal', 'Malware Removal', 'System Protection', 'Optimization', 'Professional Service']),
    specifications: JSON.stringify({'Service Type': 'Virus Removal', 'Includes': 'Complete Cleanup', 'Warranty': '30 Days'}),
    warranty: '30 Days Service Warranty',
    seo_title: 'Computer Virus Removal - Professional',
    seo_description: 'Professional virus removal service with deep scan and malware removal. Expert service.',
    seo_keywords: JSON.stringify(['virus removal', 'malware removal', 'computer cleaning', 'virus scan'])
  },
  {
    name: 'Home Network Setup',
    description: 'Complete home network setup service including router configuration, WiFi setup, device connection, and optimization.',
    short_description: 'Complete home network setup',
    price: 700,
    category: 'Network Setup',
    brand: 'Service',
    hsn_code: '9983',
    features: JSON.stringify(['Router Setup', 'WiFi Configuration', 'Device Connection', 'Network Optimization', 'Security Setup', 'Professional Service']),
    specifications: JSON.stringify({'Service Type': 'Network Setup', 'Includes': 'Complete Setup', 'Support': 'Included'}),
    warranty: 'Service Warranty',
    seo_title: 'Home Network Setup - Complete Service',
    seo_description: 'Complete home network setup with router and WiFi configuration. Expert service.',
    seo_keywords: JSON.stringify(['home network', 'network setup', 'wifi setup', 'router setup'])
  },
  {
    name: 'Office Network Setup',
    description: 'Professional office network setup service including multiple access points, network security, and device management.',
    short_description: 'Professional office network setup',
    price: 2000,
    category: 'Network Setup',
    brand: 'Service',
    hsn_code: '9983',
    features: JSON.stringify(['Multiple Access Points', 'Network Security', 'Device Management', 'Optimization', 'Documentation', 'Professional Service']),
    specifications: JSON.stringify({'Service Type': 'Office Setup', 'Includes': 'Complete Network Setup', 'Support': '1 Month'}),
    warranty: '1 Month Service Support',
    seo_title: 'Office Network Setup - Professional',
    seo_description: 'Professional office network setup with multiple access points and security. Expert service.',
    seo_keywords: JSON.stringify(['office network', 'network setup', 'business network', 'network service'])
  }
];

async function getCategoryId(pool, categoryName) {
  // First try to find by name
  const [byName] = await pool.execute(
    'SELECT id, slug FROM categories WHERE name = ? AND is_active = 1',
    [categoryName]
  );
  if (byName.length > 0) {
    return byName[0].id; // Return ID for reference, but we'll store slug/name
  }
  
  // Try to find by slug
  const slug = generateSlug(categoryName);
  const [bySlug] = await pool.execute(
    'SELECT id, slug FROM categories WHERE slug = ? AND is_active = 1',
    [slug]
  );
  if (bySlug.length > 0) {
    return bySlug[0].id;
  }
  
  // If not found, return the name as fallback (for backward compatibility)
  console.warn(`[Product Seed] ⚠ Category not found in masters: ${categoryName}, using name as fallback`);
  return categoryName;
}

async function getBrandId(pool, brandName) {
  // First try to find by name
  const [byName] = await pool.execute(
    'SELECT id, slug FROM brands WHERE name = ? AND is_active = 1',
    [brandName]
  );
  if (byName.length > 0) {
    return byName[0].id; // Return ID for reference, but we'll store slug/name
  }
  
  // Try to find by slug
  const slug = generateSlug(brandName);
  const [bySlug] = await pool.execute(
    'SELECT id, slug FROM brands WHERE slug = ? AND is_active = 1',
    [slug]
  );
  if (bySlug.length > 0) {
    return bySlug[0].id;
  }
  
  // If not found, return the name as fallback (for backward compatibility)
  console.warn(`[Product Seed] ⚠ Brand not found in masters: ${brandName}, using name as fallback`);
  return brandName;
}

async function seedProducts() {
  try {
    console.log('[Product Seed] Initializing database...');
    await initDatabase();
    const pool = getPool();

    // Ensure masters are seeded first
    console.log('[Product Seed] Ensuring master data (categories and brands) exists...');
    try {
      await seedMasters();
    } catch (error) {
      console.warn('[Product Seed] ⚠ Master seeding had issues, continuing anyway...');
    }

    console.log(`\n[Product Seed] Seeding ${products.length} products...`);

    let added = 0;
    let updated = 0;
    let skipped = 0;
    let errors = 0;

    for (const product of products) {
      const id = uuidv4();
      const slug = generateSlug(product.name);

      try {
        // Check if product already exists
        const [existing] = await pool.execute(
          'SELECT id, hsn_code FROM products WHERE slug = ? OR name = ?',
          [slug, product.name]
        );

        // Get category and brand from masters (use name/slug for storage as per current schema)
        const categoryRef = await getCategoryId(pool, product.category);
        const brandRef = await getBrandId(pool, product.brand);
        
        // Use the name from masters if found, otherwise use the provided name
        let categoryValue = product.category;
        let brandValue = product.brand;
        
        if (typeof categoryRef === 'string' && categoryRef !== product.category) {
          // It's an ID, get the name
          const [catRow] = await pool.execute('SELECT name FROM categories WHERE id = ?', [categoryRef]);
          if (catRow.length > 0) {
            categoryValue = catRow[0].name;
          }
        }
        
        if (typeof brandRef === 'string' && brandRef !== product.brand) {
          // It's an ID, get the name
          const [brandRow] = await pool.execute('SELECT name FROM brands WHERE id = ?', [brandRef]);
          if (brandRow.length > 0) {
            brandValue = brandRow[0].name;
          }
        }

        if (existing.length > 0) {
          // Product exists - update HSN code if missing
          const existingProduct = existing[0];
          if (!existingProduct.hsn_code && product.hsn_code) {
            await pool.execute(
              'UPDATE products SET hsn_code = ?, category = ?, brand = ? WHERE id = ?',
              [product.hsn_code, categoryValue, brandValue, existingProduct.id]
            );
            console.log(`[Product Seed] ↻ Updated HSN: ${product.name} → HSN: ${product.hsn_code}`);
            updated++;
          } else {
            console.log(`[Product Seed] ⊗ Skipped (exists): ${product.name}`);
            skipped++;
          }
        } else {
          // New product - insert
          await pool.execute(
            `INSERT INTO products (id, name, slug, description, short_description, price, category, 
             brand, hsn_code, features, specifications, warranty, seo_title, seo_description, seo_keywords, is_active)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              id,
              product.name,
              slug,
              product.description,
              product.short_description,
              product.price,
              categoryValue, // Use name from master
              brandValue,    // Use name from master
              product.hsn_code || null,
              product.features,
              product.specifications,
              product.warranty,
              product.seo_title,
              product.seo_description,
              product.seo_keywords,
              true
            ]
          );
          console.log(`[Product Seed] ✓ Added: ${product.name} (Category: ${categoryValue}, Brand: ${brandValue}, HSN: ${product.hsn_code || 'N/A'})`);
          added++;
        }
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          console.log(`[Product Seed] ⊗ Skipped (duplicate): ${product.name}`);
          skipped++;
        } else {
          console.error(`[Product Seed] ✗ Error adding ${product.name}:`, error.message);
          errors++;
        }
      }
    }

    console.log('\n[Product Seed] ✓ Product seeding completed!');
    console.log(`[Product Seed] Added: ${added}`);
    console.log(`[Product Seed] Updated: ${updated}`);
    console.log(`[Product Seed] Skipped: ${skipped}`);
    console.log(`[Product Seed] Errors: ${errors}`);
    process.exit(0);
  } catch (error) {
    console.error('[Product Seed] ✗ Seeding failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  seedProducts();
}

module.exports = { seedProducts };








