import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../constants/routes'

const sections = [
  {
    icon: '✈️',
    title: 'Flight Cancellations',
    rows: [
      { label: 'More than 7 days before departure',   value: '100% refund (minus airline fee)' },
      { label: '2–7 days before departure',           value: '75% refund' },
      { label: '24–48 hours before departure',        value: '50% refund' },
      { label: 'Less than 24 hours before departure', value: 'Non-refundable (airline charges apply)' },
      { label: 'No-show',                             value: 'Non-refundable' },
    ],
    note: 'Refund amounts depend on the airline\'s fare rules. Low-cost carrier tickets are typically non-refundable. Business and Flex fares usually allow free cancellation.',
  },
  {
    icon: '🏨',
    title: 'Hotel Cancellations',
    rows: [
      { label: 'Free Cancellation rate — any time before deadline', value: '100% refund' },
      { label: 'Non-refundable rate',                               value: '0% refund' },
      { label: 'Partial-refund rate — cancelled before check-in',   value: 'As per hotel policy (shown at booking)' },
      { label: 'No-show',                                           value: 'First night charged or as per hotel policy' },
    ],
    note: 'Always check the cancellation policy displayed on the hotel detail and booking confirmation pages before completing your purchase.',
  },
  {
    icon: '🚂',
    title: 'Train Cancellations (IRCTC Rules)',
    rows: [
      { label: 'More than 48 hours before departure', value: 'Minimal flat charge (₹60–₹240 per passenger)' },
      { label: '12–48 hours before departure',        value: '25% of fare deducted' },
      { label: '4–12 hours before departure',         value: '50% of fare deducted' },
      { label: 'Less than 4 hours / after departure', value: 'Non-refundable' },
      { label: 'Tatkal tickets',                      value: 'Non-refundable' },
    ],
    note: 'Train cancellations follow IRCTC\'s standard rules. Refund amounts may vary for some special trains and premium services.',
  },
  {
    icon: '🚌',
    title: 'Bus Cancellations',
    rows: [
      { label: 'More than 24 hours before departure', value: '80% refund' },
      { label: '12–24 hours before departure',        value: '50% refund' },
      { label: '6–12 hours before departure',         value: '25% refund' },
      { label: 'Less than 6 hours before departure',  value: 'Non-refundable' },
    ],
    note: 'Refund percentages may vary by operator. Government buses (KSRTC, TSRTC etc.) follow their own cancellation rules.',
  },
  {
    icon: '🌴',
    title: 'Holiday Package Cancellations',
    rows: [
      { label: 'More than 30 days before travel',  value: '90% refund (10% admin fee)' },
      { label: '15–30 days before travel',         value: '70% refund' },
      { label: '7–15 days before travel',          value: '50% refund' },
      { label: '3–7 days before travel',           value: '25% refund' },
      { label: 'Less than 3 days / no-show',       value: 'Non-refundable' },
    ],
    note: 'Custom and luxury packages may have different terms. Your package confirmation email will include the exact policy applicable to your booking.',
  },
]

export default function CancellationPolicyPage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <p className="text-orange-100 text-sm font-medium uppercase tracking-widest mb-3">Policies</p>
          <h1 className="text-4xl font-bold mb-3">Cancellation & Refund Policy</h1>
          <p className="text-orange-100 text-base max-w-2xl mx-auto">
            Clear, fair, and easy to understand — here's exactly what happens when plans change.
          </p>
          <p className="text-orange-200 text-xs mt-4">Last updated: May 2026</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">

        {/* General note */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 flex gap-3">
          <span className="text-2xl shrink-0">ℹ️</span>
          <div className="text-sm text-blue-800 leading-relaxed">
            <strong>General rule:</strong> All cancellations must be initiated through your Goibibo account under <em>My Bookings</em>. Refunds are credited to the original payment method within <strong>5–7 business days</strong> (cards/net banking) or <strong>24–48 hours</strong> (UPI/Goibibo wallet). Goibibo's convenience fee is non-refundable.
          </div>
        </div>

        {sections.map(s => (
          <div key={s.title} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
              <span className="text-2xl">{s.icon}</span>
              <h2 className="text-lg font-bold text-gray-900">{s.title}</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-6 py-3 text-gray-500 font-semibold">Cancellation Timeframe</th>
                    <th className="text-left px-6 py-3 text-gray-500 font-semibold">Refund Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {s.rows.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3 text-gray-700">{row.label}</td>
                      <td className={`px-6 py-3 font-medium ${row.value.startsWith('100') ? 'text-green-600' : row.value === 'Non-refundable' ? 'text-red-600' : 'text-orange-600'}`}>
                        {row.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
              <p className="text-xs text-gray-500 italic">📌 {s.note}</p>
            </div>
          </div>
        ))}

        {/* Refund process */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">How to Initiate a Cancellation</h2>
          <ol className="space-y-3">
            {[
              'Log in to your Goibibo account.',
              'Go to My Bookings from the top navigation or your profile menu.',
              'Find the booking you wish to cancel and click "Cancel Booking".',
              "Confirm the cancellation — you'll see the refund amount before you confirm.",
              'The refund is initiated immediately; your bank will credit it within the timeline mentioned above.',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                {step}
              </li>
            ))}
          </ol>
        </div>

        {/* Contact */}
        <div className="bg-orange-50 rounded-xl border border-orange-100 p-5 text-center">
          <p className="text-gray-700 font-medium mb-1">Have a question about a specific cancellation?</p>
          <p className="text-sm text-gray-500 mb-4">Our refund team is available 24×7 to help you.</p>
          <button onClick={() => navigate(ROUTES.CONTACT)}
            className="bg-orange-500 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  )
}
