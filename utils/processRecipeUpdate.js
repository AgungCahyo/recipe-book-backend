module.exports = async function processRecipeUpdate({ userId, recipeId, body }) {
  const allowedFields = ['name', 'ingredients', 'steps', 'imageUrl'];
  const updatedData = {};

  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updatedData[field] = body[field];
    }
  }

  await admin.firestore()
    .collection("users")
    .doc(userId)
    .collection("recipes")
    .doc(recipeId)
    .update(updatedData);

  return { updatedData };
};
