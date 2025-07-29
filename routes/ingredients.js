// backend/routes/ingredients.js
const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const authenticateUser = require('../middleware/authenticateUser');

router.use(authenticateUser);

// 🔼 Tambah ingredient baru
router.post('/users/:userId/ingredients', async (req, res) => {
  const { userId } = req.params;
  const newIngredient = req.body;

  if (!newIngredient.name || !newIngredient.price || !newIngredient.unit) {
    return res.status(400).json({ error: "Data ingredient tidak lengkap" });
  }

  try {
    const docRef = await admin
      .firestore()
      .collection("users")
      .doc(userId)
      .collection("ingredients")
      .add(newIngredient);

    res.status(201).json({ id: docRef.id, ...newIngredient });
  } catch (error) {
    console.error("🔥 ERROR saat menambahkan ingredient:", error);
    res.status(500).json({ error: "Gagal menambahkan ingredient" });
  }
});

// ✏️ Update ingredient
router.put('/users/:userId/ingredients/:ingredientId', async (req, res) => {
  const { userId, ingredientId } = req.params;
  const updatedData = req.body;

  try {
    await admin
      .firestore()
      .collection("users")
      .doc(userId)
      .collection("ingredients")
      .doc(ingredientId)
      .update(updatedData);

    res.json({ id: ingredientId, ...updatedData });
  } catch (error) {
    console.error("🔥 ERROR saat update ingredient:", error);
    res.status(500).json({ error: "Gagal mengupdate ingredient" });
  }
});

// 🗑️ Hapus ingredient
router.delete('/users/:userId/ingredients/:ingredientId', async (req, res) => {
  const { userId, ingredientId } = req.params;

  try {
    await admin
      .firestore()
      .collection("users")
      .doc(userId)
      .collection("ingredients")
      .doc(ingredientId)
      .delete();

    res.json({ message: "Ingredient berhasil dihapus", id: ingredientId });
  } catch (error) {
    console.error("🔥 ERROR saat hapus ingredient:", error);
    res.status(500).json({ error: "Gagal menghapus ingredient" });
  }
});

// 📥 Ambil semua ingredient
router.get('/users/:userId/ingredients', async (req, res) => {
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
    res.status(500).json({ message: "Failed to fetch ingredients" });
  }
});

module.exports = router;
