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
    { name: 'Admin',           email: 'admin@goibibo.com',           password: hash('Admin@1234'),   role: 'ADMIN',   phone: '9000000000' },
    { name: 'Manager',         email: 'manager@goibibo.com',         password: hash('Manager@1234'), role: 'MANAGER', phone: '9000000001' },
    // Module-specific managers (one per booking module)
    { name: 'Flight Manager',  email: 'flight_manager@goibibo.com',  password: hash('Manager@1234'), role: 'MANAGER', managerModule: 'FLIGHTS',  phone: '9000000010' },
    { name: 'Hotel Manager',   email: 'hotel_manager@goibibo.com',   password: hash('Manager@1234'), role: 'MANAGER', managerModule: 'HOTELS',   phone: '9000000011' },
    { name: 'Train Manager',   email: 'train_manager@goibibo.com',   password: hash('Manager@1234'), role: 'MANAGER', managerModule: 'TRAINS',   phone: '9000000012' },
    { name: 'Bus Manager',     email: 'bus_manager@goibibo.com',     password: hash('Manager@1234'), role: 'MANAGER', managerModule: 'BUSES',    phone: '9000000013' },
    { name: 'Holiday Manager', email: 'holiday_manager@goibibo.com', password: hash('Manager@1234'), role: 'MANAGER', managerModule: 'HOLIDAYS', phone: '9000000014' },
    { name: 'Car Manager',     email: 'car_manager@goibibo.com',     password: hash('Manager@1234'), role: 'MANAGER', managerModule: 'CARS',     phone: '9000000015' },
    // Regular users
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

    // ── Extra flights to guarantee 7+ results per route ───────────────────────

    // DEL ↔ BOM  (top up to 7)
    { fn: 'QP-101',  airline: 'Akasa Air',      from: 'DEL', to: 'BOM', hour: 5,  dur: 135, price: 3599, seats: 180, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'I5-101',  airline: 'Air Asia India', from: 'DEL', to: 'BOM', hour: 21, dur: 140, price: 3299, seats: 180, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'QP-102',  airline: 'Akasa Air',      from: 'BOM', to: 'DEL', hour: 6,  dur: 135, price: 3499, seats: 180, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'I5-102',  airline: 'Air Asia India', from: 'BOM', to: 'DEL', hour: 16, dur: 140, price: 3399, seats: 180, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'SG-302',  airline: 'SpiceJet',       from: 'BOM', to: 'DEL', hour: 9,  dur: 150, price: 4099, seats: 174, cabin: 'ECONOMY',  stops: 1 },

    // DEL ↔ BLR  (top up to 7)
    { fn: 'QP-201',  airline: 'Akasa Air',      from: 'DEL', to: 'BLR', hour: 5,  dur: 170, price: 3899, seats: 180, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'I5-201',  airline: 'Air Asia India', from: 'DEL', to: 'BLR', hour: 16, dur: 175, price: 3699, seats: 180, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'G8-401',  airline: 'GoAir',          from: 'DEL', to: 'BLR', hour: 22, dur: 180, price: 4299, seats: 180, cabin: 'ECONOMY',  stops: 1 },
    { fn: 'QP-202',  airline: 'Akasa Air',      from: 'BLR', to: 'DEL', hour: 6,  dur: 170, price: 3999, seats: 180, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'I5-202',  airline: 'Air Asia India', from: 'BLR', to: 'DEL', hour: 15, dur: 175, price: 3799, seats: 180, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'G8-402',  airline: 'GoAir',          from: 'BLR', to: 'DEL', hour: 19, dur: 180, price: 4499, seats: 180, cabin: 'ECONOMY',  stops: 1 },
    { fn: 'UK-403',  airline: 'Vistara',        from: 'BLR', to: 'DEL', hour: 11, dur: 165, price: 8200, seats: 160, cabin: 'BUSINESS', stops: 0 },

    // DEL ↔ CCU  (top up to 7)
    { fn: 'QP-301',  airline: 'Akasa Air',      from: 'DEL', to: 'CCU', hour: 6,  dur: 150, price: 3899, seats: 180, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'I5-301',  airline: 'Air Asia India', from: 'DEL', to: 'CCU', hour: 11, dur: 155, price: 3699, seats: 180, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'UK-501',  airline: 'Vistara',        from: 'DEL', to: 'CCU', hour: 15, dur: 150, price: 7500, seats: 160, cabin: 'BUSINESS', stops: 0 },
    { fn: 'G8-501',  airline: 'GoAir',          from: 'DEL', to: 'CCU', hour: 20, dur: 160, price: 4399, seats: 180, cabin: 'ECONOMY',  stops: 1 },
    { fn: 'QP-302',  airline: 'Akasa Air',      from: 'CCU', to: 'DEL', hour: 6,  dur: 150, price: 3799, seats: 180, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'I5-302',  airline: 'Air Asia India', from: 'CCU', to: 'DEL', hour: 10, dur: 155, price: 3499, seats: 180, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'UK-502',  airline: 'Vistara',        from: 'CCU', to: 'DEL', hour: 12, dur: 150, price: 7300, seats: 160, cabin: 'BUSINESS', stops: 0 },
    { fn: 'SG-502',  airline: 'SpiceJet',       from: 'CCU', to: 'DEL', hour: 17, dur: 160, price: 4299, seats: 174, cabin: 'ECONOMY',  stops: 1 },
    { fn: 'G8-502',  airline: 'GoAir',          from: 'CCU', to: 'DEL', hour: 20, dur: 155, price: 3999, seats: 180, cabin: 'ECONOMY',  stops: 0 },

    // BOM ↔ GOI  (top up to 7)
    { fn: 'QP-401',  airline: 'Akasa Air',      from: 'BOM', to: 'GOI', hour: 6,  dur: 65,  price: 2699, seats: 180, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'I5-401',  airline: 'Air Asia India', from: 'BOM', to: 'GOI', hour: 9,  dur: 70,  price: 2499, seats: 180, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'AI-603',  airline: 'Air India',      from: 'BOM', to: 'GOI', hour: 13, dur: 65,  price: 3899, seats: 200, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'UK-603',  airline: 'Vistara',        from: 'BOM', to: 'GOI', hour: 18, dur: 70,  price: 6500, seats: 160, cabin: 'BUSINESS', stops: 0 },
    { fn: 'QP-402',  airline: 'Akasa Air',      from: 'GOI', to: 'BOM', hour: 7,  dur: 65,  price: 2599, seats: 180, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'I5-402',  airline: 'Air Asia India', from: 'GOI', to: 'BOM', hour: 11, dur: 70,  price: 2399, seats: 180, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'AI-604',  airline: 'Air India',      from: 'GOI', to: 'BOM', hour: 16, dur: 65,  price: 4099, seats: 200, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'UK-604',  airline: 'Vistara',        from: 'GOI', to: 'BOM', hour: 19, dur: 70,  price: 6700, seats: 160, cabin: 'BUSINESS', stops: 0 },
    { fn: 'SG-604',  airline: 'SpiceJet',       from: 'GOI', to: 'BOM', hour: 8,  dur: 70,  price: 3099, seats: 174, cabin: 'ECONOMY',  stops: 0 },

    // DEL ↔ GOI  (top up to 7)
    { fn: 'QP-501',  airline: 'Akasa Air',      from: 'DEL', to: 'GOI', hour: 6,  dur: 120, price: 4699, seats: 180, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'I5-501',  airline: 'Air Asia India', from: 'DEL', to: 'GOI', hour: 11, dur: 125, price: 4399, seats: 180, cabin: 'ECONOMY',  stops: 0 },
    { fn: '6E-603',  airline: 'IndiGo',         from: 'DEL', to: 'GOI', hour: 15, dur: 120, price: 4199, seats: 186, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'SG-605',  airline: 'SpiceJet',       from: 'DEL', to: 'GOI', hour: 18, dur: 130, price: 3899, seats: 174, cabin: 'ECONOMY',  stops: 1 },
    { fn: 'G8-605',  airline: 'GoAir',          from: 'DEL', to: 'GOI', hour: 20, dur: 125, price: 4799, seats: 180, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'QP-502',  airline: 'Akasa Air',      from: 'GOI', to: 'DEL', hour: 6,  dur: 120, price: 4599, seats: 180, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'I5-502',  airline: 'Air Asia India', from: 'GOI', to: 'DEL', hour: 10, dur: 125, price: 4299, seats: 180, cabin: 'ECONOMY',  stops: 0 },
    { fn: '6E-604',  airline: 'IndiGo',         from: 'GOI', to: 'DEL', hour: 14, dur: 120, price: 4399, seats: 186, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'SG-606',  airline: 'SpiceJet',       from: 'GOI', to: 'DEL', hour: 17, dur: 130, price: 4099, seats: 174, cabin: 'ECONOMY',  stops: 1 },
    { fn: 'G8-606',  airline: 'GoAir',          from: 'GOI', to: 'DEL', hour: 20, dur: 125, price: 4899, seats: 180, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'UK-605',  airline: 'Vistara',        from: 'GOI', to: 'DEL', hour: 12, dur: 120, price: 9500, seats: 160, cabin: 'FIRST',    stops: 0 },

    // BOM ↔ BLR  (top up to 7)
    { fn: 'QP-601',  airline: 'Akasa Air',      from: 'BOM', to: 'BLR', hour: 7,  dur: 100, price: 3299, seats: 180, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'I5-601',  airline: 'Air Asia India', from: 'BOM', to: 'BLR', hour: 13, dur: 105, price: 2999, seats: 180, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'UK-701',  airline: 'Vistara',        from: 'BOM', to: 'BLR', hour: 18, dur: 100, price: 7800, seats: 160, cabin: 'BUSINESS', stops: 0 },
    { fn: 'G8-701',  airline: 'GoAir',          from: 'BOM', to: 'BLR', hour: 21, dur: 110, price: 3599, seats: 180, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'QP-602',  airline: 'Akasa Air',      from: 'BLR', to: 'BOM', hour: 6,  dur: 100, price: 3199, seats: 180, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'I5-602',  airline: 'Air Asia India', from: 'BLR', to: 'BOM', hour: 15, dur: 105, price: 3099, seats: 180, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'G8-702',  airline: 'GoAir',          from: 'BLR', to: 'BOM', hour: 20, dur: 110, price: 3499, seats: 180, cabin: 'ECONOMY',  stops: 0 },

    // DEL ↔ HYD  (top up to 7)
    { fn: 'QP-701',  airline: 'Akasa Air',      from: 'DEL', to: 'HYD', hour: 5,  dur: 150, price: 4099, seats: 180, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'I5-701',  airline: 'Air Asia India', from: 'DEL', to: 'HYD', hour: 13, dur: 155, price: 3799, seats: 180, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'G8-801',  airline: 'GoAir',          from: 'DEL', to: 'HYD', hour: 18, dur: 160, price: 4499, seats: 180, cabin: 'ECONOMY',  stops: 1 },
    { fn: 'UK-801',  airline: 'Vistara',        from: 'DEL', to: 'HYD', hour: 21, dur: 150, price: 8000, seats: 160, cabin: 'BUSINESS', stops: 0 },
    { fn: 'QP-702',  airline: 'Akasa Air',      from: 'HYD', to: 'DEL', hour: 6,  dur: 150, price: 3999, seats: 180, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'I5-702',  airline: 'Air Asia India', from: 'HYD', to: 'DEL', hour: 11, dur: 155, price: 3699, seats: 180, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'G8-802',  airline: 'GoAir',          from: 'HYD', to: 'DEL', hour: 20, dur: 160, price: 4299, seats: 180, cabin: 'ECONOMY',  stops: 1 },

    // BOM ↔ HYD  (top up to 7)
    { fn: 'QP-801',  airline: 'Akasa Air',      from: 'BOM', to: 'HYD', hour: 6,  dur: 80,  price: 3099, seats: 180, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'I5-801',  airline: 'Air Asia India', from: 'BOM', to: 'HYD', hour: 10, dur: 85,  price: 2799, seats: 180, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'AI-901',  airline: 'Air India',      from: 'BOM', to: 'HYD', hour: 16, dur: 80,  price: 3999, seats: 200, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'UK-901b', airline: 'Vistara',        from: 'BOM', to: 'HYD', hour: 19, dur: 85,  price: 7200, seats: 160, cabin: 'BUSINESS', stops: 0 },
    { fn: 'SG-903',  airline: 'SpiceJet',       from: 'BOM', to: 'HYD', hour: 22, dur: 90,  price: 3299, seats: 174, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'QP-802',  airline: 'Akasa Air',      from: 'HYD', to: 'BOM', hour: 7,  dur: 80,  price: 3099, seats: 180, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'I5-802',  airline: 'Air Asia India', from: 'HYD', to: 'BOM', hour: 12, dur: 85,  price: 2899, seats: 180, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'AI-902',  airline: 'Air India',      from: 'HYD', to: 'BOM', hour: 15, dur: 80,  price: 4199, seats: 200, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'UK-903',  airline: 'Vistara',        from: 'HYD', to: 'BOM', hour: 20, dur: 85,  price: 7500, seats: 160, cabin: 'BUSINESS', stops: 0 },
    { fn: 'G8-901',  airline: 'GoAir',          from: 'HYD', to: 'BOM', hour: 8,  dur: 90,  price: 3399, seats: 180, cabin: 'ECONOMY',  stops: 0 },

    // DEL ↔ MAA  (top up to 7)
    { fn: 'QP-901',  airline: 'Akasa Air',      from: 'DEL', to: 'MAA', hour: 7,  dur: 180, price: 4499, seats: 180, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'I5-901',  airline: 'Air Asia India', from: 'DEL', to: 'MAA', hour: 13, dur: 185, price: 4199, seats: 180, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'G8-111',  airline: 'GoAir',          from: 'DEL', to: 'MAA', hour: 18, dur: 195, price: 4699, seats: 180, cabin: 'ECONOMY',  stops: 1 },
    { fn: 'UK-111',  airline: 'Vistara',        from: 'DEL', to: 'MAA', hour: 20, dur: 180, price: 8500, seats: 160, cabin: 'BUSINESS', stops: 0 },
    { fn: 'QP-902',  airline: 'Akasa Air',      from: 'MAA', to: 'DEL', hour: 6,  dur: 180, price: 4399, seats: 180, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'I5-902',  airline: 'Air Asia India', from: 'MAA', to: 'DEL', hour: 11, dur: 185, price: 4099, seats: 180, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'G8-112',  airline: 'GoAir',          from: 'MAA', to: 'DEL', hour: 17, dur: 195, price: 4599, seats: 180, cabin: 'ECONOMY',  stops: 1 },
    { fn: 'UK-112',  airline: 'Vistara',        from: 'MAA', to: 'DEL', hour: 21, dur: 180, price: 8300, seats: 160, cabin: 'BUSINESS', stops: 0 },

    // BLR ↔ HYD  (top up to 7)
    { fn: 'QP-121',  airline: 'Akasa Air',      from: 'BLR', to: 'HYD', hour: 6,  dur: 60,  price: 2399, seats: 180, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'I5-121',  airline: 'Air Asia India', from: 'BLR', to: 'HYD', hour: 9,  dur: 65,  price: 2199, seats: 180, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'G8-121',  airline: 'GoAir',          from: 'BLR', to: 'HYD', hour: 14, dur: 60,  price: 2699, seats: 180, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'UK-121',  airline: 'Vistara',        from: 'BLR', to: 'HYD', hour: 19, dur: 60,  price: 5500, seats: 160, cabin: 'BUSINESS', stops: 0 },
    { fn: 'QP-122',  airline: 'Akasa Air',      from: 'HYD', to: 'BLR', hour: 7,  dur: 60,  price: 2499, seats: 180, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'I5-122',  airline: 'Air Asia India', from: 'HYD', to: 'BLR', hour: 11, dur: 65,  price: 2299, seats: 180, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'G8-122',  airline: 'GoAir',          from: 'HYD', to: 'BLR', hour: 13, dur: 60,  price: 2799, seats: 180, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'UK-122',  airline: 'Vistara',        from: 'HYD', to: 'BLR', hour: 18, dur: 60,  price: 5700, seats: 160, cabin: 'BUSINESS', stops: 0 },
    { fn: 'AI-123',  airline: 'Air India',      from: 'HYD', to: 'BLR', hour: 21, dur: 65,  price: 3199, seats: 200, cabin: 'ECONOMY',  stops: 0 },

    // CCU ↔ BOM  (top up to 7)
    { fn: 'QP-131',  airline: 'Akasa Air',      from: 'CCU', to: 'BOM', hour: 6,  dur: 170, price: 5199, seats: 180, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'I5-131',  airline: 'Air Asia India', from: 'CCU', to: 'BOM', hour: 10, dur: 175, price: 4899, seats: 180, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'SG-131',  airline: 'SpiceJet',       from: 'CCU', to: 'BOM', hour: 17, dur: 175, price: 5499, seats: 174, cabin: 'ECONOMY',  stops: 1 },
    { fn: 'UK-131',  airline: 'Vistara',        from: 'CCU', to: 'BOM', hour: 20, dur: 170, price: 9200, seats: 160, cabin: 'BUSINESS', stops: 0 },
    { fn: 'G8-131',  airline: 'GoAir',          from: 'CCU', to: 'BOM', hour: 12, dur: 175, price: 5099, seats: 180, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'QP-132',  airline: 'Akasa Air',      from: 'BOM', to: 'CCU', hour: 7,  dur: 170, price: 5099, seats: 180, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'I5-132',  airline: 'Air Asia India', from: 'BOM', to: 'CCU', hour: 13, dur: 175, price: 4799, seats: 180, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'SG-132',  airline: 'SpiceJet',       from: 'BOM', to: 'CCU', hour: 20, dur: 175, price: 5299, seats: 174, cabin: 'ECONOMY',  stops: 1 },
    { fn: 'UK-132',  airline: 'Vistara',        from: 'BOM', to: 'CCU', hour: 22, dur: 170, price: 9000, seats: 160, cabin: 'BUSINESS', stops: 0 },
    { fn: 'G8-132',  airline: 'GoAir',          from: 'BOM', to: 'CCU', hour: 9,  dur: 175, price: 4999, seats: 180, cabin: 'ECONOMY',  stops: 0 },

    // DEL ↔ AMD  (top up to 7)
    { fn: 'QP-141',  airline: 'Akasa Air',      from: 'DEL', to: 'AMD', hour: 6,  dur: 90,  price: 2899, seats: 180, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'I5-141',  airline: 'Air Asia India', from: 'DEL', to: 'AMD', hour: 10, dur: 95,  price: 2599, seats: 180, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'AI-141',  airline: 'Air India',      from: 'DEL', to: 'AMD', hour: 16, dur: 90,  price: 3799, seats: 200, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'UK-141',  airline: 'Vistara',        from: 'DEL', to: 'AMD', hour: 19, dur: 90,  price: 6500, seats: 160, cabin: 'BUSINESS', stops: 0 },
    { fn: 'SG-141',  airline: 'SpiceJet',       from: 'DEL', to: 'AMD', hour: 22, dur: 100, price: 2799, seats: 174, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'QP-142',  airline: 'Akasa Air',      from: 'AMD', to: 'DEL', hour: 7,  dur: 90,  price: 2799, seats: 180, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'I5-142',  airline: 'Air Asia India', from: 'AMD', to: 'DEL', hour: 12, dur: 95,  price: 2699, seats: 180, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'AI-142',  airline: 'Air India',      from: 'AMD', to: 'DEL', hour: 14, dur: 90,  price: 3899, seats: 200, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'UK-142',  airline: 'Vistara',        from: 'AMD', to: 'DEL', hour: 18, dur: 90,  price: 6700, seats: 160, cabin: 'BUSINESS', stops: 0 },
    { fn: 'G8-142',  airline: 'GoAir',          from: 'AMD', to: 'DEL', hour: 20, dur: 100, price: 3099, seats: 180, cabin: 'ECONOMY',  stops: 0 },

    // BLR ↔ MAA  (top up to 7)
    { fn: 'QP-151',  airline: 'Akasa Air',      from: 'BLR', to: 'MAA', hour: 7,  dur: 55,  price: 2199, seats: 180, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'I5-151',  airline: 'Air Asia India', from: 'BLR', to: 'MAA', hour: 13, dur: 60,  price: 1999, seats: 180, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'G8-151',  airline: 'GoAir',          from: 'BLR', to: 'MAA', hour: 18, dur: 55,  price: 2399, seats: 180, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'UK-151',  airline: 'Vistara',        from: 'BLR', to: 'MAA', hour: 20, dur: 55,  price: 5200, seats: 160, cabin: 'BUSINESS', stops: 0 },
    { fn: 'QP-152',  airline: 'Akasa Air',      from: 'MAA', to: 'BLR', hour: 6,  dur: 55,  price: 2099, seats: 180, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'I5-152',  airline: 'Air Asia India', from: 'MAA', to: 'BLR', hour: 10, dur: 60,  price: 1899, seats: 180, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'G8-152',  airline: 'GoAir',          from: 'MAA', to: 'BLR', hour: 16, dur: 55,  price: 2299, seats: 180, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'UK-152',  airline: 'Vistara',        from: 'MAA', to: 'BLR', hour: 19, dur: 55,  price: 5000, seats: 160, cabin: 'BUSINESS', stops: 0 },
    { fn: 'SG-152',  airline: 'SpiceJet',       from: 'MAA', to: 'BLR', hour: 21, dur: 60,  price: 2499, seats: 174, cabin: 'ECONOMY',  stops: 0 },

    // DEL ↔ JAI  (top up to 7)
    { fn: 'QP-161',  airline: 'Akasa Air',      from: 'DEL', to: 'JAI', hour: 6,  dur: 70,  price: 2399, seats: 180, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'I5-161',  airline: 'Air Asia India', from: 'DEL', to: 'JAI', hour: 9,  dur: 75,  price: 2199, seats: 180, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'AI-161',  airline: 'Air India',      from: 'DEL', to: 'JAI', hour: 12, dur: 70,  price: 3200, seats: 200, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'G8-161',  airline: 'GoAir',          from: 'DEL', to: 'JAI', hour: 16, dur: 75,  price: 2599, seats: 180, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'UK-161',  airline: 'Vistara',        from: 'DEL', to: 'JAI', hour: 19, dur: 70,  price: 5500, seats: 160, cabin: 'BUSINESS', stops: 0 },
    { fn: 'QP-162',  airline: 'Akasa Air',      from: 'JAI', to: 'DEL', hour: 7,  dur: 70,  price: 2299, seats: 180, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'I5-162',  airline: 'Air Asia India', from: 'JAI', to: 'DEL', hour: 11, dur: 75,  price: 2099, seats: 180, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'AI-162',  airline: 'Air India',      from: 'JAI', to: 'DEL', hour: 14, dur: 70,  price: 3100, seats: 200, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'G8-162',  airline: 'GoAir',          from: 'JAI', to: 'DEL', hour: 17, dur: 75,  price: 2499, seats: 180, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'UK-162',  airline: 'Vistara',        from: 'JAI', to: 'DEL', hour: 20, dur: 70,  price: 5300, seats: 160, cabin: 'BUSINESS', stops: 0 },

    // BOM ↔ MAA  (top up to 7)
    { fn: 'QP-171',  airline: 'Akasa Air',      from: 'BOM', to: 'MAA', hour: 6,  dur: 110, price: 3699, seats: 180, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'I5-171',  airline: 'Air Asia India', from: 'BOM', to: 'MAA', hour: 11, dur: 115, price: 3399, seats: 180, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'SG-171',  airline: 'SpiceJet',       from: 'BOM', to: 'MAA', hour: 17, dur: 115, price: 3999, seats: 174, cabin: 'ECONOMY',  stops: 1 },
    { fn: 'G8-171',  airline: 'GoAir',          from: 'BOM', to: 'MAA', hour: 20, dur: 110, price: 3799, seats: 180, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'UK-171',  airline: 'Vistara',        from: 'BOM', to: 'MAA', hour: 22, dur: 110, price: 7500, seats: 160, cabin: 'BUSINESS', stops: 0 },
    { fn: 'QP-172',  airline: 'Akasa Air',      from: 'MAA', to: 'BOM', hour: 7,  dur: 110, price: 3599, seats: 180, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'I5-172',  airline: 'Air Asia India', from: 'MAA', to: 'BOM', hour: 12, dur: 115, price: 3299, seats: 180, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'SG-172',  airline: 'SpiceJet',       from: 'MAA', to: 'BOM', hour: 18, dur: 115, price: 3899, seats: 174, cabin: 'ECONOMY',  stops: 1 },
    { fn: 'G8-172',  airline: 'GoAir',          from: 'MAA', to: 'BOM', hour: 21, dur: 110, price: 3699, seats: 180, cabin: 'ECONOMY',  stops: 0 },
    { fn: 'UK-172',  airline: 'Vistara',        from: 'MAA', to: 'BOM', hour: 23, dur: 110, price: 7300, seats: 160, cabin: 'BUSINESS', stops: 0 },
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
          price:          t.price + (day - 19) * Math.floor(t.price * 0.01),
          totalSeats:     t.seats,
          availableSeats: Math.max(5, Math.floor(t.seats * availFactor)),
          cabinClass:     t.cabin,
          stops:          t.stops,
          status:         'APPROVED',
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

    // ── Extra Mumbai hotels (bring to 7) ────────────────────────────────────
    {
      name: 'Taj Lands End',
      description: 'Dramatic luxury hotel on a rocky promontory overlooking the Arabian Sea in Bandra.',
      city: 'Mumbai',
      address: 'Byramji Jeejeebhoy Road, Lands End, Bandra West, Mumbai 400050',
      starRating: 5,
      amenities: ['WiFi', 'Pool', 'Spa', 'Gym', 'Multiple Restaurants', 'Bar', 'Sea View', 'Butler Service'],
      images: [],
      rooms: [
        { type: 'Deluxe Sea View', desc: 'Room with panoramic Arabian Sea view', price: 16000, cap: 2, total: 40, avail: 15, amenities: ['AC', 'TV', 'WiFi', 'Minibar', 'Balcony'] },
        { type: 'Sea View Suite',  desc: 'Spacious suite overlooking the sea',   price: 30000, cap: 3, total: 12, avail: 5,  amenities: ['AC', 'TV', 'WiFi', 'Minibar', 'Jacuzzi', 'Butler'] },
      ],
    },
    {
      name: 'JW Marriott Mumbai Juhu',
      description: 'Beachfront luxury hotel on the golden sands of Juhu Beach, Mumbai\'s glam address.',
      city: 'Mumbai',
      address: 'Juhu Tara Road, Juhu, Mumbai 400049',
      starRating: 5,
      amenities: ['WiFi', 'Beach Access', 'Pool', 'Spa', 'Gym', 'Multiple Restaurants', 'Bar', 'Kids Club'],
      images: [],
      rooms: [
        { type: 'Deluxe Room',      desc: 'Contemporary room with garden view',   price: 11000, cap: 2, total: 50, avail: 22, amenities: ['AC', 'TV', 'WiFi', 'Minibar'] },
        { type: 'Junior Suite',     desc: 'Suite with ocean or pool view',        price: 22000, cap: 3, total: 15, avail: 7,  amenities: ['AC', 'TV', 'WiFi', 'Minibar', 'Butler'] },
      ],
    },
    {
      name: 'Ibis Mumbai Airport',
      description: 'Smart budget hotel a 5-minute drive from Chhatrapati Shivaji Maharaj International Airport.',
      city: 'Mumbai',
      address: 'Marol Maroshi Road, Andheri East, Mumbai 400059',
      starRating: 3,
      amenities: ['WiFi', 'Restaurant', 'Gym', '24hr Reception', 'Airport Shuttle'],
      images: [],
      rooms: [
        { type: 'Standard Room', desc: 'Compact smart room near the airport', price: 3200, cap: 2, total: 45, avail: 20, amenities: ['AC', 'TV', 'WiFi'] },
        { type: 'Superior Room', desc: 'Larger room with extra workspace',    price: 4200, cap: 2, total: 20, avail: 9,  amenities: ['AC', 'TV', 'WiFi'] },
      ],
    },
    {
      name: 'Ginger Mumbai Thane',
      description: 'Value-for-money smart hotel in Thane, ideal for business travellers visiting SEEPZ or BKC.',
      city: 'Mumbai',
      address: 'Ghodbunder Road, Thane West, Thane 400607',
      starRating: 3,
      amenities: ['WiFi', 'Restaurant', 'Gym', 'Room Service', '24hr Reception'],
      images: [],
      rooms: [
        { type: 'Smart Room',      desc: 'Modern room with work desk',         price: 2500, cap: 2, total: 50, avail: 28, amenities: ['AC', 'TV', 'WiFi'] },
        { type: 'Smart Plus Room', desc: 'Slightly larger with better view',   price: 3200, cap: 2, total: 20, avail: 10, amenities: ['AC', 'TV', 'WiFi'] },
      ],
    },

    // ── Extra Delhi hotels (bring to 7) ─────────────────────────────────────
    {
      name: 'The Park New Delhi',
      description: 'Boutique design hotel in the heart of Connaught Place — bold interiors, vibrant bar.',
      city: 'Delhi',
      address: '15 Parliament Street, Connaught Place, New Delhi 110001',
      starRating: 4,
      amenities: ['WiFi', 'Pool', 'Spa', 'Gym', 'Restaurant', 'Rooftop Bar', 'Business Centre'],
      images: [],
      rooms: [
        { type: 'Deluxe Room',    desc: 'Stylish room with CP or garden view', price: 6500,  cap: 2, total: 40, avail: 18, amenities: ['AC', 'TV', 'WiFi'] },
        { type: 'Premium Room',   desc: 'Larger room with lounge access',      price: 9000,  cap: 2, total: 20, avail: 9,  amenities: ['AC', 'TV', 'WiFi', 'Minibar'] },
        { type: 'Suite',          desc: 'Spacious suite with separate lounge', price: 18000, cap: 3, total: 8,  avail: 4,  amenities: ['AC', 'TV', 'WiFi', 'Minibar', 'Jacuzzi'] },
      ],
    },
    {
      name: 'Shangri-La Eros New Delhi',
      description: 'Award-winning luxury hotel near Connaught Place blending local heritage with modern elegance.',
      city: 'Delhi',
      address: '19 Ashoka Road, New Delhi 110001',
      starRating: 5,
      amenities: ['WiFi', 'Pool', 'Spa', 'Gym', 'Multiple Restaurants', 'Bar', 'Business Centre', 'Butler Service'],
      images: [],
      rooms: [
        { type: 'Deluxe Room',    desc: 'Sophisticated room with city view',   price: 14000, cap: 2, total: 45, avail: 18, amenities: ['AC', 'TV', 'WiFi', 'Minibar'] },
        { type: 'Horizon Club',   desc: 'Club floor with exclusive lounge',    price: 20000, cap: 2, total: 20, avail: 8,  amenities: ['AC', 'TV', 'WiFi', 'Lounge Access', 'Minibar'] },
        { type: 'Grand Suite',    desc: 'Opulent suite with separate diner',   price: 45000, cap: 4, total: 6,  avail: 2,  amenities: ['AC', 'TV', 'WiFi', 'Butler', 'Jacuzzi'] },
      ],
    },
    {
      name: 'Lemon Tree Premier Delhi Airport',
      description: 'Upscale hotel directly connected to T3 via air bridge — perfect for transit stays.',
      city: 'Delhi',
      address: 'Asset 6, Hospitality District, Aerocity, New Delhi 110037',
      starRating: 4,
      amenities: ['WiFi', 'Pool', 'Gym', 'Restaurant', 'Bar', 'Business Centre', 'Airport Connectivity'],
      images: [],
      rooms: [
        { type: 'Studio',       desc: 'Compact room with airport access',       price: 5000,  cap: 2, total: 55, avail: 28, amenities: ['AC', 'TV', 'WiFi'] },
        { type: 'Suite',        desc: 'Spacious suite with lounge access',      price: 10000, cap: 3, total: 15, avail: 7,  amenities: ['AC', 'TV', 'WiFi', 'Minibar', 'Lounge Access'] },
      ],
    },
    {
      name: 'Hotel Broadway',
      description: 'Heritage hotel in Old Delhi with Mughal-inspired architecture, walking distance from Red Fort.',
      city: 'Delhi',
      address: '4/15A Asaf Ali Road, New Delhi 110002',
      starRating: 3,
      amenities: ['WiFi', 'Restaurant', 'Bar', 'Room Service', '24hr Reception'],
      images: [],
      rooms: [
        { type: 'Standard Room', desc: 'Classic room with heritage charm',  price: 2200, cap: 2, total: 30, avail: 16, amenities: ['AC', 'TV', 'WiFi'] },
        { type: 'Deluxe Room',   desc: 'Larger room with courtyard view',   price: 3000, cap: 2, total: 15, avail: 8,  amenities: ['AC', 'TV', 'WiFi'] },
      ],
    },

    // ── Extra Bangalore hotels (bring to 7) ──────────────────────────────────
    {
      name: 'The Leela Palace Bengaluru',
      description: 'Palatial luxury hotel in the upscale HAL district, blending royal Dravidian architecture.',
      city: 'Bangalore',
      address: '23 HAL Airport Road, Kodihalli, Bangalore 560008',
      starRating: 5,
      amenities: ['WiFi', 'Pool', 'Spa', 'Gym', 'Multiple Restaurants', 'Bar', 'Butler Service', 'Airport Shuttle'],
      images: [],
      rooms: [
        { type: 'Deluxe Room',  desc: 'Elegant room with pool or garden view',  price: 13000, cap: 2, total: 50, avail: 22, amenities: ['AC', 'TV', 'WiFi', 'Minibar'] },
        { type: 'Club Suite',   desc: 'Suite with exclusive Leela Club lounge', price: 28000, cap: 3, total: 15, avail: 6,  amenities: ['AC', 'TV', 'WiFi', 'Butler', 'Minibar', 'Lounge Access'] },
      ],
    },
    {
      name: 'Taj MG Road Bengaluru',
      description: 'Centrally located luxury hotel on MG Road — the landmark address of downtown Bangalore.',
      city: 'Bangalore',
      address: '41/3 Mahatma Gandhi Road, Bangalore 560001',
      starRating: 5,
      amenities: ['WiFi', 'Pool', 'Spa', 'Gym', 'Restaurant', 'Bar', 'Concierge'],
      images: [],
      rooms: [
        { type: 'Luxury Room',  desc: 'Stylish room overlooking MG Road',       price: 10000, cap: 2, total: 45, avail: 20, amenities: ['AC', 'TV', 'WiFi', 'Minibar'] },
        { type: 'Junior Suite', desc: 'Suite with sitting area and city views',  price: 18000, cap: 3, total: 12, avail: 5,  amenities: ['AC', 'TV', 'WiFi', 'Minibar', 'Jacuzzi'] },
      ],
    },
    {
      name: 'Ibis Bengaluru City Centre',
      description: 'Contemporary budget hotel steps from MG Road metro station — smart rooms, great value.',
      city: 'Bangalore',
      address: '5 No. 9 Hosur Road, Lalbagh Fort Road, Bangalore 560027',
      starRating: 3,
      amenities: ['WiFi', 'Restaurant', 'Gym', 'Bar', '24hr Reception'],
      images: [],
      rooms: [
        { type: 'Standard Room', desc: 'Modern room with city view',       price: 3500, cap: 2, total: 50, avail: 25, amenities: ['AC', 'TV', 'WiFi'] },
        { type: 'Superior Room', desc: 'Larger room with better view',     price: 4500, cap: 2, total: 20, avail: 10, amenities: ['AC', 'TV', 'WiFi'] },
      ],
    },
    {
      name: 'Treebo Trend Aster Inn Whitefield',
      description: 'Smart budget hotel in Whitefield IT corridor, walking distance from EPIP Zone offices.',
      city: 'Bangalore',
      address: '12 EPIP Zone, Whitefield, Bangalore 560066',
      starRating: 3,
      amenities: ['WiFi', 'Restaurant', 'Room Service', '24hr Reception'],
      images: [],
      rooms: [
        { type: 'Standard Room', desc: 'Clean room with work desk',        price: 1800, cap: 2, total: 35, avail: 18, amenities: ['AC', 'TV', 'WiFi'] },
        { type: 'Premium Room',  desc: 'Larger room with extra amenities', price: 2400, cap: 2, total: 15, avail: 8,  amenities: ['AC', 'TV', 'WiFi', 'Mini Fridge'] },
      ],
    },
    {
      name: 'Hyatt Centric MG Road Bengaluru',
      description: 'Lifestyle hotel on MG Road with buzzing rooftop bar and vibrant social spaces.',
      city: 'Bangalore',
      address: '2 Old Madras Road, HAL, Bangalore 560016',
      starRating: 4,
      amenities: ['WiFi', 'Pool', 'Gym', 'Restaurant', 'Rooftop Bar', 'Business Centre'],
      images: [],
      rooms: [
        { type: 'Standard Room', desc: 'Stylish room with city view',         price: 6000,  cap: 2, total: 45, avail: 20, amenities: ['AC', 'TV', 'WiFi'] },
        { type: 'King Room',     desc: 'Spacious king room with lounge access', price: 8500, cap: 2, total: 20, avail: 9,  amenities: ['AC', 'TV', 'WiFi', 'Lounge Access', 'Minibar'] },
      ],
    },

    // ── Extra Goa hotels (bring to 7) ────────────────────────────────────────
    {
      name: 'W Goa',
      description: 'Ultra-luxury lifestyle resort on Vagator Beach with infinity pool and vibrant nightlife.',
      city: 'Goa',
      address: 'Vagator Beach Road, Anjuna, North Goa 403509',
      starRating: 5,
      amenities: ['WiFi', 'Infinity Pool', 'Beach Access', 'Spa', 'Gym', 'Multiple Restaurants', 'Bar', 'Fire Pit'],
      images: [],
      rooms: [
        { type: 'Wonderful Room',  desc: 'Sea-view room with W signature design', price: 25000, cap: 2, total: 40, avail: 15, amenities: ['AC', 'TV', 'WiFi', 'Minibar', 'Balcony'] },
        { type: 'Spectacular Suite', desc: 'Private pool suite on the cliff top',  price: 65000, cap: 4, total: 8,  avail: 3,  amenities: ['AC', 'TV', 'WiFi', 'Private Pool', 'Butler'] },
      ],
    },
    {
      name: 'Grand Hyatt Goa',
      description: 'Sprawling luxury resort near Bambolim Beach with 28 acres of tropical gardens.',
      city: 'Goa',
      address: 'Bambolim Beach, Bambolim, North Goa 403206',
      starRating: 5,
      amenities: ['WiFi', 'Multiple Pools', 'Beach Access', 'Spa', 'Gym', 'Multiple Restaurants', 'Bar', 'Kids Club'],
      images: [],
      rooms: [
        { type: 'Grand Room',   desc: 'Spacious room with pool or garden view', price: 14000, cap: 2, total: 55, avail: 24, amenities: ['AC', 'TV', 'WiFi', 'Minibar', 'Balcony'] },
        { type: 'Grand Suite',  desc: 'Generous suite with sea view',           price: 32000, cap: 3, total: 12, avail: 5,  amenities: ['AC', 'TV', 'WiFi', 'Minibar', 'Butler', 'Jacuzzi'] },
      ],
    },
    {
      name: 'Lemon Tree Amarante Beach Resort Goa',
      description: 'Mid-range beach resort on Candolim Beach, North Goa — pools, water sports and sunsets.',
      city: 'Goa',
      address: 'Candolim Beach, Candolim, North Goa 403515',
      starRating: 4,
      amenities: ['WiFi', 'Beach Access', 'Pool', 'Gym', 'Restaurant', 'Bar', 'Water Sports'],
      images: [],
      rooms: [
        { type: 'Deluxe Room',     desc: 'Bright room with garden or pool view', price: 7000,  cap: 2, total: 45, avail: 22, amenities: ['AC', 'TV', 'WiFi', 'Balcony'] },
        { type: 'Sea View Room',   desc: 'Room with partial sea or garden view', price: 9500,  cap: 2, total: 20, avail: 9,  amenities: ['AC', 'TV', 'WiFi', 'Balcony', 'Minibar'] },
      ],
    },
    {
      name: 'Treebo Trend Goa Capital O',
      description: 'Budget-friendly guesthouse near Calangute Beach, popular with backpackers and young travellers.',
      city: 'Goa',
      address: 'Calangute Beach Road, Calangute, North Goa 403516',
      starRating: 2,
      amenities: ['WiFi', 'Room Service', '24hr Reception', 'Beach Proximity'],
      images: [],
      rooms: [
        { type: 'Standard Room', desc: 'Basic clean room near the beach', price: 1500, cap: 2, total: 25, avail: 14, amenities: ['AC', 'TV', 'WiFi'] },
        { type: 'Deluxe Room',   desc: 'Slightly larger room with balcony', price: 2200, cap: 2, total: 12, avail: 7,  amenities: ['AC', 'TV', 'WiFi', 'Balcony'] },
      ],
    },

    // ── Extra Chennai hotels (bring to 7) ─────────────────────────────────────
    {
      name: 'Taj Coromandel Chennai',
      description: 'Iconic luxury hotel on Nungambakkam High Road — Chennai\'s premier address since 1974.',
      city: 'Chennai',
      address: '37 Mahatma Gandhi Road, Nungambakkam, Chennai 600034',
      starRating: 5,
      amenities: ['WiFi', 'Pool', 'Spa', 'Gym', 'Multiple Restaurants', 'Bar', 'Business Centre', 'Butler Service'],
      images: [],
      rooms: [
        { type: 'Luxury Room',    desc: 'Elegant room with pool or city view',   price: 14000, cap: 2, total: 45, avail: 20, amenities: ['AC', 'TV', 'WiFi', 'Minibar'] },
        { type: 'Luxury Suite',   desc: 'Spacious suite with separate lounge',   price: 30000, cap: 3, total: 12, avail: 5,  amenities: ['AC', 'TV', 'WiFi', 'Minibar', 'Butler', 'Jacuzzi'] },
      ],
    },
    {
      name: 'Hyatt Regency Chennai',
      description: 'Contemporary luxury hotel in the heart of the business district near Anna Salai.',
      city: 'Chennai',
      address: '365 Anna Salai, Teynampet, Chennai 600018',
      starRating: 5,
      amenities: ['WiFi', 'Pool', 'Spa', 'Gym', 'Multiple Restaurants', 'Bar', 'Business Centre'],
      images: [],
      rooms: [
        { type: 'King Room',      desc: 'Sophisticated room with city view',     price: 9000,  cap: 2, total: 50, avail: 22, amenities: ['AC', 'TV', 'WiFi', 'Minibar'] },
        { type: 'Regency Club',   desc: 'Club floor with exclusive lounge',      price: 13000, cap: 2, total: 20, avail: 9,  amenities: ['AC', 'TV', 'WiFi', 'Lounge Access', 'Minibar'] },
        { type: 'Suite',          desc: 'Generous suite with panoramic views',   price: 25000, cap: 3, total: 8,  avail: 4,  amenities: ['AC', 'TV', 'WiFi', 'Butler', 'Jacuzzi'] },
      ],
    },
    {
      name: 'Ibis Chennai City Centre',
      description: 'Smartly designed budget hotel in Perungudi IT corridor, near Chennai\'s tech companies.',
      city: 'Chennai',
      address: 'Old Mahabalipuram Road, Perungudi, Chennai 600096',
      starRating: 3,
      amenities: ['WiFi', 'Restaurant', 'Gym', 'Bar', '24hr Reception'],
      images: [],
      rooms: [
        { type: 'Standard Room', desc: 'Compact smart room with work desk',  price: 2800, cap: 2, total: 55, avail: 28, amenities: ['AC', 'TV', 'WiFi'] },
        { type: 'Superior Room', desc: 'Larger room with better amenities',  price: 3800, cap: 2, total: 20, avail: 10, amenities: ['AC', 'TV', 'WiFi'] },
      ],
    },
    {
      name: 'Ginger Chennai Airport',
      description: 'Smart budget hotel near Chennai International Airport, ideal for early flights.',
      city: 'Chennai',
      address: '11 GN Chetty Road, T Nagar, Chennai 600017',
      starRating: 3,
      amenities: ['WiFi', 'Restaurant', 'Gym', 'Room Service', '24hr Reception'],
      images: [],
      rooms: [
        { type: 'Smart Room',      desc: 'Modern room near the airport',       price: 2200, cap: 2, total: 40, avail: 22, amenities: ['AC', 'TV', 'WiFi'] },
        { type: 'Smart Plus Room', desc: 'Larger room with extra comfort',     price: 3000, cap: 2, total: 20, avail: 12, amenities: ['AC', 'TV', 'WiFi'] },
      ],
    },

    // ── Extra Hyderabad hotels (bring to 7) ──────────────────────────────────
    {
      name: 'Taj Krishna Hyderabad',
      description: 'Centrally located luxury hotel in Banjara Hills — a premier destination for business and leisure.',
      city: 'Hyderabad',
      address: 'Road No 1, Banjara Hills, Hyderabad 500034',
      starRating: 5,
      amenities: ['WiFi', 'Pool', 'Spa', 'Gym', 'Multiple Restaurants', 'Bar', 'Concierge', 'Business Centre'],
      images: [],
      rooms: [
        { type: 'Luxury Room',    desc: 'Elegant room with city or pool view',  price: 10000, cap: 2, total: 50, avail: 22, amenities: ['AC', 'TV', 'WiFi', 'Minibar'] },
        { type: 'Luxury Suite',   desc: 'Spacious suite with private lounge',   price: 22000, cap: 3, total: 12, avail: 5,  amenities: ['AC', 'TV', 'WiFi', 'Minibar', 'Butler'] },
      ],
    },
    {
      name: 'Hyatt Hyderabad Gachibowli',
      description: 'Upscale hotel in the heart of Hyderabad\'s growing IT and financial district.',
      city: 'Hyderabad',
      address: 'Gachibowli, Hyderabad 500032',
      starRating: 5,
      amenities: ['WiFi', 'Pool', 'Gym', 'Spa', 'Restaurant', 'Bar', 'Business Centre'],
      images: [],
      rooms: [
        { type: 'King Room',      desc: 'Contemporary room with district view', price: 8500,  cap: 2, total: 55, avail: 26, amenities: ['AC', 'TV', 'WiFi', 'Minibar'] },
        { type: 'Executive Suite', desc: 'Suite with separate lounge and bar',  price: 18000, cap: 3, total: 10, avail: 4,  amenities: ['AC', 'TV', 'WiFi', 'Minibar', 'Butler'] },
      ],
    },
    {
      name: 'Lemon Tree Hotel HITEC City Hyderabad',
      description: 'Contemporary mid-scale hotel in HITEC City, walking distance from Raheja Mindspace.',
      city: 'Hyderabad',
      address: 'Survey 64, HITEC City, Hyderabad 500081',
      starRating: 4,
      amenities: ['WiFi', 'Pool', 'Gym', 'Restaurant', 'Bar', 'Business Centre'],
      images: [],
      rooms: [
        { type: 'Premium Studio', desc: 'Compact room ideal for tech travellers', price: 4000, cap: 2, total: 50, avail: 24, amenities: ['AC', 'TV', 'WiFi'] },
        { type: 'Suite',          desc: 'Spacious suite with sitting area',       price: 8000, cap: 3, total: 15, avail: 7,  amenities: ['AC', 'TV', 'WiFi', 'Minibar'] },
      ],
    },
    {
      name: 'Treebo Trend Kings Court Hyderabad',
      description: 'Affordable business hotel near Secunderabad Railway Station and Old City.',
      city: 'Hyderabad',
      address: 'Sindhi Colony, Secunderabad, Hyderabad 500003',
      starRating: 3,
      amenities: ['WiFi', 'Restaurant', 'Room Service', '24hr Reception'],
      images: [],
      rooms: [
        { type: 'Standard Room', desc: 'Clean air-conditioned room',          price: 1600, cap: 2, total: 30, avail: 16, amenities: ['AC', 'TV', 'WiFi'] },
        { type: 'Deluxe Room',   desc: 'Spacious room with extra comfort',    price: 2200, cap: 2, total: 15, avail: 8,  amenities: ['AC', 'TV', 'WiFi'] },
      ],
    },

    // ── Extra Jaipur hotels (bring to 7) ─────────────────────────────────────
    {
      name: 'ITC Rajputana Jaipur',
      description: 'Palace-inspired luxury hotel in the heart of Jaipur celebrating the glory of Rajputana.',
      city: 'Jaipur',
      address: 'Palace Road, Jaipur, Rajasthan 302006',
      starRating: 5,
      amenities: ['WiFi', 'Pool', 'Spa', 'Gym', 'Multiple Restaurants', 'Bar', 'Butler Service'],
      images: [],
      rooms: [
        { type: 'Luxury Room',    desc: 'Elegant room with pool or garden view', price: 8000,  cap: 2, total: 50, avail: 22, amenities: ['AC', 'TV', 'WiFi', 'Minibar'] },
        { type: 'Grand Suite',    desc: 'Palatial suite with butler service',    price: 18000, cap: 3, total: 10, avail: 4,  amenities: ['AC', 'TV', 'WiFi', 'Minibar', 'Butler', 'Jacuzzi'] },
      ],
    },
    {
      name: 'Fairmont Jaipur',
      description: 'Majestic luxury hotel in a royal pink sandstone property, offering true Rajasthani grandeur.',
      city: 'Jaipur',
      address: 'Riico Institutional Area, Kukas, Jaipur 302028',
      starRating: 5,
      amenities: ['WiFi', 'Multiple Pools', 'Spa', 'Gym', 'Multiple Restaurants', 'Bar', 'Elephant Experiences'],
      images: [],
      rooms: [
        { type: 'Deluxe Room',    desc: 'Resplendent room with garden view',    price: 9000,  cap: 2, total: 60, avail: 25, amenities: ['AC', 'TV', 'WiFi', 'Minibar', 'Balcony'] },
        { type: 'Heritage Suite', desc: 'Suite inspired by Rajput heritage',    price: 22000, cap: 3, total: 15, avail: 6,  amenities: ['AC', 'TV', 'WiFi', 'Minibar', 'Butler', 'Private Terrace'] },
      ],
    },
    {
      name: 'Ibis Jaipur',
      description: 'Budget smart hotel near Jaipur Airport — clean, modern and well-connected to the old city.',
      city: 'Jaipur',
      address: 'Opposite Jaipur Airport, Sanganer, Jaipur 302011',
      starRating: 3,
      amenities: ['WiFi', 'Restaurant', 'Gym', '24hr Reception'],
      images: [],
      rooms: [
        { type: 'Standard Room', desc: 'Clean smart room near the airport', price: 2500, cap: 2, total: 45, avail: 22, amenities: ['AC', 'TV', 'WiFi'] },
        { type: 'Superior Room', desc: 'Larger room with upgraded amenities', price: 3500, cap: 2, total: 18, avail: 9,  amenities: ['AC', 'TV', 'WiFi'] },
      ],
    },
    {
      name: 'Zostel Jaipur',
      description: 'Colourful heritage-themed backpacker hostel in the old city, walking distance from Hawa Mahal.',
      city: 'Jaipur',
      address: 'D-108 Panchsheel Colony, Jaipur 302001',
      starRating: 2,
      amenities: ['WiFi', 'Common Kitchen', 'Rooftop Lounge', 'Tours Desk', 'Lockers'],
      images: [],
      rooms: [
        { type: 'Dormitory Bed', desc: '6-bed mixed dorm',                      price: 550, cap: 1, total: 30, avail: 18, amenities: ['WiFi', 'Locker'] },
        { type: 'Private Room',  desc: 'Private room with heritage decor',      price: 1800, cap: 2, total: 8,  avail: 5,  amenities: ['AC', 'WiFi'] },
      ],
    },

    // ── Extra Kolkata hotels (bring to 7) ─────────────────────────────────────
    {
      name: 'ITC Royal Bengal',
      description: 'Grand luxury hotel in Kolkata\'s new business district — ITC\'s largest property in India.',
      city: 'Kolkata',
      address: '1 J.B.S. Haldane Avenue, New Town, Kolkata 700105',
      starRating: 5,
      amenities: ['WiFi', 'Multiple Pools', 'Spa', 'Gym', 'Multiple Restaurants', 'Bar', 'Business Centre', 'Helipad'],
      images: [],
      rooms: [
        { type: 'Luxury Room',    desc: 'Contemporary room with city or lake view', price: 12000, cap: 2, total: 55, avail: 24, amenities: ['AC', 'TV', 'WiFi', 'Minibar'] },
        { type: 'Club Room',      desc: 'Premium room with Towers Club lounge',     price: 18000, cap: 2, total: 25, avail: 10, amenities: ['AC', 'TV', 'WiFi', 'Lounge Access', 'Minibar'] },
        { type: 'Royal Suite',    desc: 'Opulent suite with butler service',         price: 40000, cap: 4, total: 8,  avail: 3,  amenities: ['AC', 'TV', 'WiFi', 'Butler', 'Jacuzzi', 'Private Dining'] },
      ],
    },
    {
      name: 'Taj Bengal Kolkata',
      description: 'Landmark luxury hotel on Alipore Road blending colonial heritage with contemporary comforts.',
      city: 'Kolkata',
      address: '34B Belvedere Road, Alipore, Kolkata 700027',
      starRating: 5,
      amenities: ['WiFi', 'Pool', 'Spa', 'Gym', 'Multiple Restaurants', 'Bar', 'Business Centre', 'Airport Shuttle'],
      images: [],
      rooms: [
        { type: 'Luxury Room',    desc: 'Elegant room with garden or city view',   price: 11000, cap: 2, total: 50, avail: 22, amenities: ['AC', 'TV', 'WiFi', 'Minibar'] },
        { type: 'Luxury Suite',   desc: 'Spacious suite with separate drawing room', price: 25000, cap: 3, total: 12, avail: 5,  amenities: ['AC', 'TV', 'WiFi', 'Minibar', 'Butler'] },
      ],
    },
    {
      name: 'Ibis Kolkata Rajarhat',
      description: 'Smart budget hotel in New Town near major IT parks and Kolkata airport.',
      city: 'Kolkata',
      address: 'Plot AA-1, New Town, Rajarhat, Kolkata 700156',
      starRating: 3,
      amenities: ['WiFi', 'Restaurant', 'Gym', 'Bar', '24hr Reception'],
      images: [],
      rooms: [
        { type: 'Standard Room', desc: 'Compact smart room near tech parks', price: 2800, cap: 2, total: 55, avail: 28, amenities: ['AC', 'TV', 'WiFi'] },
        { type: 'Superior Room', desc: 'Larger room with better view',       price: 3800, cap: 2, total: 20, avail: 10, amenities: ['AC', 'TV', 'WiFi'] },
      ],
    },
    {
      name: 'Ginger Kolkata Salt Lake',
      description: 'Value-for-money smart hotel in Salt Lake City — ideal for IT professionals and budget travellers.',
      city: 'Kolkata',
      address: 'BB Block, Salt Lake City, Kolkata 700064',
      starRating: 3,
      amenities: ['WiFi', 'Restaurant', 'Gym', 'Room Service', '24hr Reception'],
      images: [],
      rooms: [
        { type: 'Smart Room',      desc: 'Modern room with work desk',         price: 2000, cap: 2, total: 45, avail: 24, amenities: ['AC', 'TV', 'WiFi'] },
        { type: 'Smart Plus Room', desc: 'Larger room with additional space',  price: 2800, cap: 2, total: 18, avail: 10, amenities: ['AC', 'TV', 'WiFi'] },
      ],
    },
  ]

  const created = []
  for (const h of hotelsData) {
    const { rooms: roomsData, ...hotelFields } = h
    const hotel = await prisma.hotel.create({ data: { ...hotelFields, status: 'APPROVED' } })
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

    // ── Extra trains to guarantee 7+ per route ────────────────────────────────

    // NDLS ↔ SBC  (add 5 each, total 7 each)
    { num: '20901', name: 'Vande Bharat Express',             from: 'NDLS', to: 'SBC',  hour: 6,   dur: 1260, classes: { CC: { price: 1850, seats: 400 }, EC: { price: 3500, seats: 100 }                                                                          }, total: 500 },
    { num: '16591', name: 'Hampi Express',                    from: 'NDLS', to: 'SBC',  hour: 22,  dur: 1800, classes: { SL: { price: 800, seats: 600 }, '3A': { price: 2120, seats: 200 }, '2A': { price: 3050, seats: 100 }                                       }, total: 900 },
    { num: '12591', name: 'Gorakhpur-Bangalore Express',      from: 'NDLS', to: 'SBC',  hour: 9,   dur: 1740, classes: { SL: { price: 840, seats: 600 }, '3A': { price: 2230, seats: 200 }, '2A': { price: 3210, seats: 100 }                                       }, total: 900 },
    { num: '12693', name: 'Pearl City SF Express',            from: 'NDLS', to: 'SBC',  hour: 14,  dur: 1680, classes: { SL: { price: 860, seats: 600 }, '3A': { price: 2280, seats: 200 }, '2A': { price: 3280, seats: 100 }, '1A': { price: 5520, seats: 24 }    }, total: 924 },
    { num: '22691b',name: 'Sampark Kranti Express',           from: 'NDLS', to: 'SBC',  hour: 18,  dur: 1720, classes: {                                  '3A': { price: 2200, seats: 200 }, '2A': { price: 3160, seats: 100 }, '1A': { price: 5320, seats: 24 }    }, total: 324 },
    { num: '20902', name: 'Vande Bharat Express (Return)',    from: 'SBC',  to: 'NDLS', hour: 6,   dur: 1260, classes: { CC: { price: 1850, seats: 400 }, EC: { price: 3500, seats: 100 }                                                                          }, total: 500 },
    { num: '16592', name: 'Hampi Express (Return)',           from: 'SBC',  to: 'NDLS', hour: 8,   dur: 1800, classes: { SL: { price: 800, seats: 600 }, '3A': { price: 2120, seats: 200 }, '2A': { price: 3050, seats: 100 }                                       }, total: 900 },
    { num: '12592', name: 'Bangalore-Gorakhpur Express',      from: 'SBC',  to: 'NDLS', hour: 12,  dur: 1740, classes: { SL: { price: 840, seats: 600 }, '3A': { price: 2230, seats: 200 }, '2A': { price: 3210, seats: 100 }                                       }, total: 900 },
    { num: '12694', name: 'Pearl City SF Express (Return)',   from: 'SBC',  to: 'NDLS', hour: 16,  dur: 1680, classes: { SL: { price: 860, seats: 600 }, '3A': { price: 2280, seats: 200 }, '2A': { price: 3280, seats: 100 }, '1A': { price: 5520, seats: 24 }    }, total: 924 },
    { num: '22692b',name: 'Sampark Kranti Express (Return)',  from: 'SBC',  to: 'NDLS', hour: 21,  dur: 1720, classes: {                                  '3A': { price: 2200, seats: 200 }, '2A': { price: 3160, seats: 100 }, '1A': { price: 5320, seats: 24 }    }, total: 324 },

    // NDLS ↔ SC  (add 6 each, total 7 each)
    { num: '12721', name: 'Dakshin Express',                  from: 'NDLS', to: 'SC',   hour: 22,  dur: 1480, classes: { SL: { price: 540, seats: 600 }, '3A': { price: 1435, seats: 200 }, '2A': { price: 2065, seats: 100 }                                       }, total: 900 },
    { num: '12429', name: 'Rajdhani Express (Hyderabad)',     from: 'NDLS', to: 'SC',   hour: 15,  dur: 1440, classes: {                                  '3A': { price: 2030, seats: 200 }, '2A': { price: 2920, seats: 100 }, '1A': { price: 4920, seats: 24 }    }, total: 324 },
    { num: '17057', name: 'Devagiri Express',                 from: 'NDLS', to: 'SC',   hour: 7,   dur: 1500, classes: { SL: { price: 510, seats: 600 }, '3A': { price: 1355, seats: 200 }, '2A': { price: 1950, seats: 100 }                                       }, total: 900 },
    { num: '12717', name: 'Ratnachal Express',                from: 'NDLS', to: 'SC',   hour: 12,  dur: 1440, classes: { SL: { price: 530, seats: 600 }, '3A': { price: 1410, seats: 200 }, '2A': { price: 2030, seats: 100 }                                       }, total: 900 },
    { num: '20703', name: 'Vande Bharat Express (Hyd)',       from: 'NDLS', to: 'SC',   hour: 5,   dur: 1200, classes: { CC: { price: 1700, seats: 400 }, EC: { price: 3200, seats: 100 }                                                                          }, total: 500 },
    { num: '12115', name: 'Sachkhand Express',                from: 'NDLS', to: 'SC',   hour: 9,   dur: 1440, classes: { SL: { price: 520, seats: 600 }, '3A': { price: 1380, seats: 200 }, '2A': { price: 1985, seats: 100 }                                       }, total: 900 },
    { num: '12722', name: 'Dakshin Express (Return)',         from: 'SC',   to: 'NDLS', hour: 7,   dur: 1480, classes: { SL: { price: 540, seats: 600 }, '3A': { price: 1435, seats: 200 }, '2A': { price: 2065, seats: 100 }                                       }, total: 900 },
    { num: '12430', name: 'Rajdhani Express (Delhi Return)',  from: 'SC',   to: 'NDLS', hour: 16,  dur: 1440, classes: {                                  '3A': { price: 2030, seats: 200 }, '2A': { price: 2920, seats: 100 }, '1A': { price: 4920, seats: 24 }    }, total: 324 },
    { num: '17058', name: 'Devagiri Express (Return)',        from: 'SC',   to: 'NDLS', hour: 18,  dur: 1500, classes: { SL: { price: 510, seats: 600 }, '3A': { price: 1355, seats: 200 }, '2A': { price: 1950, seats: 100 }                                       }, total: 900 },
    { num: '12718', name: 'Ratnachal Express (Return)',       from: 'SC',   to: 'NDLS', hour: 22,  dur: 1440, classes: { SL: { price: 530, seats: 600 }, '3A': { price: 1410, seats: 200 }, '2A': { price: 2030, seats: 100 }                                       }, total: 900 },
    { num: '20704', name: 'Vande Bharat Express (Del)',       from: 'SC',   to: 'NDLS', hour: 5,   dur: 1200, classes: { CC: { price: 1700, seats: 400 }, EC: { price: 3200, seats: 100 }                                                                          }, total: 500 },
    { num: '12116', name: 'Sachkhand Express (Return)',       from: 'SC',   to: 'NDLS', hour: 10,  dur: 1440, classes: { SL: { price: 520, seats: 600 }, '3A': { price: 1380, seats: 200 }, '2A': { price: 1985, seats: 100 }                                       }, total: 900 },

    // SBC ↔ MAS  (add 5 each, total 7 each)
    { num: '12657', name: 'Chennai Mail',                     from: 'SBC',  to: 'MAS',  hour: 14,  dur: 360,  classes: { SL: { price: 210, seats: 600 }, '3A': { price: 555, seats: 200 }, '2A': { price: 800, seats: 100  }                                       }, total: 900 },
    { num: '16023', name: 'Malgudi Express',                  from: 'SBC',  to: 'MAS',  hour: 17,  dur: 420,  classes: { SL: { price: 205, seats: 600 }, '3A': { price: 545, seats: 200 }, '2A': { price: 785, seats: 100  }                                       }, total: 900 },
    { num: '22625', name: 'KCG-TVC SF Express',               from: 'SBC',  to: 'MAS',  hour: 9,   dur: 330,  classes: { SL: { price: 225, seats: 600 }, '3A': { price: 595, seats: 200 }, '2A': { price: 860, seats: 100  }                                       }, total: 900 },
    { num: '12241', name: 'Chennai Rajdhani',                 from: 'SBC',  to: 'MAS',  hour: 20,  dur: 300,  classes: {                                  '3A': { price: 780, seats: 200 }, '2A': { price: 1120, seats: 100 }, '1A': { price: 1885, seats: 24 }    }, total: 324 },
    { num: '22691c',name: 'Brindavan Express',                from: 'SBC',  to: 'MAS',  hour: 7,   dur: 315,  classes: { CC: { price: 475, seats: 400 }                                                                                                            }, total: 400 },
    { num: '12658', name: 'Chennai Mail (Return)',             from: 'MAS',  to: 'SBC',  hour: 23,  dur: 360,  classes: { SL: { price: 210, seats: 600 }, '3A': { price: 555, seats: 200 }, '2A': { price: 800, seats: 100  }                                       }, total: 900 },
    { num: '16024', name: 'Malgudi Express (Return)',         from: 'MAS',  to: 'SBC',  hour: 6,   dur: 420,  classes: { SL: { price: 205, seats: 600 }, '3A': { price: 545, seats: 200 }, '2A': { price: 785, seats: 100  }                                       }, total: 900 },
    { num: '22626', name: 'TVC-KCG SF Express',               from: 'MAS',  to: 'SBC',  hour: 20,  dur: 330,  classes: { SL: { price: 225, seats: 600 }, '3A': { price: 595, seats: 200 }, '2A': { price: 860, seats: 100  }                                       }, total: 900 },
    { num: '12242', name: 'Bangalore Rajdhani',               from: 'MAS',  to: 'SBC',  hour: 7,   dur: 300,  classes: {                                  '3A': { price: 780, seats: 200 }, '2A': { price: 1120, seats: 100 }, '1A': { price: 1885, seats: 24 }    }, total: 324 },
    { num: '22692c',name: 'Brindavan Express (Return)',       from: 'MAS',  to: 'SBC',  hour: 14,  dur: 315,  classes: { CC: { price: 475, seats: 400 }                                                                                                            }, total: 400 },

    // NDLS ↔ TVC  (add 6 each, total 7 each)
    { num: '12625', name: 'Kerala Express',                   from: 'NDLS', to: 'TVC',  hour: 11,  dur: 2700, classes: { SL: { price: 840, seats: 600 }, '3A': { price: 2230, seats: 200 }, '2A': { price: 3210, seats: 100 }, '1A': { price: 5400, seats: 24 }    }, total: 924 },
    { num: '16317', name: 'Himsagar Express',                 from: 'NDLS', to: 'TVC',  hour: 15,  dur: 3060, classes: { SL: { price: 780, seats: 600 }, '3A': { price: 2075, seats: 200 }, '2A': { price: 2985, seats: 100 }                                       }, total: 900 },
    { num: '16311', name: 'Kochuveli Express',                from: 'NDLS', to: 'TVC',  hour: 18,  dur: 2880, classes: { SL: { price: 800, seats: 600 }, '3A': { price: 2120, seats: 200 }, '2A': { price: 3050, seats: 100 }                                       }, total: 900 },
    { num: '22659', name: 'Dehradun-Kochuveli Express',       from: 'NDLS', to: 'TVC',  hour: 8,   dur: 2760, classes: { SL: { price: 820, seats: 600 }, '3A': { price: 2175, seats: 200 }, '2A': { price: 3130, seats: 100 }                                       }, total: 900 },
    { num: '16789', name: 'Alappuzha Express',                from: 'NDLS', to: 'TVC',  hour: 22,  dur: 2700, classes: { SL: { price: 840, seats: 600 }, '3A': { price: 2230, seats: 200 }, '2A': { price: 3210, seats: 100 }                                       }, total: 900 },
    { num: '22133', name: 'Mumbai-Thiruvananthapuram SF Exp', from: 'NDLS', to: 'TVC',  hour: 5,   dur: 2580, classes: { SL: { price: 860, seats: 600 }, '3A': { price: 2280, seats: 200 }, '2A': { price: 3280, seats: 100 }, '1A': { price: 5520, seats: 24 }    }, total: 924 },
    { num: '12626', name: 'Kerala Express (Return)',          from: 'TVC',  to: 'NDLS', hour: 11,  dur: 2700, classes: { SL: { price: 840, seats: 600 }, '3A': { price: 2230, seats: 200 }, '2A': { price: 3210, seats: 100 }, '1A': { price: 5400, seats: 24 }    }, total: 924 },
    { num: '16318', name: 'Himsagar Express (Return)',        from: 'TVC',  to: 'NDLS', hour: 16,  dur: 3060, classes: { SL: { price: 780, seats: 600 }, '3A': { price: 2075, seats: 200 }, '2A': { price: 2985, seats: 100 }                                       }, total: 900 },
    { num: '16312', name: 'Kochuveli Express (Return)',       from: 'TVC',  to: 'NDLS', hour: 19,  dur: 2880, classes: { SL: { price: 800, seats: 600 }, '3A': { price: 2120, seats: 200 }, '2A': { price: 3050, seats: 100 }                                       }, total: 900 },
    { num: '22660', name: 'Kochuveli-Dehradun Express',       from: 'TVC',  to: 'NDLS', hour: 9,   dur: 2760, classes: { SL: { price: 820, seats: 600 }, '3A': { price: 2175, seats: 200 }, '2A': { price: 3130, seats: 100 }                                       }, total: 900 },
    { num: '16790', name: 'Alappuzha Express (Return)',       from: 'TVC',  to: 'NDLS', hour: 6,   dur: 2700, classes: { SL: { price: 840, seats: 600 }, '3A': { price: 2230, seats: 200 }, '2A': { price: 3210, seats: 100 }                                       }, total: 900 },
    { num: '22134', name: 'Thiruvananthapuram-Mumbai SF Exp', from: 'TVC',  to: 'NDLS', hour: 21,  dur: 2580, classes: { SL: { price: 860, seats: 600 }, '3A': { price: 2280, seats: 200 }, '2A': { price: 3280, seats: 100 }, '1A': { price: 5520, seats: 24 }    }, total: 924 },

    // MMCT ↔ PUNE  (add 4 each, total 7)
    { num: '12129', name: 'Pragati Express',                  from: 'MMCT', to: 'PUNE', hour: 9,   dur: 195,  classes: { CC: { price: 475, seats: 400 }                                                                                                            }, total: 400 },
    { num: '11019', name: 'Koyna Express',                    from: 'MMCT', to: 'PUNE', hour: 14,  dur: 210,  classes: { SL: { price: 175, seats: 600 }, '3A': { price: 465, seats: 200 }                                                                         }, total: 800 },
    { num: '12125', name: 'Intercity SF Express',             from: 'MMCT', to: 'PUNE', hour: 17,  dur: 200,  classes: { CC: { price: 490, seats: 400 }, EC: { price: 955, seats: 100 }                                                                            }, total: 500 },
    { num: '12155', name: 'Sinhagad Express',                 from: 'MMCT', to: 'PUNE', hour: 6,   dur: 205,  classes: { SL: { price: 180, seats: 600 }, CC: { price: 470, seats: 300 }                                                                            }, total: 900 },
    { num: '12130', name: 'Pragati Express (Return)',         from: 'PUNE', to: 'MMCT', hour: 6,   dur: 195,  classes: { CC: { price: 475, seats: 400 }                                                                                                            }, total: 400 },
    { num: '11020', name: 'Koyna Express (Return)',           from: 'PUNE', to: 'MMCT', hour: 8,   dur: 210,  classes: { SL: { price: 175, seats: 600 }, '3A': { price: 465, seats: 200 }                                                                         }, total: 800 },
    { num: '12126', name: 'Intercity SF Express (Return)',    from: 'PUNE', to: 'MMCT', hour: 11,  dur: 200,  classes: { CC: { price: 490, seats: 400 }, EC: { price: 955, seats: 100 }                                                                            }, total: 500 },
    { num: '12156', name: 'Sinhagad Express (Return)',        from: 'PUNE', to: 'MMCT', hour: 20,  dur: 205,  classes: { SL: { price: 180, seats: 600 }, CC: { price: 470, seats: 300 }                                                                            }, total: 900 },

    // SBC ↔ MMCT  (add 5 each, total 7 each)
    { num: '16529', name: 'Udyan Express',                    from: 'SBC',  to: 'MMCT', hour: 7,   dur: 1380, classes: { SL: { price: 545, seats: 600 }, '3A': { price: 1450, seats: 200 }, '2A': { price: 2085, seats: 100 }                                       }, total: 900 },
    { num: '12177', name: 'Bangalore LTT Express',            from: 'SBC',  to: 'MMCT', hour: 13,  dur: 1350, classes: { SL: { price: 530, seats: 600 }, '3A': { price: 1410, seats: 200 }, '2A': { price: 2030, seats: 100 }                                       }, total: 900 },
    { num: '16211', name: 'Mysore–Mumbai Express',            from: 'SBC',  to: 'MMCT', hour: 17,  dur: 1410, classes: { SL: { price: 510, seats: 600 }, '3A': { price: 1355, seats: 200 }, '2A': { price: 1950, seats: 100 }                                       }, total: 900 },
    { num: '22113', name: 'Kochuveli-LTT SF Exp',             from: 'SBC',  to: 'MMCT', hour: 22,  dur: 1320, classes: { SL: { price: 560, seats: 600 }, '3A': { price: 1490, seats: 200 }, '2A': { price: 2145, seats: 100 }, '1A': { price: 3610, seats: 24 }    }, total: 924 },
    { num: '11007', name: 'Deccan Express',                   from: 'SBC',  to: 'MMCT', hour: 10,  dur: 1440, classes: { SL: { price: 490, seats: 600 }, '3A': { price: 1305, seats: 200 }                                                                         }, total: 900 },
    { num: '16530', name: 'Udyan Express (Return)',           from: 'MMCT', to: 'SBC',  hour: 8,   dur: 1380, classes: { SL: { price: 545, seats: 600 }, '3A': { price: 1450, seats: 200 }, '2A': { price: 2085, seats: 100 }                                       }, total: 900 },
    { num: '12178', name: 'LTT-Bangalore Express',            from: 'MMCT', to: 'SBC',  hour: 14,  dur: 1350, classes: { SL: { price: 530, seats: 600 }, '3A': { price: 1410, seats: 200 }, '2A': { price: 2030, seats: 100 }                                       }, total: 900 },
    { num: '16212', name: 'Mumbai–Mysore Express',            from: 'MMCT', to: 'SBC',  hour: 19,  dur: 1410, classes: { SL: { price: 510, seats: 600 }, '3A': { price: 1355, seats: 200 }, '2A': { price: 1950, seats: 100 }                                       }, total: 900 },
    { num: '22114', name: 'LTT-Kochuveli SF Exp',             from: 'MMCT', to: 'SBC',  hour: 23,  dur: 1320, classes: { SL: { price: 560, seats: 600 }, '3A': { price: 1490, seats: 200 }, '2A': { price: 2145, seats: 100 }, '1A': { price: 3610, seats: 24 }    }, total: 924 },
    { num: '11008', name: 'Deccan Express (Return)',          from: 'MMCT', to: 'SBC',  hour: 11,  dur: 1440, classes: { SL: { price: 490, seats: 600 }, '3A': { price: 1305, seats: 200 }                                                                         }, total: 900 },

    // NDLS ↔ LKO  (add 4 each, total 7)
    { num: '14235', name: 'Vaishali Express',                 from: 'NDLS', to: 'LKO',  hour: 10,  dur: 345,  classes: { SL: { price: 235, seats: 600 }, '3A': { price: 625, seats: 200 }, '2A': { price: 900, seats: 100 }                                        }, total: 900 },
    { num: '12401', name: 'Nandankanan Express',              from: 'NDLS', to: 'LKO',  hour: 14,  dur: 330,  classes: { SL: { price: 230, seats: 600 }, '3A': { price: 610, seats: 200 }, '2A': { price: 880, seats: 100 }                                        }, total: 900 },
    { num: '12225', name: 'Kaifiyaat Express',                from: 'NDLS', to: 'LKO',  hour: 17,  dur: 360,  classes: { SL: { price: 240, seats: 600 }, '3A': { price: 635, seats: 200 }                                                                          }, total: 900 },
    { num: '19037b',name: 'Awadh Express',                    from: 'NDLS', to: 'LKO',  hour: 20,  dur: 390,  classes: { SL: { price: 220, seats: 600 }, '3A': { price: 585, seats: 200 }                                                                          }, total: 900 },
    { num: '14236', name: 'Vaishali Express (Return)',        from: 'LKO',  to: 'NDLS', hour: 6,   dur: 345,  classes: { SL: { price: 235, seats: 600 }, '3A': { price: 625, seats: 200 }, '2A': { price: 900, seats: 100 }                                        }, total: 900 },
    { num: '12402', name: 'Nandankanan Express (Return)',     from: 'LKO',  to: 'NDLS', hour: 11,  dur: 330,  classes: { SL: { price: 230, seats: 600 }, '3A': { price: 610, seats: 200 }, '2A': { price: 880, seats: 100 }                                        }, total: 900 },
    { num: '12226', name: 'Kaifiyaat Express (Return)',       from: 'LKO',  to: 'NDLS', hour: 14,  dur: 360,  classes: { SL: { price: 240, seats: 600 }, '3A': { price: 635, seats: 200 }                                                                          }, total: 900 },
    { num: '19038b',name: 'Awadh Express (Return)',           from: 'LKO',  to: 'NDLS', hour: 22,  dur: 390,  classes: { SL: { price: 220, seats: 600 }, '3A': { price: 585, seats: 200 }                                                                          }, total: 900 },

    // NDLS ↔ AGC  (add 4 each, total 7)
    { num: '12137', name: 'Punjab Mail',                      from: 'NDLS', to: 'AGC',  hour: 10,  dur: 140,  classes: { SL: { price: 120, seats: 600 }, CC: { price: 295, seats: 200 }                                                                            }, total: 800 },
    { num: '22181', name: 'Jabalpur SF Express',              from: 'NDLS', to: 'AGC',  hour: 13,  dur: 130,  classes: { SL: { price: 115, seats: 600 }, CC: { price: 285, seats: 200 }                                                                            }, total: 800 },
    { num: '12627b',name: 'Karnataka Express (Agra)',         from: 'NDLS', to: 'AGC',  hour: 17,  dur: 135,  classes: { SL: { price: 118, seats: 600 }, CC: { price: 290, seats: 200 }                                                                            }, total: 800 },
    { num: '19019', name: 'Dehradun Express (via Agra)',      from: 'NDLS', to: 'AGC',  hour: 22,  dur: 145,  classes: { SL: { price: 112, seats: 600 }, CC: { price: 275, seats: 200 }                                                                            }, total: 800 },
    { num: '12138', name: 'Punjab Mail (Return)',             from: 'AGC',  to: 'NDLS', hour: 6,   dur: 140,  classes: { SL: { price: 120, seats: 600 }, CC: { price: 295, seats: 200 }                                                                            }, total: 800 },
    { num: '22182', name: 'Jabalpur SF Express (Return)',     from: 'AGC',  to: 'NDLS', hour: 9,   dur: 130,  classes: { SL: { price: 115, seats: 600 }, CC: { price: 285, seats: 200 }                                                                            }, total: 800 },
    { num: '12628b',name: 'Karnataka Express (Return)',       from: 'AGC',  to: 'NDLS', hour: 13,  dur: 135,  classes: { SL: { price: 118, seats: 600 }, CC: { price: 290, seats: 200 }                                                                            }, total: 800 },
    { num: '19020', name: 'Dehradun Express (Return)',        from: 'AGC',  to: 'NDLS', hour: 17,  dur: 145,  classes: { SL: { price: 112, seats: 600 }, CC: { price: 275, seats: 200 }                                                                            }, total: 800 },

    // SC ↔ MAS  (add 5 each, total 7 each)
    { num: '12764', name: 'Padmavathi SF Express',            from: 'SC',   to: 'MAS',  hour: 6,   dur: 690,  classes: { SL: { price: 300, seats: 600 }, '3A': { price: 795, seats: 200 }, '2A': { price: 1145, seats: 100 }                                       }, total: 900 },
    { num: '17005', name: 'Hyderabad–Chennai Express',        from: 'SC',   to: 'MAS',  hour: 9,   dur: 720,  classes: { SL: { price: 290, seats: 600 }, '3A': { price: 770, seats: 200 }, '2A': { price: 1110, seats: 100 }                                       }, total: 900 },
    { num: '12721b',name: 'Dakshin SF (Hyd-Chennai)',         from: 'SC',   to: 'MAS',  hour: 20,  dur: 700,  classes: { SL: { price: 305, seats: 600 }, '3A': { price: 810, seats: 200 }, '2A': { price: 1165, seats: 100 }                                       }, total: 900 },
    { num: '22693', name: 'Humsafar Express (Hyd-Mas)',       from: 'SC',   to: 'MAS',  hour: 22,  dur: 675,  classes: {                                  '3A': { price: 875, seats: 200 }, '2A': { price: 1260, seats: 100 }                                       }, total: 300 },
    { num: '17235', name: 'Nellai Express (via SC-MAS)',      from: 'SC',   to: 'MAS',  hour: 12,  dur: 720,  classes: { SL: { price: 295, seats: 600 }, '3A': { price: 785, seats: 200 }                                                                          }, total: 900 },
    { num: '12763', name: 'Padmavathi SF Express (Return)',   from: 'MAS',  to: 'SC',   hour: 7,   dur: 690,  classes: { SL: { price: 300, seats: 600 }, '3A': { price: 795, seats: 200 }, '2A': { price: 1145, seats: 100 }                                       }, total: 900 },
    { num: '17006', name: 'Chennai–Hyderabad Express',        from: 'MAS',  to: 'SC',   hour: 10,  dur: 720,  classes: { SL: { price: 290, seats: 600 }, '3A': { price: 770, seats: 200 }, '2A': { price: 1110, seats: 100 }                                       }, total: 900 },
    { num: '12722b',name: 'Dakshin SF (Chennai-Hyd)',         from: 'MAS',  to: 'SC',   hour: 21,  dur: 700,  classes: { SL: { price: 305, seats: 600 }, '3A': { price: 810, seats: 200 }, '2A': { price: 1165, seats: 100 }                                       }, total: 900 },
    { num: '22694', name: 'Humsafar Express (Mas-Hyd)',       from: 'MAS',  to: 'SC',   hour: 23,  dur: 675,  classes: {                                  '3A': { price: 875, seats: 200 }, '2A': { price: 1260, seats: 100 }                                       }, total: 300 },
    { num: '17236', name: 'Nellai Express (via MAS-SC)',      from: 'MAS',  to: 'SC',   hour: 13,  dur: 720,  classes: { SL: { price: 295, seats: 600 }, '3A': { price: 785, seats: 200 }                                                                          }, total: 900 },

    // NDLS ↔ ADI  (add 5 each, total 7 each)
    { num: '19015', name: 'Saurashtra Express',               from: 'NDLS', to: 'ADI',  hour: 6,   dur: 750,  classes: { SL: { price: 370, seats: 600 }, '3A': { price: 980, seats: 200 }, '2A': { price: 1410, seats: 100 }                                       }, total: 900 },
    { num: '12925', name: 'Paschim Express',                  from: 'NDLS', to: 'ADI',  hour: 11,  dur: 720,  classes: { SL: { price: 360, seats: 600 }, '3A': { price: 955, seats: 200 }, '2A': { price: 1375, seats: 100 }                                       }, total: 900 },
    { num: '22921', name: 'Humsafar Express (Delhi-Ahm)',     from: 'NDLS', to: 'ADI',  hour: 16,  dur: 735,  classes: {                                  '3A': { price: 1040, seats: 200 }, '2A': { price: 1495, seats: 100 }                                      }, total: 300 },
    { num: '12961', name: 'Avantika Express',                 from: 'NDLS', to: 'ADI',  hour: 7,   dur: 750,  classes: { SL: { price: 365, seats: 600 }, '3A': { price: 970, seats: 200 }, '2A': { price: 1395, seats: 100 }                                       }, total: 900 },
    { num: '19413', name: 'Kolkata–Ahmedabad Express',        from: 'NDLS', to: 'ADI',  hour: 22,  dur: 770,  classes: { SL: { price: 375, seats: 600 }, '3A': { price: 995, seats: 200 }, '2A': { price: 1430, seats: 100 }                                       }, total: 900 },
    { num: '19016', name: 'Saurashtra Express (Return)',      from: 'ADI',  to: 'NDLS', hour: 7,   dur: 750,  classes: { SL: { price: 370, seats: 600 }, '3A': { price: 980, seats: 200 }, '2A': { price: 1410, seats: 100 }                                       }, total: 900 },
    { num: '12926', name: 'Paschim Express (Return)',         from: 'ADI',  to: 'NDLS', hour: 12,  dur: 720,  classes: { SL: { price: 360, seats: 600 }, '3A': { price: 955, seats: 200 }, '2A': { price: 1375, seats: 100 }                                       }, total: 900 },
    { num: '22922', name: 'Humsafar Express (Ahm-Delhi)',     from: 'ADI',  to: 'NDLS', hour: 17,  dur: 735,  classes: {                                  '3A': { price: 1040, seats: 200 }, '2A': { price: 1495, seats: 100 }                                      }, total: 300 },
    { num: '12962', name: 'Avantika Express (Return)',        from: 'ADI',  to: 'NDLS', hour: 8,   dur: 750,  classes: { SL: { price: 365, seats: 600 }, '3A': { price: 970, seats: 200 }, '2A': { price: 1395, seats: 100 }                                       }, total: 900 },
    { num: '19414', name: 'Ahmedabad–Kolkata Express',        from: 'ADI',  to: 'NDLS', hour: 23,  dur: 770,  classes: { SL: { price: 375, seats: 600 }, '3A': { price: 995, seats: 200 }, '2A': { price: 1430, seats: 100 }                                       }, total: 900 },

    // PUNE ↔ NDLS  (add 5 each, total 7)
    { num: '12137b',name: 'Jhelum Express',                   from: 'PUNE', to: 'NDLS', hour: 8,   dur: 1080, classes: { SL: { price: 495, seats: 600 }, '3A': { price: 1315, seats: 200 }, '2A': { price: 1895, seats: 100 }                                       }, total: 900 },
    { num: '11077', name: 'Jhelum Express',                   from: 'PUNE', to: 'NDLS', hour: 12,  dur: 1100, classes: { SL: { price: 480, seats: 600 }, '3A': { price: 1275, seats: 200 }, '2A': { price: 1835, seats: 100 }                                       }, total: 900 },
    { num: '22191', name: 'Shraddha Sethu SF Express',        from: 'PUNE', to: 'NDLS', hour: 20,  dur: 1050, classes: { SL: { price: 510, seats: 600 }, '3A': { price: 1355, seats: 200 }, '2A': { price: 1950, seats: 100 }                                       }, total: 900 },
    { num: '12167', name: 'Varanasi SF Express',              from: 'PUNE', to: 'NDLS', hour: 6,   dur: 1080, classes: { SL: { price: 495, seats: 600 }, '3A': { price: 1315, seats: 200 }, '2A': { price: 1895, seats: 100 }                                       }, total: 900 },
    { num: '12147', name: 'Konark Express',                   from: 'PUNE', to: 'NDLS', hour: 22,  dur: 1110, classes: { SL: { price: 470, seats: 600 }, '3A': { price: 1250, seats: 200 }, '2A': { price: 1795, seats: 100 }                                       }, total: 900 },
    { num: '12138b',name: 'Jhelum Express (Return)',          from: 'NDLS', to: 'PUNE', hour: 9,   dur: 1080, classes: { SL: { price: 495, seats: 600 }, '3A': { price: 1315, seats: 200 }, '2A': { price: 1895, seats: 100 }                                       }, total: 900 },
    { num: '11078', name: 'Jhelum Express (Return)',          from: 'NDLS', to: 'PUNE', hour: 13,  dur: 1100, classes: { SL: { price: 480, seats: 600 }, '3A': { price: 1275, seats: 200 }, '2A': { price: 1835, seats: 100 }                                       }, total: 900 },
    { num: '22192', name: 'Shraddha Sethu SF Express (Ret.)', from: 'NDLS', to: 'PUNE', hour: 21,  dur: 1050, classes: { SL: { price: 510, seats: 600 }, '3A': { price: 1355, seats: 200 }, '2A': { price: 1950, seats: 100 }                                       }, total: 900 },
    { num: '12168', name: 'Varanasi SF Express (Return)',     from: 'NDLS', to: 'PUNE', hour: 7,   dur: 1080, classes: { SL: { price: 495, seats: 600 }, '3A': { price: 1315, seats: 200 }, '2A': { price: 1895, seats: 100 }                                       }, total: 900 },
    { num: '12148', name: 'Konark Express (Return)',          from: 'NDLS', to: 'PUNE', hour: 23,  dur: 1110, classes: { SL: { price: 470, seats: 600 }, '3A': { price: 1250, seats: 200 }, '2A': { price: 1795, seats: 100 }                                       }, total: 900 },
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
          status:         'APPROVED',
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

    // Delhi – Manali  (add 5 Delhi→, 7 Manali→)
    { op: 'HRTC',                 type: 'Volvo AC',             from: 'Manali',    to: 'Delhi',      hour: 16, dur: 840, price: 880,  seats: 45, amenities: ['AC', 'Charging Port'] },
    { op: 'Kullu Manali Tours',   type: 'AC Sleeper',           from: 'Manali',    to: 'Delhi',      hour: 15, dur: 810, price: 1080, seats: 36, amenities: ['AC', 'Blanket', 'Charging Port'] },
    { op: 'Himachal Tourism',     type: 'Volvo AC',             from: 'Delhi',     to: 'Manali',     hour: 18, dur: 840, price: 950,  seats: 45, amenities: ['AC', 'WiFi', 'Charging Port'] },
    { op: 'RedBus Partner',       type: 'AC Sleeper',           from: 'Delhi',     to: 'Manali',     hour: 19, dur: 780, price: 1200, seats: 36, amenities: ['AC', 'Blanket', 'Charging Port', 'Water Bottle'] },
    { op: 'Volvo Express',        type: 'Volvo Multi-Axle',     from: 'Delhi',     to: 'Manali',     hour: 20, dur: 800, price: 1350, seats: 40, amenities: ['AC', 'Charging Port', 'WiFi', 'Blanket'] },
    { op: 'HPTDC',                type: 'Non-AC Seater',        from: 'Delhi',     to: 'Manali',     hour: 7,  dur: 900, price: 600,  seats: 50, amenities: ['Charging Port'] },
    { op: 'Shatabdi Tours',       type: 'AC Seater',            from: 'Delhi',     to: 'Manali',     hour: 14, dur: 850, price: 850,  seats: 45, amenities: ['AC', 'WiFi'] },
    { op: 'Himachal Tourism',     type: 'Volvo AC',             from: 'Manali',    to: 'Delhi',      hour: 17, dur: 840, price: 920,  seats: 45, amenities: ['AC', 'WiFi', 'Charging Port'] },
    { op: 'RedBus Partner',       type: 'AC Sleeper',           from: 'Manali',    to: 'Delhi',      hour: 18, dur: 780, price: 1150, seats: 36, amenities: ['AC', 'Blanket', 'Charging Port', 'Water Bottle'] },
    { op: 'Volvo Express',        type: 'Volvo Multi-Axle',     from: 'Manali',    to: 'Delhi',      hour: 19, dur: 800, price: 1300, seats: 40, amenities: ['AC', 'Charging Port', 'WiFi', 'Blanket'] },
    { op: 'HPTDC',                type: 'Non-AC Seater',        from: 'Manali',    to: 'Delhi',      hour: 8,  dur: 900, price: 580,  seats: 50, amenities: ['Charging Port'] },
    { op: 'Shatabdi Tours',       type: 'AC Seater',            from: 'Manali',    to: 'Delhi',      hour: 13, dur: 850, price: 820,  seats: 45, amenities: ['AC', 'WiFi'] },

    // Hyderabad – Chennai  (add 5 each direction)
    { op: 'APSRTC',               type: 'Volvo AC',             from: 'Hyderabad', to: 'Chennai',    hour: 19, dur: 480, price: 700,  seats: 45, amenities: ['AC', 'WiFi'] },
    { op: 'Orange Travels',       type: 'Volvo AC Multi-Axle',  from: 'Hyderabad', to: 'Chennai',    hour: 21, dur: 480, price: 900,  seats: 36, amenities: ['AC', 'Charging Port', 'WiFi', 'Blanket'] },
    { op: 'VRL Travels',          type: 'AC Sleeper',           from: 'Hyderabad', to: 'Chennai',    hour: 22, dur: 480, price: 820,  seats: 40, amenities: ['AC', 'Charging Port', 'Blanket'] },
    { op: 'IntrCity SmartBus',    type: 'Volvo AC',             from: 'Hyderabad', to: 'Chennai',    hour: 23, dur: 470, price: 799,  seats: 30, amenities: ['AC', 'Charging Port', 'Snacks', 'WiFi'] },
    { op: 'TSRTC',                type: 'AC Seater',            from: 'Hyderabad', to: 'Chennai',    hour: 18, dur: 500, price: 620,  seats: 50, amenities: ['AC'] },
    { op: 'APSRTC',               type: 'Volvo AC',             from: 'Chennai',   to: 'Hyderabad',  hour: 20, dur: 480, price: 680,  seats: 45, amenities: ['AC', 'WiFi'] },
    { op: 'SRS Travels',          type: 'AC Sleeper',           from: 'Chennai',   to: 'Hyderabad',  hour: 21, dur: 480, price: 730,  seats: 40, amenities: ['AC', 'Charging Port', 'Blanket'] },
    { op: 'Orange Travels',       type: 'Volvo AC Multi-Axle',  from: 'Chennai',   to: 'Hyderabad',  hour: 22, dur: 480, price: 880,  seats: 36, amenities: ['AC', 'Charging Port', 'WiFi', 'Blanket'] },
    { op: 'VRL Travels',          type: 'AC Sleeper',           from: 'Chennai',   to: 'Hyderabad',  hour: 23, dur: 480, price: 800,  seats: 40, amenities: ['AC', 'Charging Port', 'Blanket'] },
    { op: 'IntrCity SmartBus',    type: 'Volvo AC',             from: 'Chennai',   to: 'Hyderabad',  hour: 19, dur: 470, price: 779,  seats: 30, amenities: ['AC', 'Charging Port', 'Snacks', 'WiFi'] },
    { op: 'TNSTC',                type: 'AC Seater',            from: 'Chennai',   to: 'Hyderabad',  hour: 18, dur: 500, price: 600,  seats: 50, amenities: ['AC'] },

    // Mumbai – Ahmedabad  (add 5 each direction, total 7)
    { op: 'MSRTC',                type: 'Non-AC Seater',        from: 'Mumbai',    to: 'Ahmedabad',  hour: 6,  dur: 435, price: 400,  seats: 55, amenities: [] },
    { op: 'IntrCity SmartBus',    type: 'Volvo AC',             from: 'Mumbai',    to: 'Ahmedabad',  hour: 8,  dur: 420, price: 699,  seats: 30, amenities: ['AC', 'Charging Port', 'Snacks', 'WiFi'] },
    { op: 'Orange Travels',       type: 'Volvo AC Multi-Axle',  from: 'Mumbai',    to: 'Ahmedabad',  hour: 14, dur: 420, price: 850,  seats: 36, amenities: ['AC', 'Charging Port', 'WiFi', 'Blanket'] },
    { op: 'VRL Travels',          type: 'AC Sleeper',           from: 'Mumbai',    to: 'Ahmedabad',  hour: 20, dur: 450, price: 780,  seats: 40, amenities: ['AC', 'Blanket', 'Charging Port'] },
    { op: 'Neeta Travels',        type: 'AC Seater',            from: 'Mumbai',    to: 'Ahmedabad',  hour: 10, dur: 420, price: 650,  seats: 45, amenities: ['AC', 'WiFi'] },
    { op: 'MSRTC',                type: 'Non-AC Seater',        from: 'Ahmedabad', to: 'Mumbai',     hour: 7,  dur: 435, price: 380,  seats: 55, amenities: [] },
    { op: 'IntrCity SmartBus',    type: 'Volvo AC',             from: 'Ahmedabad', to: 'Mumbai',     hour: 9,  dur: 420, price: 679,  seats: 30, amenities: ['AC', 'Charging Port', 'Snacks', 'WiFi'] },
    { op: 'Orange Travels',       type: 'Volvo AC Multi-Axle',  from: 'Ahmedabad', to: 'Mumbai',     hour: 15, dur: 420, price: 830,  seats: 36, amenities: ['AC', 'Charging Port', 'WiFi', 'Blanket'] },
    { op: 'VRL Travels',          type: 'AC Sleeper',           from: 'Ahmedabad', to: 'Mumbai',     hour: 19, dur: 450, price: 760,  seats: 40, amenities: ['AC', 'Blanket', 'Charging Port'] },
    { op: 'Neeta Travels',        type: 'AC Seater',            from: 'Ahmedabad', to: 'Mumbai',     hour: 11, dur: 420, price: 630,  seats: 45, amenities: ['AC', 'WiFi'] },

    // Bangalore – Goa  (add 5 each direction, total 7)
    { op: 'Neeta Travels',        type: 'AC Sleeper',           from: 'Bangalore', to: 'Goa',        hour: 19, dur: 600, price: 900,  seats: 40, amenities: ['AC', 'Blanket', 'Charging Port'] },
    { op: 'Paulo Travels',        type: 'Volvo AC Multi-Axle',  from: 'Bangalore', to: 'Goa',        hour: 21, dur: 570, price: 1050, seats: 36, amenities: ['AC', 'Charging Port', 'WiFi', 'Blanket'] },
    { op: 'KSRTC',                type: 'Volvo AC',             from: 'Bangalore', to: 'Goa',        hour: 18, dur: 600, price: 820,  seats: 45, amenities: ['AC', 'WiFi'] },
    { op: 'SRS Travels',          type: 'AC Sleeper',           from: 'Bangalore', to: 'Goa',        hour: 22, dur: 580, price: 970,  seats: 40, amenities: ['AC', 'Blanket', 'Charging Port', 'Water Bottle'] },
    { op: 'IntrCity SmartBus',    type: 'Volvo AC',             from: 'Bangalore', to: 'Goa',        hour: 20, dur: 590, price: 899,  seats: 30, amenities: ['AC', 'Charging Port', 'Snacks', 'WiFi'] },
    { op: 'VRL Travels',          type: 'AC Sleeper',           from: 'Goa',       to: 'Bangalore',  hour: 20, dur: 600, price: 930,  seats: 40, amenities: ['AC', 'Blanket', 'Charging Port', 'Water Bottle'] },
    { op: 'Kadamba Transport',    type: 'Volvo AC',             from: 'Goa',       to: 'Bangalore',  hour: 21, dur: 570, price: 830,  seats: 45, amenities: ['AC', 'Charging Port'] },
    { op: 'Paulo Travels',        type: 'Volvo AC Multi-Axle',  from: 'Goa',       to: 'Bangalore',  hour: 19, dur: 570, price: 1020, seats: 36, amenities: ['AC', 'Charging Port', 'WiFi', 'Blanket'] },
    { op: 'KSRTC',                type: 'Volvo AC',             from: 'Goa',       to: 'Bangalore',  hour: 18, dur: 600, price: 800,  seats: 45, amenities: ['AC', 'WiFi'] },
    { op: 'Neeta Travels',        type: 'AC Sleeper',           from: 'Goa',       to: 'Bangalore',  hour: 22, dur: 590, price: 880,  seats: 40, amenities: ['AC', 'Blanket', 'Charging Port'] },
    { op: 'IntrCity SmartBus',    type: 'Volvo AC',             from: 'Goa',       to: 'Bangalore',  hour: 20, dur: 580, price: 879,  seats: 30, amenities: ['AC', 'Charging Port', 'Snacks', 'WiFi'] },

    // Pune – Goa  (add 5 each direction, total 7)
    { op: 'MSRTC',                type: 'Non-AC Sleeper',       from: 'Pune',      to: 'Goa',        hour: 20, dur: 480, price: 550,  seats: 45, amenities: ['Charging Port'] },
    { op: 'VRL Travels',          type: 'AC Sleeper',           from: 'Pune',      to: 'Goa',        hour: 19, dur: 450, price: 880,  seats: 40, amenities: ['AC', 'Blanket', 'Charging Port', 'Water Bottle'] },
    { op: 'Kadamba Transport',    type: 'Volvo AC',             from: 'Pune',      to: 'Goa',        hour: 23, dur: 470, price: 780,  seats: 45, amenities: ['AC', 'Charging Port'] },
    { op: 'IntrCity SmartBus',    type: 'Volvo AC',             from: 'Pune',      to: 'Goa',        hour: 21, dur: 465, price: 849,  seats: 30, amenities: ['AC', 'Charging Port', 'Snacks', 'WiFi'] },
    { op: 'Orange Travels',       type: 'Volvo AC Multi-Axle',  from: 'Pune',      to: 'Goa',        hour: 22, dur: 455, price: 1000, seats: 36, amenities: ['AC', 'Charging Port', 'WiFi', 'Blanket'] },
    { op: 'MSRTC',                type: 'Non-AC Sleeper',       from: 'Goa',       to: 'Pune',       hour: 19, dur: 480, price: 530,  seats: 45, amenities: ['Charging Port'] },
    { op: 'Neeta Travels',        type: 'AC Sleeper',           from: 'Goa',       to: 'Pune',       hour: 20, dur: 450, price: 820,  seats: 40, amenities: ['AC', 'Blanket', 'Charging Port'] },
    { op: 'Paulo Travels',        type: 'Volvo AC Multi-Axle',  from: 'Goa',       to: 'Pune',       hour: 21, dur: 455, price: 980,  seats: 36, amenities: ['AC', 'Charging Port', 'WiFi', 'Blanket'] },
    { op: 'VRL Travels',          type: 'AC Sleeper',           from: 'Goa',       to: 'Pune',       hour: 22, dur: 465, price: 860,  seats: 40, amenities: ['AC', 'Blanket', 'Charging Port', 'Water Bottle'] },
    { op: 'Kadamba Transport',    type: 'Volvo AC',             from: 'Goa',       to: 'Pune',       hour: 23, dur: 470, price: 760,  seats: 45, amenities: ['AC', 'Charging Port'] },
    { op: 'IntrCity SmartBus',    type: 'Volvo AC',             from: 'Goa',       to: 'Pune',       hour: 18, dur: 465, price: 829,  seats: 30, amenities: ['AC', 'Charging Port', 'Snacks', 'WiFi'] },

    // Delhi – Chandigarh  (add 5 Delhi→, 6 Chandigarh→, total 7 each)
    { op: 'HRTC',                 type: 'Volvo AC',             from: 'Delhi',     to: 'Chandigarh', hour: 7,  dur: 240, price: 450,  seats: 45, amenities: ['AC', 'WiFi'] },
    { op: 'IntrCity SmartBus',    type: 'Volvo AC',             from: 'Delhi',     to: 'Chandigarh', hour: 10, dur: 255, price: 599,  seats: 30, amenities: ['AC', 'Charging Port', 'Snacks', 'WiFi'] },
    { op: 'PRTC',                 type: 'AC Seater',            from: 'Delhi',     to: 'Chandigarh', hour: 6,  dur: 250, price: 420,  seats: 50, amenities: ['AC'] },
    { op: 'Volvo Express',        type: 'Volvo Multi-Axle',     from: 'Delhi',     to: 'Chandigarh', hour: 8,  dur: 240, price: 650,  seats: 40, amenities: ['AC', 'WiFi', 'Charging Port'] },
    { op: 'HARYANA ROADWAYS',     type: 'Non-AC Seater',        from: 'Delhi',     to: 'Chandigarh', hour: 5,  dur: 270, price: 250,  seats: 55, amenities: [] },
    { op: 'RedBus Partner',       type: 'Volvo AC',             from: 'Delhi',     to: 'Chandigarh', hour: 12, dur: 245, price: 550,  seats: 45, amenities: ['AC', 'Charging Port', 'WiFi'] },
    { op: 'Orange Travels',       type: 'Volvo AC Multi-Axle',  from: 'Delhi',     to: 'Chandigarh', hour: 15, dur: 240, price: 700,  seats: 36, amenities: ['AC', 'Charging Port', 'WiFi', 'Blanket'] },
    { op: 'HRTC',                 type: 'Volvo AC',             from: 'Chandigarh',to: 'Delhi',      hour: 8,  dur: 240, price: 430,  seats: 45, amenities: ['AC', 'WiFi'] },
    { op: 'PRTC',                 type: 'AC Seater',            from: 'Chandigarh',to: 'Delhi',      hour: 7,  dur: 250, price: 400,  seats: 50, amenities: ['AC'] },
    { op: 'IntrCity SmartBus',    type: 'Volvo AC',             from: 'Chandigarh',to: 'Delhi',      hour: 11, dur: 255, price: 579,  seats: 30, amenities: ['AC', 'Charging Port', 'Snacks', 'WiFi'] },
    { op: 'Volvo Express',        type: 'Volvo Multi-Axle',     from: 'Chandigarh',to: 'Delhi',      hour: 9,  dur: 240, price: 630,  seats: 40, amenities: ['AC', 'WiFi', 'Charging Port'] },
    { op: 'HARYANA ROADWAYS',     type: 'Non-AC Seater',        from: 'Chandigarh',to: 'Delhi',      hour: 6,  dur: 270, price: 230,  seats: 55, amenities: [] },
    { op: 'RedBus Partner',       type: 'Volvo AC',             from: 'Chandigarh',to: 'Delhi',      hour: 13, dur: 245, price: 530,  seats: 45, amenities: ['AC', 'Charging Port', 'WiFi'] },
    { op: 'Orange Travels',       type: 'Volvo AC Multi-Axle',  from: 'Chandigarh',to: 'Delhi',      hour: 16, dur: 240, price: 680,  seats: 36, amenities: ['AC', 'Charging Port', 'WiFi', 'Blanket'] },
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
          status:         'APPROVED',
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

// ─── Holiday Packages ─────────────────────────────────────────────────────────

async function seedHolidays() {
  const packages = [

    // ── Goa (6) ────────────────────────────────────────────────────────────────
    {
      title: 'Goa Beach Getaway', city: 'Goa', duration: 4,
      price: 12999, originalPrice: 18999,
      description: 'Sun, sand and sea — the perfect Goa escape with beachside resort stay and island sightseeing.',
      tags: ['Beach', 'Honeymoon', 'Trending'],
      highlights: ['Stay at 4-star beachside resort', 'North & South Goa sightseeing', 'Ferry ride to Divar Island'],
      status: 'APPROVED', isActive: true, images: [],
    },
    {
      title: 'Goa Party & Beach Package', city: 'Goa', duration: 3,
      price: 8999, originalPrice: 13000,
      description: 'Three nights of non-stop fun — beach parties, water sports and Anjuna flea market.',
      tags: ['Beach', 'Adventure', 'Best Seller'],
      highlights: ['Water sports at Baga Beach', 'Anjuna flea market visit', 'Nightlife at Club LPK'],
      status: 'APPROVED', isActive: true, images: [],
    },
    {
      title: 'Goa Honeymoon Special', city: 'Goa', duration: 5,
      price: 22500, originalPrice: 30000,
      description: 'A dreamy honeymoon with candlelit dinners, couple spa and private beach cabana.',
      tags: ['Honeymoon', 'Beach', 'Luxury'],
      highlights: ['Private beach cabana', 'Couple spa session', 'Candlelit sunset dinner cruise'],
      status: 'APPROVED', isActive: true, images: [],
    },
    {
      title: 'Old Goa Heritage & Churches Tour', city: 'Goa', duration: 3,
      price: 7499, originalPrice: 10999,
      description: 'Explore the Portuguese heritage of Old Goa — basilicas, spice plantations and local cuisine.',
      tags: ['Heritage', 'Culture'],
      highlights: ['Basilica of Bom Jesus', 'Spice plantation tour', 'Traditional Goan fish curry lunch'],
      status: 'APPROVED', isActive: true, images: [],
    },
    {
      title: 'South Goa Luxury Retreat', city: 'Goa', duration: 6,
      price: 34000, originalPrice: 45000,
      description: 'Serene South Goa with luxury resort, yoga sessions and pristine private beaches.',
      tags: ['Beach', 'Luxury', 'Wellness'],
      highlights: ['5-star resort in Colva', 'Morning yoga on beach', 'Sunset cruise on Mandovi river'],
      status: 'APPROVED', isActive: true, images: [],
    },
    {
      title: 'Goa Family Fun Package', city: 'Goa', duration: 4,
      price: 15999, originalPrice: 21000,
      description: 'Family-friendly Goa holiday with theme park, water park and guided sightseeing.',
      tags: ['Family', 'Beach'],
      highlights: ['Wonderla water park', 'Dolphin watching boat ride', 'Old Goa churches tour'],
      status: 'APPROVED', isActive: true, images: [],
    },

    // ── Kerala (6) ─────────────────────────────────────────────────────────────
    {
      title: 'Kerala Backwaters & Ayurveda', city: 'Kerala', duration: 6,
      price: 22500, originalPrice: 30000,
      description: 'Houseboat stay in Alleppey, Ayurvedic spa and Munnar tea gardens.',
      tags: ['Nature', 'Wellness', 'Trending'],
      highlights: ['Houseboat stay in Alleppey backwaters', 'Ayurvedic spa & wellness package', 'Munnar tea garden visit'],
      status: 'APPROVED', isActive: true, images: [],
    },
    {
      title: 'Kerala Honeymoon Escape', city: 'Kerala', duration: 7,
      price: 28000, originalPrice: 38000,
      description: 'Romantic Kerala with houseboat, hill station and beach — the perfect honeymoon trail.',
      tags: ['Honeymoon', 'Nature', 'Beach'],
      highlights: ['Deluxe houseboat on Vembanad Lake', 'Tea estate cottage in Munnar', 'Kovalam beach resort'],
      status: 'APPROVED', isActive: true, images: [],
    },
    {
      title: 'God\'s Own Country Explorer', city: 'Kerala', duration: 5,
      price: 18500, originalPrice: 25000,
      description: 'A complete Kerala circuit — Cochin, Munnar, Thekkady and Kovalam.',
      tags: ['Nature', 'Adventure', 'Best Seller'],
      highlights: ['Fort Kochi heritage walk', 'Thekkady wildlife sanctuary', 'Kathakali cultural show'],
      status: 'APPROVED', isActive: true, images: [],
    },
    {
      title: 'Kerala Monsoon Special', city: 'Kerala', duration: 4,
      price: 11499, originalPrice: 18000,
      description: 'Experience Kerala in the lush monsoon season — backwaters, Ayurveda and rain-soaked forests.',
      tags: ['Nature', 'Wellness'],
      highlights: ['Backwater houseboat 1 night', 'Kovalam beach resort', 'Ayurveda rejuvenation session'],
      status: 'APPROVED', isActive: true, images: [],
    },
    {
      title: 'Kerala Wildlife & Tea Trail', city: 'Kerala', duration: 5,
      price: 19999, originalPrice: 26000,
      description: 'Periyar tiger reserve jeep safari, Munnar tea factories and silent valley national park.',
      tags: ['Wildlife', 'Adventure', 'Nature'],
      highlights: ['Periyar tiger reserve jeep safari', 'Tea factory visit in Munnar', 'Silent Valley trekking'],
      status: 'APPROVED', isActive: true, images: [],
    },
    {
      title: 'Kerala Family Package', city: 'Kerala', duration: 6,
      price: 24500, originalPrice: 32000,
      description: 'A wholesome family holiday covering Cochin, Alleppey backwaters and Kovalam beach.',
      tags: ['Family', 'Nature', 'Beach'],
      highlights: ['Chinese fishing nets at Cochin', 'Houseboat with family cabin', 'Lighthouse beach Kovalam'],
      status: 'APPROVED', isActive: true, images: [],
    },

    // ── Manali (6) ─────────────────────────────────────────────────────────────
    {
      title: 'Manali Snow Adventure', city: 'Manali', duration: 5,
      price: 15999, originalPrice: 20000,
      description: 'Solang Valley snow activities, Rohtang Pass and Beas river rafting.',
      tags: ['Adventure', 'Hill Station', 'Trending'],
      highlights: ['Solang Valley snow activities', 'Rohtang Pass day trip', 'Beas river rafting'],
      status: 'APPROVED', isActive: true, images: [],
    },
    {
      title: 'Manali Budget Getaway', city: 'Manali', duration: 4,
      price: 9999, originalPrice: 16000,
      description: 'Affordable Manali trip with snow activities, hotel & breakfast and Hadimba temple.',
      tags: ['Adventure', 'Hill Station'],
      highlights: ['Snow activities at Solang', 'Hotel & breakfast included', 'Hadimba temple visit'],
      status: 'APPROVED', isActive: true, images: [],
    },
    {
      title: 'Manali Honeymoon Package', city: 'Manali', duration: 6,
      price: 21000, originalPrice: 28000,
      description: 'Romantic Manali with snow-capped mountains, cozy cottages and couples activities.',
      tags: ['Honeymoon', 'Hill Station'],
      highlights: ['Snow-capped mountain cottage stay', 'Paragliding session for couple', 'Romantic bonfire dinner'],
      status: 'APPROVED', isActive: true, images: [],
    },
    {
      title: 'Spiti Valley via Manali', city: 'Manali', duration: 8,
      price: 32000, originalPrice: 42000,
      description: 'Epic Spiti Valley road trip via Rohtang — one of India\'s most dramatic high-altitude drives.',
      tags: ['Adventure', 'Hill Station'],
      highlights: ['Rohtang Pass to Kaza highway', 'Tabo monastery & Key monastery', 'Pin Valley National Park'],
      status: 'APPROVED', isActive: true, images: [],
    },
    {
      title: 'Manali Camping & Trek', city: 'Manali', duration: 5,
      price: 13500, originalPrice: 18000,
      description: 'Himalayan camping, Hampta Pass trek and overnight in forest campsites.',
      tags: ['Adventure', 'Hill Station'],
      highlights: ['Hampta Pass trek', 'Forest campsite overnight', 'Apple orchard visit in Naggar'],
      status: 'APPROVED', isActive: true, images: [],
    },
    {
      title: 'Manali Family Winter Escape', city: 'Manali', duration: 5,
      price: 18500, originalPrice: 25000,
      description: 'Family snow trip with activities for kids, warm hotel stays and guided sightseeing.',
      tags: ['Family', 'Hill Station'],
      highlights: ['Snow zorbing for kids at Solang', 'Manu temple & Vashisht hot springs', 'Hot chocolate evenings by bonfire'],
      status: 'APPROVED', isActive: true, images: [],
    },

    // ── Rajasthan (6) ──────────────────────────────────────────────────────────
    {
      title: 'Royal Rajasthan Heritage Tour', city: 'Rajasthan', duration: 7,
      price: 28999, originalPrice: 38000,
      description: 'Jaipur–Jodhpur–Udaipur circuit with palace hotel stays and camel safari.',
      tags: ['Heritage', 'Culture', 'Best Seller'],
      highlights: ['Jaipur–Jodhpur–Udaipur circuit', 'Camel safari in Thar Desert', 'Palace hotel stay experience'],
      status: 'APPROVED', isActive: true, images: [],
    },
    {
      title: 'Rajasthan Flash Sale', city: 'Rajasthan', duration: 5,
      price: 14999, originalPrice: 24000,
      description: 'Limited-time Jaipur & Jodhpur deal with desert camp and all transfers.',
      tags: ['Heritage'],
      highlights: ['Jaipur & Jodhpur sightseeing', 'Desert camp night stay', 'All transfers included'],
      status: 'APPROVED', isActive: true, images: [],
    },
    {
      title: 'Rajasthan Palace Tour', city: 'Rajasthan', duration: 9,
      price: 65000, originalPrice: 85000,
      description: 'Palace hotel stays throughout with private heritage walks and elephant safari.',
      tags: ['Heritage', 'Luxury'],
      highlights: ['Palace hotel stays throughout', 'Private guided heritage walks', 'Elephant safari at Amer Fort'],
      status: 'APPROVED', isActive: true, images: [],
    },
    {
      title: 'Rajasthan Honeymoon Trail', city: 'Rajasthan', duration: 6,
      price: 32000, originalPrice: 42000,
      description: 'Romantic Rajasthan with lake city Udaipur, rose city Pushkar and golden city Jaisalmer.',
      tags: ['Honeymoon', 'Heritage'],
      highlights: ['Boat ride on Lake Pichola', 'Camel safari in Jaisalmer dunes', 'Romantic dinner in Pushkar'],
      status: 'APPROVED', isActive: true, images: [],
    },
    {
      title: 'Jaipur–Pushkar Weekend', city: 'Rajasthan', duration: 3,
      price: 8999, originalPrice: 13000,
      description: 'Short getaway covering the Pink City and the holy Pushkar lake in 3 nights.',
      tags: ['Heritage', 'Spiritual'],
      highlights: ['Amber Fort guided tour', 'Pushkar lake evening ceremony', 'Bazaar shopping in Jaipur'],
      status: 'APPROVED', isActive: true, images: [],
    },
    {
      title: 'Rann of Kutch & Rajasthan', city: 'Rajasthan', duration: 7,
      price: 26000, originalPrice: 35000,
      description: 'White desert of Kutch with traditional folk dance, Rann Utsav tents and Rajasthani forts.',
      tags: ['Heritage', 'Adventure', 'Culture'],
      highlights: ['White Rann tent accommodation', 'Kutch folk dance & handicraft tour', 'Mehrangarh Fort Jodhpur'],
      status: 'APPROVED', isActive: true, images: [],
    },

    // ── Andaman (6) ────────────────────────────────────────────────────────────
    {
      title: 'Andaman Island Escape', city: 'Andaman', duration: 5,
      price: 32000, originalPrice: 42000,
      description: 'Radhanagar Beach, scuba diving and Cellular Jail sound show.',
      tags: ['Beach', 'Adventure', 'New'],
      highlights: ["Radhanagar Beach – Asia's best beach", 'Scuba diving & snorkelling', 'Cellular Jail light & sound show'],
      status: 'APPROVED', isActive: true, images: [],
    },
    {
      title: 'Andaman Luxury Escape', city: 'Andaman', duration: 6,
      price: 52000, originalPrice: 68000,
      description: '5-star resort on Havelock Island with private snorkelling and seaplane experience.',
      tags: ['Beach', 'Luxury'],
      highlights: ['5-star resort on Havelock Island', 'Private snorkelling tour', 'Seaplane experience'],
      status: 'APPROVED', isActive: true, images: [],
    },
    {
      title: 'Andaman Honeymoon Package', city: 'Andaman', duration: 7,
      price: 42000, originalPrice: 56000,
      description: 'Romantic island escape with glass-bottom boat, private beach picnic and night fishing.',
      tags: ['Honeymoon', 'Beach'],
      highlights: ['Glass-bottom boat at Neil Island', 'Private beach picnic', 'Night snorkelling at Elephant Beach'],
      status: 'APPROVED', isActive: true, images: [],
    },
    {
      title: 'Andaman Adventure Dive Trip', city: 'Andaman', duration: 5,
      price: 28000, originalPrice: 37000,
      description: 'Scuba certification, sea walking, kayaking and snorkelling across multiple Andaman islands.',
      tags: ['Adventure', 'Beach'],
      highlights: ['PADI scuba certification', 'Sea walking at North Bay', 'Kayaking at Baratang Island'],
      status: 'APPROVED', isActive: true, images: [],
    },
    {
      title: 'Andaman Family Holiday', city: 'Andaman', duration: 6,
      price: 35000, originalPrice: 46000,
      description: 'Family-friendly Andaman with easy snorkelling, glass-bottom boat and beach activities.',
      tags: ['Family', 'Beach'],
      highlights: ['Snorkelling at Jolly Buoy Island', 'Cellular Jail colonial history tour', 'Water sports at Corbyn Cove'],
      status: 'APPROVED', isActive: true, images: [],
    },
    {
      title: 'Andaman Budget Backpacker', city: 'Andaman', duration: 5,
      price: 18999, originalPrice: 25000,
      description: 'Budget-friendly Andaman on guesthouses, ferry hops and public beach access.',
      tags: ['Beach', 'Adventure'],
      highlights: ['Government ferry across islands', 'Radhanagar Beach sunset', 'Local seafood trail'],
      status: 'APPROVED', isActive: true, images: [],
    },

    // ── Shimla (6) ─────────────────────────────────────────────────────────────
    {
      title: 'Shimla–Manali Honeymoon', city: 'Shimla', duration: 6,
      price: 19999, originalPrice: 26000,
      description: 'Snow-covered Kufri, romantic candlelit dinner and Mall Road strolls.',
      tags: ['Honeymoon', 'Hill Station'],
      highlights: ['Snow-covered Kufri valley stay', 'Romantic candlelit dinner', 'Mall Road & Jakhu Temple visit'],
      status: 'APPROVED', isActive: true, images: [],
    },
    {
      title: 'Shimla Classic Hill Tour', city: 'Shimla', duration: 4,
      price: 11000, originalPrice: 15000,
      description: 'Colonial Shimla with toy train, Ridge, Jakhu Hill and Christ Church.',
      tags: ['Hill Station', 'Heritage'],
      highlights: ['Kalka–Shimla toy train ride', 'Jakhu Hill temple trek', 'Ridge & Scandal Point sightseeing'],
      status: 'APPROVED', isActive: true, images: [],
    },
    {
      title: 'Shimla Winter Snow Package', city: 'Shimla', duration: 5,
      price: 16500, originalPrice: 22000,
      description: 'Experience fresh snowfall at Kufri, skiing and cozy cabin evenings.',
      tags: ['Adventure', 'Hill Station'],
      highlights: ['Skiing at Kufri', 'Snow leopard wildlife park', 'Bonfire nights at Chail'],
      status: 'APPROVED', isActive: true, images: [],
    },
    {
      title: 'Shimla Offbeat Trail', city: 'Shimla', duration: 5,
      price: 13999, originalPrice: 19000,
      description: 'Go beyond the tourist trail — Narkanda, Hatu Peak and Tattapani hot springs.',
      tags: ['Adventure', 'Hill Station'],
      highlights: ['Hatu Peak apple orchards', 'Tattapani hot water springs', 'Narkanda skiing & camping'],
      status: 'APPROVED', isActive: true, images: [],
    },
    {
      title: 'Shimla Family Holiday', city: 'Shimla', duration: 4,
      price: 13500, originalPrice: 18000,
      description: 'Fun family trip with toy train, ice rink and Kufri amusement park.',
      tags: ['Family', 'Hill Station'],
      highlights: ['Toy train Kalka to Shimla', 'Kufri fun world amusement park', 'Himalayan Nature Park'],
      status: 'APPROVED', isActive: true, images: [],
    },
    {
      title: 'Shimla Quick Getaway', city: 'Shimla', duration: 3,
      price: 7999, originalPrice: 11000,
      description: 'Perfect 3-night weekend break with hotel, transfers and guided city tour.',
      tags: ['Hill Station'],
      highlights: ['Heritage walk on Mall Road', 'Chadwick Falls', 'Sunset from Prospect Hill'],
      status: 'APPROVED', isActive: true, images: [],
    },

    // ── Ooty (6) ───────────────────────────────────────────────────────────────
    {
      title: 'Ooty Nilgiri Hills Escape', city: 'Ooty', duration: 4,
      price: 11500, originalPrice: 16000,
      description: 'Tea gardens, toy train and rose garden in the queen of Nilgiri hills.',
      tags: ['Nature', 'Hill Station'],
      highlights: ['Nilgiri Mountain Railway toy train', 'Botanical gardens & rose garden', 'Ooty lake boating'],
      status: 'APPROVED', isActive: true, images: [],
    },
    {
      title: 'Ooty–Kodaikanal Combo', city: 'Ooty', duration: 6,
      price: 17500, originalPrice: 23000,
      description: 'Two gems of Tamil Nadu — Ooty\'s tea estates and Kodaikanal\'s lake and forests.',
      tags: ['Nature', 'Hill Station'],
      highlights: ['Tea factory tour in Ooty', 'Kodaikanal lake paddle boating', 'Pillar Rocks forest trek'],
      status: 'APPROVED', isActive: true, images: [],
    },
    {
      title: 'Ooty Honeymoon Package', city: 'Ooty', duration: 5,
      price: 18000, originalPrice: 24000,
      description: 'Romantic Ooty with foggy mornings, tea garden walks and candlelit cottage stays.',
      tags: ['Honeymoon', 'Nature'],
      highlights: ['Tea estate cottage stay', 'Horse riding at Doddabetta', 'Sunset at Lamb\'s Rock'],
      status: 'APPROVED', isActive: true, images: [],
    },
    {
      title: 'Ooty Adventure & Trekking', city: 'Ooty', duration: 4,
      price: 12000, originalPrice: 16500,
      description: 'Doddabetta peak trek, zip lining and jeep safari through Mudumalai forest.',
      tags: ['Adventure', 'Nature'],
      highlights: ['Doddabetta peak trek', 'Mudumalai wildlife jeep safari', 'Zip lining at Pykara'],
      status: 'APPROVED', isActive: true, images: [],
    },
    {
      title: 'Ooty Family Summer Camp', city: 'Ooty', duration: 4,
      price: 13500, originalPrice: 18000,
      description: 'Family holiday with boating, nature walks and chocolate factory tour.',
      tags: ['Family', 'Nature'],
      highlights: ['Ooty lake & boathouse', 'Home-made chocolate factory visit', 'Emerald Lake nature walk'],
      status: 'APPROVED', isActive: true, images: [],
    },
    {
      title: 'Ooty Budget Weekend', city: 'Ooty', duration: 3,
      price: 6999, originalPrice: 9999,
      description: 'Affordable 3-night Ooty trip with hotel, toy train ride and garden tours.',
      tags: ['Nature', 'Hill Station'],
      highlights: ['Nilgiri toy train', 'Government Botanical Garden', 'Thread Garden — world\'s only handcrafted garden'],
      status: 'APPROVED', isActive: true, images: [],
    },

    // ── Kashmir (6) ────────────────────────────────────────────────────────────
    {
      title: 'Kashmir Great Lakes Trek', city: 'Kashmir', duration: 8,
      price: 45000, originalPrice: 58000,
      description: 'Alpine lakes circuit with camping under stars and expert trekking guide.',
      tags: ['Adventure', 'Hill Station'],
      highlights: ['Alpine lakes circuit', 'Camping under stars', 'Expert trekking guide'],
      status: 'APPROVED', isActive: true, images: [],
    },
    {
      title: 'Kashmir Paradise Holiday', city: 'Kashmir', duration: 6,
      price: 28000, originalPrice: 38000,
      description: 'Dal Lake shikara rides, Mughal gardens, Gulmarg gondola and Pahalgam meadows.',
      tags: ['Hill Station', 'Nature', 'Best Seller'],
      highlights: ['Dal Lake shikara ride', 'Gulmarg gondola phase 1 & 2', 'Pahalgam Betaab Valley visit'],
      status: 'APPROVED', isActive: true, images: [],
    },
    {
      title: 'Kashmir Honeymoon on Dal Lake', city: 'Kashmir', duration: 5,
      price: 32000, originalPrice: 42000,
      description: 'Romantic houseboat on Dal Lake with private shikara, Mughal gardens and Sonamarg.',
      tags: ['Honeymoon', 'Hill Station'],
      highlights: ['Luxury houseboat on Dal Lake', 'Private shikara sunset cruise', 'Sonamarg glacier day trip'],
      status: 'APPROVED', isActive: true, images: [],
    },
    {
      title: 'Kashmir Snow & Ski Package', city: 'Kashmir', duration: 5,
      price: 24000, originalPrice: 32000,
      description: 'Gulmarg skiing, snowboarding and Khilanmarg meadow hike in winter.',
      tags: ['Adventure', 'Hill Station'],
      highlights: ['Gulmarg skiing & snowboarding', 'Khilanmarg meadow hike', 'Ice skating in Gulmarg'],
      status: 'APPROVED', isActive: true, images: [],
    },
    {
      title: 'Leh–Ladakh via Kashmir', city: 'Kashmir', duration: 10,
      price: 52000, originalPrice: 68000,
      description: 'Epic road trip from Srinagar to Leh through Zoji La and Kargil.',
      tags: ['Adventure', 'Hill Station'],
      highlights: ['Srinagar to Leh via Zoji La', 'Pangong Lake reflection drive', 'Magnetic Hill & Gurudwara Pathar Sahib'],
      status: 'APPROVED', isActive: true, images: [],
    },
    {
      title: 'Kashmir Family Summer Holiday', city: 'Kashmir', duration: 6,
      price: 26000, originalPrice: 35000,
      description: 'Perfect family summer holiday with cool weather, apple gardens and cable car rides.',
      tags: ['Family', 'Hill Station'],
      highlights: ['Gulmarg cable car family ride', 'Apple garden visit in Pahalgam', 'Shikara ride on Dal Lake'],
      status: 'APPROVED', isActive: true, images: [],
    },

    // ── Varanasi (6) ───────────────────────────────────────────────────────────
    {
      title: 'Varanasi Spiritual Journey', city: 'Varanasi', duration: 3,
      price: 8500, originalPrice: 12000,
      description: 'Ganga Aarti, boat at sunrise, Sarnath and Kashi Vishwanath temple pilgrimage.',
      tags: ['Spiritual', 'Heritage'],
      highlights: ['Dashashwamedh Ghat Ganga Aarti', 'Sunrise boat ride on the Ganges', 'Sarnath Buddhist circuit'],
      status: 'APPROVED', isActive: true, images: [],
    },
    {
      title: 'Varanasi–Ayodhya–Prayagraj Pilgrimage', city: 'Varanasi', duration: 5,
      price: 13500, originalPrice: 18000,
      description: 'The sacred triangle of Varanasi, Prayagraj Triveni Sangam and Ayodhya Ram Mandir.',
      tags: ['Spiritual', 'Heritage'],
      highlights: ['Prayagraj Triveni Sangam dip', 'Ayodhya Ram Janmabhoomi visit', 'Varanasi evening Aarti'],
      status: 'APPROVED', isActive: true, images: [],
    },
    {
      title: 'Varanasi Heritage & Silk Trail', city: 'Varanasi', duration: 3,
      price: 9000, originalPrice: 13000,
      description: 'Explore the ghats, Banarasi silk weaving workshops and the lanes of old Varanasi.',
      tags: ['Heritage', 'Culture'],
      highlights: ['Banarasi silk weaving workshop', 'Ghats heritage walk at dusk', 'Street food trail on Vishwanath Gali'],
      status: 'APPROVED', isActive: true, images: [],
    },
    {
      title: 'Varanasi Photography Tour', city: 'Varanasi', duration: 4,
      price: 11000, originalPrice: 15000,
      description: 'A photographer\'s dream — golden hour ghats, cremation rituals and chai stalls.',
      tags: ['Culture', 'Heritage'],
      highlights: ['Pre-dawn boat on Ganges', 'Manikarnika Ghat guided tour', 'Rooftop café at Assi Ghat'],
      status: 'APPROVED', isActive: true, images: [],
    },
    {
      title: 'Varanasi Wellness & Yoga Retreat', city: 'Varanasi', duration: 5,
      price: 16000, originalPrice: 21000,
      description: 'Morning yoga on ghats, Ayurveda treatments and meditation by the Ganges.',
      tags: ['Spiritual', 'Wellness'],
      highlights: ['Sunrise yoga at Assi Ghat', 'Ayurvedic massage session', 'Evening meditation by Ganges'],
      status: 'APPROVED', isActive: true, images: [],
    },
    {
      title: 'Varanasi Quick Getaway', city: 'Varanasi', duration: 2,
      price: 5999, originalPrice: 8500,
      description: '2-night quick spiritual trip — Ganga Aarti, ghats and Sarnath in a weekend.',
      tags: ['Spiritual'],
      highlights: ['Ganga Aarti at Dashashwamedh', 'Sarnath Dhamek Stupa', 'Boat ride at dawn'],
      status: 'APPROVED', isActive: true, images: [],
    },

    // ── Coorg (6) ──────────────────────────────────────────────────────────────
    {
      title: 'Coorg Coffee & Waterfalls', city: 'Coorg', duration: 3,
      price: 8999, originalPrice: 13000,
      description: 'Coffee plantation walks, Abbey Falls and misty hills of Kodagu.',
      tags: ['Nature', 'Hill Station'],
      highlights: ['Coffee plantation estate walk', 'Abbey Falls & Irupu Falls', 'Dubare elephant camp'],
      status: 'APPROVED', isActive: true, images: [],
    },
    {
      title: 'Coorg Honeymoon Package', city: 'Coorg', duration: 4,
      price: 14999, originalPrice: 20000,
      description: 'Romantic coffee estate bungalow, misty mornings and private waterfall treks.',
      tags: ['Honeymoon', 'Nature'],
      highlights: ['Luxury coffee estate bungalow', 'Private Abbey Falls trek', 'Sunset at Raja\'s Seat'],
      status: 'APPROVED', isActive: true, images: [],
    },
    {
      title: 'Coorg Adventure & Trekking', city: 'Coorg', duration: 4,
      price: 12000, originalPrice: 16500,
      description: 'Tadiandamol peak trek, white water rafting and zipline over coffee estates.',
      tags: ['Adventure', 'Nature'],
      highlights: ['Tadiandamol peak trek', 'Barapole river rafting', 'Zipline over coffee plantations'],
      status: 'APPROVED', isActive: true, images: [],
    },
    {
      title: 'Coorg & Wayanad Combo', city: 'Coorg', duration: 5,
      price: 17500, originalPrice: 23000,
      description: 'Two lush destinations — Coorg coffee estates and Wayanad wildlife sanctuary.',
      tags: ['Nature', 'Wildlife'],
      highlights: ['Nagarhole wildlife safari', 'Edakkal Caves Wayanad', 'Coffee & spice farm tour'],
      status: 'APPROVED', isActive: true, images: [],
    },
    {
      title: 'Coorg Family Retreat', city: 'Coorg', duration: 3,
      price: 10500, originalPrice: 14500,
      description: 'Family resort amid coffee estates with elephant rides, nature walks and campfire.',
      tags: ['Family', 'Nature'],
      highlights: ['Dubare elephant camp family ride', 'Irupu Falls nature walk', 'Campfire & barbeque evening'],
      status: 'APPROVED', isActive: true, images: [],
    },
    {
      title: 'Coorg Weekend Getaway', city: 'Coorg', duration: 2,
      price: 5999, originalPrice: 8500,
      description: 'Quick 2-night escape to Coorg — fresh coffee, misty hills and warm hospitality.',
      tags: ['Nature'],
      highlights: ['Estate-fresh filter coffee experience', 'Mandalpatti viewpoint', 'Bylakuppe Tibetan monastery'],
      status: 'APPROVED', isActive: true, images: [],
    },

    // ── Rishikesh (6) ──────────────────────────────────────────────────────────
    {
      title: 'Rishikesh Yoga & Rafting', city: 'Rishikesh', duration: 4,
      price: 10500, originalPrice: 15000,
      description: 'White-water rafting on Ganges, morning yoga and evening Ganga Aarti.',
      tags: ['Adventure', 'Spiritual', 'Wellness'],
      highlights: ['Grade 3–4 rapids rafting', 'Sunrise yoga at Parmarth Niketan', 'Ganga Aarti at Triveni Ghat'],
      status: 'APPROVED', isActive: true, images: [],
    },
    {
      title: 'Rishikesh Adventure Sports Camp', city: 'Rishikesh', duration: 3,
      price: 8500, originalPrice: 12000,
      description: 'Bungee jumping, cliff jumping, kayaking and camping on the banks of Ganges.',
      tags: ['Adventure'],
      highlights: ['83m bungee jump at Mohan Chatti', 'Kayaking on Ganges', 'Lakshman Jhula sunset walk'],
      status: 'APPROVED', isActive: true, images: [],
    },
    {
      title: 'Rishikesh Yoga Retreat', city: 'Rishikesh', duration: 5,
      price: 15000, originalPrice: 20000,
      description: '5-day yoga immersion — daily asanas, pranayama, meditation and Ayurveda.',
      tags: ['Spiritual', 'Wellness'],
      highlights: ['Daily yoga & meditation sessions', 'Ayurvedic massage & treatments', 'Ashram-style sattvic meals'],
      status: 'APPROVED', isActive: true, images: [],
    },
    {
      title: 'Rishikesh–Haridwar Spiritual Circuit', city: 'Rishikesh', duration: 4,
      price: 9999, originalPrice: 14000,
      description: 'Har Ki Pauri Haridwar, Rishikesh ashrams and Neelkanth Mahadev temple.',
      tags: ['Spiritual', 'Heritage'],
      highlights: ['Haridwar Har Ki Pauri Ganga Aarti', 'Neelkanth Mahadev temple trek', 'Beatles Ashram Rishikesh'],
      status: 'APPROVED', isActive: true, images: [],
    },
    {
      title: 'Rishikesh Camping Experience', city: 'Rishikesh', duration: 3,
      price: 7500, originalPrice: 10500,
      description: 'Riverside camping with bonfire, stargazing, morning yoga and Ganga dip.',
      tags: ['Adventure', 'Nature'],
      highlights: ['Riverside tent camping', 'Bonfire & barbecue night', 'Morning Ganges holy dip'],
      status: 'APPROVED', isActive: true, images: [],
    },
    {
      title: 'Rishikesh Family & Kids Holiday', city: 'Rishikesh', duration: 4,
      price: 13000, originalPrice: 17500,
      description: 'Safe family adventure with junior rafting, nature trails and devotional ashram visit.',
      tags: ['Family', 'Adventure'],
      highlights: ['Junior rafting on Grade 1–2 rapids', 'Vashishtha Cave guided visit', 'Evening Ganga Aarti ceremony'],
      status: 'APPROVED', isActive: true, images: [],
    },

    // ── Udaipur (6) ────────────────────────────────────────────────────────────
    {
      title: 'Udaipur City of Lakes Romance', city: 'Udaipur', duration: 4,
      price: 14999, originalPrice: 20000,
      description: 'Boat ride on Lake Pichola, City Palace and Monsoon Palace at sunset.',
      tags: ['Heritage', 'Honeymoon'],
      highlights: ['Lake Pichola sunset boat ride', 'City Palace guided tour', 'Sajjangarh Monsoon Palace'],
      status: 'APPROVED', isActive: true, images: [],
    },
    {
      title: 'Udaipur Honeymoon Package', city: 'Udaipur', duration: 5,
      price: 22000, originalPrice: 30000,
      description: 'Romantic lakeside hotel, private boat dinner and heritage palace walks.',
      tags: ['Honeymoon', 'Heritage'],
      highlights: ['Lake Pichola luxury hotel', 'Private floating restaurant dinner', 'Vintage car heritage tour'],
      status: 'APPROVED', isActive: true, images: [],
    },
    {
      title: 'Udaipur–Chittorgarh Heritage Tour', city: 'Udaipur', duration: 5,
      price: 16500, originalPrice: 22000,
      description: 'Royal Rajput heritage — Chittorgarh fort, Kumbhalgarh wall and Udaipur palaces.',
      tags: ['Heritage', 'Culture'],
      highlights: ['Chittorgarh Fort illumination tour', 'Kumbhalgarh wall & fort', 'Eklingji & Nathdwara temples'],
      status: 'APPROVED', isActive: true, images: [],
    },
    {
      title: 'Udaipur Weekend City Break', city: 'Udaipur', duration: 3,
      price: 8500, originalPrice: 12000,
      description: '3-night Udaipur city break with lake, palace and bazaar highlights.',
      tags: ['Heritage'],
      highlights: ['City Palace museum', 'Fateh Sagar Lake walk', 'Hathipole bazaar shopping'],
      status: 'APPROVED', isActive: true, images: [],
    },
    {
      title: 'Udaipur Rajasthani Art & Craft Tour', city: 'Udaipur', duration: 4,
      price: 12000, originalPrice: 16500,
      description: 'Miniature painting workshop, blue pottery studio and Shilpgram folk arts village.',
      tags: ['Culture', 'Heritage'],
      highlights: ['Miniature painting workshop', 'Blue pottery studio visit', 'Shilpgram folk dance show'],
      status: 'APPROVED', isActive: true, images: [],
    },
    {
      title: 'Udaipur Family & Nature Retreat', city: 'Udaipur', duration: 5,
      price: 18000, originalPrice: 24000,
      description: 'Family holiday with wildlife safari, lakes, temples and Mewar folk culture.',
      tags: ['Family', 'Heritage', 'Wildlife'],
      highlights: ['Sajjangarh Biological Park safari', 'Boat ride on Lake Fateh Sagar', 'Puppet show & folk dinner'],
      status: 'APPROVED', isActive: true, images: [],
    },

    // ── 7th packages (one more per destination) ───────────────────────────────
    {
      title: 'Goa Carnival & Culture Special', city: 'Goa', duration: 3,
      price: 9999, originalPrice: 14500,
      description: 'Immerse in the vibrant Goa Carnival spirit with cultural shows, local cuisine trail and sunset cruise.',
      tags: ['Culture', 'Beach'],
      highlights: ['Goa Carnival parade experience', 'Authentic Goan xacuti cooking class', 'Mandovi river sunset cruise'],
      status: 'APPROVED', isActive: true, images: [],
    },
    {
      title: 'Kerala Spice Route & Kochi Art Trail', city: 'Kerala', duration: 4,
      price: 14500, originalPrice: 19500,
      description: 'Fort Kochi Jewish Synagogue, spice market tour, Kochi biennale art galleries and Kathakali show.',
      tags: ['Culture', 'Heritage'],
      highlights: ['Jewish Synagogue & spice market', 'Kochi art biennale galleries', 'Kathakali & Mohiniyattam show'],
      status: 'APPROVED', isActive: true, images: [],
    },
    {
      title: 'Manali to Kasol Parvati Valley Trek', city: 'Manali', duration: 6,
      price: 17000, originalPrice: 23000,
      description: 'Trek through Parvati Valley — Kasol, Kheerganga hot springs and Malana village.',
      tags: ['Adventure', 'Hill Station', 'Trending'],
      highlights: ['Kheerganga hot spring overnight trek', 'Malana village cultural tour', 'Chalal forest campsite'],
      status: 'APPROVED', isActive: true, images: [],
    },
    {
      title: 'Rajasthan Desert Night Safari', city: 'Rajasthan', duration: 4,
      price: 13500, originalPrice: 18000,
      description: 'Jaisalmer golden fort, sand dune night safari with bonfire, folk dance and stargazing.',
      tags: ['Adventure', 'Heritage', 'Culture'],
      highlights: ['Jaisalmer fort guided heritage walk', 'Sand dune sunset camel safari', 'Desert bonfire with folk performance'],
      status: 'APPROVED', isActive: true, images: [],
    },
    {
      title: 'Andaman Water Sports Bonanza', city: 'Andaman', duration: 4,
      price: 22000, originalPrice: 30000,
      description: 'Parasailing, jet skiing, sea walking and kayaking on pristine Andaman waters.',
      tags: ['Adventure', 'Beach'],
      highlights: ['Parasailing over North Bay Island', 'Jet skiing at Corbyn Cove', 'Sea walking at North Bay'],
      status: 'APPROVED', isActive: true, images: [],
    },
    {
      title: 'Shimla & Kasauli Weekend Escape', city: 'Shimla', duration: 4,
      price: 10500, originalPrice: 14500,
      description: 'Charming colonial hill towns — Shimla Mall Road, Kasauli Monkey Point and Lawrence School.',
      tags: ['Hill Station', 'Heritage'],
      highlights: ['Kasauli Monkey Point sunrise', 'Lawrence School heritage campus', 'Shimla Vice-Regal Lodge walk'],
      status: 'APPROVED', isActive: true, images: [],
    },
    {
      title: 'Ooty Tea Blossom & Chocolate Trail', city: 'Ooty', duration: 3,
      price: 8500, originalPrice: 12000,
      description: 'Tea blossom season in Ooty — live plucking experience, artisan chocolate workshop and cider tasting.',
      tags: ['Nature', 'Culture'],
      highlights: ['Tea blossom plucking at GFOP estate', 'Artisan chocolate-making workshop', 'Ooty homebrew cider tasting'],
      status: 'APPROVED', isActive: true, images: [],
    },
    {
      title: 'Kashmir Mughal Gardens & Saffron Trail', city: 'Kashmir', duration: 4,
      price: 18500, originalPrice: 25000,
      description: 'Nishat Bagh, Shalimar Bagh, Pampore saffron fields and wullar lake birding.',
      tags: ['Heritage', 'Nature'],
      highlights: ['Mughal gardens Nishat & Shalimar', 'Pampore saffron fields walk', 'Wullar lake bird watching'],
      status: 'APPROVED', isActive: true, images: [],
    },
    {
      title: 'Varanasi–Bodhgaya Buddhist Circuit', city: 'Varanasi', duration: 5,
      price: 15000, originalPrice: 20000,
      description: 'Walk in the footsteps of Buddha — Sarnath deer park, Bodhgaya Mahabodhi temple and Nalanda.',
      tags: ['Spiritual', 'Heritage'],
      highlights: ['Sarnath Dhamek Stupa & deer park', 'Bodhgaya Mahabodhi Temple darshan', 'Nalanda ruins heritage tour'],
      status: 'APPROVED', isActive: true, images: [],
    },
    {
      title: 'Coorg Monsoon Magic', city: 'Coorg', duration: 3,
      price: 7999, originalPrice: 11500,
      description: 'Coorg in full monsoon bloom — misty hills, waterfalls at their peak and cozy estate bungalows.',
      tags: ['Nature', 'Wellness'],
      highlights: ['Abbey Falls at peak monsoon flow', 'Rain walk through coffee estates', 'Cozy estate fireplace evenings'],
      status: 'APPROVED', isActive: true, images: [],
    },
    {
      title: 'Rishikesh – Jim Corbett Wildlife & Yoga', city: 'Rishikesh', duration: 5,
      price: 17000, originalPrice: 23000,
      description: 'Yoga retreat in Rishikesh followed by jeep safari at Jim Corbett National Park.',
      tags: ['Wildlife', 'Adventure', 'Wellness'],
      highlights: ['Jim Corbett tiger jeep safari', 'Morning yoga at Ganges ashram', 'Garjiya Devi temple forest walk'],
      status: 'APPROVED', isActive: true, images: [],
    },
    {
      title: 'Udaipur Vintage Mewar Experience', city: 'Udaipur', duration: 4,
      price: 16000, originalPrice: 22000,
      description: 'Step into royal Mewar — vintage car parade, Mewar sound & light show and royal cuisine dinner.',
      tags: ['Heritage', 'Culture', 'Luxury'],
      highlights: ['Mewar Festival vintage car rally', 'City Palace sound & light show', 'Royal Rajput thali dinner experience'],
      status: 'APPROVED', isActive: true, images: [],
    },
  ]

  const created = []
  for (const pkg of packages) {
    const p = await prisma.holidayPackage.create({ data: pkg })
    created.push(p)
  }
  console.log(`  ✓ ${created.length} holiday packages (${created.length / 12} per destination × 12 destinations)`)
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
  await prisma.holidayPackage.deleteMany()
  console.log('  ✓ Cleared travel data\n')

  await seedFlights()
  const hotels = await seedHotels()
  await seedTrains()
  await seedBuses()
  await seedCabs()
  await seedHolidays()
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
