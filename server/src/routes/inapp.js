/* This handles in-app requests from the client */

const { Router } = require('express');
const router = Router();
const { cleanCreateMeal } = require('../cleaners/createMeal');
const { createMeal, getMeals } = require('../controllers/inapp');

router.post('/meals/create-meal', cleanCreateMeal, createMeal);
router.get('/meals', getMeals);

module.exports = router;