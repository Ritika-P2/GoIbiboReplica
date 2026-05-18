require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

// ─── Helpers ────────────────────────────────────────────────────────────────

function addHours(date, h) {
  return new Date(date.getTime() + h * 60 * 60 * 1000)
}
function addDays(date, d) {
  return new Date(date.getTime() + d * 24 * 60 * 60 * 1000)
}
function future(daysFromNow, hour = 6) {
  const d = addDays(new Date(), daysFromNow)
  d.setHours(hour, 0, 0, 0)
  return d
}

// ─── Users ───────────────────────────────────────────────────────────────────

async function seedUsers() {
  const hash = (pw) => bcrypt.hashSync(pw, 12)

  const users = [
    { name: 'Admin User',    email: 'admin@goibibo.com',  password: hash('Admin@1234'),  role: 'ADMIN', phone: '9000000001' },
    { name: 'Ritika Purohit', email: 'ritika@goibibo.com', password: hash('Test@1234'),  role: 'USER',  phone: '9876543210' },
    { name: 'Arjun Mehta',   email: 'arjun@goibibo.com',  password: hash('Test@1234'),  role: 'USER',  phone: '9123456789' },
    { name: 'Priya Sharma',  email: 'priya@goibibo.com',  password: hash('Test@1234'),  role: 'USER',  phone: '9988776655' },
  ]

  const created = []
  for (const u of users) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: u,
    })
    created.push(user)
  }
  console.log(`  ✓ ${created.length} users`)
  return created
}

// ─── Flights ─────────────────────────────────────────────────────────────────

