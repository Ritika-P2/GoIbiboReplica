require('dotenv').config()
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const OFFERS = [
  // ── FLIGHTS ────────────────────────────────────────────────────────────────
  {
    offerCode: 'FLYSMART30',
    title: 'Fly Smart, Save Big',
    category: 'FLIGHTS',
    description: 'Get up to 30% off on select domestic routes. Perfect for frequent flyers who want to travel smarter and save more on every trip.',
    discountPercent: 30,
    maxDiscountAmount: 3000,
    validFrom: new Date('2026-06-01'),
    validTo: new Date('2026-08-31'),
    termsConditions: 'Valid on one-way domestic flights only. Minimum booking amount ₹4,000. Not combinable with other offers. Applicable on Economy and Premium Economy fares only. Valid for bookings made at least 7 days in advance.',
    emoji: '✈️',
    color: 'from-orange-400 to-red-400',
  },
  {
    offerCode: 'SUMMER25FLY',
    title: 'Summer Flight Discount',
    category: 'FLIGHTS',
    description: 'Beat the summer heat with cool savings! Enjoy 25% off on flights to popular hill stations and coastal destinations this season.',
    discountPercent: 25,
    maxDiscountAmount: 2500,
    validFrom: new Date('2026-06-01'),
    validTo: new Date('2026-07-31'),
    termsConditions: 'Applicable on select routes to Manali, Shimla, Goa, and Kerala. Minimum 1 adult passenger. Cannot be combined with senior citizen or student fares. Valid on weekend departures only.',
    emoji: '🌞',
    color: 'from-yellow-400 to-orange-400',
  },
  {
    offerCode: 'INTLFLY20',
    title: 'International Flight Offer',
    category: 'FLIGHTS',
    description: 'Explore the world for less! Save 20% on international flights to 50+ destinations across Asia, Europe, and the Middle East.',
    discountPercent: 20,
    maxDiscountAmount: 5000,
    validFrom: new Date('2026-06-01'),
    validTo: new Date('2026-09-30'),
    termsConditions: 'Valid on Economy class international bookings above ₹20,000. Taxes and surcharges not included. Seats are limited. Offer subject to availability. Advance booking of 14 days required.',
    emoji: '🌍',
    color: 'from-blue-500 to-indigo-500',
  },
  {
    offerCode: 'EARLYBIRD15',
    title: 'Early Bird Flight Deal',
    category: 'FLIGHTS',
    description: 'Plan ahead and save more. Book your flight 30 days in advance and get a flat 15% discount — more time to plan, more money saved!',
    discountPercent: 15,
    maxDiscountAmount: 1500,
    validFrom: new Date('2026-06-01'),
    validTo: new Date('2026-12-31'),
    termsConditions: 'Booking must be made at least 30 days before departure. Valid on all domestic routes. Discount applied at checkout. Non-refundable fare. Rescheduling allowed with a nominal fee.',
    emoji: '🐦',
    color: 'from-teal-400 to-cyan-400',
  },

  // ── HOTELS ─────────────────────────────────────────────────────────────────
  {
    offerCode: 'HOTELDEALS40',
    title: 'Hotel Deals',
    category: 'HOTELS',
    description: 'Save up to 40% on handpicked hotels across India. From budget stays to luxury resorts, find the perfect place at unbeatable prices.',
    discountPercent: 40,
    maxDiscountAmount: 4000,
    validFrom: new Date('2026-06-01'),
    validTo: new Date('2026-08-31'),
    termsConditions: 'Valid on minimum 2-night stays. Not applicable on already-discounted rates. Check-in between Sunday and Thursday for maximum savings. Applicable only on pre-paid bookings.',
    emoji: '🏨',
    color: 'from-purple-500 to-indigo-500',
  },
  {
    offerCode: 'WEEKEND35',
    title: 'Weekend Stay Offer',
    category: 'HOTELS',
    description: 'Make your weekends memorable! Get 35% off on hotel bookings for Friday and Saturday nights. Ideal for a quick city getaway or family trip.',
    discountPercent: 35,
    maxDiscountAmount: 3500,
    validFrom: new Date('2026-06-01'),
    validTo: new Date('2026-07-31'),
    termsConditions: 'Applicable on check-ins on Fridays or Saturdays only. Minimum 1-night stay. Valid on 3-star hotels and above. Cannot be combined with loyalty points redemption.',
    emoji: '🌙',
    color: 'from-violet-500 to-purple-600',
  },
  {
    offerCode: 'LUXCASH20',
    title: 'Luxury Hotel Cashback',
    category: 'HOTELS',
    description: 'Stay in style and earn back! Book any 5-star hotel and get 20% cashback credited to your GoWallet within 24 hours of check-out.',
    discountPercent: 20,
    maxDiscountAmount: 6000,
    validFrom: new Date('2026-06-01'),
    validTo: new Date('2026-09-30'),
    termsConditions: 'Applicable on 5-star properties only. Cashback credited as GoWallet credits within 24 hours of check-out. Minimum booking value ₹8,000 per night. Valid once per user per month.',
    emoji: '💎',
    color: 'from-amber-400 to-yellow-500',
  },
  {
    offerCode: 'STAYMORE10',
    title: 'Stay More, Save More',
    category: 'HOTELS',
    description: 'The longer you stay, the more you save! Book 5 nights or more and enjoy an additional 10% off on top of existing hotel prices.',
    discountPercent: 10,
    maxDiscountAmount: 2000,
    validFrom: new Date('2026-06-01'),
    validTo: new Date('2026-12-31'),
    termsConditions: 'Minimum 5-night stay required. Applicable on any hotel category. Combined savings can be up to 50% with hotel base discounts. Valid for solo, couple, and family bookings.',
    emoji: '🛏️',
    color: 'from-emerald-400 to-teal-500',
  },

  // ── TRAINS ─────────────────────────────────────────────────────────────────
  {
    offerCode: 'TRAINOFF15',
    title: 'Train Offers',
    category: 'TRAINS',
    description: 'Enjoy 15% off on sleeper and AC class bookings. Travel across India comfortably and affordably with our exclusive train offers.',
    discountPercent: 15,
    maxDiscountAmount: 800,
    validFrom: new Date('2026-06-01'),
    validTo: new Date('2026-08-31'),
    termsConditions: 'Valid on 2AC, 3AC, and Sleeper classes. Applicable on trains departing from major junctions only. Offer limited to 2 tickets per PNR. Subject to seat availability.',
    emoji: '🚂',
    color: 'from-green-400 to-teal-400',
  },
  {
    offerCode: 'TATKAL200',
    title: 'Tatkal Cashback',
    category: 'TRAINS',
    description: 'Need to travel urgently? Book Tatkal tickets and get ₹200 cashback on every booking. Quick bookings just got more rewarding!',
    discountPercent: 10,
    maxDiscountAmount: 200,
    validFrom: new Date('2026-06-01'),
    validTo: new Date('2026-07-31'),
    termsConditions: 'Applicable on Tatkal quota bookings only. Cashback credited within 3 business days. Valid once per user per week. Not valid on Premium Tatkal tickets.',
    emoji: '⚡',
    color: 'from-yellow-500 to-amber-500',
  },
  {
    offerCode: 'FESTTRAIN20',
    title: 'Festival Travel Offer',
    category: 'TRAINS',
    description: 'Travel home for the festivities without breaking the bank. Get 20% off on all train bookings during festival seasons.',
    discountPercent: 20,
    maxDiscountAmount: 1000,
    validFrom: new Date('2026-06-01'),
    validTo: new Date('2026-12-31'),
    termsConditions: 'Valid during designated festival travel windows. Applicable on all train classes. Maximum 6 tickets per booking. Book early as seats fill up fast during festival season.',
    emoji: '🎉',
    color: 'from-red-400 to-pink-500',
  },

  // ── BUS ────────────────────────────────────────────────────────────────────
  {
    offerCode: 'BUSFLAT150',
    title: 'Bus Cashback',
    category: 'BUS',
    description: 'Flat ₹150 off on all bus ticket bookings. Travel comfortably on AC sleeper and semi-sleeper buses at the best rates.',
    discountPercent: 15,
    maxDiscountAmount: 150,
    validFrom: new Date('2026-06-01'),
    validTo: new Date('2026-08-31'),
    termsConditions: 'Minimum booking amount ₹500. Valid on AC Sleeper and AC Semi-Sleeper buses only. Applicable once per user per day. Not valid on budget or non-AC buses.',
    emoji: '🚌',
    color: 'from-blue-400 to-cyan-400',
  },
  {
    offerCode: 'WEEKENDBUS25',
    title: 'Weekend Bus Discount',
    category: 'BUS',
    description: 'Weekend travel made affordable! Book any bus ticket for Friday, Saturday, or Sunday departure and get 25% off your fare.',
    discountPercent: 25,
    maxDiscountAmount: 300,
    validFrom: new Date('2026-06-01'),
    validTo: new Date('2026-07-31'),
    termsConditions: 'Valid for journeys departing on Friday, Saturday, or Sunday. Applicable on Volvo, AC Sleeper, and AC Seater buses. Cannot be combined with other promotional codes.',
    emoji: '🎒',
    color: 'from-sky-400 to-blue-500',
  },
  {
    offerCode: 'EARLYBUS10',
    title: 'Early Booking Bus Offer',
    category: 'BUS',
    description: 'Book your bus 7 days in advance and save 10% on your total fare. Early birds get the best seats and the best prices!',
    discountPercent: 10,
    maxDiscountAmount: 200,
    validFrom: new Date('2026-06-01'),
    validTo: new Date('2026-12-31'),
    termsConditions: 'Booking must be made at least 7 days before journey date. Valid on all bus operators and routes. Discount applied automatically. Cancellation charges apply as per operator policy.',
    emoji: '🕐',
    color: 'from-cyan-400 to-teal-500',
  },

  // ── BANK OFFERS ────────────────────────────────────────────────────────────
  {
    offerCode: 'HDFC10PCT',
    title: 'HDFC Bank Offer',
    category: 'BANK',
    description: 'Exclusive for HDFC credit and debit card holders! Get 10% instant discount on flights, hotels, and holiday packages booked on Goibibo.',
    discountPercent: 10,
    maxDiscountAmount: 2000,
    validFrom: new Date('2026-06-01'),
    validTo: new Date('2026-09-30'),
    termsConditions: 'Valid only on HDFC credit and debit card transactions. Minimum transaction amount ₹5,000. Maximum discount ₹2,000 per transaction. Applicable twice per card per month. Offer valid on Goibibo app and website.',
    emoji: '🏦',
    color: 'from-slate-600 to-gray-700',
  },
  {
    offerCode: 'ICICICASH500',
    title: 'ICICI Cashback Offer',
    category: 'BANK',
    description: 'Pay with ICICI Bank credit card and earn ₹500 cashback on every travel booking above ₹8,000. More you pay, more you save!',
    discountPercent: 8,
    maxDiscountAmount: 500,
    validFrom: new Date('2026-06-01'),
    validTo: new Date('2026-08-31'),
    termsConditions: 'Applicable on ICICI Bank credit cards only. Minimum transaction ₹8,000. Cashback credited within 7 working days. Valid once per credit card per month. Not valid on EMI transactions.',
    emoji: '💳',
    color: 'from-orange-500 to-red-500',
  },
  {
    offerCode: 'SBI200OFF',
    title: 'SBI Instant Discount',
    category: 'BANK',
    description: 'SBI card holders get ₹200 instant discount on all travel bookings. No minimum booking required. Just pay with your SBI card and save!',
    discountPercent: 5,
    maxDiscountAmount: 200,
    validFrom: new Date('2026-06-01'),
    validTo: new Date('2026-12-31'),
    termsConditions: 'Valid on all SBI credit and debit card transactions. No minimum booking value required. Discount applied at the payment screen. Applicable 3 times per card per month. Cannot be clubbed with other bank offers.',
    emoji: '🏛️',
    color: 'from-blue-600 to-indigo-700',
  },
  {
    offerCode: 'AXIS15TRAVEL',
    title: 'Axis Bank Travel Rewards',
    category: 'BANK',
    description: 'Axis Bank credit cardholders earn 5X reward points + 15% instant discount on flight and hotel bookings. Double the benefits, double the joy!',
    discountPercent: 15,
    maxDiscountAmount: 3000,
    validFrom: new Date('2026-06-01'),
    validTo: new Date('2026-09-30'),
    termsConditions: 'Valid on Axis Bank Miles & More and Vistara credit cards. Minimum booking ₹10,000. 5X reward points on all eligible transactions. Discount not applicable on taxes and service fees. Valid once per card per week.',
    emoji: '⭐',
    color: 'from-violet-600 to-purple-700',
  },
]

async function seedOffers() {
  console.log('Seeding offers...')
  let created = 0
  for (const offer of OFFERS) {
    await prisma.offer.upsert({
      where: { offerCode: offer.offerCode },
      update: {},
      create: { ...offer, isActive: true },
    })
    created++
  }
  console.log(`  ✓ ${created} offers seeded`)
}

async function main() {
  try {
    await seedOffers()
    console.log('Offers seeded successfully.')
  } catch (err) {
    console.error('Error seeding offers:', err)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
