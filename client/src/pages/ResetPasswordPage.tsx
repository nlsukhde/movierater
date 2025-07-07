import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Supabase will parse the access_token from the URL fragment (after #).
  // If you prefer query params, you can grab them manually:
  useEffect(() => {
    // nothing needed here for v2 – supabase-js auto-handles the token in the URL
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Password updated! Redirecting to sign in…");
      setTimeout(() => navigate("/"), 2000);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-purple-900 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 space-y-6"
      >
        <h2 className="text-2xl font-semibold text-white text-center">
          Reset Your Password
        </h2>

        <div>
          <label className="block text-gray-200 mb-1">New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="w-full px-4 py-2 rounded-lg bg-white/10 text-white placeholder-gray-400 border border-white/20 focus:border-purple-400 focus:ring-purple-400/20 outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading || newPassword.length < 6}
          className="w-full py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-lg disabled:opacity-50"
        >
          {loading ? "Saving…" : "Save New Password"}
        </button>

        {message && (
          <p
            className={`text-center text-sm ${
              message.toLowerCase().includes("updated")
                ? "text-green-400"
                : "text-red-400"
            }`}
          >
            {message}
          </p>
        )}
      </form>
    </div>
  );
}