async function seedFlights() {
  const routes = [
    // DEL → BOM
    { flightNumber: 'G8-101', airline: 'GoAir',         origin: 'DEL', destination: 'BOM', dep: future(1, 6),  dur: 135, price: 4299,  seats: 180, cabin: 'ECONOMY',         stops: 0 },
    { flightNumber: '6E-201', airline: 'IndiGo',        origin: 'DEL', destination: 'BOM', dep: future(1, 9),  dur: 140, price: 3999,  seats: 186, cabin: 'ECONOMY',         stops: 0 },
    { flightNumber: 'AI-101', airline: 'Air India',     origin: 'DEL', destination: 'BOM', dep: future(1, 12), dur: 150, price: 5500,  seats: 200, cabin: 'ECONOMY',         stops: 0 },
    { flightNumber: 'UK-901', airline: 'Vistara',       origin: 'DEL', destination: 'BOM', dep: future(1, 15), dur: 135, price: 7200,  seats: 160, cabin: 'BUSINESS',        stops: 0 },
    { flightNumber: 'SG-301', airline: 'SpiceJet',      origin: 'DEL', destination: 'BOM', dep: future(2, 7),  dur: 155, price: 3599,  seats: 174, cabin: 'ECONOMY',         stops: 1 },
    { flightNumber: '6E-205', airline: 'IndiGo',        origin: 'DEL', destination: 'BOM', dep: future(2, 18), dur: 140, price: 4599,  seats: 186, cabin: 'ECONOMY',         stops: 0 },

    // BOM → DEL
    { flightNumber: 'G8-102', airline: 'GoAir',         origin: 'BOM', destination: 'DEL', dep: future(1, 8),  dur: 135, price: 4199,  seats: 180, cabin: 'ECONOMY',         stops: 0 },
    { flightNumber: '6E-202', airline: 'IndiGo',        origin: 'BOM', destination: 'DEL', dep: future(1, 11), dur: 140, price: 3899,  seats: 186, cabin: 'ECONOMY',         stops: 0 },
    { flightNumber: 'AI-102', airline: 'Air India',     origin: 'BOM', destination: 'DEL', dep: future(2, 14), dur: 150, price: 5800,  seats: 200, cabin: 'ECONOMY',         stops: 0 },

    // DEL → BLR
    { flightNumber: '6E-401', airline: 'IndiGo',        origin: 'DEL', destination: 'BLR', dep: future(1, 7),  dur: 170, price: 4599,  seats: 186, cabin: 'ECONOMY',         stops: 0 },
    { flightNumber: 'SG-401', airline: 'SpiceJet',      origin: 'DEL', destination: 'BLR', dep: future(1, 10), dur: 175, price: 3999,  seats: 174, cabin: 'ECONOMY',         stops: 0 },
    { flightNumber: 'UK-401', airline: 'Vistara',       origin: 'DEL', destination: 'BLR', dep: future(2, 13), dur: 170, price: 8500,  seats: 160, cabin: 'BUSINESS',        stops: 0 },

    // BLR → DEL
    { flightNumber: '6E-402', airline: 'IndiGo',        origin: 'BLR', destination: 'DEL', dep: future(1, 9),  dur: 170, price: 4799,  seats: 186, cabin: 'ECONOMY',         stops: 0 },
    { flightNumber: 'AI-401', airline: 'Air India',     origin: 'BLR', destination: 'DEL', dep: future(2, 16), dur: 180, price: 6200,  seats: 200, cabin: 'ECONOMY',         stops: 0 },

    // DEL → CCU
    { flightNumber: '6E-501', airline: 'IndiGo',        origin: 'DEL', destination: 'CCU', dep: future(1, 8),  dur: 150, price: 4200,  seats: 186, cabin: 'ECONOMY',         stops: 0 },
    { flightNumber: 'SG-501', airline: 'SpiceJet',      origin: 'DEL', destination: 'CCU', dep: future(2, 11), dur: 160, price: 3800,  seats: 174, cabin: 'ECONOMY',         stops: 1 },

    // BOM → GOI (Goa)
    { flightNumber: '6E-601', airline: 'IndiGo',        origin: 'BOM', destination: 'GOI', dep: future(1, 7),  dur: 65,  price: 2999,  seats: 186, cabin: 'ECONOMY',         stops: 0 },
    { flightNumber: 'G8-601', airline: 'GoAir',         origin: 'BOM', destination: 'GOI', dep: future(1, 14), dur: 70,  price: 2599,  seats: 180, cabin: 'ECONOMY',         stops: 0 },

    // DEL → GOI
    { flightNumber: 'AI-601', airline: 'Air India',     origin: 'DEL', destination: 'GOI', dep: future(1, 9),  dur: 120, price: 5200,  seats: 200, cabin: 'ECONOMY',         stops: 0 },
    { flightNumber: 'UK-601', airline: 'Vistara',       origin: 'DEL', destination: 'GOI', dep: future(2, 11), dur: 125, price: 9800,  seats: 160, cabin: 'FIRST',           stops: 0 },

    // BOM ↔ BLR
    { flightNumber: '6E-701', airline: 'IndiGo',        origin: 'BOM', destination: 'BLR', dep: future(1, 6),  dur: 100, price: 3499,  seats: 186, cabin: 'ECONOMY',         stops: 0 },
    { flightNumber: 'SG-701', airline: 'SpiceJet',      origin: 'BOM', destination: 'BLR', dep: future(1, 13), dur: 105, price: 3199,  seats: 174, cabin: 'ECONOMY',         stops: 0 },
    { flightNumber: 'AI-701', airline: 'Air India',     origin: 'BOM', destination: 'BLR', dep: future(2, 8),  dur: 110, price: 4800,  seats: 200, cabin: 'ECONOMY',         stops: 0 },
    { flightNumber: '6E-702', airline: 'IndiGo',        origin: 'BLR', destination: 'BOM', dep: future(1, 10), dur: 100, price: 3599,  seats: 186, cabin: 'ECONOMY',         stops: 0 },
    { flightNumber: 'UK-702', airline: 'Vistara',       origin: 'BLR', destination: 'BOM', dep: future(2, 15), dur: 110, price: 7800,  seats: 160, cabin: 'BUSINESS',        stops: 0 },

    // DEL ↔ HYD
    { flightNumber: '6E-801', airline: 'IndiGo',        origin: 'DEL', destination: 'HYD', dep: future(1, 7),  dur: 150, price: 4299,  seats: 186, cabin: 'ECONOMY',         stops: 0 },
    { flightNumber: 'SG-801', airline: 'SpiceJet',      origin: 'DEL', destination: 'HYD', dep: future(1, 11), dur: 155, price: 3899,  seats: 174, cabin: 'ECONOMY',         stops: 0 },
    { flightNumber: 'AI-801', airline: 'Air India',     origin: 'DEL', destination: 'HYD', dep: future(2, 14), dur: 160, price: 5600,  seats: 200, cabin: 'ECONOMY',         stops: 0 },
    { flightNumber: '6E-802', airline: 'IndiGo',        origin: 'HYD', destination: 'DEL', dep: future(1, 9),  dur: 150, price: 4399,  seats: 186, cabin: 'ECONOMY',         stops: 0 },
    { flightNumber: 'UK-802', airline: 'Vistara',       origin: 'HYD', destination: 'DEL', dep: future(2, 16), dur: 155, price: 8200,  seats: 160, cabin: 'BUSINESS',        stops: 0 },

    // BOM ↔ HYD
    { flightNumber: '6E-901', airline: 'IndiGo',        origin: 'BOM', destination: 'HYD', dep: future(1, 8),  dur: 80,  price: 3199,  seats: 186, cabin: 'ECONOMY',         stops: 0 },
    { flightNumber: 'G8-901', airline: 'GoAir',         origin: 'BOM', destination: 'HYD', dep: future(1, 15), dur: 85,  price: 2899,  seats: 180, cabin: 'ECONOMY',         stops: 0 },
    { flightNumber: '6E-902', airline: 'IndiGo',        origin: 'HYD', destination: 'BOM', dep: future(1, 11), dur: 80,  price: 3299,  seats: 186, cabin: 'ECONOMY',         stops: 0 },
    { flightNumber: 'SG-902', airline: 'SpiceJet',      origin: 'HYD', destination: 'BOM', dep: future(2, 17), dur: 90,  price: 3599,  seats: 174, cabin: 'ECONOMY',         stops: 0 },

    // DEL ↔ MAA (Chennai)
    { flightNumber: '6E-111', airline: 'IndiGo',        origin: 'DEL', destination: 'MAA', dep: future(1, 6),  dur: 180, price: 4699,  seats: 186, cabin: 'ECONOMY',         stops: 0 },
    { flightNumber: 'AI-111', airline: 'Air India',     origin: 'DEL', destination: 'MAA', dep: future(1, 10), dur: 185, price: 6100,  seats: 200, cabin: 'ECONOMY',         stops: 0 },
    { flightNumber: '6E-112', airline: 'IndiGo',        origin: 'MAA', destination: 'DEL', dep: future(1, 14), dur: 180, price: 4799,  seats: 186, cabin: 'ECONOMY',         stops: 0 },
    { flightNumber: 'SG-112', airline: 'SpiceJet',      origin: 'MAA', destination: 'DEL', dep: future(2, 9),  dur: 190, price: 4299,  seats: 174, cabin: 'ECONOMY',         stops: 1 },

    // BLR ↔ HYD
    { flightNumber: '6E-121', airline: 'IndiGo',        origin: 'BLR', destination: 'HYD', dep: future(1, 7),  dur: 60,  price: 2499,  seats: 186, cabin: 'ECONOMY',         stops: 0 },
    { flightNumber: 'SG-121', airline: 'SpiceJet',      origin: 'BLR', destination: 'HYD', dep: future(1, 16), dur: 65,  price: 2199,  seats: 174, cabin: 'ECONOMY',         stops: 0 },
    { flightNumber: '6E-122', airline: 'IndiGo',        origin: 'HYD', destination: 'BLR', dep: future(1, 9),  dur: 60,  price: 2599,  seats: 186, cabin: 'ECONOMY',         stops: 0 },

    // CCU ↔ BOM
    { flightNumber: 'AI-131', airline: 'Air India',     origin: 'CCU', destination: 'BOM', dep: future(1, 8),  dur: 170, price: 5400,  seats: 200, cabin: 'ECONOMY',         stops: 0 },
    { flightNumber: '6E-131', airline: 'IndiGo',        origin: 'CCU', destination: 'BOM', dep: future(2, 11), dur: 175, price: 4999,  seats: 186, cabin: 'ECONOMY',         stops: 0 },
    { flightNumber: '6E-132', airline: 'IndiGo',        origin: 'BOM', destination: 'CCU', dep: future(1, 13), dur: 170, price: 5199,  seats: 186, cabin: 'ECONOMY',         stops: 0 },

    // DEL → AMD (Ahmedabad)
    { flightNumber: '6E-141', airline: 'IndiGo',        origin: 'DEL', destination: 'AMD', dep: future(1, 8),  dur: 90,  price: 2999,  seats: 186, cabin: 'ECONOMY',         stops: 0 },
    { flightNumber: 'G8-141', airline: 'GoAir',         origin: 'DEL', destination: 'AMD', dep: future(1, 14), dur: 95,  price: 2699,  seats: 180, cabin: 'ECONOMY',         stops: 0 },
    { flightNumber: '6E-142', airline: 'IndiGo',        origin: 'AMD', destination: 'DEL', dep: future(1, 11), dur: 90,  price: 3099,  seats: 186, cabin: 'ECONOMY',         stops: 0 },

    // BLR ↔ MAA (Bangalore - Chennai)
    { flightNumber: '6E-151', airline: 'IndiGo',        origin: 'BLR', destination: 'MAA', dep: future(1, 6),  dur: 55,  price: 2299,  seats: 186, cabin: 'ECONOMY',         stops: 0 },
    { flightNumber: 'AI-151', airline: 'Air India',     origin: 'BLR', destination: 'MAA', dep: future(1, 13), dur: 60,  price: 3400,  seats: 200, cabin: 'ECONOMY',         stops: 0 },
    { flightNumber: '6E-152', airline: 'IndiGo',        origin: 'MAA', destination: 'BLR', dep: future(1, 8),  dur: 55,  price: 2399,  seats: 186, cabin: 'ECONOMY',         stops: 0 },

    // DEL → CCU (day 3 additions)
    { flightNumber: 'AI-501', airline: 'Air India',     origin: 'DEL', destination: 'CCU', dep: future(3, 7),  dur: 155, price: 4400,  seats: 200, cabin: 'ECONOMY',         stops: 0 },
    { flightNumber: '6E-502', airline: 'IndiGo',        origin: 'CCU', destination: 'DEL', dep: future(3, 14), dur: 150, price: 4100,  seats: 186, cabin: 'ECONOMY',         stops: 0 },
  ]

  const records = []
  for (const r of routes) {
    const dep = r.dep
    const arr = addHours(dep, Math.floor(r.dur / 60))
    arr.setMinutes(r.dur % 60)

    const flight = await prisma.flight.create({
      data: {
        flightNumber:   r.flightNumber,
        airline:        r.airline,
        origin:         r.origin,
        destination:    r.destination,
        departureTime:  dep,
        arrivalTime:    arr,
        duration:       r.dur,
        price:          r.price,
        totalSeats:     r.seats,
        availableSeats: Math.floor(r.seats * 0.7),
        cabinClass:     r.cabin,
        stops:          r.stops,
      },
    })
    records.push(flight)
  }
  console.log(`  ✓ ${records.length} flights`)
  return records
}

// ─── Hotels ───────────────────────────────────────────────────────────────────

