/* This handles in-app requests from the client */

const { Router } = require('express');
const router = Router();
const { cleanCreateMeal } = require('../cleaners/createMeal');
const { createMeal } = require('../controllers/inapp');
//const { getUsers, register, login, protected, logout, loginFailed, loginSuccess } = require('../controllers/auth');
//const { registerValidation, loginValidation } = require('../validators/auth');
//const { validationMiddleware } = require('../middlewares/validation-middleware');


router.post('/meals/create-meal', cleanCreateMeal, createMeal);

module.exports = router;