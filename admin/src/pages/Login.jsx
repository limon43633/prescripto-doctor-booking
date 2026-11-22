import { useContext, useState } from 'react'
import { assets } from '../assets/assets'
import { AdminContext } from '../context/AdminContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { IconEye, IconEyeOff } from '../components/ui/Icons'
import { DoctorContext } from '../context/DoctorContext'

const Login = () => {
  const [state, setState] = useState('Admin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const { setAToken, backendUrl } = useContext(AdminContext)

  const {setDToken} = useContext(DoctorContext)

  const onSubmitHandler = async (event) => {
    event.preventDefault()

    try {
      if (state === 'Admin') {

        const { data } = await axios.post(backendUrl + '/api/admin/login', { email, password })
        if (data.success) {
          localStorage.setItem('aToken', data.token)
          setAToken(data.token)
        } else {
          toast.error(data.message)
        }

      } else {
        // Doctor login placeholder maintained per original logic

        const {data} = await axios.post(backendUrl + '/api/doctor/login', {email, password})
        if (data.success) {
          localStorage.setItem('dToken', data.token)
          setDToken(data.token)
          console.log(data.token);

        } else {
          toast.error(data.message)
        }

      }
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className="min-h-screen min-h-dvh flex flex-col items-center justify-center p-4 sm:p-6 bg-[#F4F6FB] text-[#101828]">
      <div className="w-full max-w-md">
        {/* Brand logo header */}
        <div className="flex flex-col items-center mb-8">
          <img
            src={assets.admin_logo}
            alt="Prescripto"
            className="h-9 sm:h-10 w-auto object-contain cursor-default"
          />
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-[20px] border border-[#EAECF0] shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-8px_rgba(16,24,40,0.06)] p-7 sm:p-10">
          <div className="mb-8 text-center">
            <h1 className="text-2xl sm:text-[30px] sm:leading-[38px] font-semibold tracking-[-0.02em] text-[#101828]">
              Welcome back
            </h1>
            <p className="text-[15px] leading-6 text-[#667085] mt-1.5">
              Sign in as <span className="font-medium text-[#101828]">{state}</span> to access your dashboard
            </p>
          </div>

          <form onSubmit={onSubmitHandler} className="space-y-5">
            <div>
              <label className="block text-[14px] font-medium text-[#344054] mb-1.5">
                Email address
              </label>
              <input
                type="email"
                placeholder="admin@prescripto.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-11 px-3.5 rounded-[12px] border border-[#D0D5DD] bg-white text-[15px] text-[#101828] placeholder-[#98A2B3] focus:outline-none focus:border-[#5F6FFF] focus:ring-4 focus:ring-[#5F6FFF]/15 transition-all"
              />
            </div>

            <div>
              <label className="block text-[14px] font-medium text-[#344054] mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full h-11 pl-3.5 pr-11 rounded-[12px] border border-[#D0D5DD] bg-white text-[15px] text-[#101828] placeholder-[#98A2B3] focus:outline-none focus:border-[#5F6FFF] focus:ring-4 focus:ring-[#5F6FFF]/15 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#667085] hover:text-[#101828] cursor-pointer focus:outline-none"
                >
                  {showPassword ? (
                    <IconEyeOff className="w-5 h-5" />
                  ) : (
                    <IconEye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-11 rounded-[12px] bg-[#5F6FFF] hover:bg-[#4F5EEB] text-white text-[15px] font-medium transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center mt-2 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#5F6FFF]/20"
            >
              Sign in as {state}
            </button>
          </form>

          {/* Toggle Role */}
          <div className="mt-8 pt-6 border-t border-[#F2F4F7] text-center text-[14px] text-[#667085]">
            {state === 'Admin' ? (
              <p>
                Doctor Login?{' '}
                <button
                  type="button"
                  onClick={() => setState('Doctor')}
                  className="text-[#5F6FFF] font-medium hover:underline cursor-pointer focus:outline-none"
                >
                  Click here
                </button>
              </p>
            ) : (
              <p>
                Admin Login?{' '}
                <button
                  type="button"
                  onClick={() => setState('Admin')}
                  className="text-[#5F6FFF] font-medium hover:underline cursor-pointer focus:outline-none"
                >
                  Click here
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
