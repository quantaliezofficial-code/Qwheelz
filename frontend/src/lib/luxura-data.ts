export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  badge: string;
  type: string;
  lifestyle: string;
  fuel: string;
  transmission: string;
  price: number;
  emi: number;
  seats: number;
  engine: string;
  power: string;
  mileage: string;
  images: string[];
  colors: { name: string; hex: string }[];
  description: string;
  features: string[];
  rating: number;
}


export const VEHICLES: Vehicle[] = [
  {
    id: 'tata-nexon',
    brand: 'Tata Motors',
    model: 'Nexon',
    badge: 'XZ+ Lux',
    type: 'Compact Premium SUV',
    lifestyle: 'SUV',
    fuel: 'Petrol',
    transmission: 'Manual',
    price: 14.49,
    emi: 21500,
    seats: 5,
    engine: '1.2L Turbocharged Revotron',
    power: '120 PS @ 5500 RPM',
    mileage: '17.3 km/pl',
    images: [
      'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=1200'
    ],
    colors: [
      { name: 'Crimson Red', hex: '#A6192E' },
      { name: 'Foliage Green', hex: '#2E463C' },
      { name: 'Calgary White', hex: '#F4F6F7' },
      { name: 'Daytona Grey', hex: '#3F4448' }
    ],
    description: 'The Tata Nexon is a beautifully structured compact SUV offering segment-leading safety, powerful turbocharged performance, and standard digital cockpit integration. Experience premium comfort paired with an athletic presence on the road.',
    features: [
      '5-Star Global NCAP Safety Rating',
      '10.25-inch Touchscreen Infotainment',
      'Ventilated Front Seats',
      'Electric Sunroof with Voice Assist',
      'Premium 8-Speaker JBL Sound System',
      'Wireless Android Auto & Apple CarPlay'
    ],
    rating: 4.8
  },
  {
    id: 'hyundai-ioniq-5',
    brand: 'Hyundai',
    model: 'Ioniq 5',
    badge: 'Premium EV Long Range',
    type: 'Premium EV SUV',
    lifestyle: 'Electric',
    fuel: 'Electric',
    transmission: 'Automatic',
    price: 46.05,
    emi: 72400,
    seats: 5,
    engine: '72.6 kWh Battery (Permanent Magnet Synchronous)',
    power: '217 PS & 350 N-m Torque',
    mileage: '631 km (ARAI Range)',
    images: [
      'https://images.unsplash.com/photo-1554744512-d6c603f27c54?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&q=80&w=1200'
    ],
    colors: [
      { name: 'Gravity Gold Matte', hex: '#D4AF37' },
      { name: 'Midnight Black', hex: '#111111' },
      { name: 'Optic White', hex: '#FFFFFF' },
      { name: 'Cyber Grey', hex: '#8C92AC' }
    ],
    description: 'Winner of World Car of the Year, the Hyundai Ioniq 5 combines retro-futuristic styling with breathtaking 800V ultra-fast charging capabilities. Step into a sustainable, lounge-like cabin that redefines your commuting experience.',
    features: [
      'World Car of the Year Winner',
      '800V Ultra-Fast Charging (10% to 80% in 18 min)',
      'Eco-Processed Leather Seats',
      'Level 2 ADAS with 21 Smart Safety Features',
      'Vehicle-to-Load (V2L) Power Source',
      'Vision Roof with Solar Panels'
    ],
    rating: 4.9
  },
  {
    id: 'mahindra-xuv700',
    brand: 'Mahindra',
    model: 'XUV700',
    badge: 'AX7 Luxury Pack',
    type: 'Luxurious 7-Seater SUV',
    lifestyle: 'SUV',
    fuel: 'Diesel',
    transmission: 'Automatic',
    price: 26.50,
    emi: 42800,
    seats: 7,
    engine: '2.2L mHawk Turbocharged Diesel',
    power: '185 PS @ 3500 RPM',
    mileage: '15.5 km/pl',
    images: [
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1562591188-1a5203a1106e?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&q=80&w=1200'
    ],
    colors: [
      { name: 'Midnight Black', hex: '#080D1A' },
      { name: 'Everest White', hex: '#FAFAFA' },
      { name: 'Red Rage', hex: '#8A0303' },
      { name: 'Electric Blue', hex: '#0047AB' }
    ],
    description: 'Unleash commanding power with the Mahindra XUV700. Merging a robust mHawk diesel engine with high-tech driver assistance and an expansive dual screen layout, it offers a luxurious yet athletic sanctuary for seven.',
    features: [
      'Advanced Driver Assistance System (ADAS)',
      'Dual 10.25-inch HD Superscreens',
      'Sony 3D Immersive 12-Speaker Audio',
      'Smart Filter Air Purifier',
      'Electric Smart Door Handles',
      'Panoramic Skyroof (Largest in Segment)'
    ],
    rating: 4.7
  },
  {
    id: 'luxura-executive',
    brand: 'Mercedes-Benz',
    model: 'E-Class Executive',
    badge: 'E350d Exclusive',
    type: 'Executive Luxury Sedan',
    lifestyle: 'Luxury',
    fuel: 'Diesel',
    transmission: 'Automatic',
    price: 82.50,
    emi: 125000,
    seats: 5,
    engine: '3.0L 6-Cylinder Inline Diesel',
    power: '286 PS & 600 N-m Torque',
    mileage: '14.2 km/pl',
    images: [
      'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1603386329225-868f9b1ee6c9?auto=format&fit=crop&q=80&w=1200'
    ],
    colors: [
      { name: 'Obsidian Black', hex: '#0B0C0E' },
      { name: 'Polar White', hex: '#FDFCFA' },
      { name: 'Selenite Grey', hex: '#5E646A' },
      { name: 'Cavansite Blue', hex: '#162133' }
    ],
    description: 'The epitome of executive prestige. The E-Class Executive delivers unparalleled ride quality through its AIRMATIC air suspension, custom Chauffeur package, and the revolutionary MBUX widescreen cockpit.',
    features: [
      'AIRMATIC Air Suspension with Adaptive Damping',
      'Chauffeur Package with Reclining Rear Seats',
      'Burmester Surround Sound System (590W)',
      'Active Parking Assist with 360 Camera',
      '64-Color Ambient Lighting Theme',
      'Wireless Charging Front & Rear'
    ],
    rating: 4.9
  },
  {
    id: 'luxura-gtr',
    brand: 'Porsche',
    model: '911 Carrera GTS',
    badge: 'GT-R Spec',
    type: 'High-Performance Sports Car',
    lifestyle: 'Luxury',
    fuel: 'Petrol',
    transmission: 'Automatic',
    price: 184.00,
    emi: 285000,
    seats: 2,
    engine: '3.0L Twin-Turbo Flat-6',
    power: '480 PS @ 6500 RPM',
    mileage: '9.1 km/pl',
    images: [
      'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1611245801484-9df45c166176?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1525609004556-c46c7d6cf0a3?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1200'
    ],
    colors: [
      { name: 'Guards Red', hex: '#D11919' },
      { name: 'Chalk Grey', hex: '#D4D5D6' },
      { name: 'Racing Yellow', hex: '#FCE300' },
      { name: 'Gentian Blue Metallic', hex: '#121C3E' }
    ],
    description: 'Designed for the purist. The Luxura GT-R delivers intoxicating flat-6 performance, razor-sharp handling, and an immediate connection to the tarmac. Built to dominate the racetrack while remaining perfectly refined for daily commutes.',
    features: [
      'Active Suspension Management (PASM)',
      'Sport Chrono Package with Mode Switch',
      'Carbon Fiber Reinforced Underbody',
      'Rear-Axle Steering Integration',
      'Porsche Ceramic Composite Brakes (PCCB)',
      'Race-Tex Microsuede Cabin Trim'
    ],
    rating: 5.0
  },
  {
    id: 'maruti-suzuki-grand-vitara',
    brand: 'Maruti Suzuki',
    model: 'Grand Vitara',
    badge: 'Zeta CNG',
    type: 'Smart Hybrid CNG SUV',
    lifestyle: 'CNG',
    fuel: 'CNG',
    transmission: 'Manual',
    price: 15.45,
    emi: 23500,
    seats: 5,
    engine: '1.5L K-Series Dual Jet',
    power: '87.8 PS (CNG mode)',
    mileage: '26.6 km/kg',
    images: [
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&q=80&w=1200'
    ],
    colors: [
      { name: 'Nexa Blue', hex: '#0F1A30' },
      { name: 'Splendid Silver', hex: '#C0C0C0' },
      { name: 'Grandeur Grey', hex: '#4A4F54' },
      { name: 'Arctic White', hex: '#F4F6F7' }
    ],
    description: 'The Grand Vitara Smart CNG merges eco-friendly performance with off-road capabilities. Boasting exceptional mileage, rich digital amenities, and a spacious 5-seater layout, it is the ultimate smart choice for sustainable urban travel.',
    features: [
      'Best-in-Class CNG Mileage of 26.6 km/kg',
      'Factory-Fitted Safe CNG Cylinder Box',
      '9-inch SmartPlay Pro+ Infotainment',
      'Auto Folding ORVMs & Keyless Entry',
      '6 Airbags & Hill Hold Assist',
      'Full LED Headlamps & Connected Taillights'
    ],
    rating: 4.6
  },
  {
    id: 'audi-etron-gt',
    brand: 'Audi',
    model: 'e-tron GT',
    badge: 'RS Quattro',
    type: 'High-Performance Electric GT',
    lifestyle: 'Electric',
    fuel: 'Electric',
    transmission: 'Automatic',
    price: 179.90,
    emi: 275000,
    seats: 5,
    engine: '93.4 kWh Dual Synchronous Motors',
    power: '646 PS & 830 N-m Torque',
    mileage: '481 km (WLTP Range)',
    images: [
      'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1554744512-d6c603f27c54?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&q=80&w=1200'
    ],
    colors: [
      { name: 'Kemora Grey', hex: '#585D64' },
      { name: 'Mythos Black', hex: '#0D0E10' },
      { name: 'Ascari Blue', hex: '#0B346E' }
    ],
    description: 'An aesthetic and engineering masterpiece. The RS e-tron GT merges progressive electrification with legendary Quattro performance. From its sweeping, muscular silhouette to the intense acceleration of its dual permanent magnet synchronous motors.',
    features: [
      'e-tron Sport Sound Acoustic Generator',
      'Adaptive Air Suspension with Continuous Damping Control',
      '800V Architecture (Charging up to 270 kW)',
      'Bang & Olufsen 3D Premium Sound System',
      'Matrix LED Headlights with Laser Spotlights',
      'Carbon Fiber Aero-Acoustic Active Body Kit'
    ],
    rating: 4.9
  },
  {
    id: 'lamborghini-huracan',
    brand: 'Lamborghini',
    model: 'Huracán Evo',
    badge: 'LP640-4',
    type: 'Ultimate Supercar',
    lifestyle: 'Luxury',
    fuel: 'Petrol',
    transmission: 'Automatic',
    price: 322.00,
    emi: 495000,
    seats: 2,
    engine: '5.2L Naturally Aspirated V10',
    power: '640 PS @ 8000 RPM',
    mileage: '7.2 km/pl',
    images: [
      'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1525609004556-c46c7d6cf0a3?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1542362567-b07eac79094d?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=1200'
    ],
    colors: [
      { name: 'Arancio Borealis (Orange)', hex: '#FF6F00' },
      { name: 'Verde Mantis (Green)', hex: '#00E676' },
      { name: 'Giallo Belenus (Yellow)', hex: '#FFEA00' }
    ],
    description: 'Breathtaking naturally aspirated V10 performance, state-of-the-art vehicle dynamics integration (LDVI), and an aerodynamic silhouette that cuts through the wind like a razor. Huracán Evo delivers unfiltered driver emotion.',
    features: [
      'Lamborghini Dinamica Veicolo Integrata (LDVI)',
      '4-Wheel Steering System',
      'Carbon Ceramic Brakes with Colored Calipers',
      '8.4-inch Capacitive Multi-Touch Screen',
      'Magnetorheological Suspension System',
      'Titanium Exhaust Valves & Sports Exhaust'
    ],
    rating: 5.0
  },
  {
    id: 'range-rover',
    brand: 'Land Rover',
    model: 'Range Rover',
    badge: 'Autobiography LWB',
    type: 'Ultra-Luxury SUV',
    lifestyle: 'SUV',
    fuel: 'Diesel',
    transmission: 'Automatic',
    price: 238.00,
    emi: 365000,
    seats: 5,
    engine: '3.0L 6-Cylinder MHEV Ingenium Diesel',
    power: '350 PS & 700 N-m Torque',
    mileage: '13.1 km/pl',
    images: [
      'https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1562591188-1a5203a1106e?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=1200'
    ],
    colors: [
      { name: 'Sunset Gold', hex: '#CFB53B' },
      { name: 'Charente Grey', hex: '#4A4F54' },
      { name: 'Belgravia Green', hex: '#1C3122' }
    ],
    description: 'The pinnacle of luxury SUV refined capability. Autobiography LWB merges unparalleled silent cabin serenity, bespoke semi-aniline leather seating, and executive class comfort with legendary off-road authority.',
    features: [
      'Executive Class Comfort Rear Seating',
      'Active Noise Cancellation with Headrest Speakers',
      'Electronic Air Suspension with Dynamic Response',
      'Cabin Air Purification Pro System',
      '13.1-inch Floating Curved Touchscreen',
      'All-Wheel Steering & Terrain Response 2'
    ],
    rating: 4.9
  }
];

