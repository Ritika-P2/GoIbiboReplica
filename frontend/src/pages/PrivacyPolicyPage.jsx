import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../constants/routes'

const sections = [
  {
    title: '1. Information We Collect',
    content: [
      { sub: '1.1 Account Information', text: 'When you register, we collect your name, email address, phone number, and password (stored as a one-way hash). You may also provide your date of birth and government ID details for certain bookings.' },
      { sub: '1.2 Booking Data', text: 'We collect travel details including departure/destination, travel dates, passenger names, ages, and preferences necessary to complete your bookings.' },
      { sub: '1.3 Payment Information', text: 'Payment transactions are processed by PCI-DSS compliant payment processors. We store only the last four digits of your card and the card network for display purposes — we never store full card numbers or CVV.' },
      { sub: '1.4 Usage Data', text: 'We collect information about how you use the Goibibo platform, including pages visited, searches performed, buttons clicked, and device/browser metadata, to improve our services.' },
      { sub: '1.5 Location Data', text: 'With your permission, we may collect your approximate location to show relevant local deals and nearby airports or hotels. You can disable this at any time in your device settings.' },
    ],
  },
  {
    title: '2. How We Use Your Information',
    content: [
      { sub: 'Service Delivery', text: 'To process bookings, send confirmations, and provide customer support.' },
      { sub: 'Personalisation', text: 'To show you relevant travel deals, recommendations, and search results tailored to your preferences and history.' },
      { sub: 'Communication', text: 'To send booking confirmations, itinerary updates, payment receipts, and promotional emails (you can opt out of marketing emails at any time).' },
      { sub: 'Security & Fraud Prevention', text: 'To detect and prevent fraudulent transactions, unauthorised access, and other illegal activities.' },
      { sub: 'Analytics & Improvement', text: 'To understand how users interact with our platform and continuously improve our products and services.' },
    ],
  },
  {
    title: '3. Sharing Your Information',
    content: [
      { sub: 'Travel Suppliers', text: 'We share necessary booking details (passenger names, contact information) with airlines, hotels, train operators, and bus companies to fulfil your bookings.' },
      { sub: 'Payment Processors', text: 'Payment information is shared with our payment processing partners (Razorpay, PayU) solely to process transactions.' },
      { sub: 'Analytics Partners', text: 'We may share anonymised, aggregated usage data with analytics providers to improve our services. This data cannot be used to identify you.' },
      { sub: 'Legal Requirements', text: 'We may disclose your information if required by law, court order, or government authority, or to protect the rights, property, or safety of Goibibo, our users, or others.' },
      { sub: 'No Selling of Data', text: 'We do not sell, rent, or trade your personal information to third parties for their marketing purposes.' },
    ],
  },
  {
    title: '4. Data Retention',
    content: [
      { sub: '', text: 'We retain your account and booking information for as long as your account is active or as needed to provide services. Booking records are retained for 7 years for legal and tax compliance. You may request deletion of your account and personal data at any time by contacting our support team.' },
    ],
  },
  {
    title: '5. Your Rights',
    content: [
      { sub: 'Access', text: 'You have the right to request a copy of the personal data we hold about you.' },
      { sub: 'Correction', text: 'You can update your account information at any time from your Profile page.' },
      { sub: 'Deletion', text: 'You can request deletion of your personal data, subject to legal retention obligations.' },
      { sub: 'Opt-out', text: 'You can unsubscribe from marketing communications at any time using the unsubscribe link in any email or via your account settings.' },
      { sub: 'Data Portability', text: 'You can request an export of your booking history and personal data in a machine-readable format.' },
    ],
  },
  {
    title: '6. Cookies & Tracking',
    content: [
      { sub: '', text: 'We use cookies and similar technologies to remember your preferences, keep you logged in, and analyse usage patterns. You can control cookie preferences through your browser settings. Disabling certain cookies may affect the functionality of the platform.' },
    ],
  },
  {
    title: '7. Security',
    content: [
      { sub: '', text: 'We use industry-standard security measures including TLS encryption for data in transit, AES-256 encryption for sensitive data at rest, regular security audits, and multi-factor authentication options to protect your account. No method of transmission over the internet is 100% secure; we cannot guarantee absolute security but are committed to protecting your data.' },
    ],
  },
  {
    title: '8. Children\'s Privacy',
    content: [
      { sub: '', text: 'Goibibo is not directed to children under 18 years of age. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us immediately.' },
    ],
  },
  {
    title: '9. Changes to This Policy',
    content: [
      { sub: '', text: 'We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of significant changes via email or a prominent notice on our platform at least 30 days before the changes take effect.' },
    ],
  },
  {
    title: '10. Contact Us',
    content: [
      { sub: '', text: 'For any privacy-related questions, concerns, or requests, please contact our Data Protection Officer at: privacy@goibibo.com | Goibibo Privacy Team, 5th Floor Tower B, Candor TechSpace, Sector 48, Gurgaon 122018.' },
    ],
  },
]

export default function PrivacyPolicyPage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <p className="text-gray-400 text-sm font-medium uppercase tracking-widest mb-3">Legal</p>
          <h1 className="text-4xl font-bold mb-3">Privacy Policy</h1>
          <p className="text-gray-300 text-base max-w-2xl mx-auto">
            We take your privacy seriously. This policy explains what data we collect, how we use it, and your rights.
          </p>
          <p className="text-gray-500 text-xs mt-4">Effective date: 1 January 2025 · Last updated: May 2026</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Summary banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-8 flex gap-3">
          <span className="text-2xl shrink-0">🔒</span>
          <div className="text-sm text-blue-800 leading-relaxed">
            <strong>Plain English summary:</strong> We collect only what we need to operate the service. We don't sell your data. You can request deletion of your account at any time. Payments are handled by PCI-DSS compliant processors — we never see your full card number.
          </div>
        </div>

        <div className="space-y-6">
          {sections.map(sec => (
            <div key={sec.title} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4">{sec.title}</h2>
              <div className="space-y-3">
                {sec.content.map((item, i) => (
                  <div key={i}>
                    {item.sub && <p className="text-sm font-semibold text-gray-700 mb-0.5">{item.sub}</p>}
                    <p className="text-sm text-gray-600 leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 bg-gray-100 rounded-xl p-5 text-center">
          <p className="text-gray-600 text-sm mb-3">Questions about your privacy or data?</p>
          <button onClick={() => navigate(ROUTES.CONTACT)}
            className="bg-gray-800 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors">
            Contact our Privacy Team
          </button>
        </div>
      </div>
    </div>
  )
}
