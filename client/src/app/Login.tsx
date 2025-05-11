import { FaApple, FaGoogle, FaXTwitter } from 'react-icons/fa6'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { loginApi } from '../api/AuthApi'
import { notify } from '../utils/NotificationService'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const onLogin = async () => {
    try {
      setIsLoading(true)
      const response = await loginApi(email, password)
      const isError = response.isError
      if (isError) {
        notify(response.message, "error")
        setPassword('')
      } else {
        notify('Logged in successfully', "success")
        localStorage.setItem('loggedIn', 'true')
        localStorage.setItem('token', response.token)
      }
      setIsLoading(false)
    } catch (error) {
      console.error(error)
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-[#0f0f0f] h-screen w-screen flex items-center justify-center">
      <div className='bg-[#1a1a1a] flex flex-col items-center justify-between   py-10 px-5 w-lg rounded-xl'>
        {/* App icon */}
        <div className='btn btn-xl btn-square rounded-full mb-8'>
          <img src="/AppIcon.png" alt="" />
        </div>

        {/* Header */}
        <div className='flex flex-col gap-y-2 text-center mb-8'>
          <div className='text-white text-lg font-bold'>Welcome Back</div>
          <div className='flex gap-x-2'>
            <span>Dont have an account yes?</span>
            <Link to={'/signup'}
              className='text-white font-semibold'>Sign up</Link>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={onLogin} className='flex flex-col gap-y-4 w-full mb-6'>
          {/* Email input */}
          <label className="input border-0  bg-[#0e0e0e] w-full rounded-lg  outline-0 focus-within:outline-0">
            <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <g
                strokeLinejoin="round"
                strokeLinecap="round"
                strokeWidth="2.5"
                fill="none"
                stroke="currentColor"
              >
                <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
              </g>
            </svg>
            <input type="email" className="" placeholder="email address"
              onChange={(e) => setEmail(e.target.value)}
              value={email} />
          </label>

          {/* password input */}
          <label className="input border-0  bg-[#0e0e0e] w-full rounded-lg  outline-0 focus-within:outline-0">
            <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <g
                strokeLinejoin="round"
                strokeLinecap="round"
                strokeWidth="2.5"
                fill="none"
                stroke="currentColor"
              >
                <path
                  d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"
                ></path>
                <circle cx="16.5" cy="7.5" r=".5" fill="currentColor"></circle>
              </g>
            </svg>
            <input type="password" className="grow" placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
              value={password} />
          </label>

          {/* Submit button */}
          <button onClick={onLogin} className={`btn bg-blue-600 rounded-lg ${isLoading && 'bg-blue-700'}`}
            disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Sign In'}
          </button>

        </form>

        {/* Diver */}
        <div className="divider ">OR</div>

        {/* Other sign in methods */}
        <div className='flex mt-4 gap-x-4'>
          <div className='btn'>
            <FaApple />
          </div>
          <div className='btn'>
            <FaGoogle />
          </div>
          <div className='btn'>
            <FaXTwitter />
          </div>
        </div>
      </div>
    </div>
  )
}