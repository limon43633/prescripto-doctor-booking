import { createContext } from "react";

export const AppContext = createContext()

const AppContextProvider = (props) => {

    const currency = '$'

    const calculateAge = (dob) => {
        if (!dob || typeof dob !== 'string' || dob === 'Not selected') return null
        const parts = dob.trim().split('-')
        let birthDate
        if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
            birthDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
        } else {
            birthDate = new Date(dob)
        }
        if (isNaN(birthDate.getTime())) return null

        const today = new Date()
        let age = today.getFullYear() - birthDate.getFullYear()
        const monthDiff = today.getMonth() - birthDate.getMonth()
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--
        }
        return Number.isFinite(age) && age >= 0 ? age : null
    }

    const slotDateFormat = (slotDate) => {
        try {
            if (!slotDate || typeof slotDate !== 'string') return slotDate || ''
            const dateArray = slotDate.split('_')
            if (dateArray.length !== 3) return slotDate
            const day = dateArray[0]
            const monthIndex = Number(dateArray[1]) - 1
            const year = dateArray[2]
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            if (isNaN(monthIndex) || monthIndex < 0 || monthIndex > 11 || !day || !year) {
                return slotDate
            }
            return `${day} ${months[monthIndex]}, ${year}`
        } catch {
            return slotDate
        }
    }

    const value = {
        calculateAge,
        slotDateFormat,
        currency
    }

    return (
        <AppContext.Provider value={value}>
          {props.children}
        </AppContext.Provider>
    )

}

export default AppContextProvider
