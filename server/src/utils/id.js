//check if the user sends a cookie. If so, return the token

const db = require('../db');
const { SECRET } = require('../constants/index');
const { verify } = require('jsonwebtoken');
const { cookieExtractor } = require('./index');


exports.getUserIdAuth = req => {
    const token = cookieExtractor(req);
    const decoded = verify(token, SECRET); //pull user data from the cookie
    return decoded.id
};

exports.getUserIdSSO = async req => {
    const email = req.user.emails[0].value;
    try {
        const { rows } = await db.query(`SELECT user_id FROM users WHERE email = $1`, [email]);
        return rows[0].user_id; //id
    } catch(error) {
        console.log(error.message);
        res.status(500).json({
            error: error.message
        });
    }
};

