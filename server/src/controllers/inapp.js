/* in-app middlewares to run upon the server getting requests */

const db = require('../db');
const { SECRET } = require('../constants/index');
const { verify } = require('jsonwebtoken');
const { cookieExtractor } = require('../utils/index');

const getUserIdAuth = req => {
    const token = cookieExtractor(req);
    const decoded = verify(token, SECRET); //pull user data from the cookie
    return decoded.id
};

const getUserIdSSO = async req => {
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

//user clicked the button to create a new meal
exports.createMeal = async (req, res) => {
    let id;
    if (req.user) {
        id = await getUserIdSSO(req);
    } else {
        id = getUserIdAuth(req);
    }
    const { mealName, values } = req.body;
    try {
        const { rows } = await db.query(`SELECT MAX(id) FROM meals`);
        let nextMealId;
        if (rows[0]) {
            nextMealId = Number(rows[0].max) + 1;
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

//get meals from the database to send back to the client
exports.getMeals = async (req, res) => {
    let id;
    if (req.user) {
        id = await getUserIdSSO(req);
    } else {
        id = getUserIdAuth(req);
    }
    try {
        const { rows } = await db.query(`SELECT name FROM meals WHERE user_id = $1 ORDER BY name`, [id]);
        return res.status(200).json({
            success: true,
            message: 'got meals',
            meals: rows
        });
    } catch(error) {
        console.log(error.message);
    }
};
