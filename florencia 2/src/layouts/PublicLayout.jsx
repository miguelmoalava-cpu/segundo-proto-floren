import React from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { businessCategories } from "../data/catalog.js";
import { useCart } from "../context/CartContext.jsx";

export default function PublicLayout() {
  const { summary } = useCart();

  return (
    <div className="app-shell">
      <header className="site-header">
        <Link className="brand" to="/">
          <img src="/florencia-logo.jpg" alt="Logo Florencia" />
          <span>Florencia</span>
        </Link>

        <nav className="site-nav" aria-label="Navegación principal">
          <NavLink to="/">Inicio</NavLink>

          <div className="nav-dropdown">
            <span>Categorías</span>
            <div className="dropdown-menu">
              {businessCategories.map((category) => (
                <NavLink key={category.id} to={`/${category.slug}`}>
                  {category.name}
                </NavLink>
              ))}
            </div>
          </div>

          <NavLink className="cart-link" to="/carrito">
            <ShoppingBag size={18} />
            Carrito
            <strong>{summary.count}</strong>
          </NavLink>
        </nav>
      </header>

      <Outlet />

      <footer className="site-footer">
        <div>
          <h2>Florencia</h2>
          <p>Accesorios y joyería seleccionada en Cuenca, Ecuador.</p>
        </div>

        <div className="footer-grid">
          <a href="#cuidados">Cuidados de accesorios</a>
          <a href="#marca">Marca registrada</a>
          <a href="#contacto">Contacto</a>
          <a href="https://www.instagram.com/" target="_blank" rel="noreferrer">
            Instagram
          </a>
          <a href="https://wa.me/593990000000" target="_blank" rel="noreferrer">
            WhatsApp
          </a>
          <span>Cuenca, Ecuador</span>
        </div>
      </footer>
    </div>
  );
}