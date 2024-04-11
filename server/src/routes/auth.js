/* This handles auth requests from the client */

const { Router } = require('express');
const router = Router();
const { getUsers, register, login, protected, logout, loginFailed, loginSuccess } = require('../controllers/auth');
const { registerValidation, loginValidation } = require('../validators/auth');
const { validationMiddleware } = require('../middlewares/validation-middleware');
const { userAuth } = require('../middlewares/auth-middleware');
const { ssoAuth } = require('../middlewares/sso-auth-middleware');
const { ssoAuthCallback } = require('../middlewares/sso-auth-callback');


router.get('/get-users', getUsers);
router.get('/protected', userAuth, protected);
router.get('/protected-sso', protected);
router.post('/register', registerValidation, validationMiddleware, register);
router.post('/login', loginValidation, validationMiddleware, login)
router.get('/logout', logout);
router.get('/login/failed', loginFailed);
router.get('/login/success', loginSuccess);
router.get('/google', ssoAuth);
router.get('/google/callback', ssoAuthCallback);

module.exports = router;