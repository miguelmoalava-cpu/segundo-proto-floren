import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ProductCard from "../components/ProductCard.jsx";
import { businessCategories, seedProducts } from "../data/catalog.js";
import { getCategories, getProducts } from "../services/catalogService.js";

export default function CategoryPage() {
  const { slug } = useParams();
  const [sort, setSort] = useState("mas-vendidos");
  const [categories, setCategories] = useState(businessCategories);
  const [products, setProducts] = useState(() => seedProducts.filter((product) => product.categorySlug === slug));

  const category = categories.find((item) => item.slug === slug);

  useEffect(() => {
    let active = true;

    async function loadCategoryData() {
      const [nextCategories, nextProducts] = await Promise.all([
        getCategories(),
        getProducts({ categorySlug: slug, sort }),
      ]);

      if (!active) return;
      setCategories(nextCategories);
      setProducts(nextProducts);
    }

    loadCategoryData().catch(() => {
      if (!active) return;
      setCategories(businessCategories);
      setProducts(seedProducts.filter((product) => product.categorySlug === slug));
    });

    return () => {
      active = false;
    };
  }, [slug, sort]);

  const sortedProducts = useMemo(() => {
    let result = [...products];

    if (sort === "precio-menor") result = [...result].sort((a, b) => a.price - b.price);
    if (sort === "precio-mayor") result = [...result].sort((a, b) => b.price - a.price);
    if (sort === "mas-vendidos") {
      result = [...result].sort((a, b) => Number(b.bestseller) - Number(a.bestseller));
    }

    return result;
  }, [products, sort]);

  if (!category) {
    return (
      <main className="section empty-state">
        <h1>Categoría no encontrada</h1>
        <Link className="primary-button" to="/">
          Volver al inicio
        </Link>
      </main>
    );
  }

  return (
    <main className="section page-section">
      <div className="page-heading">
        <p className="eyebrow">Categoría</p>
        <h1>{category.name}</h1>
        <p>{category.description}</p>
      </div>

      <div className="toolbar">
        <span>{sortedProducts.length} productos</span>
        <label>
          Ordenar por
          <select value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="mas-vendidos">Más vendidos</option>
            <option value="precio-menor">Precio menor</option>
            <option value="precio-mayor">Precio mayor</option>
          </select>
        </label>
      </div>

      <div className="product-grid">
        {sortedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </main>
  );
}