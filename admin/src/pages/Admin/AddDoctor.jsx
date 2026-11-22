import { useContext, useMemo, useState } from 'react'
import { assets } from '../../assets/assets'
import { AdminContext } from '../../context/AdminContext'
import { toast } from 'react-toastify'
import axios from 'axios'
import PageHeader from '../../components/ui/PageHeader'
import { IconChevronDown } from '../../components/ui/Icons'

const specialities = [
  'General physician',
  'Gynecologist',
  'Dermatologist',
  'Pediatricians',
  'Neurologist',
  'Gastroenterologist',
]

const experiences = Array.from({ length: 10 }, (_, i) => i + 1)

const labelClass = 'mb-1.5 block text-sm font-medium text-gray-700'
const inputClass =
  'h-11 w-full rounded-xl border border-gray-300 bg-white px-3.5 text-[15px] text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15'

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
  const [submitting, setSubmitting] = useState(false)

  const { backendUrl, aToken } = useContext(AdminContext)

  // preview URL sudhu image change hole toiri hoy (prottek keystroke e na)
  const preview = useMemo(
    () => (docImg ? URL.createObjectURL(docImg) : assets.upload_area),
    [docImg]
  )

  const onSubmitHandler = async (event) => {
    event.preventDefault()

    try {

      if (!docImg) {
        return toast.error('Image not selected')
      }

      setSubmitting(true)

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
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className='space-y-8'>
      <PageHeader
        title='Add doctor'
        subtitle='Create a new doctor profile for the Prescripto platform.'
      />

      <form
        onSubmit={onSubmitHandler}
        className='max-w-4xl rounded-2xl bg-white p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-8px_rgba(16,24,40,0.06)] ring-1 ring-black/[0.03] sm:p-8'
      >

        {/* Photo upload */}
        <input
          onChange={(e) => setDocImg(e.target.files[0])}
          type='file'
          id='doc-img'
          accept='image/*'
          className='peer sr-only'
        />
        <label
          htmlFor='doc-img'
          className='flex w-fit cursor-pointer items-center gap-5 rounded-2xl peer-focus-visible:ring-4 peer-focus-visible:ring-primary/20'
        >
          <img
            className='h-20 w-20 shrink-0 rounded-full bg-gray-100 object-cover ring-1 ring-gray-200'
            src={preview}
            alt=''
          />
          <span className='min-w-0'>
            <span className='inline-flex h-10 items-center rounded-xl border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 transition hover:bg-gray-50'>
              {docImg ? 'Change photo' : 'Upload photo'}
            </span>
            <span className='mt-2 block truncate text-sm text-gray-500'>
              {docImg ? docImg.name : 'JPG, PNG or WEBP'}
            </span>
          </span>
        </label>

        <div className='my-8 border-t border-gray-100' />

        {/* Fields */}
        <div className='grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2'>

          <div>
            <label htmlFor='doc-name' className={labelClass}>Doctor name</label>
            <input
              id='doc-name'
              onChange={(e) => setName(e.target.value)}
              value={name}
              className={inputClass}
              type='text'
              placeholder='Dr. John Smith'
              autoComplete='off'
              required
            />
          </div>

          <div>
            <label htmlFor='doc-email' className={labelClass}>Email</label>
            <input
              id='doc-email'
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              className={inputClass}
              type='email'
              placeholder='doctor@prescripto.com'
              autoComplete='off'
              required
            />
          </div>

          <div>
            <label htmlFor='doc-password' className={labelClass}>Password</label>
            <input
              id='doc-password'
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              className={inputClass}
              type='password'
              placeholder='Minimum 8 characters'
              autoComplete='new-password'
              required
            />
          </div>

          <div>
            <label htmlFor='doc-fees' className={labelClass}>Consultation fee ($)</label>
            <input
              id='doc-fees'
              onChange={(e) => setFees(e.target.value)}
              value={fees}
              className={inputClass}
              type='number'
              min='0'
              placeholder='50'
              required
            />
          </div>

          <div>
            <label htmlFor='speciality' className={labelClass}>Speciality</label>
            <div className='relative'>
              <select
                id='speciality'
                onChange={(e) => setSpeciality(e.target.value)}
                value={speciality}
                className={`${inputClass} cursor-pointer appearance-none pr-10`}
              >
                {specialities.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
              <IconChevronDown className='pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500' />
            </div>
          </div>

          <div>
            <label htmlFor='experience' className={labelClass}>Experience</label>
            <div className='relative'>
              <select
                id='experience'
                onChange={(e) => setExperience(e.target.value)}
                value={experience}
                className={`${inputClass} cursor-pointer appearance-none pr-10`}
              >
                {experiences.map((n) => (
                  <option key={n} value={`${n} Year`}>
                    {n} {n === 1 ? 'Year' : 'Years'}
                  </option>
                ))}
              </select>
              <IconChevronDown className='pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500' />
            </div>
          </div>

          <div className='md:col-span-2'>
            <label htmlFor='doc-degree' className={labelClass}>Education</label>
            <input
              id='doc-degree'
              onChange={(e) => setDegree(e.target.value)}
              value={degree}
              className={inputClass}
              type='text'
              placeholder='MBBS, MD - Cardiology'
              required
            />
          </div>

          <div>
            <label htmlFor='doc-address1' className={labelClass}>Address line 1</label>
            <input
              id='doc-address1'
              onChange={(e) => setAddress1(e.target.value)}
              value={address1}
              className={inputClass}
              type='text'
              placeholder='Street, building'
              required
            />
          </div>

          <div>
            <label htmlFor='doc-address2' className={labelClass}>Address line 2</label>
            <input
              id='doc-address2'
              onChange={(e) => setAddress2(e.target.value)}
              value={address2}
              className={inputClass}
              type='text'
              placeholder='City, area'
              required
            />
          </div>

          <div className='md:col-span-2'>
            <label htmlFor='doc-about' className={labelClass}>About</label>
            <textarea
              id='doc-about'
              onChange={(e) => setAbout(e.target.value)}
              value={about}
              className='min-h-32 w-full resize-y rounded-xl border border-gray-300 bg-white px-3.5 py-3 text-[15px] leading-relaxed text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15'
              placeholder='Short professional summary of the doctor'
              rows={5}
              required
            />
          </div>

        </div>

        {/* Footer */}
        <div className='mt-8 flex border-t border-gray-100 pt-6 sm:justify-end'>
          <button
            type='submit'
            disabled={submitting}
            className='h-11 w-full cursor-pointer rounded-xl bg-primary px-8 text-[15px] font-medium text-white transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto'
          >
            {submitting ? 'Adding...' : 'Add doctor'}
          </button>
        </div>

      </form>
    </div>
  )
}

export default AddDoctor