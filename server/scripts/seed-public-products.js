/**
 * Inserts catalog rows for images in public/images/Products/.
 * Run after seed-masters (adds Kids Drinkware + brands): node server/scripts/seed-public-products.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { initDatabase, getPool } = require('../db');
const { v4: uuidv4 } = require('uuid');
const { seedMasters } = require('./seed-masters');

function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function imageUrl(filename) {
  return '/images/Products/' + encodeURIComponent(filename);
}

/** @type {Array<Record<string, unknown> & { filename: string; slug: string }>} */
const CATALOG = [
  {
    filename: 'Baby Piano Fitness Rack - Play Kick Laugh and Learn .jpeg',
    slug: 'manku-baby-piano-fitness-rack',
    name: 'Baby Piano Fitness Rack — Play, Kick, Laugh & Learn',
    short_description: 'Soft play mat with arch, rattles, mirror, and detachable kick piano.',
    description:
      'Manku Toys baby gym with a soft padded mat, colourful overhead arch with hanging rattles and mirror, and a foot-piano for musical play. Encourages fine motor skills, touch, sight, limb movement, and hearing. Lightweight, foldable, and easy to clean. Retail box approx. 29.5 × 6.5 × 26.5 cm; unit ~370 g.',
    price: 1299,
    category: 'Baby Rattles',
    brand: 'Manku Toys',
    hsn_code: '9503',
    age_group: '0+ Months',
    occasion: JSON.stringify(['Baby Shower', 'Birthday', 'General']),
    gender: 'unisex',
    material_type: 'Plastic / Fabric mat',
    educational_value: true,
    minimum_order_quantity: 6,
    bulk_discount_percentage: 5,
    stock_quantity: 120,
    sku: 'KS-PUB-BABY-GYM-01',
    features: JSON.stringify([
      'Detachable kick piano',
      'Hanging toys with rattle and mirror',
      'Soft padded mat',
      'Foldable and easy to clean',
      'Sensory and motor skill play',
    ]),
    specifications: JSON.stringify({
      Brand: 'Manku Toys',
      Theme: 'Play, Kick, Laugh & Learn',
      'Retail box (cm L×B×H)': '29.5 × 6.5 × 26.5',
      'Unit weight': '~370 g',
    }),
    warranty: 'As per manufacturer',
    seo_title: 'Baby Piano Fitness Rack Play Mat | Manku Toys | DigiDukaanLive',
    seo_description:
      'Baby piano fitness rack with play mat, arch toys, and kick piano. Early development baby gym from Manku Toys.',
    seo_keywords: JSON.stringify(['baby gym', 'play mat', 'kick piano', 'Manku', 'infant toys', 'online store']),
  },
  {
    filename: 'Hopscotch - My Magical Unicorn  (Always follow your creams).jpeg',
    slug: 'manku-magical-unicorn-hopscotch',
    name: 'My Magical Unicorn Hopscotch Set',
    short_description: 'Interlocking ring hopscotch path with spinner — indoor active play.',
    description:
      'Unicorn-themed hopscotch set with colourful interlocking rings and connectors to build custom paths. Includes an action spinner (hop on one foot, jumping jacks, squats, claps, and more). Promotes physical activity, coordination, and focus. For ages 5+. Adult assembly required. Box approx. 32.5 × 32.5 × 6.5 cm; ~930 g per unit.',
    price: 999,
    category: 'Sports Toys',
    brand: 'Manku Toys',
    hsn_code: '9503',
    age_group: '5+ Years',
    occasion: JSON.stringify(['Birthday', 'General', 'Gift']),
    gender: 'unisex',
    material_type: 'Plastic',
    educational_value: true,
    minimum_order_quantity: 8,
    bulk_discount_percentage: 5,
    stock_quantity: 80,
    sku: 'KS-PUB-HOPSCOTCH-01',
    features: JSON.stringify([
      'Customizable hopscotch paths',
      'Interlocking rings and connectors',
      'Activity spinner included',
      'Unicorn and rainbow theme',
      'Indoor active play',
    ]),
    specifications: JSON.stringify({
      Brand: 'Manku Toys',
      'Recommended age': '5+',
      'Box (cm)': '32.5 × 32.5 × 6.5',
      'Unit weight': '~930 g',
    }),
    warranty: 'As per manufacturer',
    seo_title: 'My Magical Unicorn Hopscotch Set | Indoor Active Play | DigiDukaanLive',
    seo_description:
      'Unicorn hopscotch ring set with spinner for kids 5+. Custom paths for active indoor play.',
    seo_keywords: JSON.stringify(['hopscotch', 'unicorn toy', 'active play', 'Manku', 'online store']),
  },
  {
    filename: "Maria's Kitchen Set .jpeg",
    slug: 'manku-marias-kitchen-set',
    name: "Maria's Kitchen Play Set with Doll",
    short_description: 'Pink kitchen unit with doll and 25+ accessories.',
    description:
      'Manku Maria\'s Kitchen includes a detailed pink kitchen play unit and a blonde fashion doll with standing, sitting, head and hand movement. Over 25 accessories: chairs, cookware, utensils, plates, cups, and more. For ages 3+. Ideal for imaginative cooking role-play.',
    price: 1099,
    category: 'Role Play Set',
    brand: 'Manku Toys',
    hsn_code: '9503',
    age_group: '3+ Years',
    occasion: JSON.stringify(['Birthday', 'General', 'Gift']),
    gender: 'girls',
    material_type: 'Plastic',
    educational_value: true,
    minimum_order_quantity: 6,
    bulk_discount_percentage: 5,
    stock_quantity: 100,
    sku: 'KS-PUB-MARIA-KITCHEN-01',
    features: JSON.stringify([
      'Kitchen unit with storage and play areas',
      'Articulated doll included',
      '25+ accessories',
      'Pink and pastel colourway',
      'Imaginative role play',
    ]),
    specifications: JSON.stringify({
      Brand: 'Manku Toys',
      'Recommended age': '3+ years',
      Theme: "Maria's Kitchen",
    }),
    warranty: 'As per manufacturer',
    seo_title: "Maria's Kitchen Doll & Kitchen Set | Manku Toys | DigiDukaanLive",
    seo_description:
      "Maria's Kitchen play set with doll and 25+ kitchen accessories for kids 3+.",
    seo_keywords: JSON.stringify(['kitchen set toy', 'doll kitchen', 'Manku', 'role play', 'online store']),
  },
  {
    filename: 'Mini World Mordern Kitchen Set.jpeg',
    slug: 'manku-mini-world-modern-kitchen',
    name: 'Mini World Modern Kitchen Set',
    short_description: 'All-in-one pink kitchen with stove, sink, microwave, and utensils.',
    description:
      'Manku Mini World modern kitchen playset simulates real cooking scenes with stove, oven, sink, faucet, microwave, washing machine, and cabinets. Includes pots, pans, kettle, and utensils. Bright pink and white design for ages 3+. Great for group and parent-child play.',
    price: 899,
    category: 'Role Play Set',
    brand: 'Manku Toys',
    hsn_code: '9503',
    age_group: '3+ Years',
    occasion: JSON.stringify(['Birthday', 'General']),
    gender: 'unisex',
    material_type: 'Plastic',
    educational_value: true,
    minimum_order_quantity: 6,
    bulk_discount_percentage: 5,
    stock_quantity: 100,
    sku: 'KS-PUB-MINI-KITCHEN-01',
    features: JSON.stringify([
      'Stove, oven, sink, microwave',
      'Toy washing machine detail',
      'Pots, pans, kettle, utensils',
      'Cabinet and shelf storage',
      'Simulated real kitchen layout',
    ]),
    specifications: JSON.stringify({
      Brand: 'Manku Toys',
      Line: 'Mini World',
      'Recommended age': '3+ years',
    }),
    warranty: 'As per manufacturer',
    seo_title: 'Mini World Modern Kitchen Set Toy | Manku | DigiDukaanLive',
    seo_description: 'Modern toy kitchen set with appliances and cookware for preschool role play.',
    seo_keywords: JSON.stringify(['kitchen toy', 'play kitchen', 'Manku', 'Mini World', 'online store']),
  },
  {
    filename: 'Noras Doll House Play Set - Sweet Home.jpeg',
    slug: 'manku-noras-sweet-home-dollhouse',
    name: "Nora's Sweet Home Doll House Play Set",
    short_description: 'Two-storey dollhouse with bendable doll, small doll, and furniture.',
    description:
      'Manku Nora\'s Sweet Home features a two-storey pink and white dollhouse with blue accents, one fully bendable fashion doll, one small doll, and multiple furniture pieces (bed, sofa, chairs, vanity, table, wardrobe, and handbag accessory). For ages 3+. Box approx. 50 × 8 × 34 cm; ~716 g.',
    price: 1499,
    category: 'Doll & Doll House',
    brand: 'Manku Toys',
    hsn_code: '9503',
    age_group: '3+ Years',
    occasion: JSON.stringify(['Birthday', 'Gift', 'General']),
    gender: 'girls',
    material_type: 'Plastic',
    educational_value: true,
    minimum_order_quantity: 4,
    bulk_discount_percentage: 6,
    stock_quantity: 60,
    sku: 'KS-PUB-NORA-DOLLHOUSE-01',
    features: JSON.stringify([
      'Two-storey dollhouse',
      'Bendable doll + small doll',
      'Multiple room furniture pieces',
      'Sweet home styling',
      'Storytelling and imaginative play',
    ]),
    specifications: JSON.stringify({
      Brand: 'Manku Toys',
      'Recommended age': '3+',
      'Box (cm H×L×B)': '34 × 50 × 8',
      'Unit weight': '~716 g',
    }),
    warranty: 'As per manufacturer',
    seo_title: "Nora's Sweet Home Doll House Set | Manku Toys | DigiDukaanLive",
    seo_description:
      "Nora's Sweet Home dollhouse with dolls and furniture for kids 3+.",
    seo_keywords: JSON.stringify(['doll house', 'dollhouse', 'Manku', 'Sweet Home', 'online store']),
  },
  {
    filename: 'Space Hip Hop Drum .jpeg',
    slug: 'manku-space-hip-hop-drum-set',
    name: 'Space Hip-Hop Drum Set',
    short_description: 'Kids drum kit with cymbal, stool, and space graphics — ages 3+.',
    description:
      'Manku Space Hip-Hop drum set includes a three-piece drum layout, mounted cymbal on a stand, and a small stool. Space-themed artwork with astronauts and planets. Marketed as non-toxic; supports cause-and-effect play, confidence, and emotional expression. Tap. Boom. Rock on! Approx. 52.5 × 40 × 19.5 cm; ~1.72 kg.',
    price: 2199,
    category: 'Musical Toys',
    brand: 'Manku Toys',
    hsn_code: '9503',
    age_group: '3+ Years',
    occasion: JSON.stringify(['Birthday', 'Gift', 'General']),
    gender: 'unisex',
    material_type: 'Plastic / Metal parts',
    educational_value: true,
    minimum_order_quantity: 4,
    bulk_discount_percentage: 6,
    stock_quantity: 40,
    sku: 'KS-PUB-SPACE-DRUM-01',
    features: JSON.stringify([
      '3-piece drum layout + cymbal',
      'Stool included',
      'Space and astronaut theme',
      'Durable kids design',
      'Musical expression and rhythm play',
    ]),
    specifications: JSON.stringify({
      Brand: 'Manku Toys',
      Theme: 'Space Hip-Hop',
      'Approx. dimensions (cm L×H×B)': '52.5 × 40 × 19.5',
      'Approx. weight': '1.72 kg',
    }),
    warranty: 'As per manufacturer',
    seo_title: 'Space Hip Hop Kids Drum Set | Manku Toys | DigiDukaanLive',
    seo_description: 'Space-themed kids drum kit with cymbal and stool for ages 3+.',
    seo_keywords: JSON.stringify(['kids drum', 'musical toy', 'drum set', 'Manku', 'online store']),
  },
  {
    filename: 'Twinkle Fashion Beauty Set sharing happiness Doll.jpeg',
    slug: 'manku-twinkle-fashion-beauty-set',
    name: 'Twinkle Fashion Beauty Set with Doll',
    short_description: 'Fashion doll with beauty accessories and multiple shoe pairs.',
    description:
      'Manku Twinkle Fashion Beauty Set includes an articulated fashion doll, hairbrush, comb, toy hair dryer, mirror, beauty accessories, and four pairs of shoes. Pink glitter styling with “Sharing Happiness” artwork. Doll stands, sits, and has movable head and hands. For ages 3+.',
    price: 649,
    category: 'Role Play Set',
    brand: 'Manku Toys',
    hsn_code: '9503',
    age_group: '3+ Years',
    occasion: JSON.stringify(['Birthday', 'Gift', 'General']),
    gender: 'girls',
    material_type: 'Plastic',
    educational_value: false,
    minimum_order_quantity: 12,
    bulk_discount_percentage: 8,
    stock_quantity: 150,
    sku: 'KS-PUB-TWINKLE-BEAUTY-01',
    features: JSON.stringify([
      'Fashion doll with articulation',
      'Hair and beauty role-play pieces',
      '4 pairs of shoes',
      'Brush, comb, dryer, mirror',
      'Glitter fashion theme',
    ]),
    specifications: JSON.stringify({
      Brand: 'Manku Toys',
      Line: 'Twinkle',
      'Recommended age': '3+ years',
    }),
    warranty: 'As per manufacturer',
    seo_title: 'Twinkle Fashion Beauty Doll Set | Manku Toys | DigiDukaanLive',
    seo_description: 'Fashion doll beauty set with accessories and shoes for kids 3+.',
    seo_keywords: JSON.stringify(['fashion doll', 'beauty set', 'Manku', 'Twinkle', 'online store']),
  },
  {
    filename: 'Electric Water Gun Battery USB Charging.jpeg',
    slug: 'klal-splash-blitz-electric-water-gun-kb1501',
    name: 'Splash Blitz Electric Water Gun (USB Charging) — KB1501',
    short_description: 'Rechargeable electric water blaster, 350 ml tank, ~7–9 m range.',
    description:
      'K.LAL Splash Blitz / Storm-style electric water gun with 3.7V Li battery and USB charging. Features illuminated muzzle, electric slide action, detachable scope, and ~350 ml capacity. Approx. range 7–9 metres. Shown colour: Explore Black. For ages 8+. Box approx. 20.7 × 16.3 × 6.8 cm. Model KB1501.',
    price: 1299,
    category: 'Sports Toys',
    brand: 'K.LAL',
    hsn_code: '9503',
    age_group: '8+ Years',
    occasion: JSON.stringify(['Summer', 'Holi', 'Birthday', 'General']),
    gender: 'unisex',
    material_type: 'Plastic',
    educational_value: false,
    minimum_order_quantity: 12,
    bulk_discount_percentage: 8,
    stock_quantity: 200,
    sku: 'KS-PUB-WGUN-KB1501',
    features: JSON.stringify([
      'USB rechargeable 3.7V battery',
      '350 ml water tank',
      'Approx. 7–9 m range',
      'Light-up muzzle effect',
      'Scope and tactical styling',
    ]),
    specifications: JSON.stringify({
      Brand: 'K.LAL',
      Model: 'KB1501',
      'Gun length': '~20.5 cm',
      'Battery': '3.7V Li (included; USB charge)',
    }),
    warranty: 'As per manufacturer',
    seo_title: 'Electric Water Gun Splash Blitz KB1501 USB | K.LAL | DigiDukaanLive',
    seo_description:
      'Rechargeable electric water gun KB1501 with USB charging and 350 ml tank.',
    seo_keywords: JSON.stringify(['water gun', 'electric water gun', 'Holi', 'K.LAL', 'online store']),
  },
  {
    filename: 'Amaze Pexpo 800 ML MRP 1199.jpeg',
    slug: 'pexpo-amaze-800ml-insulated-bottle',
    name: 'Pexpo Amaze Insulated Bottle — 800 ml',
    short_description: 'Gradient stainless steel insulated bottle with flip lid and carry loop.',
    description:
      'Pexpo Amaze series slim insulated bottle (~800 ml capacity per listing title). Matte gradient finishes with flip-top lid and integrated carry handle. Stainless steel construction for hot and cold retention. MRP reference on pack ₹1199 — ask in store for our price. Assorted gradient colours (green/blue, blue/black, pink/mint).',
    price: 1199,
    category: 'Kids Drinkware',
    brand: 'Pexpo',
    hsn_code: '7323',
    age_group: 'All Ages',
    occasion: JSON.stringify(['Back to School', 'General', 'Gift']),
    gender: 'unisex',
    material_type: 'Stainless steel',
    educational_value: false,
    minimum_order_quantity: 12,
    bulk_discount_percentage: 10,
    stock_quantity: 240,
    sku: 'KS-PUB-PEXPO-AMAZE-800',
    features: JSON.stringify([
      'Vacuum insulated steel body',
      'Flip lid with carry loop',
      'Gradient colour options',
      '800 ml class capacity',
      'School and travel friendly',
    ]),
    specifications: JSON.stringify({
      Brand: 'Pexpo',
      Series: 'Amaze',
      Capacity: '800 ml (per product title)',
      MRP: '₹1199 (on packaging)',
    }),
    warranty: 'As per Pexpo / retailer policy',
    seo_title: 'Pexpo Amaze 800 ml Insulated Bottle | DigiDukaanLive',
    seo_description: 'Pexpo Amaze stainless steel insulated water bottle 800 ml.',
    seo_keywords: JSON.stringify(['Pexpo', 'Amaze', 'insulated bottle', '800ml', 'online store']),
  },
  {
    filename: 'Atlas Pexpo Water Bottle 1000 ML MRP 1299.jpeg',
    slug: 'pexpo-atlas-1000ml-insulated-bottle',
    name: 'Pexpo Atlas Insulated Bottle — 1000 ml',
    short_description: 'Large-capacity insulated flask with push-button lid and carry loop.',
    description:
      'Pexpo Atlas 1000 ml class insulated stainless steel bottle with matte finish, ergonomic groove, and multi-part lid with push button and carry loop. Colours include navy, pink/mint, and black/purple variants. Designed for long hot/cold retention. MRP reference ₹1299 on listing.',
    price: 1299,
    category: 'Kids Drinkware',
    brand: 'Pexpo',
    hsn_code: '7323',
    age_group: 'All Ages',
    occasion: JSON.stringify(['Back to School', 'Sports', 'General']),
    gender: 'unisex',
    material_type: 'Stainless steel',
    educational_value: false,
    minimum_order_quantity: 12,
    bulk_discount_percentage: 10,
    stock_quantity: 200,
    sku: 'KS-PUB-PEXPO-ATLAS-1000',
    features: JSON.stringify([
      '1000 ml class capacity',
      'Vacuum insulated stainless steel',
      'Push-button flip lid',
      'Built-in carry handle',
      'Multiple colourways',
    ]),
    specifications: JSON.stringify({
      Brand: 'Pexpo',
      Series: 'Atlas',
      Capacity: '1000 ml (per product title)',
      MRP: '₹1299 (on packaging)',
    }),
    warranty: 'As per Pexpo / retailer policy',
    seo_title: 'Pexpo Atlas 1000 ml Insulated Bottle | DigiDukaanLive',
    seo_description: 'Pexpo Atlas 1 Litre insulated stainless steel water bottle.',
    seo_keywords: JSON.stringify(['Pexpo', 'Atlas', '1 litre bottle', 'insulated', 'online store']),
  },
  {
    filename: 'Milton Steel Thermoware Insulated inner steel water bottle MRP 430.jpeg',
    slug: 'milton-steel-convey-900-insulated-bottle',
    name: 'Milton Steel Convey 900 — Insulated Inner Steel Bottle',
    short_description: 'Milton Steel Thermoware 900 ml bottle with strap; MRP ₹430 tier.',
    description:
      'Milton Steel Thermoware Steel Convey 900 insulated bottle with stainless steel inner, two-tone blue body, flip-style lid, and grey carry strap. Part of Milton’s 50-year trusted range. MRP tier ₹430 as marked on stock image.',
    price: 430,
    category: 'Kids Drinkware',
    brand: 'Milton',
    hsn_code: '7323',
    age_group: 'All Ages',
    occasion: JSON.stringify(['Back to School', 'General']),
    gender: 'unisex',
    material_type: 'Stainless steel inner',
    educational_value: false,
    minimum_order_quantity: 24,
    bulk_discount_percentage: 12,
    stock_quantity: 300,
    sku: 'KS-PUB-MILTON-CONVEY-900',
    features: JSON.stringify([
      'Insulated inner steel',
      'Carry strap',
      'Flip / sip lid style',
      '~900 ml capacity (model name)',
      'Milton Steel Thermoware line',
    ]),
    specifications: JSON.stringify({
      Brand: 'Milton',
      Model: 'Steel Convey 900',
      MRP: '₹430 (on stock label)',
    }),
    warranty: 'As per Milton India policy',
    seo_title: 'Milton Steel Convey 900 Insulated Bottle | DigiDukaanLive',
    seo_description: 'Milton Steel Convey 900 insulated inner steel water bottle.',
    seo_keywords: JSON.stringify(['Milton', 'Steel Convey', 'thermoware', '900ml', 'online store']),
  },
  {
    filename: 'Milton Steel Thermoware Insulated inner steel water bottle MRP 580.jpeg',
    slug: 'milton-steel-marble-900-insulated-bottle',
    name: 'Milton Steel Marble 900 — Insulated Inner Steel Bottle',
    short_description: 'Marble-finish 900 ml Milton thermoware bottle; MRP ₹580 tier.',
    description:
      'Milton Steel Thermoware Steel Marble 900 insulated bottle with pink–white marble gradient finish, steel cup-style cap, and grey fabric strap. Stainless steel inner for temperature retention. MRP tier ₹580 as marked on stock image.',
    price: 580,
    category: 'Kids Drinkware',
    brand: 'Milton',
    hsn_code: '7323',
    age_group: 'All Ages',
    occasion: JSON.stringify(['Back to School', 'Gift', 'General']),
    gender: 'unisex',
    material_type: 'Stainless steel inner',
    educational_value: false,
    minimum_order_quantity: 24,
    bulk_discount_percentage: 12,
    stock_quantity: 300,
    sku: 'KS-PUB-MILTON-MARBLE-900',
    features: JSON.stringify([
      'Marble gradient finish',
      'Insulated inner steel',
      'Cup-cap and carry strap',
      '~900 ml (model name)',
      'Milton Steel Thermoware line',
    ]),
    specifications: JSON.stringify({
      Brand: 'Milton',
      Model: 'Steel Marble 900',
      MRP: '₹580 (on stock label)',
    }),
    warranty: 'As per Milton India policy',
    seo_title: 'Milton Steel Marble 900 Insulated Bottle | DigiDukaanLive',
    seo_description: 'Milton Steel Marble 900 insulated inner steel water bottle.',
    seo_keywords: JSON.stringify(['Milton', 'Steel Marble', 'thermoware', '900ml', 'online store']),
  },
  {
    filename:
      'EKTA Bullet Block Game 400Pcs Fun to Build Interactive Block That Fits at Any Angle+Inspiration Booklet Inside-Made in India.jpg',
    slug: 'ekta-bullet-block-game-400pcs',
    name: 'EKTA Bullet Block Game — 400 Pieces',
    short_description: '400-piece angled building blocks with inspiration booklet; made in India.',
    description:
      'EKTA Bullet Block Game includes 400 colourful pieces designed to connect at angles for creative 3D builds. Includes an inspiration booklet for model ideas. Supports fine motor skills, spatial thinking, and open-ended construction play. Suitable for ages 5+.',
    price: 899,
    category: 'Educational & Learning Toys',
    brand: 'EKTA',
    hsn_code: '9503',
    age_group: '5+ Years',
    occasion: JSON.stringify(['Birthday', 'General', 'Gift']),
    gender: 'unisex',
    material_type: 'Plastic',
    educational_value: true,
    minimum_order_quantity: 4,
    bulk_discount_percentage: 5,
    stock_quantity: 60,
    sku: 'KS-PUB-EKTA-BULLET-400',
    features: JSON.stringify([
      '400 interlocking bullet-style blocks',
      'Builds at multiple angles',
      'Inspiration booklet included',
      'Made in India',
      'Creative construction play',
    ]),
    specifications: JSON.stringify({
      Brand: 'EKTA',
      Pieces: '400',
      'Recommended age': '5+',
    }),
    warranty: 'As per manufacturer',
    seo_title: 'EKTA Bullet Block Game 400 Pieces | Building Blocks | DigiDukaanLive',
    seo_description: 'EKTA 400-piece bullet block construction set with booklet. Made in India.',
    seo_keywords: JSON.stringify(['EKTA', 'building blocks', '400 pieces', 'construction toy', 'India']),
  },
  {
    filename:
      'EKTA Smart Builders Building Blocks Set-3 Building block Game for Kids (Multicolor, Big Size) 75 Pieces.jpg',
    slug: 'ekta-smart-builders-set-3-75-pieces',
    name: 'EKTA Smart Builders Set-3 — 75 Large Blocks',
    short_description: '75 multicolour big-size building blocks for toddlers and preschoolers.',
    description:
      'EKTA Smart Builders Set-3 offers 75 chunky multicolour blocks sized for small hands. Ideal for early stacking, colour recognition, and imaginative building. Durable plastic pieces for indoor play.',
    price: 549,
    category: 'Educational & Learning Toys',
    brand: 'EKTA',
    hsn_code: '9503',
    age_group: '3+ Years',
    occasion: JSON.stringify(['Birthday', 'General', 'Gift']),
    gender: 'unisex',
    material_type: 'Plastic',
    educational_value: true,
    minimum_order_quantity: 6,
    bulk_discount_percentage: 5,
    stock_quantity: 80,
    sku: 'KS-PUB-EKTA-SMART-75',
    features: JSON.stringify([
      '75 large multicolour blocks',
      'Chunky pieces for small hands',
      'Stacking and creative play',
      'Set-3 Smart Builders line',
    ]),
    specifications: JSON.stringify({
      Brand: 'EKTA',
      Line: 'Smart Builders Set-3',
      Pieces: '75',
      Size: 'Big size blocks',
    }),
    warranty: 'As per manufacturer',
    seo_title: 'EKTA Smart Builders Set-3 75 Large Blocks | DigiDukaanLive',
    seo_description: 'EKTA Smart Builders 75-piece big multicolour block set for kids 3+.',
    seo_keywords: JSON.stringify(['EKTA', 'Smart Builders', 'large blocks', 'preschool', 'online store']),
  },
  {
    filename: 'Ekta Young Builders Set-1 Blocks & Bricks Toy Game (Multicolor).webp',
    slug: 'ekta-young-builders-set-1',
    name: 'EKTA Young Builders Set-1 — Blocks & Bricks',
    short_description: 'Multicolour blocks and bricks starter set for young builders.',
    description:
      'EKTA Young Builders Set-1 combines blocks and bricks in bright colours for first construction play. Helps develop hand-eye coordination and creativity. Compact starter set for ages 3+.',
    price: 399,
    category: 'Educational & Learning Toys',
    brand: 'EKTA',
    hsn_code: '9503',
    age_group: '3+ Years',
    occasion: JSON.stringify(['Birthday', 'General']),
    gender: 'unisex',
    material_type: 'Plastic',
    educational_value: true,
    minimum_order_quantity: 8,
    bulk_discount_percentage: 5,
    stock_quantity: 100,
    sku: 'KS-PUB-EKTA-YOUNG-1',
    features: JSON.stringify([
      'Blocks and bricks mix',
      'Multicolour pieces',
      'Starter construction set',
      'Young Builders line',
    ]),
    specifications: JSON.stringify({
      Brand: 'EKTA',
      Line: 'Young Builders Set-1',
    }),
    warranty: 'As per manufacturer',
    seo_title: 'EKTA Young Builders Set-1 Blocks & Bricks | DigiDukaanLive',
    seo_description: 'EKTA Young Builders multicolour blocks and bricks toy set for kids.',
    seo_keywords: JSON.stringify(['EKTA', 'Young Builders', 'blocks', 'bricks', 'kids toys']),
  },
  {
    filename: 'Fashion Villa - Dress Decorate Dream Doll House.jpeg',
    slug: 'fashion-villa-dress-decorate-dream-doll-house',
    name: 'Fashion Villa — Dress, Decorate & Dream Doll House',
    short_description: 'Doll house playset for dress-up and decoration role-play.',
    description:
      'Fashion Villa doll house encourages “dress, decorate, dream” imaginative play with a detailed house setting for dolls and accessories. Ideal for storytelling and creative arrangement. For ages 3+.',
    price: 1299,
    category: 'Doll & Doll House',
    brand: 'Manku Toys',
    hsn_code: '9503',
    age_group: '3+ Years',
    occasion: JSON.stringify(['Birthday', 'General', 'Gift']),
    gender: 'girls',
    material_type: 'Plastic',
    educational_value: true,
    minimum_order_quantity: 6,
    bulk_discount_percentage: 5,
    stock_quantity: 70,
    sku: 'KS-PUB-FASHION-VILLA-DOLLHOUSE',
    features: JSON.stringify([
      'Fashion villa theme',
      'Dress and decorate play',
      'Dream doll house styling',
      'Imaginative role-play',
    ]),
    specifications: JSON.stringify({
      Brand: 'Manku Toys',
      Theme: 'Fashion Villa',
    }),
    warranty: 'As per manufacturer',
    seo_title: 'Fashion Villa Dress Decorate Dream Doll House | DigiDukaanLive',
    seo_description: 'Fashion Villa doll house for dress-up and decoration play. Ages 3+.',
    seo_keywords: JSON.stringify(['doll house', 'Fashion Villa', 'Manku', 'role play', 'girls toys']),
  },
];

