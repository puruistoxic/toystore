import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './contexts/AuthContext';
import { AlertProvider } from './contexts/AlertContext';
import Header from './components/Header';
import Footer from './components/Footer';
import EnquiryPopup, { useEnquiryPopup } from './components/EnquiryPopup';
import ScrollToTop from './components/ScrollToTop';
import RouteTransitionBar from './components/RouteTransitionBar';
import ScrollToTopButton from './components/ScrollToTopButton';
import WhatsAppButton from './components/WhatsAppButton';
import PageNavigationFX from './components/PageNavigationFX';
import ProtectedRoute from './components/admin/ProtectedRoute';
import Home from './pages/Home';
import Services from './pages/Services';
import Products from './pages/Products';
import About from './pages/About';
import Contact from './pages/Contact';
import ProductDetail from './pages/ProductDetail';
import ToyFinderPage from './pages/ToyFinderPage';
import ServiceDetail from './pages/ServiceDetail';
import QuoteRequest from './pages/QuoteRequest';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Refund from './pages/Refund';
import OnlineShopPolicies from './pages/OnlineShopPolicies';
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
import AdminTemplates from './pages/admin/Templates';
import TemplateNew from './pages/admin/TemplateNew';
import TemplateEdit from './pages/admin/TemplateEdit';
import AdminUsers from './pages/admin/Users';
import UserNew from './pages/admin/UserNew';
import UserEdit from './pages/admin/UserEdit';
import CompanySettings from './pages/admin/CompanySettings';
import NotFound from './pages/NotFound';
import AdminNotFound from './pages/admin/NotFound';
import StoreOrdersPage from './pages/admin/StoreOrdersPage';
import StoreOrderDetailPage from './pages/admin/StoreOrderDetailPage';
import StoreCustomersPage from './pages/admin/StoreCustomersPage';
import StoreCustomerDetailPage from './pages/admin/StoreCustomerDetailPage';
import StoreOrderRequestsPage from './pages/admin/StoreOrderRequestsPage';
import StoreOrderRequestDetailPage from './pages/admin/StoreOrderRequestDetailPage';
import StoreLeadsPage from './pages/admin/StoreLeadsPage';
import StoreLeadDetailPage from './pages/admin/StoreLeadDetailPage';
import { ProductWhatsAppProvider } from './contexts/ProductWhatsAppContext';
import { CartProvider } from './contexts/CartContext';
import { AddToListModalProvider } from './contexts/AddToListModalContext';
import { ServiceAreaProvider } from './contexts/ServiceAreaContext';
import { CustomerAuthProvider } from './contexts/CustomerAuthContext';
import CartPage from './pages/CartPage';
import OrderRequestPage from './pages/OrderRequestPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/account/LoginPage';
import MagicLinkVerifyPage from './pages/account/MagicLinkVerifyPage';
import AccountLayout from './pages/account/AccountLayout';
import OverviewPage from './pages/account/OverviewPage';
import OrdersPage from './pages/account/OrdersPage';
import AddressesPage from './pages/account/AddressesPage';
import ProfilePage from './pages/account/ProfilePage';
import SecurityPage from './pages/account/SecurityPage';
import OrderTrackPage from './pages/account/OrderTrackPage';

const queryClient = new QueryClient();

/**
 * Single public layout with Outlet — avoids a second nested <Routes> under path="/*",
 * which can fail to match routes like /cart correctly in React Router v7.
 */
