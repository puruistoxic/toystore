import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import EnquiryPopup, { useEnquiryPopup } from './components/EnquiryPopup';
import ScrollToTop from './components/ScrollToTop';
import ScrollToTopButton from './components/ScrollToTopButton';
import WhatsAppButton from './components/WhatsAppButton';
import ProtectedRoute from './components/admin/ProtectedRoute';
import Home from './pages/Home';
import Services from './pages/Services';
import Products from './pages/Products';
import About from './pages/About';
import Contact from './pages/Contact';
import ProductDetail from './pages/ProductDetail';
import ServiceDetail from './pages/ServiceDetail';
import QuoteRequest from './pages/QuoteRequest';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Refund from './pages/Refund';
import Locations from './pages/Locations';
import LocationDetail from './pages/LocationDetail';
import Brands from './pages/Brands';
import BrandDetail from './pages/BrandDetail';
import Industries from './pages/Industries';
import IndustryDetail from './pages/IndustryDetail';
import CaseStudies from './pages/CaseStudies';
import CaseStudyDetail from './pages/CaseStudyDetail';
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminServices from './pages/admin/Services';
import AdminProducts from './pages/admin/Products';
import AdminLocations from './pages/admin/Locations';
import AdminBrands from './pages/admin/Brands';
import AdminIndustries from './pages/admin/Industries';
import AdminCaseStudies from './pages/admin/CaseStudies';
import AdminTestimonials from './pages/admin/Testimonials';
import AdminCategories from './pages/admin/Categories';
import AdminCountries from './pages/admin/Countries';
import AdminStates from './pages/admin/States';
import AdminLocalities from './pages/admin/Localities';
import StateNew from './pages/admin/StateNew';
import StateEdit from './pages/admin/StateEdit';
import AdminAuditLogs from './pages/admin/AuditLogs';
import ProductNew from './pages/admin/ProductNew';
import ProductEdit from './pages/admin/ProductEdit';
import CategoryNew from './pages/admin/CategoryNew';
import CategoryEdit from './pages/admin/CategoryEdit';
import BrandNew from './pages/admin/BrandNew';
import BrandEdit from './pages/admin/BrandEdit';
import AdminClients from './pages/admin/Clients';
import ClientNew from './pages/admin/ClientNew';
import ClientEdit from './pages/admin/ClientEdit';
import AdminProposals from './pages/admin/Proposals';
import ProposalNew from './pages/admin/ProposalNew';
import ProposalEdit from './pages/admin/ProposalEdit';
import AdminInvoices from './pages/admin/Invoices';
import InvoiceNew from './pages/admin/InvoiceNew';
import InvoiceEdit from './pages/admin/InvoiceEdit';
import AdminUsers from './pages/admin/Users';
import UserNew from './pages/admin/UserNew';
import UserEdit from './pages/admin/UserEdit';
import CompanySettings from './pages/admin/CompanySettings';
import NotFound from './pages/NotFound';
import AdminNotFound from './pages/admin/NotFound';

const queryClient = new QueryClient();

function AppContent() {
  const { showPopup, handleClose } = useEnquiryPopup();

  return (
    <>
      <ScrollToTop />
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/:slug" element={<ServiceDetail />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:slug" element={<ProductDetail />} />
            <Route path="/locations" element={<Locations />} />
            <Route path="/locations/:slug" element={<LocationDetail />} />
            <Route path="/brands" element={<Brands />} />
            <Route path="/brands/:slug" element={<BrandDetail />} />
            <Route path="/industries" element={<Industries />} />
            <Route path="/industries/:slug" element={<IndustryDetail />} />
            <Route path="/case-studies" element={<CaseStudies />} />
            <Route path="/case-studies/:slug" element={<CaseStudyDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/quote-request" element={<QuoteRequest />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/refund" element={<Refund />} />
            {/* Public 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
      <WhatsAppButton />
      <ScrollToTopButton />
      {showPopup && <EnquiryPopup onClose={handleClose} />}
    </>
  );
}

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
            <Routes>
              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              {/* Categories before other admin routes so their sub-routes match first */}
              <Route
                path="/admin/categories"
                element={
                  <ProtectedRoute>
                    <AdminCategories />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/countries"
                element={
                  <ProtectedRoute>
                    <AdminCountries />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/states"
                element={
                  <ProtectedRoute>
                    <AdminStates />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/states/new"
                element={
                  <ProtectedRoute>
                    <StateNew />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/states/:id/edit"
                element={
                  <ProtectedRoute>
                    <StateEdit />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/localities"
                element={
                  <ProtectedRoute>
                    <AdminLocalities />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/categories/new"
                element={
                  <ProtectedRoute>
                    <CategoryNew />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/categories/:id/edit"
                element={
                  <ProtectedRoute>
                    <CategoryEdit />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/services"
                element={
                  <ProtectedRoute>
                    <AdminServices />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/products"
                element={
                  <ProtectedRoute>
                    <AdminProducts />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/products/new"
                element={
                  <ProtectedRoute>
                    <ProductNew />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/products/:id/edit"
                element={
                  <ProtectedRoute>
                    <ProductEdit />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/locations"
                element={
                  <ProtectedRoute>
                    <AdminLocations />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/brands"
                element={
                  <ProtectedRoute>
                    <AdminBrands />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/brands/new"
                element={
                  <ProtectedRoute>
                    <BrandNew />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/brands/:id/edit"
                element={
                  <ProtectedRoute>
                    <BrandEdit />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/industries"
                element={
                  <ProtectedRoute>
                    <AdminIndustries />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/case-studies"
                element={
                  <ProtectedRoute>
                    <AdminCaseStudies />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/testimonials"
                element={
                  <ProtectedRoute>
                    <AdminTestimonials />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/audit-logs"
                element={
                  <ProtectedRoute>
                    <AdminAuditLogs />
                  </ProtectedRoute>
                }
              />
              {/* Invoicing Routes */}
              <Route
                path="/admin/clients"
                element={
                  <ProtectedRoute>
                    <AdminClients />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/clients/new"
                element={
                  <ProtectedRoute>
                    <ClientNew />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/clients/:id/edit"
                element={
                  <ProtectedRoute>
                    <ClientEdit />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/proposals"
                element={
                  <ProtectedRoute>
                    <AdminProposals />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/proposals/new"
                element={
                  <ProtectedRoute>
                    <ProposalNew />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/proposals/:id/edit"
                element={
                  <ProtectedRoute>
                    <ProposalEdit />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/invoices"
                element={
                  <ProtectedRoute>
                    <AdminInvoices />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/invoices/new"
                element={
                  <ProtectedRoute>
                    <InvoiceNew />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/invoices/:id/edit"
                element={
                  <ProtectedRoute>
                    <InvoiceEdit />
                  </ProtectedRoute>
                }
              />
              {/* User Management Routes */}
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute>
                    <AdminUsers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users/new"
                element={
                  <ProtectedRoute>
                    <UserNew />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users/:id/edit"
                element={
                  <ProtectedRoute>
                    <UserEdit />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/company-settings"
                element={
                  <ProtectedRoute>
                    <CompanySettings />
                  </ProtectedRoute>
                }
              />
              {/* Admin 404 */}
              <Route path="/admin/*" element={<AdminNotFound />} />
              {/* Public Routes */}
              <Route path="/*" element={<AppContent />} />
            </Routes>
          </Router>
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;