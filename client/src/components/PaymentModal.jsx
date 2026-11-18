import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Check,
  ChevronDown,
  Copy,
  CreditCard,
  Eye,
  EyeOff,
  FlaskConical,
  Loader2,
  Lock,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Wallet,
  X,
  XCircle
} from 'lucide-react'
import { AppContext } from '../context/AppContext'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const STEPS = ['Method', 'Details', 'Processing', 'Result']

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

const formatSlotDate = (slotDate) => {
  if (!slotDate || !slotDate.includes('_')) return slotDate || ''
  const [day, month, year] = slotDate.split('_')
  const monthLabel = MONTHS[Number(month) - 1]
  return monthLabel ? `${day} ${monthLabel}, ${year}` : slotDate
}

const formatBDT = (amount) => {
  const num = Number(amount)
  if (!Number.isFinite(num)) return '0'
  return num.toLocaleString('en-US', {
    minimumFractionDigits: Number.isInteger(num) ? 0 : 2,
    maximumFractionDigits: 2
  })
}

const formatPaidAt = (value) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}

const detectCardBrand = (digits) => {
  if (!digits) return ''
  if (/^4/.test(digits)) return 'visa'
  if (/^(5[1-5]|222[1-9]|22[3-9]\d|2[3-6]\d{2}|27[01]\d|2720)/.test(digits)) return 'mastercard'
  if (/^3[47]/.test(digits)) return 'amex'
  return ''
}

const luhnCheck = (digits) => {
  if (!/^\d{13,19}$/.test(digits)) return false
  let sum = 0
  let shouldDouble = false
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let digit = Number(digits[i])
    if (shouldDouble) {
      digit *= 2
      if (digit > 9) digit -= 9
    }
    sum += digit
    shouldDouble = !shouldDouble
  }
  return sum % 10 === 0
}

const formatCardNumber = (raw, brand) => {
  const maxLen = brand === 'amex' ? 15 : 16
  const digits = String(raw || '').replace(/\D/g, '').slice(0, maxLen)
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ')
}

