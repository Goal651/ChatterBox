import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import axios from "axios";


interface LoginProps {
  serverUrl: string,
  status: (data: boolean) => void
}

export default function Login({ serverUrl, status }: LoginProps) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      const checkUser = async () => {
        try {
          const res = await axios.get(`${serverUrl}/auth`, {
            headers: { accesstoken: token },
          });
          if (res.status === 200) navigate("/chat/");
        } catch {
          localStorage.clear();
          sessionStorage.clear();
        }
      };
      checkUser();
    }
  }, [token, serverUrl, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    const ref = name === "email" ? emailRef : passwordRef;
    ref.current?.classList.remove("border-red-500", "focus:ring-red-500");
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    const ref = name === "email" ? emailRef : passwordRef;

    if (name === "email") {
      if (!value.trim() || !validateEmail(value)) {
        ref.current?.classList.add("border-red-500", "focus:ring-red-500");
      }
    } else if (!value.trim()) {
      ref.current?.classList.add("border-red-500", "focus:ring-red-500");
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    const ref = e.target.name === "email" ? emailRef : passwordRef;

    ref.current?.classList.remove("border-red-500", "focus:ring-red-500");
  };

  const validateInputs = (): boolean => {
    const emailValid = formData.email.trim() !== "" && validateEmail(formData.email);
    const passwordValid = formData.password.trim() !== "";

    if (!emailValid) emailRef.current?.classList.add("border-red-500", "focus:ring-red-500");
    if (!passwordValid) passwordRef.current?.classList.add("border-red-500", "focus:ring-red-500");

    return emailValid && passwordValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInputs()) return;

    setLoading(true);
    try {
      const { data } = await axios.post(`${serverUrl}/login`, formData);
      status(true)
      localStorage.setItem("token", data.accessToken);
      navigate("/chat/");
    } catch (error) {
      setLoading(false);
      if (axios.isAxiosError(error)) {
        if (!error.response) {
          navigate("/no-internet");
          return;
        }
        setErrorMessage(error.response.data.message);
      }
      
    } 
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-800">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-700 rounded-lg">
        <h2 className="text-2xl font-bold text-center text-white">Login</h2>
        {errorMessage && (
          <div className="text-red-500 rounded border-2 border-red-500 text-center w-full p-2">{errorMessage}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="john.doe@example.com"
              ref={emailRef}
              value={formData.email}
              onChange={handleInputChange}
              onBlur={handleBlur}
              onFocus={handleFocus}
              className="w-full p-2 rounded-lg bg-gray-800 border border-gray-600 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="********"
              ref={passwordRef}
              value={formData.password}
              onChange={handleInputChange}
              onBlur={handleBlur}
              onFocus={handleFocus}
              className="w-full p-2 rounded-lg bg-gray-800 border border-gray-600 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className={`w-full py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md ${loading ? "cursor-not-allowed opacity-50" : ""
              }`}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <Link to="/signup" className="block mt-4 text-center text-blue-400">
          Don’t have an account? Sign Up
        </Link>
      </div>
    </div>
  );
}
