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

  return (
    <div className="flex justify-center items-center min-h-screen bg-linear-to-r from-slate-950 via-slate-700 to-slate-950">
      <div className="w-full max-w-lg p-10 space-y-10 bg-slate-900 rounded-2xl">
        <h2 className="text-4xl font-bold text-center text-white">Login</h2>
        {errorMessage && (
          <div className="alert alert-error bg-red-800 text-lg text-white rounded text-center w-full">
            {errorMessage}
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-y-5">
          <div>
            <input
              className="input validator w-full rounded-lg input-lg bg-slate-800"
              type="email"
              required
              name="email"
              placeholder="mail@site.com"
              onChange={handleInputChange}
              ref={emailRef}
            />
            <div className="validator-hint text-lg">Enter valid email address</div>
          </div>
          <div>
            <input
              type="password"
              name="password"
              minLength={4}
              placeholder="********"
              value={formData.password}
              required
              onChange={handleInputChange}
              className="w-full input validator rounded-lg input-lg bg-slate-800"
              ref={passwordRef}
            />
            <div className="validator-hint text-lg">Enter valid password</div>
          </div>
          <div className="flex flex-col gap-y-4 justify-center items-center w-full">
            <button
              type="submit"
              className={`btn btn-lg border-0 text-white btn-neutral rounded-2xl px-10 ${loading ? "loading" : ""}`}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
            <Link to="/signup" className="link link-info text-lg link-hover">
              Don’t have an account? Sign Up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
