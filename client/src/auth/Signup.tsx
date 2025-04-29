import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
import { ClipLoader } from 'react-spinners'
import axios from 'axios'
import { FormDataSignUp } from '../interfaces/interfaces'

export default function SignUp({ serverUrl }: { serverUrl: string }) {
    const [formData, setFormData] = useState<FormDataSignUp>({
        names: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        // image: '',
    })
    const navigate = useNavigate()
    const [isPasswordMatch, setIsPasswordMatch] = useState<boolean>(true)
    const [confirmPasswordError, setConfirmPasswordError] = useState<string>('')
    const [emailError, setEmailError] = useState<string>('')
    const [successMessage, setSuccessMessage] = useState<string>('')
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [isFormReadyToSubmit, setIsFormReadyToSubmit] = useState<boolean>(false)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [theme, setTheme] = useState<'dark' | 'light'>('dark')

    const fileInputRef = useRef<HTMLInputElement | null>(null)

    useEffect(() => {
        const validatePasswordMatch = () => {
            const match = formData.password === formData.confirmPassword
            setIsPasswordMatch(match)
            setConfirmPasswordError(match || !formData.confirmPassword ? '' : 'Passwords do not match')
        }
        validatePasswordMatch()
    }, [formData.password, formData.confirmPassword])

    useEffect(() => {
        setIsFormReadyToSubmit(
            formData.names !== '' &&
            formData.username !== '' &&
            formData.email !== '' &&
            formData.password !== '' &&
            formData.confirmPassword !== '' &&
            isPasswordMatch
        )
    }, [formData, isPasswordMatch])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, files } = e.target
        if (type === 'file' && files) {
            const file = files[0]
            if (file && file.type.startsWith('image/')) {

                setFormData((prevData) => ({ ...prevData, image: file.name }))
                setImagePreview(URL.createObjectURL(file))
            } else {
                setEmailError('Please upload a valid image file')
            }
        } else {
            setFormData((prevData) => ({ ...prevData, [name]: value }))
        }
        setEmailError('')
        setSuccessMessage('')
    }

    const handleImageUploadClick = () => fileInputRef.current?.click()

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark')
    }

    const dismissMessage = () => {
        setEmailError('')
        setSuccessMessage('')
    }

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!isFormReadyToSubmit) return

        setIsLoading(true)
        try {
            const response = await axios.post(`${serverUrl}/signUp`, formData, {
                headers: { 'Content-Type': 'application/json' },
            })

            if (response.status === 200) {
                setSuccessMessage('An activation link has been sent to your email. Please check your inbox.')
                setFormData({ names: '', username: '', email: '', password: '', confirmPassword: '' })
                setImagePreview(null)
                if (fileInputRef.current) fileInputRef.current.value = ''
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (!error.response) {
                    navigate('/no-internet')
                    return
                }
                if (error.response.status === 400) {
                    const emailAlreadyExists = error.response.data.message === 'User exist'
                    if (emailAlreadyExists) {
                        setEmailError('This email is already registered')
                    } else {
                        setEmailError(error.response.data.message)
                    }
                } else {
                    setEmailError('An error occurred. Please try again.')
                }
            } else {
                console.error(error)
                setEmailError('An unexpected error occurred.')
            }
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            <style>
                {`
          .input-container {
            position: relative
            margin-bottom: 1.5rem
          }
          .input-label {
            position: absolute
            top: 0.75rem
            left: 1rem
            font-size: 1rem
            color: ${theme === 'dark' ? '#94a3b8' : '#4b5563'}
            transition: all 0.2s ease
            pointer-events: none
          }
          .input:focus + .input-label,
          .input:not(:placeholder-shown) + .input-label {
            top: -0.75rem
            left: 0.75rem
            font-size: 0.75rem
            color: ${theme === 'dark' ? '#60a5fa' : '#2563eb'}
            background: ${theme === 'dark' ? '#1e293b' : '#f3f4f6'}
            padding: 0 0.25rem
          }
          .validator-hint {
            display: none
            color: #f87171
            font-size: 0.875rem
            margin-top: 0.25rem
          }
          .input:invalid:focus ~ .validator-hint {
            display: block
          }
          .alert {
            animation: fadeIn 0.3s ease-in
            position: relative
          }
          @keyframes fadeIn {
            from { opacity: 0 transform: translateY(-10px) }
            to { opacity: 1 transform: translateY(0) }
          }
          .btn-gradient {
            background: linear-gradient(90deg, #3b82f6, #8b5cf6)
            transition: transform 0.2s ease, background 0.3s ease, box-shadow 0.3s ease
          }
          .btn-gradient:hover:not(:disabled) {
            transform: scale(1.05)
            background: linear-gradient(90deg, #2563eb, #7c3aed)
            box-shadow: 0 4px 14px rgba(59, 130, 246, 0.5)
          }
          .btn-gradient:active:not(:disabled) {
            transform: scale(0.95)
          }
          .theme-toggle {
            transition: transform 0.3s ease
          }
          .theme-toggle:hover {
            transform: rotate(360deg)
          }
          .image-container {
            transition: transform 0.2s ease, box-shadow 0.2s ease
          }
          .image-container:hover {
            transform: scale(1.1)
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3)
          }
          .dismiss-btn {
            transition: color 0.2s ease
          }
          .dismiss-btn:hover {
            color: #ef4444
          }
        `}
            </style>
            <div
                className={`flex items-center justify-center min-h-screen ${theme === 'dark' ? 'bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900' : 'bg-gradient-to-br from-gray-100 via-blue-50 to-gray-100'
                    } py-10 transition-colors duration-300`}
            >
                <form
                    className={`w-full max-w-md px-8 py-10 ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'
                        } sm:rounded-2xl shadow-2xl space-y-6 sm:max-w-sm md:max-w-md overflow-auto`}
                    onSubmit={handleFormSubmit}
                    noValidate
                >
                    <div className="flex justify-between items-center">
                        <h2 className={`text-3xl font-bold text-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Create Account</h2>
                        <button
                            onClick={toggleTheme}
                            className="theme-toggle p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                        >
                            {theme === 'dark' ? (
                                <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            ) : (
                                <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                </svg>
                            )}
                        </button>
                    </div>

                    {(emailError || successMessage) && (
                        <div
                            className={`alert ${successMessage ? 'bg-gradient-to-r from-green-600 to-green-800' : 'bg-gradient-to-r from-red-600 to-red-800'
                                } text-white text-center p-3 rounded-lg flex justify-between items-center`}
                        >
                            <span>{successMessage || emailError}</span>
                            <button
                                onClick={dismissMessage}
                                className="dismiss-btn text-white hover:text-red-400 focus:outline-none"
                                aria-label="Dismiss message"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    )}

                    <div className="flex justify-center">
                        <div
                            onClick={handleImageUploadClick}
                            className="image-container cursor-pointer w-32 h-32 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden"
                            aria-label="Upload profile image"
                        >
                            {imagePreview ? (
                                <img src={imagePreview} alt="Profile Preview" className="w-full h-full object-cover" />
                            ) : (
                                <span className={`text-5xl font-extrabold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    {formData.names.slice(0, 1).toUpperCase() || 'U'}
                                </span>
                            )}
                        </div>
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        name="image"
                        accept="image/*"
                        className="hidden"
                        onChange={handleInputChange}
                    />

                    <div className="input-container">
                        <input
                            name="names"
                            type="text"
                            className={`input w-full p-3 rounded-lg ${theme === 'dark' ? 'bg-slate-700 text-white border-slate-600' : 'bg-gray-100 text-gray-900 border-gray-300'
                                } border focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all`}
                            required
                            value={formData.names}
                            placeholder=" "
                            onChange={handleInputChange}
                            minLength={5}
                            maxLength={30}
                            aria-label="Full name"
                        />
                        <label className="input-label">Full Name</label>
                        <div className="validator-hint">Must be 5 to 30 characters</div>
                    </div>

                    <div className="input-container">
                        <input
                            name="username"
                            type="text"
                            className={`input w-full p-3 rounded-lg ${theme === 'dark' ? 'bg-slate-700 text-white border-slate-600' : 'bg-gray-100 text-gray-900 border-gray-300'
                                } border focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all`}
                            required
                            value={formData.username}
                            placeholder=" "
                            onChange={handleInputChange}
                            minLength={3}
                            maxLength={6}
                            aria-label="Username"
                        />
                        <label className="input-label">Username</label>
                        <div className="validator-hint">Must be 3 to 6 characters</div>
                    </div>

                    <div className="input-container">
                        <input
                            name="email"
                            type="email"
                            className={`input w-full p-3 rounded-lg ${theme === 'dark' ? 'bg-slate-700 text-white border-slate-600' : 'bg-gray-100 text-gray-900 border-gray-300'
                                } border focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all`}
                            required
                            value={formData.email}
                            placeholder=" "
                            onChange={handleInputChange}
                            aria-label="Email address"
                            autoComplete="email"
                        />
                        <label className="input-label">Email Address</label>
                        <div className="validator-hint">Enter a valid email</div>
                    </div>

                    <div className="input-container">
                        <input
                            name="password"
                            type="password"
                            className={`input w-full p-3 rounded-lg ${theme === 'dark' ? 'bg-slate-700 text-white border-slate-600' : 'bg-gray-100 text-gray-900 border-gray-300'
                                } border focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all`}
                            required
                            value={formData.password}
                            placeholder=" "
                            onChange={handleInputChange}
                            minLength={4}
                            aria-label="Password"
                            autoComplete="new-password"
                        />
                        <label className="input-label">Password</label>
                        <div className="validator-hint">Minimum 4 characters</div>
                    </div>

                    <div className="input-container">
                        <input
                            name="confirmPassword"
                            type="password"
                            className={`input w-full p-3 rounded-lg ${theme === 'dark' ? 'bg-slate-700 text-white border-slate-600' : 'bg-gray-100 text-gray-900 border-gray-300'
                                } border focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all`}
                            required
                            value={formData.confirmPassword}
                            placeholder=" "
                            onChange={handleInputChange}
                            minLength={4}
                            aria-label="Confirm password"
                            autoComplete="new-password"
                        />
                        <label className="input-label">Confirm Password</label>
                        {confirmPasswordError && <div className="text-red-500 text-sm mt-1">{confirmPasswordError}</div>}
                    </div>

                    <div className="flex flex-col gap-y-4 items-center justify-center">
                        <button
                            type="submit"
                            className={`btn-gradient btn btn-lg border-0 text-white rounded-xl px-12 py-3 ${!isFormReadyToSubmit || isLoading ? 'opacity-75 cursor-not-allowed' : ''
                                }`}

                            disabled={!isFormReadyToSubmit || isLoading}
                            aria-label={isLoading ? 'Signing up' : 'Sign Up'}
                        >
                            {isLoading ? (
                                <span className="flex items-center">
                                    <ClipLoader color="white" size={24} />
                                    <span className="ml-2">Signing up...</span>
                                </span>
                            ) : (
                                'Sign Up'
                            )}
                        </button>
                        <Link
                            to="/login"
                            className={`text-lg transition-colors hover:underline ${theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'
                                }`}
                            aria-label="Log in to existing account"
                        >
                            Already have an account? Log In
                        </Link>
                    </div>
                </form>
            </div>
        </>
    )
}