import { Loader2, ShieldCheck, ChevronLeft, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

export function formatINR(value: string | number): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (Number.isNaN(num)) return String(value);
  if (num >= 100000) {
    return `₹${(num / 100000).toLocaleString("en-IN", { maximumFractionDigits: 2 })} lakh`;
  }
  return `₹${num.toLocaleString("en-IN")}`;
}

export function formatKm(km: number): string {
  return `${km.toLocaleString("en-IN")} km`;
}

export function VerifiedPlate({ label = "VERIFIED" }: { label?: string }) {
  return (
    <span className="qz-plate" title="Identity and documents verified by Luxura Motors">
      <span className="qz-plate__tab">
        <ShieldCheck size={11} strokeWidth={2.5} />
      </span>
      <span className="qz-plate__text">{label}</span>
    </span>
  );
}

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-fog text-slate",
  pending_review: "bg-blue-100 text-blue-800",
  active: "bg-signal-100 text-signal-700",
  sold: "bg-ignition-100 text-ignition-700",
  suspended: "bg-ember-100 text-ember-700",
  new: "bg-ignition-100 text-ignition-700",
  seller_responded: "bg-signal-100 text-signal-700",
  closed: "bg-fog text-slate",
  pending: "bg-blue-100 text-blue-800",
  approved: "bg-signal-100 text-signal-700",
  rejected: "bg-ember-100 text-ember-700",
  open: "bg-blue-100 text-blue-800",
  resolved: "bg-signal-100 text-signal-700",
  dismissed: "bg-fog text-slate",
  initiated: "bg-blue-100 text-blue-800",
  success: "bg-signal-100 text-signal-700",
  failed: "bg-ember-100 text-ember-700",
  refunded: "bg-fog text-slate",
  active_sub: "bg-signal-100 text-signal-700",
};

const STATUS_LABELS: Record<string, string> = {
  pending_review: "Pending review",
  seller_responded: "Seller replied",
};

export function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? "bg-fog text-slate";
  const label = STATUS_LABELS[status] ?? status.replace(/_/g, " ");
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${style}`}>
      {label}
    </span>
  );
}

export function Spinner({ size = 20 }: { size?: number }) {
  return <Loader2 size={size} className="animate-spin text-ignition-500" />;
}

export function LoadingBlock({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate">
      <Spinner size={28} />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function EmptyState({ icon, title, body, action }: { icon?: ReactNode; title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-fog bg-white/60 px-6 py-16 text-center">
      {icon && <div className="text-mist">{icon}</div>}
      <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
      {body && <p className="max-w-sm text-sm text-slate">{body}</p>}
      {action}
    </div>
  );
}

export function ErrorNote({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-ember-200 bg-ember-50 px-4 py-3 text-sm text-ember-700 break-words whitespace-pre-wrap">{message}</div>
  );
}


export function Pagination({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
}: {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  if (totalPages <= 1) return null;

  const pages = [];
  // Simple logic for small number of pages
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - 1 && i <= currentPage + 1)
    ) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  return (
    <div className="flex items-center justify-center space-x-2 mt-8 mb-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg border border-stone-200 hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      
      {pages.map((p, idx) => (
        <button
          key={idx}
          disabled={p === '...'}
          onClick={() => typeof p === 'number' && onPageChange(p)}
          className={"w-10 h-10 rounded-lg text-sm font-medium transition-colors " + (
            p === currentPage
              ? 'bg-blue-900 text-white'
              : p === '...'
              ? 'cursor-default text-stone-400'
              : 'border border-stone-200 hover:bg-stone-50 text-stone-700'
          )}
        >
          {p}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg border border-stone-200 hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

