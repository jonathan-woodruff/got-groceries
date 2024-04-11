/* This handles in-app requests from the client */

const { Router } = require('express');
const router = Router();
//const { getUsers, register, login, protected, logout, loginFailed, loginSuccess } = require('../controllers/auth');
//const { registerValidation, loginValidation } = require('../validators/auth');
//const { validationMiddleware } = require('../middlewares/validation-middleware');


router.post('/meals/create-meal');

module.exports = router;