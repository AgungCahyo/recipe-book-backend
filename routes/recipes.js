const express = require("express");
const router = express.Router();

const authenticateUser = require("../middleware/authenticateUser");
const { getRecipes, postRecipes, patchRecipes, putRecipes, deleteRecipes, getAllRecipes } = require("../controllers/recipesController");
const upload = require("../middleware/uploadImage");

router.use(authenticateUser);

router.get("/users/:userId/recipes", getAllRecipes)

router.get("/users/:userId/recipes/:recipeId", getRecipes);

router.post("/users/:userId/recipes", upload.single("image"), postRecipes);

router.patch("/users/:userId/recipes/:recipeId",patchRecipes );

router.put("/users/:userId/recipes/:recipeId", putRecipes);

router.delete("/users/:userId/recipes/:recipeId",deleteRecipes);

module.exports = router;
