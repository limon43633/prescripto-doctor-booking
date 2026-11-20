import 'dotenv/config'
import mongoose from 'mongoose'
import connectDB from '../config/mongodb.js'
import doctorModel from '../models/doctorModel.js'
import appointmentModel from '../models/appointmentModel.js'

async function rebuildSlots() {
  const isApply = process.argv.includes('--apply')

  try {
    await connectDB()

    const dbHost = mongoose.connection.host || 'unknown'
    const dbName = mongoose.connection.name || 'unknown'

    console.log('====================================================')
    console.log(`Rebuild Doctor Booked Slots (${isApply ? 'APPLY MODE' : 'DRY RUN MODE'})`)
    console.log(`Database Host: ${dbHost}`)
    console.log(`Database Name: ${dbName}`)
    console.log('====================================================\n')

    // 1. Fetch active appointments (cancelled: false) and all doctors
    const [activeAppointments, allDoctors] = await Promise.all([
      appointmentModel.find({ cancelled: false }).lean(),
      doctorModel.find({}).lean()
    ])

    console.log(`Scanned ${allDoctors.length} doctors.`)
    console.log(`Scanned ${activeAppointments.length} active (non-cancelled) appointments.\n`)

    const doctorMap = new Map()
    for (const doc of allDoctors) {
      doctorMap.set(String(doc._id), doc)
    }

    // 2. Build expected map: { [docId]: { [slotDate]: [slotTime, ...] } }
    const expectedMap = {}
    const seenSlots = new Map() // key: `${docId}_${slotDate}_${slotTime}` -> appointmentId
    const warnings = []

    for (const appt of activeAppointments) {
      const docIdStr = String(appt.docId)
      if (!doctorMap.has(docIdStr)) {
        warnings.push(`[WARN] Active appointment ${appt._id} references unknown doctor ID: ${docIdStr}. Skipping.`)
        continue
      }

      const { slotDate, slotTime } = appt
      if (!slotDate || !slotTime) {
        warnings.push(`[WARN] Active appointment ${appt._id} has missing slotDate or slotTime. Skipping.`)
        continue
      }

      const slotKey = `${docIdStr}_${slotDate}_${slotTime}`
      if (seenSlots.has(slotKey)) {
        const existingApptId = seenSlots.get(slotKey)
        warnings.push(
          `[WARN] Duplicate active appointments for doctor ${docIdStr} on ${slotDate} at ${slotTime}: ` +
          `keeping appointment ${existingApptId}, duplicate appointment ${appt._id}`
        )
        continue
      }

      seenSlots.set(slotKey, appt._id)

      if (!expectedMap[docIdStr]) {
        expectedMap[docIdStr] = {}
      }
      if (!expectedMap[docIdStr][slotDate]) {
        expectedMap[docIdStr][slotDate] = []
      }
      expectedMap[docIdStr][slotDate].push(slotTime)
    }

    if (warnings.length > 0) {
      console.log('Warnings:')
      warnings.forEach(w => console.log(`  ${w}`))
      console.log('')
    }

    // 3. Compare stored slots_booked with expectedMap for each doctor
    const changedDoctors = []
    let totalRemoved = 0
    let totalAdded = 0

    for (const doctor of allDoctors) {
      const docIdStr = String(doctor._id)
      const stored = (doctor.slots_booked && typeof doctor.slots_booked === 'object')
        ? doctor.slots_booked
        : {}

      // Clean expected: deduplicate times and remove empty dates; doctor with no bookings gets {}
      const rawExpected = expectedMap[docIdStr] || {}
      const cleanExpected = {}
      for (const [date, times] of Object.entries(rawExpected)) {
        const uniqueTimes = Array.from(new Set(times))
        if (uniqueTimes.length > 0) {
          cleanExpected[date] = uniqueTimes
        }
      }

      const removedEntries = []
      const addedEntries = []

      // Check stored entries against expected
      for (const [date, storedTimes] of Object.entries(stored)) {
        const expTimes = cleanExpected[date] || []
        const timesArray = Array.isArray(storedTimes) ? storedTimes : []
        for (const time of timesArray) {
          if (!expTimes.includes(time)) {
            removedEntries.push(`${date} ${time}`)
          }
        }
      }

      // Check expected entries against stored
      for (const [date, expTimes] of Object.entries(cleanExpected)) {
        const storedTimes = Array.isArray(stored[date]) ? stored[date] : []
        for (const time of expTimes) {
          if (!storedTimes.includes(time)) {
            addedEntries.push(`${date} ${time}`)
          }
        }
      }

      // Check if objects differ in structure (e.g. empty dates in stored)
      const storedKeys = Object.keys(stored)
      const expectedKeys = Object.keys(cleanExpected)
      const hasStructuralDiff = storedKeys.some(k => !cleanExpected[k]) ||
        expectedKeys.some(k => !stored[k]) ||
        storedKeys.some(k => {
          const sArr = Array.isArray(stored[k]) ? stored[k] : []
          const eArr = cleanExpected[k] || []
          return sArr.length !== eArr.length || sArr.some((t, i) => t !== eArr[i])
        })

      if (removedEntries.length > 0 || addedEntries.length > 0 || hasStructuralDiff) {
        changedDoctors.push({
          doctor,
          removedEntries,
          addedEntries,
          expected: cleanExpected
        })
        totalRemoved += removedEntries.length
        totalAdded += addedEntries.length
      }
    }

    // 4. Report
    console.log(`Changes detected: ${changedDoctors.length} doctor(s) require update.\n`)

    for (const { doctor, removedEntries, addedEntries } of changedDoctors) {
      console.log(`Doctor: ${doctor.name} (ID: ${doctor._id})`)
      if (removedEntries.length === 0 && addedEntries.length === 0) {
        console.log('  Cleaned empty date keys from slots_booked.')
      } else {
        removedEntries.forEach(entry => console.log(`  - REMOVE (stale): ${entry}`))
        addedEntries.forEach(entry => console.log(`  + ADD (missing):  ${entry}`))
      }
      console.log('')
    }

    console.log('----------------------------------------------------')
    console.log('Totals:')
    console.log(`  Doctors changed:  ${changedDoctors.length}`)
    console.log(`  Entries removed:  ${totalRemoved}`)
    console.log(`  Entries added:    ${totalAdded}`)
    console.log('----------------------------------------------------')

    // 5. Apply mode writes if requested
    if (isApply) {
      if (changedDoctors.length > 0) {
        console.log(`\nApplying updates to ${changedDoctors.length} doctor(s)...`)
        for (const { doctor, expected } of changedDoctors) {
          await doctorModel.findByIdAndUpdate(doctor._id, { slots_booked: expected })
        }
        console.log('APPLY complete. All slots_booked records updated successfully.')
      } else {
        console.log('\nAPPLY complete. 0 doctors updated.')
      }
    } else {
      console.log('\nDRY RUN complete. No changes were written to the database.')
      console.log('To apply these changes, re-run with: node scripts/rebuildSlots.js --apply')
    }

    await mongoose.disconnect()
    console.log('\nDisconnected from database.')
    process.exit(0)
  } catch (error) {
    console.error('Fatal error in rebuildSlots:', error)
    try {
      await mongoose.disconnect()
    } catch {}
    process.exit(1)
  }
}

rebuildSlots()
