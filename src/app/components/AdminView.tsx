import { useEffect, useState } from "react";
import { supabase } from "../client";
import {
  DollarSign,
  Users,
  Table2,
  UtensilsCrossed
} from "lucide-react";

interface Props {
  user: any;
  onLogout: () => void;
}

export default function AdminView({ user, onLogout }: Props) {
  const [activeTab, setActiveTab] = useState("dashboard");

  const [tables, setTables] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  const [newTable, setNewTable] = useState("");

  const [newProduct, setNewProduct] = useState({
    name: "",
    price: 0
  });

  const [newUser, setNewUser] = useState({
    name: "",
    username: "",
    password: "",
    role: "mesero"
  });

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    const { data: tableData } = await supabase.from("tables").select("*").order("number");
    const { data: productData } = await supabase.from("products").select("*");
    const { data: userData } = await supabase.from("users").select("*");
    const { data: orderData } = await supabase.from("orders").select("*");

    setTables(tableData || []);
    setProducts(productData || []);
    setUsers(userData || []);
    setOrders(orderData || []);
  };

  const totalVentas = orders
    .filter((o) => o.status === "pagado")
    .reduce((acc, order) => acc + order.total, 0);

  const createTable = async () => {
    if (!newTable) return alert("Ingresa número");

    await supabase.from("tables").insert([{
      number: Number(newTable),
      status: "libre",
      customers: 0
    }]);

    setNewTable("");
    loadAll();
  };

  const createProduct = async () => {
    if (!newProduct.name || newProduct.price <= 0) {
      return alert("Completa datos");
    }

    await supabase.from("products").insert([newProduct]);

    setNewProduct({ name: "", price: 0 });
    loadAll();
  };

  const createUser = async () => {
    if (!newUser.name || !newUser.username || !newUser.password) {
      return alert("Completa todo");
    }

    await supabase.from("users").insert([newUser]);

    setNewUser({
      name: "",
      username: "",
      password: "",
      role: "mesero"
    });

    loadAll();
  };

  const deleteUser = async (id: string) => {
    if (!confirm("¿Eliminar usuario?")) return;

    await supabase.from("users").delete().eq("id", id);
    loadAll();
  };

  return (
    <div className="min-h-screen flex bg-[#0f172a] text-white">

      {/* SIDEBAR */}
      <aside className="w-64 bg-[#020617] p-6 border-r border-white/10 hidden md:block">
        <h1 className="text-xl font-bold mb-8">Admin Panel</h1>

        {["dashboard", "tables", "products", "users"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`block w-full text-left px-4 py-2 rounded-lg mb-2 transition ${
              activeTab === tab
                ? "bg-blue-600"
                : "hover:bg-white/10"
            }`}
          >
            {tab}
          </button>
        ))}

        <button
          onClick={onLogout}
          className="mt-10 bg-red-500 w-full py-2 rounded-lg"
        >
          Salir
        </button>
      </aside>

      {/* CONTENIDO */}
      <main className="flex-1 p-6">

        {/* DASHBOARD */}
        {activeTab === "dashboard" && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

            <div className="bg-white/10 p-6 rounded-xl">
              <DollarSign size={28} />
              <p className="mt-2 text-sm text-gray-300">Ventas</p>
              <h2 className="text-2xl font-bold text-green-400">
                ${totalVentas}
              </h2>
            </div>

            <div className="bg-white/10 p-6 rounded-xl">
              <Table2 size={28} />
              <p className="mt-2 text-sm text-gray-300">Mesas</p>
              <h2 className="text-2xl font-bold">
                {tables.length}
              </h2>
            </div>

            <div className="bg-white/10 p-6 rounded-xl">
              <UtensilsCrossed size={28} />
              <p className="mt-2 text-sm text-gray-300">Productos</p>
              <h2 className="text-2xl font-bold">
                {products.length}
              </h2>
            </div>

            <div className="bg-white/10 p-6 rounded-xl">
              <Users size={28} />
              <p className="mt-2 text-sm text-gray-300">Usuarios</p>
              <h2 className="text-2xl font-bold">
                {users.length}
              </h2>
            </div>
          </div>
        )}

        {/* MESAS */}
        {activeTab === "tables" && (
          <div>
            <h2 className="text-xl font-bold mb-4">Mesas</h2>

            <div className="flex gap-2 mb-6">
              <input
                value={newTable}
                onChange={(e) => setNewTable(e.target.value)}
                placeholder="Número"
                className="p-2 rounded bg-white/10 border border-white/20"
              />

              <button
                onClick={createTable}
                className="bg-blue-500 px-4 rounded"
              >
                Crear
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {tables.map((t) => (
                <div key={t.id} className="bg-white/10 p-4 rounded-xl">
                  Mesa {t.number}
                  <p className="text-sm text-gray-400">{t.status}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PRODUCTOS */}
        {activeTab === "products" && (
          <div>
            <h2 className="text-xl font-bold mb-4">Productos</h2>

            <div className="flex gap-2 mb-6">
              <input
                placeholder="Nombre"
                className="p-2 rounded bg-white/10 border border-white/20"
                value={newProduct.name}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, name: e.target.value })
                }
              />

              <input
                type="number"
                placeholder="Precio"
                className="p-2 rounded bg-white/10 border border-white/20"
                value={newProduct.price}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, price: Number(e.target.value) })
                }
              />

              <button
                onClick={createProduct}
                className="bg-purple-500 px-4 rounded"
              >
                Crear
              </button>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {products.map((p) => (
                <div key={p.id} className="bg-white/10 p-4 rounded-xl">
                  {p.name}
                  <p className="text-green-400">${p.price}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* USUARIOS */}
        {activeTab === "users" && (
          <div>
            <h2 className="text-xl font-bold mb-4">Usuarios</h2>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <input
                placeholder="Nombre"
                className="p-2 rounded bg-white/10 border border-white/20"
                onChange={(e) =>
                  setNewUser({ ...newUser, name: e.target.value })
                }
              />

              <input
                placeholder="Username"
                className="p-2 rounded bg-white/10 border border-white/20"
                onChange={(e) =>
                  setNewUser({ ...newUser, username: e.target.value })
                }
              />

              <input
                type="password"
                placeholder="Password"
                className="p-2 rounded bg-white/10 border border-white/20"
                onChange={(e) =>
                  setNewUser({ ...newUser, password: e.target.value })
                }
              />

              <select
                className="p-2 rounded bg-white/10 border border-white/20"
                onChange={(e) =>
                  setNewUser({ ...newUser, role: e.target.value })
                }
              >
                <option value="mesero">Mesero</option>
                <option value="barra">Barra</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <button
              onClick={createUser}
              className="bg-green-500 px-4 py-2 rounded mb-6"
            >
              Crear Usuario
            </button>

            <div className="grid md:grid-cols-3 gap-4">
              {users.map((u) => (
                <div key={u.id} className="bg-white/10 p-4 rounded-xl">
                  <h3 className="font-bold">{u.name}</h3>
                  <p className="text-sm text-gray-400">{u.role}</p>

                  {u.role !== "admin" && (
                    <button
                      onClick={() => deleteUser(u.id)}
                      className="bg-red-500 px-3 py-1 rounded mt-2 text-sm"
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}