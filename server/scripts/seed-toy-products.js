// Seed toy products based on maketoys.in
// Run with: node server/scripts/seed-toy-products.js
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

// Toy products based on maketoys.in
const products = [
  // Vehicles & Pull Back
  {
    name: '09 Future Car',
    description: 'Stylish future car toy with pull-back mechanism. Perfect for kids who love vehicles and racing games.',
    short_description: 'Pull-back future car toy',
    price: 280,
    price_includes_gst: true,
    category: 'Vehicles & Pull Back',
    brand: 'DigiDukaanLive',
    hsn_code: '9503',
    age_group: '3-8 Years',
    occasion: JSON.stringify(['Birthday', 'General']),
    gender: 'unisex',
    material_type: 'Plastic',
    educational_value: false,
    minimum_order_quantity: 12,
    bulk_discount_percentage: 5,
    stock_quantity: 500,
    sku: 'KT-VEH-001',
    features: JSON.stringify([
      'Pull-back mechanism',
      'Smooth wheels',
      'Durable plastic construction',
      'Colorful design',
      'Safe for kids'
    ]),
    specifications: JSON.stringify({
      'Type': 'Pull-back Car',
      'Material': 'Plastic',
      'Age': '3+ Years',
      'Dimensions': 'Approx 8cm x 4cm'
    }),
    warranty: '1 Year Manufacturer Warranty',
    seo_title: '09 Future Car - Pull Back Toy Car | DigiDukaanLive',
    seo_description: 'Buy 09 Future Car pull-back toy for kids and families. Perfect for kids aged 3-8 years. Best quality toys.',
    seo_keywords: JSON.stringify(['future car', 'pull back car', 'toy car', 'vehicle toy', 'online store'])
  },
  {
    name: '1:14 Simulated Model Car',
    description: 'Detailed 1:14 scale simulated model car with realistic design. Great for collectors and kids who love cars.',
    short_description: '1:14 scale model car with realistic design',
    price: 1380,
    price_includes_gst: true,
    category: 'Vehicles & Pull Back',
    brand: 'DigiDukaanLive',
    hsn_code: '9503',
    age_group: '5-12 Years',
    occasion: JSON.stringify(['Birthday', 'General', 'Gift']),
    gender: 'unisex',
    material_type: 'Plastic',
    educational_value: false,
    minimum_order_quantity: 6,
    bulk_discount_percentage: 8,
    stock_quantity: 200,
    sku: 'KT-VEH-002',
    features: JSON.stringify([
      '1:14 Scale Model',
      'Realistic design',
      'Detailed interior',
      'Smooth wheels',
      'Collectible item'
    ]),
    specifications: JSON.stringify({
      'Scale': '1:14',
      'Material': 'Plastic',
      'Age': '5+ Years',
      'Dimensions': 'Approx 25cm x 10cm'
    }),
    warranty: '1 Year Manufacturer Warranty',
    seo_title: '1:14 Simulated Model Car - Scale Model Toy | DigiDukaanLive',
    seo_description: 'Buy 1:14 simulated model car for kids and families. Detailed scale model perfect for kids and collectors.',
    seo_keywords: JSON.stringify(['model car', 'scale model', 'simulated car', 'toy car', 'collectible'])
  },
  {
    name: '1:16 Racing Sport Mood Car',
    description: 'High-speed racing sport car in 1:16 scale. Perfect for racing enthusiasts and action play.',
    short_description: '1:16 scale racing sport car',
    price: 1880,
    price_includes_gst: true,
    category: 'Vehicles & Pull Back',
    brand: 'DigiDukaanLive',
    hsn_code: '9503',
    age_group: '5-12 Years',
    occasion: JSON.stringify(['Birthday', 'General']),
    gender: 'boys',
    material_type: 'Plastic',
    educational_value: false,
    minimum_order_quantity: 6,
    bulk_discount_percentage: 10,
    stock_quantity: 150,
    sku: 'KT-VEH-003',
    features: JSON.stringify([
      '1:16 Scale',
      'Racing design',
      'Sporty look',
      'Smooth movement',
      'Durable construction'
    ]),
    specifications: JSON.stringify({
      'Scale': '1:16',
      'Material': 'Plastic',
      'Age': '5+ Years',
      'Dimensions': 'Approx 28cm x 12cm'
    }),
    warranty: '1 Year Manufacturer Warranty',
    seo_title: '1:16 Racing Sport Mood Car - Racing Toy Car | DigiDukaanLive',
    seo_description: 'Buy 1:16 racing sport car for kids and families. Perfect for racing enthusiasts and action play.',
    seo_keywords: JSON.stringify(['racing car', 'sport car', 'toy car', 'racing toy', 'kids toys'])
  },
  {
    name: '1.18 Spray Transverse Car',
    description: 'Unique spray transverse car with special design. Fun and engaging toy for kids.',
    short_description: 'Spray transverse car toy',
    price: 840,
    price_includes_gst: true,
    category: 'Vehicles & Pull Back',
    brand: 'DigiDukaanLive',
    hsn_code: '9503',
    age_group: '3-8 Years',
    occasion: JSON.stringify(['Birthday', 'General']),
    gender: 'unisex',
    material_type: 'Plastic',
    educational_value: false,
    minimum_order_quantity: 12,
    bulk_discount_percentage: 7,
    stock_quantity: 300,
    sku: 'KT-VEH-004',
    features: JSON.stringify([
      'Spray design',
      'Transverse mechanism',
      'Colorful',
      'Safe materials',
      'Fun play'
    ]),
    specifications: JSON.stringify({
      'Type': 'Spray Car',
      'Material': 'Plastic',
      'Age': '3+ Years',
      'Dimensions': 'Approx 15cm x 7cm'
    }),
    warranty: '1 Year Manufacturer Warranty',
    seo_title: '1.18 Spray Transverse Car - Unique Toy Car | DigiDukaanLive',
    seo_description: 'Buy spray transverse car for kids and families. Unique design perfect for kids aged 3-8 years.',
    seo_keywords: JSON.stringify(['spray car', 'transverse car', 'toy car', 'unique toy'])
  },

  // Art and Crafts
  {
    name: '128 PCS Color Set',
    description: 'Comprehensive 128 piece color set with various art supplies. Perfect for creative kids and art projects.',
    short_description: '128 piece art and craft color set',
    price: 860,
    price_includes_gst: true,
    category: 'Art and Crafts',
    brand: 'DigiDukaanLive',
    hsn_code: '9608',
    age_group: '5-12 Years',
    occasion: JSON.stringify(['Birthday', 'General', 'Back to School']),
    gender: 'unisex',
    material_type: 'Mixed',
    educational_value: true,
    minimum_order_quantity: 10,
    bulk_discount_percentage: 8,
    stock_quantity: 400,
    sku: 'KT-ART-001',
    features: JSON.stringify([
      '128 Pieces',
      'Multiple colors',
      'Art supplies included',
      'Creative play',
      'Educational value'
    ]),
    specifications: JSON.stringify({
      'Pieces': '128',
      'Type': 'Color Set',
      'Age': '5+ Years',
      'Includes': 'Crayons, Pencils, Markers'
    }),
    warranty: '1 Year Manufacturer Warranty',
    seo_title: '128 PCS Color Set - Art and Craft Supplies | DigiDukaanLive',
    seo_description: 'Buy 128 piece color set for kids and families. Complete art supplies for creative kids and projects.',
    seo_keywords: JSON.stringify(['color set', 'art supplies', 'craft set', 'crayons', 'art and craft'])
  },
  {
    name: '145 Color Set',
    description: 'Premium 145 piece color set with extensive range of art materials. Ideal for serious young artists.',
    short_description: '145 piece premium art color set',
    price: 1180,
    price_includes_gst: true,
    category: 'Art and Crafts',
    brand: 'DigiDukaanLive',
    hsn_code: '9608',
    age_group: '6-14 Years',
    occasion: JSON.stringify(['Birthday', 'General', 'Back to School']),
    gender: 'unisex',
    material_type: 'Mixed',
    educational_value: true,
    minimum_order_quantity: 8,
    bulk_discount_percentage: 10,
    stock_quantity: 250,
    sku: 'KT-ART-002',
    features: JSON.stringify([
      '145 Pieces',
      'Premium quality',
      'Wide color range',
      'Complete art kit',
      'Educational'
    ]),
    specifications: JSON.stringify({
      'Pieces': '145',
      'Type': 'Premium Color Set',
      'Age': '6+ Years',
      'Includes': 'Crayons, Pencils, Markers, Watercolors'
    }),
    warranty: '1 Year Manufacturer Warranty',
    seo_title: '145 Color Set - Premium Art Supplies | DigiDukaanLive',
    seo_description: 'Buy 145 piece premium color set for kids and families. Extensive art materials for young artists.',
    seo_keywords: JSON.stringify(['premium color set', 'art supplies', '145 piece', 'art kit', 'kids toys'])
  },
  {
    name: '150 Piece Color (Art) Set',
    description: 'Complete 150 piece art set with all essential art supplies. Perfect for school projects and creative activities.',
    short_description: '150 piece complete art set',
    price: 390,
    price_includes_gst: true,
    category: 'Art and Crafts',
    brand: 'DigiDukaanLive',
    hsn_code: '9608',
    age_group: '5-12 Years',
    occasion: JSON.stringify(['Birthday', 'General', 'Back to School']),
    gender: 'unisex',
    material_type: 'Mixed',
    educational_value: true,
    minimum_order_quantity: 15,
    bulk_discount_percentage: 12,
    stock_quantity: 600,
    sku: 'KT-ART-003',
    features: JSON.stringify([
      '150 Pieces',
      'Complete art kit',
      'All essentials included',
      'School project ready',
      'Value for money'
    ]),
    specifications: JSON.stringify({
      'Pieces': '150',
      'Type': 'Art Set',
      'Age': '5+ Years',
      'Includes': 'Crayons, Pencils, Erasers, Sharpeners'
    }),
    warranty: '1 Year Manufacturer Warranty',
    seo_title: '150 Piece Color Art Set - Complete Art Kit | DigiDukaanLive',
    seo_description: 'Buy 150 piece art set for kids and families. Complete art supplies perfect for school projects.',
    seo_keywords: JSON.stringify(['art set', '150 piece', 'art kit', 'school supplies', 'kids toys'])
  },

  // Card & Board Games
  {
    name: '13 in 1 Family Board Magnetic Game',
    description: 'Versatile 13-in-1 family board game with magnetic pieces. Multiple games in one set for endless family fun.',
    short_description: '13-in-1 magnetic family board game',
    price: 310,
    price_includes_gst: true,
    category: 'Card & Board Games',
    brand: 'DigiDukaanLive',
    hsn_code: '9504',
    age_group: '6-14 Years',
    occasion: JSON.stringify(['Birthday', 'General', 'Family Time']),
    gender: 'unisex',
    material_type: 'Magnetic',
    educational_value: true,
    minimum_order_quantity: 12,
    bulk_discount_percentage: 10,
    stock_quantity: 350,
    sku: 'KT-GAME-001',
    features: JSON.stringify([
      '13 Games in 1',
      'Magnetic pieces',
      'Family fun',
      'Educational',
      'Portable'
    ]),
    specifications: JSON.stringify({
      'Games': '13 Different Games',
      'Type': 'Magnetic Board',
      'Age': '6+ Years',
      'Players': '2-4'
    }),
    warranty: '1 Year Manufacturer Warranty',
    seo_title: '13 in 1 Family Board Magnetic Game - Multi Game Set | DigiDukaanLive',
    seo_description: 'Buy 13-in-1 family board game for kids and families. Multiple games in one set for family entertainment.',
    seo_keywords: JSON.stringify(['board game', 'magnetic game', 'family game', '13 in 1', 'multi game'])
  },
  {
    name: '2 in 1 Ludo and Snakes & Ladders Game',
    description: 'Classic 2-in-1 game combining Ludo and Snakes & Ladders. Two timeless games in one board.',
    short_description: '2-in-1 Ludo and Snakes & Ladders',
    price: 326,
    price_includes_gst: true,
    category: 'Card & Board Games',
    brand: 'DigiDukaanLive',
    hsn_code: '9504',
    age_group: '5-12 Years',
    occasion: JSON.stringify(['Birthday', 'General', 'Family Time']),
    gender: 'unisex',
    material_type: 'Cardboard',
    educational_value: true,
    minimum_order_quantity: 15,
    bulk_discount_percentage: 8,
    stock_quantity: 500,
    sku: 'KT-GAME-002',
    features: JSON.stringify([
      '2 Classic Games',
      'Ludo included',
      'Snakes & Ladders included',
      'Family favorite',
      'Educational'
    ]),
    specifications: JSON.stringify({
      'Games': 'Ludo, Snakes & Ladders',
      'Type': 'Board Game',
      'Age': '5+ Years',
      'Players': '2-4'
    }),
    warranty: '1 Year Manufacturer Warranty',
    seo_title: '2 in 1 Ludo and Snakes & Ladders - Classic Board Game | DigiDukaanLive',
    seo_description: 'Buy 2-in-1 Ludo and Snakes & Ladders for kids and families. Two classic games in one board.',
    seo_keywords: JSON.stringify(['ludo', 'snakes and ladders', 'board game', 'classic game', 'family game'])
  },

  // Remote Control Toys
  {
    name: '2 In 1 Soft Aqua Blaster Gun',
    description: 'Fun 2-in-1 soft aqua blaster gun for water play. Safe and exciting water toy for outdoor fun.',
    short_description: '2-in-1 soft aqua blaster water gun',
    price: 310,
    price_includes_gst: true,
    category: 'Remote Control Toys',
    brand: 'DigiDukaanLive',
    hsn_code: '9503',
    age_group: '5-12 Years',
    occasion: JSON.stringify(['Birthday', 'General', 'Summer']),
    gender: 'unisex',
    material_type: 'Plastic',
    educational_value: false,
    minimum_order_quantity: 12,
    bulk_discount_percentage: 10,
    stock_quantity: 400,
    sku: 'KT-RC-001',
    features: JSON.stringify([
      '2-in-1 Design',
      'Soft material',
      'Water blaster',
      'Safe play',
      'Outdoor fun'
    ]),
    specifications: JSON.stringify({
      'Type': 'Water Blaster',
      'Material': 'Soft Plastic',
      'Age': '5+ Years',
      'Water Capacity': 'Approx 500ml'
    }),
    warranty: '1 Year Manufacturer Warranty',
    seo_title: '2 In 1 Soft Aqua Blaster Gun - Water Toy | DigiDukaanLive',
    seo_description: 'Buy 2-in-1 soft aqua blaster gun for kids and families. Safe water toy for outdoor fun.',
    seo_keywords: JSON.stringify(['water gun', 'aqua blaster', 'water toy', 'outdoor toy', 'summer toy'])
  },

  // Educational & Learning Toys
  {
    name: 'Educational Building Blocks Set',
    description: 'Colorful building blocks set for creative construction and learning. Develops motor skills and creativity.',
    short_description: 'Educational building blocks set',
    price: 450,
    price_includes_gst: true,
    category: 'Educational & Learning Toys',
    brand: 'DigiDukaanLive',
    hsn_code: '9503',
    age_group: '2-8 Years',
    occasion: JSON.stringify(['Birthday', 'General', 'Educational']),
    gender: 'unisex',
    material_type: 'Plastic',
    educational_value: true,
    minimum_order_quantity: 10,
    bulk_discount_percentage: 12,
    stock_quantity: 500,
    sku: 'KT-EDU-001',
    features: JSON.stringify([
      'Building blocks',
      'Colorful pieces',
      'Motor skills development',
      'Creative play',
      'Educational value'
    ]),
    specifications: JSON.stringify({
      'Pieces': '50+',
      'Type': 'Building Blocks',
      'Age': '2+ Years',
      'Material': 'Safe Plastic'
    }),
    warranty: '1 Year Manufacturer Warranty',
    seo_title: 'Educational Building Blocks Set - Learning Toy | DigiDukaanLive',
    seo_description: 'Buy educational building blocks for kids and families. Develops creativity and motor skills in kids.',
    seo_keywords: JSON.stringify(['building blocks', 'educational toy', 'learning toy', 'construction toy'])
  },

  // Soft Toys
  {
    name: 'Cuddly Teddy Bear - Large',
    description: 'Soft and cuddly large teddy bear. Perfect companion for kids. Made with premium soft material.',
    short_description: 'Large cuddly teddy bear',
    price: 550,
    price_includes_gst: true,
    category: 'Soft Toys',
    brand: 'DigiDukaanLive',
    hsn_code: '9503',
    age_group: '0-10 Years',
    occasion: JSON.stringify(['Birthday', 'General', 'Gift']),
    gender: 'unisex',
    material_type: 'Fabric',
    educational_value: false,
    minimum_order_quantity: 8,
    bulk_discount_percentage: 10,
    stock_quantity: 300,
    sku: 'KT-SOFT-001',
    features: JSON.stringify([
      'Soft material',
      'Cuddly design',
      'Large size',
      'Safe for kids',
      'Premium quality'
    ]),
    specifications: JSON.stringify({
      'Type': 'Teddy Bear',
      'Size': 'Large',
      'Age': '0+ Years',
      'Material': 'Premium Fabric'
    }),
    warranty: '1 Year Manufacturer Warranty',
    seo_title: 'Cuddly Teddy Bear Large - Soft Toy | DigiDukaanLive',
    seo_description: 'Buy large cuddly teddy bear for kids and families. Soft and safe companion for kids.',
    seo_keywords: JSON.stringify(['teddy bear', 'soft toy', 'stuffed toy', 'cuddly toy', 'plush toy'])
  },

  // Action Figures
  {
    name: 'Superhero Action Figure Set',
    description: 'Set of popular superhero action figures with accessories. Perfect for imaginative play and collection.',
    short_description: 'Superhero action figure set',
    price: 680,
    price_includes_gst: true,
    category: 'Action Figures',
    brand: 'DigiDukaanLive',
    hsn_code: '9503',
    age_group: '4-12 Years',
    occasion: JSON.stringify(['Birthday', 'General']),
    gender: 'boys',
    material_type: 'Plastic',
    educational_value: false,
    minimum_order_quantity: 10,
    bulk_discount_percentage: 8,
    stock_quantity: 400,
    sku: 'KT-ACT-001',
    features: JSON.stringify([
      'Multiple figures',
      'Accessories included',
      'Articulated joints',
      'Imaginative play',
      'Collectible'
    ]),
    specifications: JSON.stringify({
      'Figures': '3-4 Pieces',
      'Type': 'Action Figure',
      'Age': '4+ Years',
      'Material': 'Plastic'
    }),
    warranty: '1 Year Manufacturer Warranty',
    seo_title: 'Superhero Action Figure Set - Action Toys | DigiDukaanLive',
    seo_description: 'Buy superhero action figure set for kids and families. Perfect for imaginative play and collection.',
    seo_keywords: JSON.stringify(['action figure', 'superhero', 'toy figures', 'collectible', 'kids toys'])
  },

  // Doll & Doll House
  {
    name: 'Fashion Doll with Accessories',
    description: 'Beautiful fashion doll with multiple outfits and accessories. Perfect for creative play and role-playing.',
    short_description: 'Fashion doll with accessories set',
    price: 420,
    price_includes_gst: true,
    category: 'Doll & Doll House',
    brand: 'DigiDukaanLive',
    hsn_code: '9503',
    age_group: '3-10 Years',
    occasion: JSON.stringify(['Birthday', 'General', 'Gift']),
    gender: 'girls',
    material_type: 'Plastic',
    educational_value: false,
    minimum_order_quantity: 12,
    bulk_discount_percentage: 10,
    stock_quantity: 450,
    sku: 'KT-DOLL-001',
    features: JSON.stringify([
      'Fashion doll',
      'Multiple outfits',
      'Accessories included',
      'Role play',
      'Creative play'
    ]),
    specifications: JSON.stringify({
      'Type': 'Fashion Doll',
      'Accessories': 'Multiple',
      'Age': '3+ Years',
      'Material': 'Plastic'
    }),
    warranty: '1 Year Manufacturer Warranty',
    seo_title: 'Fashion Doll with Accessories - Doll Toy | DigiDukaanLive',
    seo_description: 'Buy fashion doll with accessories for kids and families. Perfect for creative play and role-playing.',
    seo_keywords: JSON.stringify(['fashion doll', 'doll toy', 'doll accessories', 'role play', 'girls toy'])
  },
  {
    name: 'Princess Doll House Set',
    description: 'Beautiful princess-themed doll house with furniture and accessories. Perfect for imaginative play.',
    short_description: 'Princess doll house with furniture',
    price: 1250,
    price_includes_gst: true,
    category: 'Doll & Doll House',
    brand: 'DigiDukaanLive',
    hsn_code: '9503',
    age_group: '4-12 Years',
    occasion: JSON.stringify(['Birthday', 'General', 'Gift']),
    gender: 'girls',
    material_type: 'Plastic',
    educational_value: false,
    minimum_order_quantity: 6,
    bulk_discount_percentage: 12,
    stock_quantity: 200,
    sku: 'KT-DOLL-002',
    features: JSON.stringify([
      'Multi-room doll house',
      'Furniture included',
      'Princess theme',
      'Imaginative play',
      'Detailed design'
    ]),
    specifications: JSON.stringify({
      'Type': 'Doll House',
      'Rooms': '4+',
      'Age': '4+ Years',
      'Material': 'Plastic'
    }),
    warranty: '1 Year Manufacturer Warranty',
    seo_title: 'Princess Doll House Set - Doll House Toy | DigiDukaanLive',
    seo_description: 'Buy princess doll house set for kids and families. Beautiful doll house with furniture for imaginative play.',
    seo_keywords: JSON.stringify(['doll house', 'princess doll', 'doll furniture', 'girls toy', 'imaginative play'])
  },

  // Baby Rattles
  {
    name: 'Colorful Baby Rattle Set',
    description: 'Safe and colorful baby rattle set with different shapes and sounds. Perfect for infant development and sensory play.',
    short_description: 'Colorful baby rattle set',
    price: 180,
    price_includes_gst: true,
    category: 'Baby Rattles',
    brand: 'DigiDukaanLive',
    hsn_code: '9503',
    age_group: '0-2 Years',
    occasion: JSON.stringify(['Birthday', 'General', 'Newborn Gift']),
    gender: 'unisex',
    material_type: 'Plastic',
    educational_value: true,
    minimum_order_quantity: 20,
    bulk_discount_percentage: 15,
    stock_quantity: 800,
    sku: 'KT-BABY-001',
    features: JSON.stringify([
      'Safe materials',
      'Colorful design',
      'Different sounds',
      'Easy to grip',
      'BPA free'
    ]),
    specifications: JSON.stringify({
      'Type': 'Baby Rattle',
      'Pieces': '3-4',
      'Age': '0+ Months',
      'Material': 'Safe Plastic'
    }),
    warranty: '1 Year Manufacturer Warranty',
    seo_title: 'Colorful Baby Rattle Set - Infant Toy | DigiDukaanLive',
    seo_description: 'Buy colorful baby rattle set for kids and families. Safe and engaging toys for infant development.',
    seo_keywords: JSON.stringify(['baby rattle', 'infant toy', 'baby toy', 'sensory toy', 'newborn gift'])
  },
  {
    name: 'Musical Baby Rattle',
    description: 'Musical baby rattle with gentle sounds and lights. Stimulates baby\'s senses and motor skills.',
    short_description: 'Musical baby rattle with lights',
    price: 250,
    price_includes_gst: true,
    category: 'Baby Rattles',
    brand: 'DigiDukaanLive',
    hsn_code: '9503',
    age_group: '0-2 Years',
    occasion: JSON.stringify(['Birthday', 'General', 'Newborn Gift']),
    gender: 'unisex',
    material_type: 'Plastic',
    educational_value: true,
    minimum_order_quantity: 15,
    bulk_discount_percentage: 12,
    stock_quantity: 600,
    sku: 'KT-BABY-002',
    features: JSON.stringify([
      'Musical sounds',
      'LED lights',
      'Easy grip',
      'Safe materials',
      'Sensory development'
    ]),
    specifications: JSON.stringify({
      'Type': 'Musical Rattle',
      'Age': '0+ Months',
      'Material': 'Safe Plastic',
      'Battery': 'Included'
    }),
    warranty: '1 Year Manufacturer Warranty',
    seo_title: 'Musical Baby Rattle - Musical Infant Toy | DigiDukaanLive',
    seo_description: 'Buy musical baby rattle for kids and families. Stimulates senses with sounds and lights.',
    seo_keywords: JSON.stringify(['musical rattle', 'baby toy', 'infant toy', 'sensory toy', 'musical toy'])
  },

  // Bath Toys
  {
    name: 'Duck Family Bath Toy Set',
    description: 'Adorable duck family bath toy set. Water-safe and fun for bath time activities.',
    short_description: 'Duck family bath toy set',
    price: 220,
    price_includes_gst: true,
    category: 'Bath Toys',
    brand: 'DigiDukaanLive',
    hsn_code: '9503',
    age_group: '1-5 Years',
    occasion: JSON.stringify(['Birthday', 'General']),
    gender: 'unisex',
    material_type: 'Plastic',
    educational_value: false,
    minimum_order_quantity: 18,
    bulk_discount_percentage: 10,
    stock_quantity: 700,
    sku: 'KT-BATH-001',
    features: JSON.stringify([
      'Water-safe',
      'Duck family set',
      'Floats on water',
      'Colorful design',
      'Easy to clean'
    ]),
    specifications: JSON.stringify({
      'Type': 'Bath Toy',
      'Pieces': '4-5',
      'Age': '1+ Years',
      'Material': 'Water-safe Plastic'
    }),
    warranty: '1 Year Manufacturer Warranty',
    seo_title: 'Duck Family Bath Toy Set - Bath Time Toys | DigiDukaanLive',
    seo_description: 'Buy duck family bath toy set for kids and families. Water-safe toys for fun bath time.',
    seo_keywords: JSON.stringify(['bath toy', 'duck toy', 'water toy', 'bath time', 'floating toy'])
  },
  {
    name: 'Water Wheel Bath Toy',
    description: 'Interactive water wheel bath toy. Fun and engaging for kids during bath time.',
    short_description: 'Interactive water wheel bath toy',
    price: 180,
    price_includes_gst: true,
    category: 'Bath Toys',
    brand: 'DigiDukaanLive',
    hsn_code: '9503',
    age_group: '2-6 Years',
    occasion: JSON.stringify(['Birthday', 'General']),
    gender: 'unisex',
    material_type: 'Plastic',
    educational_value: true,
    minimum_order_quantity: 20,
    bulk_discount_percentage: 12,
    stock_quantity: 650,
    sku: 'KT-BATH-002',
    features: JSON.stringify([
      'Water wheel mechanism',
      'Interactive play',
      'Water-safe',
      'Educational',
      'Colorful'
    ]),
    specifications: JSON.stringify({
      'Type': 'Water Wheel',
      'Age': '2+ Years',
      'Material': 'Water-safe Plastic'
    }),
    warranty: '1 Year Manufacturer Warranty',
    seo_title: 'Water Wheel Bath Toy - Interactive Bath Toy | DigiDukaanLive',
    seo_description: 'Buy water wheel bath toy for kids and families. Interactive and fun for bath time.',
    seo_keywords: JSON.stringify(['water wheel', 'bath toy', 'interactive toy', 'bath time', 'water play'])
  },

  // Coin Bank
  {
    name: 'Piggy Bank - Classic Design',
    description: 'Classic piggy bank for teaching kids about saving money. Durable and colorful design.',
    short_description: 'Classic piggy coin bank',
    price: 150,
    price_includes_gst: true,
    category: 'Coin Bank',
    brand: 'DigiDukaanLive',
    hsn_code: '9503',
    age_group: '3-12 Years',
    occasion: JSON.stringify(['Birthday', 'General', 'Educational']),
    gender: 'unisex',
    material_type: 'Plastic',
    educational_value: true,
    minimum_order_quantity: 25,
    bulk_discount_percentage: 15,
    stock_quantity: 900,
    sku: 'KT-COIN-001',
    features: JSON.stringify([
      'Classic design',
      'Money saving',
      'Educational value',
      'Durable',
      'Colorful'
    ]),
    specifications: JSON.stringify({
      'Type': 'Piggy Bank',
      'Age': '3+ Years',
      'Material': 'Plastic',
      'Capacity': 'Large'
    }),
    warranty: '1 Year Manufacturer Warranty',
    seo_title: 'Piggy Bank Classic - Coin Bank Toy | DigiDukaanLive',
    seo_description: 'Buy classic piggy bank for kids and families. Teach kids about saving money.',
    seo_keywords: JSON.stringify(['piggy bank', 'coin bank', 'money saving', 'educational toy', 'piggy'])
  },
  {
    name: 'Electronic Coin Bank with Counter',
    description: 'Electronic coin bank with digital counter. Shows amount saved and teaches counting.',
    short_description: 'Electronic coin bank with counter',
    price: 450,
    price_includes_gst: true,
    category: 'Coin Bank',
    brand: 'DigiDukaanLive',
    hsn_code: '9503',
    age_group: '5-14 Years',
    occasion: JSON.stringify(['Birthday', 'General', 'Educational']),
    gender: 'unisex',
    material_type: 'Plastic',
    educational_value: true,
    minimum_order_quantity: 12,
    bulk_discount_percentage: 10,
    stock_quantity: 400,
    sku: 'KT-COIN-002',
    features: JSON.stringify([
      'Digital counter',
      'Electronic display',
      'Money counting',
      'Educational',
      'Modern design'
    ]),
    specifications: JSON.stringify({
      'Type': 'Electronic Coin Bank',
      'Age': '5+ Years',
      'Material': 'Plastic',
      'Battery': 'Included'
    }),
    warranty: '1 Year Manufacturer Warranty',
    seo_title: 'Electronic Coin Bank with Counter - Digital Piggy Bank | DigiDukaanLive',
    seo_description: 'Buy electronic coin bank for kids and families. Digital counter teaches money counting.',
    seo_keywords: JSON.stringify(['electronic coin bank', 'digital piggy bank', 'coin counter', 'money saving', 'educational'])
  },

  // Drone
  {
    name: 'Mini Drone with Camera',
    description: 'Mini drone with built-in camera for aerial photography. Perfect for kids and beginners.',
    short_description: 'Mini drone with camera',
    price: 2800,
    price_includes_gst: true,
    category: 'Drone',
    brand: 'DigiDukaanLive',
    hsn_code: '9503',
    age_group: '8-16 Years',
    occasion: JSON.stringify(['Birthday', 'General', 'Gift']),
    gender: 'unisex',
    material_type: 'Plastic',
    educational_value: true,
    minimum_order_quantity: 4,
    bulk_discount_percentage: 15,
    stock_quantity: 100,
    sku: 'KT-DRONE-001',
    features: JSON.stringify([
      'Built-in camera',
      'Remote control',
      'Stable flight',
      'LED lights',
      'Beginner friendly'
    ]),
    specifications: JSON.stringify({
      'Type': 'Quadcopter Drone',
      'Camera': '720p',
      'Age': '8+ Years',
      'Flight Time': '8-10 minutes',
      'Battery': 'Included'
    }),
    warranty: '1 Year Manufacturer Warranty',
    seo_title: 'Mini Drone with Camera - Kids Drone | DigiDukaanLive',
    seo_description: 'Buy mini drone with camera for kids and families. Perfect for kids and beginners.',
    seo_keywords: JSON.stringify(['drone', 'mini drone', 'drone with camera', 'quadcopter', 'flying toy'])
  },
  {
    name: 'Toy Drone - Beginner Friendly',
    description: 'Easy-to-fly toy drone perfect for beginners. Safe and fun for kids.',
    short_description: 'Beginner friendly toy drone',
    price: 1200,
    price_includes_gst: true,
    category: 'Drone',
    brand: 'DigiDukaanLive',
    hsn_code: '9503',
    age_group: '6-14 Years',
    occasion: JSON.stringify(['Birthday', 'General']),
    gender: 'unisex',
    material_type: 'Plastic',
    educational_value: true,
    minimum_order_quantity: 6,
    bulk_discount_percentage: 12,
    stock_quantity: 200,
    sku: 'KT-DRONE-002',
    features: JSON.stringify([
      'Beginner friendly',
      'Stable flight',
      'LED lights',
      'Safe design',
      'Easy controls'
    ]),
    specifications: JSON.stringify({
      'Type': 'Toy Drone',
      'Age': '6+ Years',
      'Flight Time': '6-8 minutes',
      'Battery': 'Included'
    }),
    warranty: '1 Year Manufacturer Warranty',
    seo_title: 'Toy Drone Beginner - Kids Flying Toy | DigiDukaanLive',
    seo_description: 'Buy beginner friendly toy drone for kids and families. Safe and fun for kids.',
    seo_keywords: JSON.stringify(['toy drone', 'beginner drone', 'kids drone', 'flying toy', 'quadcopter'])
  },

  // Electric Ride Ons
  {
    name: 'Electric Car Ride On - Red',
    description: 'Battery-powered electric car ride-on for kids. Safe and fun outdoor vehicle.',
    short_description: 'Electric car ride-on vehicle',
    price: 4500,
    price_includes_gst: true,
    category: 'Electric Ride Ons',
    brand: 'DigiDukaanLive',
    hsn_code: '9503',
    age_group: '3-8 Years',
    occasion: JSON.stringify(['Birthday', 'General', 'Gift']),
    gender: 'unisex',
    material_type: 'Plastic',
    educational_value: false,
    minimum_order_quantity: 3,
    bulk_discount_percentage: 10,
    stock_quantity: 80,
    sku: 'KT-ERIDE-001',
    features: JSON.stringify([
      'Battery powered',
      'Remote control option',
      'Safe design',
      'Music and lights',
      'Outdoor fun'
    ]),
    specifications: JSON.stringify({
      'Type': 'Electric Car',
      'Age': '3+ Years',
      'Max Weight': '30kg',
      'Battery': '6V Included',
      'Speed': '2-3 km/h'
    }),
    warranty: '1 Year Manufacturer Warranty',
    seo_title: 'Electric Car Ride On - Kids Electric Vehicle | DigiDukaanLive',
    seo_description: 'Buy electric car ride-on for kids and families. Battery-powered vehicle for kids.',
    seo_keywords: JSON.stringify(['electric car', 'ride on', 'kids vehicle', 'battery car', 'electric ride on'])
  },
  {
    name: 'Electric Motorcycle Ride On',
    description: 'Cool electric motorcycle ride-on for adventurous kids. Battery-powered and safe.',
    short_description: 'Electric motorcycle ride-on',
    price: 3200,
    price_includes_gst: true,
    category: 'Electric Ride Ons',
    brand: 'DigiDukaanLive',
    hsn_code: '9503',
    age_group: '3-8 Years',
    occasion: JSON.stringify(['Birthday', 'General']),
    gender: 'boys',
    material_type: 'Plastic',
    educational_value: false,
    minimum_order_quantity: 4,
    bulk_discount_percentage: 12,
    stock_quantity: 100,
    sku: 'KT-ERIDE-002',
    features: JSON.stringify([
      'Motorcycle design',
      'Battery powered',
      'Music and lights',
      'Safe construction',
      'Outdoor play'
    ]),
    specifications: JSON.stringify({
      'Type': 'Electric Motorcycle',
      'Age': '3+ Years',
      'Max Weight': '25kg',
      'Battery': '6V Included'
    }),
    warranty: '1 Year Manufacturer Warranty',
    seo_title: 'Electric Motorcycle Ride On - Kids Motorcycle | DigiDukaanLive',
    seo_description: 'Buy electric motorcycle ride-on for kids and families. Cool battery-powered vehicle.',
    seo_keywords: JSON.stringify(['electric motorcycle', 'ride on', 'kids motorcycle', 'battery vehicle', 'electric ride'])
  },

  // Manual Ride Ons
  {
    name: 'Pedal Car - Classic Red',
    description: 'Classic pedal car for kids. Manual operation promotes exercise and outdoor play.',
    short_description: 'Classic pedal car',
    price: 1800,
    price_includes_gst: true,
    category: 'Manual Ride Ons',
    brand: 'DigiDukaanLive',
    hsn_code: '9503',
    age_group: '3-8 Years',
    occasion: JSON.stringify(['Birthday', 'General']),
    gender: 'unisex',
    material_type: 'Plastic',
    educational_value: true,
    minimum_order_quantity: 5,
    bulk_discount_percentage: 10,
    stock_quantity: 150,
    sku: 'KT-MRIDE-001',
    features: JSON.stringify([
      'Pedal powered',
      'Classic design',
      'Exercise and play',
      'Durable construction',
      'Outdoor fun'
    ]),
    specifications: JSON.stringify({
      'Type': 'Pedal Car',
      'Age': '3+ Years',
      'Max Weight': '30kg',
      'Material': 'Plastic'
    }),
    warranty: '1 Year Manufacturer Warranty',
    seo_title: 'Pedal Car Classic - Manual Ride On | DigiDukaanLive',
    seo_description: 'Buy classic pedal car for kids and families. Manual ride-on promotes exercise.',
    seo_keywords: JSON.stringify(['pedal car', 'manual ride on', 'kids car', 'pedal vehicle', 'outdoor toy'])
  },
  {
    name: 'Balance Bike for Kids',
    description: 'Balance bike for toddlers to learn balance and coordination. No pedals, just push and glide.',
    short_description: 'Balance bike for toddlers',
    price: 1200,
    price_includes_gst: true,
    category: 'Manual Ride Ons',
    brand: 'DigiDukaanLive',
    hsn_code: '9503',
    age_group: '2-5 Years',
    occasion: JSON.stringify(['Birthday', 'General', 'Educational']),
    gender: 'unisex',
    material_type: 'Plastic',
    educational_value: true,
    minimum_order_quantity: 6,
    bulk_discount_percentage: 12,
    stock_quantity: 200,
    sku: 'KT-MRIDE-002',
    features: JSON.stringify([
      'No pedals',
      'Balance training',
      'Coordination development',
      'Lightweight',
      'Safe design'
    ]),
    specifications: JSON.stringify({
      'Type': 'Balance Bike',
      'Age': '2+ Years',
      'Max Weight': '25kg',
      'Material': 'Plastic'
    }),
    warranty: '1 Year Manufacturer Warranty',
    seo_title: 'Balance Bike for Kids - Toddler Bike | DigiDukaanLive',
    seo_description: 'Buy balance bike for kids and families. Helps toddlers learn balance and coordination.',
    seo_keywords: JSON.stringify(['balance bike', 'toddler bike', 'manual ride on', 'balance training', 'kids bike'])
  },

  // Musical Toys
  {
    name: 'Musical Keyboard Toy',
    description: 'Colorful musical keyboard toy with multiple sounds and melodies. Perfect for introducing kids to music.',
    short_description: 'Musical keyboard toy',
    price: 680,
    price_includes_gst: true,
    category: 'Musical Toys',
    brand: 'DigiDukaanLive',
    hsn_code: '9503',
    age_group: '3-10 Years',
    occasion: JSON.stringify(['Birthday', 'General', 'Educational']),
    gender: 'unisex',
    material_type: 'Plastic',
    educational_value: true,
    minimum_order_quantity: 10,
    bulk_discount_percentage: 10,
    stock_quantity: 350,
    sku: 'KT-MUSIC-001',
    features: JSON.stringify([
      'Multiple sounds',
      'Melodies included',
      'Colorful keys',
      'Educational',
      'Volume control'
    ]),
    specifications: JSON.stringify({
      'Type': 'Musical Keyboard',
      'Keys': '20+',
      'Age': '3+ Years',
      'Battery': 'Included'
    }),
    warranty: '1 Year Manufacturer Warranty',
    seo_title: 'Musical Keyboard Toy - Kids Keyboard | DigiDukaanLive',
    seo_description: 'Buy musical keyboard toy for kids and families. Introduces kids to music and sounds.',
    seo_keywords: JSON.stringify(['musical keyboard', 'keyboard toy', 'musical toy', 'kids keyboard', 'music toy'])
  },
  {
    name: 'Drum Set for Kids',
    description: 'Complete drum set for kids with drumsticks. Develops rhythm and musical skills.',
    short_description: 'Kids drum set with drumsticks',
    price: 850,
    price_includes_gst: true,
    category: 'Musical Toys',
    brand: 'DigiDukaanLive',
    hsn_code: '9503',
    age_group: '4-12 Years',
    occasion: JSON.stringify(['Birthday', 'General', 'Educational']),
    gender: 'unisex',
    material_type: 'Plastic',
    educational_value: true,
    minimum_order_quantity: 8,
    bulk_discount_percentage: 12,
    stock_quantity: 250,
    sku: 'KT-MUSIC-002',
    features: JSON.stringify([
      'Complete drum set',
      'Drumsticks included',
      'Rhythm development',
      'Colorful design',
      'Safe materials'
    ]),
    specifications: JSON.stringify({
      'Type': 'Drum Set',
      'Pieces': '3-4 Drums',
      'Age': '4+ Years',
      'Material': 'Plastic'
    }),
    warranty: '1 Year Manufacturer Warranty',
    seo_title: 'Drum Set for Kids - Musical Toy | DigiDukaanLive',
    seo_description: 'Buy kids drum set for kids and families. Develops rhythm and musical skills.',
    seo_keywords: JSON.stringify(['drum set', 'kids drums', 'musical toy', 'rhythm toy', 'drum toy'])
  },

  // Role Play Set
  {
    name: 'Doctor Play Set',
    description: 'Complete doctor role play set with medical tools and accessories. Encourages imaginative play.',
    short_description: 'Doctor role play set',
    price: 450,
    price_includes_gst: true,
    category: 'Role Play Set',
    brand: 'DigiDukaanLive',
    hsn_code: '9503',
    age_group: '3-10 Years',
    occasion: JSON.stringify(['Birthday', 'General', 'Educational']),
    gender: 'unisex',
    material_type: 'Plastic',
    educational_value: true,
    minimum_order_quantity: 12,
    bulk_discount_percentage: 10,
    stock_quantity: 500,
    sku: 'KT-ROLE-001',
    features: JSON.stringify([
      'Medical tools',
      'Doctor accessories',
      'Role play',
      'Imaginative play',
      'Educational'
    ]),
    specifications: JSON.stringify({
      'Type': 'Doctor Set',
      'Pieces': '10+',
      'Age': '3+ Years',
      'Material': 'Plastic'
    }),
    warranty: '1 Year Manufacturer Warranty',
    seo_title: 'Doctor Play Set - Role Play Toy | DigiDukaanLive',
    seo_description: 'Buy doctor play set for kids and families. Complete medical tools for role play.',
    seo_keywords: JSON.stringify(['doctor set', 'role play', 'medical toys', 'pretend play', 'doctor toy'])
  },
  {
    name: 'Kitchen Play Set',
    description: 'Complete kitchen role play set with utensils and accessories. Perfect for pretend cooking.',
    short_description: 'Kitchen role play set',
    price: 580,
    price_includes_gst: true,
    category: 'Role Play Set',
    brand: 'DigiDukaanLive',
    hsn_code: '9503',
    age_group: '3-10 Years',
    occasion: JSON.stringify(['Birthday', 'General']),
    gender: 'unisex',
    material_type: 'Plastic',
    educational_value: true,
    minimum_order_quantity: 10,
    bulk_discount_percentage: 12,
    stock_quantity: 400,
    sku: 'KT-ROLE-002',
    features: JSON.stringify([
      'Kitchen utensils',
      'Cooking accessories',
      'Role play',
      'Imaginative play',
      'Complete set'
    ]),
    specifications: JSON.stringify({
      'Type': 'Kitchen Set',
      'Pieces': '15+',
      'Age': '3+ Years',
      'Material': 'Plastic'
    }),
    warranty: '1 Year Manufacturer Warranty',
    seo_title: 'Kitchen Play Set - Role Play Kitchen | DigiDukaanLive',
    seo_description: 'Buy kitchen play set for kids and families. Complete utensils for pretend cooking.',
    seo_keywords: JSON.stringify(['kitchen set', 'role play', 'cooking toys', 'pretend play', 'kitchen toy'])
  }
];

