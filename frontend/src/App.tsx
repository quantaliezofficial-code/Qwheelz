import { lazy, Suspense, useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { CompareTray } from "./components/CompareTray";
import { RequireRole } from "./components/RequireRole";
import { HomePage } from "./pages/HomePage";
import { ErrorBoundary } from "./components/ErrorBoundary";

const BrowsePage = lazy(() => import("./pages/BrowsePage").then((m) => ({ default: m.BrowsePage })));
const ListingDetailPage = lazy(() => import("./pages/ListingDetailPage").then((m) => ({ default: m.ListingDetailPage })));
const SellVehiclePage = lazy(() => import("./pages/SellVehiclePage").then((m) => ({ default: m.SellVehiclePage })));
const SellerDashboard = lazy(() => import("./pages/SellerDashboard").then((m) => ({ default: m.SellerDashboard })));
const EnquiriesPage = lazy(() => import("./pages/EnquiriesPage").then((m) => ({ default: m.EnquiriesPage })));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard").then((m) => ({ default: m.AdminDashboard })));
const LoginPage = lazy(() => import("./pages/LoginPage").then((m) => ({ default: m.LoginPage })));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy").then((m) => ({ default: m.PrivacyPolicy })));
const TermsOfService = lazy(() => import("./pages/TermsOfService").then((m) => ({ default: m.TermsOfService })));
const ComparePage = lazy(() => import("./pages/ComparePage").then((m) => ({ default: m.ComparePage })));
const WizardPage = lazy(() => import("./pages/WizardPage").then((m) => ({ default: m.WizardPage })));
const AccountPage = lazy(() => import("./pages/AccountPage").then((m) => ({ default: m.AccountPage })));
const NotFound = lazy(() => import("./pages/NotFound").then((m) => ({ default: m.NotFound })));

function PageFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
    </div>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <ErrorBoundary>
      <div className="flex min-h-screen flex-col bg-paper dark:bg-stone-900 dark:text-stone-100 transition-colors duration-300">
        <ScrollToTop />
        <Header />
        <main className="flex-1">
          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/cars" element={<BrowsePage />} />
              <Route path="/cars/:slug" element={<ListingDetailPage />} />
              <Route path="/compare" element={<ComparePage />} />
              <Route path="/wizard" element={<WizardPage />} />
              <Route path="/sell" element={<SellVehiclePage />} />
              <Route path="/login" element={<LoginPage initialMode="login" />} />
              <Route path="/signup" element={<LoginPage initialMode="signup" />} />
              <Route path="/account" element={<RequireRole role={["buyer", "seller", "admin"]}><AccountPage /></RequireRole>} />
              <Route path="/dashboard" element={<RequireRole role={["seller", "admin"]}><SellerDashboard /></RequireRole>} />
              <Route path="/enquiries" element={<RequireRole role={["buyer", "seller", "admin"]}><EnquiriesPage initialTab="enquiries" /></RequireRole>} />
              <Route path="/favourites" element={<RequireRole role={["buyer", "seller", "admin"]}><EnquiriesPage initialTab="favourites" /></RequireRole>} />
              <Route path="/admin" element={<RequireRole role="admin"><AdminDashboard /></RequireRole>} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>
        <CompareTray />
        <Footer />
      </div>
    </ErrorBoundary>
  );
}
