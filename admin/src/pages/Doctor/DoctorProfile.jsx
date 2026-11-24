import { useContext, useEffect, useMemo, useState } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { AppContext } from '../../context/AppContext'
import PageHeader from '../../components/ui/PageHeader'
import Badge from '../../components/ui/Badge'
import { IconSpinner, IconWarning } from '../../components/ui/Icons'

// Normalize experience string: extract number and format "N year(s) of experience"; if not parseable return raw
const formatExperience = (raw) => {
  if (!raw && raw !== 0) return ''
  const str = String(raw).trim()
  const match = str.match(/\d+/)
  if (match) {
    const n = parseInt(match[0], 10)
    return `${n} ${n === 1 ? 'year' : 'years'} of experience`
  }
  return str
}

// Fallback doctor initials for image error
const getInitials = (name) => {
  return (
    (name || '')
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join('') || 'DR'
  )
}

const DoctorProfile = () => {
  const { dToken, profileData, getProfileData, updateProfile } = useContext(DoctorContext)
  const appContext = useContext(AppContext)
  const currency = appContext?.currency || '$'

  const [loading, setLoading] = useState(Boolean(dToken) && !profileData)
  const [error, setError] = useState(false)
  const [imgError, setImgError] = useState(false)

  // Local draft state for edit mode
  const [isEdit, setIsEdit] = useState(false)
  const [fee, setFee] = useState('')
  const [line1, setLine1] = useState('')
  const [line2, setLine2] = useState('')
  const [available, setAvailable] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [submittedOnce, setSubmittedOnce] = useState(false)

  useEffect(() => {
    let isSubscribed = true
    if (dToken) {
      getProfileData()
        .then((ok) => {
          if (isSubscribed) {
            if (!ok && !profileData) setError(true)
            setLoading(false)
          }
        })
        .catch(() => {
          if (isSubscribed) {
            if (!profileData) setError(true)
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
    const ok = await getProfileData()
    if (!ok && !profileData) {
      setError(true)
    }
    setLoading(false)
  }

  // Entering edit mode initializes local draft from current saved profileData
  const handleEnterEdit = () => {
    setFee(profileData?.fees !== undefined && profileData?.fees !== null ? String(profileData.fees) : '')
    setLine1(profileData?.address?.line1 || '')
    setLine2(profileData?.address?.line2 || '')
    setAvailable(Boolean(profileData?.available))
    setErrors({})
    setSubmittedOnce(false)
    setIsEdit(true)
  }

  const handleCancel = () => {
    setIsEdit(false)
    setErrors({})
    setSubmittedOnce(false)
  }

  // Compare draft values against saved profileData
  const isDirty = useMemo(() => {
    if (!profileData) return false
    const feeStr = String(fee).trim()
    const savedFee = Number(profileData.fees ?? 0)
    const feeNum = Number(feeStr)
    const feeChanged = feeStr === '' || isNaN(feeNum) || feeNum !== savedFee
    const line1Changed = line1.trim() !== (profileData.address?.line1 || '').trim()
    const line2Changed = line2.trim() !== (profileData.address?.line2 || '').trim()
    const availableChanged = Boolean(available) !== Boolean(profileData.available)
    return feeChanged || line1Changed || line2Changed || availableChanged
  }, [fee, line1, line2, available, profileData])

  const validateField = (field, value) => {
    setErrors((prev) => {
      const next = { ...prev }
      if (field === 'fee') {
        const str = String(value).trim()
        if (!str) {
          next.fee = 'Consultation fee is required'
        } else {
          const num = Number(str)
          if (isNaN(num) || num < 0) {
            next.fee = 'Enter a valid fee (must be 0 or greater)'
          } else {
            delete next.fee
          }
        }
      } else if (field === 'line1') {
        if (!value.trim()) {
          next.line1 = 'Address line 1 is required'
        } else {
          delete next.line1
        }
      }
      return next
    })
  }

  const validateAll = () => {
    const errs = {}
    const feeStr = String(fee).trim()
    if (!feeStr) {
      errs.fee = 'Consultation fee is required'
    } else {
      const num = Number(feeStr)
      if (isNaN(num) || num < 0) {
        errs.fee = 'Enter a valid fee (must be 0 or greater)'
      }
    }

    if (!line1.trim()) {
      errs.line1 = 'Address line 1 is required'
    }

    setErrors(errs)
    return errs
  }

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    setSubmittedOnce(true)
    const validationErrors = validateAll()
    if (Object.keys(validationErrors).length > 0) {
      const firstKey = Object.keys(validationErrors)[0]
      if (firstKey === 'fee') {
        document.getElementById('profile-fee')?.focus()
      } else if (firstKey === 'line1') {
        document.getElementById('profile-address1')?.focus()
      }
      return
    }

    setSaving(true)
    const payload = {
      fees: Number(fee),
      address: {
        line1: line1.trim(),
        line2: line2.trim(),
      },
      available: Boolean(available),
    }

    const ok = await updateProfile(payload)
    if (ok) {
      await getProfileData()
      setIsEdit(false)
      setSubmittedOnce(false)
    }
    setSaving(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && !saving) {
      e.preventDefault()
      handleCancel()
    }
  }

  return (
    <div className="max-w-5xl space-y-6">
      <PageHeader
        title="Profile"
        subtitle="Manage your consultation fee, address and availability."
      />

      {/* Loading Skeleton */}
      {loading && !profileData && (
        <div
          className="bg-white rounded-[20px] border border-[#EAECF0] shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-8px_rgba(16,24,40,0.06)] overflow-hidden p-6 sm:p-8"
          aria-busy="true"
        >
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 lg:gap-10 items-start">
            <div className="aspect-[4/3] lg:aspect-[4/5] w-full rounded-2xl bg-[#EAECF0] animate-admin-skeleton shrink-0" />
            <div className="min-w-0 space-y-6">
              <div className="space-y-2.5">
                <div className="h-8 w-56 bg-[#EAECF0] rounded-[6px] animate-admin-skeleton" />
                <div className="h-5 w-44 bg-[#F2F4F7] rounded-[6px] animate-admin-skeleton" />
                <div className="h-4 w-32 bg-[#F2F4F7] rounded-[6px] animate-admin-skeleton" />
              </div>
              <div className="border-t border-[#F2F4F7]" />
              <div className="space-y-2">
                <div className="h-4 w-16 bg-[#EAECF0] rounded-[6px] animate-admin-skeleton" />
                <div className="h-4 w-full bg-[#F2F4F7] rounded-[6px] animate-admin-skeleton" />
                <div className="h-4 w-5/6 bg-[#F2F4F7] rounded-[6px] animate-admin-skeleton" />
              </div>
              <div className="border-t border-[#F2F4F7]" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="h-4 w-28 bg-[#EAECF0] rounded-[6px] animate-admin-skeleton" />
                  <div className="h-5 w-20 bg-[#F2F4F7] rounded-[6px] animate-admin-skeleton" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-20 bg-[#EAECF0] rounded-[6px] animate-admin-skeleton" />
                  <div className="h-5 w-40 bg-[#F2F4F7] rounded-[6px] animate-admin-skeleton" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <div className="h-4 w-24 bg-[#EAECF0] rounded-[6px] animate-admin-skeleton" />
                  <div className="h-7 w-36 bg-[#F2F4F7] rounded-full animate-admin-skeleton" />
                </div>
              </div>
              <div className="border-t border-[#F2F4F7]" />
              <div className="flex justify-end">
                <div className="h-11 w-32 bg-[#EAECF0] rounded-xl animate-admin-skeleton" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {!loading && error && !profileData && (
        <div className="p-12 text-center bg-white rounded-[20px] border border-[#EAECF0] shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-8px_rgba(16,24,40,0.06)]">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#FEF3F2] text-[#F04438] flex items-center justify-center">
            <IconWarning className="w-6 h-6" />
          </div>
          <h2 className="text-[18px] font-semibold text-[#101828]">Failed to load profile</h2>
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

      {/* Loaded Profile Card */}
      {profileData && (
        <div className="bg-white rounded-[20px] border border-[#EAECF0] shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-8px_rgba(16,24,40,0.06)] overflow-hidden p-6 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 lg:gap-10 items-start">
            {/* Left Column: Doctor Photo */}
            <div className="w-full shrink-0">
              {!profileData.image || imgError ? (
                <div
                  className="aspect-[4/3] lg:aspect-[4/5] w-full rounded-2xl bg-primary text-white font-semibold text-3xl sm:text-4xl flex items-center justify-center select-none"
                  aria-label={profileData.name}
                >
                  {getInitials(profileData.name)}
                </div>
              ) : (
                <div className="aspect-[4/3] lg:aspect-[4/5] w-full rounded-2xl overflow-hidden bg-primary select-none">
                  <img
                    src={profileData.image}
                    alt={profileData.name}
                    onError={() => setImgError(true)}
                    className="h-full w-full object-cover object-top"
                  />
                </div>
              )}
            </div>

            {/* Right Column: Information & Details */}
            <div className="min-w-0">
              {/* Doctor Header */}
              <div>
                <h2 className="text-2xl sm:text-[28px] lg:text-[30px] font-[600] tracking-[-0.02em] text-[#101828] break-words">
                  {profileData.name}
                </h2>
                <p className="text-[15px] sm:text-[16px] font-medium text-gray-700 mt-1 break-words">
                  {profileData.degree} · {profileData.speciality}
                </p>
                {profileData.experience && (
                  <p className="text-[13px] sm:text-[14px] text-gray-600 mt-0.5">
                    {formatExperience(profileData.experience)}
                  </p>
                )}
              </div>

              <div className="border-t border-gray-300 my-6" />

              {/* About Section */}
              <div>
                <h3 className="text-[14px] font-semibold text-black">About</h3>
                <p className="mt-2 text-[15px] sm:text-[16px] leading-relaxed text-[#344054] whitespace-pre-line break-words">
                  {profileData.about || '—'}
                </p>
              </div>

              <div className="border-t border-[#F2F4F7] my-6" />

              {/* Details Section: View vs Edit Mode */}
              {!isEdit ? (
                /* View Mode */
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                    <div>
                      <span className="text-[13px] sm:text-[14px] font-semibold text-gray-800 block">
                        Consultation fee
                      </span>
                      <span className="mt-1 text-[15px] sm:text-[16px] font-medium text-gray-500 tabular-nums block">
                        {currency}{profileData.fees}
                      </span>
                    </div>

                    <div>
                      <span className="text-[13px] sm:text-[14px] font-semibold text-gray-800 block">
                        Address
                      </span>
                      <div className="mt-1 text-[15px] sm:text-[16px] font-medium text-gray-500 leading-normal">
                        <p className="break-words">{profileData.address?.line1 || '—'}</p>
                        {profileData.address?.line2 && (
                          <p className="break-words">{profileData.address.line2}</p>
                        )}
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <span className="text-[13px] sm:text-[14px] font-semibold text-gray-800 block">
                        Availability
                      </span>
                      <div className="mt-2 flex flex-col items-start gap-1.5">
                        <Badge variant={profileData.available ? 'success' : 'neutral'}>
                          {profileData.available ? 'Available for booking' : 'Unavailable'}
                        </Badge>
                        {!profileData.available && (
                          <p className="text-[13px] text-[#667085]">
                            Patients cannot book new appointments while you are unavailable.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-[#F2F4F7] my-6" />

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleEnterEdit}
                      className="h-11 min-h-[44px] px-6 rounded-xl bg-primary hover:bg-primary/90 text-white text-[15px] font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25 active:scale-[0.98]"
                    >
                      Edit profile
                    </button>
                  </div>
                </>
              ) : (
                /* Edit Mode */
                <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
                  <div className="mb-6 rounded-xl bg-gray-50 border border-gray-100 px-4 py-3 text-[13px] text-[#667085]">
                    Name, speciality and qualifications can only be changed by an admin.
                  </div>

                  <div className="space-y-6">
                    {/* Consultation Fee */}
                    <div>
                      <label htmlFor="profile-fee" className="mb-1.5 block text-sm font-semibold text-gray-800">
                        Consultation fee ({currency})
                      </label>
                      <div className="relative max-w-xs">
                        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[15px] font-medium text-gray-500 select-none">
                          {currency}
                        </span>
                        <input
                          id="profile-fee"
                          type="number"
                          min="0"
                          step="any"
                          inputMode="decimal"
                          value={fee}
                          disabled={saving}
                          onChange={(e) => {
                            setFee(e.target.value)
                            if (submittedOnce) validateField('fee', e.target.value)
                          }}
                          placeholder="0"
                          aria-invalid={Boolean(errors.fee)}
                          aria-describedby={errors.fee ? 'profile-fee-error' : undefined}
                          className={`h-11 w-full rounded-xl border pl-8 pr-3.5 text-[15px] text-gray-900 outline-none transition focus:ring-4 ${
                            errors.fee
                              ? 'border-red-400 bg-red-50/20 focus:border-red-500 focus:ring-red-500/15'
                              : 'border-gray-300 bg-white focus:border-primary focus:ring-primary/15'
                          } disabled:cursor-not-allowed disabled:bg-gray-50`}
                        />
                      </div>
                      {errors.fee && (
                        <p id="profile-fee-error" className="mt-1.5 text-[13px] text-red-700" aria-live="polite">
                          {errors.fee}
                        </p>
                      )}
                    </div>

                    {/* Address Inputs */}
                    <div className="space-y-3">
                      <div>
                        <label htmlFor="profile-address1" className="mb-1.5 block text-sm font-semibold text-gray-800">
                          Address line 1 <span className="text-red-500" aria-hidden="true">*</span>
                        </label>
                        <input
                          id="profile-address1"
                          type="text"
                          autoComplete="off"
                          value={line1}
                          disabled={saving}
                          onChange={(e) => {
                            setLine1(e.target.value)
                            if (submittedOnce) validateField('line1', e.target.value)
                          }}
                          placeholder="Address line 1"
                          aria-invalid={Boolean(errors.line1)}
                          aria-describedby={errors.line1 ? 'profile-line1-error' : undefined}
                          className={`h-11 w-full rounded-xl border px-3.5 text-[15px] text-gray-900 placeholder:text-gray-400 outline-none transition focus:ring-4 ${
                            errors.line1
                              ? 'border-red-400 bg-red-50/20 focus:border-red-500 focus:ring-red-500/15'
                              : 'border-gray-300 bg-white focus:border-primary focus:ring-primary/15'
                          } disabled:cursor-not-allowed disabled:bg-gray-50`}
                        />
                        {errors.line1 && (
                          <p id="profile-line1-error" className="mt-1.5 text-[13px] text-red-700" aria-live="polite">
                            {errors.line1}
                          </p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="profile-address2" className="mb-1.5 block text-sm font-semibold text-gray-800">
                          Address line 2 <span className="text-[13px] font-normal text-gray-400">(optional)</span>
                        </label>
                        <input
                          id="profile-address2"
                          type="text"
                          autoComplete="off"
                          value={line2}
                          disabled={saving}
                          onChange={(e) => setLine2(e.target.value)}
                          placeholder="Address line 2"
                          className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3.5 text-[15px] text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15 disabled:cursor-not-allowed disabled:bg-gray-50"
                        />
                      </div>
                    </div>

                    {/* Availability Switch */}
                    <div>
                      <span className="mb-1.5 block text-sm font-semibold text-gray-800">Availability</span>
                      <label className="relative inline-flex min-h-[44px] cursor-pointer items-center gap-3 select-none">
                        <input
                          type="checkbox"
                          role="switch"
                          aria-checked={available}
                          className="peer sr-only"
                          checked={available}
                          disabled={saving}
                          onChange={(e) => setAvailable(e.target.checked)}
                          aria-label="Available for booking"
                        />
                        <span
                          aria-hidden="true"
                          className={`relative inline-block h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ease-in-out peer-focus-visible:ring-4 peer-focus-visible:ring-primary/25 motion-reduce:transition-none ${
                            available ? 'bg-primary' : 'bg-gray-300'
                          } ${saving ? 'cursor-not-allowed opacity-60' : ''}`}
                        >
                          <span
                            className={`pointer-events-none absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ease-in-out motion-reduce:transition-none ${
                              available ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </span>
                        <span className="text-[15px] font-medium text-gray-900">
                          Available for booking
                        </span>
                      </label>
                      {!available && (
                        <p className="mt-1 text-[13px] text-[#667085]">
                          Patients cannot book new appointments while you are unavailable.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Edit Mode Footer */}
                  <div className="mt-8 flex items-center justify-end gap-3 pt-6 border-t border-[#F2F4F7]">
                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={saving}
                      className="h-11 min-h-[44px] px-5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-[15px] font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!isDirty || saving}
                      className="h-11 min-h-[44px] px-6 rounded-xl bg-primary hover:bg-primary/90 text-white text-[15px] font-medium transition-colors cursor-pointer flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {saving ? (
                        <>
                          <IconSpinner className="w-4 h-4 text-white" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        'Save changes'
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DoctorProfile
