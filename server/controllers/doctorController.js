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
const appointmentsDoctor = async (req, res) => {
  try {
    const appointments = await appointmentModel
      .find({ docId: req.docId })
      .sort({ date: -1 })   // notun booking shobar upore

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

    await appointmentModel.findByIdAndUpdate(appointmentId, { isCompleted: true })
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
      cancelledAt: Date.now()
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

export { changeAvailability, doctorList, loginDoctor, appointmentsDoctor, appointmentComplete, appointmentCancel }