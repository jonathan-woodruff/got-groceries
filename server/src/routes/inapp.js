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
    getIngredients 
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

module.exports = router;