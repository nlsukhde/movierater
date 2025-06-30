import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";

export default function AuthPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    // --- validate signup passwords ---
    if (!isLogin && password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    try {
      const url = isLogin ? "/login" : "/signup";
      const res = await api.post(url, { email, password });
      const data = res.data;

      if (isLogin) {
        // ——— LOGIN FLOW ———
        // save the token
        localStorage.setItem("token", data.token);
        setMessage("Logged in successfully!");
        // go to your homescreen
        navigate("/homescreen");
      } else {
        // ——— SIGNUP FLOW ———
        setMessage("Account created! Please log in.");
        // flip into login mode
        setIsLogin(true);
      }

      // common cleanup
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      const msg =
        err.response?.data?.error ||
        (isLogin ? "Login failed." : "Signup failed.");
      setMessage(msg);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setMessage("");
    setPassword("");
    setConfirmPassword("");
  };

  const passwordsMatch = password === confirmPassword;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-md shadow-md w-full max-w-sm"
      >
        <h1 className="text-xl font-bold mb-4">
          {isLogin ? "Log In" : "Create Account"}
        </h1>

        <div className="mb-4">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {!isLogin && (
          <div className="mb-4">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            {!passwordsMatch && confirmPassword && (
              <p className="text-sm text-red-600 mt-1">
                Passwords do not match.
              </p>
            )}
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={
            !email ||
            !password ||
            (!isLogin && (!confirmPassword || !passwordsMatch))
          }
        >
          {isLogin ? "Log In" : "Sign Up"}
        </Button>

        {message && (
          <p className="text-sm text-center mt-4 text-red-600">{message}</p>
        )}

        <p className="text-center mt-4 text-sm">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            className="text-blue-600 hover:underline"
            onClick={toggleMode}
          >
            {isLogin ? "Create one" : "Log in"}
          </button>
        </p>
      </form>
    </div>
  );
}
