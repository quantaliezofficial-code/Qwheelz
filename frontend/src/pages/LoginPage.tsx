import { useState, useEffect, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Car, Shield, User, CheckCircle2, ArrowRight } from "lucide-react";
import { useAuth } from "../lib/auth";
import { ApiError } from "../lib/api/client";
import { ErrorNote, Spinner } from "../components/ui";

export function LoginPage({ initialMode = "login" }: { initialMode?: "login" | "signup" }) {
  const { user, login, signup } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  // If already logged in as admin, directly go to admin dashboard
  useEffect(() => {
    if (user?.role === "admin") {
      navigate("/admin", { replace: true });
    }
  }, [user, navigate]);

  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [loginId, setLoginId] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const fillDemo = (id: string, pass: string) => {
    setMode("login");
    setLoginId(id);
    setPassword(pass);
    setError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);

    try {
      let authenticatedUser;
      if (mode === "login") {
        authenticatedUser = await login(loginId, password);
      } else {
        authenticatedUser = await signup({ name, phone, password, email: email || undefined });
      }
      if (authenticatedUser?.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate(redirect, { replace: true });
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Authentication failed. Please check your credentials.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-stone-50">
      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center justify-center">
            <img src="/logo-wide.png" alt="QWheelz" className="h-10 w-auto object-contain" />
          </Link>
          <h2 className="mt-4 text-2xl font-black tracking-tight text-stone-900">
            {mode === "login" ? "Welcome back to QWheelz" : "Create your QWheelz account"}
          </h2>
          <p className="mt-1 text-sm text-stone-500">
            {mode === "login"
              ? "Sign in to chat with sellers, save shortlists, or manage your inventory."
              : "Register in seconds to browse, enquire, and list vehicles."}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-stone-200/80 rounded-2xl p-6 sm:p-8 shadow-sm">
          {/* Quick Demo Login Presets */}
          <div className="mb-6 pb-6 border-b border-stone-100">
            <span className="text-[11px] font-mono uppercase tracking-wider text-stone-400 font-semibold block mb-2">
              Quick 1-Click Demo Accounts:
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillDemo("buyer@quantaliez.com", "buyerpassword123")}
                className="flex flex-col items-center justify-center p-2 rounded-lg border border-stone-200 hover:border-blue-600/50 hover:bg-blue-50/50 text-stone-700 transition-all text-center group cursor-pointer"
              >
                <User className="w-4 h-4 text-stone-500 group-hover:text-blue-700 mb-1" />
                <span className="text-[11px] font-bold text-stone-800">Buyer</span>
                <span className="text-[9px] text-stone-400">Shortlist & Chat</span>
              </button>

              <button
                type="button"
                onClick={() => fillDemo("seller@quantaliez.com", "sellerpassword123")}
                className="flex flex-col items-center justify-center p-2 rounded-lg border border-stone-200 hover:border-blue-600/50 hover:bg-blue-50/50 text-stone-700 transition-all text-center group cursor-pointer"
              >
                <Car className="w-4 h-4 text-stone-500 group-hover:text-blue-700 mb-1" />
                <span className="text-[11px] font-bold text-stone-800">Dealer</span>
                <span className="text-[9px] text-stone-400">Manage Fleet</span>
              </button>

              <button
                type="button"
                onClick={() => fillDemo("admin@quantaliez.com", "adminpassword123")}
                className="flex flex-col items-center justify-center p-2 rounded-lg border border-stone-200 hover:border-blue-600/50 hover:bg-blue-50/50 text-stone-700 transition-all text-center group cursor-pointer"
              >
                <Shield className="w-4 h-4 text-stone-500 group-hover:text-blue-700 mb-1" />
                <span className="text-[11px] font-bold text-stone-800">Admin</span>
                <span className="text-[9px] text-stone-400">Moderation</span>
              </button>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex bg-stone-100 p-1 rounded-lg mb-5">
            <button
              type="button"
              onClick={() => { setMode("login"); setError(null); }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                mode === "login" ? "bg-white text-stone-900 shadow-xs" : "text-stone-500 hover:text-stone-900"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode("signup"); setError(null); }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                mode === "signup" ? "bg-white text-stone-900 shadow-xs" : "text-stone-500 hover:text-stone-900"
              }`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Full Name</label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                  placeholder="e.g. Vikramaditya Roy"
                />
              </div>
            )}

            {mode === "login" ? (
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Email or Phone Number</label>
                <input
                  required
                  type="text"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-mono"
                  placeholder="name@example.com or +91 99999 00003"
                />
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Phone Number</label>
                  <input
                    required
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-mono"
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Email Address <span className="text-stone-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-mono"
                    placeholder="you@example.com"
                  />
                </div>
              </>
            )}

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-stone-700">Password</label>
                {mode === "login" && (
                  <span className="text-[11px] text-stone-400">At least 8 characters</span>
                )}
              </div>
              <input
                required
                type="password"
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                placeholder="••••••••"
              />
            </div>

            {error && <ErrorNote message={error} />}

            <button
              type="submit"
              disabled={busy}
              className="w-full py-3 bg-blue-900 hover:bg-blue-950 text-white text-xs font-extrabold tracking-wider uppercase rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg disabled:opacity-60 cursor-pointer active:scale-98"
            >
              {busy ? (
                <>
                  <Spinner size={16} />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>{mode === "login" ? "Sign In to Account" : "Create Account"}</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          {/* Value perks footer */}
          <div className="mt-6 pt-5 border-t border-stone-100 flex items-center justify-between text-stone-500 text-[11px]">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-blue-600" />
              Direct Owner Contact
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-blue-600" />
              Verified RC History
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
