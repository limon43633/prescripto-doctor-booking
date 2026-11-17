import React, { useContext } from 'react'
import { AdminContext } from '../context/AdminContext'
import { NavLink } from 'react-router-dom'
import { assets } from '../assets/assets'

const menuItems = [
  { to: '/admin-dashboard', label: 'Dashboard', icon: assets.home_icon },
  { to: '/all-appointments', label: 'Appointments', icon: assets.appointment_icon },
  { to: '/add-doctor', label: 'Add Doctor', icon: assets.add_icon },
  { to: '/doctor-list', label: 'Doctors List', icon: assets.people_icon },
]

const Sidebar = () => {
  const { aToken } = useContext(AdminContext)

  return (
    <aside className='min-h-screen bg-white border-r border-gray-200/80 md:w-72 shrink-0'>
      {aToken && (
        <nav className='px-3 md:px-4 pt-6'>
          <p className='hidden md:block px-4 mb-3 text-[11px] font-semibold uppercase tracking-widest text-gray-400'>
            Main Menu
          </p>

          <ul className='flex flex-col gap-1.5'>
            {menuItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-3.5 rounded-xl px-3 md:px-4 py-3 text-sm font-medium transition-all duration-300 ease-out
                    ${
                      isActive
                        ? 'bg-gradient-to-r from-primary to-indigo-500 text-white shadow-lg shadow-primary/30'
                        : 'text-gray-600 hover:bg-primary/10 hover:text-primary hover:translate-x-1'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {/* Active indicator bar */}
                      <span
                        className={`absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-white transition-all duration-300 ${
                          isActive ? 'opacity-100' : 'opacity-0'
                        }`}
                      />

                      {/* Icon wrapper */}
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all duration-300 ${
                          isActive
                            ? 'bg-white/20'
                            : 'bg-gray-100 group-hover:bg-white group-hover:shadow-sm'
                        }`}
                      >
                        <img
                          src={item.icon}
                          alt={item.label}
                          className={`h-5 w-5 object-contain transition-all duration-300 ${
                            isActive ? 'brightness-0 invert' : ''
                          }`}
                        />
                      </span>

                      <span className='hidden md:block flex-1'>{item.label}</span>

                      {/* Arrow on hover / active */}
                      <svg
                        className={`hidden md:block h-4 w-4 transition-all duration-300 ${
                          isActive
                            ? 'opacity-100 text-white'
                            : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'
                        }`}
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                        strokeWidth='2'
                      >
                        <path strokeLinecap='round' strokeLinejoin='round' d='M9 5l7 7-7 7' />
                      </svg>
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </aside>
  )
}

export default Sidebar