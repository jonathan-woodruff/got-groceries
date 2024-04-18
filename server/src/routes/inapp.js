/* This handles in-app requests from the client */

const { Router } = require('express');
const router = Router();
const { cleanCreateMeal } = require('../cleaners/createMeal');
const { 
    createMeal, 
    getMeals, 
    deleteMeal, 
    getMealIngredients, 
    editMeal, 
    getIngredients,
    createGroceryList,
    getGroceryList,
    updateCart,
    updateSelectedMeals,
    refreshList
} = require('../controllers/inapp');
const { createMealValidation, editMealValidation } = require('../validators/inapp');
const { validationMiddleware } = require('../middlewares/validation-middleware');

router.post('/meals/create-meal', createMealValidation, validationMiddleware, cleanCreateMeal, createMeal);
router.get('/meals', getMeals);
router.delete('/meals/manage-meals/:id', deleteMeal);
router.get('/meals/edit-meal/:id', getMealIngredients);
router.put('/meals/edit-meal', editMealValidation, validationMiddleware, cleanCreateMeal, editMeal);
router.put('/meals/edit-meal/unchanged', cleanCreateMeal, editMeal);
router.get('/ingredients', getIngredients);
router.put('/ingredients', createGroceryList);
router.get('/list', getGroceryList);
router.put('/list', updateCart);
router.put('/meals', updateSelectedMeals);
router.put('/list/fresh', refreshList);

module.exports = router;