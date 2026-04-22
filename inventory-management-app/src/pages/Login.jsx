import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";
import { getTokenKey, getUserKey, isAuthenticated } from "../utils/auth";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await api.post("/auth/login", { email, password });
      const token = response?.data?.token || response?.data?.accessToken;
      const user = response?.data?.user || response?.data?.data?.user;

      if (!token || !user) {
        throw new Error("Invalid login response");
      }

      localStorage.setItem(getTokenKey(), token);
      localStorage.setItem(getUserKey(), JSON.stringify(user));
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <section className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 pb-10 pt-24 sm:px-6 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="mx-auto flex min-h-[calc(100vh-8.5rem)] w-full items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-200/35 backdrop-blur sm:p-8 md:p-10 dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-slate-900/35"
          >
          <div className="mb-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
              Secure Access
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">
              Welcome Back
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Log in to monitor orders, stock, and supplier updates.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter email"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-1 focus:ring-offset-white dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-cyan-500 dark:focus:ring-offset-slate-900"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter password"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-1 focus:ring-offset-white dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-cyan-500 dark:focus:ring-offset-slate-900"
                required
              />
            </div>

            {error && (
              <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default Login;
