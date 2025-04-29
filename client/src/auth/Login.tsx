import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import axios from "axios";

interface LoginProps {
  serverUrl: string;
  status: (data: boolean) => void;
}

export default function Login({ serverUrl, status }: LoginProps) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
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
        } catch (error) {
          console.error("Error checking user:", error);
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
    setErrorMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
      const { data } = await axios.post(`${serverUrl}/login`, formData);
      status(true);
      localStorage.setItem("token", data.accessToken);
      if (data.role === 'admin') navigate("/admin/dashboard");
      else navigate("/chat/");
    } catch (error) {
      setLoading(false);
      if (axios.isAxiosError(error)) {
        if (!error.response) {
          navigate("/no-internet");
          return;
        }
        setErrorMessage(error.response.data.message);
      } else {
        console.error("Unexpected error:", error);
        setErrorMessage("An unexpected error occurred. Please try again.");
      }
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const dismissError = () => {
    setErrorMessage("");
    emailRef.current?.focus();
  };

  return (
    <>
      <style>
        {`
          .input-container {
            position: relative;
            margin-bottom: 1.5rem;
          }
          .input-label {
            position: absolute;
            top: 0.75rem;
            left: 1rem;
            font-size: 1rem;
            color: ${theme === "dark" ? "#94a3b8" : "#4b5563"};
            transition: all 0.2s ease;
            pointer-events: none;
          }
          .input:focus + .input-label,
          .input:not(:placeholder-shown) + .input-label {
            top: -0.75rem;
            left: 0.75rem;
            font-size: 0.75rem;
            color: ${theme === "dark" ? "#60a5fa" : "#2563eb"};
            background: ${theme === "dark" ? "#1e293b" : "#f3f4f6"};
            padding: 0 0.25rem;
          }
          .validator-hint {
            display: none;
            color: #f87171;
            font-size: 0.875rem;
            margin-top: 0.25rem;
          }
          .input:invalid:focus ~ .validator-hint {
            display: block;
          }
          .error-alert {
            animation: fadeIn 0.3s ease-in;
            position: relative;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .btn-gradient {
            background: linear-gradient(90deg, #3b82f6, #8b5cf6);
            transition: transform 0.2s ease, background 0.3s ease, box-shadow 0.3s ease;
          }
          .btn-gradient:hover:not(:disabled) {
            transform: scale(1.05);
            background: linear-gradient(90deg, #2563eb, #7c3aed);
            box-shadow: 0 4px 14px rgba(59, 130, 246, 0.5);
          }
          .btn-gradient:active:not(:disabled) {
            transform: scale(0.95);
          }
          .theme-toggle {
            transition: transform 0.3s ease;
          }
          .theme-toggle:hover {
            transform: rotate(360deg);
          }
          .dismiss-btn {
            transition: color 0.2s ease;
          }
          .dismiss-btn:hover {
            color: #ef4444;
          }
        `}
      </style>
      <div className={`flex justify-center items-center min-h-screen ${theme === "dark" ? "bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900" : "bg-gradient-to-br from-gray-100 via-blue-50 to-gray-100"} transition-colors duration-300`}>
        <div className={`w-full max-w-md p-8 space-y-8 ${theme === "dark" ? "bg-slate-800" : "bg-white"} rounded-2xl shadow-2xl sm:max-w-sm md:max-w-md`}>
          <div className="flex justify-between items-center">
            <h2 className={`text-3xl font-bold text-center ${theme === "dark" ? "text-white" : "text-gray-900"}`}>Welcome Back</h2>
            <button
              onClick={toggleTheme}
              className="theme-toggle p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? (
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
          {errorMessage && (
            <div className="error-alert bg-gradient-to-r from-red-600 to-red-800 text-white text-center p-3 rounded-lg flex justify-between items-center">
              <span>{errorMessage}</span>
              <button
                onClick={dismissError}
                className="dismiss-btn text-white hover:text-red-400 focus:outline-none"
                aria-label="Dismiss error"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
          <form onSubmit={handleSubmit} className="flex flex-col gap-y-6" noValidate>
            <div className="input-container">
              <input
                className={`input w-full p-3 rounded-lg ${theme === "dark" ? "bg-slate-700 text-white border-slate-600" : "bg-gray-100 text-gray-900 border-gray-300"} border focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all`}
                type="email"
                required
                name="email"
                placeholder=" "
                onChange={handleInputChange}
                ref={emailRef}
                aria-label="Email address"
                autoComplete="email"
              />
              <label className="input-label">Email Address</label>
              <div className="validator-hint">Enter a valid email address</div>
            </div>
            <div className="input-container">
              <input
                type="password"
                name="password"
                minLength={4}
                placeholder=" "
                value={formData.password}
                required
                onChange={handleInputChange}
                className={`input w-full p-3 rounded-lg ${theme === "dark" ? "bg-slate-700 text-white border-slate-600" : "bg-gray-100 text-gray-900 border-gray-300"} border focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all`}
                ref={passwordRef}
                aria-label="Password"
                autoComplete="current-password"
              />
              <label className="input-label">Password</label>
              <div className="validator-hint">Password must be at least 4 characters</div>
            </div>
            <div className="flex flex-col gap-y-4 justify-center items-center w-full">
              <button
                type="submit"
                className={`btn-gradient btn btn-lg border-0 text-white rounded-xl px-12 py-3 ${loading ? "opacity-75 cursor-not-allowed" : ""}`}
                disabled={loading}
                aria-label={loading ? "Logging in" : "Login"}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Logging in...
                  </span>
                ) : (
                  "Login"
                )}
              </button>
              <Link
                to="/signup"
                className={`text-lg transition-colors hover:underline ${theme === "dark" ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-500"}`}
                aria-label="Sign up for a new account"
              >
                Don’t have an account? Sign Up
              </Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}