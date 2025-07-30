async function processRecipeUpdate({ userId, recipeId, body }) {
  const recipeRef = admin.firestore().collection("users").doc(userId).collection("recipes").doc(recipeId);
  const recipeSnap = await recipeRef.get();

  if (!recipeSnap.exists) {
    throw new AppError("Resep tidak ditemukan", 404);
  }

  let updatedData = {};
  let totalCost = 0;
  let enrichedIngredients = [];

  if (body.name !== undefined) updatedData.name = body.name;
  if (body.imageUrl !== undefined) updatedData.imageUrl = body.imageUrl;
  if (body.instructions !== undefined) updatedData.instructions = body.instructions;

  if (Array.isArray(body.ingredients)) {
    for (const item of body.ingredients) {
      const ingSnap = await admin.firestore()
        .collection("users")
        .doc(userId)
        .collection("ingredients")
        .doc(item.ingredientId)
        .get();

      if (!ingSnap.exists) {
        throw new AppError(`Bahan ${item.ingredientId} tidak ditemukan`, 404);
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
  return { updatedData };
}
