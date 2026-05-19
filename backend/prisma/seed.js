require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

// ─── Helpers ────────────────────────────────────────────────────────────────

// Fixed date in May 2026 (day = 19..30)
function d(day, hour, min = 0) {
  return new Date(2026, 4, day, hour, min, 0, 0)   // month index 4 = May
}

function addMins(date, mins) {
  return new Date(date.getTime() + mins * 60 * 1000)
}

// Days covered: May 19 – May 30
const DAYS = Array.from({ length: 12 }, (_, i) => 19 + i)

// ─── Users ───────────────────────────────────────────────────────────────────

async function seedUsers() {
  const hash = (pw) => bcrypt.hashSync(pw, 12)

  const users = [
    { name: 'Manager',        email: 'manager@goibibo.com', password: hash('Manager@1234'), role: 'MANAGER', phone: '9000000001' },
    { name: 'Ritika Purohit', email: 'ritika@goibibo.com', password: hash('Test@1234'),  role: 'USER',  phone: '9876543210' },
    { name: 'Arjun Mehta',    email: 'arjun@goibibo.com',  password: hash('Test@1234'),  role: 'USER',  phone: '9123456789' },
    { name: 'Priya Sharma',   email: 'priya@goibibo.com',  password: hash('Test@1234'),  role: 'USER',  phone: '9988776655' },
  ]

  const created = []
  for (const u of users) {
    const user = await prisma.user.upsert({ where: { email: u.email }, update: {}, create: u })
    created.push(user)
  }
  console.log(`  ✓ ${created.length} users`)
  return created
}

// ─── Flights ─────────────────────────────────────────────────────────────────
// Templates: each row generates one flight per day (May 19–30).
// hour variants are separate rows so each flight number stays realistic.

