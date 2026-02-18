const express = require("express");
const cors = require("cors");
const db = require("./firebase");

require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

/* =========================
   CREAR PROVEEDOR
========================= */

app.post("/proveedores", async (req, res) => {
  try {
    const { name, id } = req.body;
    console.log(name);
    console.log(id);

    const proveedorRef = await db.collection("proveedores").add({
      name,
      createdAt: new Date(),
    });

    res.json({ id: proveedorRef.id, name, productos: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* =========================
   AÑADIR PRODUCTO A PROVEEDOR
========================= */

app.post("/proveedores/:id/productos", async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    console.log(name);
    console.log(id);

    const productoRef = await db
      .collection("proveedores")
      .doc(id)
      .collection("productos")
      .add({
        name,
        createdAt: new Date(),
      });

    res.json({ id: productoRef.id, name });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* =========================
   OBTENER PROVEEDORES CON PRODUCTOS
========================= */

app.get("/proveedores", async (req, res) => {
  try {

    console.log("hola");

    const snapshot = await db.collection("proveedores").get();

    const proveedores = [];

    for (const doc of snapshot.docs) {
      const productosSnap = await doc.ref.collection("productos").get();

      const productos = productosSnap.docs.map(p => ({
        id: p.id,
        ...p.data()
      }));

      proveedores.push({
        id: doc.id,
        ...doc.data(),
        productos
      });
    }

    res.json(proveedores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* =========================
   ELIMINAR PRODUCTO
========================= */

app.delete("/proveedores/:proveedorId/productos/:productoId", async (req, res) => {
  try {
    const { proveedorId, productoId } = req.params;

    await db
      .collection("proveedores")
      .doc(proveedorId)
      .collection("productos")
      .doc(productoId)
      .delete();

    res.json({ message: "Producto eliminado correctamente" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Servidor corriendo en Port");
});
