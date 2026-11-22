import { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'
import { Stethoscope, CalendarCheck, Users, ClipboardList } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import Badge from '../../components/ui/Badge'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { IconWarning, IconX } from '../../components/ui/Icons'

const DoctorAvatar = ({ image, name }) => {
  const [error, setError] = useState(false)
  const initials = (name || '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('') || 'D'

  if (!image || error) {
    return (
      <div
        className="w-11 h-11 rounded-full bg-[#F2F4F7] text-[#344054] font-medium text-[14px] flex items-center justify-center shrink-0 select-none"
        aria-label={name || 'Doctor'}
      >
        {initials}
      </div>
    )
  }

  return (
    <img
      src={image}
      alt={name || 'Doctor'}
      onError={() => setError(true)}
      className="w-11 h-11 rounded-full object-cover shrink-0 select-none"
    />
  )
}

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const formatCancelDate = (timestamp) => {
  if (!timestamp) return ''
  const d = new Date(timestamp)
  const day = d.getDate()
  const month = months[d.getMonth()]
  const year = d.getFullYear()
  return `${day} ${month}, ${year}`
}

const getCancelledByAdminText = (cancelledBy) => {
  if (cancelledBy === 'user') return 'by patient'
  if (cancelledBy === 'admin') return 'by admin'
  if (cancelledBy === 'doctor') return 'by doctor'
  return ''
}

const getCancelledFullPhrase = (item) => {
  const who = item.cancelledBy === 'user' ? 'patient' : item.cancelledBy === 'admin' ? 'admin' : item.cancelledBy === 'doctor' ? 'doctor' : ''
  if (!who) return 'Cancelled'
  const dateStr = formatCancelDate(item.cancelledAt)
  return dateStr ? `Cancelled by ${who} on ${dateStr}` : `Cancelled by ${who}`
}

const Dashboard = () => {
  const { aToken, dashData, getDashData, cancelAppointment } = useContext(AdminContext)
  const { slotDateFormat } = useContext(AppContext)

  const [loading, setLoading] = useState(Boolean(aToken) && !dashData)
  const [error, setError] = useState(false)

  // Cancellation state
  const [appointmentToCancel, setAppointmentToCancel] = useState(null)
  const [isCancelling, setIsCancelling] = useState(false)

  useEffect(() => {
    let isSubscribed = true
    if (aToken) {
      getDashData()
        .then((ok) => {
          if (isSubscribed) {
            if (!ok && !dashData) setError(true)
            setLoading(false)
          }
        })
        .catch(() => {
          if (isSubscribed) {
            if (!dashData) setError(true)
            setLoading(false)
          }
        })
    }
    return () => {
      isSubscribed = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aToken])

  const handleRetry = async () => {
    setLoading(true)
    setError(false)
    const ok = await getDashData()
    if (!ok && !dashData) {
      setError(true)
    }
    setLoading(false)
  }

  const handleConfirmCancel = async () => {
    if (!appointmentToCancel || isCancelling) return
    setIsCancelling(true)
    const ok = await cancelAppointment(appointmentToCancel._id)
    if (ok) {
      await getDashData()
      setAppointmentToCancel(null)
    }
    setIsCancelling(false)
  }

  return (
    <div className="max-w-5xl space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Dashboard"
        subtitle="Overview of platform doctors, appointments, and recent bookings."
      />

      {/* State A: Loading Skeleton */}
      {loading && !dashData && (
        <div className="space-y-6" aria-busy="true">
          {/* Skeleton Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-[20px] border border-[#EAECF0] shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-8px_rgba(16,24,40,0.06)] p-5 md:p-6 flex items-center gap-4"
              >
                <div className="w-14 h-14 rounded-xl bg-[#EAECF0] animate-admin-skeleton shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-7 w-16 bg-[#EAECF0] rounded-[6px] animate-admin-skeleton" />
                  <div className="h-4 w-24 bg-[#F2F4F7] rounded-[6px] animate-admin-skeleton" />
                </div>
              </div>
            ))}
          </div>

          {/* Skeleton Latest Appointments */}
          <div className="bg-white rounded-[20px] border border-[#EAECF0] shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-8px_rgba(16,24,40,0.06)] overflow-hidden">
            <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-[#F2F4F7] flex items-center justify-between">
              <div className="h-5 w-44 bg-[#EAECF0] rounded-[6px] animate-admin-skeleton" />
              <div className="h-4 w-16 bg-[#F2F4F7] rounded-[6px] animate-admin-skeleton" />
            </div>
            <div className="divide-y divide-[#F2F4F7]">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="min-h-[72px] px-5 py-3.5 sm:px-6 sm:py-4 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-11 h-11 rounded-full bg-[#EAECF0] animate-admin-skeleton shrink-0" />
                    <div className="space-y-2">
                      <div className="h-4 w-36 bg-[#EAECF0] rounded-[6px] animate-admin-skeleton" />
                      <div className="h-3 w-48 bg-[#F2F4F7] rounded-[6px] animate-admin-skeleton" />
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-[#EAECF0] animate-admin-skeleton shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* State B: Error */}
      {!loading && error && !dashData && (
        <div className="p-12 text-center bg-white rounded-[20px] border border-[#EAECF0] shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-8px_rgba(16,24,40,0.06)]">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#FEF3F2] text-[#F04438] flex items-center justify-center">
            <IconWarning className="w-6 h-6" />
          </div>
          <h2 className="text-[18px] font-semibold text-[#101828]">Failed to load dashboard</h2>
          <p className="text-[14px] text-[#667085] max-w-sm mx-auto mt-1 mb-5">
            There was a problem communicating with the server. Please try again.
          </p>
          <button
            type="button"
            onClick={handleRetry}
            className="h-10 px-5 rounded-[12px] bg-[#5F6FFF] hover:bg-[#4F5EEB] text-white text-[14px] font-medium transition-all cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-[#5F6FFF]/20"
          >
            Try again
          </button>
        </div>
      )}

      {/* State C: Loaded Data */}
      {dashData && (
        <>
          {/* Stat Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {/* Doctors Card (Link) */}
            <Link
              to="/doctor-list"
              className="bg-white rounded-[20px] border border-[#EAECF0] shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-8px_rgba(16,24,40,0.06)] p-5 md:p-6 flex items-center gap-4 hover:border-[#D0D5DD] hover:bg-[#FCFCFD] transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-[#5F6FFF]/20 cursor-pointer"
            >
              <div className="w-14 h-14 rounded-xl bg-[#F4F6FB] flex items-center justify-center shrink-0">
                <Stethoscope className="w-7 h-7 text-[#5F6FFF]" />
              </div>
              <div className="min-w-0">
                <p className="text-[30px] leading-[36px] font-semibold text-[#101828] tabular-nums truncate">
                  {dashData.doctors}
                </p>
                <p className="text-[14px] text-[#667085] mt-0.5 truncate">Doctors</p>
              </div>
            </Link>

            {/* Appointments Card (Link) */}
            <Link
              to="/all-appointments"
              className="bg-white rounded-[20px] border border-[#EAECF0] shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-8px_rgba(16,24,40,0.06)] p-5 md:p-6 flex items-center gap-4 hover:border-[#D0D5DD] hover:bg-[#FCFCFD] transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-[#5F6FFF]/20 cursor-pointer"
            >
              <div className="w-14 h-14 rounded-xl bg-[#F4F6FB] flex items-center justify-center shrink-0">
                <CalendarCheck className="w-7 h-7 text-[#5F6FFF]" />
              </div>
              <div className="min-w-0">
                <p className="text-[30px] leading-[36px] font-semibold text-[#101828] tabular-nums truncate">
                  {dashData.appointments}
                </p>
                <p className="text-[14px] text-[#667085] mt-0.5 truncate">Appointments</p>
              </div>
            </Link>

            {/* Patients Card (Not a link) */}
            <div className="bg-white rounded-[20px] border border-[#EAECF0] shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-8px_rgba(16,24,40,0.06)] p-5 md:p-6 flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-[#F4F6FB] flex items-center justify-center shrink-0">
                <Users className="w-7 h-7 text-[#5F6FFF]" />
              </div>
              <div className="min-w-0">
                <p className="text-[30px] leading-[36px] font-semibold text-[#101828] tabular-nums truncate">
                  {dashData.patients}
                </p>
                <p className="text-[14px] text-[#667085] mt-0.5 truncate">Patients</p>
              </div>
            </div>
          </div>

          {/* Latest Appointments Card */}
          <div className="bg-white rounded-[20px] border border-[#EAECF0] shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-8px_rgba(16,24,40,0.06)] overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-[#F2F4F7] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ClipboardList className="w-5 h-5 text-[#5F6FFF]" />
                <h2 className="text-[18px] leading-[26px] font-semibold text-[#101828]">
                  Latest appointments
                </h2>
              </div>
              <Link
                to="/all-appointments"
                className="text-[14px] font-medium text-[#5F6FFF] hover:text-[#4F5EEB] transition-colors focus:outline-none focus-visible:underline"
              >
                View all
              </Link>
            </div>

            {/* List or Empty State */}
            {!dashData.latestAppointments || dashData.latestAppointments.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#F2F4F7] text-[#667085] flex items-center justify-center">
                  <ClipboardList className="w-6 h-6 text-[#667085]" />
                </div>
                <h3 className="text-[16px] font-semibold text-[#101828]">No appointments yet</h3>
                <p className="text-[14px] text-[#667085] max-w-sm mx-auto mt-1">
                  When patients book consultations with doctors, they will appear here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#F2F4F7]">
                {dashData.latestAppointments.map((item) => {
                  const isCancellable = !item.cancelled && !item.isCompleted && !item.payment
                  const cancelDisabledReason = item.cancelled
                    ? 'Already cancelled'
                    : item.isCompleted
                      ? 'Completed'
                      : item.payment
                        ? 'Paid online — refunds not supported in demo'
                        : ''

                  return (
                    <div
                      key={item._id}
                      className="min-h-[72px] px-5 py-3.5 sm:px-6 sm:py-4 flex items-center justify-between gap-4 hover:bg-[#FCFCFD] transition-colors"
                    >
                      {/* Left: Doctor Avatar + Name + Booking Info */}
                      <div className="flex items-center gap-3.5 min-w-0">
                        <DoctorAvatar
                          image={item.docData?.image}
                          name={item.docData?.name}
                        />
                        <div className="min-w-0">
                          <p className="text-[15px] sm:text-[16px] font-medium text-[#101828] truncate">
                            {item.docData?.name || 'Doctor'}
                          </p>
                          <p className="text-[14px] text-[#667085] truncate mt-0.5 tabular-nums">
                            Booking on {slotDateFormat(item.slotDate)}
                            {item.slotTime ? ` · ${item.slotTime}` : ''}
                          </p>
                        </div>
                      </div>

                      {/* Right: Action or Status Badge */}
                      <div className="shrink-0 flex items-center justify-end">
                        {item.cancelled ? (
                          <div
                            className="flex flex-col items-end gap-1 max-w-[120px]"
                            title={getCancelledFullPhrase(item)}
                            aria-label={getCancelledFullPhrase(item)}
                          >
                            <Badge variant="danger">Cancelled</Badge>
                            {item.cancelledBy && (
                              <span className="text-[13px] text-gray-500 truncate max-w-full">
                                {getCancelledByAdminText(item.cancelledBy)}
                              </span>
                            )}
                          </div>
                        ) : item.isCompleted ? (
                          <Badge variant="success">Completed</Badge>
                        ) : isCancellable ? (
                          <button
                            type="button"
                            onClick={() => setAppointmentToCancel(item)}
                            aria-label={`Cancel appointment with ${item.docData?.name || 'doctor'}`}
                            className="w-10 h-10 rounded-full bg-[#FEF3F2] text-[#F04438] hover:bg-[#FEE4E2] transition-colors cursor-pointer flex items-center justify-center focus:outline-none focus-visible:ring-4 focus-visible:ring-[#F04438]/20"
                          >
                            <IconX className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled
                            title={cancelDisabledReason}
                            aria-label={`Cannot cancel: ${cancelDisabledReason}`}
                            className="w-10 h-10 rounded-full bg-[#F2F4F7] text-[#98A2B3] opacity-60 cursor-not-allowed flex items-center justify-center"
                          >
                            <IconX className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* Confirm Cancellation Dialog */}
      {appointmentToCancel && (
        <ConfirmDialog
          title="Cancel this appointment?"
          description={
            <div className="space-y-3">
              <p>
                Please review the booking details below before proceeding with the cancellation:
              </p>
              <div className="p-3.5 rounded-[12px] bg-[#F9FAFB] border border-[#EAECF0] text-[13px] text-[#344054] space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-[#667085]">Doctor:</span>
                  <span className="font-medium text-[#101828]">
                    {appointmentToCancel.docData?.name || 'Doctor'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#667085]">Schedule:</span>
                  <span className="font-medium text-[#101828] tabular-nums">
                    {slotDateFormat(appointmentToCancel.slotDate)} · {appointmentToCancel.slotTime}
                  </span>
                </div>
              </div>
              <p className="text-[13px] text-[#B42318] bg-[#FEF3F2] p-2.5 rounded-[8px] leading-relaxed">
                The doctor&apos;s time slot will be released immediately and become available for other patients to book online.
              </p>
            </div>
          }
          confirmLabel={isCancelling ? 'Cancelling...' : 'Yes, cancel appointment'}
          cancelLabel="Keep appointment"
          danger={true}
          loading={isCancelling}
          onConfirm={handleConfirmCancel}
          onClose={() => {
            if (!isCancelling) setAppointmentToCancel(null)
          }}
        />
      )}
    </div>
  )
}

export default Dashboard
