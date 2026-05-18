import { Link } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'

const sections = [
  {
    title: 'Travel',
    links: [
      { label: 'Flights', to: ROUTES.FLIGHTS },
      { label: 'Hotels', to: ROUTES.HOTELS },
      { label: 'Trains', to: ROUTES.TRAINS },
      { label: 'Buses', to: ROUTES.BUSES },
      { label: 'Cabs', to: ROUTES.CABS },
      { label: 'Holidays', to: ROUTES.HOLIDAYS },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: 'Login', to: ROUTES.LOGIN },
      { label: 'Sign Up', to: ROUTES.REGISTER },
      { label: 'My Bookings', to: ROUTES.MY_BOOKINGS },
      { label: 'Profile', to: ROUTES.PROFILE },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', to: ROUTES.ABOUT },
      { label: 'Careers', to: ROUTES.CAREERS },
      { label: 'Press', to: ROUTES.PRESS },
      { label: 'Contact', to: ROUTES.CONTACT },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Help Center', to: ROUTES.HELP },
      { label: 'Cancellation Policy', to: ROUTES.CANCELLATION_POLICY },
      { label: 'Privacy Policy', to: ROUTES.PRIVACY_POLICY },
      { label: 'Terms of Service', to: ROUTES.TERMS },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {sections.map((section) => (
            <div key={section.title}>
              <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link to={ROUTES.HOME} className="text-xl font-bold text-white">
            Go<span className="text-orange-500">ibibo</span>
          </Link>
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Goibibo MVP. All rights reserved.
          </p>
          <div className="flex gap-4">
            {['Twitter', 'Facebook', 'Instagram'].map((social) => (
              <a
                key={social}
                href="#"
                className="text-sm hover:text-white transition-colors"
                aria-label={social}
              >
                {social}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
