import { useState } from "react";
import {
  AlertTriangle, BarChart3, CheckCircle2, ClipboardList, FileClock, Flag, ShieldCheck, Star, Users2, Wallet, XCircle, Calendar, HelpCircle, Send, MessageSquare, Clock, Check
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useAdminOverview, useAdminUsers, useAdminListings, useAdminVerifications, useAdminPayments,
  useAdminSubscriptions, useAdminReports, useAdminReviews, useAdminAuditLog, useAdminActions,
} from "../hooks/useAdmin";
import { appointmentsApi } from "../lib/api/appointments";
import { supportApi } from "../lib/api/support";
import type { Appointment, AppointmentStatus, SupportTicket, SupportTicketStatus } from "../types";
import { EmptyState, formatINR, LoadingBlock, StatusBadge, VerifiedPlate } from "../components/ui";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from 'recharts';

type Tab = "overview" | "approvals" | "listings" | "users" | "appointments" | "support" | "finance" | "reports" | "reviews" | "audit";

const TABS: { value: Tab; label: string; icon: any }[] = [
  { value: "overview", label: "Overview", icon: BarChart3 },
  { value: "approvals", label: "Approval Queue", icon: ClipboardList },
  { value: "listings", label: "Vehicles", icon: ShieldCheck },
  { value: "users", label: "Users", icon: Users2 },
  { value: "appointments", label: "Appointments", icon: Calendar },
  { value: "support", label: "Support Tickets", icon: HelpCircle },
  { value: "finance", label: "Finance", icon: Wallet },
  { value: "reports", label: "Reports", icon: Flag },
  { value: "reviews", label: "Reviews", icon: Star },
  { value: "audit", label: "Audit Log", icon: FileClock },
];

