//backend/controllers/recipesController.js
const db = require("../firebase/firebase");

// GET all recipes for a user
const getAllRecipes = async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'userId harus disertakan di query params (?userId=...)' });
  }

  try {
    const recipesRef = db.collection('users').doc(userId).collection('recipes');
    const snapshot = await recipesRef.get();

    const recipes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(recipes);
  } catch (error) {
    console.error('🔥 Error saat mengambil resep:', error);
    res.status(500).json({ error: 'Gagal mengambil resep' });
  }
};

// POST new recipe
const createRecipe = async (req, res) => {
  const { userId, title, ingredients, instructions, imageUrl } = req.body;

  if (!userId || !title || !ingredients) {
    return res.status(400).json({ error: 'userId, title, dan ingredients wajib diisi' });
  }

  try {
    const recipeData = {
      title,
      ingredients,
      instructions: instructions || '',
      imageUrl: imageUrl || '',
      createdAt: new Date().toISOString(),
    };

    const newRecipeRef = await db
      .collection('users')
      .doc(userId)
      .collection('recipes')
      .add(recipeData);

    res.status(201).json({
      message: 'Resep berhasil ditambahkan',
      id: newRecipeRef.id,
      ...recipeData,
    });
  } catch (error) {
    console.error('🔥 Error saat menambahkan resep:', error);
    res.status(500).json({ error: 'Gagal menambahkan resep' });
  }
};

module.exports = {
  getAllRecipes,
  createRecipe,
};