export const BRANDS = [
  'Tata Motors',
  'Hyundai',
  'Mahindra',
  'Mercedes-Benz',
  'Porsche',
  'Maruti Suzuki',
  'Audi',
  'Lamborghini',
  'Land Rover'
];

export const FAQS = [
  {
    question: 'How do I apply for luxury car finance through Luxura Motors?',
    answer: 'You can easily apply by filling out our Finance Application Form online. Select your preferred vehicle model, provide basic contact details, and calculate your custom EMI using our interactive calculator. Our finance team will coordinate with HDFC Bank, ICICI Bank, or SBI to secure the lowest premium rates.'
  },
  {
    question: 'What is the minimum down payment required for vehicle purchase?',
    answer: 'Standard financing down payments start as low as 10% to 15% of the ex-showroom price, subject to credit score valuation. We offer zero down payment programs occasionally for repeat luxury upgrade clients.'
  },
  {
    question: 'How does the trade-in valuation estimator calculate my car\'s price?',
    answer: 'Our Trade-In Estimator uses historical trade-in records, regional market demands, manufacture year, kilometers driven, and vehicle condition to compute a precise fair-market price range. A final physical validation is scheduled at your convenience.'
  },
  {
    question: 'Can I customize my vehicle colors and optional premium equipment?',
    answer: 'Yes! Luxura Motors offers a bespoke customization engine. On the vehicle details page, you can select standard exterior colors, and our premium consultants can assist with adding bespoke interior leather stitching, trim panels, and upgraded sound packages.'
  }
];