async function seedFlights() {
  const templates = [
    // DEL ↔ BOM
    { fn: 'G8-101',  airline: 'GoAir',     from: 'DEL', to: 'BOM', hour: 6,  dur: 135, price: 4299, seats: 180, cabin: 'ECONOMY',  stops: 0 },
    { fn: '6E-201',  airline: 'IndiGo',    from: 'DEL', to: 'BOM', hour: 9,  dur: 140, price: 3999, seats: 186, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'AI-101',  airline: 'Air India', from: 'DEL', to: 'BOM', hour: 12, dur: 150, price: 5500, seats: 200, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'UK-901',  airline: 'Vistara',   from: 'DEL', to: 'BOM', hour: 15, dur: 135, price: 7200, seats: 160, cabin: 'BUSINESS', stops: 0 },
    { fn: 'SG-301',  airline: 'SpiceJet',  from: 'DEL', to: 'BOM', hour: 19, dur: 155, price: 3599, seats: 174, cabin: 'ECONOMY',  stops: 1 },
    { fn: 'G8-102',  airline: 'GoAir',     from: 'BOM', to: 'DEL', hour: 7,  dur: 135, price: 4199, seats: 180, cabin: 'ECONOMY',  stops: 0 },
    { fn: '6E-202',  airline: 'IndiGo',    from: 'BOM', to: 'DEL', hour: 11, dur: 140, price: 3899, seats: 186, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'AI-102',  airline: 'Air India', from: 'BOM', to: 'DEL', hour: 14, dur: 150, price: 5800, seats: 200, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'UK-902',  airline: 'Vistara',   from: 'BOM', to: 'DEL', hour: 18, dur: 135, price: 7400, seats: 160, cabin: 'BUSINESS', stops: 0 },

    // DEL ↔ BLR
    { fn: '6E-401',  airline: 'IndiGo',    from: 'DEL', to: 'BLR', hour: 7,  dur: 170, price: 4599, seats: 186, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'SG-401',  airline: 'SpiceJet',  from: 'DEL', to: 'BLR', hour: 10, dur: 175, price: 3999, seats: 174, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'UK-401',  airline: 'Vistara',   from: 'DEL', to: 'BLR', hour: 14, dur: 170, price: 8500, seats: 160, cabin: 'BUSINESS', stops: 0 },
    { fn: 'AI-401',  airline: 'Air India', from: 'DEL', to: 'BLR', hour: 19, dur: 180, price: 6200, seats: 200, cabin: 'ECONOMY',  stops: 0 },
    { fn: '6E-402',  airline: 'IndiGo',    from: 'BLR', to: 'DEL', hour: 9,  dur: 170, price: 4799, seats: 186, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'SG-402',  airline: 'SpiceJet',  from: 'BLR', to: 'DEL', hour: 13, dur: 175, price: 4299, seats: 174, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'AI-402',  airline: 'Air India', from: 'BLR', to: 'DEL', hour: 17, dur: 180, price: 6400, seats: 200, cabin: 'ECONOMY',  stops: 0 },

    // DEL ↔ CCU
    { fn: '6E-501',  airline: 'IndiGo',    from: 'DEL', to: 'CCU', hour: 8,  dur: 150, price: 4200, seats: 186, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'SG-501',  airline: 'SpiceJet',  from: 'DEL', to: 'CCU', hour: 13, dur: 160, price: 3800, seats: 174, cabin: 'ECONOMY',  stops: 1 },
    { fn: 'AI-501',  airline: 'Air India', from: 'DEL', to: 'CCU', hour: 17, dur: 155, price: 4900, seats: 200, cabin: 'ECONOMY',  stops: 0 },
    { fn: '6E-502',  airline: 'IndiGo',    from: 'CCU', to: 'DEL', hour: 7,  dur: 150, price: 4100, seats: 186, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'AI-502',  airline: 'Air India', from: 'CCU', to: 'DEL', hour: 14, dur: 155, price: 5100, seats: 200, cabin: 'ECONOMY',  stops: 0 },

    // BOM ↔ GOI
    { fn: '6E-601',  airline: 'IndiGo',    from: 'BOM', to: 'GOI', hour: 7,  dur: 65,  price: 2999, seats: 186, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'G8-601',  airline: 'GoAir',     from: 'BOM', to: 'GOI', hour: 11, dur: 70,  price: 2599, seats: 180, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'SG-601',  airline: 'SpiceJet',  from: 'BOM', to: 'GOI', hour: 16, dur: 70,  price: 2799, seats: 174, cabin: 'ECONOMY',  stops: 0 },
    { fn: '6E-602',  airline: 'IndiGo',    from: 'GOI', to: 'BOM', hour: 9,  dur: 65,  price: 3099, seats: 186, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'G8-602',  airline: 'GoAir',     from: 'GOI', to: 'BOM', hour: 14, dur: 70,  price: 2699, seats: 180, cabin: 'ECONOMY',  stops: 0 },

    // DEL ↔ GOI
    { fn: 'AI-601',  airline: 'Air India', from: 'DEL', to: 'GOI', hour: 9,  dur: 120, price: 5200, seats: 200, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'UK-601',  airline: 'Vistara',   from: 'DEL', to: 'GOI', hour: 14, dur: 125, price: 9800, seats: 160, cabin: 'FIRST',    stops: 0 },
    { fn: 'AI-602',  airline: 'Air India', from: 'GOI', to: 'DEL', hour: 11, dur: 120, price: 5400, seats: 200, cabin: 'ECONOMY',  stops: 0 },

    // BOM ↔ BLR
    { fn: '6E-701',  airline: 'IndiGo',    from: 'BOM', to: 'BLR', hour: 6,  dur: 100, price: 3499, seats: 186, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'SG-701',  airline: 'SpiceJet',  from: 'BOM', to: 'BLR', hour: 11, dur: 105, price: 3199, seats: 174, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'AI-701',  airline: 'Air India', from: 'BOM', to: 'BLR', hour: 16, dur: 110, price: 4800, seats: 200, cabin: 'ECONOMY',  stops: 0 },
    { fn: '6E-702',  airline: 'IndiGo',    from: 'BLR', to: 'BOM', hour: 8,  dur: 100, price: 3599, seats: 186, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'UK-702',  airline: 'Vistara',   from: 'BLR', to: 'BOM', hour: 13, dur: 110, price: 7800, seats: 160, cabin: 'BUSINESS', stops: 0 },
    { fn: 'SG-702',  airline: 'SpiceJet',  from: 'BLR', to: 'BOM', hour: 18, dur: 105, price: 3399, seats: 174, cabin: 'ECONOMY',  stops: 0 },

    // DEL ↔ HYD
    { fn: '6E-801',  airline: 'IndiGo',    from: 'DEL', to: 'HYD', hour: 7,  dur: 150, price: 4299, seats: 186, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'SG-801',  airline: 'SpiceJet',  from: 'DEL', to: 'HYD', hour: 11, dur: 155, price: 3899, seats: 174, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'AI-801',  airline: 'Air India', from: 'DEL', to: 'HYD', hour: 15, dur: 160, price: 5600, seats: 200, cabin: 'ECONOMY',  stops: 0 },
    { fn: '6E-802',  airline: 'IndiGo',    from: 'HYD', to: 'DEL', hour: 9,  dur: 150, price: 4399, seats: 186, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'UK-802',  airline: 'Vistara',   from: 'HYD', to: 'DEL', hour: 14, dur: 155, price: 8200, seats: 160, cabin: 'BUSINESS', stops: 0 },
    { fn: 'SG-802',  airline: 'SpiceJet',  from: 'HYD', to: 'DEL', hour: 18, dur: 155, price: 4099, seats: 174, cabin: 'ECONOMY',  stops: 0 },

    // BOM ↔ HYD
    { fn: '6E-901',  airline: 'IndiGo',    from: 'BOM', to: 'HYD', hour: 8,  dur: 80,  price: 3199, seats: 186, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'G8-901',  airline: 'GoAir',     from: 'BOM', to: 'HYD', hour: 13, dur: 85,  price: 2899, seats: 180, cabin: 'ECONOMY',  stops: 0 },
    { fn: '6E-902',  airline: 'IndiGo',    from: 'HYD', to: 'BOM', hour: 10, dur: 80,  price: 3299, seats: 186, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'SG-902',  airline: 'SpiceJet',  from: 'HYD', to: 'BOM', hour: 17, dur: 90,  price: 3599, seats: 174, cabin: 'ECONOMY',  stops: 0 },

    // DEL ↔ MAA
    { fn: '6E-111',  airline: 'IndiGo',    from: 'DEL', to: 'MAA', hour: 6,  dur: 180, price: 4699, seats: 186, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'AI-111',  airline: 'Air India', from: 'DEL', to: 'MAA', hour: 10, dur: 185, price: 6100, seats: 200, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'SG-111',  airline: 'SpiceJet',  from: 'DEL', to: 'MAA', hour: 15, dur: 195, price: 4299, seats: 174, cabin: 'ECONOMY',  stops: 1 },
    { fn: '6E-112',  airline: 'IndiGo',    from: 'MAA', to: 'DEL', hour: 7,  dur: 180, price: 4799, seats: 186, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'SG-112',  airline: 'SpiceJet',  from: 'MAA', to: 'DEL', hour: 14, dur: 190, price: 4299, seats: 174, cabin: 'ECONOMY',  stops: 1 },
    { fn: 'AI-112',  airline: 'Air India', from: 'MAA', to: 'DEL', hour: 19, dur: 185, price: 6300, seats: 200, cabin: 'ECONOMY',  stops: 0 },

    // BLR ↔ HYD
    { fn: '6E-121',  airline: 'IndiGo',    from: 'BLR', to: 'HYD', hour: 7,  dur: 60,  price: 2499, seats: 186, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'SG-121',  airline: 'SpiceJet',  from: 'BLR', to: 'HYD', hour: 12, dur: 65,  price: 2199, seats: 174, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'AI-121',  airline: 'Air India', from: 'BLR', to: 'HYD', hour: 17, dur: 60,  price: 2999, seats: 200, cabin: 'ECONOMY',  stops: 0 },
    { fn: '6E-122',  airline: 'IndiGo',    from: 'HYD', to: 'BLR', hour: 9,  dur: 60,  price: 2599, seats: 186, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'SG-122',  airline: 'SpiceJet',  from: 'HYD', to: 'BLR', hour: 15, dur: 65,  price: 2299, seats: 174, cabin: 'ECONOMY',  stops: 0 },

    // CCU ↔ BOM
    { fn: 'AI-131',  airline: 'Air India', from: 'CCU', to: 'BOM', hour: 8,  dur: 170, price: 5400, seats: 200, cabin: 'ECONOMY',  stops: 0 },
    { fn: '6E-131',  airline: 'IndiGo',    from: 'CCU', to: 'BOM', hour: 14, dur: 175, price: 4999, seats: 186, cabin: 'ECONOMY',  stops: 0 },
    { fn: '6E-132',  airline: 'IndiGo',    from: 'BOM', to: 'CCU', hour: 11, dur: 170, price: 5199, seats: 186, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'AI-132',  airline: 'Air India', from: 'BOM', to: 'CCU', hour: 17, dur: 170, price: 5600, seats: 200, cabin: 'ECONOMY',  stops: 0 },

    // DEL ↔ AMD
    { fn: '6E-141',  airline: 'IndiGo',    from: 'DEL', to: 'AMD', hour: 8,  dur: 90,  price: 2999, seats: 186, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'G8-141',  airline: 'GoAir',     from: 'DEL', to: 'AMD', hour: 13, dur: 95,  price: 2699, seats: 180, cabin: 'ECONOMY',  stops: 0 },
    { fn: '6E-142',  airline: 'IndiGo',    from: 'AMD', to: 'DEL', hour: 10, dur: 90,  price: 3099, seats: 186, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'SG-142',  airline: 'SpiceJet',  from: 'AMD', to: 'DEL', hour: 16, dur: 95,  price: 2899, seats: 174, cabin: 'ECONOMY',  stops: 0 },

    // BLR ↔ MAA
    { fn: '6E-151',  airline: 'IndiGo',    from: 'BLR', to: 'MAA', hour: 6,  dur: 55,  price: 2299, seats: 186, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'AI-151',  airline: 'Air India', from: 'BLR', to: 'MAA', hour: 11, dur: 60,  price: 3400, seats: 200, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'SG-151',  airline: 'SpiceJet',  from: 'BLR', to: 'MAA', hour: 16, dur: 55,  price: 2599, seats: 174, cabin: 'ECONOMY',  stops: 0 },
    { fn: '6E-152',  airline: 'IndiGo',    from: 'MAA', to: 'BLR', hour: 8,  dur: 55,  price: 2399, seats: 186, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'AI-152',  airline: 'Air India', from: 'MAA', to: 'BLR', hour: 14, dur: 60,  price: 3600, seats: 200, cabin: 'ECONOMY',  stops: 0 },

    // DEL ↔ JAI (Jaipur)
    { fn: '6E-161',  airline: 'IndiGo',    from: 'DEL', to: 'JAI', hour: 7,  dur: 70,  price: 2499, seats: 186, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'SG-161',  airline: 'SpiceJet',  from: 'DEL', to: 'JAI', hour: 14, dur: 75,  price: 2299, seats: 174, cabin: 'ECONOMY',  stops: 0 },
    { fn: '6E-162',  airline: 'IndiGo',    from: 'JAI', to: 'DEL', hour: 9,  dur: 70,  price: 2599, seats: 186, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'SG-162',  airline: 'SpiceJet',  from: 'JAI', to: 'DEL', hour: 16, dur: 75,  price: 2399, seats: 174, cabin: 'ECONOMY',  stops: 0 },

    // BOM ↔ MAA
    { fn: '6E-171',  airline: 'IndiGo',    from: 'BOM', to: 'MAA', hour: 8,  dur: 110, price: 3799, seats: 186, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'AI-171',  airline: 'Air India', from: 'BOM', to: 'MAA', hour: 14, dur: 115, price: 5200, seats: 200, cabin: 'ECONOMY',  stops: 0 },
    { fn: '6E-172',  airline: 'IndiGo',    from: 'MAA', to: 'BOM', hour: 10, dur: 110, price: 3899, seats: 186, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'AI-172',  airline: 'Air India', from: 'MAA', to: 'BOM', hour: 16, dur: 115, price: 5400, seats: 200, cabin: 'ECONOMY',  stops: 0 },
  ]

  const records = []
  for (const day of DAYS) {
    for (const t of templates) {
      const dep = d(day, t.hour)
      const arr = addMins(dep, t.dur)
      // Vary seat availability slightly by day to make data feel real
      const availFactor = 0.5 + (day % 5) * 0.08
      await prisma.flight.create({
        data: {
          flightNumber:   t.fn,
          airline:        t.airline,
          origin:         t.from,
          destination:    t.to,
          departureTime:  dep,
          arrivalTime:    arr,
          duration:       t.dur,
          price:          t.price + (day - 19) * Math.floor(t.price * 0.01),  // slight price increase by day
          totalSeats:     t.seats,
          availableSeats: Math.max(5, Math.floor(t.seats * availFactor)),
          cabinClass:     t.cabin,
          stops:          t.stops,
        },
      })
      records.push(1)
    }
  }
  console.log(`  ✓ ${records.length} flights (${templates.length} routes × ${DAYS.length} days)`)
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
        { type: 'Deluxe Room',        desc: 'Elegant room with harbour view',                price: 18000, cap: 2, total: 30, avail: 12, amenities: ['AC', 'TV', 'WiFi', 'Minibar'] },
        { type: 'Superior Room',      desc: 'Spacious room with city view',                  price: 22000, cap: 2, total: 20, avail: 8,  amenities: ['AC', 'TV', 'WiFi', 'Minibar', 'Bathtub'] },
        { type: 'Junior Suite',       desc: 'Elegant suite with separate sitting area',      price: 35000, cap: 3, total: 15, avail: 5,  amenities: ['AC', 'TV', 'WiFi', 'Minibar', 'Jacuzzi', 'Butler'] },
        { type: 'Grand Luxury Suite', desc: 'Opulent suite with panoramic harbour view',     price: 65000, cap: 4, total: 5,  avail: 2,  amenities: ['AC', 'TV', 'WiFi', 'Minibar', 'Private Pool', 'Butler'] },
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
        { type: 'Premier Room', desc: 'Modern room with BKC skyline view',         price: 9500,  cap: 2, total: 40, avail: 18, amenities: ['AC', 'TV', 'WiFi'] },
        { type: 'Club Room',    desc: 'Club floor access with lounge benefits',    price: 13000, cap: 2, total: 20, avail: 9,  amenities: ['AC', 'TV', 'WiFi', 'Lounge Access'] },
        { type: 'Suite',        desc: 'Spacious suite with separate living area',  price: 22000, cap: 3, total: 10, avail: 4,  amenities: ['AC', 'TV', 'WiFi', 'Minibar'] },
      ],
    },
    {
      name: 'FabHotel Prime Colaba',
      description: 'Budget-friendly hotel in South Mumbai close to tourist attractions.',
      city: 'Mumbai',
      address: '12 Colaba Causeway, Mumbai 400005',
      starRating: 3,
      amenities: ['WiFi', 'Restaurant', 'Room Service', '24hr Reception'],
      images: [],
      rooms: [
        { type: 'Standard Room', desc: 'Clean and comfortable standard room', price: 2200, cap: 2, total: 30, avail: 15, amenities: ['AC', 'TV', 'WiFi'] },
        { type: 'Deluxe Room',   desc: 'Spacious room with street view',       price: 2800, cap: 2, total: 20, avail: 10, amenities: ['AC', 'TV', 'WiFi'] },
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
      images: [],
      rooms: [
        { type: 'Luxury Room',   desc: 'Elegant room with garden or pool view',   price: 16000, cap: 2, total: 40, avail: 15, amenities: ['AC', 'TV', 'WiFi', 'Minibar'] },
        { type: 'Luxury Suite',  desc: 'Spacious suite with separate living room', price: 32000, cap: 3, total: 15, avail: 6,  amenities: ['AC', 'TV', 'WiFi', 'Minibar', 'Butler'] },
        { type: 'Premier Suite', desc: 'Opulent suite with panoramic city views',  price: 55000, cap: 4, total: 8,  avail: 3,  amenities: ['AC', 'TV', 'WiFi', 'Private Dining', 'Butler'] },
      ],
    },
    {
      name: 'Radisson Blu New Delhi Paschim Vihar',
      description: 'Modern upscale hotel with excellent connectivity to IGI Airport.',
      city: 'Delhi',
      address: 'Paschim Vihar, New Delhi 110063',
      starRating: 4,
      amenities: ['WiFi', 'Pool', 'Gym', 'Restaurant', 'Bar', 'Business Centre'],
      images: [],
      rooms: [
        { type: 'Superior Room',  desc: 'Contemporary room with city view',     price: 5500,  cap: 2, total: 50, avail: 22, amenities: ['AC', 'TV', 'WiFi'] },
        { type: 'Business Class', desc: 'Premium room with lounge access',      price: 7500,  cap: 2, total: 25, avail: 10, amenities: ['AC', 'TV', 'WiFi', 'Lounge Access'] },
        { type: 'Suite',          desc: 'Expansive suite with panoramic views', price: 14000, cap: 3, total: 10, avail: 4,  amenities: ['AC', 'TV', 'WiFi', 'Minibar'] },
      ],
    },
    {
      name: 'OYO Flagship Karol Bagh',
      description: 'Comfortable budget hotel in the popular shopping area of Karol Bagh.',
      city: 'Delhi',
      address: '14 Arya Samaj Road, Karol Bagh, New Delhi 110005',
      starRating: 2,
      amenities: ['WiFi', 'Room Service', '24hr Reception'],
      images: [],
      rooms: [
        { type: 'Standard Room', desc: 'Cosy room with basic amenities',     price: 1200, cap: 2, total: 25, avail: 14, amenities: ['AC', 'TV', 'WiFi'] },
        { type: 'Deluxe Room',   desc: 'Spacious room with extra comfort',   price: 1600, cap: 2, total: 15, avail: 8,  amenities: ['AC', 'TV', 'WiFi'] },
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
      images: [],
      rooms: [
        { type: 'Luxury Room',  desc: 'Modern room with garden or pool view', price: 11000, cap: 2, total: 50, avail: 20, amenities: ['AC', 'TV', 'WiFi', 'Minibar'] },
        { type: 'Towers Suite', desc: 'Exclusive suite with butler service',  price: 28000, cap: 3, total: 12, avail: 5,  amenities: ['AC', 'TV', 'WiFi', 'Butler', 'Jacuzzi'] },
      ],
    },
    {
      name: 'Lemon Tree Hotel Electronic City',
      description: 'Contemporary mid-scale hotel near the tech hub of Electronic City.',
      city: 'Bangalore',
      address: 'Phase 1, Electronic City, Bangalore 560100',
      starRating: 3,
      amenities: ['WiFi', 'Pool', 'Gym', 'Restaurant', 'Bar'],
      images: [],
      rooms: [
        { type: 'Studio',         desc: 'Compact room ideal for business travellers', price: 3200, cap: 1, total: 40, avail: 18, amenities: ['AC', 'TV', 'WiFi'] },
        { type: 'Premium Studio', desc: 'Larger room with work desk',                 price: 4200, cap: 2, total: 25, avail: 11, amenities: ['AC', 'TV', 'WiFi'] },
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
      images: [],
      rooms: [
        { type: 'Luxury Room',     desc: 'Tropical room with garden view',    price: 22000, cap: 2, total: 60, avail: 25, amenities: ['AC', 'TV', 'WiFi', 'Balcony'] },
        { type: 'Luxury Sea View', desc: 'Room with direct Arabian Sea view',  price: 30000, cap: 2, total: 30, avail: 12, amenities: ['AC', 'TV', 'WiFi', 'Balcony', 'Minibar'] },
        { type: 'Luxury Villa',    desc: 'Private villa with pool',            price: 75000, cap: 4, total: 10, avail: 3,  amenities: ['AC', 'TV', 'WiFi', 'Private Pool', 'Butler'] },
      ],
    },
    {
      name: 'The LaLiT Golf & Spa Resort Goa',
      description: 'Sprawling resort with a championship golf course on the beaches of North Goa.',
      city: 'Goa',
      address: 'Raj Baga, Canacona, South Goa 403702',
      starRating: 5,
      amenities: ['WiFi', 'Golf Course', 'Pool', 'Spa', 'Gym', 'Restaurant', 'Bar', 'Beach Access'],
      images: [],
      rooms: [
        { type: 'Deluxe Room', desc: 'Serene room with pool or garden view', price: 12000, cap: 2, total: 45, avail: 20, amenities: ['AC', 'TV', 'WiFi'] },
        { type: 'Suite',       desc: 'Spacious suite with sea view',         price: 25000, cap: 3, total: 15, avail: 7,  amenities: ['AC', 'TV', 'WiFi', 'Minibar', 'Jacuzzi'] },
      ],
    },
    {
      name: 'Zostel Goa (Panaji)',
      description: 'Popular backpacker hostel with vibrant social atmosphere in Goa\'s capital.',
      city: 'Goa',
      address: '31/1 January 6th Road, Panaji, Goa 403001',
      starRating: 2,
      amenities: ['WiFi', 'Common Kitchen', 'Lounge', 'Outdoor Seating', 'Tours Desk'],
      images: [],
      rooms: [
        { type: 'Dormitory Bed', desc: '6-bed mixed dormitory',             price: 650,  cap: 1, total: 30, avail: 18, amenities: ['WiFi', 'Locker'] },
        { type: 'Private Room',  desc: 'Private room with shared bathroom', price: 2200, cap: 2, total: 8,  avail: 4,  amenities: ['AC', 'WiFi'] },
      ],
    },

    // Chennai
    {
      name: 'ITC Grand Chola',
      description: 'Grand luxury hotel inspired by Chola dynasty architecture in Chennai\'s business district.',
      city: 'Chennai',
      address: '63, Mount Road, Guindy, Chennai 600032',
      starRating: 5,
      amenities: ['WiFi', 'Pool', 'Spa', 'Gym', 'Multiple Restaurants', 'Bar', 'Business Centre', 'Airport Shuttle'],
      images: [],
      rooms: [
        { type: 'Luxury Room',    desc: 'Contemporary room with city or pool view',   price: 12000, cap: 2, total: 50, avail: 22, amenities: ['AC', 'TV', 'WiFi', 'Minibar'] },
        { type: 'Executive Club', desc: 'Club floor room with exclusive lounge',      price: 18000, cap: 2, total: 25, avail: 10, amenities: ['AC', 'TV', 'WiFi', 'Lounge Access', 'Minibar'] },
        { type: 'Grand Suite',    desc: 'Opulent suite inspired by Chola artistry',   price: 45000, cap: 4, total: 8,  avail: 3,  amenities: ['AC', 'TV', 'WiFi', 'Butler', 'Jacuzzi'] },
      ],
    },
    {
      name: 'Feathers — A Radha Hotel',
      description: 'Stylish contemporary hotel near the airport with a rooftop pool.',
      city: 'Chennai',
      address: '1, Rajiv Gandhi Salai, Navallur, Chennai 600130',
      starRating: 4,
      amenities: ['WiFi', 'Rooftop Pool', 'Gym', 'Restaurant', 'Bar', 'Spa'],
      images: [],
      rooms: [
        { type: 'Deluxe Room',  desc: 'Well-appointed room with city view',      price: 6000,  cap: 2, total: 45, avail: 20, amenities: ['AC', 'TV', 'WiFi'] },
        { type: 'Premium Room', desc: 'Larger room with pool or garden view',    price: 8500,  cap: 2, total: 20, avail: 9,  amenities: ['AC', 'TV', 'WiFi', 'Minibar'] },
        { type: 'Suite',        desc: 'Spacious suite with separate living area', price: 16000, cap: 3, total: 8,  avail: 4,  amenities: ['AC', 'TV', 'WiFi', 'Minibar', 'Bathtub'] },
      ],
    },
    {
      name: 'Treebo Trend Arina Grand',
      description: 'Budget-friendly hotel in T Nagar, walking distance from Chennai\'s best shopping streets.',
      city: 'Chennai',
      address: '12, Venkatnarayana Road, T Nagar, Chennai 600017',
      starRating: 3,
      amenities: ['WiFi', 'Restaurant', 'Room Service', '24hr Reception'],
      images: [],
      rooms: [
        { type: 'Standard Room', desc: 'Clean air-conditioned room',           price: 1800, cap: 2, total: 30, avail: 16, amenities: ['AC', 'TV', 'WiFi'] },
        { type: 'Superior Room', desc: 'Slightly larger room with work desk',  price: 2400, cap: 2, total: 18, avail: 10, amenities: ['AC', 'TV', 'WiFi'] },
      ],
    },

    // Hyderabad
    {
      name: 'Taj Falaknuma Palace',
      description: 'Iconic palace hotel perched atop a hill, offering a royal experience in Hyderabad.',
      city: 'Hyderabad',
      address: 'Engine Bowli, Falaknuma, Hyderabad 500053',
      starRating: 5,
      amenities: ['WiFi', 'Pool', 'Spa', 'Gym', 'Heritage Restaurant', 'Bar', 'Butler Service', 'Horse Carriage'],
      images: [],
      rooms: [
        { type: 'Palace Room',  desc: 'Elegantly furnished room in the palace', price: 28000,  cap: 2, total: 30, avail: 12, amenities: ['AC', 'TV', 'WiFi', 'Minibar', 'Butler'] },
        { type: 'Luxury Suite', desc: 'Grand suite with antique furnishings',   price: 55000,  cap: 3, total: 10, avail: 4,  amenities: ['AC', 'TV', 'WiFi', 'Minibar', 'Jacuzzi', 'Butler'] },
        { type: 'Royal Suite',  desc: 'The grandest suite in the palace',       price: 110000, cap: 4, total: 4,  avail: 1,  amenities: ['AC', 'TV', 'WiFi', 'Private Dining', 'Butler', 'Private Pool'] },
      ],
    },
    {
      name: 'Novotel Hyderabad Convention Centre',
      description: 'Premium business hotel adjacent to Hyderabad International Convention Centre.',
      city: 'Hyderabad',
      address: 'Novotel & HICC Complex, Cyberabad, Hyderabad 500081',
      starRating: 5,
      amenities: ['WiFi', 'Pool', 'Gym', 'Spa', 'Multiple Restaurants', 'Bar', 'Business Centre'],
      images: [],
      rooms: [
        { type: 'Superior Room',  desc: 'Contemporary room with city view',    price: 7500,  cap: 2, total: 50, avail: 24, amenities: ['AC', 'TV', 'WiFi'] },
        { type: 'Executive Room', desc: 'Premium room with lounge access',     price: 10500, cap: 2, total: 25, avail: 11, amenities: ['AC', 'TV', 'WiFi', 'Lounge Access'] },
        { type: 'Suite',          desc: 'Expansive suite with panoramic views', price: 20000, cap: 3, total: 10, avail: 5,  amenities: ['AC', 'TV', 'WiFi', 'Minibar'] },
      ],
    },
    {
      name: 'Ginger Hyderabad HITEC City',
      description: 'Smart budget hotel in the heart of Hyderabad\'s IT hub.',
      city: 'Hyderabad',
      address: 'Plot 5, HUDA Tech Enclave, HITEC City, Hyderabad 500081',
      starRating: 3,
      amenities: ['WiFi', 'Restaurant', 'Gym', 'Room Service'],
      images: [],
      rooms: [
        { type: 'Smart Room',      desc: 'Compact room with all essentials', price: 2200, cap: 2, total: 40, avail: 22, amenities: ['AC', 'TV', 'WiFi'] },
        { type: 'Smart Plus Room', desc: 'Larger room with extra comfort',   price: 3000, cap: 2, total: 20, avail: 12, amenities: ['AC', 'TV', 'WiFi'] },
      ],
    },

    // Jaipur
    {
      name: 'Rambagh Palace',
      description: 'Former royal residence of the Maharaja of Jaipur — the crown jewel of luxury hospitality.',
      city: 'Jaipur',
      address: 'Bhawani Singh Road, Jaipur, Rajasthan 302005',
      starRating: 5,
      amenities: ['WiFi', 'Pool', 'Spa', 'Gym', 'Polo Grounds', 'Heritage Restaurant', 'Bar', 'Gardens'],
      images: [],
      rooms: [
        { type: 'Luxury Room',       desc: 'Elegant room in the palace wing',    price: 25000, cap: 2, total: 35, avail: 14, amenities: ['AC', 'TV', 'WiFi', 'Minibar'] },
        { type: 'Garden Suite',      desc: 'Suite with private garden access',   price: 48000, cap: 3, total: 12, avail: 5,  amenities: ['AC', 'TV', 'WiFi', 'Butler', 'Minibar'] },
        { type: 'Grand Royal Suite', desc: 'Palatial suite with butler service', price: 95000, cap: 4, total: 4,  avail: 2,  amenities: ['AC', 'TV', 'WiFi', 'Private Pool', 'Butler', 'Private Dining'] },
      ],
    },
    {
      name: 'Courtyard by Marriott Jaipur',
      description: 'Modern upscale hotel near the Jaipur airport with excellent connectivity.',
      city: 'Jaipur',
      address: 'Goverdhan Vilas, Opposite Jawahar Circle, Jaipur 302018',
      starRating: 4,
      amenities: ['WiFi', 'Pool', 'Gym', 'Restaurant', 'Bar', 'Business Centre'],
      images: [],
      rooms: [
        { type: 'Standard Room', desc: 'Well-appointed room with city view',  price: 4500,  cap: 2, total: 50, avail: 24, amenities: ['AC', 'TV', 'WiFi'] },
        { type: 'Deluxe Room',   desc: 'Spacious room with garden view',      price: 6000,  cap: 2, total: 25, avail: 11, amenities: ['AC', 'TV', 'WiFi', 'Minibar'] },
        { type: 'Suite',         desc: 'Generous suite with separate lounge', price: 12000, cap: 3, total: 8,  avail: 4,  amenities: ['AC', 'TV', 'WiFi', 'Minibar'] },
      ],
    },
    {
      name: 'Pearl Palace Heritage',
      description: 'Charming heritage boutique hotel in the old city near Hawa Mahal — great value.',
      city: 'Jaipur',
      address: 'Hathroi Fort, Ajmer Road, Jaipur 302001',
      starRating: 3,
      amenities: ['WiFi', 'Rooftop Restaurant', 'Free Parking', '24hr Reception'],
      images: [],
      rooms: [
        { type: 'Heritage Room', desc: 'Artistically decorated heritage room',         price: 2500, cap: 2, total: 20, avail: 12, amenities: ['AC', 'TV', 'WiFi'] },
        { type: 'Deluxe Room',   desc: 'Larger room with intricate Rajasthani art',    price: 3500, cap: 3, total: 12, avail: 7,  amenities: ['AC', 'TV', 'WiFi'] },
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
      images: [],
      rooms: [
        { type: 'Luxury Room',  desc: 'Elegant room with pool or garden view',   price: 14000, cap: 2, total: 40, avail: 17, amenities: ['AC', 'TV', 'WiFi', 'Minibar'] },
        { type: 'Luxury Suite', desc: 'Suite with drawing room and dining area', price: 30000, cap: 3, total: 12, avail: 5,  amenities: ['AC', 'TV', 'WiFi', 'Minibar', 'Butler'] },
      ],
    },
    {
      name: 'Novotel Kolkata Hotel & Residences',
      description: 'Contemporary hotel near the new business district of Kolkata.',
      city: 'Kolkata',
      address: 'CB-218, New Town, Action Area I, Kolkata 700156',
      starRating: 4,
      amenities: ['WiFi', 'Pool', 'Gym', 'Restaurant', 'Bar', 'Business Centre'],
      images: [],
      rooms: [
        { type: 'Superior Room',  desc: 'Stylish room with city view',          price: 5500,  cap: 2, total: 55, avail: 26, amenities: ['AC', 'TV', 'WiFi'] },
        { type: 'Executive Room', desc: 'Premium room with lounge access',      price: 7500,  cap: 2, total: 25, avail: 12, amenities: ['AC', 'TV', 'WiFi', 'Lounge Access'] },
        { type: 'Suite',          desc: 'Spacious suite with separate lounge',  price: 14000, cap: 3, total: 8,  avail: 4,  amenities: ['AC', 'TV', 'WiFi', 'Minibar'] },
      ],
    },
    {
      name: 'Zostel Kolkata',
      description: 'Vibrant backpacker hostel in the cultural heart of Kolkata, close to Park Street.',
      city: 'Kolkata',
      address: '15 Mirza Ghalib Street, Park Street, Kolkata 700016',
      starRating: 2,
      amenities: ['WiFi', 'Common Lounge', 'Terrace', 'Travel Desk', 'Lockers'],
      images: [],
      rooms: [
        { type: 'Dormitory Bed', desc: '8-bed dorm with lockers',                price: 600,  cap: 1, total: 32, avail: 20, amenities: ['WiFi', 'Locker'] },
        { type: 'Private Room',  desc: 'Private double room with attached bath', price: 2000, cap: 2, total: 8,  avail: 5,  amenities: ['AC', 'WiFi'] },
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
// Each template runs every day May 19–30.

async function seedTrains() {
  const templates = [

    // ── NDLS ↔ BCT  (Delhi – Mumbai Central)  ── 5 each direction ──────────
    { num: '12951', name: 'Mumbai Rajdhani Express',          from: 'NDLS', to: 'BCT',  hour: 16,  dur: 935,  classes: { SL: { price: 655, seats: 500 }, '3A': { price: 1745, seats: 200 }, '2A': { price: 2510, seats: 100 }, '1A': { price: 4225, seats: 24  } }, total: 824 },
    { num: '12953', name: 'August Kranti Rajdhani Express',   from: 'NDLS', to: 'BCT',  hour: 17,  dur: 960,  classes: {                                  '3A': { price: 1800, seats: 200 }, '2A': { price: 2590, seats: 100 }, '1A': { price: 4360, seats: 24  } }, total: 324 },
    { num: '22210', name: 'Mumbai Central Duronto Express',   from: 'NDLS', to: 'BCT',  hour: 23,  dur: 975,  classes: {                                  '3A': { price: 1920, seats: 200 }, '2A': { price: 2760, seats: 100 }, '1A': { price: 4650, seats: 24  } }, total: 324 },
    { num: '12909', name: 'Avantika Express',                 from: 'NDLS', to: 'BCT',  hour: 4,   dur: 1140, classes: { SL: { price: 460, seats: 600 }, '3A': { price: 1220, seats: 200 }, '2A': { price: 1755, seats: 100 }                                       }, total: 900 },
    { num: '19037', name: 'Gujarat Queen Express',            from: 'NDLS', to: 'BCT',  hour: 9,   dur: 1080, classes: { SL: { price: 490, seats: 600 }, '3A': { price: 1305, seats: 200 }, '2A': { price: 1880, seats: 100 }                                       }, total: 900 },

    { num: '12952', name: 'New Delhi Rajdhani Express',       from: 'BCT',  to: 'NDLS', hour: 17,  dur: 930,  classes: { SL: { price: 655, seats: 500 }, '3A': { price: 1745, seats: 200 }, '2A': { price: 2510, seats: 100 }, '1A': { price: 4225, seats: 24  } }, total: 824 },
    { num: '12954', name: 'August Kranti Rajdhani (Return)',  from: 'BCT',  to: 'NDLS', hour: 23,  dur: 960,  classes: {                                  '3A': { price: 1800, seats: 200 }, '2A': { price: 2590, seats: 100 }, '1A': { price: 4360, seats: 24  } }, total: 324 },
    { num: '22209', name: 'New Delhi Duronto Express',        from: 'BCT',  to: 'NDLS', hour: 7,   dur: 975,  classes: {                                  '3A': { price: 1920, seats: 200 }, '2A': { price: 2760, seats: 100 }, '1A': { price: 4650, seats: 24  } }, total: 324 },
    { num: '12910', name: 'Avantika Express (Return)',        from: 'BCT',  to: 'NDLS', hour: 17,  dur: 1140, classes: { SL: { price: 460, seats: 600 }, '3A': { price: 1220, seats: 200 }, '2A': { price: 1755, seats: 100 }                                       }, total: 900 },
    { num: '19038', name: 'Gujarat Queen (Return)',           from: 'BCT',  to: 'NDLS', hour: 10,  dur: 1080, classes: { SL: { price: 490, seats: 600 }, '3A': { price: 1305, seats: 200 }, '2A': { price: 1880, seats: 100 }                                       }, total: 900 },

    // ── NDLS ↔ HWH  (Delhi – Kolkata/Howrah)  ── 5 each direction ──────────
    { num: '12301', name: 'Howrah Rajdhani Express',          from: 'NDLS', to: 'HWH',  hour: 17,  dur: 1020, classes: { SL: { price: 740, seats: 500 }, '3A': { price: 1955, seats: 200 }, '2A': { price: 2815, seats: 100 }, '1A': { price: 4730, seats: 24  } }, total: 824 },
    { num: '12313', name: 'Sealdah Rajdhani Express',         from: 'NDLS', to: 'HWH',  hour: 14,  dur: 1010, classes: {                                  '3A': { price: 1955, seats: 200 }, '2A': { price: 2815, seats: 100 }, '1A': { price: 4730, seats: 24  } }, total: 324 },
    { num: '12305', name: 'Howrah Rajdhani (via Patna)',      from: 'NDLS', to: 'HWH',  hour: 22,  dur: 1035, classes: {                                  '3A': { price: 2010, seats: 200 }, '2A': { price: 2890, seats: 100 }, '1A': { price: 4860, seats: 24  } }, total: 324 },
    { num: '12381', name: 'Poorva Express',                   from: 'NDLS', to: 'HWH',  hour: 6,   dur: 1440, classes: { SL: { price: 545, seats: 600 }, '3A': { price: 1450, seats: 200 }, '2A': { price: 2085, seats: 100 }, '1A': { price: 3505, seats: 24  } }, total: 924 },
    { num: '13005', name: 'Amritsar–Howrah Mail',             from: 'NDLS', to: 'HWH',  hour: 22,  dur: 1500, classes: { SL: { price: 500, seats: 600 }, '3A': { price: 1330, seats: 200 }, '2A': { price: 1915, seats: 100 }                                       }, total: 900 },

    { num: '12302', name: 'New Delhi Rajdhani (Howrah)',      from: 'HWH',  to: 'NDLS', hour: 14,  dur: 1020, classes: { SL: { price: 740, seats: 500 }, '3A': { price: 1955, seats: 200 }, '2A': { price: 2815, seats: 100 }, '1A': { price: 4730, seats: 24  } }, total: 824 },
    { num: '12314', name: 'Sealdah Rajdhani (Return)',        from: 'HWH',  to: 'NDLS', hour: 12,  dur: 1010, classes: {                                  '3A': { price: 1955, seats: 200 }, '2A': { price: 2815, seats: 100 }, '1A': { price: 4730, seats: 24  } }, total: 324 },
    { num: '12306', name: 'Howrah Rajdhani via Patna (Ret.)', from: 'HWH',  to: 'NDLS', hour: 13,  dur: 1035, classes: {                                  '3A': { price: 2010, seats: 200 }, '2A': { price: 2890, seats: 100 }, '1A': { price: 4860, seats: 24  } }, total: 324 },
    { num: '12382', name: 'Poorva Express (Return)',          from: 'HWH',  to: 'NDLS', hour: 23,  dur: 1440, classes: { SL: { price: 545, seats: 600 }, '3A': { price: 1450, seats: 200 }, '2A': { price: 2085, seats: 100 }, '1A': { price: 3505, seats: 24  } }, total: 924 },
    { num: '13006', name: 'Howrah–Amritsar Mail',             from: 'HWH',  to: 'NDLS', hour: 8,   dur: 1500, classes: { SL: { price: 500, seats: 600 }, '3A': { price: 1330, seats: 200 }, '2A': { price: 1915, seats: 100 }                                       }, total: 900 },

    // ── NDLS ↔ MAS  (Delhi – Chennai Central)  ── 5 each direction ─────────
    { num: '12621', name: 'Tamil Nadu Express',               from: 'NDLS', to: 'MAS',  hour: 22,  dur: 2040, classes: { SL: { price: 790, seats: 600 }, '3A': { price: 2090, seats: 200 }, '2A': { price: 3005, seats: 100 }, '1A': { price: 5055, seats: 24  } }, total: 924 },
    { num: '12433', name: 'Chennai Rajdhani Express',         from: 'NDLS', to: 'MAS',  hour: 15,  dur: 1980, classes: {                                  '3A': { price: 2395, seats: 200 }, '2A': { price: 3445, seats: 100 }, '1A': { price: 5800, seats: 24  } }, total: 324 },
    { num: '11027', name: 'Chennai Express',                  from: 'NDLS', to: 'MAS',  hour: 21,  dur: 2100, classes: { SL: { price: 740, seats: 600 }, '3A': { price: 1960, seats: 200 }, '2A': { price: 2820, seats: 100 }, '1A': { price: 4740, seats: 24  } }, total: 924 },
    { num: '12615', name: 'Grand Trunk Express',              from: 'NDLS', to: 'MAS',  hour: 7,   dur: 2160, classes: { SL: { price: 760, seats: 600 }, '3A': { price: 2015, seats: 200 }, '2A': { price: 2900, seats: 100 }, '1A': { price: 4875, seats: 24  } }, total: 924 },
    { num: '16031', name: 'Andaman Express',                  from: 'NDLS', to: 'MAS',  hour: 12,  dur: 2400, classes: { SL: { price: 720, seats: 600 }, '3A': { price: 1915, seats: 200 }, '2A': { price: 2755, seats: 100 }                                       }, total: 900 },

    { num: '12622', name: 'Tamil Nadu Express (Return)',      from: 'MAS',  to: 'NDLS', hour: 22,  dur: 2040, classes: { SL: { price: 790, seats: 600 }, '3A': { price: 2090, seats: 200 }, '2A': { price: 3005, seats: 100 }, '1A': { price: 5055, seats: 24  } }, total: 924 },
    { num: '12434', name: 'Chennai Rajdhani (Return)',        from: 'MAS',  to: 'NDLS', hour: 14,  dur: 1980, classes: {                                  '3A': { price: 2395, seats: 200 }, '2A': { price: 3445, seats: 100 }, '1A': { price: 5800, seats: 24  } }, total: 324 },
    { num: '11028', name: 'Chennai Express (Return)',         from: 'MAS',  to: 'NDLS', hour: 21,  dur: 2100, classes: { SL: { price: 740, seats: 600 }, '3A': { price: 1960, seats: 200 }, '2A': { price: 2820, seats: 100 }, '1A': { price: 4740, seats: 24  } }, total: 924 },
    { num: '12616', name: 'Grand Trunk Express (Return)',     from: 'MAS',  to: 'NDLS', hour: 9,   dur: 2160, classes: { SL: { price: 760, seats: 600 }, '3A': { price: 2015, seats: 200 }, '2A': { price: 2900, seats: 100 }, '1A': { price: 4875, seats: 24  } }, total: 924 },
    { num: '16032', name: 'Andaman Express (Return)',         from: 'MAS',  to: 'NDLS', hour: 15,  dur: 2400, classes: { SL: { price: 720, seats: 600 }, '3A': { price: 1915, seats: 200 }, '2A': { price: 2755, seats: 100 }                                       }, total: 900 },

    // ── BCT ↔ MAS  (Mumbai Central – Chennai Central)  ── 5 each direction ─
    { num: '12163', name: 'Mumbai–Chennai SF Express',        from: 'BCT',  to: 'MAS',  hour: 8,   dur: 1320, classes: { SL: { price: 520, seats: 600 }, '3A': { price: 1380, seats: 200 }, '2A': { price: 1985, seats: 100 }, '1A': { price: 3340, seats: 24  } }, total: 924 },
    { num: '11041', name: 'Mumbai–Chennai Express',           from: 'BCT',  to: 'MAS',  hour: 22,  dur: 1440, classes: { SL: { price: 480, seats: 600 }, '3A': { price: 1275, seats: 200 }, '2A': { price: 1835, seats: 100 }                                       }, total: 900 },
    { num: '22637', name: 'West Coast Express',               from: 'BCT',  to: 'MAS',  hour: 12,  dur: 1500, classes: { SL: { price: 465, seats: 600 }, '3A': { price: 1235, seats: 200 }, '2A': { price: 1775, seats: 100 }                                       }, total: 900 },
    { num: '16331', name: 'Mumbai–Kanniyakumari Express',     from: 'BCT',  to: 'MAS',  hour: 19,  dur: 1380, classes: { SL: { price: 450, seats: 600 }, '3A': { price: 1195, seats: 200 }, '2A': { price: 1720, seats: 100 }                                       }, total: 900 },
    { num: '12284', name: 'Chennai Duronto Express',          from: 'BCT',  to: 'MAS',  hour: 23,  dur: 1260, classes: {                                  '3A': { price: 1680, seats: 200 }, '2A': { price: 2415, seats: 100 }, '1A': { price: 4060, seats: 24  } }, total: 324 },

    { num: '12164', name: 'Chennai–Mumbai SF Express',        from: 'MAS',  to: 'BCT',  hour: 7,   dur: 1320, classes: { SL: { price: 520, seats: 600 }, '3A': { price: 1380, seats: 200 }, '2A': { price: 1985, seats: 100 }, '1A': { price: 3340, seats: 24  } }, total: 924 },
    { num: '11042', name: 'Chennai–Mumbai Express',           from: 'MAS',  to: 'BCT',  hour: 21,  dur: 1440, classes: { SL: { price: 480, seats: 600 }, '3A': { price: 1275, seats: 200 }, '2A': { price: 1835, seats: 100 }                                       }, total: 900 },
    { num: '22638', name: 'West Coast Express (Return)',      from: 'MAS',  to: 'BCT',  hour: 11,  dur: 1500, classes: { SL: { price: 465, seats: 600 }, '3A': { price: 1235, seats: 200 }, '2A': { price: 1775, seats: 100 }                                       }, total: 900 },
    { num: '16332', name: 'Kanniyakumari–Mumbai Express',     from: 'MAS',  to: 'BCT',  hour: 8,   dur: 1380, classes: { SL: { price: 450, seats: 600 }, '3A': { price: 1195, seats: 200 }, '2A': { price: 1720, seats: 100 }                                       }, total: 900 },
    { num: '12283', name: 'Mumbai Duronto Express',           from: 'MAS',  to: 'BCT',  hour: 7,   dur: 1260, classes: {                                  '3A': { price: 1680, seats: 200 }, '2A': { price: 2415, seats: 100 }, '1A': { price: 4060, seats: 24  } }, total: 324 },

    // ── SBC ↔ SC   (KSR Bangalore – Secunderabad/Hyderabad)  ── 5 each ──────
    { num: '12785', name: 'Mysore–KCG SF Express',            from: 'SBC',  to: 'SC',   hour: 6,   dur: 480,  classes: { SL: { price: 250, seats: 600 }, '3A': { price: 665, seats: 200  }, '2A': { price: 955, seats: 100  }                                       }, total: 900 },
    { num: '17604', name: 'Prashanti Nilayam Express',        from: 'SBC',  to: 'SC',   hour: 10,  dur: 450,  classes: { SL: { price: 235, seats: 600 }, '3A': { price: 625, seats: 200  }, '2A': { price: 900, seats: 100  }                                       }, total: 900 },
    { num: '12649', name: 'Yeshwanthpur–Navyug Express',      from: 'SBC',  to: 'SC',   hour: 14,  dur: 420,  classes: { SL: { price: 225, seats: 600 }, '3A': { price: 595, seats: 200  }, '2A': { price: 860, seats: 100  }, '1A': { price: 1445, seats: 24  } }, total: 924 },
    { num: '22683', name: 'Bangalore City–KCG Humsafar',      from: 'SBC',  to: 'SC',   hour: 20,  dur: 390,  classes: {                                  '3A': { price: 715, seats: 200  }, '2A': { price: 1030, seats: 100 }                                       }, total: 300 },
    { num: '17301', name: 'Mysore–Secunderabad Express',      from: 'SBC',  to: 'SC',   hour: 22,  dur: 510,  classes: { SL: { price: 215, seats: 600 }, '3A': { price: 570, seats: 200  }, '2A': { price: 820, seats: 100  }                                       }, total: 900 },

    { num: '12786', name: 'KCG–Mysore SF Express',            from: 'SC',   to: 'SBC',  hour: 15,  dur: 480,  classes: { SL: { price: 250, seats: 600 }, '3A': { price: 665, seats: 200  }, '2A': { price: 955, seats: 100  }                                       }, total: 900 },
    { num: '17603', name: 'Prashanti Nilayam (Return)',       from: 'SC',   to: 'SBC',  hour: 21,  dur: 450,  classes: { SL: { price: 235, seats: 600 }, '3A': { price: 625, seats: 200  }, '2A': { price: 900, seats: 100  }                                       }, total: 900 },
    { num: '12650', name: 'Navyug Express (Return)',          from: 'SC',   to: 'SBC',  hour: 8,   dur: 420,  classes: { SL: { price: 225, seats: 600 }, '3A': { price: 595, seats: 200  }, '2A': { price: 860, seats: 100  }, '1A': { price: 1445, seats: 24  } }, total: 924 },
    { num: '22684', name: 'KCG–Bangalore City Humsafar',      from: 'SC',   to: 'SBC',  hour: 11,  dur: 390,  classes: {                                  '3A': { price: 715, seats: 200  }, '2A': { price: 1030, seats: 100 }                                       }, total: 300 },
    { num: '17302', name: 'Secunderabad–Mysore Express',      from: 'SC',   to: 'SBC',  hour: 7,   dur: 510,  classes: { SL: { price: 215, seats: 600 }, '3A': { price: 570, seats: 200  }, '2A': { price: 820, seats: 100  }                                       }, total: 900 },

    // ── NDLS ↔ JP   (Delhi – Jaipur Junction)  ── 5 each direction ──────────
    { num: '12015', name: 'Ajmer Shatabdi Express',           from: 'NDLS', to: 'JP',   hour: 6,   dur: 270,  classes: { CC: { price: 485, seats: 400 }, EC: { price: 945, seats: 100  }                                                                           }, total: 500 },
    { num: '12059', name: 'Kota Janshatabdi Express',         from: 'NDLS', to: 'JP',   hour: 5,   dur: 255,  classes: { CC: { price: 455, seats: 400 }, EC: { price: 885, seats: 100  }                                                                           }, total: 500 },
    { num: '12985', name: 'Double Decker Express',            from: 'NDLS', to: 'JP',   hour: 6,   dur: 285,  classes: { CC: { price: 440, seats: 600 }                                                                                                             }, total: 600 },
    { num: '22987', name: 'Bikaner SF Express',               from: 'NDLS', to: 'JP',   hour: 15,  dur: 270,  classes: { SL: { price: 190, seats: 600 }, '3A': { price: 505, seats: 200  }, '2A': { price: 725, seats: 100 }                                       }, total: 900 },
    { num: '12413', name: 'Ala Hazrat Express',               from: 'NDLS', to: 'JP',   hour: 22,  dur: 285,  classes: { SL: { price: 175, seats: 600 }, '3A': { price: 465, seats: 200  }, '2A': { price: 670, seats: 100 }, '1A': { price: 1125, seats: 24  } }, total: 924 },

    { num: '12016', name: 'Ajmer Shatabdi (Return)',          from: 'JP',   to: 'NDLS', hour: 18,  dur: 270,  classes: { CC: { price: 485, seats: 400 }, EC: { price: 945, seats: 100  }                                                                           }, total: 500 },
    { num: '12060', name: 'Kota Janshatabdi (Return)',        from: 'JP',   to: 'NDLS', hour: 13,  dur: 255,  classes: { CC: { price: 455, seats: 400 }, EC: { price: 885, seats: 100  }                                                                           }, total: 500 },
    { num: '12986', name: 'Double Decker Express (Return)',   from: 'JP',   to: 'NDLS', hour: 20,  dur: 285,  classes: { CC: { price: 440, seats: 600 }                                                                                                             }, total: 600 },
    { num: '22988', name: 'Bikaner SF Express (Return)',      from: 'JP',   to: 'NDLS', hour: 7,   dur: 270,  classes: { SL: { price: 190, seats: 600 }, '3A': { price: 505, seats: 200  }, '2A': { price: 725, seats: 100 }                                       }, total: 900 },
    { num: '12414', name: 'Ala Hazrat Express (Return)',      from: 'JP',   to: 'NDLS', hour: 5,   dur: 285,  classes: { SL: { price: 175, seats: 600 }, '3A': { price: 465, seats: 200  }, '2A': { price: 670, seats: 100 }, '1A': { price: 1125, seats: 24  } }, total: 924 },

    // ── Other important routes ────────────────────────────────────────────────

    // NDLS ↔ SBC  (Delhi – Bangalore)
    { num: '22691', name: 'Rajdhani Express (KSR Bangalore)', from: 'NDLS', to: 'SBC',  hour: 20,  dur: 1680, classes: { '3A': { price: 2270, seats: 200 }, '2A': { price: 3260, seats: 100 }, '1A': { price: 5495, seats: 24  } },                               total: 324 },
    { num: '12627', name: 'Karnataka Express',                from: 'NDLS', to: 'SBC',  hour: 10,  dur: 1740, classes: { SL: { price: 870, seats: 600 }, '3A': { price: 2305, seats: 200 }, '2A': { price: 3315, seats: 100 }, '1A': { price: 5580, seats: 24  } }, total: 924 },
    { num: '22692', name: 'KSR Bangalore Rajdhani',           from: 'SBC',  to: 'NDLS', hour: 20,  dur: 1680, classes: { '3A': { price: 2270, seats: 200 }, '2A': { price: 3260, seats: 100 }, '1A': { price: 5495, seats: 24  } },                               total: 324 },
    { num: '12628', name: 'Karnataka Express (Return)',        from: 'SBC',  to: 'NDLS', hour: 10,  dur: 1740, classes: { SL: { price: 870, seats: 600 }, '3A': { price: 2305, seats: 200 }, '2A': { price: 3315, seats: 100 }, '1A': { price: 5580, seats: 24  } }, total: 924 },

    // NDLS ↔ SC   (Delhi – Hyderabad)
    { num: '12723', name: 'Telangana Express',                from: 'NDLS', to: 'SC',   hour: 6,   dur: 1455, classes: { SL: { price: 545, seats: 600 }, '3A': { price: 1455, seats: 200 }, '2A': { price: 2095, seats: 100 }, '1A': { price: 3520, seats: 24  } }, total: 924 },
    { num: '12724', name: 'Telangana Express (Return)',       from: 'SC',   to: 'NDLS', hour: 7,   dur: 1455, classes: { SL: { price: 545, seats: 600 }, '3A': { price: 1455, seats: 200 }, '2A': { price: 2095, seats: 100 }, '1A': { price: 3520, seats: 24  } }, total: 924 },

    // SBC ↔ MAS   (Bangalore – Chennai)
    { num: '12028', name: 'Chennai Shatabdi Express',         from: 'SBC',  to: 'MAS',  hour: 6,   dur: 295,  classes: { CC: { price: 800, seats: 400 }, EC: { price: 1560, seats: 100 }                                                                           }, total: 500 },
    { num: '12027', name: 'Shatabdi Express (Return)',        from: 'MAS',  to: 'SBC',  hour: 15,  dur: 295,  classes: { CC: { price: 800, seats: 400 }, EC: { price: 1560, seats: 100 }                                                                           }, total: 500 },
    { num: '12601', name: 'Chennai Mail (SBC-MAS)',           from: 'SBC',  to: 'MAS',  hour: 21,  dur: 390,  classes: { SL: { price: 220, seats: 600 }, '3A': { price: 585, seats: 200 }, '2A': { price: 840, seats: 100  }                                       }, total: 900 },
    { num: '12602', name: 'Chennai Mail (MAS-SBC)',           from: 'MAS',  to: 'SBC',  hour: 22,  dur: 390,  classes: { SL: { price: 220, seats: 600 }, '3A': { price: 585, seats: 200 }, '2A': { price: 840, seats: 100  }                                       }, total: 900 },

    // NDLS ↔ TVC  (Delhi – Thiruvananthapuram)
    { num: '12431', name: 'Thiruvananthapuram Rajdhani',      from: 'NDLS', to: 'TVC',  hour: 11,  dur: 2520, classes: { '3A': { price: 2760, seats: 200 }, '2A': { price: 3965, seats: 100 }, '1A': { price: 6700, seats: 24  } },                               total: 324 },
    { num: '12432', name: 'Rajdhani Express (Return TVC)',    from: 'TVC',  to: 'NDLS', hour: 20,  dur: 2520, classes: { '3A': { price: 2760, seats: 200 }, '2A': { price: 3965, seats: 100 }, '1A': { price: 6700, seats: 24  } },                               total: 324 },

    // MMCT ↔ PUNE (Mumbai – Pune)
    { num: '12009', name: 'Mumbai Shatabdi Express',          from: 'MMCT', to: 'PUNE', hour: 7,   dur: 205,  classes: { CC: { price: 510, seats: 400 }, EC: { price: 990, seats: 100  }                                                                           }, total: 500 },
    { num: '12010', name: 'Pune Shatabdi Express',            from: 'PUNE', to: 'MMCT', hour: 17,  dur: 205,  classes: { CC: { price: 510, seats: 400 }, EC: { price: 990, seats: 100  }                                                                           }, total: 500 },
    { num: '11013', name: 'Mumbai–Coimbatore Express',        from: 'MMCT', to: 'PUNE', hour: 23,  dur: 215,  classes: { SL: { price: 190, seats: 600 }, '3A': { price: 505, seats: 200  }                                                                         }, total: 800 },

    // SBC ↔ MMCT  (Bangalore – Mumbai)
    { num: '11301', name: 'Udyan Express',                    from: 'SBC',  to: 'MMCT', hour: 20,  dur: 1365, classes: { SL: { price: 540, seats: 600 }, '3A': { price: 1440, seats: 200 }, '2A': { price: 2075, seats: 100 }                                       }, total: 900 },
    { num: '11302', name: 'Udyan Express (Return)',           from: 'MMCT', to: 'SBC',  hour: 8,   dur: 1365, classes: { SL: { price: 540, seats: 600 }, '3A': { price: 1440, seats: 200 }, '2A': { price: 2075, seats: 100 }                                       }, total: 900 },

    // NDLS ↔ LKO  (Delhi – Lucknow)
    { num: '12003', name: 'Lucknow Shatabdi Express',         from: 'NDLS', to: 'LKO',  hour: 6,   dur: 330,  classes: { CC: { price: 660, seats: 400 }, EC: { price: 1285, seats: 100 }                                                                           }, total: 500 },
    { num: '12004', name: 'Lucknow Shatabdi (Return)',        from: 'LKO',  to: 'NDLS', hour: 17,  dur: 330,  classes: { CC: { price: 660, seats: 400 }, EC: { price: 1285, seats: 100 }                                                                           }, total: 500 },
    { num: '12229', name: 'Lucknow Mail',                     from: 'NDLS', to: 'LKO',  hour: 22,  dur: 360,  classes: { SL: { price: 240, seats: 600 }, '3A': { price: 635, seats: 200 }, '2A': { price: 915, seats: 100  }                                       }, total: 900 },

    // NDLS ↔ AGC  (Delhi – Agra)
    { num: '12279', name: 'Taj Express',                      from: 'NDLS', to: 'AGC',  hour: 7,   dur: 135,  classes: { SL: { price: 115, seats: 600 }, CC: { price: 285, seats: 200  }                                                                           }, total: 800 },
    { num: '12280', name: 'Taj Express (Return)',             from: 'AGC',  to: 'NDLS', hour: 19,  dur: 135,  classes: { SL: { price: 115, seats: 600 }, CC: { price: 285, seats: 200  }                                                                           }, total: 800 },
    { num: '12050', name: 'Gatimaan Express',                 from: 'NZM',  to: 'AGC',  hour: 8,   dur: 100,  classes: { CC: { price: 755, seats: 400 }, EC: { price: 1505, seats: 56   }                                                                           }, total: 456 },

    // SC ↔ MAS    (Hyderabad – Chennai)
    { num: '12603', name: 'Hyderabad Express',                from: 'SC',   to: 'MAS',  hour: 15,  dur: 720,  classes: { SL: { price: 310, seats: 600 }, '3A': { price: 820, seats: 200 }, '2A': { price: 1180, seats: 100 }                                       }, total: 900 },
    { num: '12604', name: 'Hyderabad Express (Return)',       from: 'MAS',  to: 'SC',   hour: 16,  dur: 720,  classes: { SL: { price: 310, seats: 600 }, '3A': { price: 820, seats: 200 }, '2A': { price: 1180, seats: 100 }                                       }, total: 900 },

    // NDLS ↔ ADI  (Delhi – Ahmedabad)
    { num: '12957', name: 'Rajdhani Express (Ahmedabad)',     from: 'NDLS', to: 'ADI',  hour: 19,  dur: 735,  classes: { '3A': { price: 1640, seats: 200 }, '2A': { price: 2360, seats: 100 }, '1A': { price: 3975, seats: 24  } },                               total: 324 },
    { num: '12958', name: 'Rajdhani Express (Delhi)',         from: 'ADI',  to: 'NDLS', hour: 20,  dur: 735,  classes: { '3A': { price: 1640, seats: 200 }, '2A': { price: 2360, seats: 100 }, '1A': { price: 3975, seats: 24  } },                               total: 324 },

    // PUNE ↔ NDLS
    { num: '12263', name: 'Pune Rajdhani Express',            from: 'PUNE', to: 'NDLS', hour: 17,  dur: 1050, classes: { '3A': { price: 1870, seats: 200 }, '2A': { price: 2690, seats: 100 }, '1A': { price: 4530, seats: 24  } },                               total: 324 },
    { num: '12264', name: 'Hazrat Nizamuddin Rajdhani',       from: 'NZM',  to: 'PUNE', hour: 16,  dur: 1050, classes: { '3A': { price: 1870, seats: 200 }, '2A': { price: 2690, seats: 100 }, '1A': { price: 4530, seats: 24  } },                               total: 324 },
  ]

  let count = 0
  for (const day of DAYS) {
    for (const t of templates) {
      const dep = d(day, t.hour)
      const arr = addMins(dep, t.dur)
      // Reduce seats on weekends to simulate demand
      const isWeekend = [0, 6].includes(new Date(2026, 4, day).getDay())
      const availFactor = isWeekend ? 0.3 : 0.55
      await prisma.train.create({
        data: {
          trainNumber:    t.num,
          trainName:      t.name,
          origin:         t.from,
          destination:    t.to,
          departureTime:  dep,
          arrivalTime:    arr,
          duration:       t.dur,
          classes:        t.classes,
          totalSeats:     t.total,
          availableSeats: Math.max(4, Math.floor(t.total * availFactor)),
        },
      })
      count++
    }
  }
  console.log(`  ✓ ${count} trains (${templates.length} services × ${DAYS.length} days)`)
}

// ─── Buses ────────────────────────────────────────────────────────────────────

async function seedBuses() {
  const templates = [
    // Mumbai – Pune  (5 each direction)
    { op: 'VRL Travels',          type: 'AC Sleeper',           from: 'Mumbai',    to: 'Pune',       hour: 22, dur: 210, price: 550,  seats: 40, amenities: ['AC', 'Charging Port', 'Blanket', 'Water Bottle'] },
    { op: 'Orange Travels',       type: 'Volvo AC Multi-Axle',  from: 'Mumbai',    to: 'Pune',       hour: 7,  dur: 195, price: 480,  seats: 45, amenities: ['AC', 'Charging Port', 'WiFi'] },
    { op: 'SRS Travels',          type: 'Non-AC Sleeper',       from: 'Mumbai',    to: 'Pune',       hour: 21, dur: 225, price: 280,  seats: 40, amenities: ['Charging Port'] },
    { op: 'Neeta Travels',        type: 'AC Sleeper',           from: 'Mumbai',    to: 'Pune',       hour: 15, dur: 210, price: 620,  seats: 36, amenities: ['AC', 'Blanket', 'Charging Port', 'Snacks'] },
    { op: 'MSRTC',                type: 'Volvo AC',             from: 'Mumbai',    to: 'Pune',       hour: 18, dur: 200, price: 380,  seats: 45, amenities: ['AC'] },
    { op: 'IntrCity SmartBus',    type: 'AC Sleeper',           from: 'Pune',      to: 'Mumbai',     hour: 22, dur: 210, price: 580,  seats: 30, amenities: ['AC', 'Charging Port', 'Blanket', 'Snacks', 'WiFi'] },
    { op: 'MSRTC',                type: 'Volvo AC',             from: 'Pune',      to: 'Mumbai',     hour: 8,  dur: 195, price: 400,  seats: 45, amenities: ['AC'] },
    { op: 'Orange Travels',       type: 'Volvo AC Multi-Axle',  from: 'Pune',      to: 'Mumbai',     hour: 7,  dur: 200, price: 460,  seats: 45, amenities: ['AC', 'Charging Port', 'WiFi'] },
    { op: 'SRS Travels',          type: 'Non-AC Sleeper',       from: 'Pune',      to: 'Mumbai',     hour: 21, dur: 225, price: 270,  seats: 40, amenities: ['Charging Port'] },
    { op: 'VRL Travels',          type: 'AC Sleeper',           from: 'Pune',      to: 'Mumbai',     hour: 16, dur: 210, price: 540,  seats: 40, amenities: ['AC', 'Charging Port', 'Blanket'] },

    // Delhi – Jaipur  (5 each direction)
    { op: 'RSRTC',                type: 'Volvo AC',             from: 'Delhi',     to: 'Jaipur',     hour: 6,  dur: 300, price: 650,  seats: 45, amenities: ['AC', 'WiFi'] },
    { op: 'IntrCity SmartBus',    type: 'AC Sleeper',           from: 'Delhi',     to: 'Jaipur',     hour: 22, dur: 315, price: 799,  seats: 30, amenities: ['AC', 'Charging Port', 'Blanket', 'Snacks', 'WiFi'] },
    { op: 'Raj Express',          type: 'Non-AC Seater',        from: 'Delhi',     to: 'Jaipur',     hour: 7,  dur: 330, price: 320,  seats: 50, amenities: [] },
    { op: 'Neeta Travels',        type: 'AC Sleeper',           from: 'Delhi',     to: 'Jaipur',     hour: 23, dur: 300, price: 750,  seats: 36, amenities: ['AC', 'Blanket', 'Charging Port', 'Water Bottle'] },
    { op: 'UPSRTC',               type: 'Volvo AC',             from: 'Delhi',     to: 'Jaipur',     hour: 9,  dur: 315, price: 580,  seats: 45, amenities: ['AC', 'WiFi'] },
    { op: 'RSRTC',                type: 'Volvo AC',             from: 'Jaipur',    to: 'Delhi',      hour: 7,  dur: 300, price: 620,  seats: 45, amenities: ['AC', 'WiFi'] },
    { op: 'IntrCity SmartBus',    type: 'AC Sleeper',           from: 'Jaipur',    to: 'Delhi',      hour: 23, dur: 315, price: 799,  seats: 30, amenities: ['AC', 'Charging Port', 'Blanket', 'Snacks', 'WiFi'] },
    { op: 'Raj Express',          type: 'Non-AC Seater',        from: 'Jaipur',    to: 'Delhi',      hour: 6,  dur: 330, price: 300,  seats: 50, amenities: [] },
    { op: 'Neeta Travels',        type: 'AC Sleeper',           from: 'Jaipur',    to: 'Delhi',      hour: 22, dur: 300, price: 720,  seats: 36, amenities: ['AC', 'Blanket', 'Charging Port'] },
    { op: 'Orange Travels',       type: 'Volvo AC Multi-Axle',  from: 'Jaipur',    to: 'Delhi',      hour: 8,  dur: 310, price: 680,  seats: 45, amenities: ['AC', 'Charging Port', 'WiFi'] },

    // Bangalore – Chennai  (5 each direction)
    { op: 'Orange Travels',       type: 'Volvo AC Multi-Axle',  from: 'Bangalore', to: 'Chennai',    hour: 22, dur: 375, price: 750,  seats: 45, amenities: ['AC', 'Charging Port', 'WiFi'] },
    { op: 'TNSTC',                type: 'AC Seater',            from: 'Bangalore', to: 'Chennai',    hour: 7,  dur: 360, price: 580,  seats: 50, amenities: ['AC'] },
    { op: 'SRS Travels',          type: 'AC Sleeper',           from: 'Bangalore', to: 'Chennai',    hour: 21, dur: 390, price: 850,  seats: 36, amenities: ['AC', 'Blanket', 'Charging Port'] },
    { op: 'VRL Travels',          type: 'AC Sleeper',           from: 'Bangalore', to: 'Chennai',    hour: 23, dur: 375, price: 900,  seats: 40, amenities: ['AC', 'Blanket', 'Charging Port', 'Water Bottle'] },
    { op: 'KSRTC',                type: 'Volvo AC',             from: 'Bangalore', to: 'Chennai',    hour: 8,  dur: 360, price: 620,  seats: 45, amenities: ['AC', 'WiFi'] },
    { op: 'TNSTC',                type: 'AC Seater',            from: 'Chennai',   to: 'Bangalore',  hour: 6,  dur: 360, price: 520,  seats: 50, amenities: ['AC'] },
    { op: 'Orange Travels',       type: 'Volvo AC Multi-Axle',  from: 'Chennai',   to: 'Bangalore',  hour: 22, dur: 375, price: 700,  seats: 45, amenities: ['AC', 'Charging Port', 'WiFi'] },
    { op: 'SRS Travels',          type: 'AC Sleeper',           from: 'Chennai',   to: 'Bangalore',  hour: 21, dur: 390, price: 820,  seats: 36, amenities: ['AC', 'Blanket', 'Charging Port'] },
    { op: 'VRL Travels',          type: 'AC Sleeper',           from: 'Chennai',   to: 'Bangalore',  hour: 23, dur: 375, price: 870,  seats: 40, amenities: ['AC', 'Blanket', 'Charging Port', 'Water Bottle'] },
    { op: 'KSRTC',                type: 'Volvo AC',             from: 'Chennai',   to: 'Bangalore',  hour: 8,  dur: 360, price: 600,  seats: 45, amenities: ['AC', 'WiFi'] },

    // Mumbai – Goa  (5 each direction)
    { op: 'VRL Travels',          type: 'AC Sleeper',           from: 'Mumbai',    to: 'Goa',        hour: 20, dur: 720, price: 1200, seats: 40, amenities: ['AC', 'Blanket', 'Charging Port', 'Water Bottle'] },
    { op: 'Kadamba Transport',    type: 'Volvo AC',             from: 'Mumbai',    to: 'Goa',        hour: 21, dur: 690, price: 1050, seats: 45, amenities: ['AC', 'Charging Port'] },
    { op: 'Neeta Travels',        type: 'AC Semi-Sleeper',      from: 'Mumbai',    to: 'Goa',        hour: 22, dur: 700, price: 900,  seats: 40, amenities: ['AC', 'Charging Port'] },
    { op: 'Paulo Travels',        type: 'Volvo AC Multi-Axle',  from: 'Mumbai',    to: 'Goa',        hour: 19, dur: 710, price: 1100, seats: 36, amenities: ['AC', 'Charging Port', 'WiFi', 'Blanket'] },
    { op: 'MSRTC',                type: 'Non-AC Sleeper',       from: 'Mumbai',    to: 'Goa',        hour: 18, dur: 740, price: 650,  seats: 45, amenities: ['Charging Port'] },
    { op: 'VRL Travels',          type: 'AC Sleeper',           from: 'Goa',       to: 'Mumbai',     hour: 19, dur: 720, price: 1150, seats: 40, amenities: ['AC', 'Blanket', 'Charging Port', 'Water Bottle'] },
    { op: 'Kadamba Transport',    type: 'Volvo AC',             from: 'Goa',       to: 'Mumbai',     hour: 21, dur: 690, price: 1000, seats: 45, amenities: ['AC', 'Charging Port'] },
    { op: 'Neeta Travels',        type: 'AC Semi-Sleeper',      from: 'Goa',       to: 'Mumbai',     hour: 22, dur: 700, price: 880,  seats: 40, amenities: ['AC', 'Charging Port'] },
    { op: 'Paulo Travels',        type: 'Volvo AC Multi-Axle',  from: 'Goa',       to: 'Mumbai',     hour: 20, dur: 710, price: 1050, seats: 36, amenities: ['AC', 'Charging Port', 'WiFi', 'Blanket'] },
    { op: 'MSRTC',                type: 'Non-AC Sleeper',       from: 'Goa',       to: 'Mumbai',     hour: 17, dur: 740, price: 600,  seats: 45, amenities: ['Charging Port'] },

    // Delhi – Manali
    { op: 'HRTC',                 type: 'Volvo AC',             from: 'Delhi',     to: 'Manali',     hour: 17, dur: 840, price: 900,  seats: 45, amenities: ['AC', 'Charging Port'] },
    { op: 'Kullu Manali Tours',   type: 'AC Sleeper',           from: 'Delhi',     to: 'Manali',     hour: 16, dur: 810, price: 1100, seats: 36, amenities: ['AC', 'Blanket', 'Charging Port'] },

    // Hyderabad – Bangalore  (5 each direction)
    { op: 'SRS Travels',          type: 'AC Sleeper',           from: 'Hyderabad', to: 'Bangalore',  hour: 21, dur: 540, price: 700,  seats: 40, amenities: ['AC', 'Charging Port', 'Blanket'] },
    { op: 'Orange Travels',       type: 'Volvo AC Multi-Axle',  from: 'Hyderabad', to: 'Bangalore',  hour: 22, dur: 510, price: 850,  seats: 45, amenities: ['AC', 'Charging Port', 'WiFi'] },
    { op: 'KSRTC',                type: 'AC Seater',            from: 'Hyderabad', to: 'Bangalore',  hour: 6,  dur: 570, price: 550,  seats: 50, amenities: ['AC'] },
    { op: 'VRL Travels',          type: 'AC Sleeper',           from: 'Hyderabad', to: 'Bangalore',  hour: 20, dur: 540, price: 780,  seats: 40, amenities: ['AC', 'Blanket', 'Charging Port', 'Water Bottle'] },
    { op: 'TSRTC',                type: 'Volvo AC',             from: 'Hyderabad', to: 'Bangalore',  hour: 8,  dur: 555, price: 620,  seats: 45, amenities: ['AC', 'WiFi'] },
    { op: 'KSRTC',                type: 'AC Seater',            from: 'Bangalore', to: 'Hyderabad',  hour: 7,  dur: 570, price: 530,  seats: 50, amenities: ['AC'] },
    { op: 'SRS Travels',          type: 'AC Sleeper',           from: 'Bangalore', to: 'Hyderabad',  hour: 21, dur: 540, price: 680,  seats: 40, amenities: ['AC', 'Charging Port', 'Blanket'] },
    { op: 'Orange Travels',       type: 'Volvo AC Multi-Axle',  from: 'Bangalore', to: 'Hyderabad',  hour: 22, dur: 510, price: 820,  seats: 45, amenities: ['AC', 'Charging Port', 'WiFi'] },
    { op: 'VRL Travels',          type: 'AC Sleeper',           from: 'Bangalore', to: 'Hyderabad',  hour: 20, dur: 540, price: 760,  seats: 40, amenities: ['AC', 'Blanket', 'Charging Port'] },
    { op: 'TSRTC',                type: 'Volvo AC',             from: 'Bangalore', to: 'Hyderabad',  hour: 9,  dur: 555, price: 600,  seats: 45, amenities: ['AC', 'WiFi'] },

    // Hyderabad – Chennai
    { op: 'TSRTC',                type: 'Volvo AC',             from: 'Hyderabad', to: 'Chennai',    hour: 20, dur: 480, price: 680,  seats: 45, amenities: ['AC', 'WiFi'] },
    { op: 'SRS Travels',          type: 'AC Sleeper',           from: 'Hyderabad', to: 'Chennai',    hour: 21, dur: 480, price: 750,  seats: 40, amenities: ['AC', 'Charging Port', 'Blanket'] },

    // Mumbai – Ahmedabad
    { op: 'Gujarat Travels',      type: 'Volvo AC',             from: 'Mumbai',    to: 'Ahmedabad',  hour: 7,  dur: 420, price: 600,  seats: 45, amenities: ['AC', 'WiFi'] },
    { op: 'Patel Travels',        type: 'AC Sleeper',           from: 'Mumbai',    to: 'Ahmedabad',  hour: 22, dur: 450, price: 750,  seats: 36, amenities: ['AC', 'Charging Port', 'Blanket', 'Snacks'] },
    { op: 'GSRTC',                type: 'Volvo AC',             from: 'Ahmedabad', to: 'Mumbai',     hour: 8,  dur: 420, price: 580,  seats: 45, amenities: ['AC'] },
    { op: 'Patel Travels',        type: 'AC Sleeper',           from: 'Ahmedabad', to: 'Mumbai',     hour: 21, dur: 450, price: 720,  seats: 36, amenities: ['AC', 'Charging Port', 'Blanket'] },

    // Delhi – Agra  (5 each direction)
    { op: 'Raj National Express', type: 'AC Seater',            from: 'Delhi',     to: 'Agra',       hour: 6,  dur: 195, price: 350,  seats: 45, amenities: ['AC', 'WiFi'] },
    { op: 'IntrCity SmartBus',    type: 'Volvo AC',             from: 'Delhi',     to: 'Agra',       hour: 9,  dur: 210, price: 499,  seats: 30, amenities: ['AC', 'Charging Port', 'Snacks', 'WiFi'] },
    { op: 'UPSRTC',               type: 'Non-AC Seater',        from: 'Delhi',     to: 'Agra',       hour: 7,  dur: 240, price: 180,  seats: 55, amenities: [] },
    { op: 'Orange Travels',       type: 'Volvo AC Multi-Axle',  from: 'Delhi',     to: 'Agra',       hour: 12, dur: 200, price: 550,  seats: 45, amenities: ['AC', 'Charging Port', 'WiFi'] },
    { op: 'RSRTC',                type: 'AC Seater',            from: 'Delhi',     to: 'Agra',       hour: 15, dur: 210, price: 420,  seats: 50, amenities: ['AC'] },
    { op: 'Raj National Express', type: 'AC Seater',            from: 'Agra',      to: 'Delhi',      hour: 8,  dur: 195, price: 340,  seats: 45, amenities: ['AC', 'WiFi'] },
    { op: 'IntrCity SmartBus',    type: 'Volvo AC',             from: 'Agra',      to: 'Delhi',      hour: 10, dur: 210, price: 480,  seats: 30, amenities: ['AC', 'Charging Port', 'Snacks', 'WiFi'] },
    { op: 'UPSRTC',               type: 'Non-AC Seater',        from: 'Agra',      to: 'Delhi',      hour: 7,  dur: 240, price: 170,  seats: 55, amenities: [] },
    { op: 'Orange Travels',       type: 'Volvo AC Multi-Axle',  from: 'Agra',      to: 'Delhi',      hour: 13, dur: 200, price: 530,  seats: 45, amenities: ['AC', 'Charging Port', 'WiFi'] },
    { op: 'RSRTC',                type: 'AC Seater',            from: 'Agra',      to: 'Delhi',      hour: 16, dur: 210, price: 400,  seats: 50, amenities: ['AC'] },

    // Bangalore – Goa
    { op: 'VRL Travels',          type: 'AC Sleeper',           from: 'Bangalore', to: 'Goa',        hour: 20, dur: 600, price: 950,  seats: 40, amenities: ['AC', 'Blanket', 'Charging Port', 'Water Bottle'] },
    { op: 'Kadamba Transport',    type: 'Volvo AC',             from: 'Bangalore', to: 'Goa',        hour: 21, dur: 570, price: 850,  seats: 45, amenities: ['AC', 'Charging Port'] },

    // Pune – Goa
    { op: 'Neeta Travels',        type: 'AC Sleeper',           from: 'Pune',      to: 'Goa',        hour: 21, dur: 480, price: 800,  seats: 40, amenities: ['AC', 'Blanket', 'Charging Port'] },
    { op: 'Paulo Travels',        type: 'Volvo AC Multi-Axle',  from: 'Pune',      to: 'Goa',        hour: 22, dur: 450, price: 950,  seats: 36, amenities: ['AC', 'Charging Port', 'WiFi', 'Blanket'] },

    // Delhi – Chandigarh
    { op: 'HRTC',                 type: 'Volvo AC',             from: 'Delhi',     to: 'Chandigarh', hour: 7,  dur: 240, price: 450,  seats: 45, amenities: ['AC', 'WiFi'] },
    { op: 'IntrCity SmartBus',    type: 'Volvo AC',             from: 'Delhi',     to: 'Chandigarh', hour: 10, dur: 255, price: 599,  seats: 30, amenities: ['AC', 'Charging Port', 'Snacks', 'WiFi'] },
    { op: 'HRTC',                 type: 'Volvo AC',             from: 'Chandigarh',to: 'Delhi',      hour: 8,  dur: 240, price: 430,  seats: 45, amenities: ['AC', 'WiFi'] },
  ]

  let count = 0
  for (const day of DAYS) {
    for (const t of templates) {
      const dep = d(day, t.hour)
      const arr = addMins(dep, t.dur)
      const isWeekend = [0, 6].includes(new Date(2026, 4, day).getDay())
      const avail = Math.max(3, Math.floor(t.seats * (isWeekend ? 0.35 : 0.6)))
      await prisma.bus.create({
        data: {
          operator:       t.op,
          busType:        t.type,
          origin:         t.from,
          destination:    t.to,
          departureTime:  dep,
          arrivalTime:    arr,
          duration:       t.dur,
          price:          t.price,
          totalSeats:     t.seats,
          availableSeats: avail,
          amenities:      t.amenities,
        },
      })
      count++
    }
  }
  console.log(`  ✓ ${count} buses (${templates.length} routes × ${DAYS.length} days)`)
}

// ─── Cabs ─────────────────────────────────────────────────────────────────────

async function seedCabs() {
  const cabs = [
    { type: 'Mini',      model: 'Maruti Swift / Wagon R',           capacity: 4, pricePerKm: 11, basePrice: 50  },
    { type: 'Sedan',     model: 'Honda City / Hyundai Verna',       capacity: 4, pricePerKm: 14, basePrice: 75  },
    { type: 'SUV',       model: 'Toyota Innova / Mahindra XUV500',  capacity: 6, pricePerKm: 19, basePrice: 100 },
    { type: 'Prime SUV', model: 'Toyota Fortuner / Tata Safari',    capacity: 6, pricePerKm: 24, basePrice: 150 },
    { type: 'Auto',      model: 'Bajaj RE Compact',                 capacity: 3, pricePerKm: 8,  basePrice: 30  },
    { type: 'Bike',      model: 'Honda Activa / Royal Enfield',     capacity: 1, pricePerKm: 5,  basePrice: 20  },
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
    { userIdx: 1, hotelIdx: 0,  rating: 5, comment: 'Absolutely magnificent! The heritage and grandeur of Taj is unmatched. Service is impeccable.' },
    { userIdx: 2, hotelIdx: 0,  rating: 4, comment: 'Wonderful stay. Food was excellent and staff very courteous. Slightly overpriced but worth it.' },
    { userIdx: 1, hotelIdx: 3,  rating: 5, comment: 'Best hotel in Delhi. Rooms are luxurious and the spa is world class.' },
    { userIdx: 3, hotelIdx: 6,  rating: 4, comment: 'Great business hotel. Very convenient for meetings. Gym and pool are top notch.' },
    { userIdx: 2, hotelIdx: 8,  rating: 5, comment: 'Dream resort! Woke up to the sound of waves every morning. Staff treated us like royalty.' },
    { userIdx: 1, hotelIdx: 9,  rating: 4, comment: 'Lovely resort with great ambience. The golf course is amazing. Food could be better.' },
    { userIdx: 3, hotelIdx: 2,  rating: 3, comment: 'Decent budget option in a great location. Room was clean and staff helpful.' },
    { userIdx: 2, hotelIdx: 5,  rating: 2, comment: 'Very basic. AC was noisy and bathroom needed cleaning. Location is good though.' },
    { userIdx: 1, hotelIdx: 11, rating: 5, comment: 'ITC Grand Chola is stunning. The architecture is breathtaking and the food is exceptional.' },
    { userIdx: 3, hotelIdx: 14, rating: 5, comment: 'Staying at Falaknuma Palace is like going back in time. Absolutely royal experience.' },
    { userIdx: 2, hotelIdx: 17, rating: 4, comment: 'Rambagh Palace did not disappoint. Felt like royalty throughout our stay.' },
    { userIdx: 1, hotelIdx: 20, rating: 5, comment: 'The Oberoi Grand is simply perfect. Colonial charm with modern luxury.' },
  ]

  const created = []
  for (const r of reviews) {
    const review = await prisma.review.create({
      data: { userId: users[r.userIdx].id, hotelId: hotels[r.hotelIdx].id, rating: r.rating, comment: r.comment },
    })
    created.push(review)
  }
  console.log(`  ✓ ${created.length} reviews`)
  return created
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Seeding database (May 19 – May 30, 2026)...\n')

  const users = await seedUsers()

  // Clear travel data (preserve users so tokens remain valid)
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

  await seedFlights()
  const hotels = await seedHotels()
  await seedTrains()
  await seedBuses()
  await seedCabs()
  await seedReviews(users, hotels)

  console.log(`
Done! Coverage: May 19 – May 30, 2026

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
