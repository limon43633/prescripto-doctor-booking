import React, { useContext, useState } from 'react'
import { assets } from '../../assets/assets'
import { AdminContext } from '../../context/AdminContext'
import { toast } from 'react-toastify'
import axios from 'axios'

const AddDoctor = () => {


  const [docImg, setDocImg] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [experience, setExperience] = useState('1 Year')
  const [fees, setFees] = useState('')
  const [about, setAbout] = useState('')
  const [speciality, setSpeciality] = useState('General physician')
  const [degree, setDegree] = useState('')
  const [address1, setAddress1] = useState('')
  const [address2, setAddress2] = useState('')


  const { backendUrl, aToken } = useContext(AdminContext)


  const onSubmitHandler = async (event) => {
    event.preventDefault()

    try {

      if (!docImg) {
        return toast.error('Image not selected')
      }

      const formData = new FormData()

      formData.append('image', docImg)
      formData.append('name', name)
      formData.append('email', email)
      formData.append('password', password)
      formData.append('experience', experience)
      formData.append('fees', Number(fees))
      formData.append('about', about)
      formData.append('speciality', speciality)
      formData.append('degree', degree)
      formData.append('address', JSON.stringify({ line1: address1, line2: address2 }))


      // console log form data
      formData.forEach((value, key) => {
        console.log(`${key} : ${value}`);
      })

      const { data } = await axios.post(backendUrl + '/api/admin/add-doctor', formData, { headers: { aToken } })

      if (data.success) {
        toast.success(data.message)
        setDocImg(false)
        setName('')
        setPassword('')
        setEmail('')
        setAddress1('')
        setAddress2('')
        setDegree('')
        setAbout('')
        setFees('')

      } else {
        toast.error(data.message)
      }

    } catch (error) {
      toast.error(error.message)
      console.log(error)
    }
  }


  const labelClass = 'mb-1 text-sm text-gray-600'
  const inputClass =
    'w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:border-primary'

  return (
    <form onSubmit={onSubmitHandler} className='m-5 w-full'>
      <p className='mb-3 text-lg font-medium'>Add Doctor</p>

      <div className='bg-white px-8 py-8 border border-gray-200 rounded w-full max-w-4xl max-h-[80vh] overflow-y-auto no-scrollbar'>
        {/* img up area portion */}
        <div className='flex items-center gap-4 mb-8 text-gray-500'>
          <label htmlFor='doc-img'>
            <img
              className='w-16 h-16 bg-gray-100 rounded-full cursor-pointer object-cover'
              src={docImg ? URL.createObjectURL(docImg) : assets.upload_area}
              alt=''
            />
          </label>
          <input onChange={(e) => setDocImg(e.target.files[0])} type='file' id='doc-img' hidden />
          <p className='text-sm'>
            Upload doctor <br /> picture
          </p>
        </div>

        <div className='max-w-3xl flex flex-col gap-4 text-gray-600'>
          <div className='flex flex-col lg:flex-row items-start gap-10'>
            {/* left portion */}
            <div className='w-full lg:flex-1 flex flex-col gap-4'>
              <div>
                <p className={labelClass}>Doctor name</p>
                <input onChange={(e) => setName(e.target.value)}
                  value={name} className={inputClass} type='text' placeholder='Name' required />
              </div>

              <div>
                <p className={labelClass}>Doctor Email</p>
                <input onChange={(e) => setEmail(e.target.value)}
                  value={email} className={inputClass} type='email' placeholder='Your email' required />
              </div>

              <div>
                <p className={labelClass}>Doctor Password</p>
                <input onChange={(e) => setPassword(e.target.value)}
                  value={password} className={inputClass} type='password' placeholder='Password' required />
              </div>

              <div>
                <p className={labelClass}>Experience</p>
                <select onChange={(e) => setExperience(e.target.value)}
                  value={experience} className={inputClass} name='experience' id='experience'>
                  <option value='1'>1 Year</option>
                  <option value='2'>2 Year</option>
                  <option value='3'>3 Year</option>
                  <option value='4'>4 Year</option>
                  <option value='5'>5 Year</option>
                  <option value='6'>6 Year</option>
                  <option value='7'>7 Year</option>
                  <option value='8'>8 Year</option>
                  <option value='9'>9 Year</option>
                  <option value='10'>10 Year</option>
                </select>
              </div>

              <div>
                <p className={labelClass}>Fees</p>
                <input onChange={(e) => setFees(e.target.value)}
                  value={fees} className={inputClass} type='number' placeholder='Your fees' required />
              </div>
            </div>

            {/* Right portion */}
            <div className='w-full lg:flex-1 flex flex-col gap-4'>
              <div>
                <p className={labelClass}>Speciality</p>
                <select onChange={(e) => setSpeciality(e.target.value)}
                  value={speciality} className={inputClass} name='speciality' id='speciality'>
                  <option value='General physician'>General physician</option>
                  <option value='Gynecologist'>Gynecologist</option>
                  <option value='Dermatologist'>Dermatologist</option>
                  <option value='Pediatricians'>Pediatricians</option>
                  <option value='Neurologist'>Neurologist</option>
                  <option value='Gastroenterologist'>Gastroenterologist</option>
                </select>
              </div>

              <div>
                <p className={labelClass}>Education</p>
                <input onChange={(e) => setDegree(e.target.value)}
                  value={degree} className={inputClass} type='text' placeholder='Education' required />
              </div>

              <div>
                <p className={labelClass}>Address</p>
                <input onChange={(e) => setAddress1(e.target.value)}
                  value={address1} className={inputClass} type='text' placeholder='Address 1' required />
                <input onChange={(e) => setAddress2(e.target.value)}
                  value={address2} className={`${inputClass} mt-3`} type='text' placeholder='Address 2' required />
              </div>
            </div>
          </div>

          {/* About doctor */}
          <div>
            <p className={labelClass}>About me</p>
            <textarea onChange={(e) => setAbout(e.target.value)}
              value={about}
              className={`${inputClass} resize-none`}
              placeholder='write about yourself'
              rows={5}
              required
            />
          </div>

          <button
            type='submit'
            className='bg-primary hover:opacity-90 transition rounded-full text-white text-sm px-10 py-3 w-fit cursor-pointer'
          >
            Add doctor
          </button>
        </div>
      </div>
    </form>
  )
}

export default AddDoctor