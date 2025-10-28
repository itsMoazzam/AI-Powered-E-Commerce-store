import React, { Suspense, lazy } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import RootLayout from './components/layouts/RootLayout'
import AuthLayout from './components/layouts/AuthLayout'
// import { setAuth } from './store/auth'
import Protected from './components/Protected'
import Register from './pages/auth/register/Register'
import SearchPage from './pages/search/SearchPage'
const Profile = lazy(() => import('./components/Profile'))
const CategoryPage = lazy(() => import('./pages/category/CategoryPage'))
const ProductDetail = lazy(() => import('./pages/Products/ProductDetail'))
const Home = lazy(() => import('./pages/Home'))
const Cart = lazy(() => import('./pages/Cart'))
const Checkout = lazy(() => import('./pages/CheckOuts'))
const AdminPanel = lazy(() => import('./pages/admin/AdminPanel'))
const SellerDashboard = lazy(() => import('./pages/seller/SellerDashboard'))
const Login = lazy(() => import('./pages/auth/Login'))





function App() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading…</div>}>
      <Routes>
        <Route element={<RootLayout />}>
          <Route index element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/category/:categorySlug" element={<CategoryPage />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Protected allow={['customer']}><Cart /></Protected>} />
          {/* <Route path="/cart" element={<Cart />} /> */}
          <Route path="/checkout" element={<Checkout />} />
          <Route path='/profile' element={<Protected allow={['customer', 'seller', 'admin']}><Profile /></Protected>} />
          {/* <Route path="/checkout" element={<Prote cted allow={['customer']}><Checkout /></Protected>} /> */}
          <Route path="/admin" element={<Protected allow={['admin']}><AdminPanel /></Protected>} />
          <Route path="/seller" element={<Protected allow={['seller']}><SellerDashboard /></Protected>} />

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