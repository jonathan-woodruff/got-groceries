/* in-app middlewares to run upon the server getting requests */

const db = require('../db');
const { SECRET } = require('../constants/index');
const { verify } = require('jsonwebtoken');
const { cookieExtractor } = require('../utils/index');

//user clicked the button to create a new meal
exports.createMeal = async (req, res) => {
    let id, email;
    if (req.user) { //sso
        id = null;
        email = req.user.emails[0].value;
    } else { //email/password auth
        const token = cookieExtractor(req);
        const decoded = verify(token, SECRET); //pull user data from the cookie
        id = decoded.id;
        email = decoded.email;
    }
    const [mealName, values] = req.body;
    try {
        let q;
        if (!id) {
            q = await db.query(`SELECT user_id FROM users WHERE email = $1`, [email]);
            id = q.rows[0].user_id;
        }
        q = await db.query(`SELECT MAX(id) FROM meals GROUP BY id`);
        let nextMealId;
        if (q.rows[0]) {
            nextMealId = Number(q.rows[0].max) + 1;
        } else {
            nextMealId = 1;
        }
        await db.query(`INSERT INTO meals (id, name, user_id) VALUES ($1, $2, $3)`, [nextMealId, mealName, id]);
        values.forEach(async value => {
            await db.query(`INSERT INTO ingredients (name, quantity, category, meal_id) VALUES ($1, $2, $3, $4)`, [value.ingredient, value.ingredientQuantity, value.ingredientCategory, nextMealId]);
        });
        return res.json({
            success: true,
            message: 'Meal creation was successful'
        });
    } catch(error) {
        console.log(error.message);
        res.status(500).json({
            error: error.message
        });
    }
};