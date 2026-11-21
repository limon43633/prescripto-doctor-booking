import { useContext, useEffect, useState, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'
import PageHeader from '../../components/ui/PageHeader'
import StatCard from '../../components/ui/StatCard'
import Badge from '../../components/ui/Badge'
import Avatar from '../../components/ui/Avatar'
import {
  IconCalendar,
  IconClock,
  IconCheck,
  IconCancel,
  IconSearch,
  IconX,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconWarning,
  IconSpinner,
} from '../../components/ui/Icons'

// ---------------------------------------------------------------------------
// Cancel Confirmation Dialog (Accessible, Focus Trapped, Portal)
// ---------------------------------------------------------------------------

const CancelConfirmDialog = ({ appointment, onClose, onConfirm, isCancelling }) => {
  const dialogRef = useRef(null)
  const previousFocusRef = useRef(null)
  const keepButtonRef = useRef(null)
  const { slotDateFormat } = useContext(AppContext)

  useEffect(() => {
    previousFocusRef.current = document.activeElement

    const timer = setTimeout(() => {
      keepButtonRef.current?.focus()
    }, 20)

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (!isCancelling) {
          e.preventDefault()
          onClose()
        }
        return
      }

      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll(
          'button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
        if (focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = originalOverflow
      document.removeEventListener('keydown', handleKeyDown)
      clearTimeout(timer)
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
        previousFocusRef.current.focus()
      }
    }
  }, [onClose, isCancelling])

  if (!appointment) return null

  const patientName = appointment.userData?.name || 'Patient'
  const doctorName = appointment.docData?.name || 'Doctor'
  const formattedDate = slotDateFormat(appointment.slotDate)
  const formattedTime = appointment.slotTime

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101828]/40 backdrop-blur-xs transition-opacity duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isCancelling) {
          onClose()
        }
      }}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cancel-dialog-title"
        aria-describedby="cancel-dialog-desc"
        className="w-full max-w-md bg-white rounded-[20px] shadow-[0_24px_48px_-12px_rgba(16,24,40,0.24)] border border-[#EAECF0] p-6 sm:p-7 animate-admin-modal text-left"
      >
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-full bg-[#FEF3F2] text-[#F04438] flex items-center justify-center shrink-0">
            <IconWarning className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h2 id="cancel-dialog-title" className="text-[18px] leading-[26px] font-semibold text-[#101828]">
              Cancel appointment?
            </h2>
            <p id="cancel-dialog-desc" className="text-[14px] text-[#667085] mt-1">
              Are you sure you want to cancel this booking? This action will release the doctor&apos;s slot.
            </p>
          </div>
        </div>

        <div className="mt-5 p-4 rounded-[12px] bg-[#F9FAFB] border border-[#EAECF0] text-[13px] text-[#344054] space-y-2">
          <div className="flex justify-between">
            <span className="text-[#667085]">Patient:</span>
            <span className="font-medium text-[#101828]">{patientName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#667085]">Doctor:</span>
            <span className="font-medium text-[#101828]">{doctorName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#667085]">Schedule:</span>
            <span className="font-medium text-[#101828] tabular-nums">{formattedDate} · {formattedTime}</span>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            ref={keepButtonRef}
            type="button"
            disabled={isCancelling}
            onClick={onClose}
            className="h-11 px-5 rounded-[12px] border border-[#D0D5DD] bg-white text-[#344054] hover:bg-[#F9FAFB] font-medium text-[14px] transition-colors cursor-pointer disabled:opacity-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#5F6FFF]/15"
          >
            Keep appointment
          </button>
          <button
            type="button"
            disabled={isCancelling}
            onClick={onConfirm}
            className="h-11 px-5 rounded-[12px] bg-[#B42318] hover:bg-[#912018] text-white font-medium text-[14px] transition-all cursor-pointer disabled:opacity-60 inline-flex items-center gap-2 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#B42318]/20"
          >
            {isCancelling ? (
              <>
                <IconSpinner className="w-4 h-4 text-white" />
                <span>Cancelling...</span>
              </>
            ) : (
              <span>Yes, cancel</span>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

// ---------------------------------------------------------------------------
// Action Tooltip Wrapper
// ---------------------------------------------------------------------------

const ActionTooltip = ({ text, children }) => {
  if (!text) return children
  return (
    <div className="relative group inline-flex">
      {children}
      <div
        role="tooltip"
        className="absolute right-0 bottom-full mb-2 px-2.5 py-1.5 rounded-[8px] bg-[#101828] text-white text-[13px] font-medium whitespace-nowrap shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity z-50"
      >
        {text}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Helpers: Pagination numbers builder
// ---------------------------------------------------------------------------

const getPageNumbers = (current, total) => {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }
  if (current <= 4) {
    return [1, 2, 3, 4, 5, '...', total]
  }
  if (current >= total - 3) {
    return [1, '...', total - 4, total - 3, total - 2, total - 1, total]
  }
  return [1, '...', current - 1, current, current + 1, '...', total]
}

// Table grid column definition for XL desktop screens (1280px+)
const DESKTOP_GRID = 'grid-cols-[minmax(220px,2fr)_70px_minmax(160px,1.4fr)_minmax(200px,1.8fr)_90px_110px_110px_50px]'

// ---------------------------------------------------------------------------
// Main Component: AllAppointments
// ---------------------------------------------------------------------------

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

const AllAppointments = () => {
  const { aToken, appointments, getAllAppointments, cancelAppointment } = useContext(AdminContext)
  const { calculateAge, slotDateFormat, currency } = useContext(AppContext)

  // Loading & error state
  const [loading, setLoading] = useState(Boolean(aToken))
  const [error, setError] = useState(false)

  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // 'all' | 'active' | 'completed' | 'cancelled'
  const [paymentFilter, setPaymentFilter] = useState('all') // 'all' | 'paid' | 'unpaid'
  const [sortOrder, setSortOrder] = useState('newest') // 'newest' | 'oldest'
  const [currentPage, setCurrentPage] = useState(1)

  // Cancellation dialog state
  const [appointmentToCancel, setAppointmentToCancel] = useState(null)
  const [isCancelling, setIsCancelling] = useState(false)

  // Debounce search query (~250ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim().toLowerCase())
    }, 250)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Initial data fetch on mount
  useEffect(() => {
    let isSubscribed = true
    if (aToken) {
      getAllAppointments()
        .then((ok) => {
          if (isSubscribed) {
            if (!ok) setError(true)
            setLoading(false)
          }
        })
        .catch(() => {
          if (isSubscribed) {
            setError(true)
            setLoading(false)
          }
        })
    }

    return () => {
      isSubscribed = false
    }
  }, [aToken, getAllAppointments])

  // Summary strip statistics (derived from ALL appointments)
  const summary = useMemo(() => {
    const list = Array.isArray(appointments) ? appointments : []
    let active = 0
    let unpaidActive = 0
    let completed = 0
    let cancelled = 0
    let collected = 0

    for (let i = 0; i < list.length; i++) {
      const item = list[i]
      if (item.cancelled) {
        cancelled++
      } else {
        if (item.isCompleted) {
          completed++
        } else {
          active++
          if (!item.payment) {
            unpaidActive++
          }
        }
        if (item.payment === true) {
          collected += Number(item.amount) || 0
        }
      }
    }

    const total = list.length
    const completedPct = total > 0 ? Math.round((completed / total) * 100) : 0
    const cancelledPct = total > 0 ? Math.round((cancelled / total) * 100) : 0

    return {
      total,
      active,
      unpaidActive,
      completed,
      cancelled,
      collected,
      completedPct,
      cancelledPct,
    }
  }, [appointments])

  // Filtered & sorted list
  const filteredAppointments = useMemo(() => {
    const list = Array.isArray(appointments) ? appointments : []

    return list
      .filter((item) => {
        // Status filter
        if (statusFilter === 'active') {
          if (item.cancelled || item.isCompleted) return false
        } else if (statusFilter === 'completed') {
          if (!item.isCompleted || item.cancelled) return false
        } else if (statusFilter === 'cancelled') {
          if (!item.cancelled) return false
        }

        // Payment filter
        if (paymentFilter === 'paid') {
          if (!item.payment) return false
        } else if (paymentFilter === 'unpaid') {
          if (item.payment) return false
        }

        // Debounced search
        if (debouncedSearch) {
          const patientName = (item.userData?.name || '').toLowerCase()
          const patientEmail = (item.userData?.email || '').toLowerCase()
          const doctorName = (item.docData?.name || '').toLowerCase()
          const speciality = (item.docData?.speciality || '').toLowerCase()

          const matches =
            patientName.includes(debouncedSearch) ||
            patientEmail.includes(debouncedSearch) ||
            doctorName.includes(debouncedSearch) ||
            speciality.includes(debouncedSearch)

          if (!matches) return false
        }

        return true
      })
      .sort((a, b) => {
        const dateA = Number(a.date) || 0
        const dateB = Number(b.date) || 0
        return sortOrder === 'oldest' ? dateA - dateB : dateB - dateA
      })
  }, [appointments, statusFilter, paymentFilter, debouncedSearch, sortOrder])

  const resetFilters = () => {
    setSearchQuery('')
    setDebouncedSearch('')
    setStatusFilter('all')
    setPaymentFilter('all')
    setSortOrder('newest')
    setCurrentPage(1)
  }

  // Pagination calculation
  const ITEMS_PER_PAGE = 10
  const totalPages = Math.ceil(filteredAppointments.length / ITEMS_PER_PAGE) || 1
  const safePage = Math.min(Math.max(currentPage, 1), totalPages)

  const paginatedAppointments = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE
    return filteredAppointments.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredAppointments, safePage])

  const startIndex = filteredAppointments.length === 0 ? 0 : (safePage - 1) * ITEMS_PER_PAGE + 1
  const endIndex = Math.min(safePage * ITEMS_PER_PAGE, filteredAppointments.length)

  // Confirm cancellation handler
  const handleConfirmCancel = async () => {
    if (!appointmentToCancel || isCancelling) return
    setIsCancelling(true)
    const ok = await cancelAppointment(appointmentToCancel._id)
    setIsCancelling(false)
    if (ok) {
      setAppointmentToCancel(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* 1) PAGE HEADER */}
      <PageHeader
        title="Appointments"
        subtitle="Monitor patient bookings, payment statuses, and schedule consultations."
      />

      {/* 2) 4 STAT CARDS (2x2 mobile, 4 cols xl) */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          label="Total bookings"
          value={loading ? '—' : summary.total}
          footer={`${currency}${summary.collected.toLocaleString()} paid online`}
          icon={IconCalendar}
          variant="brand"
          isActive={statusFilter === 'all'}
          onClick={() => {
            setStatusFilter('all')
            setCurrentPage(1)
          }}
        />

        <StatCard
          label="Pending bookings"
          value={loading ? '—' : summary.active}
          footer={`${summary.unpaidActive} pay by cash`}
          icon={IconClock}
          variant="brand"
          isActive={statusFilter === 'active'}
          onClick={() => {
            setStatusFilter('active')
            setCurrentPage(1)
          }}
        />

        <StatCard
          label="Completed"
          value={loading ? '—' : summary.completed}
          footer={summary.total > 0 ? `${summary.completedPct}% of all bookings` : '—'}
          icon={IconCheck}
          variant="success"
          isActive={statusFilter === 'completed'}
          onClick={() => {
            setStatusFilter('completed')
            setCurrentPage(1)
          }}
        />

        <StatCard
          label="Cancelled"
          value={loading ? '—' : summary.cancelled}
          footer={summary.total > 0 ? `${summary.cancelledPct}% cancellation rate` : '—'}
          icon={IconCancel}
          variant="danger"
          isActive={statusFilter === 'cancelled'}
          onClick={() => {
            setStatusFilter('cancelled')
            setCurrentPage(1)
          }}
        />
      </div>

      {/* 3) ONE MAIN CARD */}
      <div className="bg-white rounded-[20px] border border-[#EAECF0] shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-8px_rgba(16,24,40,0.06)] overflow-hidden">
        {/* Card Header & Controls */}
        <div className="p-5 sm:p-6 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h2 className="text-[18px] leading-[28px] font-semibold text-[#101828]">
                Appointments
              </h2>
              <p className="text-[13px] text-[#667085] mt-0.5">
                {filteredAppointments.length} {filteredAppointments.length === 1 ? 'record' : 'records'} found
              </p>
            </div>

            {/* Toolbar Controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Search input */}
              <div className="relative min-w-[220px] sm:min-w-[260px] flex-1 sm:flex-initial">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#667085]">
                  <IconSearch className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="Search patient or doctor..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="w-full h-10 pl-9 pr-8 rounded-[12px] border border-[#D0D5DD] bg-white text-[14px] text-[#101828] placeholder-[#98A2B3] focus:outline-none focus:border-[#5F6FFF] focus:ring-4 focus:ring-[#5F6FFF]/15 transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('')
                      setDebouncedSearch('')
                      setCurrentPage(1)
                    }}
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[#98A2B3] hover:text-[#101828] cursor-pointer"
                    aria-label="Clear search"
                  >
                    <IconX className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Payment filter select */}
              <div className="relative">
                <select
                  value={paymentFilter}
                  onChange={(e) => {
                    setPaymentFilter(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="h-10 pl-3.5 pr-9 appearance-none rounded-[12px] border border-[#D0D5DD] bg-white text-[14px] font-medium text-[#344054] hover:bg-[#F9FAFB] focus:outline-none focus:border-[#5F6FFF] focus:ring-4 focus:ring-[#5F6FFF]/15 cursor-pointer transition-all"
                >
                  <option value="all">All payments</option>
                  <option value="paid">Online</option>
                  <option value="unpaid">Cash</option>
                </select>
                <IconChevronDown className="w-4 h-4 text-[#667085] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Sort select */}
              <div className="relative">
                <select
                  value={sortOrder}
                  onChange={(e) => {
                    setSortOrder(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="h-10 pl-3.5 pr-9 appearance-none rounded-[12px] border border-[#D0D5DD] bg-white text-[14px] font-medium text-[#344054] hover:bg-[#F9FAFB] focus:outline-none focus:border-[#5F6FFF] focus:ring-4 focus:ring-[#5F6FFF]/15 cursor-pointer transition-all"
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                </select>
                <IconChevronDown className="w-4 h-4 text-[#667085] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Segmented Status Tabs */}
          <div className="pt-2">
            <div className="bg-[#F2F4F7] p-1 rounded-[12px] inline-flex items-center gap-1 overflow-x-auto max-w-full">
              {[
                { id: 'all', label: 'All', count: summary.total },
                { id: 'active', label: 'Pending', count: summary.active },
                { id: 'completed', label: 'Completed', count: summary.completed },
                { id: 'cancelled', label: 'Cancelled', count: summary.cancelled },
              ].map((tab) => {
                const isActive = statusFilter === tab.id
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setStatusFilter(tab.id)
                      setCurrentPage(1)
                    }}
                    className={`h-9 px-4 rounded-[8px] text-[14px] font-medium transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                      isActive
                        ? 'bg-white text-[#101828] shadow-[0_1px_2px_rgba(16,24,40,0.06)]'
                        : 'text-[#667085] hover:text-[#101828]'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className="text-[13px] text-[#667085] tabular-nums">
                      {tab.count}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* State A: Loading Skeleton */}
        {loading && (
          <div className="p-6 space-y-4" aria-busy="true">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 py-3.5 border-b border-[#F2F4F7]">
                <div className="w-10 h-10 rounded-full bg-[#EAECF0] animate-admin-skeleton shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-44 bg-[#EAECF0] rounded-[6px] animate-admin-skeleton" />
                  <div className="h-3 w-28 bg-[#F2F4F7] rounded-[6px] animate-admin-skeleton" />
                </div>
                <div className="w-24 h-4 bg-[#F2F4F7] rounded-[6px] animate-admin-skeleton hidden sm:block" />
                <div className="w-16 h-6 bg-[#EAECF0] rounded-full animate-admin-skeleton" />
              </div>
            ))}
          </div>
        )}

        {/* State B: Error */}
        {!loading && error && (
          <div className="p-12 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#FEF3F2] text-[#F04438] flex items-center justify-center">
              <IconWarning className="w-6 h-6" />
            </div>
            <h3 className="text-[16px] font-semibold text-[#101828]">Failed to load appointments</h3>
            <p className="text-[14px] text-[#667085] max-w-sm mx-auto mt-1 mb-5">
              There was an issue communicating with the server. Please try again.
            </p>
            <button
              type="button"
              onClick={() => {
                setLoading(true)
                setError(false)
                getAllAppointments().finally(() => setLoading(false))
              }}
              className="h-10 px-4 rounded-[12px] bg-[#5F6FFF] hover:bg-[#4F5EEB] text-white text-[14px] font-medium cursor-pointer"
            >
              Try again
            </button>
          </div>
        )}

        {/* State C: Empty (No items matching filter) */}
        {!loading && !error && filteredAppointments.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#F2F4F7] text-[#667085] flex items-center justify-center">
              <IconSearch className="w-6 h-6" />
            </div>
            <h3 className="text-[16px] font-semibold text-[#101828]">No appointments found</h3>
            <p className="text-[14px] text-[#667085] max-w-sm mx-auto mt-1 mb-5">
              {appointments.length === 0
                ? 'No patient consultations have been booked yet.'
                : 'Try adjusting your search criteria or status filter to see more results.'}
            </p>
            {appointments.length > 0 && (
              <button
                type="button"
                onClick={resetFilters}
                className="h-10 px-4 rounded-[12px] border border-[#D0D5DD] bg-white text-[#344054] hover:bg-[#F9FAFB] text-[14px] font-medium cursor-pointer"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* State D: Populated Table (xl+) & Cards (< xl) */}
        {!loading && !error && paginatedAppointments.length > 0 && (
          <>
            {/* Table for Desktop (xl: 1280px+) */}
            <div className="hidden xl:block">
              {/* Table Header */}
              <div
                className={`h-11 bg-[#F9FAFB] border-y border-[#EAECF0] text-[13px] font-medium text-[#667085] px-6 grid ${DESKTOP_GRID} items-center gap-4`}
              >
                <span>Patient</span>
                <span>Age</span>
                <span>Date & time</span>
                <span>Doctor</span>
                <span>Fees</span>
                <span>Payment</span>
                <span>Status</span>
                <span className="text-right">Action</span>
              </div>

              {/* Table Rows */}
              <div className="divide-y divide-[#F2F4F7]">
                {paginatedAppointments.map((item) => {
                  const patientAge = calculateAge(item.userData?.dob)
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
                      className={`h-[72px] px-6 grid ${DESKTOP_GRID} items-center gap-4 hover:bg-[#FCFCFD] transition-colors`}
                    >
                      {/* Patient */}
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar src={item.userData?.image} name={item.userData?.name} size="md" />
                        <div className="min-w-0">
                          <p className="text-[15px] font-medium text-[#101828] truncate">
                            {item.userData?.name || 'Unknown Patient'}
                          </p>
                          <p className="text-[13px] text-[#667085] truncate">
                            {item.userData?.email || '—'}
                          </p>
                        </div>
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

                      {/* Doctor (speciality plain muted text, NOT blue) */}
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar src={item.docData?.image} name={item.docData?.name} size="sm" />
                        <div className="min-w-0">
                          <p className="text-[15px] font-medium text-[#101828] truncate">
                            {item.docData?.name || 'Doctor'}
                          </p>
                          <p className="text-[13px] text-[#667085] truncate">
                            {item.docData?.speciality || 'General'}
                          </p>
                        </div>
                      </div>

                      {/* Fees */}
                      <span className="text-[15px] font-medium text-[#101828] tabular-nums">
                        {currency}{item.amount ?? 0}
                      </span>

                      {/* Payment (no payment badge on cancelled rows) */}
                      <div>
                        {item.cancelled ? (
                          <span className="text-[13px] text-[#98A2B3]">—</span>
                        ) : item.payment ? (
                          <Badge variant="success">Online</Badge>
                        ) : (
                          <span className="inline-flex items-center h-6 px-2.5 rounded-full text-[12px] font-semibold border border-[#D0D5DD] bg-white text-[#344054] select-none tracking-wide">
                            Cash
                          </span>
                        )}
                      </div>

                      {/* Status */}
                      <div>
                        {item.cancelled ? (
                          <div
                            className="inline-flex flex-col items-start gap-1"
                            title={getCancelledFullPhrase(item)}
                            aria-label={getCancelledFullPhrase(item)}
                          >
                            <Badge variant="danger">Cancelled</Badge>
                            {item.cancelledBy && (
                              <span className="text-[13px] text-gray-500">
                                {getCancelledByAdminText(item.cancelledBy)}
                              </span>
                            )}
                          </div>
                        ) : item.isCompleted ? (
                          <Badge variant="success">Completed</Badge>
                        ) : (
                          <Badge variant="warning">Pending</Badge>
                        )}
                      </div>

                      {/* Action */}
                      <div className="flex justify-end">
                        {isCancellable ? (
                          <button
                            type="button"
                            onClick={() => setAppointmentToCancel(item)}
                            aria-label={`Cancel appointment for ${item.userData?.name || 'patient'}`}
                            className="w-9 h-9 rounded-[12px] flex items-center justify-center text-[#667085] hover:text-[#B42318] hover:bg-[#FEF3F2] transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B42318]"
                          >
                            <IconCancel className="w-4 h-4" />
                          </button>
                        ) : (
                          <ActionTooltip text={cancelDisabledReason}>
                            <button
                              type="button"
                              disabled
                              aria-label={`Cannot cancel: ${cancelDisabledReason}`}
                              className="w-9 h-9 rounded-[12px] flex items-center justify-center text-[#98A2B3] opacity-40 cursor-not-allowed"
                            >
                              <IconCancel className="w-4 h-4" />
                            </button>
                          </ActionTooltip>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Responsive Card Layout (< xl: mobile & tablet) */}
            <div className="xl:hidden p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-[#EAECF0]">
              {paginatedAppointments.map((item) => {
                const patientAge = calculateAge(item.userData?.dob)
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
                    className="p-5 rounded-[16px] border border-[#EAECF0] bg-white space-y-4 hover:border-[#D0D5DD] transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3.5">
                      {/* Top: Status Badges */}
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          {item.cancelled ? (
                            <div
                              className="inline-flex items-center gap-1.5 flex-wrap"
                              title={getCancelledFullPhrase(item)}
                              aria-label={getCancelledFullPhrase(item)}
                            >
                              <Badge variant="danger">Cancelled</Badge>
                              {item.cancelledBy && (
                                <span className="text-[13px] text-gray-500">
                                  {getCancelledByAdminText(item.cancelledBy)}
                                </span>
                              )}
                            </div>
                          ) : item.isCompleted ? (
                            <Badge variant="success">Completed</Badge>
                          ) : (
                            <Badge variant="warning">Pending</Badge>
                          )}

                          {!item.cancelled && (
                            item.payment ? (
                              <Badge variant="success">Online</Badge>
                            ) : (
                              <span className="inline-flex items-center h-6 px-2.5 rounded-full text-[12px] font-semibold border border-[#D0D5DD] bg-white text-[#344054] select-none tracking-wide">
                                Cash
                              </span>
                            )
                          )}
                        </div>

                        <span className="text-[15px] font-semibold text-[#101828] tabular-nums">
                          {currency}{item.amount ?? 0}
                        </span>
                      </div>

                      {/* Patient Row */}
                      <div className="flex items-center gap-3">
                        <Avatar src={item.userData?.image} name={item.userData?.name} size="md" />
                        <div className="min-w-0">
                          <p className="text-[15px] font-medium text-[#101828] truncate">
                            {item.userData?.name || 'Unknown Patient'}
                          </p>
                          <p className="text-[13px] text-[#667085] truncate">
                            {item.userData?.email || '—'} · {patientAge !== null ? `${patientAge} yrs` : '—'}
                          </p>
                        </div>
                      </div>

                      {/* Doctor Row */}
                      <div className="flex items-center gap-3 pt-3 border-t border-[#F2F4F7]">
                        <Avatar src={item.docData?.image} name={item.docData?.name} size="sm" />
                        <div className="min-w-0">
                          <p className="text-[14px] font-medium text-[#101828] truncate">
                            {item.docData?.name || 'Doctor'}
                          </p>
                          <p className="text-[13px] text-[#667085] truncate">
                            {item.docData?.speciality || 'General'}
                          </p>
                        </div>
                      </div>

                      {/* Date & Time */}
                      <div className="pt-2 text-[13px] text-[#667085] flex items-center justify-between">
                        <span>Schedule:</span>
                        <span className="font-medium text-[#101828] tabular-nums">
                          {slotDateFormat(item.slotDate)} · {item.slotTime}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Action */}
                    <div className="pt-3 border-t border-[#F2F4F7]">
                      {isCancellable ? (
                        <button
                          type="button"
                          onClick={() => setAppointmentToCancel(item)}
                          className="w-full h-10 px-4 rounded-[12px] border border-[#D0D5DD] hover:border-[#B42318] hover:bg-[#FEF3F2] text-[#344054] hover:text-[#B42318] text-[14px] font-medium transition-colors cursor-pointer flex items-center justify-center gap-2"
                        >
                          <IconCancel className="w-4 h-4" />
                          <span>Cancel appointment</span>
                        </button>
                      ) : (
                        <p className="text-center text-[13px] text-[#98A2B3] py-1 italic">
                          {cancelDisabledReason}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Pagination Controls Footer */}
            <div className="py-4 px-6 border-t border-[#EAECF0] flex flex-col sm:flex-row items-center justify-between gap-4 text-[14px]">
              <span className="text-[#667085]">
                Showing <span className="font-medium text-[#101828] tabular-nums">{startIndex}</span>–<span className="font-medium text-[#101828] tabular-nums">{endIndex}</span> of{' '}
                <span className="font-medium text-[#101828] tabular-nums">{filteredAppointments.length}</span> appointments
              </span>

              <div className="flex items-center gap-1.5">
                {/* Previous */}
                <button
                  type="button"
                  disabled={safePage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  aria-label="Previous page"
                  className="h-9 px-3 rounded-[8px] border border-[#D0D5DD] bg-white text-[#344054] hover:bg-[#F9FAFB] font-medium text-[13px] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1"
                >
                  <IconChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Previous</span>
                </button>

                {/* Page Numbers */}
                {getPageNumbers(safePage, totalPages).map((p, idx) => {
                  if (p === '...') {
                    return (
                      <span key={`ellipsis-${idx}`} className="px-2 text-[#98A2B3]">
                        ...
                      </span>
                    )
                  }
                  const isCurrent = p === safePage
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setCurrentPage(Number(p))}
                      aria-current={isCurrent ? 'page' : undefined}
                      className={`w-9 h-9 rounded-[8px] text-[13px] font-medium transition-colors cursor-pointer flex items-center justify-center tabular-nums ${
                        isCurrent
                          ? 'bg-[#F0F2FF] text-[#5F6FFF] font-semibold'
                          : 'bg-white border border-[#D0D5DD] text-[#344054] hover:bg-[#F9FAFB]'
                      }`}
                    >
                      {p}
                    </button>
                  )
                })}

                {/* Next */}
                <button
                  type="button"
                  disabled={safePage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  aria-label="Next page"
                  className="h-9 px-3 rounded-[8px] border border-[#D0D5DD] bg-white text-[#344054] hover:bg-[#F9FAFB] font-medium text-[13px] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1"
                >
                  <span className="hidden sm:inline">Next</span>
                  <IconChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 4) CANCEL CONFIRMATION DIALOG */}
      {appointmentToCancel && (
        <CancelConfirmDialog
          appointment={appointmentToCancel}
          onClose={() => setAppointmentToCancel(null)}
          onConfirm={handleConfirmCancel}
          isCancelling={isCancelling}
        />
      )}
    </div>
  )
}

export default AllAppointments
