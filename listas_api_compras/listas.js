const express = require("express");
const router = express.Router();
const db = require("../firebase");

router.get("/", async (req, res) => {
    try {
        const snapshot = await db.collection("lista_compras").get();
        const lista_compras = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        res.json(lista_compras);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})
router.post("/", async (req, res) => {
    try {
        console.log(req.body);
        const { nombre, items } = req.body;

        const listaRef = await db.collection("lista_compras").add({
            nombre,
            createdAt: new Date()
        });

        const listaId = listaRef.id;

        const batch = db.batch();

        items.forEach(item => {

            const itemRef = db
                .collection("lista_compras")
                .doc(listaId)
                .collection("items")
                .doc();

            batch.set(itemRef, {
                proveedorId: item.proveedorId,
                productoId: item.productoId,
                cantidad: item.cantidad,
                checked: false
            });

        });

        await batch.commit();

        res.json({
            id: listaId,
            nombre
        });

    } catch (error) {

        res.status(500).json({ error: error.message });

    }

})
router.get("/:id", async (req, res) => {

    try {

        const { id } = req.params;
        console.log("id", id);

        const listaDoc = await db.collection("lista_compras").doc(id).get();

        if (!listaDoc.exists) {
            return res.status(404).json({ error: "Lista no encontrada" });
        }

        const lista = listaDoc.data();


        // 🔥 CARGAR ITEMS DE LA SUBCOLECCION
        const itemsSnap = await db
            .collection("lista_compras")
            .doc(id)
            .collection("items")
            .get();

        const items = itemsSnap.docs.map(doc => doc.data());


        const proveedoresSnap = await db.collection("proveedores").get();

        const data = [];

        for (const provDoc of proveedoresSnap.docs) {

            const productosSnap = await provDoc.ref.collection("productos").get();

            const productos = productosSnap.docs.map(prod => {

                const itemLista = items.find(
                    i => i.productoId === prod.id
                );

                return {
                    id: prod.id,
                    name: prod.data().name,
                    cantidad: itemLista ? itemLista.cantidad : 0
                };

            });

            data.push({
                id: provDoc.id,
                name: provDoc.data().name,
                productos
            });

        }

        res.json({
            id: listaDoc.id,
            nombre: lista.nombre,
            data
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({ error: error.message });

    }

});
router.put("/:id/items", async (req, res) => {

    try {

        const { id } = req.params;
        const { items } = req.body;
        console.log(id);
        console.log(items);


        const itemsRef = db
            .collection("lista_compras")
            .doc(id)
            .collection("items");

        const snap = await itemsRef.get();

        const batch = db.batch();

        // borrar items actuales
        snap.docs.forEach(doc => {
            batch.delete(doc.ref);
        });

        // crear nuevos
        items.forEach(item => {

            const ref = itemsRef.doc();

            batch.set(ref, {
                productoId: item.productoId,
                proveedorId: item.proveedorId,
                cantidad: item.cantidad
            });

        });

        await batch.commit();

        res.json({
            message: "Lista actualizada"
        });

    } catch (error) {

        res.status(500).json({ error: error.message });

    }

});

router.delete("/:id", async (req, res) => {
    console.log("DELETE ID:", req.params.id);
    try {

        const { id } = req.params;
        console.log(id);


        await db.collection("lista_compras").doc(id).delete();

        res.json({
            message: "Lista eliminada correctamente"
        });

    } catch (error) {

        res.status(500).json({ error: error.message });

    }

});




module.exports = router;