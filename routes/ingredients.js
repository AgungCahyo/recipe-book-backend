const express = require("express");
const router = express.Router();
const authenticateUser = require("../middleware/authenticateUser");
const validateIngredientPut = require("../middleware/validateIngredientPut");
const validateIngredientPost = require("../middleware/validateIngredientPost");
const { getIngredients, deleteIngredients, putIngredients, postIngredients } = require("../controllers/ingredientsController");

router.use(authenticateUser);
router.get("/users/:userId/ingredients", getIngredients);
router.post("/users/:userId/ingredients", validateIngredientPost, postIngredients);
router.put("/users/:userId/ingredients/:ingredientId", validateIngredientPut, putIngredients);
router.delete("/users/:userId/ingredients/:ingredientId", deleteIngredients);

module.exports = router;