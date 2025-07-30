//backend/controllers/recipesController.js
const admin = require("firebase-admin");
const processRecipeUpdate = require("../utils/processRecipeUpdate");

// GET all recipes list for a user
exports.getAllRecipes = async (req, res, next) => {
  const { userId } = req.params;

  if (req.user.uid !== userId) {
    return res.status(403).json({ error: "Akses ditolak." });
  }

  try {
    const snapshot = await admin
      .firestore()
      .collection("users")
      .doc(userId)
      .collection("recipes")
      .orderBy("createdAt", "desc") // optional, untuk urutkan
      .get();

    const recipes = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(recipes);
  } catch (error) {
    console.error("🔥 ERROR get all recipes:", error);
    next(error);
  }
};


exports.getRecipes = async (req, res) => {
  const { userId, recipeId } = req.params;
  if (req.user.uid !== userId) {
    return res.status(403).json({ error: "Akses ditolak." });
  }

  try {
    const doc = await admin
      .firestore()
      .collection("users")
      .doc(userId)
      .collection("recipes")
      .doc(recipeId)
      .get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Resep tidak ditemukan" });
    }

    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error("🔥 ERROR get resep by ID:", error);
    res.status(500).json({ error: "Gagal mengambil resep" });
  }
}


exports.postRecipes = async (req, res, next) => {
  const { userId } = req.params;
  const { name, instructions, ingredients } = req.body;

  if (req.user.uid !== userId) {
    return res.status(403).json({ error: "Akses ditolak." });
  }

  let parsedIngredients;
  if (typeof ingredients === "string") {
  try {
    parsedIngredients = JSON.parse(ingredients);
  } catch (err) {
    return res.status(400).json({ error: "Format ingredients tidak valid (JSON parse error)." });
  }
} else if (Array.isArray(ingredients)) {
  parsedIngredients = ingredients;
} else {
  return res.status(400).json({ error: "Format ingredients tidak valid (bukan array/string)." });
}
  console.log("📥 ingredients masuk:", ingredients);


  if (!name || !Array.isArray(parsedIngredients) || parsedIngredients.length === 0) {
    return res.status(400).json({ error: "Data resep tidak lengkap" });
  }

  try {
    // Cek nama resep duplikat
    const recipeRef = admin
      .firestore()
      .collection("users")
      .doc(userId)
      .collection("recipes");

    const snapshot = await recipeRef.get();
    const isDuplicate = snapshot.docs.some((doc) => {
      const existingName = doc.data().name || "";
      return existingName.trim().toLowerCase() === name.trim().toLowerCase();
    });

    if (isDuplicate) {
      return res.status(400).json({ error: "Resep dengan nama ini sudah ada." });
    }

    // Proses bahan dan hitung totalCost
    let totalCost = 0;
    const enrichedIngredients = [];

    for (const item of parsedIngredients) {
      const ingredientSnap = await admin
        .firestore()
        .collection("users")
        .doc(userId)
        .collection("ingredients")
        .doc(item.ingredientId)
        .get();

      if (!ingredientSnap.exists) {
        return res
          .status(404)
          .json({ error: `Bahan ${item.ingredientId} tidak ditemukan` });
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

    // Upload gambar ke Firebase Storage (jika ada)
    let imageUrl = "";
    if (req.file) {
      const bucket = admin.storage().bucket();
      const fileName = `recipes/${userId}/${Date.now()}_${req.file.originalname}`;
      const file = bucket.file(fileName);

      await file.save(req.file.buffer, {
        metadata: { contentType: req.file.mimetype },
      });

      imageUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
    }

    // Simpan resep ke Firestore
    const newRecipeRef = await recipeRef.add({
      name,
      imageUrl,
      instructions: instructions || "",
      ingredients: enrichedIngredients,
      totalCost,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({
      message: "Resep ditambahkan",
      id: newRecipeRef.id,
      imageUrl,
    });
  } catch (error) {
    next(error);
  }
};

exports.putRecipes = async (req, res, next) => {
  const { userId, recipeId } = req.params;

  try {
    const { updatedData } = await processRecipeUpdate({
      userId,
      recipeId,
      body: req.body,
    });

    res.json({
      message: "Resep berhasil diperbarui",
      updatedFields: Object.keys(updatedData),
    });
  } catch (error) {
    next(error); // biar masuk ke global error handler kamu
  }
};

exports.patchRecipes = async (req, res, next) => {
  const { userId, recipeId } = req.params;
  if (req.user.uid !== userId) {
    return res.status(403).json({ error: "Akses ditolak." });
  }

  try {
    const { updatedData } = await processRecipeUpdate({
      userId,
      recipeId,
      body: req.body,
    });

    res.json({
      message: "Resep berhasil diperbarui",
      updatedFields: Object.keys(updatedData),
    });
  } catch (error) {
    next(error); // biar masuk ke global error handler kamu
  }
};

exports.deleteRecipes =  async (req, res, next) => {
  const { userId, recipeId } = req.params;
  if (req.user.uid !== userId) {
    return res.status(403).json({ error: "Akses ditolak." });
  }

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
    next(error)
   
  }
};
