// Seed master data (Categories and Brands) for GPS & Security Systems business
// Run with: node server/scripts/seed-masters.js

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { initDatabase, getPool } = require('../db');
const { v4: uuidv4 } = require('uuid');

function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const categories = [
  // Toy Categories
  {
    name: 'Action Figures',
    type: 'product',
    description: 'Action figures and collectible character toys for imaginative play.',
    short_description: 'Action figures and character toys',
    icon: 'user'
  },
  {
    name: 'Art and Crafts',
    type: 'product',
    description: 'Art supplies, craft kits, and creative toys for artistic expression.',
    short_description: 'Art supplies and craft kits',
    icon: 'palette'
  },
  {
    name: 'Baby Rattles',
    type: 'product',
    description: 'Baby rattles and early development toys for infants.',
    short_description: 'Baby rattles and infant toys',
    icon: 'baby'
  },
  {
    name: 'Bath Toys',
    type: 'product',
    description: 'Water-safe bath toys for fun bath time activities.',
    short_description: 'Bath time toys',
    icon: 'droplet'
  },
  {
    name: 'Card & Board Games',
    type: 'product',
    description: 'Board games, card games, and family entertainment games.',
    short_description: 'Board and card games',
    icon: 'grid'
  },
  {
    name: 'Coin Bank',
    type: 'product',
    description: 'Piggy banks and coin banks for teaching kids about saving money.',
    short_description: 'Piggy banks and coin banks',
    icon: 'piggy-bank'
  },
  {
    name: 'Doll & Doll House',
    type: 'product',
    description: 'Dolls, doll houses, and accessories for imaginative play.',
    short_description: 'Dolls and doll houses',
    icon: 'home'
  },
  {
    name: 'Drone',
    type: 'product',
    description: 'Remote-controlled drones and flying toys.',
    short_description: 'Drones and flying toys',
    icon: 'airplane'
  },
  {
    name: 'Educational & Learning Toys',
    type: 'product',
    description: 'Educational toys that promote learning and development.',
    short_description: 'Educational and learning toys',
    icon: 'book'
  },
  {
    name: 'Electric Ride Ons',
    type: 'product',
    description: 'Battery-powered ride-on vehicles for kids.',
    short_description: 'Electric ride-on vehicles',
    icon: 'car'
  },
  {
    name: 'Manual Ride Ons',
    type: 'product',
    description: 'Manual ride-on toys and vehicles.',
    short_description: 'Manual ride-on toys',
    icon: 'bike'
  },
  {
    name: 'Metal Toys',
    type: 'product',
    description: 'Metal construction toys and die-cast vehicles.',
    short_description: 'Metal toys and die-cast',
    icon: 'box'
  },
  {
    name: 'Musical Toys',
    type: 'product',
    description: 'Musical toys and instruments for kids.',
    short_description: 'Musical toys',
    icon: 'music'
  },
  {
    name: 'Musical Instruments',
    type: 'product',
    description: 'Toy musical instruments for children.',
    short_description: 'Toy musical instruments',
    icon: 'headphones'
  },
  {
    name: 'Remote Control Toys',
    type: 'product',
    description: 'Remote-controlled cars, helicopters, and other RC toys.',
    short_description: 'Remote control toys',
    icon: 'radio'
  },
  {
    name: 'Role Play Set',
    type: 'product',
    description: 'Role play sets and pretend play toys.',
    short_description: 'Role play and pretend play',
    icon: 'users'
  },
  {
    name: 'Soft Toys',
    type: 'product',
    description: 'Soft toys, stuffed animals, and plush toys.',
    short_description: 'Soft and stuffed toys',
    icon: 'heart'
  },
  {
    name: 'Sports Toys',
    type: 'product',
    description: 'Sports toys and outdoor play equipment.',
    short_description: 'Sports and outdoor toys',
    icon: 'activity'
  },
  {
    name: 'Train Set',
    type: 'product',
    description: 'Train sets and railway toys.',
    short_description: 'Train sets and railway toys',
    icon: 'train'
  },
  {
    name: 'Vehicles & Pull Back',
    type: 'product',
    description: 'Pull-back cars, vehicles, and transportation toys.',
    short_description: 'Pull-back vehicles and cars',
    icon: 'truck'
  },
  {
    name: 'Wooden Toys',
    type: 'product',
    description: 'Wooden toys and educational wooden playthings.',
    short_description: 'Wooden toys',
    icon: 'tree'
  },
  {
    name: 'Kids Drinkware',
    type: 'product',
    description: 'Insulated bottles, sippers, and flasks for kids, school, and travel.',
    short_description: 'Kids water bottles and drinkware',
    icon: 'cup-soda'
  },
  // Legacy categories (keeping for backward compatibility)
  {
    name: 'CCTV Camera',
    type: 'product',
    description: 'Closed-circuit television cameras for surveillance and security monitoring.',
    short_description: 'Security cameras for surveillance',
    icon: 'camera'
  },
  {
    name: 'DVR/NVR',
    type: 'product',
    description: 'Digital Video Recorders and Network Video Recorders for storing and managing CCTV footage.',
    short_description: 'Video recording and storage systems',
    icon: 'hard-drive'
  },
  {
    name: 'CCTV Kit',
    type: 'product',
    description: 'Complete CCTV installation kits including cameras, DVR/NVR, cables, and accessories.',
    short_description: 'Complete CCTV system packages',
    icon: 'package'
  },
  {
    name: 'GPS Device',
    type: 'product',
    description: 'GPS tracking devices for vehicles, personal use, and fleet management.',
    short_description: 'GPS tracking and navigation devices',
    icon: 'map-pin'
  },
  {
    name: 'Installation Service',
    type: 'service',
    description: 'Professional installation services for CCTV systems, GPS trackers, and security equipment.',
    short_description: 'Professional installation services',
    icon: 'wrench'
  },
  {
    name: 'Maintenance Service',
    type: 'service',
    description: 'Maintenance and support services for CCTV systems, GPS devices, and security equipment.',
    short_description: 'Maintenance and support services',
    icon: 'tool'
  },
  {
    name: 'Accessories',
    type: 'product',
    description: 'CCTV and security system accessories including cables, connectors, mounts, and power supplies.',
    short_description: 'Security system accessories',
    icon: 'cable'
  },
  {
    name: 'Security System',
    type: 'product',
    description: 'Complete security systems including door phones, access control, and alarm systems.',
    short_description: 'Complete security solutions',
    icon: 'shield'
  },
  {
    name: 'IP Camera',
    type: 'product',
    description: 'Network IP cameras with advanced features like PTZ, audio, and analytics.',
    short_description: 'Network IP cameras',
    icon: 'video'
  },
  {
    name: 'Analog Camera',
    type: 'product',
    description: 'Traditional analog CCTV cameras compatible with DVR systems.',
    short_description: 'Analog CCTV cameras',
    icon: 'camera'
  },
  {
    name: 'Wireless Camera',
    type: 'product',
    description: 'Wireless CCTV cameras with WiFi connectivity for easy installation.',
    short_description: 'Wireless WiFi cameras',
    icon: 'wifi'
  },
  {
    name: 'PoE Switch',
    type: 'product',
    description: 'Power over Ethernet switches for IP camera installations.',
    short_description: 'PoE network switches',
    icon: 'network'
  },
  {
    name: 'Hard Disk Drive',
    type: 'product',
    description: 'Surveillance-grade hard disk drives for DVR/NVR storage.',
    short_description: 'Surveillance HDD',
    icon: 'hard-drive'
  },
  {
    name: 'Access Control System',
    type: 'product',
    description: 'Access control systems including card readers, biometric scanners, and controllers.',
    short_description: 'Access control solutions',
    icon: 'key'
  },
  {
    name: 'Alarm System',
    type: 'product',
    description: 'Intrusion detection and alarm systems for homes and businesses.',
    short_description: 'Intrusion alarm systems',
    icon: 'bell'
  },
  {
    name: 'Internet Service',
    type: 'service',
    description: 'Internet connectivity services including broadband, fiber, and WiFi solutions.',
    short_description: 'Internet and connectivity services',
    icon: 'wifi'
  },
  {
    name: 'IT Support Service',
    type: 'service',
    description: 'IT support services including computer repair, software installation, antivirus, and technical support.',
    short_description: 'IT support and computer services',
    icon: 'monitor'
  },
  {
    name: 'Visit Charge',
    type: 'service',
    description: 'Service visit charges for on-site technical support and installations.',
    short_description: 'Service visit charges',
    icon: 'truck'
  },
  {
    name: 'Software Service',
    type: 'service',
    description: 'Software installation, configuration, and support services.',
    short_description: 'Software services',
    icon: 'code'
  },
  {
    name: 'Network Setup',
    type: 'service',
    description: 'Network setup and configuration services for homes and businesses.',
    short_description: 'Network setup services',
    icon: 'network'
  }
];

