import Layout from "./Layout.jsx";

import Home from "./Home";

import Catalog from "./Catalog";

import ProductDetails from "./ProductDetails";

import Cart from "./Cart";

import Checkout from "./Checkout";

import PaymentSuccess from "./PaymentSuccess";

import PaymentCanceled from "./PaymentCanceled";

import MyOrders from "./MyOrders";

import Profile from "./Profile";

import AdminDashboard from "./AdminDashboard";

import AdminProducts from "./AdminProducts";

import AdminOrders from "./AdminOrders";

import AdminCategories from "./AdminCategories";

import AdminLogistics from "./AdminLogistics";

import AdminCustomers from "./AdminCustomers";

import Auth from "./Auth";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Home: Home,
    
    Catalog: Catalog,
    
    ProductDetails: ProductDetails,
    
    Cart: Cart,
    
    Checkout: Checkout,
    
    PaymentSuccess: PaymentSuccess,
    
    PaymentCanceled: PaymentCanceled,
    
    MyOrders: MyOrders,
    
    Profile: Profile,
    
    AdminDashboard: AdminDashboard,
    
    AdminProducts: AdminProducts,
    
    AdminOrders: AdminOrders,
    
    AdminCategories: AdminCategories,
    
    AdminLogistics: AdminLogistics,
    
    AdminCustomers: AdminCustomers,
    
    Auth: Auth,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Home />} />
                
                
                <Route path="/Home" element={<Home />} />
                
                <Route path="/Catalog" element={<Catalog />} />
                
                <Route path="/ProductDetails" element={<ProductDetails />} />
                
                <Route path="/Cart" element={<Cart />} />
                
                <Route path="/Checkout" element={<Checkout />} />
                
                <Route path="/PaymentSuccess" element={<PaymentSuccess />} />
                
                <Route path="/PaymentCanceled" element={<PaymentCanceled />} />
                
                <Route path="/MyOrders" element={<MyOrders />} />
                
                <Route path="/Profile" element={<Profile />} />
                
                <Route path="/AdminDashboard" element={<AdminDashboard />} />
                
                <Route path="/AdminProducts" element={<AdminProducts />} />
                
                <Route path="/AdminOrders" element={<AdminOrders />} />
                
                <Route path="/AdminCategories" element={<AdminCategories />} />
                
                <Route path="/AdminLogistics" element={<AdminLogistics />} />
                
                <Route path="/AdminCustomers" element={<AdminCustomers />} />
                
                <Route path="/Auth" element={<Auth />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}