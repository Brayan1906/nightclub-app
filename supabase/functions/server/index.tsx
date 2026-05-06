import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-368d155e/health", (c) => {
  return c.json({ status: "ok" });
});

// ===== AUTENTICACIÓN =====

// Login
app.post("/make-server-368d155e/auth/login", async (c) => {
  try {
    const { username, password, role } = await c.req.json();

    // Obtener usuarios
    const users = await kv.get("users") || [];

    // Buscar usuario
    const user = users.find((u: any) =>
      u.username === username && u.password === password && u.role === role
    );

    if (!user) {
      return c.json({ error: "Credenciales inválidas" }, 401);
    }

    // Generar token simple (en producción usar JWT)
    const token = `${user.id}-${Date.now()}`;

    return c.json({
      success: true,
      user: { id: user.id, username: user.username, role: user.role },
      token
    });
  } catch (error) {
    console.log("Error en login:", error);
    return c.json({ error: `Error al iniciar sesión: ${error.message}` }, 500);
  }
});

// Inicializar datos por defecto
app.post("/make-server-368d155e/init", async (c) => {
  try {
    // Crear usuarios por defecto
    const defaultUsers = [
      { id: "1", username: "mesero1", password: "123", role: "mesero", name: "Juan Pérez" },
      { id: "2", username: "mesero2", password: "123", role: "mesero", name: "María López" },
      { id: "3", username: "barra1", password: "123", role: "barra", name: "Carlos Ruiz" },
      { id: "4", username: "admin", password: "admin", role: "admin", name: "Administrador" },
    ];

    await kv.set("users", defaultUsers);

    // Crear productos por defecto
    const defaultProducts = [
      { id: "p1", name: "Cerveza Nacional", price: 15000, category: "Bebidas" },
      { id: "p2", name: "Cerveza Importada", price: 20000, category: "Bebidas" },
      { id: "p3", name: "Whisky", price: 35000, category: "Licores" },
      { id: "p4", name: "Ron", price: 30000, category: "Licores" },
      { id: "p5", name: "Vodka", price: 30000, category: "Licores" },
      { id: "p6", name: "Tequila", price: 32000, category: "Licores" },
      { id: "p7", name: "Mojito", price: 25000, category: "Cocteles" },
      { id: "p8", name: "Margarita", price: 25000, category: "Cocteles" },
      { id: "p9", name: "Piña Colada", price: 28000, category: "Cocteles" },
      { id: "p10", name: "Agua", price: 5000, category: "Bebidas" },
      { id: "p11", name: "Gaseosa", price: 8000, category: "Bebidas" },
      { id: "p12", name: "Papas Fritas", price: 15000, category: "Comida" },
      { id: "p13", name: "Alitas", price: 25000, category: "Comida" },
      { id: "p14", name: "Nachos", price: 20000, category: "Comida" },
    ];

    await kv.set("products", defaultProducts);

    // Crear mesas por defecto (20 mesas)
    const defaultTables = [];
    for (let i = 1; i <= 20; i++) {
      defaultTables.push({
        id: `table-${i}`,
        number: i,
        status: "libre", // libre, ocupada, con_cuenta
        assignedWaiter: null,
        customers: 0,
        openedAt: null,
      });
    }

    await kv.set("tables", defaultTables);

    // Inicializar pedidos vacíos
    await kv.set("orders", []);

    return c.json({ success: true, message: "Sistema inicializado correctamente" });
  } catch (error) {
    console.log("Error en init:", error);
    return c.json({ error: `Error al inicializar: ${error.message}` }, 500);
  }
});

// ===== PRODUCTOS =====

// Obtener todos los productos
app.get("/make-server-368d155e/products", async (c) => {
  try {
    const products = await kv.get("products") || [];
    return c.json(products);
  } catch (error) {
    console.log("Error al obtener productos:", error);
    return c.json({ error: `Error al obtener productos: ${error.message}` }, 500);
  }
});

