import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../constants/routes'

const sections = [
  {
    title: '1. Acceptance of Terms',
    text: 'By accessing or using the Goibibo platform (website, mobile app, or any related services), you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this platform.',
  },
  {
    title: '2. Use of the Platform',
    items: [
      'You must be at least 18 years of age to create an account or make a booking.',
      'You are responsible for maintaining the confidentiality of your account credentials.',
      'You agree to provide accurate, current, and complete information during registration and for all bookings.',
      'You must not use the platform for any unlawful purpose or in a way that violates these terms.',
      'Automated scraping, crawling, or data extraction without written consent is strictly prohibited.',
      'Reselling or commercial redistribution of travel inventory obtained through Goibibo is not permitted.',
    ],
  },
  {
    title: '3. Bookings and Payments',
    items: [
      'All bookings are subject to availability and confirmation by the respective travel supplier (airline, hotel, train operator, etc.).',
      'Prices displayed are inclusive of taxes and fees unless stated otherwise.',
      'Payment must be completed at the time of booking. Reservations are not held without payment.',
      'A booking is confirmed only after you receive a confirmation email with a booking ID.',
      'Goibibo acts as an intermediary between you and travel suppliers. The contract of carriage or accommodation is between you and the supplier.',
      'Dynamic pricing means fares can change in real-time. The price is locked only upon successful payment.',
    ],
  },
  {
    title: '4. Cancellations and Refunds',
    text: 'Cancellation and refund policies vary by booking type and supplier. Please refer to our Cancellation Policy page for detailed information. Goibibo\'s convenience fee is non-refundable. Refunds, where applicable, are processed to the original payment method within the timelines specified in our Cancellation Policy.',
  },
  {
    title: '5. Travel Documents and Responsibilities',
    items: [
      'It is your sole responsibility to ensure you hold all required travel documents (passport, visa, government ID) for your journey.',
      'You are responsible for complying with all health, immigration, and customs requirements of destination countries.',
      'Goibibo is not liable for denied boarding or entry due to incomplete documentation.',
      'You are responsible for arriving at the departure point (airport, station, bus terminal) on time.',
    ],
  },
  {
    title: '6. Limitation of Liability',
    text: 'Goibibo is a technology platform that facilitates bookings with third-party travel suppliers. We are not liable for: (a) the acts or omissions of airlines, hotels, train operators, bus operators, or any other travel suppliers; (b) delays, cancellations, overbooking, or service failures by travel suppliers; (c) any indirect, incidental, special, or consequential damages arising from use of the platform; (d) losses resulting from events beyond our reasonable control (force majeure) including natural disasters, pandemics, strikes, or government actions. Our maximum liability for any claim shall not exceed the amount paid for the specific booking in question.',
  },
  {
    title: '7. Intellectual Property',
    text: 'All content on the Goibibo platform — including logos, design, text, graphics, and software — is the property of Goibibo or its licensors and is protected by Indian and international intellectual property laws. You may not copy, reproduce, distribute, or create derivative works without our express written permission.',
  },
  {
    title: '8. User-Generated Content',
    text: 'By submitting reviews, ratings, or other content on the platform, you grant Goibibo a non-exclusive, royalty-free, perpetual licence to use, display, and reproduce that content. You represent that your content is accurate, not defamatory, and does not infringe any third-party rights.',
  },
  {
    title: '9. Privacy',
    text: 'Your use of the platform is also governed by our Privacy Policy, which is incorporated into these Terms by reference. Please review our Privacy Policy to understand our data practices.',
  },
  {
    title: '10. Modifications to Terms',
    text: 'Goibibo reserves the right to modify these Terms at any time. Significant changes will be communicated via email or platform notification at least 15 days before taking effect. Your continued use of the platform after changes take effect constitutes your acceptance of the revised Terms.',
  },
  {
    title: '11. Governing Law and Disputes',
    text: 'These Terms are governed by the laws of India. Any disputes arising from these Terms or your use of the platform shall be subject to the exclusive jurisdiction of the courts in Gurgaon, Haryana. We encourage you to contact our support team first to resolve any issues informally before pursuing legal action.',
  },
  {
    title: '12. Contact',
    text: 'For questions about these Terms, please contact us at legal@goibibo.com or write to: Goibibo Legal Team, 5th Floor Tower B, Candor TechSpace, Sector 48, Gurgaon, Haryana 122018.',
  },
]

export default function TermsPage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <p className="text-slate-400 text-sm font-medium uppercase tracking-widest mb-3">Legal</p>
          <h1 className="text-4xl font-bold mb-3">Terms of Service</h1>
          <p className="text-slate-300 text-base max-w-2xl mx-auto">
            Please read these terms carefully before using the Goibibo platform.
          </p>
          <p className="text-slate-500 text-xs mt-4">Effective date: 1 January 2025 · Last updated: May 2026</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Quick summary */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-8 flex gap-3">
          <span className="text-2xl shrink-0">📋</span>
          <div className="text-sm text-amber-800 leading-relaxed">
            <strong>Plain English summary:</strong> Use Goibibo honestly, keep your account secure, pay when you book, carry your travel documents, and understand that we act as a middleman between you and travel suppliers. Disputes are governed by Indian law in Gurgaon courts.
          </div>
        </div>

        {/* Table of contents */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-3">Table of Contents</h2>
          <div className="grid grid-cols-2 gap-1">
            {sections.map((s, i) => (
              <a key={i} href={`#section-${i}`}
                className="text-sm text-blue-600 hover:underline py-0.5">
                {s.title}
              </a>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          {sections.map((s, i) => (
            <div key={i} id={`section-${i}`} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-base font-bold text-gray-900 mb-3">{s.title}</h2>
              {s.text && <p className="text-sm text-gray-600 leading-relaxed">{s.text}</p>}
              {s.items && (
                <ul className="space-y-2">
                  {s.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="text-gray-300 shrink-0 mt-0.5">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={() => navigate(ROUTES.PRIVACY_POLICY)}
            className="bg-white border border-gray-300 text-gray-700 px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
            Privacy Policy
          </button>
          <button onClick={() => navigate(ROUTES.CANCELLATION_POLICY)}
            className="bg-white border border-gray-300 text-gray-700 px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
            Cancellation Policy
          </button>
          <button onClick={() => navigate(ROUTES.CONTACT)}
            className="bg-slate-800 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors">
            Contact Legal Team
          </button>
        </div>
      </div>
    </div>
  )
}
