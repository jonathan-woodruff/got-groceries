const passport = require('passport');
const { CLIENT_URL } = require('../constants/index');

exports.ssoAuthCallback = passport.authenticate('google', {
    scope: ['profile', 'email'],
    successRedirect: `${CLIENT_URL}/list`,
    failureRedirect: '/auth/login/failed'
}); 