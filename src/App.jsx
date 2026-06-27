import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { SocketProvider } from './context/SocketContext'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import LoadingScreen from './components/ui/LoadingScreen'
import { useAuth } from './context/AuthContext'

import HomePage from './pages/HomePage'
import MenuPage from './pages/MenuPage'
import MenuItemPage from './pages/MenuItemPage'
import CartPage from './pages/CartPage'
import OrdersPage from './pages/OrdersPage'
import AuthPage from './pages/AuthPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import KitchenPage from './pages/KitchenPage'
import DashboardPage from './pages/DashboardPage'

function AppContent() {
  const { loading } = useAuth()
  if (loading) return <LoadingScreen/>
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar/>
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage/>}/>
          <Route path="/menu" element={<MenuPage/>}/>
          <Route path="/menu/:id" element={<MenuItemPage/>}/>
          <Route path="/cart" element={<CartPage/>}/>
          <Route path="/orders" element={<OrdersPage/>}/>
          <Route path="/auth" element={<AuthPage/>}/>
          <Route path="/about" element={<AboutPage/>}/>
          <Route path="/contact" element={<ContactPage/>}/>
          <Route path="/kitchen" element={<KitchenPage/>}/>
          <Route path="/dashboard" element={<DashboardPage/>}/>
        </Routes>
      </main>
      <Footer/>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <SocketProvider>
            <AppContent/>
            <Toaster position="top-right" toastOptions={{ style:{fontFamily:'Inter,sans-serif'} }}/>
          </SocketProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
