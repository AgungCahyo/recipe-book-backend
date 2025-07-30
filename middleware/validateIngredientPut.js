module.exports = function validateIngredientInput(req, res, next) {
  const { name, quantity, unit, price } = req.body;

  // Validasi tipe data
  if (name !== undefined && typeof name !== "string") {
    return res.status(400).json({ error: "Field 'name' harus berupa string." });
  }
  if (unit !== undefined && typeof unit !== "string") {
    return res.status(400).json({ error: "Field 'unit' harus berupa string." });
  }
  if (quantity !== undefined && (typeof quantity !== "number" || isNaN(quantity))) {
    return res.status(400).json({ error: "Field 'quantity' harus berupa number." });
  }
  if (price !== undefined && (typeof price !== "number" || isNaN(price))) {
    return res.status(400).json({ error: "Field 'price' harus berupa number." });
  }

  // Validasi nilai logis
  if (quantity !== undefined && quantity < 0) {
    return res.status(400).json({ error: "Field 'quantity' tidak boleh negatif." });
  }
  if (price !== undefined && price < 0) {
    return res.status(400).json({ error: "Field 'price' tidak boleh negatif." });
  }

  next();
};
