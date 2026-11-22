import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    docId: { type: String, required: true },
    slotDate: { type: String, required: true },
    slotTime: { type: String, required: true },
    userData: { type: Object, required: true },
    docData: { type: Object, required: true },
    amount: { type: Number, required: true },
    date: { type: Number, required: true },
    cancelled: { type: Boolean, default: false },
    cancelledBy: { type: String, enum: ['user', 'admin', 'doctor'] },
    cancelledAt: { type: Number },
    payment: { type: Boolean, default: false },
    isCompleted: { type: Boolean, default: false }
}, { timestamps: true })

appointmentSchema.index({ docId: 1, updatedAt: -1 })
appointmentSchema.index({ docId: 1, createdAt: -1 })
appointmentSchema.index({ docId: 1, date: -1 })

const appointmentModel = mongoose.models.appointment || mongoose.model('appointment',appointmentSchema)

export default appointmentModel