async function getCategoryId(pool, categoryName) {
  const [byName] = await pool.execute(
    'SELECT id, slug FROM categories WHERE name = ? AND is_active = 1',
    [categoryName]
  );
  if (byName.length > 0) {
    return byName[0].id;
  }
  
  const slug = generateSlug(categoryName);
  const [bySlug] = await pool.execute(
    'SELECT id, slug FROM categories WHERE slug = ? AND is_active = 1',
    [slug]
  );
  if (bySlug.length > 0) {
    return bySlug[0].id;
  }
  
  console.warn(`[Toy Product Seed] ⚠ Category not found: ${categoryName}, using name as fallback`);
  return categoryName;
}

async function getBrandId(pool, brandName) {
  const [byName] = await pool.execute(
    'SELECT id, slug FROM brands WHERE name = ? AND is_active = 1',
    [brandName]
  );
  if (byName.length > 0) {
    return byName[0].id;
  }
  
  const slug = generateSlug(brandName);
  const [bySlug] = await pool.execute(
    'SELECT id, slug FROM brands WHERE slug = ? AND is_active = 1',
    [slug]
  );
  if (bySlug.length > 0) {
    return bySlug[0].id;
  }
  
  console.warn(`[Toy Product Seed] ⚠ Brand not found: ${brandName}, using name as fallback`);
  return brandName;
}