const brands = [
  {
    name: 'Khandelwal Toy Store',
    description:
      'Khandelwal Toy Store — neighbourhood toy shop for quality toys, games, and gifts. Visit in person or enquire for stock and advice.',
    short_description: 'Local toy shop',
    website: 'https://khandelwaltoystore.com',
    partnership_type: 'partner',
    partnership_since: '2024'
  },
  {
    name: 'Make Toys',
    description: 'Make Toys - Quality toy manufacturer offering a wide range of toys for all ages.',
    short_description: 'Quality toy manufacturer',
    website: 'https://maketoys.in',
    partnership_type: 'partner',
    partnership_since: '2024'
  },
  {
    name: 'Manku Toys',
    description: 'Manku Toys — playsets, dolls, baby gyms, and activity toys for children.',
    short_description: 'Kids playsets and activity toys',
    partnership_type: 'partner',
    partnership_since: '2025'
  },
  {
    name: 'Pexpo',
    description: 'Pexpo insulated stainless steel water bottles and drinkware.',
    short_description: 'Insulated bottles and flasks',
    website: 'https://www.pexpo.in',
    partnership_type: 'partner',
    partnership_since: '2025'
  },
  {
    name: 'Milton',
    description: 'Milton steel thermoware and insulated bottles — trusted Indian household brand.',
    short_description: 'Steel thermoware and bottles',
    website: 'https://www.milton.in',
    partnership_type: 'partner',
    partnership_since: '2025'
  },
  {
    name: 'EKTA',
    description: 'EKTA building blocks and construction toys — made in India educational play.',
    short_description: 'Building blocks and construction sets',
    partnership_type: 'partner',
    partnership_since: '2025'
  },
  {
    name: 'K.LAL',
    description: 'K.LAL toys including seasonal and outdoor play items.',
    short_description: 'Outdoor and seasonal toys',
    partnership_type: 'partner',
    partnership_since: '2025'
  },
  // Legacy brands (keeping for backward compatibility)
  {
    name: 'Hikvision',
    description: 'Hikvision is a leading provider of innovative video surveillance products and solutions. Known for high-quality IP cameras, DVRs, and NVRs.',
    short_description: 'Leading CCTV and security solutions provider',
    website: 'https://www.hikvision.com',
    partnership_type: 'authorized-dealer',
    partnership_since: '2020'
  },
  {
    name: 'CP Plus',
    description: 'CP Plus is a trusted brand in the security and surveillance industry, offering a wide range of CCTV cameras, DVRs, and security solutions.',
    short_description: 'Trusted security and surveillance brand',
    website: 'https://www.cpplusworld.com',
    partnership_type: 'authorized-dealer',
    partnership_since: '2019'
  },
  {
    name: 'Dahua',
    description: 'Dahua Technology is a world-leading video-centric smart IoT solution and service provider, offering advanced surveillance products.',
    short_description: 'World-leading video surveillance solutions',
    website: 'https://www.dahuasecurity.com',
    partnership_type: 'authorized-dealer',
    partnership_since: '2021'
  },
  {
    name: 'Queclink',
    description: 'Queclink is a leading provider of GPS tracking solutions for personal, vehicle, and fleet management applications.',
    short_description: 'Leading GPS tracking solutions provider',
    website: 'https://www.queclink.com',
    partnership_type: 'partner',
    partnership_since: '2020'
  },
  {
    name: 'Teltonika',
    description: 'Teltonika is a global leader in IoT and GPS tracking solutions, providing advanced fleet management and vehicle tracking devices.',
    short_description: 'Global leader in GPS and IoT solutions',
    website: 'https://teltonika-gps.com',
    partnership_type: 'partner',
    partnership_since: '2021'
  },
  {
    name: 'Godrej',
    description: 'Godrej is a trusted Indian brand offering security solutions including digital locks, safes, and security systems.',
    short_description: 'Trusted Indian security solutions brand',
    website: 'https://www.godrej.com',
    partnership_type: 'authorized-dealer',
    partnership_since: '2019'
  },
  {
    name: 'Generic',
    description: 'Generic brand for accessories and standard components used in security installations.',
    short_description: 'Generic accessories and components',
    partnership_type: 'reseller',
    partnership_since: '2018'
  },
  {
    name: 'Service',
    description: 'Service brand for installation and maintenance services provided by WAINSO.',
    short_description: 'Professional installation and maintenance services',
    partnership_type: 'others',
    partnership_since: '2018'
  },
  {
    name: 'Axis',
    description: 'Axis Communications is a leading manufacturer of network cameras and video surveillance solutions.',
    short_description: 'Leading network camera manufacturer',
    website: 'https://www.axis.com',
    partnership_type: 'partner',
    partnership_since: '2022'
  },
  {
    name: 'Bosch',
    description: 'Bosch Security Systems offers comprehensive security solutions including cameras, access control, and intrusion detection.',
    short_description: 'Comprehensive security solutions',
    website: 'https://www.boschsecurity.com',
    partnership_type: 'partner',
    partnership_since: '2021'
  },
  {
    name: 'Samsung',
    description: 'Samsung Techwin provides advanced CCTV and security solutions with cutting-edge technology.',
    short_description: 'Advanced CCTV solutions',
    website: 'https://www.samsung.com',
    partnership_type: 'authorized-dealer',
    partnership_since: '2020'
  },
  {
    name: 'Panasonic',
    description: 'Panasonic offers professional security cameras and surveillance systems with advanced features.',
    short_description: 'Professional security cameras',
    website: 'https://www.panasonic.com',
    partnership_type: 'partner',
    partnership_since: '2021'
  },
  {
    name: 'ZKTeco',
    description: 'ZKTeco is a leading provider of access control systems, time attendance, and biometric solutions.',
    short_description: 'Access control and biometric solutions',
    website: 'https://www.zkteco.com',
    partnership_type: 'authorized-dealer',
    partnership_since: '2020'
  },
  {
    name: 'Realme',
    description: 'Realme offers affordable and reliable CCTV cameras and security solutions.',
    short_description: 'Affordable security solutions',
    website: 'https://www.realme.com',
    partnership_type: 'reseller',
    partnership_since: '2022'
  },
  {
    name: 'TP-Link',
    description: 'TP-Link provides network cameras, PoE switches, and networking solutions for security systems.',
    short_description: 'Network cameras and PoE solutions',
    website: 'https://www.tp-link.com',
    partnership_type: 'reseller',
    partnership_since: '2021'
  },
  {
    name: 'Xiaomi',
    description: 'Xiaomi offers smart security cameras and IoT devices with advanced features.',
    short_description: 'Smart security cameras',
    website: 'https://www.mi.com',
    partnership_type: 'reseller',
    partnership_since: '2022'
  },
  {
    name: 'Ezviz',
    description: 'Ezviz is a global smart home security brand offering cameras and security solutions.',
    short_description: 'Smart home security solutions',
    website: 'https://www.ezviz.com',
    partnership_type: 'reseller',
    partnership_since: '2021'
  },
  {
    name: 'Concox',
    description: 'Concox provides GPS tracking devices and fleet management solutions.',
    short_description: 'GPS tracking and fleet management',
    website: 'https://www.concox.com',
    partnership_type: 'partner',
    partnership_since: '2020'
  },
  {
    name: 'Calamp',
    description: 'Calamp offers advanced telematics and GPS tracking solutions for fleet management.',
    short_description: 'Telematics and GPS tracking',
    website: 'https://www.calamp.com',
    partnership_type: 'partner',
    partnership_since: '2021'
  },
  {
    name: 'Jio',
    description: 'Reliance Jio is India\'s leading telecommunications and digital services provider, offering JioFiber, Jio WiFi, and mobile services.',
    short_description: 'India\'s leading telecom and digital services',
    website: 'https://www.jio.com',
    partnership_type: 'authorized-dealer',
    partnership_since: '2020'
  },
  {
    name: 'Airtel',
    description: 'Bharti Airtel is one of India\'s leading telecommunications companies offering broadband, fiber, and mobile services.',
    short_description: 'Leading telecom services provider',
    website: 'https://www.airtel.in',
    partnership_type: 'authorized-dealer',
    partnership_since: '2021'
  },
  {
    name: 'ACT Fibernet',
    description: 'ACT Fibernet is a leading fiber broadband service provider in India.',
    short_description: 'Fiber broadband services',
    website: 'https://www.actcorp.in',
    partnership_type: 'authorized-dealer',
    partnership_since: '2021'
  },
  {
    name: 'Realme',
    description: 'Realme offers affordable and reliable CCTV cameras and security solutions for Indian market.',
    short_description: 'Affordable security solutions',
    website: 'https://www.realme.com',
    partnership_type: 'reseller',
    partnership_since: '2022'
  },
  {
    name: 'Mi',
    description: 'Xiaomi Mi offers smart security cameras and IoT devices with advanced features at competitive prices.',
    short_description: 'Smart security cameras',
    website: 'https://www.mi.com',
    partnership_type: 'reseller',
    partnership_since: '2022'
  },
  {
    name: 'iBall',
    description: 'iBall is an Indian brand offering affordable CCTV cameras and security solutions.',
    short_description: 'Affordable Indian security solutions',
    website: 'https://www.iball.co.in',
    partnership_type: 'reseller',
    partnership_since: '2021'
  },
  {
    name: 'Zebronics',
    description: 'Zebronics is an Indian brand offering CCTV cameras, security systems, and computer accessories.',
    short_description: 'Indian security and computer accessories',
    website: 'https://www.zebronics.com',
    partnership_type: 'reseller',
    partnership_since: '2021'
  },
  {
    name: 'Intex',
    description: 'Intex is an Indian brand offering affordable CCTV cameras and security solutions.',
    short_description: 'Affordable Indian security solutions',
    website: 'https://www.intex.in',
    partnership_type: 'reseller',
    partnership_since: '2021'
  },
  {
    name: 'Microsoft',
    description: 'Microsoft provides Windows operating systems, Office software, and IT solutions.',
    short_description: 'Windows and Office software',
    website: 'https://www.microsoft.com',
    partnership_type: 'partner',
    partnership_since: '2020'
  },
  {
    name: 'Norton',
    description: 'Norton provides antivirus and cybersecurity solutions for home and business.',
    short_description: 'Antivirus and cybersecurity',
    website: 'https://www.norton.com',
    partnership_type: 'partner',
    partnership_since: '2020'
  },
  {
    name: 'Quick Heal',
    description: 'Quick Heal is an Indian antivirus and cybersecurity solutions provider.',
    short_description: 'Indian antivirus solutions',
    website: 'https://www.quickheal.com',
    partnership_type: 'partner',
    partnership_since: '2020'
  },
  {
    name: 'Kaspersky',
    description: 'Kaspersky provides advanced antivirus and cybersecurity solutions.',
    short_description: 'Advanced antivirus solutions',
    website: 'https://www.kaspersky.com',
    partnership_type: 'partner',
    partnership_since: '2021'
  }
];

