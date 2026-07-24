import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Layout from './components/Layout';
import EclipseBackground from './components/EclipseBackground';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

import UserDashboard from './pages/user/Dashboard';
import Profile from './pages/user/Profile';
import Shop from './pages/Shop';
import Cart from './pages/Cart';
import ProductDetail from './pages/ProductDetail';
import UserOrders from './pages/user/Orders';
import NotFound from './pages/NotFound';

import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminUsers from './pages/admin/Users';
import AdminOrders from './pages/admin/Orders';
import AdminSettings from './pages/admin/Settings';
import AdminCategories from './pages/admin/Categories';

function EclipseLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="relative h-16 w-16">
        <div className="absolute inset-0 rounded-full border-2 border-purple-500/20" />
        <div
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-purple-300 border-r-purple-500 animate-spin"
          style={{ filter: 'drop-shadow(0 0 10px rgba(192,132,252,0.8))' }}
        />
        <div className="absolute inset-[30%] rounded-full bg-purple-500/50 blur-md" />
      </div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, loading } = useAuth();
  const location = useLocation();
  if (loading) return <EclipseLoader />;
  if (!currentUser) return <Navigate to="/login" state={{ from: location }} replace />;
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, loading } = useAuth();
  const location = useLocation();
  if (loading) return <EclipseLoader />;
  if (!currentUser) return <Navigate to="/login" state={{ from: location }} replace />;
  if (currentUser.role !== 'admin') return <Navigate to="/" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, loading } = useAuth();
  if (loading) return <EclipseLoader />;
  if (currentUser) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      <Route path="/" element={<ProtectedRoute><Layout><UserDashboard /></Layout></ProtectedRoute>} />
      <Route path="/shop" element={<ProtectedRoute><Layout><Shop /></Layout></ProtectedRoute>} />
      <Route path="/cart" element={<ProtectedRoute><Layout><Cart /></Layout></ProtectedRoute>} />
      <Route path="/product/:id" element={<ProtectedRoute><Layout><ProductDetail /></Layout></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
      <Route path="/orders" element={<ProtectedRoute><Layout><UserOrders /></Layout></ProtectedRoute>} />

      <Route path="/172.192.67.0/dashboard" element={<AdminRoute><Layout><AdminDashboard /></Layout></AdminRoute>} />
      <Route path="/172.192.67.0/products" element={<AdminRoute><Layout><AdminProducts /></Layout></AdminRoute>} />
      <Route path="/172.192.67.0/orders" element={<AdminRoute><Layout><AdminOrders /></Layout></AdminRoute>} />
      <Route path="/172.192.67.0/categories" element={<AdminRoute><Layout><AdminCategories /></Layout></AdminRoute>} />
      <Route path="/172.192.67.0/users" element={<AdminRoute><Layout><AdminUsers /></Layout></AdminRoute>} />
      <Route path="/172.192.67.0/settings" element={<AdminRoute><Layout><AdminSettings /></Layout></AdminRoute>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <div className="relative min-h-screen text-purple-50">
            <EclipseBackground />
            <div className="relative z-10">
              <AppRoutes />
            </div>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3600,
                style: {
                  background: 'linear-gradient(180deg, #140f26, #0a0814)',
                  color: '#ece9ff',
                  border: '1px solid rgba(168,85,247,0.35)',
                  boxShadow: '0 12px 40px -10px rgba(124,58,237,0.55), inset 0 1px 0 rgba(255,255,255,0.06)',
                  borderRadius: '14px',
                  padding: '14px 16px',
                  fontFamily: "'Chakra Petch', sans-serif",
                  letterSpacing: '0.02em',
                },
                success: { iconTheme: { primary: '#c084fc', secondary: '#0a0814' } },
                error: { iconTheme: { primary: '#f87171', secondary: '#0a0814' } },
              }}
            />
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
