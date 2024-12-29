import { useNavigate, Link } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { ClipLoader } from 'react-spinners';
import axios from 'axios';

// Define types for form data
interface FormData {
    names: string;
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    image?: string;
}

interface RefMap {
    [key: string]: React.RefObject<HTMLInputElement> | null;
}

interface InputProps {
    name: string;
    type?: string;
    label: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
    onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
    ref?: React.RefObject<HTMLInputElement>;
}

interface EmailInputProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isValid: boolean;
    isEmailAlreadyUsed: boolean;
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
    onFocus: (e: React.FocusEvent<HTMLInputElement>) => void;
    ref: React.RefObject<HTMLInputElement>;
}

export default function SignUp({ serverUrl }: { serverUrl: string }) {
    const [formData, setFormData] = useState<FormData>({
        names: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [isPasswordMatch, setIsPasswordMatch] = useState<boolean>(false);
    const [isEmailValid, setIsEmailValid] = useState<boolean>(false);
    const [isEmailAlreadyUsed, setIsEmailAlreadyUsed] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isFormReadyToSubmit, setIsFormReadyToSubmit] = useState<boolean>(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const navigate = useNavigate();

    const namesRef = useRef<HTMLInputElement | null>(null);
    const usernameRef = useRef<HTMLInputElement | null>(null);
    const emailRef = useRef<HTMLInputElement | null>(null);
    const passwordRef = useRef<HTMLInputElement | null>(null);
    const confirmPasswordRef = useRef<HTMLInputElement | null>(null);

    const refMap: RefMap = {
        names: namesRef,
        username: usernameRef,
        email: emailRef,
        password: passwordRef,
        confirmPassword: confirmPasswordRef
    };

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    useEffect(() => {
        const validateEmail = () => setIsEmailValid(emailRegex.test(formData.email || ''));
        const validatePasswordMatch = () => setIsPasswordMatch(formData.password === formData.confirmPassword);
        validateEmail();
        validatePasswordMatch();
    }, [formData]);

    useEffect(() => {
        setIsFormReadyToSubmit(
            formData.names !== "" &&
            formData.username !== "" &&
            formData.email !== "" &&
            formData.password !== "" &&
            formData.confirmPassword !== "" &&
            isPasswordMatch &&
            isEmailValid
        );
    }, [formData, isPasswordMatch, isEmailValid]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, files } = e.target;
        if (type === 'file' && files) {
            setFormData((prevData) => ({ ...prevData, [name]: files[0] }));
            setImagePreview(URL.createObjectURL(files[0]));
        } else {
            setFormData((prevData) => ({ ...prevData, [name]: value }));
        }

        // Remove red border when input starts getting valid
        if (value.trim()) {
            refMap[name]?.current?.classList.remove("border-red-500", "focus:ring-red-500");
        }
    };

    const handleImageUploadClick = () => fileInputRef.current?.click();

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        const ref = refMap[name];
        if (!value.trim()) {
            ref?.current?.classList.add("border-red-500", "focus:ring-red-500");
        }
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        const { name } = e.target;
        const ref = refMap[name];
        ref?.current?.classList.remove("border-red-500", "focus:ring-red-500");
    };

    const validateInputs = (): boolean => {
        let isValid = true;

        // Check if all required fields are filled in
        Object.keys(refMap).forEach((key) => {
            const ref = refMap[key];
            const value = formData[key as keyof FormData];
            if (!value?.trim()) {
                ref?.current?.classList.add("border-red-500", "focus:ring-red-500");
                isValid = false;
            }
        });

        return isValid;
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateInputs()) return;

        setIsLoading(true);

        try {
            const response = await axios.post(`${serverUrl}/signUp`, formData);

            if (response.status === 201) navigate('/login');
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (!error.response) {
                    navigate('/no-internet');
                    return;
                }
                if (error.response.status === 400) setIsEmailAlreadyUsed(true)
                else console.error(error);

            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-gray-800 via-gray-900 to-black m-0 p-0">
            <form
                className="h-screen sm:h-full w-full max-w-lg p-10 bg-gray-700 sm:rounded-lg shadow-lg space-y-6  "
                onSubmit={handleFormSubmit}
            >
                <h2 className="text-3xl font-bold text-center text-white">Sign Up</h2>
                <div className="text-center">
                    <Link to="/login" className="text-blue-400 hover:text-blue-600">
                        Already have an account? Sign In
                    </Link>
                </div>
                {/* Profile Picture Preview */}
                {imagePreview && (
                    <div className="flex justify-center mb-6">
                        <img
                            src={imagePreview}
                            alt="Profile Preview"
                            className="w-32 h-32 rounded-full object-cover"
                        />
                    </div>
                )}
                <InputField
                    name="names"
                    label="Full Name"
                    value={formData.names}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    onFocus={handleFocus}
                    ref={namesRef}
                />
                <InputField
                    name="username"
                    label="Username"
                    value={formData.username}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    onFocus={handleFocus}
                    ref={usernameRef}
                />
                <EmailInput
                    value={formData.email}
                    onChange={handleInputChange}
                    isValid={isEmailValid}
                    isEmailAlreadyUsed={isEmailAlreadyUsed}
                    onBlur={handleBlur}
                    onFocus={handleFocus}
                    ref={emailRef}
                />
                <InputField
                    name="password"
                    label="Password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    onFocus={handleFocus}
                    ref={passwordRef}
                />
                <InputField
                    name="confirmPassword"
                    label="Confirm Password"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    onFocus={handleFocus}
                    ref={confirmPasswordRef}
                />
                <button
                    type="submit"
                    disabled={!isFormReadyToSubmit}
                    className={`w-full py-3 px-5 text-lg font-medium text-white bg-blue-600 rounded-lg ${isFormReadyToSubmit ? 'hover:bg-blue-700' : 'opacity-50 cursor-not-allowed'
                        }`}
                >
                    {isLoading ? <ClipLoader color="white" size={24} /> : 'Sign Up'}
                </button>
                <button
                    type="button"
                    onClick={handleImageUploadClick}
                    className="w-full py-3 px-5 mt-2 text-lg font-medium text-white bg-gray-600 rounded-lg hover:bg-gray-700"
                >
                    Upload Profile Image
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    name="image"
                    accept="image/*"
                    className="hidden"
                    onChange={handleInputChange}
                />
            </form>
        </div>
    );
}

function InputField({ name, label, type = 'text', value, onChange, onBlur, onFocus, ref }: InputProps) {
    return (
        <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">{label}</label>
            <input
                ref={ref}
                className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                name={name}
                type={type}
                value={value || ''}
                onChange={onChange}
                onBlur={onBlur}
                onFocus={onFocus}
                required
            />
        </div>
    );
}

function EmailInput({ value, onChange, isValid, isEmailAlreadyUsed, onBlur, onFocus, ref }: EmailInputProps) {
    return (
        <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">Email</label>
            <input
                ref={ref}
                className={`w-full px-4 py-2 bg-gray-800 text-white border rounded-lg focus:outline-none ${isValid
                    ? 'border-gray-600 focus:ring-blue-500'
                    : 'border-red-500 focus:ring-red-500'
                    }`}
                name="email"
                type="email"
                value={value || ''}
                onChange={onChange}
                onBlur={onBlur}
                onFocus={onFocus}
                required
            />
            {!isValid && <p className="mt-1 text-sm text-red-400">Please enter a valid email</p>}
            {isEmailAlreadyUsed && (
                <p className="mt-1 text-sm text-red-400">This email is already in use</p>
            )}
        </div>
    );
}