async function seedMasters() {
  try {
    console.log('[Master Seed] Initializing database...');
    await initDatabase();
    const pool = getPool();

    // Seed Categories
    console.log(`[Master Seed] Seeding ${categories.length} categories...`);
    const categoryMap = new Map(); // Store category name -> id mapping

    for (const category of categories) {
      const id = uuidv4();
      const slug = generateSlug(category.name);

      try {
        // Check if category already exists by slug
        const [existing] = await pool.execute(
          'SELECT id FROM categories WHERE slug = ?',
          [slug]
        );

        if (existing.length > 0) {
          console.log(`[Master Seed] ⊗ Category already exists: ${category.name}`);
          categoryMap.set(category.name, existing[0].id);
          continue;
        }

        await pool.execute(
          `INSERT INTO categories (id, name, slug, type, description, short_description, icon, is_active)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            category.name,
            slug,
            category.type,
            category.description,
            category.short_description,
            category.icon,
            true
          ]
        );
        console.log(`[Master Seed] ✓ Added category: ${category.name}`);
        categoryMap.set(category.name, id);
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          console.log(`[Master Seed] ⊗ Skipped (duplicate): ${category.name}`);
          // Try to get the existing ID
          const [existing] = await pool.execute(
            'SELECT id FROM categories WHERE slug = ?',
            [slug]
          );
          if (existing.length > 0) {
            categoryMap.set(category.name, existing[0].id);
          }
        } else {
          console.error(`[Master Seed] ✗ Error adding category ${category.name}:`, error.message);
        }
      }
    }

    // Seed Brands
    console.log(`\n[Master Seed] Seeding ${brands.length} brands...`);
    const brandMap = new Map(); // Store brand name -> id mapping

    for (const brand of brands) {
      const id = uuidv4();
      const slug = generateSlug(brand.name);

      try {
        // Check if brand already exists by slug
        const [existing] = await pool.execute(
          'SELECT id FROM brands WHERE slug = ?',
          [slug]
        );

        if (existing.length > 0) {
          console.log(`[Master Seed] ⊗ Brand already exists: ${brand.name}`);
          brandMap.set(brand.name, existing[0].id);
          continue;
        }

        await pool.execute(
          `INSERT INTO brands (id, name, slug, description, short_description, website, partnership_type, partnership_since, is_active)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            brand.name,
            slug,
            brand.description,
            brand.short_description,
            brand.website || null,
            brand.partnership_type,
            brand.partnership_since,
            true
          ]
        );
        console.log(`[Master Seed] ✓ Added brand: ${brand.name}`);
        brandMap.set(brand.name, id);
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          console.log(`[Master Seed] ⊗ Skipped (duplicate): ${brand.name}`);
          // Try to get the existing ID
          const [existing] = await pool.execute(
            'SELECT id FROM brands WHERE slug = ?',
            [slug]
          );
          if (existing.length > 0) {
            brandMap.set(brand.name, existing[0].id);
          }
        } else {
          console.error(`[Master Seed] ✗ Error adding brand ${brand.name}:`, error.message);
        }
      }
    }

    console.log('\n[Master Seed] ✓ Master data seeding completed!');
    console.log(`[Master Seed] Categories mapped: ${categoryMap.size}`);
    console.log(`[Master Seed] Brands mapped: ${brandMap.size}`);
    
    // Return maps for use in product seeding
    return { categoryMap, brandMap };
  } catch (error) {
    console.error('[Master Seed] ✗ Seeding failed:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedMasters()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { seedMasters };










