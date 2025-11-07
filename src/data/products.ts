import { Product } from '../types/catalog';
import { generateSlug } from '../utils/seo';

export const products: Product[] = [
  {
    id: '1',
    name: 'HD IP Camera 4MP',
    slug: generateSlug('HD IP Camera 4MP'),
    description: 'High-definition IP camera with night vision and motion detection capabilities.',
    price: 8500,
    originalPrice: 10000,
    images: ['/api/placeholder/300/200'],
    category: 'cctv',
    brand: 'Hikvision',
    model: 'DS-2CD2143G0-I',
    inStock: true,
    stockQuantity: 15,
    rating: 4.8,
    reviews: 24,
    features: [
      '4MP HD Resolution',
      'Night Vision up to 30m',
      'Motion Detection',
      'Weather Resistant',
      'Mobile App Support'
    ],
    specifications: {
      Resolution: '4MP (2560×1440)',
      Lens: '2.8mm Fixed',
      'Night Vision': '30m IR Range',
      Storage: 'MicroSD up to 128GB',
      Power: '12V DC / PoE'
    },
    warranty: '2 Years Manufacturer Warranty'
  },
  {
    id: '2',
    name: 'GPS Tracker with SIM',
    slug: generateSlug('GPS Tracker with SIM'),
    description: 'Real-time GPS tracking device with built-in SIM card and long battery life.',
    price: 4500,
    originalPrice: 5500,
    images: ['/api/placeholder/300/200'],
    category: 'gps',
    brand: 'Queclink',
    model: 'GV300',
    inStock: true,
    stockQuantity: 8,
    rating: 4.6,
    reviews: 18,
    features: [
      'Real-time Tracking',
      'Geofencing',
      'SOS Button',
      'Long Battery Life',
      'Waterproof Design'
    ],
    specifications: {
      Battery: '5000mAh',
      'Standby Time': '30 Days',
      'GPS Accuracy': '3-5 meters',
      Network: '2G/3G/4G',
      'Operating Temperature': '-20°C to +70°C'
    }
  },
  {
    id: '3',
    name: 'DVR 8 Channel',
    slug: generateSlug('DVR 8 Channel'),
    description: '8-channel digital video recorder with H.264 compression and remote access.',
    price: 12000,
    originalPrice: 15000,
    images: ['/api/placeholder/300/200'],
    category: 'cctv',
    brand: 'Dahua',
    model: 'DHI-NVR2108-8P-4KS2',
    inStock: true,
    stockQuantity: 5,
    rating: 4.7,
    reviews: 12,
    features: [
      '8 Channel Recording',
      '4K Resolution Support',
      'H.264 Compression',
      'Remote Access',
      'Mobile App'
    ],
    specifications: {
      Channels: '8',
      Resolution: '4K (3840×2160)',
      Storage: 'Up to 6TB HDD',
      Compression: 'H.264/H.265',
      Network: 'Gigabit Ethernet'
    }
  },
  {
    id: '4',
    name: 'Maintenance Kit Pro',
    slug: generateSlug('Maintenance Kit Pro'),
    description: 'Professional maintenance kit for CCTV and GPS equipment cleaning and calibration.',
    price: 2500,
    originalPrice: 3000,
    images: ['/api/placeholder/300/200'],
    category: 'maintenance',
    brand: 'TechCare',
    model: 'TC-MK-001',
    inStock: true,
    stockQuantity: 20,
    rating: 4.5,
    reviews: 8,
    features: [
      'Professional Tools',
      'Cleaning Solutions',
      'Calibration Equipment',
      'Protective Gear',
      'Instruction Manual'
    ],
    specifications: {
      Tools: '15 Professional Tools',
      'Cleaning Kit': 'Complete Set',
      Calibration: 'Digital Tools',
      Warranty: '1 Year',
      Weight: '2.5 kg'
    }
  },
  {
    id: '5',
    name: 'Wireless Camera System',
    slug: generateSlug('Wireless Camera System'),
    description: 'Complete wireless camera system with 4 cameras and NVR for easy installation.',
    price: 25000,
    originalPrice: 30000,
    images: ['/api/placeholder/300/200'],
    category: 'cctv',
    brand: 'Ezviz',
    model: 'C6N-4PK',
    inStock: false,
    stockQuantity: 0,
    rating: 4.9,
    reviews: 31,
    features: [
      '4 Wireless Cameras',
      '1080p HD Recording',
      'Night Vision',
      'Mobile App',
      'Cloud Storage'
    ],
    specifications: {
      Cameras: '4 Units',
      Resolution: '1080p',
      Range: '100m Wireless',
      Storage: '1TB HDD',
      Power: 'AC Adapter'
    }
  },
  {
    id: '6',
    name: 'Fleet GPS Tracker',
    slug: generateSlug('Fleet GPS Tracker'),
    description: 'Advanced fleet tracking device with fuel monitoring and driver behavior analysis.',
    price: 8500,
    originalPrice: 10000,
    images: ['/api/placeholder/300/200'],
    category: 'gps',
    brand: 'Teltonika',
    model: 'FMB920',
    inStock: true,
    stockQuantity: 3,
    rating: 4.8,
    reviews: 15,
    features: [
      'Fleet Management',
      'Fuel Monitoring',
      'Driver Behavior',
      'Route Optimization',
      'Real-time Alerts'
    ],
    specifications: {
      GPS: 'High Precision',
      'Fuel Sensor': 'Built-in',
      Connectivity: '4G LTE',
      Battery: 'Backup Battery',
      Installation: 'Professional'
    }
  },
  {
    id: '7',
    name: 'CP Plus Bullet CCTV Camera',
    slug: generateSlug('CP Plus Bullet CCTV Camera'),
    description: 'Professional bullet-style CCTV camera with IR night vision and weather-resistant design.',
    price: 2999,
    originalPrice: 3600,
    images: ['/api/placeholder/300/200'],
    category: 'cctv',
    brand: 'CP Plus',
    model: 'CP-VCG-T13L3',
    inStock: true,
    stockQuantity: 12,
    rating: 3.8,
    reviews: 13,
    features: [
      '1.3 MP HD Resolution',
      '20m IR Night Vision',
      'Weather Resistant IP66',
      'Wide Dynamic Range',
      'Motion Detection'
    ],
    specifications: {
      Resolution: '1.3 MP (1280×960)',
      Lens: '3.6mm Fixed',
      'Night Vision': '20m IR Range',
      'Weather Rating': 'IP66',
      Power: '12V DC'
    },
    warranty: '2 Years Manufacturer Warranty'
  },
  {
    id: '8',
    name: 'CP Plus Dome CCTV Camera',
    slug: generateSlug('CP Plus Dome CCTV Camera'),
    description: 'Compact dome camera with 2.4 MP Full HD resolution and IR night vision.',
    price: 2900,
    originalPrice: 3500,
    images: ['/api/placeholder/300/200'],
    category: 'cctv',
    brand: 'CP Plus',
    model: 'CP-VAC-D24L2-V3',
    inStock: true,
    stockQuantity: 10,
    rating: 3.7,
    reviews: 4,
    features: [
      '2.4 MP Full HD',
      'IR Night Vision',
      'Vandal Resistant',
      'Wide Angle View',
      'Easy Installation'
    ],
    specifications: {
      Resolution: '2.4 MP (1920×1080)',
      Lens: '2.8-12mm Vari-focal',
      'Night Vision': '30m IR Range',
      'Weather Rating': 'IP67',
      Power: '12V DC / PoE'
    },
    warranty: '2 Years Manufacturer Warranty'
  },
  {
    id: '9',
    name: 'Hikvision 2MP Dome Camera',
    slug: generateSlug('Hikvision 2MP Dome Camera'),
    description: 'Professional dome camera with 1080P Full HD and night vision capabilities.',
    price: 3000,
    originalPrice: 3800,
    images: ['/api/placeholder/300/200'],
    category: 'cctv',
    brand: 'Hikvision',
    model: 'DS-2CE16C0T-IRP',
    inStock: true,
    stockQuantity: 8,
    rating: 4.2,
    reviews: 6,
    features: [
      '2 MP 1080P HD',
      'Turbo HD Technology',
      'Night Vision',
      'Weather Resistant',
      'Easy Setup'
    ],
    specifications: {
      Resolution: '2 MP (1920×1080)',
      Lens: '2.8mm Fixed',
      'Night Vision': '30m IR Range',
      'Weather Rating': 'IP67',
      Power: '12V DC'
    },
    warranty: '3 Years Manufacturer Warranty'
  },
  {
    id: '10',
    name: 'Godrej E-Swipe Home Locker',
    slug: generateSlug('Godrej E-Swipe Home Locker'),
    description: 'Digital home locker with E-Swipe technology and 35-liter capacity for secure storage.',
    price: 21499,
    originalPrice: 25000,
    images: ['/api/placeholder/300/200'],
    category: 'security',
    brand: 'Godrej',
    model: 'E-Swipe 35L',
    inStock: true,
    stockQuantity: 5,
    rating: 3.9,
    reviews: 4,
    features: [
      'Digital E-Swipe Lock',
      '35 Liter Capacity',
      'Fire Resistant',
      'Battery Backup',
      'Emergency Key Access'
    ],
    specifications: {
      Capacity: '35 Liters',
      Lock: 'Digital E-Swipe',
      'Fire Rating': '30 Minutes',
      'Battery': '4x AA Batteries',
      Weight: '12.5 kg'
    },
    warranty: '5 Years Manufacturer Warranty'
  },
  {
    id: '11',
    name: 'CP Plus Video Door Phone',
    slug: generateSlug('CP Plus Video Door Phone'),
    description: '10 cm (4 inch) hands-free color video door phone with clear audio and video communication.',
    price: 12500,
    originalPrice: 15000,
    images: ['/api/placeholder/300/200'],
    category: 'security',
    brand: 'CP Plus',
    model: 'CP-VDP-4',
    inStock: true,
    stockQuantity: 6,
    rating: 3.3,
    reviews: 3,
    features: [
      '4 Inch Color Display',
      'Hands-Free Operation',
      'Night Vision',
      'Two-Way Audio',
      'Door Release Function'
    ],
    specifications: {
      Display: '4 Inch Color LCD',
      'Night Vision': 'Built-in IR LEDs',
      'Audio': 'Two-Way Communication',
      'Door Release': '12V Relay Output',
      Power: '12V DC Adapter'
    },
    warranty: '1 Year Manufacturer Warranty'
  },
  {
    id: '12',
    name: 'Hikvision 4 Channel CCTV Kit',
    slug: generateSlug('Hikvision 4 Channel CCTV Kit'),
    description: 'Complete 4-channel CCTV camera kit with DVR, cameras, cables, and power adapters.',
    price: 18000,
    originalPrice: 22000,
    images: ['/api/placeholder/300/200'],
    category: 'cctv',
    brand: 'Hikvision',
    model: 'DS-7204HGHI-K1',
    inStock: true,
    stockQuantity: 4,
    rating: 4.5,
    reviews: 8,
    features: [
      '4 Channel DVR',
      '4 HD Cameras Included',
      'HDMI & VGA Output',
      'Mobile App Access',
      'Complete Installation Kit'
    ],
    specifications: {
      Channels: '4',
      Resolution: '1080P per Channel',
      Storage: '1TB HDD Included',
      'Mobile App': 'Hik-Connect',
      'Cameras': '4x 2MP Bullet Cameras'
    },
    warranty: '2 Years Manufacturer Warranty'
  }
];

