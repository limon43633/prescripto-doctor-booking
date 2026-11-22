import crypto from 'crypto'
import mongoose from 'mongoose'
import appointmentModel from '../models/appointmentModel.js'
import paymentModel from '../models/paymentModel.js'

const ALLOWED_METHODS = new Set(['bkash', 'card'])
const ALLOWED_CARD_BRANDS = new Set(['visa', 'mastercard', 'amex'])

// ---------------------------------------------------------------------------
// Internal payment provider helpers
// Isolated here so a real gateway (e.g. SSLCommerz) can replace the demo
// initiation/confirmation steps later without changing the data model or the
// client contract.
// ---------------------------------------------------------------------------

const isDemoPaymentsEnabled = () => {
  return process.env.DEMO_PAYMENTS === 'true'
}

const getExchangeRate = () => {
  const raw = process.env.USD_TO_BDT_RATE
  if (raw === undefined || String(raw).trim() === '') return 120
  const parsed = Number(raw)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 120
}

const computeAmountBDT = (amountUSD, rate) => {
  return Number((Number(amountUSD) * rate).toFixed(2))
}

const generateTranId = () => {
  const rand = crypto.randomBytes(4).toString('hex').toUpperCase()
  return `DEMO-${Date.now()}-${rand}`
}

const validatePayableAppointment = async (appointmentId, userId) => {
  if (!appointmentId || !mongoose.Types.ObjectId.isValid(appointmentId)) {
    return { ok: false, message: 'Invalid appointment ID' }
  }

  const appointment = await appointmentModel.findById(appointmentId)
  if (!appointment) {
    return { ok: false, message: 'Appointment not found' }
  }

  if (String(appointment.userId) !== String(userId)) {
    return { ok: false, message: 'Unauthorized action' }
  }

  if (appointment.cancelled) {
    return { ok: false, message: 'Cancelled appointments cannot be paid' }
  }

  if (appointment.isCompleted) {
    return { ok: false, message: 'Completed appointments cannot be paid' }
  }

  if (appointment.payment) {
    return { ok: false, message: 'Appointment is already paid' }
  }

  return { ok: true, appointment }
}

const sanitizeMetadata = ({ method, cardBrand, cardLast4, bkashLast3, failureReason }) => {
  const normalizedBrand = String(cardBrand || '').trim().toLowerCase()
  const safeCardBrand =
    method === 'card' && ALLOWED_CARD_BRANDS.has(normalizedBrand) ? normalizedBrand : ''

  const rawCardLast4 = String(cardLast4 || '').trim()
  const safeCardLast4 =
    method === 'card' && /^\d{4}$/.test(rawCardLast4) ? rawCardLast4 : ''

  const rawBkashLast3 = String(bkashLast3 || '').trim()
  const safeBkashLast3 =
    method === 'bkash' && /^\d{3}$/.test(rawBkashLast3) ? rawBkashLast3 : ''

  const safeFailureReason = String(failureReason || '').trim().slice(0, 160)

  return {
    cardBrand: safeCardBrand,
    cardLast4: safeCardLast4,
    bkashLast3: safeBkashLast3,
    failureReason: safeFailureReason
  }
}

const buildReceipt = (payment, appointment) => {
  return {
    tranId: payment.tranId,
    status: payment.status,
    method: payment.method,
    amountBDT: payment.amountBDT,
    amountUSD: payment.amountUSD,
    cardBrand: payment.cardBrand || '',
    cardLast4: payment.cardLast4 || '',
    bkashLast3: payment.bkashLast3 || '',
    failureReason: payment.failureReason || '',
    doctorName: appointment?.docData?.name || '',
    slotDate: appointment?.slotDate || '',
    slotTime: appointment?.slotTime || '',
    paidAt: payment.paidAt
  }
}

// Note: In a real gateway integration (e.g. SSLCommerz), the payment outcome must
// come from the gateway's server-side validation API, never from the client.
// This demo settlement helper intentionally accepts the simulated client outcome.
const settleDemoPayment = async ({ payment, appointment, outcome, metadata }) => {
  if (outcome === 'success') {
    const updatedPayment = await paymentModel.findOneAndUpdate(
      { _id: payment._id, status: 'pending' },
      {
        $set: {
          status: 'paid',
          cardBrand: metadata.cardBrand,
          cardLast4: metadata.cardLast4,
          bkashLast3: metadata.bkashLast3,
          failureReason: '',
          paidAt: new Date()
        }
      },
      { new: true }
    )

    if (!updatedPayment) {
      const current = await paymentModel.findById(payment._id)
      if (current?.status === 'paid') {
        await appointmentModel.findByIdAndUpdate(payment.appointmentId, { payment: true, updatedAt: new Date() })
      }
      return current || payment
    }

    await appointmentModel.findByIdAndUpdate(payment.appointmentId, { payment: true, updatedAt: new Date() })
    return updatedPayment
  }

  const updatedPayment = await paymentModel.findOneAndUpdate(
    { _id: payment._id, status: 'pending' },
    {
      $set: {
        status: 'failed',
        cardBrand: metadata.cardBrand,
        cardLast4: metadata.cardLast4,
        bkashLast3: metadata.bkashLast3,
        failureReason: metadata.failureReason || 'Payment declined (demo)'
      }
    },
    { new: true }
  )

  if (!updatedPayment) {
    return (await paymentModel.findById(payment._id)) || payment
  }

  return updatedPayment
}

