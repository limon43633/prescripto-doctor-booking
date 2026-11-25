import { useContext, useState, useRef, useEffect } from 'react'
import Login from './pages/Login'
import { ToastContainer } from 'react-toastify'
import { AdminContext } from './context/AdminContext'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Dashboard from './pages/Admin/Dashboard'
import AllAppointments from './pages/Admin/AllAppointments'
import AddDoctor from './pages/Admin/AddDoctor'
import DoctorsList from './pages/Admin/DoctorsList'
import { DoctorContext } from './context/DoctorContext'
import DoctorDashboard from './pages/Doctor/DoctorDashboard'
import DoctorAppointments from './pages/Doctor/DoctorAppointments'
import DoctorProfile from './pages/Doctor/DoctorProfile'

const App = () => {
  const { aToken } = useContext(AdminContext)
  const { dToken } = useContext(DoctorContext)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const mainRef = useRef(null)
  const location = useLocation()

  // Reset scroll position on route change
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, behavior: 'instant' })
  }, [location.pathname])

  if (!aToken && !dToken) {
    return (
      <>
        <Login />
        <ToastContainer />
      </>
    )
  }

  return (
    <div className="h-screen h-dvh flex overflow-hidden bg-canvas text-gray-900 font-sans">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Accessible skip link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-[#5F6FFF] focus:text-white focus:rounded-[12px] focus:shadow-lg focus:outline-none text-[14px] font-medium"
      >
        Skip to main content
      </a>

      {/* Full-height Sidebar on Desktop / Tablet Rail + Mobile Drawer */}
      <Sidebar
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />

      {/* Main Content Column with Top bar */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Bar */}
        <Navbar
          onMenuClick={() => setIsDrawerOpen((prev) => !prev)}
          isMenuOpen={isDrawerOpen}
        />

        {/* The ONLY vertical scroll container in the application */}
        <main
          id="main-content"
          ref={mainRef}
          className="flex-1 min-w-0 overflow-y-auto scroll-smooth overscroll-contain"
        >
          <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            <Routes>

              {/* Admin Routes*/}

              <Route path="/" element={<Navigate to={aToken ? "/admin-dashboard" : "/doctor-dashboard"} replace />} />
              <Route path="/admin-dashboard" element={<Dashboard />} />
              <Route path="/all-appointments" element={<AllAppointments />} />
              <Route path="/add-doctor" element={<AddDoctor />} />
              <Route path="/doctor-list" element={<DoctorsList />} />

              {/* Doctor Routes*/}

              <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
              <Route path="/doctor-appointments" element={<DoctorAppointments/>} />
              <Route path="/doctor-profile" element={<DoctorProfile/>} />

              {/* Catch-all Route */}
              <Route path="*" element={<Navigate to="/" replace />} />


            </Routes>
          </div>
        </main>
      </div>
    </div>
  )
}

export default App
