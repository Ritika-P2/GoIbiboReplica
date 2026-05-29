import { Routes, Route } from 'react-router-dom'
import { ROUTES } from '../constants/routes'
import MainLayout from '../layouts/MainLayout'
import AdminLayout from '../layouts/AdminLayout'
import AuthLayout from '../layouts/AuthLayout'
import ProtectedRoute from './ProtectedRoute'
import AdminRoute from './AdminRoute'
import ModuleRoute from './ModuleRoute'

import HomePage from '../pages/HomePage'
import FlightsPage from '../pages/FlightsPage'
import FlightResultsPage from '../pages/FlightResultsPage'
import MultiCityResultsPage from '../pages/MultiCityResultsPage'
import FlightBookingPage from '../pages/FlightBookingPage'
import HotelsPage from '../pages/HotelsPage'
import HotelResultsPage from '../pages/HotelResultsPage'
import HotelDetailPage from '../pages/HotelDetailPage'
import HotelBookingPage from '../pages/HotelBookingPage'
import TrainsPage from '../pages/TrainsPage'
import TrainResultsPage from '../pages/TrainResultsPage'
import TrainBookingPage from '../pages/TrainBookingPage'
import BusesPage from '../pages/BusesPage'
import BusResultsPage from '../pages/BusResultsPage'
import BusBookingPage from '../pages/BusBookingPage'
import CabsPage from '../pages/CabsPage'
import HolidaysPage from '../pages/HolidaysPage'
import HolidayResultsPage from '../pages/HolidayResultsPage'
import HolidayDetailPage from '../pages/HolidayDetailPage'
import HolidayBookingPage from '../pages/HolidayBookingPage'
import BookingConfirmationPage from '../pages/BookingConfirmationPage'
import MyBookingsPage from '../pages/MyBookingsPage'
import ProfilePage from '../pages/ProfilePage'
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'
import NotFoundPage from '../pages/NotFoundPage'
import AboutPage from '../pages/AboutPage'
import CareersPage from '../pages/CareersPage'
import PressPage from '../pages/PressPage'
import ContactPage from '../pages/ContactPage'
import HelpCenterPage from '../pages/HelpCenterPage'
import CancellationPolicyPage from '../pages/CancellationPolicyPage'
import PrivacyPolicyPage from '../pages/PrivacyPolicyPage'
import TermsPage from '../pages/TermsPage'

import AdminDashboardPage from '../pages/admin/AdminDashboardPage'
import AdminFlightsPage   from '../pages/admin/AdminFlightsPage'
import AdminHotelsPage    from '../pages/admin/AdminHotelsPage'
import AdminTrainsPage    from '../pages/admin/AdminTrainsPage'
import AdminBusesPage     from '../pages/admin/AdminBusesPage'
import AdminHolidaysPage  from '../pages/admin/AdminHolidaysPage'

export default function AppRoutes() {
  return (
    <Routes>
      {/* Auth routes */}
      <Route element={<AuthLayout />}>
        <Route path={ROUTES.LOGIN}    element={<LoginPage />} />
        <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
      </Route>

      {/* Admin routes — wrapped in MainLayout + AdminLayout */}
      <Route element={<MainLayout />}>
        <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route path={ROUTES.ADMIN}          element={<AdminDashboardPage />} />
          <Route path={ROUTES.ADMIN_FLIGHTS}  element={<ModuleRoute module="FLIGHTS"><AdminFlightsPage /></ModuleRoute>} />
          <Route path={ROUTES.ADMIN_HOTELS}   element={<ModuleRoute module="HOTELS"><AdminHotelsPage /></ModuleRoute>} />
          <Route path={ROUTES.ADMIN_TRAINS}   element={<ModuleRoute module="TRAINS"><AdminTrainsPage /></ModuleRoute>} />
          <Route path={ROUTES.ADMIN_BUSES}    element={<ModuleRoute module="BUSES"><AdminBusesPage /></ModuleRoute>} />
          <Route path={ROUTES.ADMIN_HOLIDAYS} element={<ModuleRoute module="HOLIDAYS"><AdminHolidaysPage /></ModuleRoute>} />
        </Route>
      </Route>

      {/* Public + protected routes */}
      <Route element={<MainLayout />}>
        <Route path={ROUTES.HOME}               element={<HomePage />} />
        <Route path={ROUTES.FLIGHTS}            element={<FlightsPage />} />
        <Route path={ROUTES.FLIGHT_RESULTS}      element={<FlightResultsPage />} />
        <Route path={ROUTES.MULTI_CITY_RESULTS}  element={<MultiCityResultsPage />} />
        <Route path={ROUTES.HOTELS}             element={<HotelsPage />} />
        <Route path={ROUTES.HOTEL_RESULTS}      element={<HotelResultsPage />} />
        <Route path={ROUTES.HOTEL_DETAIL}       element={<HotelDetailPage />} />
        <Route path={ROUTES.TRAINS}             element={<TrainsPage />} />
        <Route path={ROUTES.TRAIN_RESULTS}      element={<TrainResultsPage />} />
        <Route path={ROUTES.BUSES}              element={<BusesPage />} />
        <Route path={ROUTES.BUS_RESULTS}        element={<BusResultsPage />} />
        <Route path={ROUTES.CABS}               element={<CabsPage />} />
        <Route path={ROUTES.HOLIDAYS}           element={<HolidaysPage />} />
        <Route path={ROUTES.HOLIDAY_RESULTS}    element={<HolidayResultsPage />} />
        <Route path={ROUTES.HOLIDAY_DETAIL}     element={<HolidayDetailPage />} />
        <Route path={ROUTES.HOLIDAY_BOOKING}    element={<ProtectedRoute><HolidayBookingPage /></ProtectedRoute>} />
        <Route path={ROUTES.ABOUT}              element={<AboutPage />} />
        <Route path={ROUTES.CAREERS}            element={<CareersPage />} />
        <Route path={ROUTES.PRESS}              element={<PressPage />} />
        <Route path={ROUTES.CONTACT}            element={<ContactPage />} />
        <Route path={ROUTES.HELP}               element={<HelpCenterPage />} />
        <Route path={ROUTES.CANCELLATION_POLICY} element={<CancellationPolicyPage />} />
        <Route path={ROUTES.PRIVACY_POLICY}     element={<PrivacyPolicyPage />} />
        <Route path={ROUTES.TERMS}              element={<TermsPage />} />

        <Route path={ROUTES.FLIGHT_BOOKING}      element={<ProtectedRoute><FlightBookingPage /></ProtectedRoute>} />
        <Route path={ROUTES.HOTEL_BOOKING}       element={<ProtectedRoute><HotelBookingPage /></ProtectedRoute>} />
        <Route path={ROUTES.TRAIN_BOOKING}       element={<ProtectedRoute><TrainBookingPage /></ProtectedRoute>} />
        <Route path={ROUTES.BUS_BOOKING}         element={<ProtectedRoute><BusBookingPage /></ProtectedRoute>} />
        <Route path={ROUTES.BOOKING_CONFIRMATION} element={<ProtectedRoute><BookingConfirmationPage /></ProtectedRoute>} />
        <Route path={ROUTES.MY_BOOKINGS}         element={<ProtectedRoute><MyBookingsPage /></ProtectedRoute>} />
        <Route path={ROUTES.PROFILE}             element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
