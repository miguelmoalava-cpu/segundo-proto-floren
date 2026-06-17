import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ProductCard from "../components/ProductCard.jsx";
import QuantitySelector from "../components/QuantitySelector.jsx";
import { useCart } from "../context/CartContext.jsx";
import { seedProducts } from "../data/catalog.js";
import { getProductBySlug, getProducts } from "../services/catalogService.js";
import { formatCurrency } from "../utils/formatters.js";

export default function ProductPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState(() => seedProducts.find((item) => item.slug === slug));
  const [related, setRelated] = useState([]);
  const { addItem } = useCart();
  const [selectedColor, setSelectedColor] = useState(product?.colors[0]);
  const [selectedSize, setSelectedSize] = useState(product?.sizes[0] || null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    let active = true;

    async function loadProductData() {
      const nextProduct = await getProductBySlug(slug);
      const nextRelated = nextProduct
        ? await getProducts({ categorySlug: nextProduct.categorySlug, sort: "mas-vendidos" })
        : [];

      if (!active) return;
      setProduct(nextProduct);
      setRelated(nextRelated.filter((item) => item.id !== nextProduct?.id).slice(0, 4));
    }

    loadProductData().catch(() => {
      if (!active) return;

      const fallbackProduct = seedProducts.find((item) => item.slug === slug);
      setProduct(fallbackProduct);
      setRelated(
        seedProducts
          .filter((item) => item.categorySlug === fallbackProduct?.categorySlug && item.id !== fallbackProduct?.id)
          .slice(0, 4),
      );
    });

    return () => {
      active = false;
    };
  }, [slug]);

  useEffect(() => {
    setSelectedColor(product?.colors[0]);
    setSelectedSize(product?.sizes[0] || null);
    setSelectedImageIndex(0);
    setQuantity(1);
  }, [product]);

  if (!product) {
    return (
      <main className="section empty-state">
        <h1>Producto no encontrado</h1>
        <Link className="primary-button" to="/">
          Volver al inicio
        </Link>
      </main>
    );
  }

  const variantStock = Math.min(selectedColor?.stock || 0, selectedSize?.stock || selectedColor?.stock || 0);
  const canBuy = product.stock > 0 && variantStock > 0;
  const gallery = selectedColor?.images?.length ? selectedColor.images : [`${product.slug}-principal.jpg`];

  return (
    <main className="section product-page">
      <div className="product-gallery">
        <div className="gallery-main">
          <span className="jewel-orbit" />
          <small>{gallery[selectedImageIndex]}</small>
          {!canBuy && <strong className="sold-out">Agotado</strong>}
        </div>

        <div className="gallery-thumbs">
          {gallery.map((image, index) => (
            <button
              className={selectedImageIndex === index ? "active" : ""}
              key={image}
              type="button"
              aria-label={`Imagen ${index + 1}`}
              onClick={() => setSelectedImageIndex(index)}
            >
              <span />
            </button>
          ))}
        </div>

        <div className="color-row">
          {product.colors.map((color) => (
            <button
              className={selectedColor?.name === color.name ? "active" : ""}
              key={color.name}
              type="button"
              onClick={() => {
                setSelectedColor(color);
                setSelectedImageIndex(0);
                setQuantity(1);
              }}
            >
              <span style={{ background: color.hex }} />
              {color.name}
            </button>
          ))}
        </div>
      </div>

      <aside className="product-detail">
        <p className="eyebrow">{product.categoryName}</p>
        <h1>{product.name}</h1>
        <span>{product.code}</span>
        <strong>{formatCurrency(product.price)}</strong>
        <p>{product.description}</p>

        <dl>
          <div>
            <dt>Stock disponible</dt>
            <dd>{selectedColor?.stock || 0} unidades</dd>
          </div>
          <div>
            <dt>Entrega estimada</dt>
            <dd>{product.estimatedDelivery}</dd>
          </div>
        </dl>

        {product.sizes.length > 0 && (
          <div className="size-row">
            <span>Talla</span>
            {product.sizes.map((size) => (
              <button
                className={selectedSize?.name === size.name ? "active" : ""}
                key={size.name}
                type="button"
                onClick={() => setSelectedSize(size)}
              >
                {size.name}
              </button>
            ))}
          </div>
        )}

        <QuantitySelector value={quantity} onChange={setQuantity} max={variantStock || 1} />

        <button
          className="primary-button full-button"
          disabled={!canBuy}
          type="button"
          onClick={() => addItem({ product, color: selectedColor, size: selectedSize, quantity, maxStock: variantStock })}
        >
          {canBuy ? "Agregar al carrito" : "Agotado"}
        </button>

        <div className="info-box">
          <strong>Información de envío</strong>
          <p>Cuenca: $4 · Resto del Ecuador: $6 · Galápagos: contactar por WhatsApp.</p>
        </div>
      </aside>

      <section className="related-products">
        <div className="section-heading">
          <p className="eyebrow">También te puede gustar</p>
          <h2>Productos relacionados</h2>
        </div>

        <div className="product-grid">
          {related.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      </section>
    </main>
  );
}