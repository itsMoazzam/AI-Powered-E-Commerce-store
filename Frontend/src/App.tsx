import React, { Suspense, lazy } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import RootLayout from './components/layouts/RootLayout'
import AuthLayout from './components/layouts/AuthLayout'
import { setAuth } from './store/auth'
// import Navbar from './components/Navbar'
import Register from './pages/auth/Register'

const CategoryPage = lazy(() => import('./pages/category/CategoryPage'))
const ProductDetail = lazy(() => import('./pages/Products/ProductDetail'))
const Home = lazy(() => import('./pages/Home'))
const Cart = lazy(() => import('./pages/Cart'))
const Checkout = lazy(() => import('./pages/CheckOuts'))
const AdminPanel = lazy(() => import('./pages/admin/AdminPanel'))
const SellerDashboard = lazy(() => import('./pages/seller/SellerDashboard'))
const Login = lazy(() => import('./pages/auth/Login'))


function Protected({ children, allow }: { children: React.ReactNode; allow?: Array<'customer' | 'seller' | 'admin'> }) {
  const { token, role } = setAuth()
  if (!token) return <Navigate to="/auth/login" replace />
  if (allow && role && !allow.includes(role)) return <Navigate to="/" replace />
  return <>{children}</>
}


function App() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading…</div>}>
      {/* <Navbar /> */}
      <Routes>
        <Route element={<RootLayout />}>
          <Route index element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/category/:categorySlug" element={<CategoryPage />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          {/* <Route path="/cart" element={<Protected allow={['customer']}><Cart /></Protected>} /> */}
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />

          {/* <Route path="/checkout" element={<Protected allow={['customer']}><Checkout /></Protected>} /> */}
          {/* <Route path="/admin" element={<Protected allow={['admin']}><AdminPanel /></Protected>} /> */}
          <Route path="/admin" element={<AdminPanel />} />
          {/* <Route path="/seller" element={<Protected allow={['seller']}><SellerDashboard /></Protected>} /> */}
          <Route path="/seller" element={<SellerDashboard />} />

        </Route>
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Suspense>
  )
}

export default App