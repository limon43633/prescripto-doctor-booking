import React, { useContext, useState } from 'react'
import { Mail, Phone, MapPin, Calendar, User, Pencil, Check, CameraIcon } from 'lucide-react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { AppContext } from '../context/AppContext'


const MyProfile = () => {

  const { userData, setUserData, token, backendUrl, loadUserProfileData } = useContext(AppContext)


  const [isEdit, setIsEdit] = useState(false)
  const [image, setImage] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const updateUserProfileData = async () => {
    try {
      setIsSaving(true)

      const formData = new FormData()
      formData.append('name', userData.name)
      formData.append('phone', userData.phone)
      formData.append('address', JSON.stringify(userData.address))
      formData.append('gender', userData.gender)
      formData.append('dob', userData.dob)

      // notun image select kora thakle tokhon-i pathabe
      if (image) {
        formData.append('image', image)
      }

      const { data } = await axios.post(
        backendUrl + '/api/user/update-profile',
        formData,
        { headers: { token } }
      )

      if (data.success) {
        toast.success(data.message)
        await loadUserProfileData()   // database theke notun data abar load
        setIsEdit(false)
        setImage(false)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImage(file)   // asol file state e rakho, preview niche src e hocche
    }
  }



  return userData && (
    <div className='max-w-3xl mx-auto px-4 py-16'>

      {/* Profile header card */}
      <div className='bg-white border border-gray-300 rounded-2xl p-6 md:p-8 flex flex-col sm:flex-row items-center gap-6'>
        <div className='relative shrink-0'>
          <img
            src={image ? URL.createObjectURL(image) : userData.image}
            alt={userData.name}
            className='w-28 h-28 rounded-full object-cover border-4 border-primary/10'
          />

          {/* Image upload button - only visible in edit mode */}
          {isEdit && (
            <label className='absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full cursor-pointer shadow-md hover:bg-primary/90 transition'>
              <CameraIcon size={18} />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          )}
        </div>

        <div className='flex-1 flex flex-col items-center sm:items-start gap-1 text-center sm:text-left'>
          {isEdit ? (
            <input
              type='text'
              value={userData.name}
              onChange={e => setUserData(prev => ({ ...prev, name: e.target.value }))}
              className='text-xl font-semibold text-gray-800 border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-primary transition-colors duration-300'
            />
          ) : (
            <h1 className='text-2xl font-semibold text-gray-800'>{userData.name}</h1>
          )}
          <p className='text-sm text-gray-500'>{userData.email}</p>
        </div>

        <button
          onClick={() => (isEdit ? updateUserProfileData() : setIsEdit(true))}
          disabled={isSaving}
          className='flex items-center gap-2 border border-gray-300 hover:border-primary text-sm text-gray-600 hover:text-primary px-4 py-2 rounded-lg transition-colors duration-300 shrink-0 disabled:opacity-60 disabled:cursor-not-allowed'
        >
          {isEdit ? <Check size={15} /> : <Pencil size={15} />}
          {isEdit ? (isSaving ? 'Saving...' : 'Save') : 'Edit'}
        </button>
      </div>

      {/* Contact information */}
      <div className='bg-white border border-gray-300 rounded-2xl p-6 md:p-8 mt-6'>
        <p className='text-xs font-semibold text-gray-400 tracking-wide mb-5'>CONTACT INFORMATION</p>

        <div className='flex flex-col gap-5'>
          <div className='flex items-start gap-3'>
            <div className='w-9 h-9 shrink-0 flex items-center justify-center rounded-full bg-primary/10 text-primary'>
              <Mail size={16} strokeWidth={1.8} />
            </div>
            <div>
              <p className='text-xs text-gray-400 mb-0.5'>Email address</p>
              <p className='text-sm text-gray-700'>{userData.email}</p>
            </div>
          </div>

          <div className='flex items-start gap-3'>
            <div className='w-9 h-9 shrink-0 flex items-center justify-center rounded-full bg-primary/10 text-primary'>
              <Phone size={16} strokeWidth={1.8} />
            </div>
            <div className='flex-1'>
              <p className='text-xs text-gray-400 mb-0.5'>Phone number</p>
              {isEdit ? (
                <input
                  type='text'
                  value={userData.phone}
                  onChange={e => setUserData(prev => ({ ...prev, phone: e.target.value }))}
                  className='w-full text-sm text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-primary transition-colors duration-300'
                />
              ) : (
                <p className='text-sm text-gray-700'>{userData.phone}</p>
              )}
            </div>
          </div>

          <div className='flex items-start gap-3'>
            <div className='w-9 h-9 shrink-0 flex items-center justify-center rounded-full bg-primary/10 text-primary'>
              <MapPin size={16} strokeWidth={1.8} />
            </div>
            <div className='flex-1'>
              <p className='text-xs text-gray-400 mb-0.5'>Address</p>
              {isEdit ? (
                <div className='flex flex-col gap-2'>
                  <input
                    type='text'
                    value={userData.address.line1}
                    onChange={e => setUserData(prev => ({ ...prev, address: { ...prev.address, line1: e.target.value } }))}
                    className='w-full text-sm text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-primary transition-colors duration-300'
                  />
                  <input
                    type='text'
                    value={userData.address.line2}
                    onChange={e => setUserData(prev => ({ ...prev, address: { ...prev.address, line2: e.target.value } }))}
                    className='w-full text-sm text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-primary transition-colors duration-300'
                  />
                </div>
              ) : (
                <p className='text-sm text-gray-700 leading-relaxed'>
                  {userData.address.line1}<br />{userData.address.line2}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Basic information */}
      <div className='bg-white border border-gray-300 rounded-2xl p-6 md:p-8 mt-6'>
        <p className='text-xs font-semibold text-gray-400 tracking-wide mb-5'>BASIC INFORMATION</p>

        <div className='flex flex-col gap-5'>
          <div className='flex items-start gap-3'>
            <div className='w-9 h-9 shrink-0 flex items-center justify-center rounded-full bg-primary/10 text-primary'>
              <User size={16} strokeWidth={1.8} />
            </div>
            <div className='flex-1'>
              <p className='text-xs text-gray-400 mb-0.5'>Gender</p>
              {isEdit ? (
                <select
                  value={userData.gender}
                  onChange={e => setUserData(prev => ({ ...prev, gender: e.target.value }))}
                  className='w-full sm:w-48 text-sm text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-primary transition-colors duration-300'
                >
                  <option value='Not selected'>Not selected</option>
                  <option value='Male'>Male</option>
                  <option value='Female'>Female</option>
                </select>
              ) : (
                <p className='text-sm text-gray-700'>{userData.gender}</p>
              )}
            </div>
          </div>

          <div className='flex items-start gap-3'>
            <div className='w-9 h-9 shrink-0 flex items-center justify-center rounded-full bg-primary/10 text-primary'>
              <Calendar size={16} strokeWidth={1.8} />
            </div>
            <div className='flex-1'>
              <p className='text-xs text-gray-400 mb-0.5'>Date of birth</p>
              {isEdit ? (
                <input
                  type='date'
                  value={userData.dob === 'Not selected' ? '' : userData.dob}
                  onChange={e => setUserData(prev => ({ ...prev, dob: e.target.value }))}
                  className='w-full sm:w-48 text-sm text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-primary transition-colors duration-300'
                />
              ) : (
                <p className='text-sm text-gray-700'>{userData.dob}</p>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}

export default MyProfile