async function seedHotels() {
  const hotelsData = [
    // Mumbai
    {
      name: 'The Taj Mahal Palace',
      description: 'Iconic luxury hotel overlooking the Gateway of India, offering world-class hospitality since 1903.',
      city: 'Mumbai',
      address: 'Apollo Bunder, Colaba, Mumbai, Maharashtra 400001',
      starRating: 5,
      amenities: ['WiFi', 'Pool', 'Spa', 'Gym', 'Restaurant', 'Bar', 'Concierge', 'Valet Parking', 'Airport Shuttle'],
      images: ['taj_mumbai_1.jpg', 'taj_mumbai_2.jpg'],
      rooms: [
        { type: 'Deluxe Room',       desc: 'Elegant room with harbour view',          price: 18000, cap: 2, total: 30, avail: 12, amenities: ['AC', 'TV', 'WiFi', 'Minibar'] },
        { type: 'Superior Room',     desc: 'Spacious room with city view',            price: 22000, cap: 2, total: 20, avail: 8,  amenities: ['AC', 'TV', 'WiFi', 'Minibar', 'Bathtub'] },
        { type: 'Junior Suite',      desc: 'Elegant suite with separate sitting area', price: 35000, cap: 3, total: 15, avail: 5,  amenities: ['AC', 'TV', 'WiFi', 'Minibar', 'Jacuzzi', 'Butler'] },
        { type: 'Grand Luxury Suite', desc: 'Opulent suite with panoramic harbour view', price: 65000, cap: 4, total: 5,  avail: 2,  amenities: ['AC', 'TV', 'WiFi', 'Minibar', 'Private Pool', 'Butler'] },
      ],
    },
    {
      name: 'Hotel Trident BKC',
      description: 'Contemporary business hotel in the heart of Mumbai\'s financial district.',
      city: 'Mumbai',
      address: 'G Block, Bandra Kurla Complex, Mumbai 400051',
      starRating: 5,
      amenities: ['WiFi', 'Pool', 'Gym', 'Restaurant', 'Business Centre', 'Spa'],
      images: ['trident_bkc_1.jpg'],
      rooms: [
        { type: 'Premier Room',  desc: 'Modern room with BKC skyline view', price: 9500,  cap: 2, total: 40, avail: 18, amenities: ['AC', 'TV', 'WiFi'] },
        { type: 'Club Room',     desc: 'Club floor access with lounge benefits', price: 13000, cap: 2, total: 20, avail: 9,  amenities: ['AC', 'TV', 'WiFi', 'Lounge Access'] },
        { type: 'Suite',         desc: 'Spacious suite with separate living area', price: 22000, cap: 3, total: 10, avail: 4,  amenities: ['AC', 'TV', 'WiFi', 'Minibar'] },
      ],
    },
    {
      name: 'FabHotel Prime Colaba',
      description: 'Budget-friendly hotel in South Mumbai close to tourist attractions.',
      city: 'Mumbai',
      address: '12 Colaba Causeway, Mumbai 400005',
      starRating: 3,
      amenities: ['WiFi', 'Restaurant', 'Room Service', '24hr Reception'],
      images: ['fabhotel_colaba_1.jpg'],
      rooms: [
        { type: 'Standard Room',  desc: 'Clean and comfortable standard room',    price: 2200, cap: 2, total: 30, avail: 15, amenities: ['AC', 'TV', 'WiFi'] },
        { type: 'Deluxe Room',   desc: 'Spacious room with street view',          price: 2800, cap: 2, total: 20, avail: 10, amenities: ['AC', 'TV', 'WiFi'] },
      ],
    },

    // Delhi
    {
      name: 'The Oberoi New Delhi',
      description: 'Award-winning luxury hotel in the heart of New Delhi with stunning views of Humayun\'s Tomb.',
      city: 'Delhi',
      address: 'Dr Zakir Hussain Marg, New Delhi 110003',
      starRating: 5,
      amenities: ['WiFi', 'Pool', 'Spa', 'Gym', 'Multiple Restaurants', 'Bar', 'Butler Service', 'Airport Shuttle'],
      images: ['oberoi_delhi_1.jpg', 'oberoi_delhi_2.jpg'],
      rooms: [
        { type: 'Luxury Room',        desc: 'Elegant room with garden or pool view',    price: 16000, cap: 2, total: 40, avail: 15, amenities: ['AC', 'TV', 'WiFi', 'Minibar'] },
        { type: 'Luxury Suite',       desc: 'Spacious suite with separate living room',  price: 32000, cap: 3, total: 15, avail: 6,  amenities: ['AC', 'TV', 'WiFi', 'Minibar', 'Butler'] },
        { type: 'Premier Suite',      desc: 'Opulent suite with panoramic city views',   price: 55000, cap: 4, total: 8,  avail: 3,  amenities: ['AC', 'TV', 'WiFi', 'Private Dining', 'Butler'] },
      ],
    },
    {
      name: 'Radisson Blu New Delhi Paschim Vihar',
      description: 'Modern upscale hotel with excellent connectivity to IGI Airport.',
      city: 'Delhi',
      address: 'Paschim Vihar, New Delhi 110063',
      starRating: 4,
      amenities: ['WiFi', 'Pool', 'Gym', 'Restaurant', 'Bar', 'Business Centre'],
      images: ['radisson_delhi_1.jpg'],
      rooms: [
        { type: 'Superior Room',  desc: 'Contemporary room with city view',      price: 5500, cap: 2, total: 50, avail: 22, amenities: ['AC', 'TV', 'WiFi'] },
        { type: 'Business Class', desc: 'Premium room with lounge access',       price: 7500, cap: 2, total: 25, avail: 10, amenities: ['AC', 'TV', 'WiFi', 'Lounge Access'] },
        { type: 'Suite',          desc: 'Expansive suite with panoramic views',  price: 14000, cap: 3, total: 10, avail: 4,  amenities: ['AC', 'TV', 'WiFi', 'Minibar'] },
      ],
    },
    {
      name: 'OYO Flagship Karol Bagh',
      description: 'Comfortable budget hotel in the popular shopping area of Karol Bagh.',
      city: 'Delhi',
      address: '14 Arya Samaj Road, Karol Bagh, New Delhi 110005',
      starRating: 2,
      amenities: ['WiFi', 'Room Service', '24hr Reception'],
      images: ['oyo_karolbagh_1.jpg'],
      rooms: [
        { type: 'Standard Room', desc: 'Cosy room with basic amenities', price: 1200, cap: 2, total: 25, avail: 14, amenities: ['AC', 'TV', 'WiFi'] },
        { type: 'Deluxe Room',  desc: 'Spacious room with extra comfort',  price: 1600, cap: 2, total: 15, avail: 8,  amenities: ['AC', 'TV', 'WiFi'] },
      ],
    },

    // Bangalore
    {
      name: 'ITC Gardenia',
      description: 'Sustainably built luxury hotel in the IT corridor of Bangalore.',
      city: 'Bangalore',
      address: '1 Residency Road, Bangalore 560025',
      starRating: 5,
      amenities: ['WiFi', 'Pool', 'Spa', 'Gym', 'Restaurant', 'Bar', 'EV Charging'],
      images: ['itc_gardenia_1.jpg', 'itc_gardenia_2.jpg'],
      rooms: [
        { type: 'Luxury Room',    desc: 'Modern room with garden or pool view',  price: 11000, cap: 2, total: 50, avail: 20, amenities: ['AC', 'TV', 'WiFi', 'Minibar'] },
        { type: 'Towers Suite',   desc: 'Exclusive suite with butler service',   price: 28000, cap: 3, total: 12, avail: 5,  amenities: ['AC', 'TV', 'WiFi', 'Butler', 'Jacuzzi'] },
      ],
    },
    {
      name: 'Lemon Tree Hotel Electronic City',
      description: 'Contemporary mid-scale hotel near the tech hub of Electronic City.',
      city: 'Bangalore',
      address: 'Phase 1, Electronic City, Bangalore 560100',
      starRating: 3,
      amenities: ['WiFi', 'Pool', 'Gym', 'Restaurant', 'Bar'],
      images: ['lemontree_blr_1.jpg'],
      rooms: [
        { type: 'Studio',          desc: 'Compact room ideal for business travellers', price: 3200, cap: 1, total: 40, avail: 18, amenities: ['AC', 'TV', 'WiFi'] },
        { type: 'Premium Studio',  desc: 'Larger room with work desk',                price: 4200, cap: 2, total: 25, avail: 11, amenities: ['AC', 'TV', 'WiFi'] },
      ],
    },

    // Goa
    {
      name: 'Taj Exotica Resort & Spa Goa',
      description: 'Beachfront luxury resort spread across 56 acres of lush Goan landscape.',
      city: 'Goa',
      address: 'Calwaddo, Benaulim, South Goa 403716',
      starRating: 5,
      amenities: ['WiFi', 'Private Beach', 'Multiple Pools', 'Spa', 'Gym', 'Restaurants', 'Water Sports', 'Kids Club'],
      images: ['taj_goa_1.jpg', 'taj_goa_2.jpg'],
      rooms: [
        { type: 'Luxury Room',       desc: 'Tropical room with garden view',      price: 22000, cap: 2, total: 60, avail: 25, amenities: ['AC', 'TV', 'WiFi', 'Balcony'] },
        { type: 'Luxury Sea View',   desc: 'Room with direct Arabian Sea view',   price: 30000, cap: 2, total: 30, avail: 12, amenities: ['AC', 'TV', 'WiFi', 'Balcony', 'Minibar'] },
        { type: 'Luxury Villa',      desc: 'Private villa with pool',             price: 75000, cap: 4, total: 10, avail: 3,  amenities: ['AC', 'TV', 'WiFi', 'Private Pool', 'Butler'] },
      ],
    },
    {
      name: 'The LaLiT Golf & Spa Resort Goa',
      description: 'Sprawling resort with a championship golf course on the beaches of North Goa.',
      city: 'Goa',
      address: 'Raj Baga, Canacona, South Goa 403702',
      starRating: 5,
      amenities: ['WiFi', 'Golf Course', 'Pool', 'Spa', 'Gym', 'Restaurant', 'Bar', 'Beach Access'],
      images: ['lalit_goa_1.jpg'],
      rooms: [
        { type: 'Deluxe Room',    desc: 'Serene room with pool or garden view',  price: 12000, cap: 2, total: 45, avail: 20, amenities: ['AC', 'TV', 'WiFi'] },
        { type: 'Suite',          desc: 'Spacious suite with sea view',          price: 25000, cap: 3, total: 15, avail: 7,  amenities: ['AC', 'TV', 'WiFi', 'Minibar', 'Jacuzzi'] },
      ],
    },
    {
      name: 'Zostel Goa (Panaji)',
      description: 'Popular backpacker hostel with vibrant social atmosphere in Goa\'s capital.',
      city: 'Goa',
      address: '31/1 January 6th Road, Panaji, Goa 403001',
      starRating: 2,
      amenities: ['WiFi', 'Common Kitchen', 'Lounge', 'Outdoor Seating', 'Tours Desk'],
      images: ['zostel_goa_1.jpg'],
      rooms: [
        { type: 'Dormitory Bed', desc: '6-bed mixed dormitory',               price: 650,  cap: 1, total: 30, avail: 18, amenities: ['WiFi', 'Locker'] },
        { type: 'Private Room',  desc: 'Private room with shared bathroom',   price: 2200, cap: 2, total: 8,  avail: 4,  amenities: ['AC', 'WiFi'] },
      ],
    },

    // Chennai
    {
      name: 'ITC Grand Chola',
      description: 'Grand luxury hotel inspired by Chola dynasty architecture, located in Chennai\'s business district.',
      city: 'Chennai',
      address: '63, Mount Road, Guindy, Chennai 600032',
      starRating: 5,
      amenities: ['WiFi', 'Pool', 'Spa', 'Gym', 'Multiple Restaurants', 'Bar', 'Business Centre', 'Airport Shuttle'],
      images: ['itc_chola_1.jpg', 'itc_chola_2.jpg'],
      rooms: [
        { type: 'Luxury Room',     desc: 'Contemporary room with city or pool view',  price: 12000, cap: 2, total: 50, avail: 22, amenities: ['AC', 'TV', 'WiFi', 'Minibar'] },
        { type: 'Executive Club',  desc: 'Club floor room with exclusive lounge',     price: 18000, cap: 2, total: 25, avail: 10, amenities: ['AC', 'TV', 'WiFi', 'Lounge Access', 'Minibar'] },
        { type: 'Grand Suite',     desc: 'Opulent suite inspired by Chola artistry',  price: 45000, cap: 4, total: 8,  avail: 3,  amenities: ['AC', 'TV', 'WiFi', 'Butler', 'Jacuzzi'] },
      ],
    },
    {
      name: 'Feathers — A Radha Hotel',
      description: 'Stylish contemporary hotel near the airport with a rooftop pool and modern amenities.',
      city: 'Chennai',
      address: '1, Rajiv Gandhi Salai, Navallur, Chennai 600130',
      starRating: 4,
      amenities: ['WiFi', 'Rooftop Pool', 'Gym', 'Restaurant', 'Bar', 'Spa'],
      images: ['feathers_chennai_1.jpg'],
      rooms: [
        { type: 'Deluxe Room',   desc: 'Well-appointed room with city view',      price: 6000, cap: 2, total: 45, avail: 20, amenities: ['AC', 'TV', 'WiFi'] },
        { type: 'Premium Room',  desc: 'Larger room with pool or garden view',    price: 8500, cap: 2, total: 20, avail: 9,  amenities: ['AC', 'TV', 'WiFi', 'Minibar'] },
        { type: 'Suite',         desc: 'Spacious suite with separate living area', price: 16000, cap: 3, total: 8,  avail: 4,  amenities: ['AC', 'TV', 'WiFi', 'Minibar', 'Bathtub'] },
      ],
    },
    {
      name: 'Treebo Trend Arina Grand',
      description: 'Budget-friendly hotel in T Nagar, walking distance from Chennai\'s best shopping streets.',
      city: 'Chennai',
      address: '12, Venkatnarayana Road, T Nagar, Chennai 600017',
      starRating: 3,
      amenities: ['WiFi', 'Restaurant', 'Room Service', '24hr Reception'],
      images: ['treebo_chennai_1.jpg'],
      rooms: [
        { type: 'Standard Room',   desc: 'Clean air-conditioned room',              price: 1800, cap: 2, total: 30, avail: 16, amenities: ['AC', 'TV', 'WiFi'] },
        { type: 'Superior Room',   desc: 'Slightly larger room with work desk',     price: 2400, cap: 2, total: 18, avail: 10, amenities: ['AC', 'TV', 'WiFi'] },
      ],
    },

    // Hyderabad
    {
      name: 'Taj Falaknuma Palace',
      description: 'Iconic palace hotel perched atop a hill, offering an unmatched royal experience in Hyderabad.',
      city: 'Hyderabad',
      address: 'Engine Bowli, Falaknuma, Hyderabad 500053',
      starRating: 5,
      amenities: ['WiFi', 'Pool', 'Spa', 'Gym', 'Heritage Restaurant', 'Bar', 'Butler Service', 'Horse Carriage'],
      images: ['falaknuma_1.jpg', 'falaknuma_2.jpg'],
      rooms: [
        { type: 'Palace Room',     desc: 'Elegantly furnished room in the palace',  price: 28000, cap: 2, total: 30, avail: 12, amenities: ['AC', 'TV', 'WiFi', 'Minibar', 'Butler'] },
        { type: 'Luxury Suite',    desc: 'Grand suite with antique furnishings',    price: 55000, cap: 3, total: 10, avail: 4,  amenities: ['AC', 'TV', 'WiFi', 'Minibar', 'Jacuzzi', 'Butler'] },
        { type: 'Royal Suite',     desc: 'The grandest suite in the palace',        price: 110000, cap: 4, total: 4, avail: 1,  amenities: ['AC', 'TV', 'WiFi', 'Private Dining', 'Butler', 'Private Pool'] },
      ],
    },
    {
      name: 'Novotel Hyderabad Convention Centre',
      description: 'Premium business hotel adjacent to Hyderabad International Convention Centre.',
      city: 'Hyderabad',
      address: 'Novotel & HICC Complex, Near Cyberabad, Hyderabad 500081',
      starRating: 5,
      amenities: ['WiFi', 'Pool', 'Gym', 'Spa', 'Multiple Restaurants', 'Bar', 'Business Centre'],
      images: ['novotel_hyd_1.jpg'],
      rooms: [
        { type: 'Superior Room',   desc: 'Contemporary room with city view',        price: 7500, cap: 2, total: 50, avail: 24, amenities: ['AC', 'TV', 'WiFi'] },
        { type: 'Executive Room',  desc: 'Premium room with lounge access',         price: 10500, cap: 2, total: 25, avail: 11, amenities: ['AC', 'TV', 'WiFi', 'Lounge Access'] },
        { type: 'Suite',           desc: 'Expansive suite with panoramic views',    price: 20000, cap: 3, total: 10, avail: 5,  amenities: ['AC', 'TV', 'WiFi', 'Minibar'] },
      ],
    },
    {
      name: 'Ginger Hyderabad HITEC City',
      description: 'Smart budget hotel in the heart of Hyderabad\'s IT hub, ideal for tech travellers.',
      city: 'Hyderabad',
      address: 'Plot 5, HUDA Tech Enclave, HITEC City, Hyderabad 500081',
      starRating: 3,
      amenities: ['WiFi', 'Restaurant', 'Gym', 'Room Service'],
      images: ['ginger_hyd_1.jpg'],
      rooms: [
        { type: 'Smart Room',       desc: 'Compact room with all essentials',       price: 2200, cap: 2, total: 40, avail: 22, amenities: ['AC', 'TV', 'WiFi'] },
        { type: 'Smart Plus Room',  desc: 'Larger room with extra comfort',         price: 3000, cap: 2, total: 20, avail: 12, amenities: ['AC', 'TV', 'WiFi'] },
      ],
    },

    // Jaipur
    {
      name: 'Rambagh Palace',
      description: 'Former royal residence of the Maharaja of Jaipur, now the crown jewel of luxury hospitality.',
      city: 'Jaipur',
      address: 'Bhawani Singh Road, Jaipur, Rajasthan 302005',
      starRating: 5,
      amenities: ['WiFi', 'Pool', 'Spa', 'Gym', 'Polo Grounds', 'Heritage Restaurant', 'Bar', 'Gardens'],
      images: ['rambagh_1.jpg', 'rambagh_2.jpg'],
      rooms: [
        { type: 'Luxury Room',      desc: 'Elegant room in the palace wing',        price: 25000, cap: 2, total: 35, avail: 14, amenities: ['AC', 'TV', 'WiFi', 'Minibar'] },
        { type: 'Garden Suite',     desc: 'Suite with private garden access',       price: 48000, cap: 3, total: 12, avail: 5,  amenities: ['AC', 'TV', 'WiFi', 'Butler', 'Minibar'] },
        { type: 'Grand Royal Suite', desc: 'Palatial suite with butler service',   price: 95000, cap: 4, total: 4,  avail: 2,  amenities: ['AC', 'TV', 'WiFi', 'Private Pool', 'Butler', 'Private Dining'] },
      ],
    },
    {
      name: 'Courtyard by Marriott Jaipur',
      description: 'Modern upscale hotel near the Jaipur airport with excellent connectivity to the city.',
      city: 'Jaipur',
      address: 'Goverdhan Vilas, Opposite Jawahar Circle, Jaipur 302018',
      starRating: 4,
      amenities: ['WiFi', 'Pool', 'Gym', 'Restaurant', 'Bar', 'Business Centre'],
      images: ['courtyard_jaipur_1.jpg'],
      rooms: [
        { type: 'Standard Room',    desc: 'Well-appointed room with city view',     price: 4500, cap: 2, total: 50, avail: 24, amenities: ['AC', 'TV', 'WiFi'] },
        { type: 'Deluxe Room',      desc: 'Spacious room with garden view',         price: 6000, cap: 2, total: 25, avail: 11, amenities: ['AC', 'TV', 'WiFi', 'Minibar'] },
        { type: 'Suite',            desc: 'Generous suite with separate lounge',    price: 12000, cap: 3, total: 8,  avail: 4,  amenities: ['AC', 'TV', 'WiFi', 'Minibar'] },
      ],
    },
    {
      name: 'Pearl Palace Heritage',
      description: 'Charming heritage boutique hotel in the old city near Hawa Mahal — great value.',
      city: 'Jaipur',
      address: 'Hathroi Fort, Ajmer Road, Jaipur 302001',
      starRating: 3,
      amenities: ['WiFi', 'Rooftop Restaurant', 'Free Parking', '24hr Reception'],
      images: ['pearl_palace_1.jpg'],
      rooms: [
        { type: 'Heritage Room',   desc: 'Artistically decorated heritage room',    price: 2500, cap: 2, total: 20, avail: 12, amenities: ['AC', 'TV', 'WiFi'] },
        { type: 'Deluxe Room',    desc: 'Larger room with intricate Rajasthani art', price: 3500, cap: 3, total: 12, avail: 7,  amenities: ['AC', 'TV', 'WiFi'] },
      ],
    },

    // Kolkata
    {
      name: 'The Oberoi Grand Kolkata',
      description: 'A landmark of colonial elegance in the heart of Kolkata — the city\'s finest hotel since 1891.',
      city: 'Kolkata',
      address: '15 Jawaharlal Nehru Road, Kolkata 700013',
      starRating: 5,
      amenities: ['WiFi', 'Pool', 'Spa', 'Gym', 'Restaurant', 'Bar', 'Business Centre', 'Airport Shuttle'],
      images: ['oberoi_kolkata_1.jpg', 'oberoi_kolkata_2.jpg'],
      rooms: [
        { type: 'Luxury Room',     desc: 'Elegant room with pool or garden view',   price: 14000, cap: 2, total: 40, avail: 17, amenities: ['AC', 'TV', 'WiFi', 'Minibar'] },
        { type: 'Luxury Suite',    desc: 'Suite with drawing room and dining area', price: 30000, cap: 3, total: 12, avail: 5,  amenities: ['AC', 'TV', 'WiFi', 'Minibar', 'Butler'] },
      ],
    },
    {
      name: 'Novotel Kolkata Hotel & Residences',
      description: 'Contemporary hotel near the new business district of Kolkata, offering top-notch facilities.',
      city: 'Kolkata',
      address: 'CB-218, New Town, Action Area I, Kolkata 700156',
      starRating: 4,
      amenities: ['WiFi', 'Pool', 'Gym', 'Restaurant', 'Bar', 'Business Centre'],
      images: ['novotel_kolkata_1.jpg'],
      rooms: [
        { type: 'Superior Room',   desc: 'Stylish room with city view',            price: 5500, cap: 2, total: 55, avail: 26, amenities: ['AC', 'TV', 'WiFi'] },
        { type: 'Executive Room',  desc: 'Premium room with lounge access',        price: 7500, cap: 2, total: 25, avail: 12, amenities: ['AC', 'TV', 'WiFi', 'Lounge Access'] },
        { type: 'Suite',           desc: 'Spacious suite with separate lounge',    price: 14000, cap: 3, total: 8,  avail: 4,  amenities: ['AC', 'TV', 'WiFi', 'Minibar'] },
      ],
    },
    {
      name: 'Zostel Kolkata',
      description: 'Vibrant backpacker hostel in the cultural heart of Kolkata, close to Park Street.',
      city: 'Kolkata',
      address: '15 Mirza Ghalib Street, Park Street, Kolkata 700016',
      starRating: 2,
      amenities: ['WiFi', 'Common Lounge', 'Terrace', 'Travel Desk', 'Lockers'],
      images: ['zostel_kolkata_1.jpg'],
      rooms: [
        { type: 'Dormitory Bed',  desc: '8-bed dorm with lockers',                price: 600,  cap: 1, total: 32, avail: 20, amenities: ['WiFi', 'Locker'] },
        { type: 'Private Room',   desc: 'Private double room with attached bath', price: 2000, cap: 2, total: 8,  avail: 5,  amenities: ['AC', 'WiFi'] },
      ],
    },
  ]

  const created = []
  for (const h of hotelsData) {
    const { rooms: roomsData, ...hotelFields } = h
    const hotel = await prisma.hotel.create({ data: hotelFields })

    for (const r of roomsData) {
      await prisma.room.create({
        data: {
          hotelId:        hotel.id,
          type:           r.type,
          description:    r.desc,
          pricePerNight:  r.price,
          capacity:       r.cap,
          totalRooms:     r.total,
          availableRooms: r.avail,
          amenities:      r.amenities,
          images:         [],
        },
      })
    }
    created.push(hotel)
  }
  console.log(`  ✓ ${created.length} hotels with rooms`)
  return created
}

