import { useState } from 'react'
import Button from '../components/common/Button'
import Input from '../components/common/Input'

const offices = [
  {
    city: 'Gurgaon (HQ)',
    address: '5th Floor, Tower B, Candor TechSpace, Sector 48, Gurgaon, Haryana 122018',
    phone: '+91 124 456 7890',
    email: 'support@goibibo.com',
    hours: 'Mon–Fri, 9 AM – 7 PM IST',
    icon: '🏢',
  },
  {
    city: 'Bangalore',
    address: '3rd Floor, Prestige Polygon, 471 Anna Salai, Teynampet, Bangalore 560095',
    phone: '+91 80 4567 8901',
    email: 'blr@goibibo.com',
    hours: 'Mon–Fri, 9 AM – 7 PM IST',
    icon: '🏢',
  },
]

const topics = ['General Enquiry', 'Booking Support', 'Refund / Cancellation', 'Partnership', 'Media / Press', 'Career Enquiry', 'Feedback']

export default function ContactPage() {
  const [form, setForm]       = useState({ name: '', email: '', phone: '', topic: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  function isValid() {
    return form.name.trim() && form.email.includes('@') && form.topic && form.message.trim().length >= 10
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!isValid()) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    setLoading(false)
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-600 to-cyan-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <p className="text-blue-100 text-sm font-medium uppercase tracking-widest mb-3">Get in Touch</p>
          <h1 className="text-4xl font-bold mb-3">We'd love to <span className="text-yellow-300">hear from you</span></h1>
          <p className="text-blue-100 text-lg max-w-xl mx-auto">
            Whether it's a booking question, partnership idea, or just a hello — our team is here.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-12">

          {/* Form */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a message</h2>

            {submitted ? (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-10 text-center">
                <div className="text-5xl mb-4">✅</div>
                <h3 className="text-xl font-bold text-green-800 mb-2">Message Sent!</h3>
                <p className="text-green-700 text-sm">
                  Thanks, <strong>{form.name}</strong>! We've received your message and will get back to you at <strong>{form.email}</strong> within 24 hours.
                </p>
                <button onClick={() => { setForm({ name: '', email: '', phone: '', topic: '', message: '' }); setSubmitted(false) }}
                  className="mt-6 text-sm text-green-600 hover:underline">
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Your Name *" name="name" value={form.name} onChange={handleChange} placeholder="Arjun Mehta" />
                  <Input label="Email Address *" type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" />
                </div>
                <Input label="Phone Number" type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="+91 98765 43210" />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Topic *</label>
                  <select name="topic" value={form.topic} onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    <option value="">Select a topic</option>
                    {topics.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                  <textarea name="message" value={form.message} onChange={handleChange} rows={5}
                    placeholder="Tell us how we can help..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                  <p className="text-xs text-gray-400 mt-1">{form.message.length} / 500 characters</p>
                </div>

                <Button type="submit" loading={loading} disabled={!isValid()} className="w-full">
                  Send Message
                </Button>
              </form>
            )}
          </div>

          {/* Contact info */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Offices</h2>
            <div className="space-y-5 mb-10">
              {offices.map(o => (
                <div key={o.city} className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">{o.icon}</span>
                    <h3 className="font-semibold text-gray-900">{o.city}</h3>
                  </div>
                  <div className="space-y-1.5 text-sm text-gray-600">
                    <p>📍 {o.address}</p>
                    <p>📞 <a href={`tel:${o.phone}`} className="hover:text-blue-600">{o.phone}</a></p>
                    <p>✉️ <a href={`mailto:${o.email}`} className="hover:text-blue-600">{o.email}</a></p>
                    <p>🕘 {o.hours}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
              <h3 className="font-semibold text-gray-900 mb-3">Dedicated Support Lines</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">✈️ Flight bookings</span>
                  <a href="tel:+911800112345" className="text-blue-600 font-medium hover:underline">1800-11-2345</a>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">🏨 Hotel bookings</span>
                  <a href="tel:+911800112346" className="text-blue-600 font-medium hover:underline">1800-11-2346</a>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">🚂 Train &amp; Bus</span>
                  <a href="tel:+911800112347" className="text-blue-600 font-medium hover:underline">1800-11-2347</a>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">🌴 Holiday packages</span>
                  <a href="tel:+911800112348" className="text-blue-600 font-medium hover:underline">1800-11-2348</a>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-3">Toll-free · 24×7 support</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
