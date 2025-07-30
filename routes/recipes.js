const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const authenticateUser = require("../middleware/authenticateUser");

router.use(authenticateUser);

// Ambil semua resep
router.get("/users/:userId/recipes", async (req, res) => {
  const { userId } = req.params;
  try {
    const snapshot = await admin
      .firestore()
      .collection("users")
      .doc(userId)
      .collection("recipes")
      .get();

    const recipes = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(recipes);
  } catch (error) {
    console.error("🔥 ERROR get recipes:", error);
    res.status(500).json({ error: "Gagal mengambil resep" });
  }
});

// Tambah resep baru
router.post("/users/:userId/recipes", async (req, res) => {
  const { userId } = req.params;
  const { name, imageUrl, instructions, ingredients } = req.body;

  if (!name || !Array.isArray(ingredients) || ingredients.length === 0) {
    return res.status(400).json({ error: "Data resep tidak lengkap" });
  }

  try {
    let totalCost = 0;
    const enrichedIngredients = [];
    const recipeRef = admin.firestore().collection("users").doc(userId).collection("recipes");

      const snapshot = await recipeRef.get();
    const isDuplicate = snapshot.docs.some((doc) => {
      const existingName = doc.data().name || "";
      return existingName.trim().toLowerCase() === name.trim().toLowerCase();
    });

    if (isDuplicate) {
      return res
        .status(400)
        .json({ error: "Resep dengan nama ini sudah ada." });
    }

    for (const item of ingredients) {
      const ingredientSnap = await admin
        .firestore()
        .collection("users")
        .doc(userId)
        .collection("ingredients")
        .doc(item.ingredientId)
        .get();

      if (!ingredientSnap.exists) {
        return res.status(404).json({ error: `Bahan ${item.ingredientId} tidak ditemukan` });
      }

      const ing = ingredientSnap.data();
      const totalPrice = ing.pricePerUnit * item.quantity;
      totalCost += totalPrice;

      enrichedIngredients.push({
        ingredientId: item.ingredientId,
        name: ing.name,
        unit: ing.unit,
        quantity: item.quantity,
        pricePerUnit: ing.pricePerUnit,
        totalPrice,
      });
    }

    const newRecipeRef = await admin
      .firestore()
      .collection("users")
      .doc(userId)
      .collection("recipes")
      .add({
        name,
        imageUrl: imageUrl || "",
        instructions: instructions || "",
        ingredients: enrichedIngredients,
        totalCost,
        createdAt: new Date().toISOString(),
      });

    res.status(201).json( "resep ditambahkan", { id: newRecipeRef.id });
  } catch (error) {
    console.error("🔥 ERROR tambah resep:", error);
    res.status(500).json({ error: "Gagal menambahkan resep" });
  }
});

// PATCH: Edit sebagian resep
router.patch("/users/:userId/recipes/:recipeId", async (req, res) => {
  const { userId, recipeId } = req.params;
  const { name, imageUrl, instructions, ingredients } = req.body;

  try {
    const recipeRef = admin
      .firestore()
      .collection("users")
      .doc(userId)
      .collection("recipes")
      .doc(recipeId);

    const recipeSnap = await recipeRef.get();

    if (!recipeSnap.exists) {
      return res.status(404).json({ error: "Resep tidak ditemukan" });
    }

    const updatedData = {};
    let totalCost = 0;
    let enrichedIngredients = [];

    if (name !== undefined) updatedData.name = name;
    if (imageUrl !== undefined) updatedData.imageUrl = imageUrl;
    if (instructions !== undefined) updatedData.instructions = instructions;

    if (Array.isArray(ingredients)) {
      for (const item of ingredients) {
        const ingSnap = await admin
          .firestore()
          .collection("users")
          .doc(userId)
          .collection("ingredients")
          .doc(item.ingredientId)
          .get();

        if (!ingSnap.exists) {
          return res.status(404).json({
            error: `Bahan dengan ID ${item.ingredientId} tidak ditemukan`,
          });
        }

        const ing = ingSnap.data();
        const totalPrice = ing.pricePerUnit * item.quantity;
        totalCost += totalPrice;

        enrichedIngredients.push({
          ingredientId: item.ingredientId,
          name: ing.name,
          unit: ing.unit,
          quantity: item.quantity,
          pricePerUnit: ing.pricePerUnit,
          totalPrice,
        });
      }

      updatedData.ingredients = enrichedIngredients;
      updatedData.totalCost = totalCost;
    }

    await recipeRef.update(updatedData);

    res.json({
      message: "Resep berhasil diperbarui",
      id: recipeId,
      updatedFields: Object.keys(updatedData),
    });
  } catch (error) {
    console.error("🔥 ERROR update resep:", error);
    res.status(500).json({ error: "Gagal memperbarui resep" });
  }
});


// Edit resep
router.put("/users/:userId/recipes/:recipeId", async (req, res) => {
  const { userId, recipeId } = req.params;
  const { name, imageUrl, instructions, ingredients } = req.body;

  try {
    const recipeRef = admin
      .firestore()
      .collection("users")
      .doc(userId)
      .collection("recipes")
      .doc(recipeId);

    const recipeSnap = await recipeRef.get();

    if (!recipeSnap.exists) {
      return res.status(404).json({ error: "Resep tidak ditemukan" });
    }

    let updatedData = {};
    let totalCost = 0;
    let enrichedIngredients = [];

    // Jika ada perubahan nama, imageUrl, atau instructions
    if (name !== undefined) updatedData.name = name;
    if (imageUrl !== undefined) updatedData.imageUrl = imageUrl;
    if (instructions !== undefined) updatedData.instructions = instructions;

    // Kalau ingredients ikut diupdate, hitung ulang totalCost
    if (Array.isArray(ingredients)) {
      for (const item of ingredients) {
        const ingSnap = await admin
          .firestore()
          .collection("users")
          .doc(userId)
          .collection("ingredients")
          .doc(item.ingredientId)
          .get();

        if (!ingSnap.exists) {
          return res
            .status(404)
            .json({ error: `Bahan ${item.ingredientId} tidak ditemukan` });
        }

        const ing = ingSnap.data();
        const totalPrice = ing.pricePerUnit * item.quantity;
        totalCost += totalPrice;

        enrichedIngredients.push({
          ingredientId: item.ingredientId,
          name: ing.name,
          unit: ing.unit,
          quantity: item.quantity,
          pricePerUnit: ing.pricePerUnit,
          totalPrice,
        });
      }

      updatedData.ingredients = enrichedIngredients;
      updatedData.totalCost = totalCost;
    }

    // Update hanya field yang dikirim
    await recipeRef.update(updatedData);

    res.json({ message: "Resep berhasil diperbarui", id: recipeId });
  } catch (error) {
    console.error("🔥 ERROR update resep:", error);
    res.status(500).json({ error: "Gagal memperbarui resep" });
  }
});



// Hapus resep
router.delete("/users/:userId/recipes/:recipeId", async (req, res) => {
  const { userId, recipeId } = req.params;

  try {
    await admin
      .firestore()
      .collection("users")
      .doc(userId)
      .collection("recipes")
      .doc(recipeId)
      .delete();

    res.json({ message: "Resep berhasil dihapus", id: recipeId });
  } catch (error) {
    console.error("🔥 ERROR hapus resep:", error);
    res.status(500).json({ error: "Gagal menghapus resep" });
  }
});

module.exports = router;
