import  { useState } from 'react';
import axios from 'axios';

const Signup = ({serverUrl}) => {
    const [formData, setFormData] = useState({
        email: '',
        names: '',
        username: '',
        password: '',
        confirmPassword: ''
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.email) {
            newErrors.email = 'Email is required.';
        } else if (!/^[\w-.]+@[\w-]+\.[a-z]{2,}$/i.test(formData.email)) {
            newErrors.email = 'Enter a valid email address.';
        }

        if (!formData.names) {
            newErrors.names = 'Names are required.';
        }

        if (!formData.username) {
            newErrors.username = 'Username is required.';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required.';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters long.';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({}); // Clear previous errors
        setSuccessMessage('');

        if (!validateForm()) return;

        setLoading(true);

        try {
            const response = await axios.post(serverUrl+'/signup', formData);
            setSuccessMessage(response.data.message);
            setFormData({ email: '', names: '', username: '', password: '', confirmPassword: '' });
        } catch (error) {
            if (error.response && error.response.data) {
                setErrors(error.response.data);
            } else {
                setErrors({ general: 'An unexpected error occurred. Please try again.' });
            }
        } finally {
            setLoading(false);
        }
    };

    const getPasswordStrength = (password) => {
        if (!password) return '';
        const strongPassword = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/;
        return strongPassword.test(password) ? 'Strong' : 'Weak';
    };

    return (
        <div className="flex justify-center items-center h-screen bg-gray-800">
            <div className="bg-gray-900 p-8 rounded shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>
                {successMessage && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{successMessage}</div>}
                {errors.general && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{errors.general}</div>}

                <form onSubmit={handleSubmit} noValidate>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`mt-1 block w-full p-2 border rounded-md ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>

                    <div className="mb-4">
                        <label htmlFor="names" className="block text-sm font-medium text-gray-700">Names</label>
                        <input
                            type="text"
                            id="names"
                            name="names"
                            value={formData.names}
                            onChange={handleChange}
                            className={`mt-1 block w-full p-2 border rounded-md ${errors.names ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.names && <p className="text-red-500 text-sm mt-1">{errors.names}</p>}
                    </div>

                    <div className="mb-4">
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className={`mt-1 block w-full p-2 border rounded-md ${errors.username ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
                    </div>

                    <div className="mb-4">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className={`mt-1 block w-full p-2 border rounded-md ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                        <p className="text-sm mt-1">Password strength: {getPasswordStrength(formData.password)}</p>
                    </div>

                    <div className="mb-4">
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className={`mt-1 block w-full p-2 border rounded-md ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50"
                    >
                        {loading ? 'Signing up...' : 'Sign Up'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Signup;
