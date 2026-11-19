
import { useContext, useState, useEffect, useRef } from 'react'
import { AdminContext } from '../context/AdminContext'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import { DoctorContext } from '../context/DoctorContext'
import {
  IconDashboard,
  IconCalendarCheck,
  IconUserPlus,
  IconUsers,
  IconSidebarCollapse,
  IconSidebarExpand,
  IconX,
} from './ui/Icons'

const navItems = [
  { to: '/admin-dashboard', label: 'Dashboard', icon: IconDashboard },
  { to: '/all-appointments', label: 'All Appointments', icon: IconCalendarCheck },
  { to: '/add-doctor', label: 'Add Doctor', icon: IconUserPlus },
  { to: '/doctor-list', label: 'Doctors List', icon: IconUsers },
]

const doctorNavItems = [
  { to: '/doctor-dashboard', label: 'Dashboard', icon: IconDashboard },
  { to: '/doctor-appointments', label: 'Appointments', icon: IconCalendarCheck },
  { to: '/doctor-profile', label: 'Profile', icon: IconUsers },
]

const Sidebar = ({ isOpen, onClose }) => {
  const { aToken } = useContext(AdminContext)
  const { dToken } = useContext(DoctorContext)

  const currentNavItems = aToken ? navItems : doctorNavItems

  const location = useLocation()
  const navigate = useNavigate()

  const drawerRef = useRef(null)
  const closeBtnRef = useRef(null)

  // Collapse state for desktop (persisted in localStorage)
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      const saved = localStorage.getItem('prescripto_sidebar_collapsed')
      if (saved !== null) return saved === 'true'
    } catch {
      // ignore
    }
    return false
  })

  // Detect tablet width (768px to 1023px)
  const [isTablet, setIsTablet] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768 && window.innerWidth < 1024
    }
    return false
  })

  useEffect(() => {
    const handleResize = () => {
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev
      try {
        localStorage.setItem('prescripto_sidebar_collapsed', String(next))
      } catch {
        // ignore
      }
      return next
    })
  }

  // Close mobile drawer on route change
  useEffect(() => {
    if (isOpen) {
      onClose?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])

  // Focus trap and ESC key listener for mobile drawer
  useEffect(() => {
    if (!isOpen) return

    const timer = setTimeout(() => {
      closeBtnRef.current?.focus()
    }, 40)

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose?.()
        return
      }

      if (e.key === 'Tab' && drawerRef.current) {
        const focusable = drawerRef.current.querySelectorAll(
          'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
        )

        if (focusable.length === 0) return

        const first = focusable[0]
        const last = focusable[focusable.length - 1]

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      clearTimeout(timer)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!aToken && !dToken) return null

  // Rail mode is active on tablet by default, or when user collapses on desktop
  const isRail = isTablet || isCollapsed

  return (
    <>
      {/* ------------------------------------------------------------- */}
      {/* 1) DESKTOP & TABLET PERSISTENT SIDEBAR                        */}
      {/* ------------------------------------------------------------- */}

      <aside
        className={`hidden md:flex flex-col shrink-0 bg-white border-r border-[#EAECF0] h-full select-none transition-all duration-200 z-20 ${
          isRail ? 'w-20' : 'w-[264px]'
        }`}
        aria-label="Sidebar navigation"
      >
        {/* Top Header: Logo + Collapse Button */}
        <div className={`h-[72px] flex items-center border-b border-[#EAECF0] ${isRail ? 'justify-center px-2' : 'justify-between px-6'}`}>
          {!isRail ? (
            <>
              <img
                onClick={() => navigate('/')}
                className="h-8 w-auto object-contain cursor-pointer"
                src={assets.admin_logo}
                alt="Prescripto"
              />

              <button
                type="button"
                onClick={toggleCollapse}
                aria-label="Collapse sidebar"
                className="p-1.5 rounded-[8px] text-[#667085] hover:text-[#101828] hover:bg-[#F2F4F7] transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5F6FFF]"
              >
                <IconSidebarCollapse className="w-5 h-5" />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <button
                type="button"
                onClick={toggleCollapse}
                aria-label="Expand sidebar"
                className="w-10 h-10 rounded-[10px] bg-[#F0F2FF] text-[#5F6FFF] hover:bg-[#5F6FFF] hover:text-white transition-colors flex items-center justify-center cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5F6FFF]"
              >
                <IconSidebarExpand className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Navigation List */}
        <div className="flex-1 py-6 px-3 overflow-y-auto">
          {!isRail && (
            <p className="px-3 mb-2 text-[13px] font-medium text-[#667085]">
              Menu
            </p>
          )}

          <ul className="flex flex-col gap-1">
            {currentNavItems.map((item) => {
              const Icon = item.icon

              return (
                <li key={item.to} className="relative group">
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center rounded-[12px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5F6FFF] ${
                        isRail
                          ? 'w-11 h-11 mx-auto justify-center'
                          : 'h-11 px-3 gap-3 text-[15px]'
                      } ${
                        isActive
                          ? 'bg-[#F0F2FF] text-[#5F6FFF] font-medium'
                          : 'text-[#475467] hover:bg-[#F9FAFB] hover:text-[#101828]'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon
                          className={`w-5 h-5 shrink-0 ${
                            isActive
                              ? 'text-[#5F6FFF]'
                              : 'text-[#667085] group-hover:text-[#101828]'
                          }`}
                        />

                        {!isRail && (
                          <span className="truncate">{item.label}</span>
                        )}
                      </>
                    )}
                  </NavLink>

                  {/* Accessible Dark Tooltip for Collapsed Rail */}
                  {isRail && (
                    <div
                      role="tooltip"
                      className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded-[8px] bg-[#101828] text-white text-[13px] font-medium whitespace-nowrap shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity z-50"
                    >
                      {item.label}
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      </aside>

      {/* ------------------------------------------------------------- */}
      {/* 2) MOBILE OFF-CANVAS DRAWER (< 768px)                         */}
      {/* ------------------------------------------------------------- */}

      <div
        className={`fixed inset-0 z-50 md:hidden transition-visibility duration-200 ${
          isOpen ? 'visible' : 'invisible pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div
          className={`fixed inset-0 bg-[#101828]/40 backdrop-blur-xs transition-opacity duration-200 ${
            isOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Sliding Pane */}
        <div
          ref={drawerRef}
          className={`fixed inset-y-0 left-0 w-[min(85vw,320px)] bg-white shadow-2xl flex flex-col h-full z-50 transform transition-transform duration-200 ease-out ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          inert={!isOpen ? '' : undefined}
          role="dialog"
          aria-modal="true"
          aria-label="Navigation drawer"
        >
          {/* Drawer Top Header */}
          <div className="h-16 px-5 border-b border-[#EAECF0] flex items-center justify-between shrink-0">
            <img
              src={assets.admin_logo}
              alt="Prescripto"
              className="h-7 w-auto object-contain"
            />

            <button
              ref={closeBtnRef}
              type="button"
              onClick={onClose}
              aria-label="Close navigation menu"
              className="p-2 -mr-1.5 rounded-[12px] text-[#667085] hover:text-[#101828] hover:bg-[#F2F4F7] transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5F6FFF]"
            >
              <IconX className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Links */}
          <div className="flex-1 overflow-y-auto p-4">
            <p className="px-3 mb-2 text-[13px] font-medium text-[#667085]">
              Menu
            </p>

            <ul className="flex flex-col gap-1">
              {currentNavItems.map((item) => {
                const Icon = item.icon

                return (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center gap-3 h-11 px-3.5 rounded-[12px] text-[15px] transition-colors ${
                          isActive
                            ? 'bg-[#F0F2FF] text-[#5F6FFF] font-medium'
                            : 'text-[#475467] hover:bg-[#F9FAFB] hover:text-[#101828]'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon
                            className={`w-5 h-5 shrink-0 ${
                              isActive
                                ? 'text-[#5F6FFF]'
                                : 'text-[#667085]'
                            }`}
                          />

                          <span className="truncate">{item.label}</span>
                        </>
                      )}
                    </NavLink>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}

export default Sidebar
