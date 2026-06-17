import { supabase } from "../lib/supabase.js";

export async function createOrder(orderPayload) {
  const orderNumber = `FLR-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

  if (!supabase) {
    return {
      ...orderPayload,
      id: `local-${Date.now()}`,
      orderNumber,
      status: "Pendiente",
    };
  }

  const pedido = {
    numero_pedido: orderNumber,
    nombre_cliente: orderPayload.customerName,
    correo: orderPayload.email,
    telefono: orderPayload.phone,
    ciudad: orderPayload.city,
    direccion: orderPayload.address,
    metodo_pago: orderPayload.paymentMethod,
    subtotal: orderPayload.subtotal,
    envio: orderPayload.shipping,
    comision_pago: orderPayload.paymentCommission,
    ganancia_neta: orderPayload.netProfit,
    total: orderPayload.total,
    estado: orderPayload.status,
  };

  const { data, error } = await supabase.from("pedidos").insert(pedido).select().single();

  if (error) throw error;

  const details = orderPayload.items.map((item) => ({
    pedido_id: data.id,
    producto_id: isUuid(item.productId) ? item.productId : null,
    codigo_producto: item.code,
    nombre_producto: item.name,
    color: item.color?.name || null,
    talla: item.size?.name || null,
    cantidad: item.quantity,
    precio_unitario: item.price,
    costo_unitario: item.cost,
    subtotal: item.price * item.quantity,
  }));

  const { error: detailError } = await supabase.from("detalle_pedido").insert(details);
  if (detailError) throw detailError;

  return {
    ...orderPayload,
    id: data.id,
    orderNumber: data.numero_pedido,
    status: data.estado,
    total: Number(data.total),
  };
}

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value || "",
  );
}