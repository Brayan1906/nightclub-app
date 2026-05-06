import { useEffect, useState } from "react";
import { supabase } from "../client";

interface Props {
  user: any;
  onLogout: () => void;
}

export default function BarView({ user, onLogout }: Props) {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .neq("status", "pagado")
      .order("created_at");

    if (error) return console.log(error);

    setOrders(data || []);
  };

  const updateStatus = async (order: any, newStatus: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", order.id);

    if (error) return alert(error.message);

    if (newStatus === "entregado") {
      await supabase
        .from("tables")
        .update({ status: "con_cuenta" })
        .eq("id", order.table_id);
    }

    loadOrders();
  };

  // 🎨 colores por estado
  const statusStyles: any = {
    pendiente: "bg-red-500/20 border-red-400",
    en_preparacion: "bg-yellow-500/20 border-yellow-400",
    entregado: "bg-green-500/20 border-green-400"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020617] to-[#1e293b] text-white">

      {/* HEADER */}
      <header className="flex justify-between items-center p-6 border-b border-white/10">
        <div>
          <h1 className="text-2xl font-bold">Barra / Cocina</h1>
          <p className="text-gray-400 text-sm">{user.name}</p>
        </div>

        <button
          onClick={onLogout}
          className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-sm"
        >
          Salir
        </button>
      </header>

      {/* PEDIDOS */}
      <div className="p-6 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

        {orders.length === 0 && (
          <p className="text-gray-400 col-span-full text-center">
            No hay pedidos pendientes
          </p>
        )}

        {orders.map((order) => (
          <div
            key={order.id}
            className={`p-5 rounded-xl border shadow-lg ${statusStyles[order.status]}`}
          >
            {/* INFO PRINCIPAL */}
            <div className="mb-3">
              <h2 className="text-xl font-bold">
                Mesa {order.table_number}
              </h2>

              <p className="text-sm text-gray-300">
                Mesero: {order.waiter_name}
              </p>

              <p className="text-sm">
                Estado: <span className="font-semibold">{order.status}</span>
              </p>
            </div>

            {/* PRODUCTOS */}
            <div className="bg-black/20 rounded-lg p-3 mb-3">
              <h3 className="font-semibold mb-2 text-sm">
                Pedido:
              </h3>

              {order.items?.map((item: any, index: number) => (
                <div
                  key={index}
                  className="flex justify-between text-sm border-b border-white/10 py-1"
                >
                  <span>{item.name}</span>
                  <span>x{item.quantity}</span>
                </div>
              ))}
            </div>

            {/* TOTAL */}
            <p className="font-bold text-lg mb-3">
              ${order.total}
            </p>

            {/* ACCIONES */}
            {order.status === "pendiente" && (
              <button
                onClick={() => updateStatus(order, "en_preparacion")}
                className="w-full bg-yellow-500 hover:bg-yellow-600 py-2 rounded-lg text-sm font-semibold"
              >
                Preparar
              </button>
            )}

            {order.status === "en_preparacion" && (
              <button
                onClick={() => updateStatus(order, "entregado")}
                className="w-full bg-green-500 hover:bg-green-600 py-2 rounded-lg text-sm font-semibold"
              >
                Entregar
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}