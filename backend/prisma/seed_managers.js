require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const hash = (pw) => bcrypt.hashSync(pw, 12)
  const managers = [
    { name: 'Flight Manager',  email: 'flight_manager@goibibo.com',  password: hash('Manager@1234'), role: 'MANAGER', managerModule: 'FLIGHTS',  phone: '9000000010' },
    { name: 'Hotel Manager',   email: 'hotel_manager@goibibo.com',   password: hash('Manager@1234'), role: 'MANAGER', managerModule: 'HOTELS',   phone: '9000000011' },
    { name: 'Train Manager',   email: 'train_manager@goibibo.com',   password: hash('Manager@1234'), role: 'MANAGER', managerModule: 'TRAINS',   phone: '9000000012' },
    { name: 'Bus Manager',     email: 'bus_manager@goibibo.com',     password: hash('Manager@1234'), role: 'MANAGER', managerModule: 'BUSES',    phone: '9000000013' },
    { name: 'Holiday Manager', email: 'holiday_manager@goibibo.com', password: hash('Manager@1234'), role: 'MANAGER', managerModule: 'HOLIDAYS', phone: '9000000014' },
    { name: 'Car Manager',     email: 'car_manager@goibibo.com',     password: hash('Manager@1234'), role: 'MANAGER', managerModule: 'CARS',     phone: '9000000015' },
  ]

  for (const u of managers) {
    const result = await prisma.user.upsert({ where: { email: u.email }, update: {}, create: u })
    console.log('  upserted:', result.email, '| module:', result.managerModule)
  }

  console.log('Done.')
}

main().catch((e) => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
