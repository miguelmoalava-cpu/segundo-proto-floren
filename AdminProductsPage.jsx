import React from "react";
import { businessCategories, seedProducts } from "../../data/catalog.js";
import { formatCurrency } from "../../utils/formatters.js";

export default function AdminProductsPage() {
  return (
    <section>
      <div className="admin-heading">
        <p className="eyebrow">Productos</p>
        <h1>Gestión de productos</h1>
      </div>

      <form className="admin-form">
        <h2>Crear producto</h2>
        <input placeholder="Código" />
        <input placeholder="Nombre" />

        <select>
          {businessCategories.map((category) => (
            <option key={category.id}>{category.name}</option>
          ))}
        </select>

        <input placeholder="Precio" type="number" />
        <input placeholder="Costo del producto" type="number" />
        <input placeholder="Stock" type="number" />
        <input placeholder="Colores disponibles: Negro #161616, Azul #234e83" />
        <input placeholder="Fotografías por color: negro-1.jpg, negro-2.jpg" />
        <input placeholder="Tallas para anillos: 6:4, 7:6, 8:3" />
        <textarea placeholder="Descripción" />

        <label className="inline-check">
          <input type="checkbox" />
          Destacado
        </label>

        <label className="inline-check">
          <input type="checkbox" />
          Más vendido
        </label>
      </form>

      <div className="admin-table">
        {seedProducts.map((product) => (
          <div key={product.id}>
            <span>{product.code}</span>
            <strong>{product.name}</strong>
            <span>{product.categoryName}</span>
            <span>{formatCurrency(product.price)}</span>
            <span>Stock: {product.stock}</span>
          </div>
        ))}
      </div>
    </section>
  );
}