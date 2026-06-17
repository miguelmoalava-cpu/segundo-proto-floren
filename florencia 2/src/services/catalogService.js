import { businessCategories, seedProducts } from "../data/catalog.js";
import { supabase } from "../lib/supabase.js";

export async function getCategories() {
  if (!supabase) return businessCategories;

  const { data, error } = await supabase.from("categorias").select("*").eq("activa", true).order("orden");
  if (error) throw error;

  return data.map(mapCategoryFromDb);
}

export async function getProducts({ categorySlug, sort = "mas-vendidos" } = {}) {
  if (!supabase) {
    let products = categorySlug
      ? seedProducts.filter((product) => product.categorySlug === categorySlug)
      : seedProducts;

    if (sort === "precio-menor") products = [...products].sort((a, b) => a.price - b.price);
    if (sort === "precio-mayor") products = [...products].sort((a, b) => b.price - a.price);
    if (sort === "mas-vendidos") {
      products = [...products].sort((a, b) => Number(b.bestseller) - Number(a.bestseller));
    }

    return products;
  }

  let query = supabase
    .from("productos")
    .select("*, categorias!inner(*), colores(*), tallas(*), imagenes(*)")
    .eq("activo", true);

  if (categorySlug) query = query.eq("categorias.slug", categorySlug);
  if (sort === "precio-menor") query = query.order("precio", { ascending: true });
  if (sort === "precio-mayor") query = query.order("precio", { ascending: false });
  if (sort === "mas-vendidos") query = query.order("mas_vendido", { ascending: false });

  const { data, error } = await query;
  if (error) throw error;

  return data.map(mapProductFromDb);
}

export async function getProductBySlug(slug) {
  if (!supabase) return seedProducts.find((product) => product.slug === slug);

  const { data, error } = await supabase
    .from("productos")
    .select("*, categorias!inner(*), colores(*), tallas(*), imagenes(*)")
    .eq("slug", slug)
    .single();

  if (error) throw error;

  return mapProductFromDb(data);
}

function mapCategoryFromDb(category) {
  return {
    id: category.id,
    name: category.nombre,
    slug: category.slug,
    description: category.descripcion,
    hasSubcategories: false,
  };
}

function mapProductFromDb(product) {
  const category = product.categorias;
  const imagesByColor = new Map();

  for (const image of product.imagenes || []) {
    const key = image.color_id || "default";
    const current = imagesByColor.get(key) || [];
    current.push(image.url);
    imagesByColor.set(key, current);
  }

  const colors = (product.colores || []).map((color) => ({
    id: color.id,
    name: color.nombre,
    hex: color.hex,
    stock: color.stock,
    images: imagesByColor.get(color.id) || imagesByColor.get("default") || [],
  }));

  return {
    id: product.id,
    code: product.codigo,
    slug: product.slug,
    name: product.nombre,
    categoryId: category?.id,
    categorySlug: category?.slug,
    categoryName: category?.nombre,
    price: Number(product.precio),
    cost: Number(product.costo),
    stock: product.stock_total,
    description: product.descripcion,
    featured: product.destacado,
    bestseller: product.mas_vendido,
    isNew: product.nuevo,
    colors,
    sizes: (product.tallas || []).map((size) => ({
      id: size.id,
      colorId: size.color_id,
      name: size.nombre,
      stock: size.stock,
    })),
    estimatedDelivery: "2 a 5 días laborables",
  };
}