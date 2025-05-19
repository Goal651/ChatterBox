import SelectableUsers from "@/components/user/groupCreation";
import { useState } from "react";
import { FaApple, FaGoogle, FaPeopleGroup, FaXTwitter } from "react-icons/fa6";
import { Link } from "react-router-dom";

export default function NewGroup() {
    const [groupName, setGroupName] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    return (
        <div className="bg-[#0f0f0f] w-full h-full flex items-center justify-center">
            <div className='bg-[#1a1a1a] flex flex-col items-center justify-between   py-10 px-5 w-lg rounded-xl'>
                {/* App icon */}
                <div className='btn btn-xl btn-square rounded-full mb-8'>
                    <FaPeopleGroup />
                </div>

                {/* Header */}
                <div className='flex flex-col gap-y-2 text-center mb-8'>
                    <div className='text-white text-lg font-bold'>Create new group</div>
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
                        <input type="text" className="" placeholder="Groop name"
                        />
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
                        <input type="email" className="" placeholder="details"
                        />
                    </label>
                    <div className="w-full h-96 pb-10">
                        <div className="font-semibold mb-4">Select members</div>
                        <SelectableUsers />
                    </div>



                    {/* Submit button */}
                    <button type="submit" className={`btn bg-blue-600 rounded-lg ${isLoading && 'bg-blue-700 '}`}
                        disabled={isLoading}>
                        {isLoading ? 'Loading...' : 'Create'}
                    </button>

                </form>

                {/* Diver */}
                <div className="divider ">OR</div>
            </div>
        </div>

    )
}