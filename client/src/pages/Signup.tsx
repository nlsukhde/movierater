// AuthPage.tsx
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

export default function AuthPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(false);
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

    if (!isLogin) {
      if (!username.trim()) {
        setMessage("Username is required.");
        return;
      }
      if (password !== confirmPassword) {
        setMessage("Passwords do not match.");
        return;
      }
    }

    try {
      let result;

      if (isLogin) {
        // Supabase login
        result = await supabase.auth.signInWithPassword({ email, password });
      } else {
        // Supabase sign up with username in metadata
        result = await supabase.auth.signUp({
          email,
          password,
          options: { data: { username: username.trim() } },
        });
      }

      if (result.error) throw result.error;

      if (isLogin) {
        setMessage("Logged in successfully!");
        navigate("/homescreen");
      } else {
        setMessage("Email sent, please verify your account before signing in!");
        setIsLogin(true);
      }

      // clear fields
      setUsername("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setMessage(err.message || "Authentication failed.");
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

        {!isLogin && (
          <div className="mb-4">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required={!isLogin}
            />
          </div>
        )}

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
            (!isLogin &&
              (!confirmPassword || !passwordsMatch || !username.trim()))
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
