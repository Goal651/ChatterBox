import { useNavigate, Link } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { ClipLoader } from 'react-spinners';
import axios from 'axios';
import { FormData } from '../interfaces/interfaces';

export default function SignUp({ serverUrl }: { serverUrl: string }) {
    const [formData, setFormData] = useState<FormData>({
        names: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const navigate = useNavigate();
    const [isPasswordMatch, setIsPasswordMatch] = useState<boolean>(false);
    const [confirmPasswordError, setConfirmPasswordError] = useState<string>('');
    const [emailError, setEmailError] = useState('')
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isFormReadyToSubmit, setIsFormReadyToSubmit] = useState<boolean>(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        const validatePasswordMatch = () => setIsPasswordMatch(formData.password === formData.confirmPassword);
        validatePasswordMatch();
    }, [formData]);

    useEffect(() => {
        setIsFormReadyToSubmit(
            formData.names !== "" &&
            formData.username !== "" &&
            formData.email !== "" &&
            formData.password !== "" &&
            formData.confirmPassword !== ""
        );
    }, [formData, isPasswordMatch]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, files } = e.target;
        if (type === 'file' && files) {
            setFormData((prevData) => ({ ...prevData, [name]: files[0] }));
            setImagePreview(URL.createObjectURL(files[0]));
        } else {
            setFormData((prevData) => ({ ...prevData, [name]: value }));
        }



        if (name === 'password' || name === 'confirmPassword') {
            const passwordMatch = formData.password === value || name === 'password' && value === formData.confirmPassword;
            setIsPasswordMatch(passwordMatch);
            setConfirmPasswordError(passwordMatch ? '' : 'Passwords do not match');
        }
    };

    const handleImageUploadClick = () => fileInputRef.current?.click();


    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await axios.post(`${serverUrl}/signUp`, formData);
            if (response.status === 201) navigate('/login');
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (!error.response) {
                    // No internet or no response
                    navigate('/no-internet');
                    return;
                }
                if (error.response.status === 400) {
                    const emailAlreadyExists = error.response.data.message === "User exist"
                    if (emailAlreadyExists) {
                        setEmailError(error.response.data.message as string)
                    }
                } else console.error(error);
            }
        } finally {
            setIsLoading(false);
        }

    };

    return (
        <div className="flex items-center justify-center h-screen overflow-hidden bg-gradient-to-r from-slate-950 via-slate-700 to-slate-950  py-10">
            <form
                className="h-full w-full max-w-lg px-10 bg-slate-900 sm:rounded-lg shadow-lg space-y-6 bg-linear-to-r overflow-auto py-4"
                onSubmit={handleFormSubmit}
            >
                <div className="text-3xl font-bold text-center text-white">Sign Up</div>

                {imagePreview ? (
                    <div
                        onClick={handleImageUploadClick}
                        className="flex justify-center mb-6">
                        <img
                            src={imagePreview}
                            alt="Profile Preview"
                            className="w-32 h-32 rounded-full object-cover"
                        />
                    </div>
                ) : (
                    <div className='flex items-center justify-center'>
                        <div
                            onClick={handleImageUploadClick}
                            className="h-32 w-32 items-center  flex justify-center mb-6 rounded-full bg-black">
                            <div
                                className=" text-white font-extrabold text-5xl"
                            >
                                {formData.names.slice(0, 1).toUpperCase() || 'U'}
                            </div>
                        </div>
                    </div>
                )}
                <input
                    type="file"
                    ref={fileInputRef}
                    name="image"
                    accept="image/*"
                    className="hidden"
                    onChange={handleInputChange}
                />
                <div>
                    <input
                        name='names'
                        type="input"
                        className="input validator w-full rounded-lg  input-lg bg-slate-800"
                        required placeholder="John Doe"
                        onChange={handleInputChange}
                        minLength={5} maxLength={30}
                        title="names" />
                    <div className="validator-hint">
                        Must be 5 to 30 characters
                    </div>
                </div>
                <div>
                    <input
                        name='username'
                        type="input"
                        onChange={handleInputChange}
                        className="input validator w-full rounded-lg  input-lg bg-slate-800"
                        required placeholder="username"
                        minLength={3} maxLength={6}
                        title="names" />
                    <div className="validator-hint">
                        Must be 3 to 6 characters
                    </div>
                </div>
                <div>
                    <input
                        name='email'
                        type="email"
                        onChange={handleInputChange}
                        className="input validator w-full rounded-lg  input-lg bg-slate-800"
                        required placeholder="johndoe@example.com"
                        title="names" />
                    <div className="validator-hint">
                        Enter valid email
                    </div>
                    {emailError && <div className=" text-red-500">{emailError}</div>}
                </div>
                <div>
                    <input
                        name='password'
                        type="password"
                        onChange={handleInputChange}
                        className="input validator w-full rounded-lg  input-lg bg-slate-800"
                        required placeholder="Password"
                        title="names" />
                    <div className="validator-hint">
                        Minimum characters 4
                    </div>
                </div>
                <div>
                    <input
                        name='confirmPassword'
                        onChange={handleInputChange}
                        type="password"
                        className="input validator w-full rounded-lg  input-lg bg-slate-800"
                        required placeholder="Password"
                        title="names" />
                    <div className="">
                        {confirmPasswordError && <div className="text-red-500">{confirmPasswordError}</div>}

                    </div>
                </div>

                <div className='flex flex-col gap-y-4 items-center justify-center'>
                    <button
                        type="submit"
                        className={`btn btn-wide btn-xl btn-neutral text-white rounded-xl ${!isFormReadyToSubmit && 'cursor-not-allowed'
                            }`}
                    >
                        {isLoading ? <ClipLoader color="white" size={24} /> : 'Sign Up'}
                    </button>
                    <Link to={'/login'}
                        className='link link-info text-xl'
                    >
                        Already have account?
                    </Link>
                </div>


            </form>
        </div>
    );
}
