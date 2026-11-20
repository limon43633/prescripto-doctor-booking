import React from 'react'
import { assets } from '../assets/assets'
import { Zap, MapPin, UserCheck } from 'lucide-react'

const About = () => {
  const features = [
    {
      title: 'EFFICIENCY',
      desc: 'Streamlined appointment scheduling that fits into your busy lifestyle.',
      icon: <Zap className="w-6 h-6" strokeWidth={1.8} />,
    },
    {
      title: 'CONVENIENCE',
      desc: 'Access to a network of trusted healthcare professionals in your area.',
      icon: <MapPin className="w-6 h-6" strokeWidth={1.8} />,
    },
    {
      title: 'PERSONALIZATION',
      desc: 'Tailored recommendations and reminders to help you stay on top of your health.',
      icon: <UserCheck className="w-6 h-6" strokeWidth={1.8} />,
    },
  ]

  return (
    <div>
      <div className='text-center text-2xl pt-10 text-gray-500'>
        <p>ABOUT <span className='text-gray-700 font-medium'>US</span></p>
      </div>

      <div className='my-10 flex flex-col md:flex-row gap-12'>
        <img className='w-full md:max-w-[360px] rounded-lg' src={assets.about_image} alt="" />
        <div className='flex flex-col justify-center gap-6 md:w-2/4 text-sm text-gray-600'>
          <p>Welcome to Prescripto, your trusted partner in managing your healthcare needs conveniently and efficiently. At Prescripto, we understand the challenges individuals face when it comes to scheduling doctor appointments and managing their health records.</p>
          <p>Prescripto is committed to excellence in healthcare technology. We continuously strive to enhance our platform, integrating the latest advancements to improve user experience and deliver superior service. Whether you're booking your first appointment or managing ongoing care, Prescripto is here to support you every step of the way.</p>
          <b className='text-gray-800'>Our Vision</b>
          <p>Our vision at Prescripto is to create a seamless healthcare experience for every user. We aim to bridge the gap between patients and healthcare providers, making it easier for you to access the care you need, when you need it.</p>
        </div>
      </div>

      {/* WHY CHOOSE US — premium section */}
      <div className='pb-16'>
        <div className='text-center'>
          <p className='text-2xl text-gray-500'>WHY <span className='text-gray-700 font-medium'>CHOOSE US</span></p>
          <div className='w-16 h-[3px] bg-gradient-to-r from-primary to-indigo-400 mx-auto mt-3 rounded-full'></div>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-3 gap-6 mt-10'>
          {features.map((f, i) => (
            <div
              key={i}
              className='group relative bg-white border border-gray-100 rounded-2xl p-8 shadow-[0_2px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_30px_rgba(95,111,255,0.15)] hover:-translate-y-2 transition-all duration-500 ease-out overflow-hidden'
            >
              {/* top accent line that grows on hover */}
              <span className='absolute top-0 left-0 h-[3px] w-0 group-hover:w-full bg-gradient-to-r from-primary to-indigo-400 transition-all duration-500 ease-out'></span>

              {/* icon badge */}
              <div className='w-14 h-14 flex items-center justify-center rounded-xl bg-primary/10 text-primary mb-6 group-hover:bg-primary group-hover:text-white group-hover:scale-110 transition-all duration-500'>
                {f.icon}
              </div>

              <h3 className='text-[15px] font-semibold tracking-wide text-gray-800 mb-3'>
                {f.title}
              </h3>
              <p className='text-sm text-gray-500 leading-relaxed'>
                {f.desc}
              </p>

              {/* faint corner glow */}
              <span className='absolute -bottom-8 -right-8 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all duration-500'></span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default About