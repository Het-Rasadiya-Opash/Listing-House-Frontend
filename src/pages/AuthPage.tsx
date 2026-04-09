import { useState } from "react";
import apiRequest from "../utils/apiRequest";
import useAuthStore from "../utils/authStore";
import { useNavigate } from "react-router-dom";

const AuthPage = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState("");
  const { setCurrentUser } = useAuthStore();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const data = isRegister
      ? {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      }
      : { email: formData.email, password: formData.password };

    try {
      const res = await apiRequest.post(
        `/user/${isRegister ? "register" : "login"}`,
        data,
      );

      setCurrentUser(res.data.user);
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "An error occurred");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 pt-24">
      <div className="w-full max-w-142 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        
        <div className="border-b border-gray-200 px-6 py-5 text-center font-bold text-gray-900 text-base">
          {isRegister ? "Sign up" : "Log in"}
        </div>

        <div className="p-6 md:p-8">
          <h2 className="text-[22px] font-semibold text-gray-900 mb-6">
            Welcome to Listing House
          </h2>

          {error && (
            <div className="mb-6 p-3 text-sm flex items-center bg-red-50 text-red-600 border border-red-200 rounded-lg font-medium">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                 <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div className="space-y-1">
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-400 focus:ring-2 focus:ring-black focus:border-black outline-none transition duration-200 text-gray-900"
                  placeholder="Username"
                  required
                />
              </div>
            )}

            <div className="space-y-1">
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-3.5 rounded-xl border border-gray-400 focus:ring-2 focus:ring-black focus:border-black outline-none transition duration-200 text-gray-900"
                placeholder="Email address"
                required
              />
            </div>

            <div className="space-y-1">
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full px-4 py-3.5 rounded-xl border border-gray-400 focus:ring-2 focus:ring-black focus:border-black outline-none transition duration-200 text-gray-900"
                placeholder="Password"
                required
              />
            </div>

            <p className="text-xs text-gray-500 py-3 leading-relaxed">
              We'll call or text you to confirm your number. Standard message and data rates apply. <span className="font-semibold underline cursor-pointer">Privacy Policy</span>
            </p>

            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary-dark text-white py-3.5 rounded-xl font-semibold transition duration-200 text-lg shadow-sm"
            >
              Continue
            </button>
          </form>

          <div className="flex items-center my-6">
            <div className="grow border-t border-gray-300"></div>
            <span className="shrink-0 mx-4 text-gray-400 text-xs">or</span>
            <div className="grow border-t border-gray-300"></div>
          </div>

          <div className="text-center text-sm font-medium text-gray-900">
            {isRegister
              ? "Already have an account?"
              : "Don't have an account?"}
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="ml-2 font-semibold underline hover:text-gray-700 decoration-gray-400"
            >
              {isRegister ? "Log in" : "Sign up"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AuthPage;