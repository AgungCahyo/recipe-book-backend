const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const authenticateUser = require("../middleware/authenticateUser");

router.use(authenticateUser);

// GET: Ambil semua bahan milik user
router.get("/users/:userId/ingredients", async (req, res) => {
  const { userId } = req.params;

  try {
    const snapshot = await admin
      .firestore()
      .collection("users")
      .doc(userId)
      .collection("ingredients")
      .get();

    const ingredients = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(ingredients);
  } catch (error) {
    console.error("🔥 ERROR get ingredients:", error);
    res.status(500).json({ error: "Gagal mengambil data bahan" });
  }
});

// POST: Tambah bahan baru
router.post("/users/:userId/ingredients", async (req, res) => {
  const { userId } = req.params;
  const { name, price, quantity, unit } = req.body;

  if (!name || !price || !quantity || !unit) {
    return res.status(400).json({ error: "Data bahan tidak lengkap" });
  }

  try {
    const ingredientsRef = admin
      .firestore()
      .collection("users")
      .doc(userId)
      .collection("ingredients");

    // Ambil semua data dulu lalu cek manual apakah nama sudah ada (case-insensitive)
    const snapshot = await ingredientsRef.get();
    const isDuplicate = snapshot.docs.some((doc) => {
      const existingName = doc.data().name || "";
      return existingName.trim().toLowerCase() === name.trim().toLowerCase();
    });

    if (isDuplicate) {
      return res
        .status(400)
        .json({ error: "Bahan dengan nama ini sudah ada." });
    }

    const pricePerUnit = price / quantity;

    const docRef = await ingredientsRef.add({
      name: name.trim(),
      price,
      quantity,
      unit,
      pricePerUnit,
    });

    res.status(201).json({
      id: docRef.id,
      name,
      price,
      quantity,
      unit,
      pricePerUnit,
    });
  } catch (error) {
    console.error("🔥 ERROR tambah bahan:", error);
    res.status(500).json({ error: "Gagal menambahkan bahan" });
  }
});

// PUT: Edit bahan
router.put("/users/:userId/ingredients/:ingredientId", async (req, res) => {
  const { userId, ingredientId } = req.params;
  const { name, price, quantity, unit } = req.body;

  if (!name || !price || !quantity || !unit) {
    return res.status(400).json({ error: "Data bahan tidak lengkap" });
  }

  try {
    const ingredientsRef = admin
      .firestore()
      .collection("users")
      .doc(userId)
      .collection("ingredients");

    const snapshot = await ingredientsRef.get();
    const isDuplicate = snapshot.docs.some((doc) => {
      const existingName = doc.data().name || "";
      return (
        doc.id !== ingredientId &&
        existingName.trim().toLowerCase() === name.trim().toLowerCase()
      );
    });

    if (isDuplicate) {
      return res
        .status(400)
        .json({ error: "Nama bahan ini sudah digunakan oleh bahan lain." });
    }

    const pricePerUnit = price / quantity;

    await ingredientsRef.doc(ingredientId).update({
      name: name.trim(),
      price,
      quantity,
      unit,
      pricePerUnit,
    });

    res.json({
      id: ingredientId,
      name,
      price,
      quantity,
      unit,
      pricePerUnit,
    });
  } catch (error) {
    console.error("🔥 ERROR update bahan:", error);
    res.status(500).json({ error: "Gagal mengupdate bahan" });
  }
});

// DELETE: Hapus bahan
router.delete("/users/:userId/ingredients/:ingredientId", async (req, res) => {
  const { userId, ingredientId } = req.params;

  try {
    await admin
      .firestore()
      .collection("users")
      .doc(userId)
      .collection("ingredients")
      .doc(ingredientId)
      .delete();

    res.json({ message: "Bahan berhasil dihapus", id: ingredientId });
  } catch (error) {
    console.error("🔥 ERROR hapus bahan:", error);
    res.status(500).json({ error: "Gagal menghapus bahan" });
  }
});

module.exports = router;
