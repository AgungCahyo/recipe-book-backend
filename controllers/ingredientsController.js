//backend/controllers/ingredientsController.js

const db = require("../firebase/firebase");
console.log("testiing",db)
// 🔍 Get all ingredients for a specific user
const getIngredients = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ error: "User ID tidak ditemukan di URL" });
  }

  try {
    const ingredientsRef = db
      .collection("users")
      .doc(userId)
      .collection("ingredients");

    const snapshot = await ingredientsRef.get();

    const ingredients = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(ingredients);
  } catch (error) {
    console.error("🔥 ERROR get ingredients:", error);
    res.status(500).json({ message: "Failed to fetch ingredients" });
  }
};

// Tambahkan controller create/update/delete kalau kamu butuh ya.

module.exports = {
  getIngredients,
};
