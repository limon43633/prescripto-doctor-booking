import { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { DoctorContext } from '../../context/DoctorContext'
import { AppContext } from '../../context/AppContext'
import PageHeader from '../../components/ui/PageHeader'
import Badge from '../../components/ui/Badge'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { IconWarning, IconX, IconCheck } from '../../components/ui/Icons'
import { assets } from '../../assets/assets'

const PatientAvatar = ({ image, name }) => {
  const [error, setError] = useState(false)
  const initials =
    (name || '')
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join('') || 'P'

  if (!image || error) {
    return (
      <div
        className="w-11 h-11 rounded-full bg-[#F2F4F7] text-[#344054] font-medium text-[14px] flex items-center justify-center shrink-0 select-none"
        aria-label={name || 'Patient'}
      >
        {initials}
      </div>
    )
  }

  return (
    <img
      src={image}
      alt={name || 'Patient'}
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

const getCancelledByDoctorText = (cancelledBy) => {
  if (cancelledBy === 'doctor') return 'by you'
  if (cancelledBy === 'user') return 'by patient'
  if (cancelledBy === 'admin') return 'by admin'
  return ''
}

const getCancelledFullPhrase = (item) => {
  const who =
    item.cancelledBy === 'doctor'
      ? 'you'
      : item.cancelledBy === 'user'
      ? 'patient'
      : item.cancelledBy === 'admin'
      ? 'admin'
      : ''
  if (!who) return 'Cancelled'
  const dateStr = formatCancelDate(item.cancelledAt)
  return dateStr ? `Cancelled by ${who} on ${dateStr}` : `Cancelled by ${who}`
}

const DoctorDashboard = () => {
  const { dToken, dashData, getDashData, completeAppointment, cancelAppointment } = useContext(DoctorContext)
  const { currency, slotDateFormat } = useContext(AppContext)

  const [loading, setLoading] = useState(Boolean(dToken) && !dashData)
  const [error, setError] = useState(false)

  // Confirmation dialog state: { type: 'cancel' | 'complete', appointment }
  const [actionDialog, setActionDialog] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    let isSubscribed = true
    if (dToken) {
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
  }, [dToken])

  const handleRetry = async () => {
    setLoading(true)
    setError(false)
    const ok = await getDashData()
    if (!ok && !dashData) {
      setError(true)
    }
    setLoading(false)
  }

  const handleConfirmAction = async () => {
    if (!actionDialog || actionLoading) return
    setActionLoading(true)

    const { type, appointment } = actionDialog
    let success = false
    if (type === 'cancel') {
      success = await cancelAppointment(appointment._id)
    } else if (type === 'complete') {
      success = await completeAppointment(appointment._id)
    }

    if (success) {
      await getDashData()
      setActionDialog(null)
    }
    setActionLoading(false)
  }

  return (
    <div className="max-w-5xl space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Dashboard"
        subtitle="Overview of your earnings, appointments, and recent bookings."
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
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-[#EAECF0] animate-admin-skeleton shrink-0" />
                    <div className="w-10 h-10 rounded-full bg-[#EAECF0] animate-admin-skeleton shrink-0" />
                  </div>
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
            {/* Earnings Card (Not a link) */}
            <div className="bg-white rounded-[20px] border border-[#EAECF0] shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-8px_rgba(16,24,40,0.06)] p-5 md:p-6 flex items-center gap-4">
              <img className="w-14 h-14 shrink-0 select-none" src={assets.earning_icon} alt="" />
              <div className="min-w-0">
                <p className="text-[30px] leading-[36px] font-semibold text-[#101828] tabular-nums truncate">
                  {currency}{dashData.earnings ?? 0}
                </p>
                <p className="text-[14px] text-[#667085] mt-0.5 truncate">Earnings</p>
              </div>
            </div>

            {/* Appointments Card (Link to /doctor-appointments) */}
            <Link
              to="/doctor-appointments"
              className="bg-white rounded-[20px] border border-[#EAECF0] shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-8px_rgba(16,24,40,0.06)] p-5 md:p-6 flex items-center gap-4 hover:border-[#D0D5DD] hover:bg-[#FCFCFD] transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-[#5F6FFF]/20 cursor-pointer"
            >
              <img className="w-14 h-14 shrink-0 select-none" src={assets.appointments_icon} alt="" />
              <div className="min-w-0">
                <p className="text-[30px] leading-[36px] font-semibold text-[#101828] tabular-nums truncate">
                  {dashData.appointments ?? 0}
                </p>
                <p className="text-[14px] text-[#667085] mt-0.5 truncate">Appointments</p>
              </div>
            </Link>

            {/* Patients Card (Not a link) */}
            <div className="bg-white rounded-[20px] border border-[#EAECF0] shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-8px_rgba(16,24,40,0.06)] p-5 md:p-6 flex items-center gap-4">
              <img className="w-14 h-14 shrink-0 select-none" src={assets.patients_icon} alt="" />
              <div className="min-w-0">
                <p className="text-[30px] leading-[36px] font-semibold text-[#101828] tabular-nums truncate">
                  {dashData.patients ?? 0}
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
                <img className="w-5 h-5 shrink-0 select-none" src={assets.list_icon} alt="" />
                <h2 className="text-[18px] leading-[26px] font-semibold text-[#101828]">
                  Latest appointments
                </h2>
              </div>
              <Link
                to="/doctor-appointments"
                className="text-[14px] font-medium text-[#5F6FFF] hover:text-[#4F5EEB] transition-colors focus:outline-none focus-visible:underline"
              >
                View all
              </Link>
            </div>

            {/* List or Empty State */}
            {!dashData.latestAppointments || dashData.latestAppointments.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#F2F4F7] text-[#667085] flex items-center justify-center">
                  <img className="w-6 h-6 shrink-0 opacity-60" src={assets.list_icon} alt="" />
                </div>
                <h3 className="text-[16px] font-semibold text-[#101828]">No appointments yet</h3>
                <p className="text-[14px] text-[#667085] max-w-sm mx-auto mt-1">
                  When patients book consultations with you, they will appear here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#F2F4F7]">
                {dashData.latestAppointments.map((item) => {
                  const isActive = !item.cancelled && !item.isCompleted

                  return (
                    <div
                      key={item._id}
                      className="min-h-[72px] px-5 py-3.5 sm:px-6 sm:py-4 flex items-center justify-between gap-4 hover:bg-[#FCFCFD] transition-colors"
                    >
                      {/* Left: Patient Avatar + Name + Booking Info */}
                      <div className="flex items-center gap-3.5 min-w-0">
                        <PatientAvatar
                          image={item.userData?.image}
                          name={item.userData?.name}
                        />
                        <div className="min-w-0">
                          <p className="text-[15px] sm:text-[16px] font-medium text-[#101828] truncate">
                            {item.userData?.name || 'Patient'}
                          </p>
                          <p className="text-[14px] text-[#667085] truncate mt-0.5 tabular-nums">
                            Booking on {slotDateFormat(item.slotDate)}
                            {item.slotTime ? ` · ${item.slotTime}` : ''}
                          </p>
                        </div>
                      </div>

                      {/* Right: Actions or Badges */}
                      <div className="shrink-0 flex items-center justify-end">
                        {isActive ? (
                          <div className="flex items-center gap-2">
                            {/* Cancel Button (X) */}
                            <button
                              type="button"
                              disabled={item.payment === true}
                              onClick={() => setActionDialog({ type: 'cancel', appointment: item })}
                              title={
                                item.payment === true
                                  ? 'Paid online — refunds not supported in demo'
                                  : `Cancel appointment with ${item.userData?.name || 'patient'}`
                              }
                              aria-label={
                                item.payment === true
                                  ? 'Paid online — refunds not supported in demo'
                                  : `Cancel appointment with ${item.userData?.name || 'patient'}`
                              }
                              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-4 relative before:absolute before:inset-[-2px] ${
                                item.payment === true
                                  ? 'bg-[#F2F4F7] text-[#98A2B3] opacity-60 cursor-not-allowed'
                                  : 'bg-[#FEF3F2] text-[#F04438] hover:bg-[#FEE4E2] cursor-pointer focus-visible:ring-[#F04438]/20'
                              }`}
                            >
                              <IconX className="w-4 h-4" />
                            </button>

                            {/* Complete Button (Check) */}
                            <button
                              type="button"
                              onClick={() => setActionDialog({ type: 'complete', appointment: item })}
                              title={`Mark appointment with ${item.userData?.name || 'patient'} as completed`}
                              aria-label={`Mark appointment with ${item.userData?.name || 'patient'} as completed`}
                              className="w-10 h-10 rounded-full bg-[#ECFDF3] text-[#12B76A] hover:bg-[#D1FADF] transition-colors cursor-pointer flex items-center justify-center focus:outline-none focus-visible:ring-4 focus-visible:ring-[#12B76A]/20 relative before:absolute before:inset-[-2px]"
                            >
                              <IconCheck className="w-4 h-4" />
                            </button>
                          </div>
                        ) : item.cancelled ? (
                          <div
                            className="inline-flex flex-col items-end gap-1 max-w-[120px]"
                            title={getCancelledFullPhrase(item)}
                            aria-label={getCancelledFullPhrase(item)}
                          >
                            <Badge variant="danger">Cancelled</Badge>
                            {item.cancelledBy && (
                              <span className="text-[13px] text-gray-500 truncate max-w-full">
                                {getCancelledByDoctorText(item.cancelledBy)}
                              </span>
                            )}
                          </div>
                        ) : (
                          <Badge variant="success">Completed</Badge>
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

      {/* Confirm Action Dialog */}
      {actionDialog && (
        <ConfirmDialog
          title={actionDialog.type === 'cancel' ? 'Cancel this appointment?' : 'Mark as completed?'}
          description={
            actionDialog.type === 'cancel'
              ? `Are you sure you want to cancel the appointment with ${
                  actionDialog.appointment.userData?.name || 'this patient'
                } on ${slotDateFormat(actionDialog.appointment.slotDate)} at ${
                  actionDialog.appointment.slotTime
                }? The doctor slot will be released.`
              : `Mark the appointment with ${
                  actionDialog.appointment.userData?.name || 'this patient'
                } on ${slotDateFormat(actionDialog.appointment.slotDate)} at ${
                  actionDialog.appointment.slotTime
                } as completed?`
          }
          confirmLabel={actionDialog.type === 'cancel' ? 'Yes, cancel appointment' : 'Yes, mark completed'}
          cancelLabel={actionDialog.type === 'cancel' ? 'Keep appointment' : 'Not yet'}
          danger={actionDialog.type === 'cancel'}
          loading={actionLoading}
          onConfirm={handleConfirmAction}
          onClose={() => {
            if (!actionLoading) setActionDialog(null)
          }}
        />
      )}
    </div>
  )
}

export default DoctorDashboard