function PublicLayout() {
  const { showPopup, handleClose } = useEnquiryPopup();

  return (
    <CustomerAuthProvider>
    <ServiceAreaProvider>
    <CartProvider>
      <AddToListModalProvider>
      <ProductWhatsAppProvider>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <PageNavigationFX>
            <main>
              <Outlet />
            </main>
          </PageNavigationFX>
          <Footer />
        </div>
        <WhatsAppButton />
        <ScrollToTopButton />
        {showPopup && <EnquiryPopup onClose={handleClose} />}
      </ProductWhatsAppProvider>
      </AddToListModalProvider>
    </CartProvider>
    </ServiceAreaProvider>
    </CustomerAuthProvider>
  );
}

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AlertProvider>
          <AuthProvider>
            <Router>
            <ScrollToTop />
            <RouteTransitionBar />
            <Routes>
              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
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
                path="/admin/templates"
                element={
                  <ProtectedRoute>
                    <AdminTemplates />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/templates/new"
                element={
                  <ProtectedRoute>
                    <TemplateNew />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/templates/:id/edit"
                element={
                  <ProtectedRoute>
                    <TemplateEdit />
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
              {/* Web store (checkout + customers + cart requests + leads) */}
              <Route
                path="/admin/store/leads/:id"
                element={
                  <ProtectedRoute>
                    <StoreLeadDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/store/leads"
                element={
                  <ProtectedRoute>
                    <StoreLeadsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/store/order-requests/:id"
                element={
                  <ProtectedRoute>
                    <StoreOrderRequestDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/store/order-requests"
                element={
                  <ProtectedRoute>
                    <StoreOrderRequestsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/store/customers/:id"
                element={
                  <ProtectedRoute>
                    <StoreCustomerDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/store/customers"
                element={
                  <ProtectedRoute>
                    <StoreCustomersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/store/orders/:publicRef"
                element={
                  <ProtectedRoute>
                    <StoreOrderDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/store/orders"
                element={
                  <ProtectedRoute>
                    <StoreOrdersPage />
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

              {/* Public storefront — pathless layout + relative child paths */}
              <Route element={<PublicLayout />}>
                <Route index element={<Home />} />
                <Route path="cart" element={<CartPage />} />
                <Route path="checkout" element={<CheckoutPage />} />
                <Route path="order-request/:publicRef" element={<OrderRequestPage />} />
                <Route path="account/login" element={<LoginPage />} />
                <Route path="account/verify" element={<MagicLinkVerifyPage />} />
                {/*
                  Order detail by public_ref stays outside the auth-guarded
                  layout — the link itself is the credential, so a shared
                  order page works whether the user is signed in or not.
                */}
                <Route path="account/orders/:publicRef" element={<OrderTrackPage />} />
                <Route path="account" element={<AccountLayout />}>
                  <Route index element={<OverviewPage />} />
                  <Route path="orders" element={<OrdersPage />} />
                  <Route path="addresses" element={<AddressesPage />} />
                  <Route path="profile" element={<ProfilePage />} />
                  <Route path="security" element={<SecurityPage />} />
                </Route>
                <Route path="services/:slug" element={<ServiceDetail />} />
                <Route path="services" element={<Services />} />
                <Route path="products/category/:categorySlug" element={<Products />} />
                <Route path="products/:slug" element={<ProductDetail />} />
                <Route path="products" element={<Products />} />
                <Route path="toy-finder" element={<ToyFinderPage />} />
                <Route path="locations/:slug" element={<LocationDetail />} />
                <Route path="locations" element={<Locations />} />
                <Route path="brands/:slug" element={<BrandDetail />} />
                <Route path="brands" element={<Brands />} />
                <Route path="industries/:slug" element={<IndustryDetail />} />
                <Route path="industries" element={<Industries />} />
                <Route path="case-studies/:slug" element={<CaseStudyDetail />} />
                <Route path="case-studies" element={<CaseStudies />} />
                <Route path="about" element={<About />} />
                <Route path="contact" element={<Contact />} />
                <Route path="quote-request" element={<QuoteRequest />} />
                <Route path="privacy" element={<Privacy />} />
                <Route path="terms" element={<Terms />} />
                <Route path="refund" element={<Refund />} />
                <Route path="policies" element={<OnlineShopPolicies />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
            </Router>
          </AuthProvider>
        </AlertProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;