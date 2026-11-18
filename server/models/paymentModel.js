import mongoose from 'mongoose'

const paymentSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'appointment',
      required: true
    },
    userId: { type: String, required: true },
    tranId: { type: String, required: true, unique: true },
    method: { type: String, enum: ['bkash', 'card'], required: true },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending'
    },
    amountUSD: { type: Number, required: true },
    amountBDT: { type: Number, required: true },
    currency: { type: String, default: 'BDT' },
    cardBrand: { type: String, default: '' },
    cardLast4: { type: String, default: '' },
    bkashLast3: { type: String, default: '' },
    failureReason: { type: String, default: '' },
    paidAt: { type: Date, default: null }
  },
  { timestamps: true }
)

paymentSchema.index({ appointmentId: 1 })
paymentSchema.index({ userId: 1 })

const paymentModel = mongoose.models.payment || mongoose.model('payment', paymentSchema)

export default paymentModel
