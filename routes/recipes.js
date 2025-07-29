const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const authenticateUser = require('../middleware/authenticateUser');

router.use(authenticateUser);

// 📥 Ambil semua resep
router.get('/users/:userId/recipes', async (req, res) => {
  const { userId } = req.params;

  try {
    const snapshot = await admin
      .firestore()
      .collection('users')
      .doc(userId)
      .collection('recipes')
      .get();

    const recipes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(recipes);
  } catch (error) {
    console.error('🔥 ERROR get recipes:', error);
    res.status(500).json({ error: 'Gagal mengambil data resep' });
  }
});

// ➕ Tambah resep
router.post('/users/:userId/recipes', async (req, res) => {
  const { userId } = req.params;
  const newRecipe = req.body;

  if (!newRecipe.title || !newRecipe.ingredients || !Array.isArray(newRecipe.ingredients)) {
    return res.status(400).json({ error: 'Data resep tidak lengkap atau format ingredients salah' });
  }

  try {
    const docRef = await admin
      .firestore()
      .collection('users')
      .doc(userId)
      .collection('recipes')
      .add(newRecipe);

    res.status(201).json({ id: docRef.id, ...newRecipe });
  } catch (error) {
    console.error('🔥 ERROR saat menambahkan resep:', error);
    res.status(500).json({ error: 'Gagal menambahkan resep' });
  }
});

// ✏️ Edit resep
router.put('/users/:userId/recipes/:recipeId', async (req, res) => {
  const { userId, recipeId } = req.params;
  const updatedData = req.body;

  try {
    await admin
      .firestore()
      .collection('users')
      .doc(userId)
      .collection('recipes')
      .doc(recipeId)
      .update(updatedData);

    res.json({ id: recipeId, ...updatedData });
  } catch (error) {
    console.error('🔥 ERROR update resep:', error);
    res.status(500).json({ error: 'Gagal mengupdate resep' });
  }
});

// 🗑️ Hapus resep
router.delete('/users/:userId/recipes/:recipeId', async (req, res) => {
  const { userId, recipeId } = req.params;

  try {
    await admin
      .firestore()
      .collection('users')
      .doc(userId)
      .collection('recipes')
      .doc(recipeId)
      .delete();

    res.json({ message: 'Resep berhasil dihapus', id: recipeId });
  } catch (error) {
    console.error('🔥 ERROR hapus resep:', error);
    res.status(500).json({ error: 'Gagal menghapus resep' });
  }
});

module.exports = router;