// Crear producto
app.post("/make-server-368d155e/products", async (c) => {
  try {
    const product = await c.req.json();
    const products = await kv.get("products") || [];

    const newProduct = {
      id: `p${Date.now()}`,
      ...product,
    };

    products.push(newProduct);
    await kv.set("products", products);

    return c.json(newProduct);
  } catch (error) {
    console.log("Error al crear producto:", error);
    return c.json({ error: `Error al crear producto: ${error.message}` }, 500);
  }
});

// Actualizar producto
app.put("/make-server-368d155e/products/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();

    const products = await kv.get("products") || [];
    const index = products.findIndex((p: any) => p.id === id);

    if (index === -1) {
      return c.json({ error: "Producto no encontrado" }, 404);
    }

    products[index] = { ...products[index], ...updates };
    await kv.set("products", products);

    return c.json(products[index]);
  } catch (error) {
    console.log("Error al actualizar producto:", error);
    return c.json({ error: `Error al actualizar producto: ${error.message}` }, 500);
  }
});

// Eliminar producto
app.delete("/make-server-368d155e/products/:id", async (c) => {
  try {
    const id = c.req.param("id");

    const products = await kv.get("products") || [];
    const filtered = products.filter((p: any) => p.id !== id);

    await kv.set("products", filtered);

    return c.json({ success: true });
  } catch (error) {
    console.log("Error al eliminar producto:", error);
    return c.json({ error: `Error al eliminar producto: ${error.message}` }, 500);
  }
});

// ===== MESAS =====

// Obtener todas las mesas
app.get("/make-server-368d155e/tables", async (c) => {
  try {
    const tables = await kv.get("tables") || [];
    return c.json(tables);
  } catch (error) {
    console.log("Error al obtener mesas:", error);
    return c.json({ error: `Error al obtener mesas: ${error.message}` }, 500);
  }
});

// Asignar mesa
app.post("/make-server-368d155e/tables/:id/assign", async (c) => {
  try {
    const id = c.req.param("id");
    const { waiterId, customers } = await c.req.json();

    const tables = await kv.get("tables") || [];
    const index = tables.findIndex((t: any) => t.id === id);

    if (index === -1) {
      return c.json({ error: "Mesa no encontrada" }, 404);
    }

    tables[index].status = "ocupada";
    tables[index].assignedWaiter = waiterId;
    tables[index].customers = customers;
    tables[index].openedAt = new Date().toISOString();

    await kv.set("tables", tables);

    return c.json(tables[index]);
  } catch (error) {
    console.log("Error al asignar mesa:", error);
    return c.json({ error: `Error al asignar mesa: ${error.message}` }, 500);
  }
});

// Liberar mesa
app.post("/make-server-368d155e/tables/:id/free", async (c) => {
  try {
    const id = c.req.param("id");

    const tables = await kv.get("tables") || [];
    const index = tables.findIndex((t: any) => t.id === id);

    if (index === -1) {
      return c.json({ error: "Mesa no encontrada" }, 404);
    }

    tables[index].status = "libre";
    tables[index].assignedWaiter = null;
    tables[index].customers = 0;
    tables[index].openedAt = null;

    await kv.set("tables", tables);

    // Eliminar pedidos de esta mesa
    const orders = await kv.get("orders") || [];
    const filteredOrders = orders.filter((o: any) => o.tableId !== id);
    await kv.set("orders", filteredOrders);

    return c.json(tables[index]);
  } catch (error) {
    console.log("Error al liberar mesa:", error);
    return c.json({ error: `Error al liberar mesa: ${error.message}` }, 500);
  }
});

// ===== PEDIDOS =====

// Obtener todos los pedidos
app.get("/make-server-368d155e/orders", async (c) => {
  try {
    const orders = await kv.get("orders") || [];
    return c.json(orders);
  } catch (error) {
    console.log("Error al obtener pedidos:", error);
    return c.json({ error: `Error al obtener pedidos: ${error.message}` }, 500);
  }
});

