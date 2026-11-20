import React, { useContext, useEffect } from 'react'
import PageHeader from '../../components/ui/PageHeader'
import { DoctorContext } from '../../context/DoctorContext'

const DoctorAppointments = () => {

  const { dToken, appointments, getAppointments } = useContext(DoctorContext)




 useEffect(()=>{
    if (dToken) {
      getAppointments()
    }
 },[dToken])



  return (
    <div>
      <PageHeader
        title='All Appointments'
        subtitle='See all new appointments for the Prescripto platform.'
      />

      <div>

        <div>
          <p>#</p>
          <p>Patient</p>
          <p>Payment</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Fees</p>
          <p>Action</p>
        </div>

      </div>

    </div>
  )
}

export default DoctorAppointments
