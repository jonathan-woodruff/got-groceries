const express = require('express');
const app = express();
const { PORT, CLIENT_URL, COOKIE_KEY } = require('./constants/index');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const cors = require('cors');
const cookieSession = require('cookie-session');

//import passport middleware strategies
require('./middlewares/passport-middleware');
require('./middlewares/googleSSO-middleware');

//initialize middlewares
app.use(express.json()); //enables you to parse requests using json payloads
app.use(cookieParser()); //This helps the server parse the cookie and allows you to access the cookie with req.cookies as you do in passport-middleware.js
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(passport.initialize()); //initialize passport which helps to protect routes
app.use(cookieSession({ //for sso. stores the session data on the cookie sent to the client
    name: 'session',
    maxAge: 1000 * 60 * 60 * 24, //1 day
    keys: [COOKIE_KEY]
}));
app.use(passport.session()); //for sso. Helps to modify the user stored in the session into a user object

//import routes
const authRoutes = require('./routes/auth');
const inappRoutes = require('./routes/inapp')

//initialize routes
app.use('/auth', authRoutes);
app.use('/inapp', inappRoutes);

//app start
const appStart = () => {
    try {
        app.listen(PORT, () => {
            console.log(`The app is running at http://localhost:${PORT} `)
        })
    } catch(error) {
        console.log(`Error: ${error.message}`)
    }
};

appStart();