import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { X, User, Car, Shield } from "lucide-react";
import { useAuth } from "../lib/auth";
import { ApiError } from "../lib/api/client";
import { ErrorNote, Spinner } from "./ui";

interface AuthModalProps {
  mode: "login" | "signup";
  onClose: () => void;
  onSwitchMode: (mode: "login" | "signup") => void;
  onSuccess?: () => void;
}

export function AuthModal({ mode, onClose, onSwitchMode, onSuccess }: AuthModalProps) {
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const [loginId, setLoginId] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const fillDemo = (id: string, pass: string) => {
    if (mode !== "login") onSwitchMode("login");
    setLoginId(id);
    setPassword(pass);
    setError(null);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (mode === "signup") {
      const phoneRegex = /^\+?[0-9]{10,15}$/;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
        setError("Please enter a valid phone number (10-15 digits).");
        return;
      }
      
      if (!emailRegex.test(email)) {
        setError("Please enter a valid email address.");
        return;
      }
    }

    setBusy(true);
    try {
      let authenticatedUser;
      if (mode === "login") {
        authenticatedUser = await login(loginId, password);
      } else {
        authenticatedUser = await signup({ name, phone, password, email: email });
      }
      onSuccess?.();
      onClose();
      if (authenticatedUser?.role === "admin") {
        navigate("/admin");
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl border border-stone-200 w-full max-w-md p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-start justify-between">
          <div>
            <img src="/logo-wide.png" alt="QWheelz" className="h-8 w-auto mb-2.5 object-contain" />
            <h2 className="font-display text-xl font-bold text-stone-900">{mode === "login" ? "Welcome Back" : "Create Account"}</h2>
            <p className="mt-1 text-xs text-stone-500">
              {mode === "login" ? "Sign in to chat with sellers and manage your garage." : "Browse cars, save favourites, and message sellers directly."}
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Quick Demo Login Preset Buttons */}
        <div className="mb-4 bg-stone-50 border border-stone-200/80 rounded-xl p-3">
          <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-semibold block mb-1.5">
            Quick 1-Click Demo Login:
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => fillDemo("buyer@quantaliez.com", "buyerpassword123")}
              className="px-2 py-1.5 rounded-lg border border-stone-200 bg-white hover:border-blue-600/40 hover:bg-blue-50/50 text-[10px] font-bold text-stone-700 flex items-center justify-center gap-1 cursor-pointer transition-all"
            >
              <User size={12} className="text-blue-600" /> Buyer
            </button>
            <button
              type="button"
              onClick={() => fillDemo("seller@quantaliez.com", "sellerpassword123")}
              className="px-2 py-1.5 rounded-lg border border-stone-200 bg-white hover:border-blue-600/40 hover:bg-blue-50/50 text-[10px] font-bold text-stone-700 flex items-center justify-center gap-1 cursor-pointer transition-all"
            >
              <Car size={12} className="text-blue-600" /> Dealer
            </button>
            <button
              type="button"
              onClick={() => fillDemo("admin@quantaliez.com", "adminpassword123")}
              className="px-2 py-1.5 rounded-lg border border-stone-200 bg-white hover:border-blue-600/40 hover:bg-blue-50/50 text-[10px] font-bold text-stone-700 flex items-center justify-center gap-1 cursor-pointer transition-all"
            >
              <Shield size={12} className="text-blue-600" /> Admin
            </button>
          </div>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-3">
          {mode === "signup" && (
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate">Full name</label>
              <input required value={name} onChange={(e) => setName(e.target.value)} className="qz-input w-full px-3 py-2 text-sm" placeholder="Priya Sharma" />
            </div>
          )}

          {mode === "login" ? (
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate">Email or phone</label>
              <input required value={loginId} onChange={(e) => setLoginId(e.target.value)} className="qz-input w-full px-3 py-2 text-sm" placeholder="you@example.com" />
            </div>
          ) : (
            <>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate">Phone number</label>
                <input required value={phone} onChange={(e) => setPhone(e.target.value)} className="qz-input w-full px-3 py-2 text-sm" placeholder="+91 98765 43210" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate">Email address</label>
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="qz-input w-full px-3 py-2 text-sm" placeholder="you@example.com" />
              </div>
            </>
          )}

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate">Password</label>
            <input required type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="qz-input w-full px-3 py-2 text-sm" placeholder="At least 8 characters" />
          </div>

          {error && <ErrorNote message={error} />}

          <button type="submit" disabled={busy} className="qz-btn-primary mt-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold disabled:opacity-60">
            {busy && <Spinner size={16} />}
            {mode === "login" ? "Log in" : "Create account"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate">
          {mode === "login" ? (
            <>Don't have an account? <button onClick={() => onSwitchMode("signup")} className="font-semibold text-blue-700 hover:underline">Sign up</button></>
          ) : (
            <>Already have an account? <button onClick={() => onSwitchMode("login")} className="font-semibold text-blue-700 hover:underline">Log in</button></>
          )}
        </p>
      </div>
    </div>
  );
}