// ─── Trains ───────────────────────────────────────────────────────────────────

async function seedTrains() {
  const trains = [
    {
      trainNumber: '12951', trainName: 'Mumbai Rajdhani Express',
      origin: 'NDLS', destination: 'BCT',
      dep: future(1, 16), dur: 935,
      classes: { SL: { price: 655, seats: 500 }, '3A': { price: 1745, seats: 200 }, '2A': { price: 2510, seats: 100 }, '1A': { price: 4225, seats: 24 } },
      totalSeats: 824, availableSeats: 340,
    },
    {
      trainNumber: '12952', trainName: 'New Delhi Rajdhani Express',
      origin: 'BCT', destination: 'NDLS',
      dep: future(1, 17), dur: 930,
      classes: { SL: { price: 655, seats: 500 }, '3A': { price: 1745, seats: 200 }, '2A': { price: 2510, seats: 100 }, '1A': { price: 4225, seats: 24 } },
      totalSeats: 824, availableSeats: 290,
    },
    {
      trainNumber: '12301', trainName: 'Howrah Rajdhani Express',
      origin: 'NDLS', destination: 'HWH',
      dep: future(1, 17), dur: 1020,
      classes: { SL: { price: 740, seats: 500 }, '3A': { price: 1955, seats: 200 }, '2A': { price: 2815, seats: 100 }, '1A': { price: 4730, seats: 24 } },
      totalSeats: 824, availableSeats: 210,
    },
    {
      trainNumber: '12302', trainName: 'New Delhi Rajdhani (Howrah)',
      origin: 'HWH', destination: 'NDLS',
      dep: future(2, 14), dur: 1020,
      classes: { SL: { price: 740, seats: 500 }, '3A': { price: 1955, seats: 200 }, '2A': { price: 2815, seats: 100 }, '1A': { price: 4730, seats: 24 } },
      totalSeats: 824, availableSeats: 185,
    },
    {
      trainNumber: '22691', trainName: 'Rajdhani Express (KSR Bangalore)',
      origin: 'NDLS', destination: 'SBC',
      dep: future(1, 20), dur: 1680,
      classes: { '3A': { price: 2270, seats: 200 }, '2A': { price: 3260, seats: 100 }, '1A': { price: 5495, seats: 24 } },
      totalSeats: 324, availableSeats: 140,
    },
    {
      trainNumber: '12431', trainName: 'Thiruvananthapuram Rajdhani',
      origin: 'NDLS', destination: 'TVC',
      dep: future(2, 11), dur: 2520,
      classes: { '3A': { price: 2760, seats: 200 }, '2A': { price: 3965, seats: 100 }, '1A': { price: 6700, seats: 24 } },
      totalSeats: 324, availableSeats: 98,
    },
    {
      trainNumber: '12009', trainName: 'Mumbai Shatabdi Express',
      origin: 'MMCT', destination: 'PUNE',
      dep: future(1, 7), dur: 205,
      classes: { CC: { price: 510, seats: 400 }, EC: { price: 990, seats: 100 } },
      totalSeats: 500, availableSeats: 220,
    },
    {
      trainNumber: '12028', trainName: 'Chennai Shatabdi Express',
      origin: 'SBC', destination: 'MAS',
      dep: future(1, 6), dur: 295,
      classes: { CC: { price: 800, seats: 400 }, EC: { price: 1560, seats: 100 } },
      totalSeats: 500, availableSeats: 310,
    },
    // NDLS ↔ SC (Delhi – Hyderabad)
    {
      trainNumber: '12723', trainName: 'Telangana Express',
      origin: 'NDLS', destination: 'SC',
      dep: future(1, 6), dur: 1455,
      classes: { SL: { price: 545, seats: 600 }, '3A': { price: 1455, seats: 200 }, '2A': { price: 2095, seats: 100 }, '1A': { price: 3520, seats: 24 } },
      totalSeats: 924, availableSeats: 420,
    },
    {
      trainNumber: '12724', trainName: 'Telangana Express (Return)',
      origin: 'SC', destination: 'NDLS',
      dep: future(2, 7), dur: 1455,
      classes: { SL: { price: 545, seats: 600 }, '3A': { price: 1455, seats: 200 }, '2A': { price: 2095, seats: 100 }, '1A': { price: 3520, seats: 24 } },
      totalSeats: 924, availableSeats: 380,
    },
    // NDLS ↔ MAS (Delhi – Chennai)
    {
      trainNumber: '12621', trainName: 'Tamil Nadu Express',
      origin: 'NDLS', destination: 'MAS',
      dep: future(1, 22), dur: 2040,
      classes: { SL: { price: 790, seats: 600 }, '3A': { price: 2090, seats: 200 }, '2A': { price: 3005, seats: 100 }, '1A': { price: 5055, seats: 24 } },
      totalSeats: 924, availableSeats: 310,
    },
    {
      trainNumber: '12622', trainName: 'Tamil Nadu Express (Return)',
      origin: 'MAS', destination: 'NDLS',
      dep: future(2, 22), dur: 2040,
      classes: { SL: { price: 790, seats: 600 }, '3A': { price: 2090, seats: 200 }, '2A': { price: 3005, seats: 100 }, '1A': { price: 5055, seats: 24 } },
      totalSeats: 924, availableSeats: 265,
    },
    // SBC ↔ MMCT (Bangalore – Mumbai)
    {
      trainNumber: '11301', trainName: 'Udyan Express',
      origin: 'SBC', destination: 'MMCT',
      dep: future(1, 20), dur: 1365,
      classes: { SL: { price: 540, seats: 600 }, '3A': { price: 1440, seats: 200 }, '2A': { price: 2075, seats: 100 } },
      totalSeats: 900, availableSeats: 340,
    },
    {
      trainNumber: '11302', trainName: 'Udyan Express (Return)',
      origin: 'MMCT', destination: 'SBC',
      dep: future(2, 8), dur: 1365,
      classes: { SL: { price: 540, seats: 600 }, '3A': { price: 1440, seats: 200 }, '2A': { price: 2075, seats: 100 } },
      totalSeats: 900, availableSeats: 290,
    },
    // NDLS ↔ JP (Delhi – Jaipur)
    {
      trainNumber: '12015', trainName: 'Ajmer Shatabdi Express',
      origin: 'NDLS', destination: 'JP',
      dep: future(1, 6), dur: 270,
      classes: { CC: { price: 485, seats: 400 }, EC: { price: 945, seats: 100 } },
      totalSeats: 500, availableSeats: 235,
    },
    {
      trainNumber: '12016', trainName: 'Ajmer Shatabdi (Return)',
      origin: 'JP', destination: 'NDLS',
      dep: future(1, 18), dur: 270,
      classes: { CC: { price: 485, seats: 400 }, EC: { price: 945, seats: 100 } },
      totalSeats: 500, availableSeats: 210,
    },
    // NDLS ↔ ADI (Delhi – Ahmedabad)
    {
      trainNumber: '12957', trainName: 'Rajdhani Express (Ahmedabad)',
      origin: 'NDLS', destination: 'ADI',
      dep: future(1, 19), dur: 735,
      classes: { '3A': { price: 1640, seats: 200 }, '2A': { price: 2360, seats: 100 }, '1A': { price: 3975, seats: 24 } },
      totalSeats: 324, availableSeats: 155,
    },
    {
      trainNumber: '12958', trainName: 'Rajdhani Express (Delhi)',
      origin: 'ADI', destination: 'NDLS',
      dep: future(2, 20), dur: 735,
      classes: { '3A': { price: 1640, seats: 200 }, '2A': { price: 2360, seats: 100 }, '1A': { price: 3975, seats: 24 } },
      totalSeats: 324, availableSeats: 130,
    },
    // NDLS → AGC (Delhi – Agra)
    {
      trainNumber: '12279', trainName: 'Taj Express',
      origin: 'NDLS', destination: 'AGC',
      dep: future(1, 7), dur: 135,
      classes: { SL: { price: 115, seats: 600 }, CC: { price: 285, seats: 200 } },
      totalSeats: 800, availableSeats: 420,
    },
    {
      trainNumber: '12280', trainName: 'Taj Express (Return)',
      origin: 'AGC', destination: 'NDLS',
      dep: future(1, 19), dur: 135,
      classes: { SL: { price: 115, seats: 600 }, CC: { price: 285, seats: 200 } },
      totalSeats: 800, availableSeats: 380,
    },
    // NDLS ↔ LKO (Delhi – Lucknow)
    {
      trainNumber: '12003', trainName: 'Lucknow Shatabdi Express',
      origin: 'NDLS', destination: 'LKO',
      dep: future(1, 6), dur: 330,
      classes: { CC: { price: 660, seats: 400 }, EC: { price: 1285, seats: 100 } },
      totalSeats: 500, availableSeats: 260,
    },
    {
      trainNumber: '12004', trainName: 'Lucknow Shatabdi (Return)',
      origin: 'LKO', destination: 'NDLS',
      dep: future(1, 17), dur: 330,
      classes: { CC: { price: 660, seats: 400 }, EC: { price: 1285, seats: 100 } },
      totalSeats: 500, availableSeats: 225,
    },
    // SC ↔ MAS (Hyderabad – Chennai)
    {
      trainNumber: '12603', trainName: 'Hyderabad Express',
      origin: 'SC', destination: 'MAS',
      dep: future(1, 15), dur: 720,
      classes: { SL: { price: 310, seats: 600 }, '3A': { price: 820, seats: 200 }, '2A': { price: 1180, seats: 100 } },
      totalSeats: 900, availableSeats: 370,
    },
    {
      trainNumber: '12604', trainName: 'Hyderabad Express (Return)',
      origin: 'MAS', destination: 'SC',
      dep: future(2, 16), dur: 720,
      classes: { SL: { price: 310, seats: 600 }, '3A': { price: 820, seats: 200 }, '2A': { price: 1180, seats: 100 } },
      totalSeats: 900, availableSeats: 315,
    },
    // PUNE ↔ NDLS (Pune – Delhi)
    {
      trainNumber: '12263', trainName: 'Pune Rajdhani Express',
      origin: 'PUNE', destination: 'NDLS',
      dep: future(1, 17), dur: 1050,
      classes: { '3A': { price: 1870, seats: 200 }, '2A': { price: 2690, seats: 100 }, '1A': { price: 4530, seats: 24 } },
      totalSeats: 324, availableSeats: 142,
    },
    {
      trainNumber: '12264', trainName: 'Hazrat Nizamuddin Rajdhani',
      origin: 'NDLS', destination: 'PUNE',
      dep: future(2, 16), dur: 1050,
      classes: { '3A': { price: 1870, seats: 200 }, '2A': { price: 2690, seats: 100 }, '1A': { price: 4530, seats: 24 } },
      totalSeats: 324, availableSeats: 118,
    },
  ]

  const created = []
  for (const t of trains) {
    const dep = t.dep
    const arr = new Date(dep.getTime() + t.dur * 60 * 1000)
    const train = await prisma.train.create({
      data: {
        trainNumber:    t.trainNumber,
        trainName:      t.trainName,
        origin:         t.origin,
        destination:    t.destination,
        departureTime:  dep,
        arrivalTime:    arr,
        duration:       t.dur,
        classes:        t.classes,
        totalSeats:     t.totalSeats,
        availableSeats: t.availableSeats,
      },
    })
    created.push(train)
  }
  console.log(`  ✓ ${created.length} trains`)
  return created
}

