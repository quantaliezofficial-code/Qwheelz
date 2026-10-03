import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, ArrowUpRight, ShieldCheck, HeartHandshake, Star } from "lucide-react";
import { useAuth } from "../lib/auth";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  return (
    <footer className="bg-slate-50/80 text-stone-500 border-t border-blue-100/80 pt-16 pb-8 font-sans" id="app-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Info */}
          <div className="space-y-4">
            <Link to={isAdmin ? "/admin" : "/"} className="flex items-center gap-2 group">
              <img
                src="/logo-wide.png"
                alt="QWheelz"
                className="h-10 w-auto object-contain"
              />
              {isAdmin && (
                <span className="text-xs font-bold tracking-wider text-blue-600 border-l border-blue-200 pl-2">
                  ADMIN
                </span>
              )}
            </Link>
            <p className="text-sm leading-relaxed text-stone-500">
              {isAdmin
                ? "QWheelz Administrative & Moderation System. Platform oversight, verification review, and platform governance."
                : "India’s certified pre-owned automobile network. 200-point inspection certificates, verified ownership, zero hidden fees, and hassle-free doorstep delivery."}
            </p>
            <div className="flex space-x-4 pt-2">
            </div>
          </div>

          {/* Quick Nav */}
          <div>
            <h3 className="text-sm font-semibold tracking-wider text-blue-950 uppercase mb-6 border-l-2 border-blue-600 pl-3">
              {isAdmin ? "Admin Navigation" : "Explore Showroom"}
            </h3>
            <ul className="space-y-3 text-sm">
              {(isAdmin
                ? [
                    { label: "Admin Dashboard", path: "/admin" },
                    { label: "Platform Account", path: "/account" },
                    { label: "Privacy Policy", path: "/privacy" },
                    { label: "Terms of Service", path: "/terms" },
                  ]
                : [
                    { label: "Premium Inventory", path: "/cars" },
                    { label: "Sell Your Vehicle", path: "/sell" },
                    { label: "Privacy Policy", path: "/privacy" },
                    { label: "Terms of Service", path: "/terms" },
                  ]
              ).map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.path}
                    className="hover:text-blue-600 transition-colors flex items-center space-x-1 group"
                  >
                    <span>{link.label}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-sm font-semibold tracking-wider text-blue-950 uppercase mb-6 border-l-2 border-blue-600 pl-3">
              Lucknow Flagship Store
            </h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 mt-1 text-blue-600 shrink-0" />
                <span className="text-stone-600">
                  Luxura Experience Center, Shaheed Path, Gomti Nagar Ext., Lucknow, Uttar Pradesh - 226010
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="text-stone-600">+91 522 400 8888 / +91 98390 12345</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="text-stone-600">lucknow@luxuramotors.com</span>
              </li>
            </ul>
          </div>

          {/* Core Guarantees */}
          <div className="space-y-4 bg-white border border-blue-100/90 p-5 rounded-lg shadow-sm">
            <h3 className="text-sm font-semibold tracking-wider text-blue-950 uppercase mb-2 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Luxura Indian Assurance</span>
            </h3>
            <div className="text-xs text-stone-500 space-y-3 leading-relaxed">
              <p className="flex items-center space-x-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-600" />
                <span>200-Point Structural & ECU Inspection</span>
              </p>
              <p className="flex items-center space-x-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-600" />
                <span>100% RTO RC Transfer Included</span>
              </p>
              <p className="flex items-center space-x-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-600" />
                <span>0% Brokerage & Zero Hidden Charges</span>
              </p>
              <p className="flex items-center space-x-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-600" />
                <span>Insured Doorstep Delivery Across India</span>
              </p>
            </div>
            <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
              <span className="flex items-center space-x-1">
                <HeartHandshake className="w-3.5 h-3.5 text-blue-600" />
                <span>Verified Dealership</span>
              </span>
              <span className="text-blue-700 font-mono font-bold flex items-center space-x-1">
                <Star className="w-3 h-3 text-blue-600 fill-current" />
                <span>4.9/5 Rating</span>
              </span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-stone-200/80 my-8 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-stone-400">
          <p>© {currentYear} QWheelz Technologies Pvt Ltd. All Rights Reserved. India’s Certified Pre-Owned Automobile Network.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/privacy" className="hover:text-blue-600 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-blue-600 transition-colors">Terms of Use</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
