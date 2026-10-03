import { Link } from "react-router-dom";
import { Car } from "lucide-react";

export function NotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-paper text-mist"><Car size={30} /></span>
      <h1 className="mt-6 font-display text-3xl font-bold text-ink">404 — Wrong turn</h1>
      <p className="mt-2 text-sm text-slate">The page you're looking for doesn't exist, or the listing may have been removed.</p>
      <Link to="/" className="qz-btn-primary mt-6 rounded-lg px-6 py-2.5 text-sm font-semibold">Back to home</Link>
    </div>
  );
}
