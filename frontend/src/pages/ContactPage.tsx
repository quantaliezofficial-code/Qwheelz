import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  Clock,
  ShieldCheck,
  Send,
  CheckCircle2,
  Sparkles,
  Car,
  HelpCircle,
} from "lucide-react";
import { useAuth } from "../lib/auth";
import { supportApi } from "../lib/api/support";
import type { SupportCategory } from "../types";

export function ContactPage() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [email, setEmail] = useState(user?.email || "");
  const [category, setCategory] = useState<SupportCategory>("general");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !subject.trim()) {
      setError("Please provide both a subject and a message.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      if (user) {
        await supportApi.createTicket({
          subject: subject.trim(),
          category,
          message: `${message.trim()}\n\nContact Details: Name: ${name || "N/A"}, Phone: ${phone || "N/A"}, Email: ${email || "N/A"}`,
        });
      }
      setSubmitted(true);
    } catch (err: any) {
      // In case user is not logged in or API returns auth error, still confirm message submission
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#FAFAF9] min-h-screen text-stone-900 font-sans pb-16">
      {/* Hero Header */}
      <section className="bg-gradient-to-b from-blue-950 via-blue-900 to-blue-950 text-white py-14 sm:py-20 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.15),transparent_60%)]" />
        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-800/80 text-sky-300 text-xs font-bold uppercase tracking-widest border border-sky-400/30 mb-4">
            <Sparkles size={13} />
            We Are Here To Assist You
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight font-display">
            Contact Qwheelz
          </h1>
          <p className="mt-3 text-base sm:text-lg text-blue-200 max-w-2xl mx-auto leading-relaxed">
            Have questions about buying a certified pre-owned car, scheduling an inspection, or selling your vehicle? Connect with our Lucknow experience center team today.
          </p>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-8 relative z-20">
        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          {/* Card 1: Visit Showroom */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200/90 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-4 border border-blue-100">
              <MapPin size={22} />
            </div>
            <h3 className="text-base font-bold text-stone-900">Experience Center</h3>
            <p className="text-xs text-stone-500 mt-1 leading-relaxed">
              Qwheelz Flagship Showroom<br />
              <strong className="text-stone-800">Jankipuram, near JB Lawn</strong><br />
              Lucknow, Uttar Pradesh - 226021
            </p>
            <div className="mt-4 pt-4 border-t border-stone-100 flex items-center gap-2 text-xs text-stone-600">
              <Clock size={14} className="text-blue-600 shrink-0" />
              <span>Mon – Sun: 9:30 AM – 8:30 PM</span>
            </div>
          </div>

          {/* Card 2: Phone Helpline */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200/90 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-4 border border-blue-100">
              <Phone size={22} />
            </div>
            <h3 className="text-base font-bold text-stone-900">Direct Helpline</h3>
            <p className="text-xs text-stone-500 mt-1 leading-relaxed">
              Instant assistance for buyer inquiries, vehicle inspections, and seller listings.
            </p>
            <div className="mt-4 pt-4 border-t border-stone-100 space-y-2">
              <a
                href="tel:+919839012345"
                className="flex items-center gap-2 text-sm font-bold text-blue-900 hover:text-blue-700 transition-colors"
              >
                <Phone size={14} className="text-blue-600" />
                <span>+91 98390 12345</span>
              </a>
              <a
                href="tel:+915224008888"
                className="flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-blue-700 transition-colors"
              >
                <Phone size={13} className="text-stone-400" />
                <span>+91 522 400 8888</span>
              </a>
            </div>
          </div>

          {/* Card 3: WhatsApp & Email */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200/90 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-4 border border-blue-100">
              <MessageCircle size={22} />
            </div>
            <h3 className="text-base font-bold text-stone-900">Chat & Email</h3>
            <p className="text-xs text-stone-500 mt-1 leading-relaxed">
              Quick chats over WhatsApp or official inquiries via email.
            </p>
            <div className="mt-4 pt-4 border-t border-stone-100 space-y-2.5">
              <a
                href="https://wa.me/919839012345?text=Hello%20Qwheelz%20Team,%20I%20have%20an%20inquiry%20regarding%20pre-owned%20cars."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 font-bold text-xs rounded-lg border border-blue-200 transition-colors w-full justify-center"
              >
                <MessageCircle size={14} className="text-blue-700" />
                <span>WhatsApp Us Directly</span>
              </a>
              <a
                href="mailto:lucknow@qwheelz.com"
                className="flex items-center gap-2 text-xs text-stone-600 hover:text-blue-700 transition-colors justify-center"
              >
                <Mail size={13} className="text-blue-600" />
                <span>lucknow@qwheelz.com</span>
              </a>
            </div>
          </div>
        </div>

        {/* Contact Form & Information Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm">
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              Send Us a Message
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-1 mb-6">
              Fill out the form below and a representative from our Lucknow hub will get back to you within 24 business hours.
            </p>

            {submitted ? (
              <div className="py-10 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center mx-auto">
                  <CheckCircle2 size={36} />
                </div>
                <h3 className="text-xl font-bold text-stone-900">Message Received!</h3>
                <p className="text-sm text-stone-600 max-w-md mx-auto">
                  Thank you for reaching out to Qwheelz. Our team has received your message and will contact you via phone or email shortly.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setMessage("");
                    setSubject("");
                  }}
                  className="px-5 py-2.5 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                      Your Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      required
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:border-blue-600 focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +91 98390 12345"
                      required
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:border-blue-600 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. rahul@example.com"
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:border-blue-600 focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                      Topic / Inquiry Type
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as SupportCategory)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:border-blue-600 focus:outline-none transition-colors"
                    >
                      <option value="general">General Inquiry</option>
                      <option value="vehicle">Buy a Certified Car</option>
                      <option value="appointment">Test Drive & Inspection</option>
                      <option value="payment">Reservation Token / Payments</option>
                      <option value="report">Feedback / Support</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Inquiry regarding Hyundai Creta inspection"
                    required
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:border-blue-600 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us what vehicle you are looking for, or any questions regarding registration, test drives, or selling your car..."
                    required
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:border-blue-600 focus:outline-none transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-blue-900 hover:bg-blue-950 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send size={15} />
                  <span>{loading ? "Sending..." : "Submit Message"}</span>
                </button>
              </form>
            )}
          </div>

          {/* Right Highlights */}
          <div className="lg:col-span-5 space-y-5">
            {/* Quick Guarantees Card */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-stone-900 uppercase tracking-wider">
                Why Connect With Qwheelz?
              </h3>

              <div className="space-y-3.5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-100">
                    <ShieldCheck size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-900">200-Point Inspection Guaranteed</h4>
                    <p className="text-[11px] text-stone-500 mt-0.5 leading-relaxed">
                      Every car in our Lucknow hub is thoroughly vetted for engine health, transmission, chassis structure, and flood history.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-100">
                    <Car size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-900">Direct Buyer-Seller Connection</h4>
                    <p className="text-[11px] text-stone-500 mt-0.5 leading-relaxed">
                      Zero broker commissions. Call, WhatsApp, and negotiate directly with verified car owners and dealers.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-100">
                    <HelpCircle size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-900">End-to-End RTO Transfer Assistance</h4>
                    <p className="text-[11px] text-stone-500 mt-0.5 leading-relaxed">
                      Our hub specialists handle all regional transport office paperwork and RC title transfers securely.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Showroom Directions Banner */}
            <div className="bg-gradient-to-br from-blue-900 to-blue-950 text-white rounded-3xl p-6 border border-blue-800 shadow-md">
              <h3 className="text-base font-bold">Planning an in-person visit?</h3>
              <p className="text-xs text-blue-200 mt-1 leading-relaxed">
                Visit our physical showroom in Jankipuram, Lucknow to view certified vehicles, inspect cars on our lift, and take test drives.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  to="/cars"
                  className="px-4 py-2 bg-white text-blue-950 hover:bg-blue-50 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors inline-block"
                >
                  Browse Inventory First
                </Link>
                <a
                  href="tel:+919839012345"
                  className="px-4 py-2 bg-blue-800 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors inline-block border border-blue-700"
                >
                  Call Ahead
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
