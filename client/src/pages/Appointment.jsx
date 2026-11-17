import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import RelatedDoctors from '../components/RelatedDoctors'
import { toast } from 'react-toastify'
import axios from 'axios'

const Appointment = () => {

  const { docId } = useParams()
  const { doctors, currencySymbol, backendUrl, token, getDoctorsData } = useContext(AppContext)
  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

  const navigate = useNavigate()

  const [docInfo, setDocInfo] = useState(null)
  const [docSlots, setDocSlots] = useState([])
  const [slotIndex, setSlotIndex] = useState(0)
  const [slotTime, setSlotTime] = useState('')

  const fetchDocInfo = async () => {
    const docInfo = doctors.find(doc => doc._id === docId)
    setDocInfo(docInfo)
  }

  const getAvailableSlots = async () => {
    if (!docInfo) return

    const allSlots = []

    // getting current date
    let today = new Date()

    for (let i = 0; i < 7; i++) {
      // getting date with index
      let currentDate = new Date(today)
      currentDate.setDate(today.getDate() + i)

      // setting end time of the date with index
      let endTime = new Date()
      endTime.setDate(today.getDate() + i)
      endTime.setHours(21, 0, 0, 0)

      // setting hours
      if (today.getDate() === currentDate.getDate()) {
        currentDate.setHours(currentDate.getHours() > 10 ? currentDate.getHours() + 1 : 10)
        currentDate.setMinutes(currentDate.getMinutes() > 30 ? 30 : 0)
      } else {
        currentDate.setHours(10)
        currentDate.setMinutes(0)
      }

      // oi diner slotDate key (backend er format er moto: day_month_year)
      const slotDate = currentDate.getDate() + '_' + (currentDate.getMonth() + 1) + '_' + currentDate.getFullYear()

      let timeSlots = []

      while (currentDate < endTime) {
        let formattedTime = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

        // already booked kina check
        const isBooked = docInfo.slots_booked?.[slotDate]?.includes(formattedTime)

        // sob slot push hobe, booked hole flag true thakbe (UI te disabled dekhabe)
        timeSlots.push({
          datetime: new Date(currentDate),
          time: formattedTime,
          booked: !!isBooked,
        })

        // Increment current time by 30 minute
        currentDate.setMinutes(currentDate.getMinutes() + 30)
      }

      allSlots.push(timeSlots)
    }

    setDocSlots(allSlots)
  }

  const bookAppointment = async () => {
    if (!token) {
      toast.warn('Login to book appointment')
      return navigate('/login')
    }

    if (!slotTime) {
      return toast.warn('Please select a time slot')
    }

    try {
      // slotIndex er din er date ber koro (docSlots[slotIndex][0] khali hote pare)
      const date = new Date()
      date.setDate(date.getDate() + slotIndex)

      const slotDate = date.getDate() + '_' + (date.getMonth() + 1) + '_' + date.getFullYear()

      const { data } = await axios.post(
        backendUrl + '/api/user/book-appointment',
        { docId, slotDate, slotTime },
        { headers: { token } }
      )

      if (data.success) {
        toast.success(data.message)
        getDoctorsData()
        navigate('/my-appointments')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  useEffect(() => {
    fetchDocInfo()
  }, [doctors, docId])

  useEffect(() => {
    getAvailableSlots()
  }, [docInfo])

  return docInfo && (
    <div>
      {/* Doctor details */}
      <div className='flex flex-col sm:flex-row gap-4'>
        {/* Right side image portion */}
        <div>
          <img className='bg-primary w-full sm:max-w-72 rounded-lg' src={docInfo.image} alt="" />
        </div>

        {/* Left side info portion */}
        <div className='flex-1 border border-gray-400 rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0'>
          <p className='flex items-center gap-2 text-3xl font-medium text-gray-900'>
            {docInfo.name} <img className='w-5' src={assets.verified_icon} alt="" />
          </p>
          <div className='flex items-center gap-2 text-base mt-1 text-gray-600'>
            <p>{docInfo.degree} - {docInfo.speciality}</p>
            <button className='py-0.5 px-2 border border-gray-400 text-xs rounded-full'>{docInfo.experience}</button>
          </div>
          <div>
            <p className='flex items-center gap-2 text-sm font-medium text-gray-900 mt-3'>About <img src={assets.info_icon} alt="" /></p>
            <p className='text-sm text-gray-500 max-w-[700px] mt-1'>{docInfo.about}</p>
          </div>

          <p className='text-gray-500 font-medium mt-4'>
            Appointment fee: <span className='text-gray-600'>{currencySymbol}{docInfo.fees}</span>
          </p>
        </div>
      </div>

      {/*-- Booking slots --*/}
      <div className='sm:ml-72 sm:pl-4 mt-8 font-medium text-gray-700'>
        <p>Booking slots</p>

        {/* day buttons */}
        <div className='flex gap-3 items-center w-full overflow-x-scroll mt-4'>
          {
            docSlots.length > 0 && docSlots.map((item, index) => {
              // item[0] undefined hote pare (jemon aaj er shob slot pass hoye gele),
              // tai index diye date ber kora hocche
              let displayDate = new Date()
              displayDate.setDate(displayDate.getDate() + index)

              return (
                <div
                  onClick={() => { setSlotIndex(index); setSlotTime('') }}
                  className={`text-center py-6 min-w-16 rounded-full cursor-pointer ${slotIndex === index ? 'bg-primary text-white' : 'border border-gray-300'}`}
                  key={index}
                >
                  <p>{daysOfWeek[displayDate.getDay()]}</p>
                  <p>{displayDate.getDate()}</p>
                </div>
              )
            })
          }
        </div>

        {/* time buttons */}
        <div className='flex sm:flex-wrap items-center gap-3 w-full overflow-x-scroll sm:overflow-visible mt-4 min-w-0'>
          {docSlots.length > 0 && docSlots[slotIndex]?.length > 0 ? (
            docSlots[slotIndex].map((item, index) => (
              <p
                key={index}
                onClick={() => !item.booked && setSlotTime(item.time)}
                title={item.booked ? 'Already booked' : ''}
                className={`text-sm font-light flex-shrink-0 px-5 py-2 rounded-full ${item.booked
                  ? 'text-gray-300 border border-gray-200 bg-gray-50 line-through cursor-not-allowed'
                  : item.time === slotTime
                    ? 'bg-primary text-white cursor-pointer'
                    : 'text-gray-400 border border-2 border-gray-300 cursor-pointer'
                  }`}
              >
                {item.time.toLowerCase()}
              </p>
            ))
          ) : (
            docSlots.length > 0 && <p className='text-sm text-gray-400'>No slots available for this day</p>
          )}
        </div>

        {/* shob slot booked hole message */}
        {docSlots.length > 0 && docSlots[slotIndex]?.length > 0 && docSlots[slotIndex].every(s => s.booked) && (
          <p className='text-sm text-gray-400 mt-3'>All slots are booked for this day. Please choose another day.</p>
        )}

        {/* book appointment button*/}
        <button onClick={bookAppointment} className='bg-primary text-white text-sm font-light px-14 py-3 rounded-full my-6'>
          Book an appointment
        </button>
      </div>

      {/* listing related doctors */}
      <RelatedDoctors docId={docId} speciality={docInfo.speciality} />
    </div>
  )
}

export default Appointment