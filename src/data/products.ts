import { Product } from '../types/catalog';

export const products: Product[] = [
  {
    id: '1',
    name: 'HD IP Camera 4MP',
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
  }
];