export function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("overview");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-2xl font-bold text-ink">Admin Console</h1>
      <p className="mt-1 text-sm text-slate">Platform oversight and administration for QWheelz pre-owned vehicle network.</p>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
        <nav className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
          {TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-semibold ${tab === t.value ? "bg-ignition-500 text-white" : "text-ink hover:bg-paper"}`}
            >
              <t.icon size={15} /> {t.label}
            </button>
          ))}
        </nav>

        <div>
          {tab === "overview" && <OverviewTab />}
          {tab === "approvals" && <ApprovalsTab />}
          {tab === "listings" && <ListingsTab />}
          {tab === "users" && <UsersTab />}
          {tab === "appointments" && <AppointmentsTab />}
          {tab === "support" && <SupportAdminTab />}
          {tab === "finance" && <FinanceTab />}
          {tab === "reports" && <ReportsTab />}
          {tab === "reviews" && <ReviewsTab />}
          {tab === "audit" && <AuditTab />}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="qz-card p-4">
      <p className="text-xs text-slate">{label}</p>
      <p className="qz-mono mt-1 text-2xl font-bold text-ink">{value}</p>
    </div>
  );
}

function OverviewTab() {
  const { data, isLoading } = useAdminOverview();
  if (isLoading || !data) return <LoadingBlock />;

  // Mock data for charts
  const monthlyData = [
    { name: 'Jan', revenue: 4000, listings: 24 },
    { name: 'Feb', revenue: 3000, listings: 13 },
    { name: 'Mar', revenue: 2000, listings: 98 },
    { name: 'Apr', revenue: 2780, listings: 39 },
    { name: 'May', revenue: 1890, listings: 48 },
    { name: 'Jun', revenue: 2390, listings: 38 },
    { name: 'Jul', revenue: 3490, listings: 43 },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard label="Total users" value={data.total_users} />
        <StatCard label="Verified sellers" value={data.active_sellers} />
        <StatCard label="Verified dealers" value={data.active_dealers} />
        <StatCard label="Active listings" value={data.listings_active} />
        <StatCard label="Pending review" value={data.listings_pending_review} />
        <StatCard label="Cars sold" value={data.listings_sold} />
        <StatCard label="Total enquiries" value={data.total_enquiries} />
        <StatCard label="Pending verifications" value={data.pending_seller_verifications} />
        <StatCard label="Open reports" value={data.open_reports} />
        <StatCard label="Active subscriptions" value={data.active_subscriptions} />
        <StatCard label="Revenue" value={formatINR(data.revenue_total_inr)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
          <h3 className="font-bold text-stone-900 mb-6">Revenue Trend (₹)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#78716c', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#78716c', fontSize: 12}} />
                <Tooltip cursor={{fill: '#fafaf9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Line type="monotone" dataKey="revenue" stroke="#d97706" strokeWidth={3} dot={{r: 4, fill: '#d97706', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
          <h3 className="font-bold text-stone-900 mb-6">New Listings</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#78716c', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#78716c', fontSize: 12}} />
                <Tooltip cursor={{fill: '#fafaf9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="listings" fill="#292524" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReasonPrompt({ onSubmit }: { onSubmit: (reason: string) => void }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  if (!open) return <button onClick={() => setOpen(true)} className="rounded-lg border border-ember-200 px-2.5 py-1.5 text-xs font-semibold text-ember-600 hover:bg-ember-50"><XCircle size={12} className="mr-1 inline" />Reject</button>;
  return (
    <div className="flex items-center gap-1">
      <input autoFocus value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason…" className="qz-input w-32 px-2 py-1 text-xs" />
      <button onClick={() => reason.trim() && onSubmit(reason)} className="rounded-lg bg-ember-500 px-2 py-1 text-xs font-semibold text-white">Send</button>
    </div>
  );
}

function ApprovalsTab() {
  const { data: pendingListings, isLoading: l1 } = useAdminListings("pending_review");
  const { data: pendingVerifications, isLoading: l2 } = useAdminVerifications("pending");
  const actions = useAdminActions();

  if (l1 || l2) return <LoadingBlock />;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h3 className="mb-3 font-display font-semibold text-ink">Pending listings ({pendingListings?.length ?? 0})</h3>
        {!pendingListings || pendingListings.length === 0 ? (
          <EmptyState title="Nothing pending" body="New and edited listings will show up here for review." />
        ) : (
          <div className="flex flex-col gap-2">
            {pendingListings.map((listing) => (
              <div key={listing.id} className="qz-card flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-semibold text-ink">{listing.title}</p>
                  <p className="text-xs text-slate">{formatINR(listing.price)} · {listing.city} · by {listing.seller.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => actions.approveListing.mutate([listing.id])} className="rounded-lg bg-signal-500 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-signal-600"><CheckCircle2 size={12} className="mr-1 inline" />Approve</button>
                  <ReasonPrompt onSubmit={(reason) => actions.rejectListing.mutate([listing.id, reason])} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="mb-3 font-display font-semibold text-ink">Pending seller verifications ({pendingVerifications?.length ?? 0})</h3>
        {!pendingVerifications || pendingVerifications.length === 0 ? (
          <EmptyState title="Nothing pending" body="New seller applications will show up here." />
        ) : (
          <div className="flex flex-col gap-2">
            {pendingVerifications.map((v) => (
              <div key={v.id} className="qz-card flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-semibold capitalize text-ink">{v.seller_type} seller{v.business_name ? ` — ${v.business_name}` : ""}</p>
                  <p className="text-xs text-slate">Submitted {new Date(v.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => actions.approveVerification.mutate([v.id])} className="rounded-lg bg-signal-500 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-signal-600"><CheckCircle2 size={12} className="mr-1 inline" />Approve</button>
                  <ReasonPrompt onSubmit={(reason) => actions.rejectVerification.mutate([v.id, reason])} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ListingsTab() {
  const [status, setStatus] = useState<string | undefined>(undefined);
  const { data, isLoading } = useAdminListings(status);
  const actions = useAdminActions();

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {[undefined, "active", "pending_review", "draft", "suspended", "sold"].map((s) => (
          <button key={s ?? "all"} onClick={() => setStatus(s)} className={`rounded-full border px-3 py-1.5 text-xs font-semibold capitalize ${status === s ? "border-ignition-500 bg-ignition-500 text-white" : "border-fog text-ink"}`}>
            {s?.replace("_", " ") ?? "All"}
          </button>
        ))}
      </div>

      {isLoading ? <LoadingBlock /> : !data || data.length === 0 ? <EmptyState title="No listings" /> : (
        <div className="flex flex-col gap-2">
          {data.map((listing) => (
            <div key={listing.id} className="qz-card flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="font-semibold text-ink">{listing.title}</p>
                <p className="text-xs text-slate">{formatINR(listing.price)} · {listing.city} · by {listing.seller.name}</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={listing.status} />
                {listing.status === "active" && (
                  <ReasonPrompt onSubmit={(reason) => actions.suspendListing.mutate([listing.id, reason])} />
                )}
                {listing.status === "suspended" && (
                  <button onClick={() => actions.reactivateListing.mutate([listing.id])} className="rounded-lg bg-signal-500 px-2.5 py-1.5 text-xs font-semibold text-white">Reactivate</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function UsersTab() {
  const [role, setRole] = useState<string | undefined>(undefined);
  const { data, isLoading } = useAdminUsers({ role });
  const actions = useAdminActions();

  return (
    <div>
      <div className="mb-4 flex gap-2">
        {[undefined, "buyer", "seller", "admin"].map((r) => (
          <button key={r ?? "all"} onClick={() => setRole(r)} className={`rounded-full border px-3 py-1.5 text-xs font-semibold capitalize ${role === r ? "border-ignition-500 bg-ignition-500 text-white" : "border-fog text-ink"}`}>
            {r ?? "All"}
          </button>
        ))}
      </div>
      {isLoading ? <LoadingBlock /> : !data || data.length === 0 ? <EmptyState title="No users" /> : (
        <div className="qz-card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead><tr className="border-b border-fog text-xs uppercase text-slate"><th className="px-4 py-3">Name</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Contact</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th></tr></thead>
            <tbody>
              {data.map((u) => (
                <tr key={u.id} className="border-b border-fog last:border-0">
                  <td className="px-4 py-3 font-medium text-ink">{u.name} {u.is_verified && <VerifiedPlate label="OK" />}</td>
                  <td className="px-4 py-3 capitalize">{u.role}{u.seller_type ? ` · ${u.seller_type}` : ""}</td>
                  <td className="px-4 py-3 text-xs text-slate">{u.email ?? u.phone}</td>
                  <td className="px-4 py-3">{u.role === "admin" ? <StatusBadge status="active" /> : <StatusBadge status="active" />}</td>
                  <td className="px-4 py-3">
                    {u.role !== "admin" && <ReasonPrompt onSubmit={(reason) => actions.suspendUser.mutate([u.id, reason])} />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function FinanceTab() {
  const { data: payments, isLoading: l1 } = useAdminPayments("initiated");
  const { data: subs, isLoading: l2 } = useAdminSubscriptions();
  const actions = useAdminActions();

  if (l1 || l2) return <LoadingBlock />;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h3 className="mb-3 font-display font-semibold text-ink">Payments awaiting confirmation</h3>
        {!payments || payments.length === 0 ? <EmptyState title="Nothing to confirm" body="Offline payments a seller has initiated will appear here." /> : (
          <div className="flex flex-col gap-2">
            {payments.map((p) => (
              <div key={p.id} className="qz-card flex items-center justify-between p-4">
                <div>
                  <p className="qz-mono font-semibold text-ink">{formatINR(p.amount)}</p>
                  <p className="text-xs capitalize text-slate">{p.purpose.replace("_", " ")} · {new Date(p.created_at).toLocaleDateString()}</p>
                </div>
                <button onClick={() => actions.confirmPayment.mutate([p.id])} className="rounded-lg bg-signal-500 px-3 py-1.5 text-xs font-semibold text-white">Confirm received</button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div>
        <h3 className="mb-3 font-display font-semibold text-ink">Active subscriptions ({subs?.filter((s) => s.status === "active").length ?? 0})</h3>
        {!subs || subs.length === 0 ? <EmptyState title="No subscriptions yet" /> : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {subs.map((s) => (
              <div key={s.id} className="qz-card p-4">
                <p className="font-semibold capitalize text-ink">{s.plan.replace(/_/g, " ")}</p>
                <StatusBadge status={s.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ReportsTab() {
  const [status, setStatus] = useState<string | undefined>("open");
  const { data, isLoading } = useAdminReports(status);
  const actions = useAdminActions();

  return (
    <div>
      <div className="mb-4 flex gap-2">
        {["open", "resolved", "dismissed"].map((s) => (
          <button key={s} onClick={() => setStatus(s)} className={`rounded-full border px-3 py-1.5 text-xs font-semibold capitalize ${status === s ? "border-ignition-500 bg-ignition-500 text-white" : "border-fog text-ink"}`}>{s}</button>
        ))}
      </div>
      {isLoading ? <LoadingBlock /> : !data || data.length === 0 ? <EmptyState icon={<AlertTriangle size={28} />} title="No reports" /> : (
        <div className="flex flex-col gap-2">
          {data.map((r) => (
            <div key={r.id} className="qz-card flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="text-sm font-semibold capitalize text-ink">{r.entity_type} report by {r.reporter.name}</p>
                <p className="text-xs text-slate">{r.reason}</p>
              </div>
              {r.status === "open" && (
                <div className="flex gap-2">
                  <button onClick={() => actions.resolveReport.mutate([r.id, "resolved"])} className="rounded-lg bg-signal-500 px-2.5 py-1.5 text-xs font-semibold text-white">Resolve</button>
                  <button onClick={() => actions.resolveReport.mutate([r.id, "dismissed"])} className="rounded-lg border border-fog px-2.5 py-1.5 text-xs font-semibold text-ink">Dismiss</button>
                </div>
              )}
              {r.status !== "open" && <StatusBadge status={r.status} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ReviewsTab() {
  const { data, isLoading } = useAdminReviews();
  const actions = useAdminActions();

  if (isLoading) return <LoadingBlock />;
  if (!data || data.length === 0) return <EmptyState title="No reviews yet" />;

  return (
    <div className="flex flex-col gap-2">
      {data.map((r) => (
        <div key={r.id} className="qz-card flex items-start justify-between gap-3 p-4">
          <div>
            <p className="text-sm font-semibold text-ink">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)} <span className="text-slate">by {r.buyer.name}</span></p>
            <p className="mt-1 text-sm text-slate">{r.content}</p>
          </div>
          <button onClick={() => actions.deleteReview.mutate([r.id])} className="shrink-0 rounded-lg border border-ember-200 px-2.5 py-1.5 text-xs font-semibold text-ember-600 hover:bg-ember-50">Remove</button>
        </div>
      ))}
    </div>
  );
}

function AuditTab() {
  const { data, isLoading } = useAdminAuditLog();
  if (isLoading) return <LoadingBlock />;
  if (!data || data.length === 0) return <EmptyState title="No activity yet" />;

  return (
    <div className="qz-card divide-y divide-fog">
      {data.map((entry) => (
        <div key={entry.id} className="flex items-center justify-between px-4 py-3 text-sm">
          <div>
            <span className="font-semibold capitalize text-ink">{entry.action.replace(/_/g, " ")}</span>
            <span className="ml-2 text-xs text-slate">{entry.entity_type}</span>
          </div>
          <span className="qz-mono text-xs text-slate">{new Date(entry.created_at).toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

function AppointmentsTab() {
  const [filter, setFilter] = useState<string>("all");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-appointments", filter],
    queryFn: () =>
      appointmentsApi.adminList({
        status: filter === "all" ? undefined : (filter as AppointmentStatus),
      }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: AppointmentStatus }) =>
      appointmentsApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-appointments"] });
    },
  });

  if (isLoading) return <LoadingBlock />;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-bold text-ink">Platform Appointments & Test Drives</h2>
          <p className="text-xs text-slate">Monitor scheduled test drives and inspections across all sellers.</p>
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="qz-input rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-semibold"
        >
          <option value="all">All Statuses</option>
          <option value="requested">Requested</option>
          <option value="confirmed">Confirmed</option>
          <option value="rescheduled">Rescheduled</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {!data || data.length === 0 ? (
        <EmptyState title="No appointments match this filter" />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 uppercase font-bold text-slate">
              <tr>
                <th className="p-3.5">Vehicle</th>
                <th className="p-3.5">Type</th>
                <th className="p-3.5">Buyer</th>
                <th className="p-3.5">Seller</th>
                <th className="p-3.5">Schedule</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {data.map((appt: Appointment) => (
                <tr key={appt.id} className="hover:bg-stone-50/60">
                  <td className="p-3.5 font-bold text-ink max-w-[180px] truncate">
                    {appt.listing_title}
                  </td>
                  <td className="p-3.5 uppercase font-semibold text-slate">
                    {appt.appointment_type === "test_drive" ? "Test Drive" : "Inspection"}
                  </td>
                  <td className="p-3.5 text-slate">
                    <p className="font-semibold text-ink">{appt.buyer_name}</p>
                    <p className="text-[10px]">{appt.buyer_phone}</p>
                  </td>
                  <td className="p-3.5 text-slate">
                    <p className="font-semibold text-ink">{appt.seller_name}</p>
                    <p className="text-[10px]">{appt.seller_phone}</p>
                  </td>
                  <td className="p-3.5 text-slate">
                    <p className="font-medium text-ink">
                      {new Date(appt.scheduled_at).toLocaleDateString("en-IN")}
                    </p>
                    <p className="text-[10px] text-blue-700">{appt.time_slot || "Flexible"}</p>
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${
                        appt.status === "confirmed"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : appt.status === "requested"
                          ? "bg-blue-50 text-blue-800 border-blue-200"
                          : appt.status === "completed"
                          ? "bg-stone-100 text-stone-700 border-stone-200"
                          : "bg-amber-50 text-amber-800 border-amber-200"
                      }`}
                    >
                      {appt.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right space-x-1">
                    {appt.status === "requested" && (
                      <button
                        onClick={() => updateStatusMutation.mutate({ id: appt.id, status: "confirmed" })}
                        className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold uppercase"
                      >
                        Confirm
                      </button>
                    )}
                    {appt.status === "confirmed" && (
                      <button
                        onClick={() => updateStatusMutation.mutate({ id: appt.id, status: "completed" })}
                        className="px-2 py-1 bg-blue-900 hover:bg-blue-950 text-white rounded text-[10px] font-bold uppercase"
                      >
                        Complete
                      </button>
                    )}
                    {appt.status !== "cancelled" && appt.status !== "completed" && (
                      <button
                        onClick={() => updateStatusMutation.mutate({ id: appt.id, status: "cancelled" })}
                        className="px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded text-[10px] font-bold uppercase"
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function SupportAdminTab() {
  const [filter, setFilter] = useState<string>("all");
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-support-tickets", filter],
    queryFn: () =>
      supportApi.listTickets({
        status: filter === "all" ? undefined : (filter as SupportTicketStatus),
      }),
  });

  const activeTicketQuery = useQuery({
    queryKey: ["support-ticket", activeTicketId],
    queryFn: () => supportApi.getTicket(activeTicketId!),
    enabled: !!activeTicketId,
  });

  const sendReplyMutation = useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      supportApi.sendMessage(id, content),
    onSuccess: () => {
      setReplyContent("");
      queryClient.invalidateQueries({ queryKey: ["support-ticket", activeTicketId] });
      queryClient.invalidateQueries({ queryKey: ["admin-support-tickets"] });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: SupportTicketStatus }) =>
      supportApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["support-ticket", activeTicketId] });
      queryClient.invalidateQueries({ queryKey: ["admin-support-tickets"] });
    },
  });

  if (isLoading) return <LoadingBlock />;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-bold text-ink">Support & Concierge Operations</h2>
          <p className="text-xs text-slate">Manage tickets submitted by buyers and sellers across the platform.</p>
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="qz-input rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-semibold"
        >
          <option value="all">All Tickets</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {activeTicketId ? (
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100">
            <div>
              <button
                onClick={() => setActiveTicketId(null)}
                className="text-xs font-bold text-blue-700 hover:underline mb-1 cursor-pointer"
              >
                ← Back to Ticket List
              </button>
              <h3 className="text-lg font-bold text-ink">
                {activeTicketQuery.data?.subject || "Support Ticket Thread"}
              </h3>
              <div className="flex items-center gap-2 mt-1 text-xs text-slate">
                <span>User: {activeTicketQuery.data?.user_name} ({activeTicketQuery.data?.user_email || "No email"})</span>
                <span>• Category: {activeTicketQuery.data?.category}</span>
                {activeTicketQuery.data?.listing_title && (
                  <span className="text-blue-700 font-medium">
                    • Vehicle: {activeTicketQuery.data.listing_title}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => updateStatusMutation.mutate({ id: activeTicketId, status: "resolved" })}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Mark Resolved
              </button>
              <button
                onClick={() => updateStatusMutation.mutate({ id: activeTicketId, status: "closed" })}
                className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Close Ticket
              </button>
            </div>
          </div>

          <div className="space-y-3 max-h-[350px] overflow-y-auto qz-scroll p-2">
            {activeTicketQuery.isLoading ? (
              <LoadingBlock />
            ) : (
              activeTicketQuery.data?.messages?.map((msg) => {
                const isStaff = msg.sender_role === "admin";
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isStaff ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl p-3.5 text-xs ${
                        isStaff
                          ? "bg-blue-900 text-white"
                          : "bg-stone-100 text-stone-900"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 mb-1 text-[10px] opacity-75">
                        <span className="font-bold">{msg.sender_name} {isStaff ? "(Admin/Concierge)" : "(User)"}</span>
                        <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="pt-3 border-t border-stone-100 flex gap-2">
            <textarea
              rows={2}
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Type official reply to the user..."
              className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-4 py-2 text-xs text-stone-900 focus:border-blue-600 focus:outline-none resize-none"
            />
            <button
              onClick={() => sendReplyMutation.mutate({ id: activeTicketId, content: replyContent.trim() })}
              disabled={!replyContent.trim() || sendReplyMutation.isPending}
              className="px-5 bg-blue-900 hover:bg-blue-950 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 disabled:opacity-50 transition-all cursor-pointer"
            >
              <Send size={14} /> Reply
            </button>
          </div>
        </div>
      ) : !data || data.length === 0 ? (
        <EmptyState title="No support tickets match this filter" />
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {data.map((ticket: SupportTicket) => (
            <div
              key={ticket.id}
              onClick={() => setActiveTicketId(ticket.id)}
              className="bg-white border border-stone-200 hover:border-blue-500/40 rounded-2xl p-4 shadow-xs flex items-center justify-between cursor-pointer transition-all"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${
                      ticket.status === "open"
                        ? "bg-blue-50 text-blue-800 border-blue-200"
                        : ticket.status === "resolved"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : "bg-stone-100 text-stone-700 border-stone-200"
                    }`}
                  >
                    {ticket.status}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate bg-stone-100 px-2 py-0.5 rounded">
                    {ticket.category}
                  </span>
                  <span className="text-xs text-slate">By {ticket.user_name}</span>
                </div>
                <h4 className="font-bold text-sm text-ink">{ticket.subject}</h4>
                {ticket.listing_title && (
                  <p className="text-xs text-blue-700 font-medium mt-0.5">
                    Vehicle: {ticket.listing_title}
                  </p>
                )}
              </div>
              <div className="text-right text-xs text-slate">
                <p>{new Date(ticket.updated_at).toLocaleDateString("en-IN")}</p>
                <span className="text-blue-700 font-bold">Open thread →</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
