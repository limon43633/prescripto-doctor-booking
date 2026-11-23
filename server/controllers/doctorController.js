import doctorModel from "../models/doctorModel.js"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import appointmentModel from "../models/appointmentModel.js"


const changeAvailability = async (req, res) => {
  try {

    const { docId } = req.body

    const docData = await doctorModel.findById(docId)
    await doctorModel.findByIdAndUpdate(docId, { available: !docData.available })
    res.json({ success: true, message: 'Availability Changed' })



  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

const doctorList = async (req, res) => {
  try {

    const doctors = await doctorModel.find({}).select(['-password', '-email'])

    res.json({ success: true, doctors })

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}



// API for doctor login
const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.json({ success: false, message: 'Invalid credentials' })
    }

    const doctor = await doctorModel.findOne({ email })

    if (!doctor) {
      return res.json({ success: false, message: 'Invalid credentials' })
    }

    const isMatch = await bcrypt.compare(password, doctor.password)

    if (!isMatch) {
      return res.json({ success: false, message: 'Invalid credentials' })
    }

    const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET)
    res.json({ success: true, token })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}



// API to get doctor appointments for doctor panel
// Sorted by updatedAt (descending) with fallback to createdAt (descending) and date (descending)
const appointmentsDoctor = async (req, res) => {
  try {
    const appointments = await appointmentModel
      .find({ docId: req.docId })
      .sort({ updatedAt: -1, createdAt: -1, date: -1 })

    // Strict in-memory sort to guarantee newest / recently updated bookings appear at the top
    // across mixed document versions (Date objects, ISO strings, epoch numbers)
    appointments.sort((a, b) => {
      const getTimestamp = (doc) => {
        if (doc.updatedAt) {
          const t = new Date(doc.updatedAt).getTime()
          if (!isNaN(t) && t > 0) return t
        }
        if (doc.createdAt) {
          const t = new Date(doc.createdAt).getTime()
          if (!isNaN(t) && t > 0) return t
        }
        if (doc.date) {
          const t = Number(doc.date)
          if (!isNaN(t) && t > 0) return t
        }
        return 0
      }
      return getTimestamp(b) - getTimestamp(a)
    })

    res.json({ success: true, appointments })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// API to mark appointment completed for doctor panel
const appointmentComplete = async (req, res) => {
  try {
    const { appointmentId } = req.body
    const appointment = await appointmentModel.findById(appointmentId)

    if (!appointment) {
      return res.json({ success: false, message: 'Appointment not found' })
    }

    if (String(appointment.docId) !== String(req.docId)) {
      return res.json({ success: false, message: 'Unauthorized action' })
    }

    if (appointment.cancelled) {
      return res.json({ success: false, message: 'A cancelled appointment cannot be completed' })
    }

    if (appointment.isCompleted) {
      return res.json({ success: false, message: 'Appointment already completed' })
    }

    await appointmentModel.findByIdAndUpdate(appointmentId, {
      isCompleted: true,
      updatedAt: new Date()
    })
    return res.json({ success: true, message: 'Appointment completed' })
  } catch (error) {
    console.log(error)
    return res.json({ success: false, message: error.message })
  }
}

// API to cancel appointment for doctor panel
const appointmentCancel = async (req, res) => {
  try {
    const { appointmentId } = req.body
    const appointment = await appointmentModel.findById(appointmentId)

    if (!appointment) {
      return res.json({ success: false, message: 'Appointment not found' })
    }

    if (String(appointment.docId) !== String(req.docId)) {
      return res.json({ success: false, message: 'Unauthorized action' })
    }

    if (appointment.cancelled) {
      return res.json({ success: false, message: 'Appointment already cancelled' })
    }

    if (appointment.isCompleted) {
      return res.json({ success: false, message: 'Completed appointments cannot be cancelled' })
    }

    if (appointment.payment === true) {
      return res.json({ success: false, message: 'This appointment is already paid. Refunds are not supported in this demo, so it cannot be cancelled.' })
    }

    await appointmentModel.findByIdAndUpdate(appointmentId, {
      cancelled: true,
      cancelledBy: 'doctor',
      cancelledAt: Date.now(),
      updatedAt: new Date()
    })

    // releasing doctor slot
    const { docId, slotDate, slotTime } = appointment
    const doctorData = await doctorModel.findById(docId)

    if (doctorData) {
      let slots_booked = doctorData.slots_booked || {}
      if (slots_booked[slotDate]) {
        slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime)
        await doctorModel.findByIdAndUpdate(docId, { slots_booked })
      }
    }

    return res.json({ success: true, message: 'Appointment cancelled' })
  } catch (error) {
    console.log(error)
    return res.json({ success: false, message: error.message })
  }
}



// API to get dashboard data for doctor panel
const doctorDashboard = async (req, res) => {
  try {
    const docId = req.docId

    const appointments = await appointmentModel
      .find({ docId })
      .sort({ updatedAt: -1, createdAt: -1, date: -1 })
      .lean()

    // Strict in-memory sort to guarantee newest / recently updated bookings appear at the top
    // matching appointmentsDoctor exactly
    appointments.sort((a, b) => {
      const getTimestamp = (doc) => {
        if (doc.updatedAt) {
          const t = new Date(doc.updatedAt).getTime()
          if (!isNaN(t) && t > 0) return t
        }
        if (doc.createdAt) {
          const t = new Date(doc.createdAt).getTime()
          if (!isNaN(t) && t > 0) return t
        }
        if (doc.date) {
          const t = Number(doc.date)
          if (!isNaN(t) && t > 0) return t
        }
        return 0
      }
      return getTimestamp(b) - getTimestamp(a)
    })

    let earnings = 0
    appointments.forEach((item) => {
      if (!item.cancelled && (item.isCompleted || item.payment)) {
        earnings += item.amount || 0
      }
    })

    const patients = new Set(appointments.map((item) => String(item.userId))).size

    const dashData = {
      earnings,
      appointments: appointments.length,
      patients,
      latestAppointments: appointments.slice(0, 5),
    }

    return res.json({ success: true, dashData })
  } catch (error) {
    console.log(error)
    return res.json({ success: false, message: error.message })
  }
}




export { changeAvailability, doctorList, loginDoctor, appointmentsDoctor, appointmentComplete, appointmentCancel, doctorDashboard }