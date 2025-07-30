//backend/controllers/ingredientsController.js
const admin = require("firebase-admin");
const AppError = require("../utils/appError");

exports.getIngredients = async (req, res) => {
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
};

exports.postIngredients = async (req, res, next) => {
  const { userId } = req.params;
  const { name, price, quantity, unit } = req.body;
  try {
    const ingredientsRef = admin
      .firestore()
      .collection("users")
      .doc(userId)
      .collection("ingredients");

    const snapshot = await ingredientsRef.get();
    const isDuplicate = snapshot.docs.some((doc) => {
      const existingName = doc.data().name || "";
      return existingName.trim().toLowerCase() === name.trim().toLowerCase();
    });

    if (isDuplicate) {
      throw new AppError ("Bahan dengan nama ini sudah ada.", 400);
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
    next(error);
  }
};

exports.putIngredients = async (req, res, next) => {
  const { userId, ingredientId } = req.params;
  const { name, quantity, unit, price } = req.body;

  try {
    if (req.user.uid !== userId) {
      throw new AppError("Akses ditolak.", 403);
    }

    const docRef = admin
      .firestore()
      .collection("users")
      .doc(userId)
      .collection("ingredients")
      .doc(ingredientId);

    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      throw new AppError("Bahan tidak ditemukan.", 404);
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (quantity !== undefined) updateData.quantity = quantity;
    if (unit !== undefined) updateData.unit = unit.trim();
    if (price !== undefined) updateData.price = price;

    if ("price" in updateData || "quantity" in updateData) {
      const currentData = docSnap.data();
      const updatedPrice =
        "price" in updateData ? updateData.price : currentData.price;
      const updatedQuantity =
        "quantity" in updateData ? updateData.quantity : currentData.quantity;

      if (updatedQuantity === 0)
        throw new AppError("Quantity tidak boleh 0", 400);

      updateData.pricePerUnit = updatedPrice / updatedQuantity;
    }

    console.log("🔥 UPDATE PAYLOAD:", updateData);

    await docRef.update(updateData);

    res.json({ message: "Bahan berhasil diperbarui", id: ingredientId });
  } catch (error) {
    next(error); // lempar ke middleware error handler
  }
};

exports.deleteIngredients = async (req, res, next) => {
  const { userId, ingredientId } = req.params;

  try {
    const docRef = admin
      .firestore()
      .collection("users")
      .doc(userId)
      .collection("ingredients")
      .doc(ingredientId)

    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      throw new AppError("Bahan tidak ditemukan.", 404);
    }
    await docRef.delete()
    res.json({ message: "Bahan berhasil dihapus", id: ingredientId });
  } catch (error) {
    next(error);
  }
};
