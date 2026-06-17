create extension if not exists "pgcrypto";

create table if not exists usuarios (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text not null,
  email text not null unique,
  rol text not null default 'admin' check (rol in ('admin', 'operador')),
  creado_en timestamptz not null default now()
);

create table if not exists categorias (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  slug text not null unique,
  descripcion text,
  categoria_padre_id uuid references categorias(id) on delete set null,
  orden integer not null default 0,
  activa boolean not null default true,
  creado_en timestamptz not null default now()
);

create table if not exists productos (
  id uuid primary key default gen_random_uuid(),
  categoria_id uuid not null references categorias(id) on delete restrict,
  codigo text not null unique,
  slug text not null unique,
  nombre text not null,
  descripcion text not null,
  precio numeric(10, 2) not null check (precio >= 0),
  costo numeric(10, 2) not null default 0 check (costo >= 0),
  stock_total integer not null default 0 check (stock_total >= 0),
  destacado boolean not null default false,
  mas_vendido boolean not null default false,
  nuevo boolean not null default false,
  activo boolean not null default true,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create table if not exists colores (
  id uuid primary key default gen_random_uuid(),
  producto_id uuid not null references productos(id) on delete cascade,
  nombre text not null,
  hex text not null,
  stock integer not null default 0 check (stock >= 0),
  unique (producto_id, nombre)
);

create table if not exists tallas (
  id uuid primary key default gen_random_uuid(),
  producto_id uuid not null references productos(id) on delete cascade,
  color_id uuid references colores(id) on delete cascade,
  nombre text not null,
  stock integer not null default 0 check (stock >= 0),
  unique (producto_id, color_id, nombre)
);

create table if not exists imagenes (
  id uuid primary key default gen_random_uuid(),
  producto_id uuid not null references productos(id) on delete cascade,
  color_id uuid references colores(id) on delete cascade,
  url text not null,
  alt text,
  orden integer not null default 0
);

create table if not exists pedidos (
  id uuid primary key default gen_random_uuid(),
  numero_pedido text not null unique,
  nombre_cliente text not null,
  correo text not null,
  telefono text not null,
  ciudad text not null,
  direccion text not null,
  metodo_pago text not null check (metodo_pago in ('PayPal', 'PayPhone', 'Transferencia bancaria')),
  subtotal numeric(10, 2) not null check (subtotal >= 0),
  envio numeric(10, 2) not null default 0 check (envio >= 0),
  comision_pago numeric(10, 2) not null default 0 check (comision_pago >= 0),
  ganancia_neta numeric(10, 2) not null default 0,
  total numeric(10, 2) not null check (total >= 0),
  estado text not null default 'Pendiente' check (
    estado in ('Pendiente', 'Pagado', 'Preparando', 'Enviado', 'Entregado', 'Cancelado')
  ),
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create table if not exists detalle_pedido (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references pedidos(id) on delete cascade,
  producto_id uuid references productos(id) on delete set null,
  codigo_producto text not null,
  nombre_producto text not null,
  color text,
  talla text,
  cantidad integer not null check (cantidad > 0),
  precio_unitario numeric(10, 2) not null check (precio_unitario >= 0),
  costo_unitario numeric(10, 2) not null default 0 check (costo_unitario >= 0),
  subtotal numeric(10, 2) not null check (subtotal >= 0)
);

create index if not exists idx_productos_categoria_id on productos(categoria_id);
create index if not exists idx_productos_slug on productos(slug);
create index if not exists idx_colores_producto_id on colores(producto_id);
create index if not exists idx_tallas_producto_id on tallas(producto_id);
create index if not exists idx_imagenes_producto_id on imagenes(producto_id);
create index if not exists idx_pedidos_estado on pedidos(estado);
create index if not exists idx_detalle_pedido_pedido_id on detalle_pedido(pedido_id);

alter table usuarios enable row level security;
alter table categorias enable row level security;
alter table productos enable row level security;
alter table colores enable row level security;
alter table tallas enable row level security;
alter table imagenes enable row level security;
alter table pedidos enable row level security;
alter table detalle_pedido enable row level security;

create policy "Catalogo publico lectura" on categorias for select using (activa = true);
create policy "Productos publicos lectura" on productos for select using (activo = true);
create policy "Colores publicos lectura" on colores for select using (true);
create policy "Tallas publicas lectura" on tallas for select using (true);
create policy "Imagenes publicas lectura" on imagenes for select using (true);

create policy "Administradores gestionan catalogo" on categorias
  for all using (exists (select 1 from usuarios where usuarios.id = auth.uid()));
create policy "Administradores gestionan productos" on productos
  for all using (exists (select 1 from usuarios where usuarios.id = auth.uid()));
create policy "Administradores gestionan colores" on colores
  for all using (exists (select 1 from usuarios where usuarios.id = auth.uid()));
create policy "Administradores gestionan tallas" on tallas
  for all using (exists (select 1 from usuarios where usuarios.id = auth.uid()));
create policy "Administradores gestionan imagenes" on imagenes
  for all using (exists (select 1 from usuarios where usuarios.id = auth.uid()));
create policy "Administradores leen pedidos" on pedidos
  for select using (exists (select 1 from usuarios where usuarios.id = auth.uid()));
create policy "Administradores gestionan detalle" on detalle_pedido
  for select using (exists (select 1 from usuarios where usuarios.id = auth.uid()));

create policy "Crear pedidos publicos" on pedidos for insert with check (true);
create policy "Crear detalle publico" on detalle_pedido for insert with check (true);