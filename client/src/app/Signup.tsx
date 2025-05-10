import { FaApple, FaGoogle, FaXTwitter } from "react-icons/fa6";
import { Link } from "react-router-dom";

export default function SignUpPage() {
    return (
        <div className="bg-[#0f0f0f] h-screen w-screen flex items-center justify-center">
            <div className='bg-[#1a1a1a] flex flex-col items-center justify-between   py-10 px-5 w-lg rounded-xl'>
                {/* App icon */}
                <div className='btn btn-xl btn-square rounded-full mb-8'>
                    <img src="/AppIcon.png" alt="" />
                </div>

                {/* Header */}
                <div className='flex flex-col gap-y-2 text-center mb-8'>
                    <div className='text-white text-lg font-bold'>Sign Up</div>
                    <div className='flex gap-x-2'>
                        <span>Already have account ?</span>
                        <Link to={'/login'}
                            className='text-white font-semibold'>Sign In</Link>
                    </div>
                </div>

                {/* Form */}
                <form className='flex flex-col gap-y-4 w-full mb-6'>

                    {/* Username */}
                    <label className="input border-0  bg-[#0e0e0e] w-full rounded-lg  outline-0 focus-within:outline-0">
                        <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <g
                                strokeLinejoin="round"
                                strokeLinecap="round"
                                strokeWidth="2.5"
                                fill="none"
                                stroke="currentColor"
                            >
                                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </g>
                        </svg>
                        <input type="email" className="" placeholder="Username" />
                    </label>

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
                        <input type="email" className="" placeholder="email address" />
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
                        <input type="password" className="grow" placeholder="Password" />
                    </label>

                    {/* Confirm password */}
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
                        <input type="password" className="grow" placeholder="Confirm Password" />
                    </label>

                    {/* Submit button */}
                    <div className='btn bg-blue-600 rounded-lg'>
                        Sign up
                    </div>

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