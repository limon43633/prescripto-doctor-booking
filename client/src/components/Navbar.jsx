import React, { useContext, useState } from 'react'
import { assets, menuLinks } from '../assets/assets'
import { NavLink, useNavigate } from 'react-router-dom'
import { MenuIcon, X, ChevronDown } from 'lucide-react'
import { AppContext } from '../context/AppContext'

const Navbar = () => {

  const navigate = useNavigate();

  const [showMenu, setShowMenu] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  const logout = () => {
      setToken('')
      localStorage.removeItem('token')
      navigate('/login')
  }

  const {token,setToken, userData} = useContext(AppContext)

  return (
    <div className='flex items-center justify-between text-sm py-4 mb-5 border-b border-b-gray-400 relative'>
      <img onClick={() => navigate('/')} className='w-44 cursor-pointer' src={assets.logo} alt="" />

      <ul className="hidden md:flex items-center gap-5 font-medium">
        {menuLinks.map((link, index) => (
          <NavLink
            key={index}
            to={link.path}
            className={({ isActive }) =>
              `pb-1 border-b-2 transition-colors duration-300 ${isActive ? 'text-primary border-primary' : 'text-gray-700 border-transparent'
              }`
            }
          >
            {link.name}
          </NavLink>
        ))}
      </ul>

      <div className='flex items-center gap-4'>
        {
          token ?
            <div className='relative'>
              <div
                onClick={() => setShowProfileMenu(prev => !prev)}
                className='flex items-center gap-2 cursor-pointer'
              >
                <img className='w-8 h-8 rounded-full object-cover' src={userData ? userData.image : assets.profile_pic} alt="" />
                <ChevronDown className='w-3.5 h-3.5 text-gray-600' />
              </div>

              {/* Backdrop to close on outside click */}
              {showProfileMenu && (
                <div
                  onClick={() => setShowProfileMenu(false)}
                  className='fixed inset-0 z-30'
                />
              )}

              <div className={`absolute top-0 right-0 pt-14 text-sm font-medium text-gray-600 z-40 transition-all duration-200 ${showProfileMenu ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-1'
                }`}>
                <div className='min-w-48 bg-white border border-gray-100 shadow-lg rounded-xl flex flex-col gap-1 p-3'>
                  <p onClick={() => { navigate('/my-profile'); setShowProfileMenu(false) }} className='hover:bg-gray-50 hover:text-primary px-3 py-2 rounded-lg cursor-pointer transition-colors duration-200'>My Profile</p>
                  <p onClick={() => { navigate('/my-appointments'); setShowProfileMenu(false) }} className='hover:bg-gray-50 hover:text-primary px-3 py-2 rounded-lg cursor-pointer transition-colors duration-200'>My Appointments</p>
                  <p onClick={() => { logout(); setShowProfileMenu(false) }} className='hover:bg-red-50 hover:text-red-500 px-3 py-2 rounded-lg cursor-pointer transition-colors duration-200'>Logout</p>
                </div>
              </div>
            </div>
            :
            <button onClick={() => navigate('/login')} className='bg-primary text-white px-8 py-3 rounded-full font-light hidden md:block hover:bg-primary/90 transition-colors duration-300'>
              Create account
            </button>
        }

        <MenuIcon onClick={() => setShowMenu(true)} className='w-6 md:hidden cursor-pointer' />

        {/* Backdrop */}
        <div
          onClick={() => setShowMenu(false)}
          className={`md:hidden fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${showMenu ? 'opacity-100 visible' : 'opacity-0 invisible'
            }`}
        />

        {/*----- Mobile menu -----*/}
        <div className={`md:hidden fixed top-0 right-0 bottom-0 z-50 w-72 max-w-[80vw] bg-white shadow-2xl transition-transform duration-300 ease-in-out ${showMenu ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className='flex items-center justify-between px-5 py-6 border-b border-gray-100'>
            <img className='w-32' src={assets.logo} alt="" />
            <X className='text-gray-500 hover:text-red-500 w-6 h-6 cursor-pointer transition-colors duration-200' onClick={() => setShowMenu(false)} />
          </div>

          <ul className='flex flex-col gap-1 mt-4 px-4 text-sm font-medium'>
            {menuLinks.map((link, index) => (
              <NavLink
                key={index}
                onClick={() => setShowMenu(false)}
                to={link.path}
                className={({ isActive }) =>
                  `px-4 py-3 rounded-lg transition-colors duration-200 ${isActive ? 'bg-primary/10 text-primary' : 'text-gray-700 hover:bg-gray-50'
                  }`
                }
              >
                {link.name.toUpperCase()}
              </NavLink>
            ))}
          </ul>

          {!token && (
            <button
              onClick={() => { navigate('/login'); setShowMenu(false) }}
              className='mx-4 mt-6 bg-primary text-white w-[calc(100%-2rem)] py-3 rounded-full font-light hover:bg-primary/90 transition-colors duration-300'
            >
              Create account
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default Navbar