const formatExpiry = (raw) => {
  const digits = String(raw || '').replace(/\D/g, '').slice(0, 4)
  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)}/${digits.slice(2)}`
}

const validateExpiry = (exp) => {
  const match = String(exp || '').trim().match(/^(0[1-9]|1[0-2])\/(\d{2})$/)
  if (!match) return false
  const month = Number(match[1])
  const year = 2000 + Number(match[2])
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1
  return year > currentYear || (year === currentYear && month >= currentMonth)
}

const formatMaskedCardPreview = (digits, brand) => {
  const total = brand === 'amex' ? 15 : 16
  const chars = []
  for (let i = 0; i < total; i += 1) {
    const ch = digits[i]
    if (!ch) {
      chars.push('•')
    } else if (i >= 4 && i < total - 4) {
      chars.push('•')
    } else {
      chars.push(ch)
    }
  }
  return chars.join('').replace(/(.{4})(?=.)/g, '$1 ')
}

const brandDisplayLabel = (brand) => {
  if (brand === 'visa') return 'VISA'
  if (brand === 'mastercard') return 'Mastercard'
  if (brand === 'amex') return 'AMEX'
  return 'Card'
}

// ---------------------------------------------------------------------------
// Private sub-components
// ---------------------------------------------------------------------------

const StepperHeader = ({ currentStep, method }) => {
  const isBkashAccent = method === 'bkash' && currentStep === 2

  return (
    <nav aria-label='Checkout progress' className='mb-5'>
      <ol className='flex items-center justify-between gap-1'>
        {STEPS.map((label, index) => {
          const stepNum = index + 1
          const isDone = currentStep > stepNum
          const isCurrent = currentStep === stepNum
          const activeBg = isBkashAccent ? 'bg-[#E2136E] border-[#E2136E]' : 'bg-primary border-primary'
          const activeText = isBkashAccent ? 'text-[#E2136E]' : 'text-primary'

          return (
            <li key={label} className='flex-1 flex items-center'>
              <div className='flex flex-col items-center flex-1'>
                <div className='flex items-center w-full'>
                  <div
                    className={`h-0.5 flex-1 transition-colors ${
                      index === 0
                        ? 'bg-transparent'
                        : currentStep >= stepNum
                          ? 'bg-primary/60'
                          : 'bg-gray-200'
                    }`}
                    aria-hidden='true'
                  />
                  <span
                    aria-current={isCurrent ? 'step' : undefined}
                    className={`w-6 h-6 rounded-full text-[11px] font-semibold flex items-center justify-center border transition-colors shrink-0 ${
                      isDone
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : isCurrent
                          ? `${activeBg} text-white shadow-xs`
                          : 'bg-white border-gray-300 text-gray-400'
                    }`}
                  >
                    {isDone ? <Check size={12} strokeWidth={3} /> : stepNum}
                  </span>
                  <div
                    className={`h-0.5 flex-1 transition-colors ${
                      index === STEPS.length - 1
                        ? 'bg-transparent'
                        : currentStep > stepNum
                          ? 'bg-primary/60'
                          : 'bg-gray-200'
                    }`}
                    aria-hidden='true'
                  />
                </div>
                <span
                  className={`mt-1.5 text-[11px] font-medium ${
                    isCurrent
                      ? activeText
                      : isDone
                        ? 'text-gray-700'
                        : 'text-gray-400'
                  }`}
                >
                  {label}
                </span>
              </div>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

const OrderSummaryCard = ({ quote, currencySymbol }) => {
  return (
    <div className='rounded-2xl bg-gradient-to-br from-slate-50 via-white to-indigo-50/50 border border-gray-200/80 p-4 mb-5'>
      <div className='flex items-center gap-3.5 pb-3.5 border-b border-gray-200/70'>
        <img
          src={quote.doctor.image}
          alt={quote.doctor.name || 'Doctor'}
          className='w-14 h-14 rounded-xl object-cover border border-primary/15 bg-primary/5 shrink-0'
        />
        <div className='min-w-0 flex-1'>
          <p className='text-sm font-semibold text-gray-900 truncate'>{quote.doctor.name}</p>
          <p className='text-xs font-medium text-primary truncate'>{quote.doctor.speciality}</p>
          <div className='flex items-center gap-1.5 mt-1.5 text-xs text-gray-500'>
            <Calendar size={12} className='text-gray-400 shrink-0' />
            <span className='truncate'>
              {formatSlotDate(quote.slotDate)} · {quote.slotTime}
            </span>
          </div>
        </div>
      </div>

      <div className='pt-3 space-y-1.5'>
        <div className='flex items-center justify-between text-xs text-gray-600'>
          <span>Consultation fee</span>
          <span className='font-medium text-gray-800'>
            {currencySymbol}{quote.amountUSD}
          </span>
        </div>
        <div className='flex items-center justify-between text-xs text-gray-500'>
          <span>Conversion rate</span>
          <span>1 USD = ৳{quote.rate}</span>
        </div>
        <div className='pt-2 mt-1.5 border-t border-dashed border-gray-200 flex items-center justify-between'>
          <span className='text-sm font-semibold text-gray-800'>Total payable</span>
          <span className='text-lg font-bold text-gray-900 tracking-tight'>
            ৳{formatBDT(quote.amountBDT)}
          </span>
        </div>
      </div>
    </div>
  )
}

const DemoCredentialsPanel = ({ title, items, onFill, secondaryFillLabel, onSecondaryFill, accent = 'indigo' }) => {
  const [open, setOpen] = useState(false)
  const pillClasses =
    accent === 'pink'
      ? 'text-[#E2136E] bg-[#E2136E]/10 hover:bg-[#E2136E]/15'
      : 'text-primary bg-primary/10 hover:bg-primary/15'

  return (
    <div className='rounded-xl border border-amber-200/80 bg-amber-50/60 overflow-hidden mb-4'>
      <button
        type='button'
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className='w-full px-3.5 py-2.5 flex items-center justify-between gap-2 text-left text-xs font-medium text-amber-900 hover:bg-amber-100/50 transition-colors cursor-pointer'
      >
        <span className='inline-flex items-center gap-1.5'>
          <FlaskConical size={13} className='text-amber-600 shrink-0' />
          <span>{title}</span>
          <span className='text-[10px] font-normal text-amber-700'>(fake test data)</span>
        </span>
        <ChevronDown
          size={15}
          className={`text-amber-700 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className='px-3.5 pb-3 pt-1 border-t border-amber-200/60 text-xs text-amber-950 space-y-2'>
          <p className='text-[11px] text-amber-800'>
            These are simulated credentials for demo testing only. No real account is charged.
          </p>
          <ul className='space-y-1'>
            {items.map((item) => (
              <li key={item.label} className='flex items-baseline justify-between gap-2 text-[11px]'>
                <span className='text-amber-800'>{item.label}:</span>
                <code className='font-mono font-semibold text-gray-900 bg-white/80 px-1.5 py-0.5 rounded border border-amber-200/70'>
                  {item.value}
                </code>
              </li>
            ))}
          </ul>
          <div className='pt-1 flex flex-wrap items-center gap-2'>
            <button
              type='button'
              onClick={onFill}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${pillClasses}`}
            >
              <Sparkles size={12} />
              <span>Fill demo data</span>
            </button>
            {secondaryFillLabel && onSecondaryFill && (
              <button
                type='button'
                onClick={onSecondaryFill}
                className='inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-700 bg-rose-100/80 hover:bg-rose-100 transition-colors cursor-pointer'
              >
                <span>{secondaryFillLabel}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main PaymentModal Component (keyed inner dialog ensures clean state per open)
// ---------------------------------------------------------------------------

const PaymentModal = ({ appointment, onClose, onPaid }) => {
  if (!appointment) return null
  return (
    <PaymentModalInner
      key={appointment._id}
      appointment={appointment}
      onClose={onClose}
      onPaid={onPaid}
    />
  )
}

const PaymentModalInner = ({ appointment, onClose, onPaid }) => {
  const { backendUrl, token, currencySymbol } = useContext(AppContext)

  const [visible, setVisible] = useState(false)
  const [step, setStep] = useState(1) // 1: Method, 2: Details, 3: Processing, 4: Result
  const [quote, setQuote] = useState(null)
  const [quoteLoading, setQuoteLoading] = useState(true)
  const [quoteError, setQuoteError] = useState('')

  const [method, setMethod] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [processingLineIndex, setProcessingLineIndex] = useState(0)
  const [receipt, setReceipt] = useState(null)
  const [copiedTranId, setCopiedTranId] = useState(false)

  // bKash local-only simulated inputs (cleared on close/step change, never sent to server)
  const [bkashSubStep, setBkashSubStep] = useState(1) // 1: Wallet, 2: OTP, 3: PIN
  const [bkashWallet, setBkashWallet] = useState('')
  const [bkashOtp, setBkashOtp] = useState(['', '', '', '', '', ''])
  const [bkashOtpAttempts, setBkashOtpAttempts] = useState(0)
  const [bkashResendSeconds, setBkashResendSeconds] = useState(60)
  const [bkashPin, setBkashPin] = useState('')
  const [showBkashPin, setShowBkashPin] = useState(false)
  const [bkashError, setBkashError] = useState('')
  const [bkashShakeKey, setBkashShakeKey] = useState(0)

  // Card local-only simulated inputs (cleared on close/step change, never sent to server)
  const [cardNumber, setCardNumber] = useState('')
  const [cardName, setCardName] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')
  const [showCardCvv, setShowCardCvv] = useState(false)
  const [cardTouched, setCardTouched] = useState({})
  const [cardErrors, setCardErrors] = useState({})
  const [cardShakeKey, setCardShakeKey] = useState(0)

  const dialogRef = useRef(null)
  const closeButtonRef = useRef(null)
  const previousFocusRef = useRef(null)
  const otpInputRefs = useRef([])
  const inFlightRef = useRef(false)
  const closingRef = useRef(false)
  const mountedRef = useRef(true)
  const processingTimerRef = useRef(null)
  const processingIntervalRef = useRef(null)
  const closeTimerRef = useRef(null)

  const clearSensitiveInputs = useCallback(() => {
    setBkashWallet('')
    setBkashOtp(['', '', '', '', '', ''])
    setBkashOtpAttempts(0)
    setBkashPin('')
    setShowBkashPin(false)
    setBkashError('')
    setCardNumber('')
    setCardName('')
    setCardExpiry('')
    setCardCvv('')
    setShowCardCvv(false)
    setCardTouched({})
    setCardErrors({})
  }, [])

  const clearTimers = useCallback(() => {
    if (processingTimerRef.current) {
      clearTimeout(processingTimerRef.current)
      processingTimerRef.current = null
    }
    if (processingIntervalRef.current) {
      clearInterval(processingIntervalRef.current)
      processingIntervalRef.current = null
    }
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }, [])

  useEffect(() => {
    mountedRef.current = true
    previousFocusRef.current = document.activeElement
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const raf = requestAnimationFrame(() => {
      if (mountedRef.current) setVisible(true)
    })

    const focusTimer = setTimeout(() => {
      if (closeButtonRef.current) {
        closeButtonRef.current.focus()
      }
    }, 30)

    return () => {
      mountedRef.current = false
      cancelAnimationFrame(raf)
      clearTimeout(focusTimer)
      clearTimers()
      document.body.style.overflow = originalOverflow
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
        previousFocusRef.current.focus()
      }
    }
  }, [clearTimers])

  const loadQuote = useCallback(async () => {
    if (!appointment?._id || !token) return
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/payment/quote?appointmentId=${encodeURIComponent(appointment._id)}`,
        { headers: { token } }
      )
      if (!mountedRef.current) return
      if (data.success) {
        setQuote(data)
        setQuoteError('')
      } else {
        setQuoteError(data.message || 'Unable to load payment details.')
      }
    } catch (error) {
      if (!mountedRef.current) return
      const msg = error.response?.data?.message || 'Could not reach the server. Please try again.'
      setQuoteError(msg)
      toast.error(msg)
    } finally {
      if (mountedRef.current) {
        setQuoteLoading(false)
      }
    }
  }, [appointment._id, backendUrl, token])

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      if (!appointment?._id || !token) return
      try {
        const { data } = await axios.get(
          `${backendUrl}/api/payment/quote?appointmentId=${encodeURIComponent(appointment._id)}`,
          { headers: { token } }
        )
        if (cancelled || !mountedRef.current) return
        if (data.success) {
          setQuote(data)
          setQuoteError('')
        } else {
          setQuoteError(data.message || 'Unable to load payment details.')
        }
      } catch (error) {
        if (cancelled || !mountedRef.current) return
        const msg = error.response?.data?.message || 'Could not reach the server. Please try again.'
        setQuoteError(msg)
        toast.error(msg)
      } finally {
        if (!cancelled && mountedRef.current) {
          setQuoteLoading(false)
        }
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [appointment._id, backendUrl, token])

  const handleRetryQuote = () => {
    setQuoteLoading(true)
    setQuoteError('')
    loadQuote()
  }

  // Purely visual 60-second resend countdown on bKash OTP step
  useEffect(() => {
    if (step !== 2 || method !== 'bkash' || bkashSubStep !== 2) return
    if (bkashResendSeconds <= 0) return
    const timer = setTimeout(() => {
      setBkashResendSeconds((prev) => Math.max(0, prev - 1))
    }, 1000)
    return () => clearTimeout(timer)
  }, [step, method, bkashSubStep, bkashResendSeconds])

  const isCloseDisabled = step === 3 || isSubmitting

  const triggerSmoothClose = useCallback((notifyPaid) => {
    if (closingRef.current) return
    closingRef.current = true
    clearSensitiveInputs()
    setVisible(false)

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    closeTimerRef.current = setTimeout(() => {
      if (notifyPaid && typeof onPaid === 'function') {
        onPaid()
      }
      onClose()
    }, prefersReducedMotion ? 0 : 180)
  }, [clearSensitiveInputs, onPaid, onClose])

  const handleClose = useCallback(() => {
    if (isCloseDisabled) return
    triggerSmoothClose(receipt?.status === 'paid')
  }, [isCloseDisabled, receipt, triggerSmoothClose])

  // Keyboard handling: ESC & focus trap
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        handleClose()
        return
      }

      if (event.key === 'Tab' && dialogRef.current) {
        const focusable = Array.from(dialogRef.current.querySelectorAll(FOCUSABLE_SELECTOR))
        if (focusable.length === 0) return

        const first = focusable[0]
        const last = focusable[focusable.length - 1]

        if (event.shiftKey) {
          if (document.activeElement === first || !dialogRef.current.contains(document.activeElement)) {
            event.preventDefault()
            last.focus()
          }
        } else if (document.activeElement === last || !dialogRef.current.contains(document.activeElement)) {
          event.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleClose])

  // Core payment execution: POST /init -> ~2s Processing -> POST /confirm
  const executeSimulatedPayment = async ({
    payMethod,
    outcome,
    cardBrand = '',
    cardLast4 = '',
    bkashLast3 = '',
    failureReason = ''
  }) => {
    if (inFlightRef.current || !appointment) return
    inFlightRef.current = true
    setIsSubmitting(true)

    try {
      const { data: initData } = await axios.post(
        `${backendUrl}/api/payment/init`,
        {
          appointmentId: appointment._id,
          method: payMethod
        },
        { headers: { token } }
      )

      if (!mountedRef.current) return

      if (!initData.success || !initData.tranId) {
        toast.error(initData.message || 'Could not initialize payment.')
        inFlightRef.current = false
        setIsSubmitting(false)
        return
      }

      const tranId = initData.tranId

      // Immediately wipe all sensitive demo inputs once we leave Step 2
      clearSensitiveInputs()
      setProcessingLineIndex(0)
      setStep(3)

      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches

      const totalDelayMs = prefersReducedMotion ? 900 : 2100

      processingIntervalRef.current = setInterval(() => {
        setProcessingLineIndex((prev) => (prev < 2 ? prev + 1 : prev))
      }, Math.floor(totalDelayMs / 3))

      await new Promise((resolve) => {
        processingTimerRef.current = setTimeout(resolve, totalDelayMs)
      })

      clearTimers()
      if (!mountedRef.current) return

      const { data: confirmData } = await axios.post(
        `${backendUrl}/api/payment/confirm`,
        {
          tranId,
          outcome,
          cardBrand,
          cardLast4,
          bkashLast3,
          failureReason
        },
        { headers: { token } }
      )

      if (!mountedRef.current) return

      if (!confirmData.success || !confirmData.receipt) {
        toast.error(confirmData.message || 'Could not confirm payment.')
        setStep(2)
        inFlightRef.current = false
        setIsSubmitting(false)
        return
      }

      setReceipt(confirmData.receipt)
      setStep(4)
      inFlightRef.current = false
      setIsSubmitting(false)
    } catch (error) {
      clearTimers()
      if (!mountedRef.current) return
      const msg = error.response?.data?.message || 'Network error while processing payment. Please try again.'
      toast.error(msg)
      setStep(2)
      inFlightRef.current = false
      setIsSubmitting(false)
    }
  }

  // -------------------------------------------------------------------------
  // Step 1 handlers
  // -------------------------------------------------------------------------

  const handleMethodKeyDown = (event, target) => {
    if (['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft'].includes(event.key)) {
      event.preventDefault()
      setMethod(target === 'bkash' ? 'card' : 'bkash')
    } else if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault()
      setMethod(target)
    }
  }

  const handleContinueFromMethod = () => {
    if (!method || !quote) return
    clearSensitiveInputs()
    setBkashSubStep(1)
    setBkashResendSeconds(60)
    setStep(2)
  }

  // -------------------------------------------------------------------------
  // Step 2: bKash handlers
  // -------------------------------------------------------------------------

  const triggerBkashError = (msg) => {
    setBkashError(msg)
    setBkashShakeKey((k) => k + 1)
  }

  const handleBkashWalletContinue = (event) => {
    event.preventDefault()
    const digits = bkashWallet.replace(/\D/g, '')
    if (!/^01\d{9}$/.test(digits)) {
      triggerBkashError('Enter a valid 11-digit bKash number starting with 01.')
      return
    }
    setBkashError('')
    setBkashOtp(['', '', '', '', '', ''])
    setBkashOtpAttempts(0)
    setBkashResendSeconds(60)
    setBkashSubStep(2)
    setTimeout(() => {
      otpInputRefs.current[0]?.focus()
    }, 30)
  }

  const handleOtpChange = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1)
    const next = [...bkashOtp]
    next[index] = digit
    setBkashOtp(next)
    setBkashError('')
    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index, event) => {
    if (event.key === 'Backspace' && !bkashOtp[index] && index > 0) {
      event.preventDefault()
      const next = [...bkashOtp]
      next[index - 1] = ''
      setBkashOtp(next)
      otpInputRefs.current[index - 1]?.focus()
    } else if (event.key === 'ArrowLeft' && index > 0) {
      otpInputRefs.current[index - 1]?.focus()
    } else if (event.key === 'ArrowRight' && index < 5) {
      otpInputRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpPaste = (event) => {
    event.preventDefault()
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return
    const next = ['', '', '', '', '', '']
    for (let i = 0; i < pasted.length; i += 1) {
      next[i] = pasted[i]
    }
    setBkashOtp(next)
    setBkashError('')
    const focusIdx = Math.min(pasted.length, 5)
    otpInputRefs.current[focusIdx]?.focus()
  }

  const handleBkashOtpContinue = (event) => {
    event.preventDefault()
    const code = bkashOtp.join('')
    if (code.length < 6) {
      triggerBkashError('Please enter all 6 digits of the verification code.')
      return
    }

    if (code === '123456') {
      setBkashError('')
      setBkashOtp(['', '', '', '', '', ''])
      setBkashPin('')
      setBkashSubStep(3)
      return
    }

    const nextAttempts = bkashOtpAttempts + 1
    setBkashOtpAttempts(nextAttempts)

    if (nextAttempts >= 3) {
      const walletLast3 = bkashWallet.replace(/\D/g, '').slice(-3)
      executeSimulatedPayment({
        payMethod: 'bkash',
        outcome: 'failed',
        bkashLast3: walletLast3,
        failureReason: 'Too many incorrect OTP attempts (demo)'
      })
      return
    }

    const remaining = 3 - nextAttempts
    setBkashOtp(['', '', '', '', '', ''])
    triggerBkashError(`Incorrect verification code. ${remaining} ${remaining === 1 ? 'try' : 'tries'} remaining.`)
    otpInputRefs.current[0]?.focus()
  }

  const handleBkashPinSubmit = (event) => {
    event.preventDefault()
    if (inFlightRef.current) return

    const pinDigits = bkashPin.replace(/\D/g, '')
    if (pinDigits !== '12345') {
      triggerBkashError('Incorrect PIN')
      return
    }

    const walletLast3 = bkashWallet.replace(/\D/g, '').slice(-3)
    setBkashError('')
    executeSimulatedPayment({
      payMethod: 'bkash',
      outcome: 'success',
      bkashLast3: walletLast3
    })
  }

  const handleBkashBack = () => {
    if (isSubmitting) return
    setBkashError('')
    if (bkashSubStep === 3) {
      setBkashPin('')
      setShowBkashPin(false)
      setBkashSubStep(2)
    } else if (bkashSubStep === 2) {
      setBkashOtp(['', '', '', '', '', ''])
      setBkashOtpAttempts(0)
      setBkashSubStep(1)
    } else {
      clearSensitiveInputs()
      setStep(1)
    }
  }

  const handleFillBkashDemo = () => {
    setBkashError('')
    if (bkashSubStep === 1) {
      setBkashWallet('01712345678')
    } else if (bkashSubStep === 2) {
      setBkashOtp(['1', '2', '3', '4', '5', '6'])
    } else {
      setBkashPin('12345')
    }
  }

  // -------------------------------------------------------------------------
  // Step 2: Card handlers
  // -------------------------------------------------------------------------

  const cardDigits = cardNumber.replace(/\D/g, '')
  const detectedBrand = detectCardBrand(cardDigits)
  const expectedCvvLen = detectedBrand === 'amex' ? 4 : 3

  const validateCardFields = useCallback((vals) => {
    const errors = {}
    const digits = vals.number.replace(/\D/g, '')
    const brand = detectCardBrand(digits)
    const cvvLen = brand === 'amex' ? 4 : 3

    if (!digits) {
      errors.number = 'Card number is required.'
    } else if (brand === 'amex' && digits.length !== 15) {
      errors.number = 'American Express cards must be 15 digits.'
    } else if (brand !== 'amex' && digits.length < 13) {
      errors.number = 'Enter a valid card number.'
    } else if (!luhnCheck(digits)) {
      errors.number = 'Invalid card number. Please check the digits.'
    }

    if (!vals.name.trim()) {
      errors.name = 'Cardholder name is required.'
    }

    if (!vals.expiry.trim()) {
      errors.expiry = 'Expiry date is required.'
    } else if (!validateExpiry(vals.expiry)) {
      errors.expiry = 'Enter a valid future expiry (MM/YY).'
    }

    const cvvDigits = vals.cvv.replace(/\D/g, '')
    if (!cvvDigits) {
      errors.cvv = 'CVV is required.'
    } else if (cvvDigits.length !== cvvLen) {
      errors.cvv = `Enter a ${cvvLen}-digit security code.`
    }

    return errors
  }, [])

  const handleCardBlur = (field) => {
    setCardTouched((prev) => ({ ...prev, [field]: true }))
    const nextErrors = validateCardFields({
      number: cardNumber,
      name: cardName,
      expiry: cardExpiry,
      cvv: cardCvv
    })
    setCardErrors(nextErrors)
  }

  const handleCardSubmit = (event) => {
    event.preventDefault()
    if (inFlightRef.current) return

    const nextErrors = validateCardFields({
      number: cardNumber,
      name: cardName,
      expiry: cardExpiry,
      cvv: cardCvv
    })
    setCardTouched({ number: true, name: true, expiry: true, cvv: true })
    setCardErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      setCardShakeKey((k) => k + 1)
      return
    }

    const rawDigits = cardNumber.replace(/\D/g, '')
    const brand = detectCardBrand(rawDigits)
    const last4 = rawDigits.slice(-4)
    const isDeclinedCard = rawDigits === '4000000000000002'

    executeSimulatedPayment({
      payMethod: 'card',
      outcome: isDeclinedCard ? 'failed' : 'success',
      cardBrand: brand,
      cardLast4: last4,
      failureReason: isDeclinedCard ? 'Card declined by issuer (demo)' : ''
    })
  }

  const handleFillCardDemo = (declined = false) => {
    const number = declined ? '4000 0000 0000 0002' : '4242 4242 4242 4242'
    setCardNumber(number)
    setCardName('Demo Patient')
    setCardExpiry('12/28')
    setCardCvv('123')
    setCardErrors({})
    setCardTouched({})
  }

  const handleCardBack = () => {
    if (isSubmitting) return
    clearSensitiveInputs()
    setStep(1)
  }

  // -------------------------------------------------------------------------
  // Step 4 handlers
  // -------------------------------------------------------------------------

  const handleCopyTranId = async () => {
    if (!receipt?.tranId) return
    try {
      await navigator.clipboard.writeText(receipt.tranId)
      setCopiedTranId(true)
      setTimeout(() => {
        if (mountedRef.current) setCopiedTranId(false)
      }, 2000)
    } catch {
      toast.error('Could not copy transaction ID.')
    }
  }

  const handleRetrySameMethod = () => {
    clearSensitiveInputs()
    setReceipt(null)
    setBkashSubStep(1)
    setBkashResendSeconds(60)
    setStep(2)
  }

  const handleChooseAnotherMethod = () => {
    clearSensitiveInputs()
    setReceipt(null)
    setMethod('')
    setBkashSubStep(1)
    setStep(1)
  }

  const handleDoneSuccess = () => {
    triggerSmoothClose(true)
  }

  const processingLines =
    method === 'bkash'
      ? ['Connecting to bKash...', 'Verifying wallet balance & PIN...', 'Confirming payment...']
      : ['Contacting your bank...', 'Verifying card details...', 'Confirming payment...']

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 transition-opacity duration-200 motion-reduce:transition-none ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      role='presentation'
    >
      {/* Backdrop */}
      <div
        className='fixed inset-0 bg-gray-900/55 backdrop-blur-sm'
        onClick={handleClose}
        aria-hidden='true'
      />

      {/* Modal / Bottom Sheet */}
      <div
        ref={dialogRef}
        role='dialog'
        aria-modal='true'
        aria-labelledby='payment-modal-title'
        className={`relative z-10 w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-gray-100 max-h-[92vh] overflow-y-auto transition-all duration-200 motion-reduce:transition-none payment-sheet-slide ${
          visible
            ? 'translate-y-0 sm:scale-100 opacity-100'
            : 'translate-y-8 sm:translate-y-2 sm:scale-95 opacity-0'
        }`}
      >
        {/* Mobile grab bar */}
        <div className='sm:hidden flex justify-center pt-2.5 pb-1' aria-hidden='true'>
          <span className='w-10 h-1 rounded-full bg-gray-300' />
        </div>

        {/* Persistent Demo Banner */}
        <div className='bg-amber-50 border-b border-amber-200/80 px-5 py-2 flex items-center justify-center gap-2 text-[11px] sm:text-xs font-semibold text-amber-900'>
          <FlaskConical size={13} className='text-amber-600 shrink-0' />
          <span>DEMO MODE · No real money is charged</span>
        </div>

        <div className='p-5 sm:p-6'>
          {/* Top Title & Close */}
          <div className='flex items-start justify-between gap-4 mb-4'>
            <div>
              <h2 id='payment-modal-title' className='text-lg sm:text-xl font-semibold text-gray-900'>
                {step === 1 && 'Complete your payment'}
                {step === 2 && (method === 'bkash' ? 'bKash Checkout' : 'Card Payment')}
                {step === 3 && 'Processing payment'}
                {step === 4 && (receipt?.status === 'paid' ? 'Payment receipt' : 'Payment unsuccessful')}
              </h2>
              <p className='text-xs sm:text-sm text-gray-500 mt-0.5'>
                {step === 1 && 'Choose a payment method to confirm your booking.'}
                {step === 2 && 'Simulated checkout for portfolio demonstration.'}
                {step === 3 && 'Securely verifying your transaction...'}
                {step === 4 && (receipt?.status === 'paid' ? 'Your appointment is now paid.' : 'Your appointment is still booked and unpaid.')}
              </p>
            </div>

            <button
              ref={closeButtonRef}
              type='button'
              onClick={handleClose}
              disabled={isCloseDisabled}
              aria-label='Close payment modal'
              className='p-2 -mr-1.5 -mt-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-primary'
            >
              <X size={18} />
            </button>
          </div>

          {/* 4-step Stepper */}
          <StepperHeader currentStep={step} method={method} />

          {/* =============================================================== */}
          {/* STEP 1: METHOD SELECTION                                        */}
          {/* =============================================================== */}
          {step === 1 && (
            <div>
              {quoteLoading && (
                <div className='space-y-4' aria-busy='true' aria-label='Loading payment details'>
                  <div className='rounded-2xl border border-gray-200 p-4 space-y-3'>
                    <div className='flex items-center gap-3.5'>
                      <div className='w-14 h-14 rounded-xl bg-gray-200 animate-pulse shrink-0' />
                      <div className='flex-1 space-y-2'>
                        <div className='h-4 w-36 bg-gray-200 rounded animate-pulse' />
                        <div className='h-3 w-24 bg-gray-100 rounded animate-pulse' />
                        <div className='h-3 w-40 bg-gray-100 rounded animate-pulse' />
                      </div>
                    </div>
                    <div className='pt-3 border-t border-gray-100 flex justify-between'>
                      <div className='h-4 w-24 bg-gray-100 rounded animate-pulse' />
                      <div className='h-5 w-20 bg-gray-200 rounded animate-pulse' />
                    </div>
                  </div>
                  <div className='h-20 rounded-2xl bg-gray-100 animate-pulse' />
                  <div className='h-24 rounded-2xl bg-gray-100 animate-pulse' />
                </div>
              )}

              {!quoteLoading && quoteError && (
                <div role='alert' className='rounded-2xl border border-red-200 bg-red-50/70 p-5 text-center'>
                  <AlertCircle size={28} className='text-red-500 mx-auto mb-2.5' />
                  <p className='text-sm font-semibold text-gray-900 mb-1'>Unable to load checkout</p>
                  <p className='text-xs text-red-700 mb-4'>{quoteError}</p>
                  <button
                    type='button'
                    onClick={handleRetryQuote}
                    className='inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors cursor-pointer'
                  >
                    <RefreshCw size={13} />
                    <span>Try again</span>
                  </button>
                </div>
              )}

              {!quoteLoading && !quoteError && quote && (
                <>
                  <OrderSummaryCard quote={quote} currencySymbol={currencySymbol} />

                  <div className='mb-5'>
                    <p
                      id='payment-method-group-label'
                      className='text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3'
                    >
                      Payment method
                    </p>

                    <div
                      role='radiogroup'
                      aria-labelledby='payment-method-group-label'
                      className='space-y-3'
                    >
                      {/* bKash radio-card */}
                      <button
                        type='button'
                        role='radio'
                        aria-checked={method === 'bkash'}
                        onClick={() => setMethod('bkash')}
                        onKeyDown={(e) => handleMethodKeyDown(e, 'bkash')}
                        className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 motion-reduce:transition-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E2136E] ${
                          method === 'bkash'
                            ? 'border-[#E2136E] bg-[#E2136E]/[0.04] ring-2 ring-[#E2136E]/20 shadow-sm'
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/70'
                        }`}
                      >
                        <div className='flex items-center justify-between gap-3'>
                          <div className='flex items-center gap-3.5 min-w-0'>
                            <span className='inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#E2136E] text-white text-xs font-bold tracking-wide shadow-xs shrink-0'>
                              <Wallet size={14} />
                              <span>bKash</span>
                            </span>
                            <div className='min-w-0'>
                              <p className='text-sm font-semibold text-gray-900'>bKash</p>
                              <p className='text-xs text-gray-500 mt-0.5'>Pay with your bKash wallet</p>
                            </div>
                          </div>

                          <span
                            aria-hidden='true'
                            className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                              method === 'bkash'
                                ? 'bg-[#E2136E] text-white'
                                : 'border-2 border-gray-300 bg-white'
                            }`}
                          >
                            {method === 'bkash' && <Check size={12} strokeWidth={3} />}
                          </span>
                        </div>
                      </button>

                      {/* Card radio-card */}
                      <button
                        type='button'
                        role='radio'
                        aria-checked={method === 'card'}
                        onClick={() => setMethod('card')}
                        onKeyDown={(e) => handleMethodKeyDown(e, 'card')}
                        className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 motion-reduce:transition-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                          method === 'card'
                            ? 'border-primary bg-primary/[0.04] ring-2 ring-primary/20 shadow-sm'
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/70'
                        }`}
                      >
                        <div className='flex items-center justify-between gap-3'>
                          <div className='flex items-center gap-3.5 min-w-0'>
                            <span className='w-11 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0'>
                              <CreditCard size={19} />
                            </span>
                            <div className='min-w-0'>
                              <p className='text-sm font-semibold text-gray-900'>Debit / Credit card</p>
                              <p className='text-xs text-gray-500 mt-0.5'>Visa, Mastercard, American Express</p>
                              <div className='flex flex-wrap items-center gap-1.5 mt-2'>
                                <span className='px-2 py-0.5 rounded-md bg-gray-100 border border-gray-200/80 text-[10px] font-semibold tracking-wider text-gray-600'>
                                  VISA
                                </span>
                                <span className='px-2 py-0.5 rounded-md bg-gray-100 border border-gray-200/80 text-[10px] font-semibold tracking-wide text-gray-600'>
                                  Mastercard
                                </span>
                                <span className='px-2 py-0.5 rounded-md bg-gray-100 border border-gray-200/80 text-[10px] font-semibold tracking-wider text-gray-600'>
                                  AMEX
                                </span>
                              </div>
                            </div>
                          </div>

                          <span
                            aria-hidden='true'
                            className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                              method === 'card'
                                ? 'bg-primary text-white'
                                : 'border-2 border-gray-300 bg-white'
                            }`}
                          >
                            {method === 'card' && <Check size={12} strokeWidth={3} />}
                          </span>
                        </div>
                      </button>
                    </div>
                  </div>

                  <button
                    type='button'
                    disabled={!method}
                    onClick={handleContinueFromMethod}
                    className='w-full py-3.5 px-5 rounded-xl bg-primary text-white text-sm font-semibold shadow-sm hover:bg-primary/90 active:scale-[0.99] transition-all duration-200 motion-reduce:transition-none cursor-pointer disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary'
                  >
                    Continue
                  </button>

                  <div className='mt-4 flex items-center justify-center gap-1.5 text-[11px] sm:text-xs text-gray-500'>
                    <Lock size={13} className='text-gray-400 shrink-0' />
                    <span>Simulated checkout · Sensitive inputs never leave your browser.</span>
                  </div>
                </>
              )}
            </div>
          )}

          {/* =============================================================== */}
          {/* STEP 2A: bKash SIMULATED DETAILS FLOW                           */}
          {/* =============================================================== */}
          {step === 2 && method === 'bkash' && quote && (
            <div>
              {/* Pink-accented bKash Merchant Banner */}
              <div className='rounded-2xl bg-gradient-to-r from-[#E2136E] to-[#c40f5e] text-white p-4 mb-4 shadow-sm'>
                <div className='flex items-center justify-between gap-3'>
                  <div className='flex items-center gap-2.5'>
                    <span className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/15 text-xs font-bold'>
                      <Wallet size={14} />
                      <span>bKash</span>
                    </span>
                    <div>
                      <p className='text-xs text-pink-100'>Merchant</p>
                      <p className='text-sm font-semibold leading-tight'>Prescripto Healthcare</p>
                    </div>
                  </div>
                  <div className='text-right'>
                    <p className='text-[11px] text-pink-100'>Payable</p>
                    <p className='text-base font-bold'>৳{formatBDT(quote.amountBDT)}</p>
                  </div>
                </div>

                {/* Mini sub-step pills */}
                <div className='mt-3.5 pt-3 border-t border-white/20 flex items-center justify-between text-[11px]'>
                  {['1. Wallet Number', '2. Verification Code', '3. PIN'].map((label, idx) => {
                    const num = idx + 1
                    const active = bkashSubStep === num
                    const done = bkashSubStep > num
                    return (
                      <span
                        key={label}
                        className={`font-medium ${
                          active ? 'text-white underline underline-offset-4' : done ? 'text-pink-100' : 'text-pink-200/70'
                        }`}
                      >
                        {label}
                      </span>
                    )
                  })}
                </div>
              </div>

              <DemoCredentialsPanel
                title='Demo credentials'
                accent='pink'
                items={[
                  { label: 'Wallet number', value: '01712345678 (any 01XXXXXXXXX)' },
                  { label: 'Verification OTP', value: '123456 (3 wrong tries fail)' },
                  { label: 'bKash PIN', value: '12345' }
                ]}
                onFill={handleFillBkashDemo}
              />

              {/* Sub-step 1: Wallet Number */}
              {bkashSubStep === 1 && (
                <form onSubmit={handleBkashWalletContinue} noValidate>
                  <div key={bkashShakeKey} className={bkashError ? 'payment-shake' : ''}>
                    <label htmlFor='bkash-wallet-input' className='block text-xs font-semibold text-gray-700 mb-1.5'>
                      Your bKash Account Number
                    </label>
                    <input
                      id='bkash-wallet-input'
                      type='tel'
                      inputMode='numeric'
                      autoComplete='off'
                      maxLength={11}
                      placeholder='e.g. 01712345678'
                      value={bkashWallet}
                      onChange={(e) => {
                        setBkashWallet(e.target.value.replace(/\D/g, '').slice(0, 11))
                        setBkashError('')
                      }}
                      aria-invalid={Boolean(bkashError)}
                      className={`w-full px-4 py-3 rounded-xl border text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                        bkashError
                          ? 'border-red-400 focus:ring-red-200 bg-red-50/30'
                          : 'border-gray-300 focus:border-[#E2136E] focus:ring-[#E2136E]/20'
                      }`}
                    />
                    <p className='text-[11px] text-gray-500 mt-1.5'>
                      Enter an 11-digit Bangladeshi mobile number starting with 01.
                    </p>

                    {bkashError && (
                      <p role='alert' className='mt-2 flex items-center gap-1.5 text-xs font-medium text-red-600'>
                        <AlertCircle size={14} className='shrink-0' />
                        <span>{bkashError}</span>
                      </p>
                    )}
                  </div>

                  <div className='mt-5 flex items-center gap-2.5'>
                    <button
                      type='button'
                      onClick={handleBkashBack}
                      className='px-4 py-3 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer inline-flex items-center gap-1.5'
                    >
                      <ArrowLeft size={15} />
                      <span>Back</span>
                    </button>
                    <button
                      type='submit'
                      className='flex-1 py-3 px-5 rounded-xl bg-[#E2136E] text-white text-sm font-semibold shadow-sm hover:bg-[#c81061] transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#E2136E]'
                    >
                      Send verification code
                    </button>
                  </div>
                </form>
              )}

              {/* Sub-step 2: 6-Box OTP */}
              {bkashSubStep === 2 && (
                <form onSubmit={handleBkashOtpContinue} noValidate>
                  <div key={bkashShakeKey} className={bkashError ? 'payment-shake' : ''}>
                    <p className='text-xs text-gray-600 mb-3'>
                      Enter the 6-digit demo verification code sent to{' '}
                      <span className='font-semibold text-gray-900'>
                        01••••••{bkashWallet.slice(-3)}
                      </span>
                    </p>

                    <div
                      className='grid grid-cols-6 gap-2 sm:gap-2.5'
                      role='group'
                      aria-label='6-digit verification code'
                    >
                      {bkashOtp.map((digit, index) => (
                        <input
                          key={index}
                          ref={(el) => {
                            otpInputRefs.current[index] = el
                          }}
                          type='text'
                          inputMode='numeric'
                          autoComplete='one-time-code'
                          maxLength={1}
                          aria-label={`Verification digit ${index + 1}`}
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          onPaste={handleOtpPaste}
                          className={`h-12 text-center text-lg font-bold rounded-xl border text-gray-900 focus:outline-none focus:ring-2 transition-colors ${
                            bkashError
                              ? 'border-red-400 bg-red-50/30 focus:ring-red-200'
                              : 'border-gray-300 focus:border-[#E2136E] focus:ring-[#E2136E]/20'
                          }`}
                        />
                      ))}
                    </div>

                    <div className='mt-3 flex items-center justify-between text-xs'>
                      <span className='text-gray-500'>Didn&apos;t receive a code?</span>
                      {bkashResendSeconds > 0 ? (
                        <span className='text-gray-400 font-medium tabular-nums'>
                          Resend code in {bkashResendSeconds}s
                        </span>
                      ) : (
                        <button
                          type='button'
                          onClick={() => setBkashResendSeconds(60)}
                          className='font-semibold text-[#E2136E] hover:underline cursor-pointer'
                        >
                          Resend code
                        </button>
                      )}
                    </div>

                    {bkashError && (
                      <p role='alert' className='mt-2.5 flex items-center gap-1.5 text-xs font-medium text-red-600'>
                        <AlertCircle size={14} className='shrink-0' />
                        <span>{bkashError}</span>
                      </p>
                    )}
                  </div>

                  <div className='mt-5 flex items-center gap-2.5'>
                    <button
                      type='button'
                      disabled={isSubmitting}
                      onClick={handleBkashBack}
                      className='px-4 py-3 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5'
                    >
                      <ArrowLeft size={15} />
                      <span>Back</span>
                    </button>
                    <button
                      type='submit'
                      disabled={isSubmitting}
                      className='flex-1 py-3 px-5 rounded-xl bg-[#E2136E] text-white text-sm font-semibold shadow-sm hover:bg-[#c81061] transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#E2136E]'
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={16} className='animate-spin' />
                          <span>Verifying...</span>
                        </>
                      ) : (
                        <span>Verify code</span>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* Sub-step 3: bKash PIN */}
              {bkashSubStep === 3 && (
                <form onSubmit={handleBkashPinSubmit} noValidate>
                  <div key={bkashShakeKey} className={bkashError ? 'payment-shake' : ''}>
                    <label htmlFor='bkash-pin-input' className='block text-xs font-semibold text-gray-700 mb-1.5'>
                      Enter bKash PIN
                    </label>
                    <div className='relative'>
                      <input
                        id='bkash-pin-input'
                        type={showBkashPin ? 'text' : 'password'}
                        inputMode='numeric'
                        autoComplete='off'
                        maxLength={5}
                        placeholder='•••••'
                        value={bkashPin}
                        onChange={(e) => {
                          setBkashPin(e.target.value.replace(/\D/g, '').slice(0, 5))
                          setBkashError('')
                        }}
                        aria-invalid={Boolean(bkashError)}
                        className={`w-full pl-4 pr-11 py-3 rounded-xl border text-base tracking-[0.35em] font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                          bkashError
                            ? 'border-red-400 bg-red-50/30 focus:ring-red-200'
                            : 'border-gray-300 focus:border-[#E2136E] focus:ring-[#E2136E]/20'
                        }`}
                      />
                      <button
                        type='button'
                        onClick={() => setShowBkashPin((prev) => !prev)}
                        aria-label={showBkashPin ? 'Hide PIN' : 'Show PIN'}
                        className='absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-700 cursor-pointer'
                      >
                        {showBkashPin ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <p className='text-[11px] text-gray-500 mt-1.5'>
                      Confirming payment of <span className='font-semibold text-gray-700'>৳{formatBDT(quote.amountBDT)}</span> from wallet 01••••••{bkashWallet.slice(-3)}.
                    </p>

                    {bkashError && (
                      <p role='alert' className='mt-2 flex items-center gap-1.5 text-xs font-medium text-red-600'>
                        <AlertCircle size={14} className='shrink-0' />
                        <span>{bkashError}</span>
                      </p>
                    )}
                  </div>

                  <div className='mt-5 flex items-center gap-2.5'>
                    <button
                      type='button'
                      disabled={isSubmitting}
                      onClick={handleBkashBack}
                      className='px-4 py-3 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5'
                    >
                      <ArrowLeft size={15} />
                      <span>Back</span>
                    </button>
                    <button
                      type='submit'
                      disabled={isSubmitting}
                      className='flex-1 py-3 px-5 rounded-xl bg-[#E2136E] text-white text-sm font-semibold shadow-sm hover:bg-[#c81061] transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#E2136E]'
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={16} className='animate-spin' />
                          <span>Starting payment...</span>
                        </>
                      ) : (
                        <span>Pay ৳{formatBDT(quote.amountBDT)}</span>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* =============================================================== */}
          {/* STEP 2B: DEBIT / CREDIT CARD FORM                               */}
          {/* =============================================================== */}
          {step === 2 && method === 'card' && quote && (
            <div>
              {/* Live Virtual Card Preview */}
              <div className='rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-800 text-white p-5 mb-4 shadow-md relative overflow-hidden'>
                <div
                  className='absolute -top-10 -right-10 w-36 h-36 rounded-full bg-primary/25 blur-2xl pointer-events-none'
                  aria-hidden='true'
                />
                <div className='relative flex items-center justify-between mb-6'>
                  <div className='flex items-center gap-2'>
                    <CreditCard size={18} className='text-indigo-200' />
                    <span className='text-[11px] uppercase tracking-widest text-indigo-200 font-medium'>
                      Demo Card
                    </span>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold tracking-wider transition-colors ${
                      detectedBrand
                        ? 'bg-white text-slate-900'
                        : 'bg-white/15 text-indigo-100'
                    }`}
                  >
                    {detectedBrand ? brandDisplayLabel(detectedBrand) : 'CARD'}
                  </span>
                </div>

                <p className='relative font-mono text-base sm:text-lg tracking-[0.18em] text-white mb-5'>
                  {formatMaskedCardPreview(cardDigits, detectedBrand)}
                </p>

                <div className='relative flex items-end justify-between gap-4'>
                  <div className='min-w-0'>
                    <p className='text-[10px] uppercase tracking-wider text-indigo-200/80'>Cardholder</p>
                    <p className='text-xs sm:text-sm font-medium truncate uppercase tracking-wide mt-0.5'>
                      {cardName.trim() || 'YOUR NAME'}
                    </p>
                  </div>
                  <div className='text-right shrink-0'>
                    <p className='text-[10px] uppercase tracking-wider text-indigo-200/80'>Expires</p>
                    <p className='text-xs sm:text-sm font-mono font-medium mt-0.5'>
                      {cardExpiry || 'MM/YY'}
                    </p>
                  </div>
                </div>
              </div>

              <DemoCredentialsPanel
                title='Demo credentials'
                accent='indigo'
                items={[
                  { label: 'Success card (Visa)', value: '4242 4242 4242 4242' },
                  { label: 'Declined card', value: '4000 0000 0000 0002' },
                  { label: 'Expiry & CVV', value: 'Any future MM/YY · 3 digits (4 Amex)' }
                ]}
                onFill={() => handleFillCardDemo(false)}
                secondaryFillLabel='Fill declined card'
                onSecondaryFill={() => handleFillCardDemo(true)}
              />

              <form onSubmit={handleCardSubmit} noValidate>
                <div key={cardShakeKey} className={`space-y-3.5 ${Object.keys(cardErrors).length > 0 && cardShakeKey > 0 ? 'payment-shake' : ''}`}>
                  {/* Card Number */}
                  <div>
                    <div className='flex items-center justify-between mb-1.5'>
                      <label htmlFor='card-number-input' className='text-xs font-semibold text-gray-700'>
                        Card number
                      </label>
                      <div className='flex items-center gap-1'>
                        {['visa', 'mastercard', 'amex'].map((brand) => (
                          <span
                            key={brand}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border transition-colors ${
                              detectedBrand === brand
                                ? 'bg-primary text-white border-primary'
                                : 'bg-gray-50 text-gray-400 border-gray-200'
                            }`}
                          >
                            {brandDisplayLabel(brand)}
                          </span>
                        ))}
                      </div>
                    </div>
                    <input
                      id='card-number-input'
                      type='text'
                      inputMode='numeric'
                      autoComplete='cc-number'
                      placeholder='4242 4242 4242 4242'
                      value={cardNumber}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, '')
                        const nextBrand = detectCardBrand(raw)
                        setCardNumber(formatCardNumber(raw, nextBrand))
                        if (cardTouched.number) {
                          setCardErrors((prev) => ({ ...prev, number: undefined }))
                        }
                      }}
                      onBlur={() => handleCardBlur('number')}
                      aria-invalid={Boolean(cardTouched.number && cardErrors.number)}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                        cardTouched.number && cardErrors.number
                          ? 'border-red-400 bg-red-50/30 focus:ring-red-200'
                          : 'border-gray-300 focus:border-primary focus:ring-primary/20'
                      }`}
                    />
                    {cardTouched.number && cardErrors.number && (
                      <p role='alert' className='mt-1 text-xs text-red-600'>
                        {cardErrors.number}
                      </p>
                    )}
                  </div>

                  {/* Cardholder Name */}
                  <div>
                    <label htmlFor='card-name-input' className='block text-xs font-semibold text-gray-700 mb-1.5'>
                      Cardholder name
                    </label>
                    <input
                      id='card-name-input'
                      type='text'
                      autoComplete='cc-name'
                      placeholder='Full name on card'
                      value={cardName}
                      onChange={(e) => {
                        setCardName(e.target.value)
                        if (cardTouched.name) {
                          setCardErrors((prev) => ({ ...prev, name: undefined }))
                        }
                      }}
                      onBlur={() => handleCardBlur('name')}
                      aria-invalid={Boolean(cardTouched.name && cardErrors.name)}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                        cardTouched.name && cardErrors.name
                          ? 'border-red-400 bg-red-50/30 focus:ring-red-200'
                          : 'border-gray-300 focus:border-primary focus:ring-primary/20'
                      }`}
                    />
                    {cardTouched.name && cardErrors.name && (
                      <p role='alert' className='mt-1 text-xs text-red-600'>
                        {cardErrors.name}
                      </p>
                    )}
                  </div>

                  {/* Expiry + CVV */}
                  <div className='grid grid-cols-2 gap-3'>
                    <div>
                      <label htmlFor='card-expiry-input' className='block text-xs font-semibold text-gray-700 mb-1.5'>
                        Expiry date
                      </label>
                      <input
                        id='card-expiry-input'
                        type='text'
                        inputMode='numeric'
                        autoComplete='cc-exp'
                        placeholder='MM/YY'
                        maxLength={5}
                        value={cardExpiry}
                        onChange={(e) => {
                          setCardExpiry(formatExpiry(e.target.value))
                          if (cardTouched.expiry) {
                            setCardErrors((prev) => ({ ...prev, expiry: undefined }))
                          }
                        }}
                        onBlur={() => handleCardBlur('expiry')}
                        aria-invalid={Boolean(cardTouched.expiry && cardErrors.expiry)}
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                          cardTouched.expiry && cardErrors.expiry
                            ? 'border-red-400 bg-red-50/30 focus:ring-red-200'
                            : 'border-gray-300 focus:border-primary focus:ring-primary/20'
                        }`}
                      />
                      {cardTouched.expiry && cardErrors.expiry && (
                        <p role='alert' className='mt-1 text-xs text-red-600'>
                          {cardErrors.expiry}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor='card-cvv-input' className='block text-xs font-semibold text-gray-700 mb-1.5'>
                        CVV
                      </label>
                      <div className='relative'>
                        <input
                          id='card-cvv-input'
                          type={showCardCvv ? 'text' : 'password'}
                          inputMode='numeric'
                          autoComplete='cc-csc'
                          placeholder={expectedCvvLen === 4 ? '1234' : '123'}
                          maxLength={expectedCvvLen}
                          value={cardCvv}
                          onChange={(e) => {
                            setCardCvv(e.target.value.replace(/\D/g, '').slice(0, expectedCvvLen))
                            if (cardTouched.cvv) {
                              setCardErrors((prev) => ({ ...prev, cvv: undefined }))
                            }
                          }}
                          onBlur={() => handleCardBlur('cvv')}
                          aria-invalid={Boolean(cardTouched.cvv && cardErrors.cvv)}
                          className={`w-full pl-3.5 pr-9 py-2.5 rounded-xl border text-sm font-mono text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                            cardTouched.cvv && cardErrors.cvv
                              ? 'border-red-400 bg-red-50/30 focus:ring-red-200'
                              : 'border-gray-300 focus:border-primary focus:ring-primary/20'
                          }`}
                        />
                        <button
                          type='button'
                          onClick={() => setShowCardCvv((prev) => !prev)}
                          aria-label={showCardCvv ? 'Hide CVV' : 'Show CVV'}
                          className='absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-700 cursor-pointer'
                        >
                          {showCardCvv ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                      {cardTouched.cvv && cardErrors.cvv && (
                        <p role='alert' className='mt-1 text-xs text-red-600'>
                          {cardErrors.cvv}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className='mt-5 flex items-center gap-2.5'>
                  <button
                    type='button'
                    disabled={isSubmitting}
                    onClick={handleCardBack}
                    className='px-4 py-3 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5'
                  >
                    <ArrowLeft size={15} />
                    <span>Back</span>
                  </button>
                  <button
                    type='submit'
                    disabled={isSubmitting}
                    className='flex-1 py-3 px-5 rounded-xl bg-primary text-white text-sm font-semibold shadow-sm hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary'
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={16} className='animate-spin' />
                        <span>Starting payment...</span>
                      </>
                    ) : (
                      <span>Pay ৳{formatBDT(quote.amountBDT)}</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* =============================================================== */}
          {/* STEP 3: PROCESSING SCREEN                                       */}
          {/* =============================================================== */}
          {step === 3 && (
            <div className='py-10 px-4 text-center' aria-live='polite' aria-busy='true'>
              <div className='relative w-20 h-20 mx-auto mb-6 flex items-center justify-center'>
                <span
                  className={`absolute inset-0 rounded-full payment-spinner-pulse ${
                    method === 'bkash' ? 'bg-[#E2136E]/25' : 'bg-primary/25'
                  }`}
                  aria-hidden='true'
                />
                <span
                  className={`w-16 h-16 rounded-full border-[3px] border-gray-100 animate-spin motion-reduce:animate-none ${
                    method === 'bkash' ? 'border-t-[#E2136E]' : 'border-t-primary'
                  }`}
                  aria-hidden='true'
                />
                <span
                  className={`absolute flex items-center justify-center ${
                    method === 'bkash' ? 'text-[#E2136E]' : 'text-primary'
                  }`}
                >
                  {method === 'bkash' ? <Wallet size={22} /> : <ShieldCheck size={22} />}
                </span>
              </div>

              <p className='text-base font-semibold text-gray-900 mb-1.5'>
                {processingLines[processingLineIndex] || processingLines[0]}
              </p>
              <p className='text-xs text-gray-500'>
                Please wait a moment. Do not close this window.
              </p>
            </div>
          )}

          {/* =============================================================== */}
          {/* STEP 4: RESULT (SUCCESS RECEIPT OR FAILURE)                     */}
          {/* =============================================================== */}
          {step === 4 && receipt && receipt.status === 'paid' && (
            <div>
              <div className='text-center mb-5'>
                <div className='w-16 h-16 mx-auto mb-3'>
                  <svg
                    viewBox='0 0 56 56'
                    className='w-full h-full'
                    role='img'
                    aria-label='Payment successful'
                  >
                    <circle
                      cx='28'
                      cy='28'
                      r='25'
                      fill='#ecfdf5'
                      stroke='#10b981'
                      strokeWidth='3'
                      className='payment-check-circle'
                    />
                    <path
                      d='M17 29.2l7.2 7.2L39.5 21'
                      fill='none'
                      stroke='#10b981'
                      strokeWidth='3.5'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      className='payment-check-mark'
                    />
                  </svg>
                </div>
                <h3 className='text-lg font-bold text-gray-900'>Payment successful</h3>
                <p className='text-xs text-gray-500 mt-0.5'>
                  Your demo payment has been confirmed.
                </p>
              </div>

              {/* Receipt Card */}
              <div className='rounded-2xl bg-slate-50/90 border border-gray-200/80 p-4 mb-5 space-y-3 text-xs'>
                <div className='flex items-center justify-between gap-2 pb-3 border-b border-gray-200/80'>
                  <div>
                    <p className='text-gray-500'>Transaction ID</p>
                    <p className='font-mono font-semibold text-gray-900 text-xs mt-0.5 break-all'>
                      {receipt.tranId}
                    </p>
                  </div>
                  <button
                    type='button'
                    onClick={handleCopyTranId}
                    className='inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 text-[11px] font-medium shrink-0 cursor-pointer'
                  >
                    {copiedTranId ? (
                      <>
                        <Check size={12} className='text-emerald-600' />
                        <span className='text-emerald-700'>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                <div className='flex items-center justify-between gap-3'>
                  <span className='text-gray-500'>Method</span>
                  <span className='font-semibold text-gray-900 inline-flex items-center gap-1.5'>
                    {receipt.method === 'bkash' ? (
                      <>
                        <span className='px-2 py-0.5 rounded-md bg-[#E2136E] text-white text-[10px] font-bold'>
                          bKash
                        </span>
                        <span>{receipt.bkashLast3 ? `bKash ••• ${receipt.bkashLast3}` : 'bKash'}</span>
                      </>
                    ) : (
                      <span>
                        {brandDisplayLabel(receipt.cardBrand)}
                        {receipt.cardLast4 ? ` •••• ${receipt.cardLast4}` : ''}
                      </span>
                    )}
                  </span>
                </div>

                <div className='flex items-center justify-between gap-3'>
                  <span className='text-gray-500'>Amount paid</span>
                  <span className='font-bold text-gray-900 text-sm'>
                    ৳{formatBDT(receipt.amountBDT)}{' '}
                    <span className='text-[11px] font-normal text-gray-500'>
                      ({currencySymbol}{receipt.amountUSD})
                    </span>
                  </span>
                </div>

                <div className='flex items-center justify-between gap-3'>
                  <span className='text-gray-500'>Doctor</span>
                  <span className='font-medium text-gray-900 text-right'>{receipt.doctorName}</span>
                </div>

                <div className='flex items-center justify-between gap-3'>
                  <span className='text-gray-500'>Appointment</span>
                  <span className='font-medium text-gray-900 text-right'>
                    {formatSlotDate(receipt.slotDate)} · {receipt.slotTime}
                  </span>
                </div>

                <div className='flex items-center justify-between gap-3'>
                  <span className='text-gray-500'>Paid at</span>
                  <span className='font-medium text-gray-900 text-right'>
                    {formatPaidAt(receipt.paidAt)}
                  </span>
                </div>
              </div>

              <button
                type='button'
                onClick={handleDoneSuccess}
                className='w-full py-3.5 px-5 rounded-xl bg-primary text-white text-sm font-semibold shadow-sm hover:bg-primary/90 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary'
              >
                Done
              </button>
            </div>
          )}

          {step === 4 && receipt && receipt.status !== 'paid' && (
            <div className='text-center'>
              <div className='w-16 h-16 mx-auto mb-3 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-500'>
                <XCircle size={34} />
              </div>

              <h3 className='text-lg font-bold text-gray-900'>Payment failed</h3>
              <p className='text-sm text-rose-700 font-medium mt-1.5'>
                {receipt.failureReason || 'The payment could not be completed.'}
              </p>
              <p className='text-xs text-gray-500 mt-1 mb-4'>
                No charge was made. Your appointment slot is still reserved.
              </p>

              {receipt.tranId && (
                <div className='mb-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-[11px] text-gray-600'>
                  <span>Ref:</span>
                  <code className='font-mono font-semibold text-gray-800'>{receipt.tranId}</code>
                </div>
              )}

              <div className='flex flex-col sm:flex-row gap-2.5'>
                <button
                  type='button'
                  onClick={handleRetrySameMethod}
                  className='flex-1 py-3 px-4 rounded-xl bg-primary text-white text-sm font-semibold shadow-sm hover:bg-primary/90 transition-colors cursor-pointer'
                >
                  Try again
                </button>
                <button
                  type='button'
                  onClick={handleChooseAnotherMethod}
                  className='flex-1 py-3 px-4 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer'
                >
                  Choose another method
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PaymentModal
