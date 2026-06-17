import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard.jsx";
import { businessCategories, seedProducts } from "../data/catalog.js";
import { getCategories, getProducts } from "../services/catalogService.js";

export default function HomePage() {
  const [categories, setCategories] = useState(businessCategories);
  const [products, setProducts] = useState(seedProducts);

  useEffect(() => {
    let active = true;

    async function loadHomeData() {
      const [nextCategories, nextProducts] = await Promise.all([getCategories(), getProducts()]);

      if (!active) return;
      setCategories(nextCategories);
      setProducts(nextProducts);
    }

    loadHomeData().catch(() => {
      if (!active) return;
      setCategories(businessCategories);
      setProducts(seedProducts);
    });

    return () => {
      active = false;
    };
  }, []);

  const bestsellers = products.filter((product) => product.bestseller).slice(0, 4);
  const newArrivals = products.filter((product) => product.isNew).slice(0, 4);
  const sets = products.filter((product) => product.categorySlug === "sets").slice(0, 4);

  return (
    <main>
      <section className="hero-section">
        <div>
          <p className="eyebrow">Florencia · Cuenca, Ecuador</p>
          <h1>CADA ACCESORIO, UNA HISTORIA</h1>
          <p>
            Accesorios y joyería seleccionada para looks diarios, regalos especiales y detalles con
            identidad propia.
          </p>
          <Link className="primary-button" to="/aretes">
            Ver colección
          </Link>
        </div>

        <div className="hero-visual" aria-label="Colección destacada Florencia">
          <img src="/florencia-logo.jpg" alt="Florencia" />
          <span>Acero inoxidable · Baño en oro 18k · Envíos a todo Ecuador</span>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <p className="eyebrow">Categorías</p>
          <h2>Accesorios organizados para vender mejor</h2>
        </div>

        <div className="category-grid">
          {categories.map((category) => (
            <Link className="category-card" key={category.id} to={`/${category.slug}`}>
              <span>{category.hasSubcategories ? "Con subcategorías" : "Categoría directa"}</span>
              <h3>{category.name}</h3>
              <p>{category.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <ProductSection title="Más vendidos" products={bestsellers} />
      <ProductSection title="Nuevos ingresos" products={newArrivals} />
      <ProductSection title="Sets destacados" products={sets} />
    </main>
  );
}

function ProductSection({ title, products }) {
  return (
    <section className="section">
      <div className="section-heading">
        <p className="eyebrow">Florencia</p>
        <h2>{title}</h2>
      </div>

      <div className="product-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}