// Crear pedido
app.post("/make-server-368d155e/orders", async (c) => {
  try {
    const orderData = await c.req.json();
    const orders = await kv.get("orders") || [];

    const newOrder = {
      id: `order-${Date.now()}`,
      tableId: orderData.tableId,
      tableNumber: orderData.tableNumber,
      waiterId: orderData.waiterId,
      waiterName: orderData.waiterName,
      items: orderData.items,
      status: "pendiente", // pendiente, en_preparacion, listo, entregado
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    orders.push(newOrder);
    await kv.set("orders", orders);

    // Actualizar estado de la mesa a "con_cuenta"
    const tables = await kv.get("tables") || [];
    const tableIndex = tables.findIndex((t: any) => t.id === orderData.tableId);
    if (tableIndex !== -1) {
      tables[tableIndex].status = "con_cuenta";
      await kv.set("tables", tables);
    }

    return c.json(newOrder);
  } catch (error) {
    console.log("Error al crear pedido:", error);
    return c.json({ error: `Error al crear pedido: ${error.message}` }, 500);
  }
});

// Actualizar estado de pedido
app.put("/make-server-368d155e/orders/:id/status", async (c) => {
  try {
    const id = c.req.param("id");
    const { status } = await c.req.json();

    const orders = await kv.get("orders") || [];
    const index = orders.findIndex((o: any) => o.id === id);

    if (index === -1) {
      return c.json({ error: "Pedido no encontrado" }, 404);
    }

    orders[index].status = status;
    orders[index].updatedAt = new Date().toISOString();

    await kv.set("orders", orders);

    return c.json(orders[index]);
  } catch (error) {
    console.log("Error al actualizar pedido:", error);
    return c.json({ error: `Error al actualizar pedido: ${error.message}` }, 500);
  }
});

// Obtener cuenta de una mesa
app.get("/make-server-368d155e/tables/:id/bill", async (c) => {
  try {
    const id = c.req.param("id");

    const orders = await kv.get("orders") || [];
    const tableOrders = orders.filter((o: any) => o.tableId === id);

    let total = 0;
    const items: any[] = [];

    tableOrders.forEach((order: any) => {
      order.items.forEach((item: any) => {
        const subtotal = item.price * item.quantity;
        total += subtotal;
        items.push({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          subtotal,
        });
      });
    });

    return c.json({
      tableId: id,
      items,
      total,
      ordersCount: tableOrders.length,
    });
  } catch (error) {
    console.log("Error al obtener cuenta:", error);
    return c.json({ error: `Error al obtener cuenta: ${error.message}` }, 500);
  }
});

// ===== ESTADÍSTICAS =====

// Obtener estadísticas generales
app.get("/make-server-368d155e/stats", async (c) => {
  try {
    const tables = await kv.get("tables") || [];
    const orders = await kv.get("orders") || [];

    const freeTables = tables.filter((t: any) => t.status === "libre").length;
    const occupiedTables = tables.filter((t: any) => t.status === "ocupada" || t.status === "con_cuenta").length;

    const pendingOrders = orders.filter((o: any) => o.status === "pendiente").length;
    const preparingOrders = orders.filter((o: any) => o.status === "en_preparacion").length;
    const readyOrders = orders.filter((o: any) => o.status === "listo").length;

    let totalSales = 0;
    orders.forEach((order: any) => {
      order.items.forEach((item: any) => {
        totalSales += item.price * item.quantity;
      });
    });

    return c.json({
      tables: {
        total: tables.length,
        free: freeTables,
        occupied: occupiedTables,
      },
      orders: {
        total: orders.length,
        pending: pendingOrders,
        preparing: preparingOrders,
        ready: readyOrders,
      },
      sales: {
        total: totalSales,
      },
    });
  } catch (error) {
    console.log("Error al obtener estadísticas:", error);
    return c.json({ error: `Error al obtener estadísticas: ${error.message}` }, 500);
  }
});

Deno.serve(app.fetch);
