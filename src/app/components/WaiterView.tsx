import { useEffect, useState } from "react";
import { supabase } from "../client";

interface WaiterViewProps {
  user: any;
  onLogout: () => void;
}

export default function WaiterView({ user, onLogout }: WaiterViewProps) {
  const [tables, setTables] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedTable, setSelectedTable] = useState<any>(null);

  const [customers, setCustomers] = useState(1);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);

  const [cart, setCart] = useState<any[]>([]);
  const [currentOrders, setCurrentOrders] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: tablesData } = await supabase.from("tables").select("*").order("number");
    const { data: productsData } = await supabase.from("products").select("*");

    setTables(tablesData || []);
    setProducts(productsData || []);
  };

  const assignTable = async () => {
    if (!selectedTable) return;

    const { error } = await supabase
      .from("tables")
      .update({
        status: "ocupada",
        customers,
        assignedwaiter: user.id
      })
      .eq("id", selectedTable.id);

    if (error) return alert(error.message);

    setShowAssignModal(false);
    setSelectedTable(null);
    setCustomers(1);
    loadData();
  };

  const addToCart = (product: any) => {
    const existing = cart.find((item) => item.id === product.id);

    if (existing) {
      setCart(cart.map((item) =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const createOrder = async () => {
    if (!selectedTable || cart.length === 0) {
      return alert("Agrega productos");
    }

    const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

    const { error } = await supabase.from("orders").insert([{
      table_id: selectedTable.id,
      table_number: selectedTable.number,
      waiter_name: user.name,
      status: "pendiente",
      total,
      items: cart
    }]);

    if (error) return alert(error.message);

    setCart([]);
    setShowOrderModal(false);
    setSelectedTable(null);
    loadData();
  };

  const viewOrders = async (table: any) => {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("table_id", table.id)
      .neq("status", "pagado");

    setCurrentOrders(data || []);
  };

  const payTable = async (table: any) => {
    const { data: orders } = await supabase
      .from("orders")
      .select("*")
      .eq("table_id", table.id)
      .neq("status", "pagado");

    if (!orders || orders.length === 0) return alert("No hay cuenta pendiente");

    const total = orders.reduce((acc, order) => acc + order.total, 0);

    if (!confirm(`Total: $${total} ¿Confirmar pago?`)) return;

    await supabase.from("orders").update({ status: "pagado" })
      .eq("table_id", table.id)
      .neq("status", "pagado");

    await supabase.from("tables").update({
      status: "libre",
      customers: 0,
      assignedwaiter: null
    }).eq("id", table.id);

    setCurrentOrders([]);
    loadData();
  };

  const myTables = tables.filter(t => String(t.assignedwaiter) === String(user.id));
  const availableTables = tables.filter(t => t.status === "libre");

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white">

      {/* HEADER */}
      <header className="flex justify-between items-center p-6 border-b border-white/10">
        <div>
          <h1 className="text-2xl font-bold">Panel Mesero</h1>
          <p className="text-gray-400 text-sm">{user.name}</p>
        </div>

        <button
          onClick={onLogout}
          className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-sm"
        >
          Salir
        </button>
      </header>

      {/* GRID */}
      <div className="grid lg:grid-cols-2 gap-6 p-6">

        {/* MESAS DISPONIBLES */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Mesas Disponibles</h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {availableTables.map((table) => (
              <div
                key={table.id}
                onClick={() => {
                  setSelectedTable(table);
                  setShowAssignModal(true);
                }}
                className="bg-green-500/20 border border-green-400 p-6 rounded-xl text-center cursor-pointer hover:scale-105 transition"
              >
                <p className="text-lg font-bold">Mesa {table.number}</p>
                <p className="text-green-300 text-sm">Disponible</p>
              </div>
            ))}
          </div>
        </div>

        {/* MIS MESAS */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Mis Mesas</h2>

          <div className="grid gap-4">
            {myTables.map((table) => (
              <div key={table.id} className="bg-white/10 p-4 rounded-xl border border-white/10">

                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold">Mesa {table.number}</h3>
                  <span className="text-sm text-yellow-300">{table.status}</span>
                </div>

                <p className="text-gray-300 text-sm">{table.customers} personas</p>

                <div className="flex flex-wrap gap-2 mt-3">

                  <button
                    onClick={() => {
                      setSelectedTable(table);
                      setShowOrderModal(true);
                    }}
                    className="bg-blue-500 px-3 py-1 rounded-lg text-sm"
                  >
                    Pedido
                  </button>

                  <button
                    onClick={() => viewOrders(table)}
                    className="bg-purple-500 px-3 py-1 rounded-lg text-sm"
                  >
                    Ver
                  </button>

                  {table.status === "con_cuenta" && (
                    <button
                      onClick={() => payTable(table)}
                      className="bg-green-500 px-3 py-1 rounded-lg text-sm"
                    >
                      Cobrar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODALES */}
      {showAssignModal && selectedTable && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
          <div className="bg-[#1e293b] p-6 rounded-xl w-80">
            <h2 className="text-lg font-bold mb-4">
              Mesa {selectedTable.number}
            </h2>

            <input
              type="number"
              value={customers}
              onChange={(e) => setCustomers(Number(e.target.value))}
              className="w-full p-2 rounded bg-white/10 border border-white/20 mb-4"
            />

            <button
              onClick={assignTable}
              className="w-full bg-blue-500 py-2 rounded-lg"
            >
              Confirmar
            </button>
          </div>
        </div>
      )}

      {showOrderModal && selectedTable && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
          <div className="bg-[#1e293b] p-6 rounded-xl w-96 max-h-[80vh] overflow-y-auto">

            <h2 className="text-lg font-bold mb-4">
              Pedido Mesa {selectedTable.number}
            </h2>

            {products.map((product) => (
              <div
                key={product.id}
                onClick={() => addToCart(product)}
                className="bg-white/10 p-3 mb-2 rounded cursor-pointer hover:bg-white/20"
              >
                {product.name} - ${product.price}
              </div>
            ))}

            <div className="mt-4">
              <h3 className="font-semibold mb-2">Carrito</h3>

              {cart.map((item) => (
                <div key={item.id} className="text-sm">
                  {item.quantity}x {item.name}
                </div>
              ))}
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={createOrder}
                className="w-full bg-green-500 py-2 rounded-lg"
              >
                Enviar
              </button>

              <button
                onClick={() => {
                  setShowOrderModal(false);
                  setCart([]);
                }}
                className="w-full bg-gray-500 py-2 rounded-lg"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {currentOrders.length > 0 && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
          <div className="bg-[#1e293b] p-6 rounded-xl w-96">

            <h2 className="text-lg font-bold mb-4">Pedidos</h2>

            {currentOrders.map((order) => (
              <div key={order.id} className="bg-white/10 p-3 mb-3 rounded">
                <p className="text-sm">Estado: {order.status}</p>
                <p className="text-sm">Total: ${order.total}</p>

                {order.items?.map((item: any, i: number) => (
                  <div key={i} className="text-xs text-gray-300">
                    {item.quantity}x {item.name}
                  </div>
                ))}
              </div>
            ))}

            <button
              onClick={() => setCurrentOrders([])}
              className="w-full bg-red-500 py-2 rounded-lg"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}