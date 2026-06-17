import React, { createContext, useContext, useMemo, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  const addItem = ({ product, color, size, quantity = 1, maxStock }) => {
    setItems((current) => {
      const cartKey = `${product.id}-${color?.name || "sin-color"}-${size?.name || "sin-talla"}`;
      const existing = current.find((item) => item.cartKey === cartKey);
      const availableStock =
        maxStock ?? Math.min(color?.stock || product.stock || 0, size?.stock || color?.stock || product.stock || 0);

      if (existing) {
        return current.map((item) =>
          item.cartKey === cartKey
            ? { ...item, quantity: Math.min(item.quantity + quantity, item.maxStock || availableStock) }
            : item,
        );
      }

      return [
        ...current,
        {
          cartKey,
          productId: product.id,
          code: product.code,
          name: product.name,
          slug: product.slug,
          price: product.price,
          cost: product.cost,
          color,
          size,
          quantity: Math.min(quantity, availableStock || quantity),
          maxStock: availableStock,
        },
      ];
    });
  };

  const updateQuantity = (cartKey, quantity) => {
    setItems((current) =>
      current
        .map((item) =>
          item.cartKey === cartKey
            ? { ...item, quantity: Math.min(Math.max(1, quantity), item.maxStock || 99) }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const removeItem = (cartKey) => {
    setItems((current) => current.filter((item) => item.cartKey !== cartKey));
  };

  const clearCart = () => setItems([]);

  const summary = useMemo(() => {
    const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
    const productCost = items.reduce((total, item) => total + item.cost * item.quantity, 0);
    const count = items.reduce((total, item) => total + item.quantity, 0);

    return { subtotal, productCost, count };
  }, [items]);

  return (
    <CartContext.Provider value={{ items, summary, addItem, updateQuantity, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart debe usarse dentro de CartProvider");
  }
  return context;
}