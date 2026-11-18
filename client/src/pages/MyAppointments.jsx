import { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import { MapPin, Calendar } from 'lucide-react'
import { toast } from 'react-toastify'
import axios from 'axios'
import PaymentModal from '../components/PaymentModal'

const MyAppointments = () => {
  const { backendUrl, token, getDoctorsData } = useContext(AppContext)

  const [appointments, setAppointments] = useState([])
  const [selectedAppointment, setSelectedAppointment] = useState(null)

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  // "17_11_2026" -> "17 Nov, 2026"
  const slotDateFormat = (slotDate) => {
    const [day, month, year] = slotDate.split('_')
    return `${day} ${months[Number(month) - 1]}, ${year}`
  }

  const getUserAppointments = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/user/appointments', { headers: { token } })

      if (data.success) {
        setAppointments(data.appointments)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(backendUrl + '/api/user/cancel-appointment',{appointmentId},{headers:{token}}
      )

      if (data.success) {
        toast.success(data.message)
        getUserAppointments()   // list refresh (cancelled status dekhabe)
        getDoctorsData()        // doctor er slot free hoyeche, tai doctors o refresh
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  useEffect(() => {
    if (token) {
      getUserAppointments()
    }
  }, [token])

  return (
    <div className='max-w-3xl mx-auto px-4 py-16'>
      <h1 className='text-2xl font-semibold text-gray-800 mb-1'>My appointments</h1>
      <p className='text-sm text-gray-500 mb-8'>Manage your upcoming and past bookings.</p>

      <div className='flex flex-col gap-5'>
        {appointments.length === 0 && (
          <p className='text-sm text-gray-400'>You have no appointments yet.</p>
        )}

        {appointments.map((item) => (
          <div
            key={item._id}
            className='bg-white border border-gray-200 rounded-2xl p-5 flex flex-col sm:flex-row gap-5'
          >
            {/* Fixed size on mobile so the photo never stretches */}
            <img
              className='w-full h-full sm:w-28 sm:h-28 rounded-xl object-cover border border-primary/10 bg-primary/5 shrink-0 mx-auto sm:mx-0'
              src={item.docData.image}
              alt={item.docData.name}
            />

            <div className='flex-1 flex flex-col sm:flex-row gap-4 sm:items-center'>
              <div className='flex-1 text-center sm:text-left'>
                <p className='text-base font-semibold text-gray-800'>{item.docData.name}</p>
                <p className='text-sm text-primary mb-3'>{item.docData.speciality}</p>

                <div className='flex items-start justify-center sm:justify-start gap-2 mb-1.5'>
                  <MapPin size={14} className='text-gray-400 mt-0.5 shrink-0' />
                  <p className='text-xs text-gray-500 leading-relaxed'>
                    {item.docData.address?.line1}, {item.docData.address?.line2}
                  </p>
                </div>

                <div className='flex items-center justify-center sm:justify-start gap-2'>
                  <Calendar size={14} className='text-gray-400 shrink-0' />
                  <p className='text-xs text-gray-500'>
                    {slotDateFormat(item.slotDate)} · {item.slotTime}
                  </p>
                </div>
              </div>

              <div className='flex sm:flex-col gap-2 shrink-0'>
                {item.cancelled ? (
                  <p className='flex-1 sm:w-40 text-center text-sm font-medium border border-red-200 bg-red-50 text-red-500 py-2.5 rounded-lg'>
                    Appointment cancelled
                  </p>
                ) : item.payment ? (
                  <p className='flex-1 sm:w-40 text-center text-sm font-medium border border-emerald-200 bg-emerald-50 text-emerald-600 py-2.5 rounded-lg'>
                    Paid
                  </p>
                ) : (
                  <>
                    <button
                      onClick={() => setSelectedAppointment(item)}
                      className='flex-1 sm:w-40 text-sm font-medium border border-gray-200 text-gray-600 py-2.5 rounded-lg hover:bg-primary/80 cursor-pointer hover:text-white hover:border-primary transition-colors duration-300'
                    >
                      Pay online
                    </button>
                    <button
                      onClick={() => cancelAppointment(item._id)}
                      className='flex-1 sm:w-40 text-sm font-medium border border-gray-200 text-gray-600 py-2.5 rounded-lg hover:bg-red-400 hover:text-white hover:border-red-500 transition-colors duration-300 cursor-pointer'
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <PaymentModal
        appointment={selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
        onPaid={getUserAppointments}
      />
    </div>
  )
}

export default MyAppointments