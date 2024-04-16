/* This handles in-app requests from the client */

const { Router } = require('express');
const router = Router();
const { cleanCreateMeal } = require('../cleaners/createMeal');
const { createMeal, getMeals, deleteMeal, getMealIngredients, editMeal } = require('../controllers/inapp');
const { createMealValidation } = require('../validators/inapp');
const { validationMiddleware } = require('../middlewares/validation-middleware');

router.post('/meals/create-meal', createMealValidation, validationMiddleware, cleanCreateMeal, createMeal);
router.get('/meals', getMeals);
router.delete('/meals/manage-meals/:id', deleteMeal);
router.get('/meals/edit-meal/:id', getMealIngredients);
router.put('/meals/edit-meal', editMeal);

module.exports = router;