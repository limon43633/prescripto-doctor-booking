import { useContext, useEffect, useState, useMemo } from 'react'
import PageHeader from '../../components/ui/PageHeader'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { IconCheck, IconX, IconWarning, IconCalendar } from '../../components/ui/Icons'
import { DoctorContext } from '../../context/DoctorContext'
import { AppContext } from '../../context/AppContext'

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

// Parse "22_11_2026" and "11:00 AM" into epoch timestamp for robust chronological sorting
const parseSlotDateTime = (slotDate, slotTime, fallbackTimestamp) => {
  try {
    if (!slotDate || typeof slotDate !== 'string') return fallbackTimestamp || 0
    const parts = slotDate.split('_')
    if (parts.length !== 3) return fallbackTimestamp || 0
    const day = parseInt(parts[0], 10)
    const month = parseInt(parts[1], 10) - 1
    const year = parseInt(parts[2], 10)

    let hours = 0
    let minutes = 0
    if (slotTime && typeof slotTime === 'string') {
      const match = slotTime.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i)
      if (match) {
        hours = parseInt(match[1], 10)
        minutes = parseInt(match[2], 10)
        const period = match[3]?.toUpperCase()
        if (period === 'PM' && hours < 12) hours += 12
        if (period === 'AM' && hours === 12) hours = 0
      }
    }
    const d = new Date(year, month, day, hours, minutes)
    const t = d.getTime()
    return isNaN(t) ? (fallbackTimestamp || 0) : t
  } catch {
    return fallbackTimestamp || 0
  }
}

// Table grid column definition for XL desktop screens (1280px+)
const DESKTOP_GRID = 'grid-cols-[48px_minmax(200px,2fr)_100px_80px_minmax(160px,1.4fr)_90px_110px]'

