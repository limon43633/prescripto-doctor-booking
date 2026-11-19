
import { useContext, useState, useRef, useEffect } from 'react'
import { assets } from '../assets/assets'
import { AdminContext } from '../context/AdminContext'
import { DoctorContext } from '../context/DoctorContext'
import { useNavigate, useLocation } from 'react-router-dom'
import { IconMenu, IconChevronDown, IconLogout } from './ui/Icons'

const routeTitles = {
  '/': 'Overview',
  '/admin-dashboard': 'Dashboard',
  '/all-appointments': 'All Appointments',
  '/add-doctor': 'Add Doctor',
  '/doctor-list': 'Doctors List',
}

const Navbar = ({ onMenuClick, isMenuOpen }) => {
  const { aToken, setAToken } = useContext(AdminContext)
  const { dToken, setDToken } = useContext(DoctorContext)

  const navigate = useNavigate()
  const location = useLocation()

  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  // Identify logged-in user
  const roleText = aToken ? 'Admin' : dToken ? 'Doctor' : 'User'
  const initial = roleText[0]

  const currentPageTitle = routeTitles[location.pathname] || 'Dashboard'

  // Logout handler
  const logout = () => {
    setAToken('')
    setDToken('')

    localStorage.removeItem('aToken')
    localStorage.removeItem('dToken')

    setMenuOpen(false)
    navigate('/')
  }

  // Close dropdown on click outside or ESC
  useEffect(() => {
    if (!menuOpen) return

    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [menuOpen])

  return (
    <header className="h-16 md:h-[72px] shrink-0 bg-white border-b border-[#EAECF0] px-4 sm:px-6 lg:px-8 flex items-center justify-between z-20 transition-colors">

      {/* Left: Mobile hamburger + logo / Desktop breadcrumb */}
      <div className="flex items-center gap-3">

        {/* Mobile Hamburger & Logo */}
        <div className="flex md:hidden items-center gap-2.5">
          <button
            type="button"
            onClick={onMenuClick}
            aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMenuOpen}
            className="p-2 -ml-2 rounded-[12px] text-[#344054] hover:bg-[#F2F4F7] transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5F6FFF]"
          >
            <IconMenu className="w-5 h-5" />
          </button>

          <img
            onClick={() => navigate('/')}
            className="h-7 w-auto object-contain cursor-pointer"
            src={assets.admin_logo}
            alt="Prescripto"
          />
        </div>

        {/* Desktop & Tablet Breadcrumb */}
        <nav aria-label="Breadcrumb" className="hidden md:flex items-center gap-2 text-[14px]">
          <span className="text-white transition-colors border rounded-full px-2 py-0.5 bg-primary">
            {roleText}
          </span>

          <span className="text-[#D0D5DD]" aria-hidden="true">
            /
          </span>

          <span className="text-[#101828] font-medium">
            {currentPageTitle}
          </span>
        </nav>
      </div>

      {/* Right: User Avatar & Dropdown */}
      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          aria-label={`User menu for ${roleText}`}
          className="flex items-center gap-2.5 p-1 sm:pr-2.5 rounded-full hover:bg-[#F2F4F7] transition-colors cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-[#5F6FFF]/20 select-none"
        >
          {/* Avatar */}
          <div className="w-9 h-9 rounded-full bg-[#F0F2FF] text-[#5F6FFF] border border-[#5F6FFF]/20 flex items-center justify-center font-semibold text-[14px]">
            {initial}
          </div>

          <span className="hidden sm:inline-block text-[14px] font-medium text-[#344054]">
            {roleText}
          </span>

          <IconChevronDown
            className={`hidden sm:inline-block w-4 h-4 text-[#667085] transition-transform duration-150 ${
              menuOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* Dropdown */}
        {menuOpen && (
          <div
            role="menu"
            aria-orientation="vertical"
            className="absolute right-0 top-full mt-2 w-52 bg-white rounded-[12px] border border-[#EAECF0] shadow-[0_12px_32px_-8px_rgba(16,24,40,0.16)] py-1.5 z-50 animate-admin-modal"
          >
            <div className="px-3.5 py-2">
              <p className="text-[12px] text-[#667085]">
                Signed in as
              </p>

              <p className="text-[14px] font-medium text-[#101828] truncate">
                {roleText}
              </p>
            </div>

            <div className="h-px bg-[#F2F4F7] my-1" />

            <button
              type="button"
              role="menuitem"
              onClick={logout}
              className="w-full text-left px-3.5 py-2 text-[14px] text-[#B42318] hover:bg-[#FEF3F2] flex items-center gap-2.5 transition-colors cursor-pointer focus:outline-none focus-visible:bg-[#FEF3F2]"
            >
              <IconLogout className="w-4 h-4 text-[#B42318]" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  )
}

export default Navbar
