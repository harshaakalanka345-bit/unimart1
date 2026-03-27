import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import Navbar from "./Compornent/Nav/Nav";
import Footer from "./Compornent/Footer/Footer";
import Home from "./Compornent/Pages/Home";
import Products from "./Compornent/Pages/Products";
import Messages from "./Compornent/Pages/Messages";
import MyOrders from "./Compornent/Pages/Myorders";
import BecomeSeller from "./Compornent/Pages/Becomeseller";
import AboutUs from "./Compornent/Pages/AboutUs";
import Login from "./Compornent/Pages/Login";
import Register from "./Compornent/Pages/Register";
import SellerRegistration from "./Compornent/Pages/SellerRegistration";
import AddProduct from "./Compornent/Pages/AddProduct";
import ProductDetails from "./Compornent/Pages/ProductDetails";
import AdminDashboard from "./Compornent/Pages/AdminDashboard";
import ProtectedRoute from "./Compornent/Auth/ProtectedRoute";
import "./index.css";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="app-wrapper">
            <Navbar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:id" element={<ProductDetails />} />
                <Route path="/about" element={<AboutUs />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/become-seller" element={<BecomeSeller />} />
                <Route path="/become-seller/application" element={<ProtectedRoute><SellerRegistration /></ProtectedRoute>} />
                <Route path="/add-product" element={<ProtectedRoute><AddProduct /></ProtectedRoute>} />
                <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
                <Route path="/my-orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
                <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
