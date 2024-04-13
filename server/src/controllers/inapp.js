/* in-app middlewares to run upon the server getting requests */

const db = require('../db');
const { SECRET } = require('../constants/index');
const { verify } = require('jsonwebtoken');
const { cookieExtractor } = require('../utils/index');

//user clicked the button to create a new meal
exports.createMeal = async (req, res) => {
    if (req.user) {
        console.log(req.user);
    } else {
        const token = cookieExtractor(req);
        const { id, email } = verify(token, SECRET);
        console.log(email);
    }
    const [mealName, values] = req.body;
    try {
        /*const { rows } = await db.query(`SELECT user_id FROM users WHERE email = $1`, [userEmail]);
        const userId = rows[0].user_id;
        console.log(await db.query(`INSERT INTO meals (name, user_id) OUTPUT Inserted.id VALUES ($1, $2)`, [mealName, userId]));
        *//*values.forEach(value => {
            //await db.query(`INSERT INTO ingredients ()`)
        });
        let q = await db.query(`SELECT * FROM users WHERE email = $1`, [email]);
        if (q.rows.length) { //validators/auth.js already ensured the user doesn't already have an email/password combination, so if the user has an email in the database, that means they previously signed up with sso
            await db.query(`UPDATE users SET password = $1 WHERE email = $2`, [hashedPassword, email]); //user already exists with sso but not with password, so set their password in the database
        } else {
            await db.query(`INSERT INTO users (email, password) VALUES ($1, $2)`, [email, hashedPassword]); //user doesn't exist in the database, so add new record
        }
        q = await db.query(`SELECT * FROM users WHERE email = $1`, [email]);
        const user_id = q.rows[0].user_id;
        const payload = { 
            id: user_id,
            email: email 
        };
        const token = await sign(payload, SECRET, { expiresIn: 60 * 60 * 24 }); //create jwt token
        return res.status(201).cookie('token', token, { httpOnly: true, secure: true }).json({ //create cookie
            success: true,
            message: 'The registration was successful',
            userEmail: email
        });*/
    } catch(error) {
        console.log(error.message);
        res.status(500).json({
            error: error.message
        });
    }
};