async function seedPublicProducts() {
  await initDatabase();
  const pool = getPool();

  console.log('[Public Products] Ensuring master categories & brands...');
  try {
    await seedMasters();
  } catch (e) {
    console.warn('[Public Products] seedMasters warning:', e.message);
  }

  let added = 0;
  let skipped = 0;

  for (const item of CATALOG) {
    const { filename, slug, ...rest } = item;
    const mainImage = imageUrl(filename);
    const images = JSON.stringify([mainImage]);

    const [existing] = await pool.execute('SELECT id FROM products WHERE slug = ? AND is_deleted = 0', [slug]);
    if (existing.length > 0) {
      console.log(`[Public Products] ⊗ Skip (exists): ${slug}`);
      skipped++;
      continue;
    }

    const id = uuidv4();
    const name = rest.name;
    const values = [
      id,
      name,
      slug,
      rest.description,
      rest.short_description,
      rest.price,
      true,
      rest.category,
      rest.brand,
      rest.hsn_code,
      mainImage,
      images,
      rest.age_group,
      rest.occasion,
      rest.gender,
      rest.material_type,
      rest.educational_value,
      rest.minimum_order_quantity,
      rest.bulk_discount_percentage,
      rest.stock_quantity,
      rest.sku,
      rest.features,
      rest.specifications,
      rest.warranty,
      rest.seo_title,
      rest.seo_description,
      rest.seo_keywords,
      true,
    ];

    await pool.execute(
      `INSERT INTO products (
        id, name, slug, description, short_description, price, price_includes_gst,
        category, brand, hsn_code, image, images,
        age_group, occasion, gender, material_type, educational_value,
        minimum_order_quantity, bulk_discount_percentage, stock_quantity, sku,
        features, specifications, warranty,
        seo_title, seo_description, seo_keywords, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      values
    );
    console.log(`[Public Products] ✓ Added: ${name}`);
    added++;
  }

  console.log(`\n[Public Products] Done. Added: ${added}, skipped: ${skipped}`);
  process.exit(0);
}

if (require.main === module) {
  seedPublicProducts().catch((err) => {
    console.error('[Public Products]', err);
    process.exit(1);
  });
}

module.exports = { seedPublicProducts, CATALOG, imageUrl };
