import { useState, useEffect } from "react";
import { Film, Star, Play, Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

type AuthMode = "signIn" | "signUp" | "forgotPassword";

export default function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>("signIn");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  // redirect if already logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/homescreen");
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    try {
      let result: any;

      if (mode === "signIn") {
        result = await supabase.auth.signInWithPassword({ email, password });
        if (result.error) throw result.error;
        setMessage("Logged in successfully!");
        navigate("/homescreen");
      } else if (mode === "signUp") {
        if (!username.trim()) {
          setMessage("Username is required.");
          return;
        }
        if (password !== confirmPassword) {
          setMessage("Passwords do not match.");
          return;
        }
        result = await supabase.auth.signUp({
          email,
          password,
          options: { data: { username: username.trim() } },
        });
        if (result.error) throw result.error;
        setMessage("Email sent! Please verify before signing in.");
        setMode("signIn");
      } else if (mode === "forgotPassword") {
        result = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (result.error) throw result.error;
        setMessage("Check your email for reset instructions.");
        setMode("signIn");
      }

      // clear sensitive fields
      setPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setMessage(err.message || "Authentication failed.");
    }
  };

  // helper booleans
  const isSignIn = mode === "signIn";
  const isSignUp = mode === "signUp";
  const isForgot = mode === "forgotPassword";
  const passwordsMatch = password === confirmPassword;

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* animated bg */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 text-yellow-400/20 animate-pulse">
          <Star size={24} />
        </div>
        <div className="absolute top-40 right-20 text-red-400/20 animate-bounce">
          <Film size={32} />
        </div>
        <div className="absolute bottom-32 left-20 text-blue-400/20 animate-pulse">
          <Play size={28} />
        </div>
        <div className="absolute bottom-20 right-32 text-purple-400/20 animate-bounce">
          <Camera size={36} />
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-center p-4 min-h-screen">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8"
        >
          {/* logo */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <Film className="text-red-500 w-12 h-12 mr-2" />
                <Star className="absolute -top-1 -right-1 text-yellow-400 w-6 h-6 animate-pulse" />
              </div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-500 via-yellow-400 to-purple-500 bg-clip-text text-transparent mb-2">
              RateMyReel
            </h1>
            <p className="text-gray-300 text-sm">
              {isForgot
                ? "Enter your email to reset password"
                : isSignIn
                ? "Sign in to continue rating"
                : "Create your account to start rating"}
            </p>
          </div>

          {/* form fields */}
          <div className="space-y-6">
            {isSignUp && (
              <div className="space-y-2">
                <label
                  htmlFor="username"
                  className="block text-gray-200 font-medium text-sm"
                >
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 text-white placeholder:text-gray-400 focus:border-red-400 focus:ring-2 focus:ring-red-400/20 rounded-lg h-12 px-4 outline-none transition-all"
                  placeholder="Choose a username"
                />
              </div>
            )}

            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-gray-200 font-medium text-sm"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white/10 border border-white/20 text-white placeholder:text-gray-400 focus:border-red-400 focus:ring-2 focus:ring-red-400/20 rounded-lg h-12 px-4 outline-none transition-all"
                placeholder="Enter your email"
              />
            </div>

            {!isForgot && (
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="block text-gray-200 font-medium text-sm"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-white/10 border border-white/20 text-white placeholder:text-gray-400 focus:border-red-400 focus:ring-2 focus:ring-red-400/20 rounded-lg h-12 px-4 outline-none transition-all"
                  placeholder="Enter your password"
                />
              </div>
            )}

            {isSignUp && (
              <div className="space-y-2">
                <label
                  htmlFor="confirmPassword"
                  className="block text-gray-200 font-medium text-sm"
                >
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full bg-white/10 border border-white/20 text-white placeholder:text-gray-400 focus:border-red-400 focus:ring-2 focus:ring-red-400/20 rounded-lg h-12 px-4 outline-none transition-all"
                  placeholder="Confirm your password"
                />
                {!passwordsMatch && confirmPassword && (
                  <div className="flex items-center space-x-2 mt-2">
                    <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                    <p className="text-sm text-red-400">
                      Passwords do not match
                    </p>
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={
                !email ||
                (isSignIn && !password) ||
                (isSignUp &&
                  (!username.trim() || !passwordsMatch || !password)) ||
                (isForgot && !email)
              }
              className="w-full h-12 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold rounded-lg shadow-lg shadow-red-500/25 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
            >
              <div className="flex items-center justify-center space-x-2">
                {isSignIn && <Play size={18} />}
                {isSignUp && <Star size={18} />}
                {isForgot && <Camera size={18} />}
                <span>
                  {isSignIn
                    ? "Sign In"
                    : isSignUp
                    ? "Create Account"
                    : "Send Reset Link"}
                </span>
              </div>
            </button>

            {message && (
              <div className="text-center p-3 rounded-lg bg-white/10 border border-white/20">
                <p
                  className={`text-sm ${
                    message.toLowerCase().includes("success")
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {message}
                </p>
              </div>
            )}

            <div className="text-center pt-4 border-t border-white/20 space-y-2">
              {isSignIn && (
                <>
                  <button
                    type="button"
                    className="text-gray-300 text-sm hover:underline"
                    onClick={() => setMode("forgotPassword")}
                  >
                    Forgot your password?
                  </button>
                  <p className="text-gray-300 text-sm">
                    New to RateMyReel?{" "}
                    <button
                      type="button"
                      className="text-red-400 hover:text-red-300 font-medium hover:underline"
                      onClick={() => setMode("signUp")}
                    >
                      Create an account
                    </button>
                  </p>
                </>
              )}
              {isSignUp && (
                <p className="text-gray-300 text-sm">
                  Already have an account?{" "}
                  <button
                    type="button"
                    className="text-red-400 hover:text-red-300 font-medium hover:underline"
                    onClick={() => setMode("signIn")}
                  >
                    Sign in instead
                  </button>
                </p>
              )}
              {isForgot && (
                <p className="text-gray-300 text-sm">
                  Remembered?{" "}
                  <button
                    type="button"
                    className="text-red-400 hover:text-red-300 font-medium hover:underline"
                    onClick={() => setMode("signIn")}
                  >
                    Sign in
                  </button>
                </p>
              )}
            </div>
          </div>

          <div className="text-center mt-8">
            <p className="text-gray-400 text-xs">
              Discover • Rate • Review • Repeat
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