// ─── Buses ────────────────────────────────────────────────────────────────────

async function seedBuses() {
  const buses = [
    // Mumbai - Pune
    { operator: 'VRL Travels',       busType: 'AC Sleeper',        origin: 'Mumbai',    destination: 'Pune',      dep: future(1, 22), dur: 210, price: 550,  seats: 40, avail: 18, amenities: ['AC', 'Charging Port', 'Blanket', 'Water Bottle'] },
    { operator: 'Orange Travels',    busType: 'Volvo AC Multi-Axle', origin: 'Mumbai',  destination: 'Pune',      dep: future(1, 23), dur: 195, price: 480,  seats: 45, avail: 22, amenities: ['AC', 'Charging Port', 'WiFi'] },
    { operator: 'SRS Travels',       busType: 'Non-AC Sleeper',    origin: 'Mumbai',    destination: 'Pune',      dep: future(2, 21), dur: 225, price: 280,  seats: 40, avail: 12, amenities: ['Charging Port'] },

    // Delhi - Jaipur
    { operator: 'RSRTC',             busType: 'Volvo AC',          origin: 'Delhi',     destination: 'Jaipur',    dep: future(1, 6),  dur: 300, price: 650,  seats: 45, avail: 25, amenities: ['AC', 'WiFi'] },
    { operator: 'IntrCity SmartBus', busType: 'AC Sleeper',        origin: 'Delhi',     destination: 'Jaipur',    dep: future(1, 22), dur: 315, price: 799,  seats: 30, avail: 14, amenities: ['AC', 'Charging Port', 'Blanket', 'Snacks', 'WiFi'] },
    { operator: 'Raj Express',       busType: 'Non-AC Seater',     origin: 'Delhi',     destination: 'Jaipur',    dep: future(2, 7),  dur: 330, price: 320,  seats: 50, avail: 30, amenities: [] },

    // Bangalore - Chennai
    { operator: 'Orange Travels',    busType: 'Volvo AC Multi-Axle', origin: 'Bangalore', destination: 'Chennai', dep: future(1, 22), dur: 375, price: 750,  seats: 45, avail: 20, amenities: ['AC', 'Charging Port', 'WiFi'] },
    { operator: 'TNSTC',             busType: 'AC Seater',         origin: 'Bangalore',  destination: 'Chennai', dep: future(1, 23), dur: 360, price: 580,  seats: 50, avail: 28, amenities: ['AC'] },
    { operator: 'SRS Travels',       busType: 'AC Sleeper',        origin: 'Bangalore',  destination: 'Chennai', dep: future(2, 21), dur: 390, price: 850,  seats: 36, avail: 15, amenities: ['AC', 'Blanket', 'Charging Port'] },

    // Mumbai - Goa
    { operator: 'VRL Travels',       busType: 'AC Sleeper',        origin: 'Mumbai',    destination: 'Goa',       dep: future(1, 20), dur: 720, price: 1200, seats: 40, avail: 16, amenities: ['AC', 'Blanket', 'Charging Port', 'Water Bottle'] },
    { operator: 'Kadamba Transport', busType: 'Volvo AC',          origin: 'Mumbai',    destination: 'Goa',       dep: future(1, 21), dur: 690, price: 1050, seats: 45, avail: 20, amenities: ['AC', 'Charging Port'] },

    // Delhi - Manali
    { operator: 'HRTC',              busType: 'Volvo AC',          origin: 'Delhi',     destination: 'Manali',    dep: future(1, 17), dur: 840, price: 900,  seats: 45, avail: 22, amenities: ['AC', 'Charging Port'] },
    { operator: 'Kullu Manali Tours', busType: 'AC Sleeper',       origin: 'Delhi',     destination: 'Manali',   dep: future(2, 16), dur: 810, price: 1100, seats: 36, avail: 18, amenities: ['AC', 'Blanket', 'Charging Port'] },

    // Hyderabad - Bangalore
    { operator: 'SRS Travels',       busType: 'AC Sleeper',        origin: 'Hyderabad', destination: 'Bangalore', dep: future(1, 21), dur: 540, price: 700,  seats: 40, avail: 20, amenities: ['AC', 'Charging Port', 'Blanket'] },
    { operator: 'Orange Travels',    busType: 'Volvo AC Multi-Axle', origin: 'Hyderabad', destination: 'Bangalore', dep: future(1, 22), dur: 510, price: 850,  seats: 45, avail: 18, amenities: ['AC', 'Charging Port', 'WiFi'] },
    { operator: 'KSRTC',             busType: 'AC Seater',         origin: 'Hyderabad', destination: 'Bangalore', dep: future(2, 6),  dur: 570, price: 550,  seats: 50, avail: 30, amenities: ['AC'] },

    // Hyderabad - Chennai
    { operator: 'TSRTC',             busType: 'Volvo AC',          origin: 'Hyderabad', destination: 'Chennai',   dep: future(1, 20), dur: 480, price: 680,  seats: 45, avail: 22, amenities: ['AC', 'WiFi'] },
    { operator: 'SRS Travels',       busType: 'AC Sleeper',        origin: 'Hyderabad', destination: 'Chennai',   dep: future(2, 21), dur: 480, price: 750,  seats: 40, avail: 15, amenities: ['AC', 'Charging Port', 'Blanket'] },

    // Mumbai - Ahmedabad
    { operator: 'Gujarat Travels',   busType: 'Volvo AC',          origin: 'Mumbai',    destination: 'Ahmedabad', dep: future(1, 7),  dur: 420, price: 600,  seats: 45, avail: 24, amenities: ['AC', 'WiFi'] },
    { operator: 'Patel Travels',     busType: 'AC Sleeper',        origin: 'Mumbai',    destination: 'Ahmedabad', dep: future(1, 22), dur: 450, price: 750,  seats: 36, avail: 16, amenities: ['AC', 'Charging Port', 'Blanket', 'Snacks'] },
    { operator: 'GSRTC',             busType: 'Non-AC Seater',     origin: 'Mumbai',    destination: 'Ahmedabad', dep: future(2, 8),  dur: 480, price: 380,  seats: 50, avail: 28, amenities: [] },

    // Delhi - Agra
    { operator: 'Raj National Express', busType: 'AC Seater',      origin: 'Delhi',     destination: 'Agra',      dep: future(1, 6),  dur: 195, price: 350,  seats: 45, avail: 30, amenities: ['AC', 'WiFi'] },
    { operator: 'IntrCity SmartBus', busType: 'Volvo AC',          origin: 'Delhi',     destination: 'Agra',      dep: future(1, 9),  dur: 210, price: 499,  seats: 30, avail: 18, amenities: ['AC', 'Charging Port', 'Snacks', 'WiFi'] },
    { operator: 'UPSRTC',            busType: 'Non-AC Seater',     origin: 'Delhi',     destination: 'Agra',      dep: future(1, 7),  dur: 240, price: 180,  seats: 55, avail: 35, amenities: [] },

    // Bangalore - Goa
    { operator: 'VRL Travels',       busType: 'AC Sleeper',        origin: 'Bangalore', destination: 'Goa',       dep: future(1, 20), dur: 600, price: 950,  seats: 40, avail: 14, amenities: ['AC', 'Blanket', 'Charging Port', 'Water Bottle'] },
    { operator: 'Kadamba Transport', busType: 'Volvo AC',          origin: 'Bangalore', destination: 'Goa',       dep: future(2, 21), dur: 570, price: 850,  seats: 45, avail: 20, amenities: ['AC', 'Charging Port'] },

    // Pune - Goa
    { operator: 'Neeta Travels',     busType: 'AC Sleeper',        origin: 'Pune',      destination: 'Goa',       dep: future(1, 21), dur: 480, price: 800,  seats: 40, avail: 18, amenities: ['AC', 'Blanket', 'Charging Port'] },
    { operator: 'Paulo Travels',     busType: 'Volvo AC Multi-Axle', origin: 'Pune',    destination: 'Goa',       dep: future(1, 22), dur: 450, price: 950,  seats: 36, avail: 12, amenities: ['AC', 'Charging Port', 'WiFi', 'Blanket'] },

    // Chennai - Bangalore
    { operator: 'TNSTC',             busType: 'AC Seater',         origin: 'Chennai',   destination: 'Bangalore', dep: future(1, 6),  dur: 360, price: 520,  seats: 50, avail: 25, amenities: ['AC'] },
    { operator: 'Orange Travels',    busType: 'Volvo AC Multi-Axle', origin: 'Chennai', destination: 'Bangalore', dep: future(1, 22), dur: 375, price: 700,  seats: 45, avail: 20, amenities: ['AC', 'Charging Port', 'WiFi'] },

    // Jaipur - Delhi
    { operator: 'RSRTC',             busType: 'Volvo AC',          origin: 'Jaipur',    destination: 'Delhi',     dep: future(1, 7),  dur: 300, price: 620,  seats: 45, avail: 28, amenities: ['AC', 'WiFi'] },
    { operator: 'IntrCity SmartBus', busType: 'AC Sleeper',        origin: 'Jaipur',    destination: 'Delhi',     dep: future(1, 23), dur: 315, price: 799,  seats: 30, avail: 16, amenities: ['AC', 'Charging Port', 'Blanket', 'Snacks', 'WiFi'] },
  ]

  const created = []
  for (const b of buses) {
    const dep = b.dep
    const arr = new Date(dep.getTime() + b.dur * 60 * 1000)
    const bus = await prisma.bus.create({
      data: {
        operator:       b.operator,
        busType:        b.busType,
        origin:         b.origin,
        destination:    b.destination,
        departureTime:  dep,
        arrivalTime:    arr,
        duration:       b.dur,
        price:          b.price,
        totalSeats:     b.seats,
        availableSeats: b.avail,
        amenities:      b.amenities,
      },
    })
    created.push(bus)
  }
  console.log(`  ✓ ${created.length} buses`)
  return created
}

