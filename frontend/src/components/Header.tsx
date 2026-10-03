import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Bell, Car, Heart, LayoutDashboard, LogOut, Menu, MessageSquare, Shield, User as UserIcon, X, MapPin, ChevronDown, Zap, Search, Calendar, ChevronRight, Settings2, CheckCircle2 } from "lucide-react";
import { useAuth } from "../lib/auth";
import { useNotifications, useUnreadCount, useMarkAllNotificationsRead, useMarkNotificationRead } from "../hooks/useNotifications";
import { AuthModal } from "./AuthModal";
import { useCity, INDIAN_CITIES } from "../context/CityContext";

function formatRelativeTime(dateStr: string) {
  try {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(dateStr).toLocaleDateString("en-IN", { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

function NotificationDropdown({
  onClose,
  align = "right",
}: {
  onClose: () => void;
  align?: "left" | "right";
}) {
  const { data: notifications, isLoading } = useNotifications();
  const { data: unread } = useUnreadCount();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  return (
    <div
      role="dialog"
      aria-label="Notifications"
      className={`absolute ${align === "right" ? "right-0" : "left-0 sm:left-auto sm:right-0"} mt-2 w-[calc(100vw-2rem)] max-w-sm sm:w-96 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150`}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-900">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-stone-900 dark:text-stone-100">Notifications</span>
          {unread && unread.count > 0 && (
            <span className="px-2 py-0.5 text-[11px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 rounded-full">
              {unread.count} new
            </span>
          )}
        </div>
        {unread && unread.count > 0 && (
          <button
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 transition-colors disabled:opacity-50"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-stone-100 dark:divide-stone-800">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse space-y-2">
                <div className="h-3 bg-stone-200 dark:bg-stone-800 rounded w-3/4"></div>
                <div className="h-2 bg-stone-100 dark:bg-stone-800 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        ) : !notifications || notifications.length === 0 ? (
          <div className="p-8 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <p className="text-sm font-bold text-stone-900 dark:text-stone-100">You're all caught up</p>
            <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">No notifications at this time.</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => {
                if (!n.read_at) markRead.mutate(n.id);
              }}
              className={`p-3.5 transition-colors cursor-pointer flex items-start gap-3 ${
                !n.read_at
                  ? "bg-blue-50/40 dark:bg-blue-950/20 hover:bg-blue-50/70 dark:hover:bg-blue-900/30"
                  : "hover:bg-stone-50 dark:hover:bg-stone-800/50"
              }`}
            >
              <div className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${!n.read_at ? "bg-blue-600" : "bg-transparent"}`} />
              <div className="flex-1 min-w-0">
                <p className={`text-xs ${!n.read_at ? "font-semibold text-stone-900 dark:text-stone-100" : "text-stone-600 dark:text-stone-300"}`}>
                  {n.message}
                </p>
                <p className="mt-1 text-[10px] text-stone-400 font-mono">
                  {formatRelativeTime(n.created_at)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-2.5 bg-stone-50 dark:bg-stone-900 border-t border-stone-100 dark:border-stone-800 flex justify-between items-center text-xs text-stone-500">
        <span>Updates on your inquiries & listings</span>
        <button
          onClick={onClose}
          className="text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 font-medium px-2 py-0.5 rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState<"login" | "signup" | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { data: unread } = useUnreadCount();
  const { city, setCity } = useCity();
  const [cityOpen, setCityOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const mobileNotifRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const cityRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setNotifOpen(false);
        setMoreOpen(false);
        setMenuOpen(false);
        setCityOpen(false);
        setMobileOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        notifRef.current &&
        !notifRef.current.contains(target) &&
        (!mobileNotifRef.current || !mobileNotifRef.current.contains(target))
      ) {
        setNotifOpen(false);
      }
      if (moreRef.current && !moreRef.current.contains(target)) {
        setMoreOpen(false);
      }
      if (menuRef.current && !menuRef.current.contains(target)) {
        setMenuOpen(false);
      }
      if (cityRef.current && !cityRef.current.contains(target)) {
        setCityOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    navigate("/");
  };

  const navItems = user?.role === "admin"
    ? [
        { label: 'Admin Dashboard', path: '/admin', icon: <Shield className="w-4 h-4" /> },
      ]
    : [
        { label: 'Browse Cars', path: '/cars', icon: <Car className="w-4 h-4" /> },
        ...(user?.role === 'seller' 
            ? [{ label: 'Seller Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> }]
            : [{ label: 'Sell Your Car', path: '/sell', icon: <Car className="w-4 h-4" /> }]),
        ...(user?.role === 'buyer'
            ? [{ label: 'My Enquiries', path: '/enquiries', icon: <MessageSquare className="w-4 h-4" /> }]
            : []),
      ];

  return (
    <>
      <header className="sticky top-0 z-50 bg-[#FAFAF9]/95 dark:bg-stone-900/95 border-b border-stone-200/80 dark:border-stone-800/80 backdrop-blur-md text-stone-900 dark:text-stone-100 transition-all duration-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link to={user?.role === "admin" ? "/admin" : "/"} className="flex items-center gap-2 group">
                <img
                  src="/logo-wide.png"
                  alt="QWheelz"
                  className="h-7 sm:h-8 w-auto object-contain transition-transform duration-200 group-hover:scale-[1.02]"
                />
                {user?.role === "admin" && (
                  <span className="text-[10px] sm:text-xs tracking-wider uppercase text-white bg-blue-900 font-extrabold px-2 py-0.5 rounded-md border border-blue-800 self-center">
                    ADMIN
                  </span>
                )}
              </Link>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center space-x-2">
              {user?.role !== "admin" && (
                <>
                  <div className="relative mr-4" ref={cityRef}>
                    <button
                      type="button"
                      onClick={() => setCityOpen(!cityOpen)}
                      className="flex items-center space-x-1.5 px-3 py-2 text-sm font-medium text-stone-600 hover:text-blue-900 transition-colors rounded-lg hover:bg-blue-50/60"
                    >
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <span>{city}</span>
                      <ChevronDown className="w-4 h-4 opacity-50" />
                    </button>
                    {cityOpen && (
                      <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-blue-100 shadow-xl rounded-xl z-50 py-2 max-h-64 overflow-y-auto qz-scroll">
                        {INDIAN_CITIES.map((c) => (
                          <button
                            key={c}
                            onClick={() => {
                              setCity(c);
                              setCityOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 hover:text-blue-700 transition-colors ${
                              c === city ? "bg-blue-50 text-blue-700 font-bold" : "text-stone-700"
                            }`}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="h-6 w-px bg-stone-200 mr-4"></div>
                </>
              )}
              
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative px-4 py-2 text-sm font-medium tracking-wide transition-all duration-300 rounded-lg hover:bg-blue-50/60 flex items-center space-x-1.5 ${
                    location.pathname === item.path
                      ? 'text-blue-700 font-semibold'
                      : 'text-stone-600 hover:text-blue-900'
                  }`}
                >
                  <span>{item.label}</span>
                  {location.pathname === item.path && (
                    <span className="absolute bottom-1 left-4 right-4 h-[2px] bg-blue-600 rounded-full" />
                  )}
                </Link>
              ))}

              {/* More Menu (Only for non-admin buyers/sellers) */}
              {user?.role !== "admin" && (
                <div className="relative" ref={moreRef}>
                  <button
                    type="button"
                    onClick={() => setMoreOpen(!moreOpen)}
                    aria-expanded={moreOpen}
                    aria-label="More navigation links"
                    className={`relative px-4 py-2 text-sm font-medium tracking-wide transition-all duration-300 rounded-lg hover:bg-blue-50/60 flex items-center space-x-1.5 ${
                      moreOpen ? 'text-blue-700 bg-blue-50' : 'text-stone-600 hover:text-blue-900'
                    }`}
                  >
                    <span>More</span>
                    <ChevronDown className={`w-4 h-4 opacity-50 transition-transform duration-200 ${moreOpen ? "rotate-180" : ""}`} />
                  </button>

                  {moreOpen && (
                    <div className="absolute top-full right-0 w-[500px] pt-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="bg-white border border-blue-100 shadow-xl rounded-2xl p-6 grid grid-cols-2 gap-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-10 opacity-60"></div>
                        
                        <div>
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Discover</h4>
                          <div className="space-y-3">
                            <Link to="/cars?sort=newest" onClick={() => setMoreOpen(false)} className="flex items-center text-sm font-medium text-stone-700 hover:text-blue-700 transition-colors group">
                              <Zap className="w-4 h-4 mr-2 text-blue-500 opacity-50 group-hover:opacity-100 transition-opacity" /> 
                              New Arrivals
                            </Link>
                            <Link to="/cars?body_type=suv" onClick={() => setMoreOpen(false)} className="flex items-center text-sm font-medium text-stone-700 hover:text-blue-700 transition-colors group">
                              <Search className="w-4 h-4 mr-2 text-blue-500 opacity-50 group-hover:opacity-100 transition-opacity" /> 
                              SUV Collection
                            </Link>
                            <Link to="/cars?transmission=automatic" onClick={() => setMoreOpen(false)} className="flex items-center text-sm font-medium text-stone-700 hover:text-blue-700 transition-colors group">
                              <Settings2 className="w-4 h-4 mr-2 text-blue-500 opacity-50 group-hover:opacity-100 transition-opacity" /> 
                              Automatic Cars
                            </Link>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Services</h4>
                          <div className="space-y-3">
                            <Link to="/sell" onClick={() => setMoreOpen(false)} className="flex items-center text-sm font-medium text-stone-700 hover:text-blue-700 transition-colors group">
                              Sell Your Car <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-all text-blue-600" />
                            </Link>
                            <Link to="/terms" onClick={() => setMoreOpen(false)} className="flex items-center text-sm font-medium text-stone-700 hover:text-blue-700 transition-colors group">
                              Terms of Service <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-all text-blue-600" />
                            </Link>
                            <Link to="/privacy" onClick={() => setMoreOpen(false)} className="flex items-center text-sm font-medium text-stone-700 hover:text-blue-700 transition-colors group">
                              Privacy Policy <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-all text-blue-600" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </nav>

            {/* Global Search Bar (Only for non-admin) / Admin Control Center Badge */}
            {user?.role !== "admin" ? (
              <div className="hidden lg:flex flex-1 max-w-2xl ml-8 relative">
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget);
                    const q = fd.get("q");
                    if (q) window.location.href = `/cars?q=${encodeURIComponent(q.toString())}`;
                  }}
                  className="w-full relative group"
                >
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-blue-600 transition-colors" />
                  <input 
                    name="q"
                    type="text" 
                    placeholder="Search by brand, model, or variant..." 
                    className="w-full bg-slate-50 border border-slate-200/90 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-stone-500"
                  />
                </form>
              </div>
            ) : (
              <div className="hidden lg:flex flex-1 items-center justify-start ml-8">
                <div className="inline-flex items-center space-x-2 text-xs font-mono font-bold text-blue-900 bg-blue-50/90 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800 px-3.5 py-1.5 rounded-full">
                  <Shield className="w-3.5 h-3.5 text-blue-600" />
                  <span>Admin Workspace • Full Platform Oversight</span>
                </div>
              </div>
            )}

            {/* Desktop Right Actions */}
            <div className="hidden lg:flex items-center space-x-4 ml-8">

              {user && (
                <div className="relative" ref={notifRef}>
                  <button
                    type="button"
                    onClick={() => setNotifOpen(!notifOpen)}
                    aria-label="Notifications"
                    aria-expanded={notifOpen}
                    aria-haspopup="true"
                    className={`relative p-2.5 rounded-full transition-all flex items-center justify-center border ${
                      notifOpen
                        ? "text-blue-700 bg-blue-50 border-blue-300 dark:bg-stone-800"
                        : "text-stone-500 hover:text-blue-700 hover:bg-blue-50/60 border-transparent hover:border-blue-200"
                    }`}
                  >
                    <Bell className="w-5 h-5" />
                    {unread && unread.count > 0 && (
                      <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                        {unread.count > 9 ? "9+" : unread.count}
                      </span>
                    )}
                  </button>
                  {notifOpen && <NotificationDropdown onClose={() => setNotifOpen(false)} align="right" />}
                </div>
              )}

              {user ? (
                <div className="relative" ref={menuRef}>
                  <button
                    type="button"
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-expanded={menuOpen}
                    aria-haspopup="true"
                    aria-label="User account menu"
                    className="flex items-center space-x-2.5 rounded-full border border-stone-200 bg-white px-3 py-1.5 transition-all hover:bg-blue-50/40 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-900 text-white">
                      <UserIcon className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-bold text-stone-700 pr-1 max-w-[120px] truncate">{user.name}</span>
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 mt-3 w-56 origin-top-right rounded-2xl bg-white shadow-xl ring-1 ring-stone-900/5 focus:outline-none z-50 overflow-hidden border border-blue-100 animate-in fade-in zoom-in-95 duration-150">
                      <div className="p-4 border-b border-stone-100 bg-slate-50/60">
                        <p className="text-xs text-stone-500 font-medium mb-0.5">Signed in as</p>
                        <p className="text-sm font-bold text-stone-900 truncate">{user.email}</p>
                        <p className="text-[10px] uppercase tracking-wider text-blue-700 font-bold mt-1.5">{user.role}</p>
                      </div>
                      <div className="py-2">
                        {user.role === "admin" ? (
                          <>
                            <Link to="/admin" className="flex w-full items-center px-4 py-2.5 text-sm font-medium text-stone-700 hover:bg-blue-50/70 hover:text-blue-900 transition-colors" onClick={() => setMenuOpen(false)}>
                              <Shield className="w-4 h-4 mr-2.5 text-blue-600" />
                              Admin Dashboard
                            </Link>
                            <Link to="/account" className="flex w-full items-center px-4 py-2.5 text-sm font-medium text-stone-700 hover:bg-blue-50/70 hover:text-blue-900 transition-colors" onClick={() => setMenuOpen(false)}>
                              <UserIcon className="w-4 h-4 mr-2.5 text-blue-600" />
                              My Account
                            </Link>
                          </>
                        ) : (
                          <>
                            {user.role === "seller" && (
                              <Link to="/dashboard" className="flex w-full items-center px-4 py-2.5 text-sm font-medium text-stone-700 hover:bg-blue-50/70 hover:text-blue-900 transition-colors" onClick={() => setMenuOpen(false)}>
                                <LayoutDashboard className="w-4 h-4 mr-2.5 text-blue-600" />
                                Seller Dashboard
                              </Link>
                            )}
                            <Link to="/account" className="flex w-full items-center px-4 py-2.5 text-sm font-medium text-stone-700 hover:bg-blue-50/70 hover:text-blue-900 transition-colors" onClick={() => setMenuOpen(false)}>
                              <UserIcon className="w-4 h-4 mr-2.5 text-blue-600" />
                              My Account
                            </Link>
                            <Link to="/enquiries" className="flex w-full items-center px-4 py-2.5 text-sm font-medium text-stone-700 hover:bg-blue-50/70 hover:text-blue-900 transition-colors" onClick={() => setMenuOpen(false)}>
                              <MessageSquare className="w-4 h-4 mr-2.5 text-blue-600" />
                              My Enquiries
                            </Link>
                            <Link to="/favourites" className="flex w-full items-center px-4 py-2.5 text-sm font-medium text-stone-700 hover:bg-blue-50/70 hover:text-blue-900 transition-colors" onClick={() => setMenuOpen(false)}>
                              <Heart className="w-4 h-4 mr-2.5 text-blue-600" />
                              Saved Shortlist
                            </Link>
                          </>
                        )}
                        <hr className="my-1 border-stone-100" />
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="flex w-full items-center px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="mr-2.5 h-4 w-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setAuthOpen("login")}
                    className="px-4 py-2 text-sm font-bold tracking-wide text-stone-600 hover:text-blue-900 transition-colors"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => setAuthOpen("signup")}
                    className="rounded-lg bg-blue-900 px-5 py-2 text-sm font-bold tracking-wide text-white transition-all hover:bg-blue-950 shadow-md hover:shadow-lg focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button & Notifications */}
            <div className="flex items-center space-x-3 lg:hidden">
              {user && (
                <div className="relative" ref={mobileNotifRef}>
                  <button
                    type="button"
                    onClick={() => setNotifOpen(!notifOpen)}
                    aria-label="Notifications"
                    aria-expanded={notifOpen}
                    aria-haspopup="true"
                    className="relative text-stone-500 hover:text-blue-600 transition-colors p-1.5 rounded-lg hover:bg-blue-50/60"
                  >
                    <Bell className="w-6 h-6" />
                    {unread && unread.count > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                        {unread.count > 9 ? "9+" : unread.count}
                      </span>
                    )}
                  </button>
                  {notifOpen && <NotificationDropdown onClose={() => setNotifOpen(false)} align="right" />}
                </div>
              )}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg focus:outline-none"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileOpen && (
          <div className="lg:hidden bg-white border-b border-stone-200 transition-all fixed w-full h-[calc(100vh-80px)] overflow-y-auto pb-20">
            {user?.role !== "admin" && (
              <div className="p-4 bg-slate-50/70 border-b border-stone-200 mb-2">
                <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">Your City</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {INDIAN_CITIES.map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        setCity(c);
                      }}
                      className={`text-left px-3 py-2 text-sm rounded-lg border transition-colors ${
                        c === city ? "bg-blue-50 border-blue-200 text-blue-700 font-bold" : "bg-white border-stone-200 text-stone-600"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="px-4 py-4 space-y-2">
              <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">Navigation</p>
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl text-base font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'bg-blue-50 text-blue-700 font-bold'
                      : 'text-stone-600 hover:bg-blue-50/50 hover:text-blue-900 border border-transparent'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
              
              {user?.role !== "admin" && (
                <Link
                  to="/cars?sort=newest"
                  onClick={() => setMobileOpen(false)}
                  className="w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl text-base font-medium text-stone-600 hover:bg-blue-50/50 hover:text-blue-900 border border-transparent transition-colors"
                >
                  <Zap className="w-5 h-5 text-blue-500" />
                  <span>New Arrivals</span>
                </Link>
              )}
            </div>

            <div className="px-4 py-4 mt-2 border-t border-stone-100">
              {!user ? (
                <div className="flex flex-col space-y-3">
                  <button
                    onClick={() => { setMobileOpen(false); setAuthOpen("login"); }}
                    className="w-full py-3.5 text-center text-sm font-bold tracking-wide text-stone-700 bg-stone-100 hover:bg-blue-50 hover:text-blue-900 rounded-xl transition-colors"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => { setMobileOpen(false); setAuthOpen("signup"); }}
                    className="w-full py-3.5 text-center text-sm font-bold tracking-wide text-white bg-blue-900 hover:bg-blue-950 rounded-xl transition-colors shadow-md"
                  >
                    Sign Up
                  </button>
                </div>
              ) : (
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center space-x-3 px-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-900 text-white">
                      <UserIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-stone-900">{user.name}</p>
                      <p className="text-[10px] uppercase tracking-wider text-blue-700 font-bold">{user.role}</p>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-1 pt-2 border-t border-stone-100">
                    {user.role === "admin" ? (
                      <>
                        <Link
                          to="/admin"
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-stone-700 hover:bg-blue-50/70 hover:text-blue-900"
                        >
                          <Shield className="w-4 h-4 text-blue-600" />
                          <span>Admin Dashboard</span>
                        </Link>
                        <Link
                          to="/account"
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-stone-700 hover:bg-blue-50/70 hover:text-blue-900"
                        >
                          <UserIcon className="w-4 h-4 text-blue-600" />
                          <span>My Account</span>
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/account"
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-stone-700 hover:bg-blue-50/70 hover:text-blue-900"
                        >
                          <UserIcon className="w-4 h-4 text-blue-600" />
                          <span>My Account</span>
                        </Link>
                        {user.role === "seller" && (
                          <Link
                            to="/dashboard"
                            onClick={() => setMobileOpen(false)}
                            className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-stone-700 hover:bg-blue-50/70 hover:text-blue-900"
                          >
                            <LayoutDashboard className="w-4 h-4 text-blue-600" />
                            <span>Seller Dashboard</span>
                          </Link>
                        )}
                        <Link
                          to="/enquiries"
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-stone-700 hover:bg-blue-50/70 hover:text-blue-900"
                        >
                          <MessageSquare className="w-4 h-4 text-blue-600" />
                          <span>My Enquiries</span>
                        </Link>
                        <Link
                          to="/favourites"
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-stone-700 hover:bg-blue-50/70 hover:text-blue-900"
                        >
                          <Heart className="w-4 h-4 text-blue-600" />
                          <span>Saved Shortlist</span>
                        </Link>
                      </>
                    )}
                  </div>

                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center justify-center space-x-2 py-3.5 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {authOpen && (
        <AuthModal
          mode={authOpen}
          onClose={() => setAuthOpen(null)}
          onSwitchMode={(m) => setAuthOpen(m)}
          onSuccess={() => setAuthOpen(null)}
        />
      )}
    </>
  );
}