// ---------------------------------------------------------------------------
// Route handlers
// ---------------------------------------------------------------------------

// GET /api/payment/quote?appointmentId=... (authUser)
const getPaymentQuote = async (req, res) => {
  try {
    if (!isDemoPaymentsEnabled()) {
      return res.json({ success: false, message: 'Demo payments are disabled' })
    }

    const { appointmentId } = req.query
    const check = await validatePayableAppointment(appointmentId, req.userId)
    if (!check.ok) {
      return res.json({ success: false, message: check.message })
    }

    const { appointment } = check
    const rate = getExchangeRate()
    const amountUSD = Number(appointment.amount)
    const amountBDT = computeAmountBDT(amountUSD, rate)

    res.json({
      success: true,
      doctor: {
        name: appointment.docData?.name || '',
        image: appointment.docData?.image || '',
        speciality: appointment.docData?.speciality || ''
      },
      slotDate: appointment.slotDate,
      slotTime: appointment.slotTime,
      amountUSD,
      amountBDT,
      rate,
      demo: true
    })
  } catch (error) {
    console.log(error.message)
    res.json({ success: false, message: 'Could not load payment details' })
  }
}

// POST /api/payment/init (authUser)
const initPayment = async (req, res) => {
  try {
    if (!isDemoPaymentsEnabled()) {
      return res.json({ success: false, message: 'Demo payments are disabled' })
    }

    const { appointmentId, method } = req.body
    if (!ALLOWED_METHODS.has(method)) {
      return res.json({ success: false, message: 'Please select a valid payment method' })
    }

    const check = await validatePayableAppointment(appointmentId, req.userId)
    if (!check.ok) {
      return res.json({ success: false, message: check.message })
    }

    const { appointment } = check
    const rate = getExchangeRate()
    const amountUSD = Number(appointment.amount)
    const amountBDT = computeAmountBDT(amountUSD, rate)
    const tranId = generateTranId()

    const payment = new paymentModel({
      appointmentId: appointment._id,
      userId: String(req.userId),
      tranId,
      method,
      status: 'pending',
      amountUSD,
      amountBDT,
      currency: 'BDT'
    })

    await payment.save()

    res.json({
      success: true,
      tranId,
      amountBDT
    })
  } catch (error) {
    console.log(error.message)
    res.json({ success: false, message: 'Could not start payment session' })
  }
}

// POST /api/payment/confirm (authUser)
const confirmPayment = async (req, res) => {
  try {
    if (!isDemoPaymentsEnabled()) {
      return res.json({ success: false, message: 'Demo payments are disabled' })
    }

    const { tranId, outcome, cardBrand, cardLast4, bkashLast3, failureReason } = req.body

    if (!tranId || typeof tranId !== 'string') {
      return res.json({ success: false, message: 'Transaction ID is required' })
    }

    if (outcome !== 'success' && outcome !== 'failed') {
      return res.json({ success: false, message: 'Invalid payment outcome' })
    }

    const payment = await paymentModel.findOne({ tranId: tranId.trim() })
    if (!payment) {
      return res.json({ success: false, message: 'Payment record not found' })
    }

    if (String(payment.userId) !== String(req.userId)) {
      return res.json({ success: false, message: 'Unauthorized action' })
    }

    const appointment = await appointmentModel.findById(payment.appointmentId)

    // Idempotent handling: return existing settled state without modifying it
    if (payment.status === 'paid') {
      if (appointment && !appointment.payment) {
        await appointmentModel.findByIdAndUpdate(payment.appointmentId, { payment: true, updatedAt: new Date() })
      }
      return res.json({
        success: true,
        receipt: buildReceipt(payment, appointment)
      })
    }

    if (payment.status === 'failed') {
      return res.json({
        success: true,
        receipt: buildReceipt(payment, appointment)
      })
    }

    // Re-validate appointment is still payable before settling a pending payment
    if (!appointment) {
      return res.json({ success: false, message: 'Appointment not found' })
    }

    if (appointment.cancelled) {
      return res.json({ success: false, message: 'Cancelled appointments cannot be paid' })
    }

    if (appointment.isCompleted) {
      return res.json({ success: false, message: 'Completed appointments cannot be paid' })
    }

    if (appointment.payment) {
      return res.json({ success: false, message: 'Appointment is already paid' })
    }

    const metadata = sanitizeMetadata({
      method: payment.method,
      cardBrand,
      cardLast4,
      bkashLast3,
      failureReason
    })

    const settledPayment = await settleDemoPayment({
      payment,
      appointment,
      outcome,
      metadata
    })

    res.json({
      success: true,
      receipt: buildReceipt(settledPayment, appointment)
    })
  } catch (error) {
    console.log(error.message)
    res.json({ success: false, message: 'Could not confirm payment' })
  }
}

export { getPaymentQuote, initPayment, confirmPayment }
