import { useAuth } from "../lib/auth";
import { Link, useNavigate } from "react-router-dom";
import { User, Shield, Car, MessageSquare, Heart, LogOut, CheckCircle2, AlertCircle, Calendar, Phone, Mail, MapPin } from "lucide-react";
import { formatINR } from "../components/ui";

export function AccountPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate("/login");
    return null;
  }

  const handleSignOut = async () => {
    await logout();
    navigate("/");
  };

  const formattedDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Member";

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      {/* Header Profile Banner */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-900 text-white font-bold text-2xl shadow-sm">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="font-display text-2xl font-bold text-stone-900">{user.name}</h1>
                <span className="rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-blue-800">
                  {user.role}
                </span>
                {user.is_verified && (
                  <span className="flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                    <CheckCircle2 size={12} /> Verified
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-stone-500">
                Member since {formattedDate}
              </p>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50/60 px-4 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100/80"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>

        {/* Contact info grid */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-stone-100 pt-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-stone-100 text-stone-600">
              <Mail size={16} />
            </div>
            <div>
              <p className="text-xs text-stone-400 font-medium">Email Address</p>
              <p className="text-sm font-semibold text-stone-800 truncate">{user.email || "Not provided"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-stone-100 text-stone-600">
              <Phone size={16} />
            </div>
            <div>
              <p className="text-xs text-stone-400 font-medium">Phone Number</p>
              <p className="text-sm font-semibold text-stone-800">{user.phone}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-stone-100 text-stone-600">
              <Shield size={16} />
            </div>
            <div>
              <p className="text-xs text-stone-400 font-medium">Account Type</p>
              <p className="text-sm font-semibold text-stone-800 capitalize">
                {user.seller_type ? `${user.seller_type} Seller` : `${user.role} Account`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Role-Specific Quick Portals */}
      <h2 className="mt-10 font-display text-lg font-bold text-stone-900">Your Workspaces & Shortcuts</h2>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {user.role === "admin" ? (
          <>
            <Link
              to="/admin"
              className="group flex items-start gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-xs transition-all hover:border-blue-500/40 hover:shadow-md"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                <Shield size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold text-stone-900 group-hover:text-blue-700 transition-colors">
                  Admin Console
                </h3>
                <p className="mt-1 text-xs text-stone-500">
                  Platform governance, moderation queue, user management, and financial overview.
                </p>
              </div>
            </Link>

            <Link
              to="/admin"
              className="group flex items-start gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-xs transition-all hover:border-blue-500/40 hover:shadow-md"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-stone-700 transition-colors group-hover:bg-stone-900 group-hover:text-white">
                <CheckCircle2 size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold text-stone-900 group-hover:text-blue-700 transition-colors">
                  Approval & Moderation Queue
                </h3>
                <p className="mt-1 text-xs text-stone-500">
                  Review submitted vehicle listings and dealer/private seller identity proofs.
                </p>
              </div>
            </Link>
          </>
        ) : (
          <>
            {user.role === "seller" && (
              <Link
                to="/dashboard"
                className="group flex items-start gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-xs transition-all hover:border-blue-500/40 hover:shadow-md"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-stone-700 transition-colors group-hover:bg-stone-900 group-hover:text-white">
                  <Car size={22} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900 group-hover:text-blue-700 transition-colors">
                    Seller Dashboard
                  </h3>
                  <p className="mt-1 text-xs text-stone-500">
                    Manage your active vehicle listings, view performance, and answer buyer enquiries.
                  </p>
                </div>
              </Link>
            )}

            <Link
              to="/sell"
              className="group flex items-start gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-xs transition-all hover:border-blue-500/40 hover:shadow-md"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                <Car size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold text-stone-900 group-hover:text-emerald-700 transition-colors">
                  Sell a Vehicle
                </h3>
                <p className="mt-1 text-xs text-stone-500">
                  Create a new structured vehicle listing for review and publication.
                </p>
              </div>
            </Link>

            <Link
              to="/enquiries"
              className="group flex items-start gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-xs transition-all hover:border-blue-500/40 hover:shadow-md"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                <MessageSquare size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold text-stone-900 group-hover:text-blue-700 transition-colors">
                  Inquiries & Shortlist
                </h3>
                <p className="mt-1 text-xs text-stone-500">
                  View your conversation threads with vehicle sellers and saved shortlist cars.
                </p>
              </div>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