const DoctorAppointments = () => {
  const { dToken, appointments, getAppointments, completeAppointment, cancelAppointment } = useContext(DoctorContext)
  const { calculateAge, slotDateFormat, currency } = useContext(AppContext)

  const [loading, setLoading] = useState(Boolean(dToken) && (!appointments || appointments.length === 0))
  const [error, setError] = useState(false)

  // Confirmation dialog state: { type: 'cancel' | 'complete', appointment }
  const [actionDialog, setActionDialog] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  // Fetch appointments on mount / when token changes
  useEffect(() => {
    let isSubscribed = true
    if (dToken) {
      getAppointments()
        .then((ok) => {
          if (isSubscribed) {
            if (!ok && (!appointments || appointments.length === 0)) setError(true)
            setLoading(false)
          }
        })
        .catch(() => {
          if (isSubscribed) {
            if (!appointments || appointments.length === 0) setError(true)
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
    const ok = await getAppointments()
    if (!ok && (!appointments || appointments.length === 0)) {
      setError(true)
    }
    setLoading(false)
  }

  // Active appointments first (soonest first), then completed and cancelled (newest first)
  const sortedAppointments = useMemo(() => {
    if (!Array.isArray(appointments)) return []

    const active = []
    const inactive = []

    for (const appt of appointments) {
      if (!appt.cancelled && !appt.isCompleted) {
        active.push(appt)
      } else {
        inactive.push(appt)
      }
    }

    // Active: soonest appointment date/time first (ascending)
    active.sort((a, b) => {
      const timeA = parseSlotDateTime(a.slotDate, a.slotTime, a.date)
      const timeB = parseSlotDateTime(b.slotDate, b.slotTime, b.date)
      return timeA - timeB
    })

    // Inactive: newest booking first (descending)
    inactive.sort((a, b) => {
      const timeA = parseSlotDateTime(a.slotDate, a.slotTime, a.date)
      const timeB = parseSlotDateTime(b.slotDate, b.slotTime, b.date)
      return timeB - timeA
    })

    return [...active, ...inactive]
  }, [appointments])

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

    setActionLoading(false)
    if (success) {
      setActionDialog(null)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="All Appointments"
        subtitle="See all new appointments for the Prescripto platform."
      />

      {/* Main Content Card */}
      <div className="bg-white rounded-[20px] border border-[#EAECF0] shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-8px_rgba(16,24,40,0.06)] overflow-hidden">
        {/* State A: Loading Skeleton */}
        {loading && (!appointments || appointments.length === 0) && (
          <div aria-busy="true" className="divide-y divide-[#F2F4F7]">
            {/* Desktop skeleton header */}
            <div className="hidden xl:grid h-11 bg-[#F9FAFB] border-b border-[#EAECF0] px-6 grid-cols-7 items-center gap-4">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="h-4 bg-[#EAECF0] rounded-[6px] animate-pulse w-3/4" />
              ))}
            </div>

            {/* Skeleton rows */}
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="p-4 sm:p-6 xl:px-6 xl:py-4 xl:h-[72px] flex flex-col xl:grid xl:grid-cols-7 items-start xl:items-center gap-4"
              >
                <div className="w-8 h-4 bg-[#EAECF0] rounded-[6px] animate-pulse hidden xl:block" />
                <div className="flex items-center gap-3 w-full xl:w-auto">
                  <div className="w-10 h-10 rounded-full bg-[#EAECF0] animate-pulse shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-32 bg-[#EAECF0] rounded-[6px] animate-pulse" />
                    <div className="h-3 w-20 bg-[#F2F4F7] rounded-[6px] animate-pulse xl:hidden" />
                  </div>
                </div>
                <div className="h-6 w-16 bg-[#EAECF0] rounded-full animate-pulse" />
                <div className="h-4 w-12 bg-[#EAECF0] rounded-[6px] animate-pulse hidden xl:block" />
                <div className="space-y-1.5 hidden xl:block">
                  <div className="h-4 w-24 bg-[#EAECF0] rounded-[6px] animate-pulse" />
                  <div className="h-3 w-16 bg-[#F2F4F7] rounded-[6px] animate-pulse" />
                </div>
                <div className="h-4 w-14 bg-[#EAECF0] rounded-[6px] animate-pulse hidden xl:block" />
                <div className="flex gap-2 w-full xl:w-auto justify-end">
                  <div className="w-10 h-10 rounded-full bg-[#EAECF0] animate-pulse shrink-0" />
                  <div className="w-10 h-10 rounded-full bg-[#EAECF0] animate-pulse shrink-0" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* State B: Error State */}
        {!loading && error && (!appointments || appointments.length === 0) && (
          <div className="p-12 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#FEF3F2] text-[#F04438] flex items-center justify-center">
              <IconWarning className="w-6 h-6" />
            </div>
            <h2 className="text-[18px] font-semibold text-[#101828]">Failed to load appointments</h2>
            <p className="text-[14px] text-[#667085] max-w-sm mx-auto mt-1 mb-5 leading-relaxed">
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

        {/* State C: Empty State */}
        {!loading && !error && sortedAppointments.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#F2F4F7] text-[#667085] flex items-center justify-center">
              <IconCalendar className="w-6 h-6" />
            </div>
            <h3 className="text-[16px] font-semibold text-[#101828]">No appointments yet</h3>
            <p className="text-[14px] text-[#667085] max-w-sm mx-auto mt-1">
              When patients book consultations with you, they will appear here.
            </p>
          </div>
        )}

        {/* State D: Populated Appointments Table (xl+) & Stacked Cards (< xl) */}
        {!loading && !error && sortedAppointments.length > 0 && (
          <>
            {/* Desktop Table (xl: 1280px+) */}
            <div className="hidden xl:block">
              {/* Table Header */}
              <div
                className={`h-11 bg-[#F9FAFB] border-b border-[#EAECF0] text-[13px] font-medium text-[#667085] px-6 grid ${DESKTOP_GRID} items-center gap-4`}
              >
                <span>#</span>
                <span>Patient</span>
                <span>Payment</span>
                <span>Age</span>
                <span>Date & time</span>
                <span>Fees</span>
                <span className="text-right pr-2">Action</span>
              </div>

              {/* Table Rows */}
              <div className="divide-y divide-[#F2F4F7]">
                {sortedAppointments.map((item, index) => {
                  const patientAge = calculateAge(item.userData?.dob)
                  const isActive = !item.cancelled && !item.isCompleted

                  return (
                    <div
                      key={item._id}
                      className={`min-h-[72px] px-6 py-3.5 grid ${DESKTOP_GRID} items-center gap-4 hover:bg-[#FCFCFD] transition-colors`}
                    >
                      {/* # */}
                      <span className="text-[14px] font-medium text-[#667085] tabular-nums">
                        {index + 1}
                      </span>

                      {/* Patient */}
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar src={item.userData?.image} name={item.userData?.name} size="md" />
                        <span className="text-[15px] font-medium text-[#101828] truncate">
                          {item.userData?.name || 'Unknown Patient'}
                        </span>
                      </div>

                      {/* Payment */}
                      <div>
                        {item.payment ? (
                          <Badge variant="success">Online</Badge>
                        ) : (
                          <span className="inline-flex items-center h-6 px-2.5 rounded-full text-[12px] font-semibold border border-[#D0D5DD] bg-white text-[#344054] select-none tracking-wide">
                            Cash
                          </span>
                        )}
                      </div>

                      {/* Age */}
                      <span className="text-[15px] text-[#101828] tabular-nums">
                        {patientAge !== null ? `${patientAge} yrs` : '—'}
                      </span>

                      {/* Date & Time */}
                      <div className="min-w-0">
                        <p className="text-[15px] font-medium text-[#101828] tabular-nums truncate">
                          {slotDateFormat(item.slotDate)}
                        </p>
                        <p className="text-[13px] text-[#667085] tabular-nums truncate">
                          {item.slotTime}
                        </p>
                      </div>

                      {/* Fees */}
                      <span className="text-[15px] font-medium text-[#101828] tabular-nums">
                        {currency}{item.amount ?? 0}
                      </span>

                      {/* Action */}
                      <div className="flex items-center justify-end">
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
                              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-4 ${
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
                              className="w-10 h-10 rounded-full bg-[#ECFDF3] text-[#12B76A] hover:bg-[#D1FADF] transition-colors cursor-pointer flex items-center justify-center focus:outline-none focus-visible:ring-4 focus-visible:ring-[#12B76A]/20"
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
            </div>

            {/* Mobile & Tablet Card Layout (< xl: 1279px and down) */}
            <div className="xl:hidden p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {sortedAppointments.map((item, index) => {
                const patientAge = calculateAge(item.userData?.dob)
                const isActive = !item.cancelled && !item.isCompleted

                return (
                  <div
                    key={item._id}
                    className="bg-white rounded-2xl border border-[#EAECF0] shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-8px_rgba(16,24,40,0.06)] p-4 sm:p-5 flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-3.5">
                      {/* Top: Patient avatar + name and Status/Payment Badge */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar src={item.userData?.image} name={item.userData?.name} size="md" />
                          <div className="min-w-0">
                            <p className="text-[15px] font-medium text-[#101828] truncate">
                              {item.userData?.name || 'Unknown Patient'}
                            </p>
                            <p className="text-[12px] font-medium text-[#667085] tabular-nums">
                              #{index + 1}
                            </p>
                          </div>
                        </div>

                        {/* Status or Payment badge on right */}
                        <div className="shrink-0">
                          {item.cancelled ? (
                            <div
                              className="flex flex-col items-end gap-0.5"
                              title={getCancelledFullPhrase(item)}
                              aria-label={getCancelledFullPhrase(item)}
                            >
                              <Badge variant="danger">Cancelled</Badge>
                              {item.cancelledBy && (
                                <span className="text-[12px] text-gray-500">
                                  {getCancelledByDoctorText(item.cancelledBy)}
                                </span>
                              )}
                            </div>
                          ) : item.isCompleted ? (
                            <Badge variant="success">Completed</Badge>
                          ) : item.payment ? (
                            <Badge variant="success">Online</Badge>
                          ) : (
                            <span className="inline-flex items-center h-6 px-2.5 rounded-full text-[12px] font-semibold border border-[#D0D5DD] bg-white text-[#344054] select-none tracking-wide">
                              Cash
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Meta Information Block */}
                      <div className="rounded-[12px] bg-[#F9FAFB] p-3 space-y-2 text-[13px]">
                        <div className="flex items-center justify-between text-[#667085]">
                          <span>Schedule:</span>
                          <span className="font-medium text-[#101828] tabular-nums">
                            {slotDateFormat(item.slotDate)} · {item.slotTime}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[#667085]">
                          <span>Age:</span>
                          <span className="font-medium text-[#101828] tabular-nums">
                            {patientAge !== null ? `${patientAge} yrs` : '—'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[#667085]">
                          <span>Fees:</span>
                          <span className="font-semibold text-[#101828] tabular-nums">
                            {currency}{item.amount ?? 0}
                          </span>
                        </div>

                        {/* Show payment type if inactive */}
                        {!isActive && (
                          <div className="flex items-center justify-between text-[#667085]">
                            <span>Payment:</span>
                            <span className="font-medium text-[#101828]">
                              {item.payment ? 'Online' : 'Cash'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Active Action Buttons */}
                    {isActive && (
                      <div className="grid grid-cols-2 gap-2.5 pt-1">
                        {/* Cancel Button */}
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
                          className={`h-11 rounded-[12px] font-medium text-[14px] flex items-center justify-center gap-2 transition-colors focus:outline-none focus-visible:ring-4 ${
                            item.payment === true
                              ? 'bg-[#F2F4F7] text-[#98A2B3] opacity-60 cursor-not-allowed'
                              : 'bg-[#FEF3F2] text-[#F04438] hover:bg-[#FEE4E2] cursor-pointer focus-visible:ring-[#F04438]/20'
                          }`}
                        >
                          <IconX className="w-4 h-4" />
                          <span>Cancel</span>
                        </button>

                        {/* Complete Button */}
                        <button
                          type="button"
                          onClick={() => setActionDialog({ type: 'complete', appointment: item })}
                          title={`Mark appointment with ${item.userData?.name || 'patient'} as completed`}
                          aria-label={`Mark appointment with ${item.userData?.name || 'patient'} as completed`}
                          className="h-11 rounded-[12px] bg-[#ECFDF3] text-[#12B76A] hover:bg-[#D1FADF] font-medium text-[14px] flex items-center justify-center gap-2 transition-colors cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-[#12B76A]/20"
                        >
                          <IconCheck className="w-4 h-4" />
                          <span>Complete</span>
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* Confirmation Dialog */}
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

export default DoctorAppointments
