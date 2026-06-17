import React from "react";
import { Link } from "react-router-dom";
import QuantitySelector from "../components/QuantitySelector.jsx";
import { useCart } from "../context/CartContext.jsx";
import { formatCurrency } from "../utils/formatters.js";

export default function CartPage() {
  const { items, summary, updateQuantity, removeItem } = useCart();

  return (
    <main className="section page-section">
      <div className="page-heading">
        <p className="eyebrow">Carrito</p>
        <h1>Productos seleccionados</h1>
      </div>

      {items.length === 0 ? (
        <div className="empty-state">
          <h2>Tu carrito está vacío</h2>
          <Link className="primary-button" to="/">
            Ver colección
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-list">
            {items.map((item) => (
              <article className="cart-row" key={item.cartKey}>
                <div>
                  <h3>{item.name}</h3>
                  <p>
                    {item.code} · Color: {item.color?.name || "N/A"}
                    {item.size ? ` · Talla: ${item.size.name}` : ""}
                  </p>
                </div>

                <QuantitySelector
                  value={item.quantity}
                  max={item.maxStock || 99}
                  onChange={(quantity) => updateQuantity(item.cartKey, quantity)}
                />

                <strong>{formatCurrency(item.price * item.quantity)}</strong>

                <button type="button" onClick={() => removeItem(item.cartKey)}>
                  Eliminar
                </button>
              </article>
            ))}
          </div>

          <aside className="summary-card">
            <h2>Resumen</h2>
            <div>
              <span>Subtotal</span>
              <strong>{formatCurrency(summary.subtotal)}</strong>
            </div>
            <div>
              <span>Envío</span>
              <strong>Se calcula en checkout</strong>
            </div>
            <Link className="primary-button full-button" to="/checkout">
              Continuar compra
            </Link>
          </aside>
        </div>
      )}
    </main>
  );
}