import React from "react";
import { Navigate, Route, Routes, useParams } from "react-router-dom";
import PublicLayout from "./layouts/PublicLayout.jsx";
import AdminLayout from "./layouts/AdminLayout.jsx";
import HomePage from "./pages/HomePage.jsx";
import CategoryPage from "./pages/CategoryPage.jsx";
import ProductPage from "./pages/ProductPage.jsx";
import CartPage from "./pages/CartPage.jsx";
import CheckoutPage from "./pages/CheckoutPage.jsx";
import AdminLoginPage from "./pages/admin/AdminLoginPage.jsx";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage.jsx";
import AdminProductsPage from "./pages/admin/AdminProductsPage.jsx";
import AdminCategoriesPage from "./pages/admin/AdminCategoriesPage.jsx";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage.jsx";
import AdminInventoryPage from "./pages/admin/AdminInventoryPage.jsx";
import AdminReportsPage from "./pages/admin/AdminReportsPage.jsx";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage.jsx";
import { businessCategories } from "./data/catalog.js";

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />

        {businessCategories.map((category) => (
          <Route key={category.slug} path={category.slug} element={<CategoryPage />} />
        ))}

        <Route path="categoria/:slug" element={<LegacyCategoryRedirect />} />
        <Route path="producto/:slug" element={<ProductPage />} />
        <Route path="carrito" element={<CartPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
      </Route>

      <Route path="admin/login" element={<AdminLoginPage />} />

      <Route path="admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboardPage />} />
        <Route path="productos" element={<AdminProductsPage />} />
        <Route path="categorias" element={<AdminCategoriesPage />} />
        <Route path="pedidos" element={<AdminOrdersPage />} />
        <Route path="inventario" element={<AdminInventoryPage />} />
        <Route path="reportes" element={<AdminReportsPage />} />
        <Route path="configuracion" element={<AdminSettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function LegacyCategoryRedirect() {
  const { slug } = useParams();
  return <Navigate to={`/${slug}`} replace />;
}