async function seedToyProducts() {
  try {
    console.log('[Toy Product Seed] Initializing database...');
    await initDatabase();
    const pool = getPool();

    // Ensure masters are seeded first
    console.log('[Toy Product Seed] Ensuring master data (categories and brands) exists...');
    try {
      await seedMasters();
    } catch (error) {
      console.warn('[Toy Product Seed] ⚠ Master seeding had issues, continuing anyway...');
    }

    console.log(`\n[Toy Product Seed] Seeding ${products.length} toy products...`);

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

        // Get category and brand from masters
        const categoryRef = await getCategoryId(pool, product.category);
        const brandRef = await getBrandId(pool, product.brand);
        
        let categoryValue = product.category;
        let brandValue = product.brand;
        
        if (typeof categoryRef === 'string' && categoryRef !== product.category) {
          const [catRow] = await pool.execute('SELECT name FROM categories WHERE id = ?', [categoryRef]);
          if (catRow.length > 0) {
            categoryValue = catRow[0].name;
          }
        }
        
        if (typeof brandRef === 'string' && brandRef !== product.brand) {
          const [brandRow] = await pool.execute('SELECT name FROM brands WHERE id = ?', [brandRef]);
          if (brandRow.length > 0) {
            brandValue = brandRow[0].name;
          }
        }

        if (existing.length > 0) {
          // Update existing product
          await pool.execute(
            `UPDATE products SET 
             description = ?, short_description = ?, price = ?, price_includes_gst = ?,
             category = ?, brand = ?, hsn_code = ?,
             age_group = ?, occasion = ?, gender = ?, material_type = ?,
             educational_value = ?, minimum_order_quantity = ?, bulk_discount_percentage = ?,
             stock_quantity = ?, sku = ?,
             features = ?, specifications = ?, warranty = ?,
             seo_title = ?, seo_description = ?, seo_keywords = ?,
             is_active = ?, updated_at = CURRENT_TIMESTAMP
             WHERE slug = ? OR name = ?`,
            [
              product.description,
              product.short_description,
              product.price,
              product.price_includes_gst || false,
              categoryValue,
              brandValue,
              product.hsn_code || null,
              product.age_group || null,
              product.occasion || null,
              product.gender || 'unisex',
              product.material_type || null,
              product.educational_value || false,
              product.minimum_order_quantity || 1,
              product.bulk_discount_percentage || 0,
              product.stock_quantity || 0,
              product.sku || null,
              product.features,
              product.specifications,
              product.warranty || null,
              product.seo_title,
              product.seo_description,
              product.seo_keywords,
              true,
              slug,
              product.name
            ]
          );
          console.log(`[Toy Product Seed] ↻ Updated: ${product.name}`);
          updated++;
        } else {
          // New product - insert
          await pool.execute(
            `INSERT INTO products (
              id, name, slug, description, short_description, price, price_includes_gst,
              category, brand, hsn_code,
              age_group, occasion, gender, material_type, educational_value,
              minimum_order_quantity, bulk_discount_percentage, stock_quantity, sku,
              features, specifications, warranty,
              seo_title, seo_description, seo_keywords, is_active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              id,
              product.name,
              slug,
              product.description,
              product.short_description,
              product.price,
              product.price_includes_gst || false,
              categoryValue,
              brandValue,
              product.hsn_code || null,
              product.age_group || null,
              product.occasion || null,
              product.gender || 'unisex',
              product.material_type || null,
              product.educational_value || false,
              product.minimum_order_quantity || 1,
              product.bulk_discount_percentage || 0,
              product.stock_quantity || 0,
              product.sku || null,
              product.features,
              product.specifications,
              product.warranty || null,
              product.seo_title,
              product.seo_description,
              product.seo_keywords,
              true
            ]
          );
          console.log(`[Toy Product Seed] ✓ Added: ${product.name} (Category: ${categoryValue}, Brand: ${brandValue}, Price: ₹${product.price})`);
          added++;
        }
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          console.log(`[Toy Product Seed] ⊗ Skipped (duplicate): ${product.name}`);
          skipped++;
        } else {
          console.error(`[Toy Product Seed] ✗ Error adding ${product.name}:`, error.message);
          errors++;
        }
      }
    }

    console.log('\n[Toy Product Seed] ✓ Toy product seeding completed!');
    console.log(`[Toy Product Seed] Added: ${added}`);
    console.log(`[Toy Product Seed] Updated: ${updated}`);
    console.log(`[Toy Product Seed] Skipped: ${skipped}`);
    console.log(`[Toy Product Seed] Errors: ${errors}`);
    process.exit(0);
  } catch (error) {
    console.error('[Toy Product Seed] ✗ Seeding failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  seedToyProducts();
}

module.exports = { seedToyProducts };