// ─── Cabs ─────────────────────────────────────────────────────────────────────

async function seedCabs() {
  const cabs = [
    { type: 'Mini',      model: 'Maruti Swift / Wagon R',    capacity: 4, pricePerKm: 11, basePrice: 50  },
    { type: 'Sedan',     model: 'Honda City / Hyundai Verna', capacity: 4, pricePerKm: 14, basePrice: 75  },
    { type: 'SUV',       model: 'Toyota Innova / Mahindra XUV500', capacity: 6, pricePerKm: 19, basePrice: 100 },
    { type: 'Prime SUV', model: 'Toyota Fortuner / Tata Safari', capacity: 6, pricePerKm: 24, basePrice: 150 },
    { type: 'Auto',      model: 'Bajaj RE Compact',          capacity: 3, pricePerKm: 8,  basePrice: 30  },
    { type: 'Bike',      model: 'Honda Activa / Royal Enfield', capacity: 1, pricePerKm: 5, basePrice: 20  },
  ]

  const created = []
  for (const c of cabs) {
    const cab = await prisma.cab.create({ data: c })
    created.push(cab)
  }
  console.log(`  ✓ ${created.length} cab types`)
  return created
}

// ─── Reviews ──────────────────────────────────────────────────────────────────

async function seedReviews(users, hotels) {
  const reviews = [
    { userIdx: 1, hotelIdx: 0, rating: 5, comment: 'Absolutely magnificent! The heritage and grandeur of Taj is unmatched. Service is impeccable.' },
    { userIdx: 2, hotelIdx: 0, rating: 4, comment: 'Wonderful stay. Food was excellent and staff very courteous. Slightly overpriced but worth it.' },
    { userIdx: 1, hotelIdx: 3, rating: 5, comment: 'Best hotel in Delhi. Rooms are luxurious and the spa is world class.' },
    { userIdx: 3, hotelIdx: 6, rating: 4, comment: 'Great business hotel. Very convenient for meetings. Gym and pool are top notch.' },
    { userIdx: 2, hotelIdx: 8, rating: 5, comment: 'Dream resort! Woke up to the sound of waves every morning. Staff treated us like royalty.' },
    { userIdx: 1, hotelIdx: 9, rating: 4, comment: 'Lovely resort with great ambience. The golf course is amazing. Food could be better.' },
    { userIdx: 3, hotelIdx: 2, rating: 3, comment: 'Decent budget option in a great location. Room was clean and staff helpful.' },
    { userIdx: 2, hotelIdx: 5, rating: 2, comment: 'Very basic. AC was noisy and bathroom needed cleaning. Location is good though.' },
  ]

  const created = []
  for (const r of reviews) {
    const review = await prisma.review.create({
      data: {
        userId:  users[r.userIdx].id,
        hotelId: hotels[r.hotelIdx].id,
        rating:  r.rating,
        comment: r.comment,
      },
    })
    created.push(review)
  }
  console.log(`  ✓ ${created.length} reviews`)
  return created
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Seeding database...\n')

  // Seed users first (upsert preserves existing UUIDs so live JWTs stay valid)
  const users   = await seedUsers()

  // Clear travel data (preserve users so tokens remain valid after re-seed)
  await prisma.review.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.booking.deleteMany()
  await prisma.room.deleteMany()
  await prisma.cab.deleteMany()
  await prisma.bus.deleteMany()
  await prisma.train.deleteMany()
  await prisma.flight.deleteMany()
  await prisma.hotel.deleteMany()
  console.log('  ✓ Cleared travel data\n')
  const flights = await seedFlights()
  const hotels  = await seedHotels()
  const trains  = await seedTrains()
  const buses   = await seedBuses()
  const cabs    = await seedCabs()
  await seedReviews(users, hotels)

  console.log(`
Done! Summary:
  Users:   ${users.length}
  Flights: ${flights.length}
  Hotels:  ${hotels.length}
  Trains:  ${trains.length}
  Buses:   ${buses.length}
  Cabs:    ${cabs.length}

Test credentials:
  Admin  → admin@goibibo.com  / Admin@1234
  User 1 → ritika@goibibo.com / Test@1234
  User 2 → arjun@goibibo.com  / Test@1234
  User 3 → priya@goibibo.com  / Test@1234
  `)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
