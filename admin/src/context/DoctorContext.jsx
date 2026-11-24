import { createContext, useState } from "react";
import axios from 'axios'
import { toast } from 'react-toastify'

export const DoctorContext = createContext()

const DoctorContextProvider = (props) => {

    const backendUrl = import.meta.env.VITE_BACKEND_URL

    const [appointments, setAppointments] = useState([])

    const [dashData, setDashData] = useState(false)

    const [profileData, setProfileData] = useState(false)


    const getAppointments = async () => {
        try {

            const { data } = await axios.get(backendUrl + '/api/doctor/appointments', { headers: { dToken } })

            if (data.success) {
                setAppointments(data.appointments)
                return true
            } else {
                toast.error(data.message)
                return false
            }

        } catch (error) {
            console.log(error);
            toast.error(error.message)
            return false
        }
    }

    const completeAppointment = async (appointmentId) => {
        try {
            const { data } = await axios.post(
                backendUrl + '/api/doctor/complete-appointment',
                { appointmentId },
                { headers: { dToken } }
            )

            if (data.success) {
                toast.success(data.message)
                setAppointments(prev =>
                    prev.map(item =>
                        item._id === appointmentId
                            ? { ...item, isCompleted: true, updatedAt: new Date().toISOString() }
                            : item
                    )
                )
                await getAppointments()
                return true
            } else {
                toast.error(data.message)
                return false
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
            return false
        }
    }

    const cancelAppointment = async (appointmentId) => {
        try {
            const { data } = await axios.post(
                backendUrl + '/api/doctor/cancel-appointment',
                { appointmentId },
                { headers: { dToken } }
            )

            if (data.success) {
                toast.success(data.message)
                setAppointments(prev =>
                    prev.map(item =>
                        item._id === appointmentId
                            ? {
                                ...item,
                                cancelled: true,
                                cancelledBy: 'doctor',
                                cancelledAt: Date.now(),
                                updatedAt: new Date().toISOString()
                            }
                            : item
                    )
                )
                await getAppointments()
                return true
            } else {
                toast.error(data.message)
                return false
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
            return false
        }
    }

    const [dToken, setDToken] = useState(localStorage.getItem('dToken') ? localStorage.getItem('dToken') : '')





    const getDashData = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/doctor/dashboard', { headers: { dToken } })

            if (data.success) {
                setDashData(data.dashData)
                return true
            } else {
                toast.error(data.message)
                return false
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
            return false
        }
    }




    const getProfileData = async () => {
        try {

            const {data} = await axios.get(backendUrl + '/api/doctor/profile',{headers:{dToken}})

            if (data.success) {
                setProfileData(data.profileData)
                return true
            } else {
                toast.error(data.message)
                return false
            }

        } catch (error) {
            console.log(error)
            toast.error(error.message)
            return false
        }
    }

    const updateProfile = async (update) => {
        try {

            const {data} = await axios.post(backendUrl + '/api/doctor/update-profile', update, {headers:{dToken}})

            if (data.success) {
                toast.success(data.message)
                return true
            } else {
                toast.error(data.message)
                return false
            }

        } catch (error) {
            console.log(error)
            toast.error(error.message)
            return false
        }
    }




    const value = {
        dToken, setDToken,
        backendUrl,
        appointments, setAppointments,
        getAppointments,
        completeAppointment,
        cancelAppointment,
        dashData, setDashData, getDashData,
        profileData, setProfileData,
        getProfileData,
        updateProfile,
    }

    return (
        <DoctorContext.Provider value={value}>
            {props.children}
        </DoctorContext.Provider>
    )

}

export default DoctorContextProvider