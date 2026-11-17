import React from 'react'
import { assets } from '../assets/assets'

const Header = () => {
  return (
    <div className='flex flex-col md:flex-row items-center bg-primary rounded-2xl px-6 md:px-10 lg:px-20 overflow-hidden shadow-lg'>

      {/* Left side content */}
      <div className='w-full md:w-1/2 flex flex-col items-center md:items-start justify-center gap-5 py-12 md:py-16 lg:py-20 text-center md:text-left'>

        <p className='text-3xl sm:text-4xl lg:text-5xl text-white font-semibold leading-snug md:leading-tight lg:leading-tight'>
          Book Appointment <br className='hidden sm:block' /> With Trusted Doctors
        </p>

        <div className='flex flex-col sm:flex-row items-center gap-3 text-white text-sm font-light px-2 sm:px-0'>
          <img className='w-24 md:w-28' src={assets.group_profiles} alt="Group Profiles" />
          <p className='max-w-xs sm:max-w-none'>
            Simply browse through our extensive list of trusted doctors, <br className='hidden lg:block' /> schedule your appointment hassle-free.
          </p>
        </div>

        <a
          href="#speciality"
          className='flex items-center gap-2 bg-white px-8 py-3 rounded-full text-gray-600 text-sm font-medium mt-2 shadow-sm hover:scale-105 active:scale-95 transition-all duration-300'
        >
          Book appointment <img className='w-3' src={assets.arrow_icon} alt="Arrow Icon" />
        </a>
      </div>

      {/* Right side content */}
      <div className='w-full md:w-1/2 relative flex justify-center md:justify-end items-end mt-4 md:mt-10'>
        <img
          className='w-full max-w-sm md:max-w-full h-auto rounded-2xl object-cover'
          src={assets.header_img}
          alt="Doctors"
        />
      </div>

    </div>
  )
}

export default Header