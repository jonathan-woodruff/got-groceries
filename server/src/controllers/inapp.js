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
            await db.query(`INSERT INTO ingredients (name, quantity, category, meal_id) VALUES ($1, $2, $3, $4)`, [value.name, value.quantity, value.category, nextMealId]);
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
        const { rows } = await db.query(`SELECT id, name FROM meals WHERE user_id = $1 ORDER BY name`, [id]);
        return res.status(200).json({
            success: true,
            message: 'got meals',
            meals: rows
        });
    } catch(error) {
        console.log(error.message);
    }
};

//delete a meal from the database
exports.deleteMeal = async (req, res) => {
    const mealId = req.params.id;
    //delete from the meals database
    try {
        let q;
        q = await db.query(`DELETE FROM ingredients WHERE meal_id = $1`, [mealId]);
        q = await db.query(`DELETE FROM meals WHERE id = $1`, [mealId]);
        return res.status(200).json({
            success: true,
            message: 'deleted meal'
        });
    } catch(error) {
        console.log(error.message);
    }
};

//get all the ingredients for a specified meal
exports.getMealIngredients = async (req, res) => {
    const mealId = req.params.id;
    try {
        const { rows } = await db.query(`SELECT name, CAST(quantity AS varchar), category FROM ingredients WHERE meal_id = $1`, [mealId]);
        const q = await db.query(`SELECT name FROM meals WHERE id = $1`, [mealId]);
        return res.status(200).json({
            success: true,
            message: 'got meal ingredients',
            ingredients: rows,
            mealName: q.rows[0].name
        });
    } catch(error) {
        console.log(error.message);
    }
};

//update the meal according to the user edits
exports.editMeal = async (req, res) => {
    const { mealId, mealName, values } = req.body;
    let q;
    try {
        q = await db.query(`DELETE FROM ingredients WHERE meal_id = $1`, [mealId]);
        values.forEach(async value => {
            await db.query(`INSERT INTO ingredients (name, quantity, category, meal_id) VALUES ($1, $2, $3, $4)`, [value.name, value.quantity, value.category, mealId]);
        });
        q = await db.query(`UPDATE meals SET name = $1 WHERE id = $2`, [mealName, mealId]);
        return res.status(200).json({
            success: true,
            message: 'edited meal'
        });
    } catch(error) {
        console.log(error);
    }
};

//get meals from the database to send back to the client
exports.getIngredients = async (req, res) => {
    let id;
    if (req.user) {
        id = await getUserIdSSO(req);
    } else {
        id = getUserIdAuth(req);
    }
    try {
        const { rows } = await db.query(`SELECT ingredients.id AS ingredientId, ingredients.name AS ingredientName, ingredients.category, meals.id AS mealId FROM meals INNER JOIN ingredients ON meals.id = ingredients.meal_id WHERE meals.user_id = $1 ORDER BY meals.name, ingredients.name`, [id]);
        return res.status(200).json({
            success: true,
            message: 'got meals',
            meals: rows
        });
    } catch(error) {
        console.log(error.message);
    }
};

//save the user's grocery list
exports.createGroceryList = async (req, res) => {
    const ingredientsList = req.body.ingredientsList;
    const flaggedIngredientIds = [];
    const flaggedMealIds = [];
    ingredientsList.forEach(ingredient => {
        if (ingredient.checked) {
            flaggedIngredientIds.push(ingredient.ingredientid);
            flaggedMealIds.push(ingredient.mealid);
        }
    });
    try {
        //update all flags to false.
        await db.query('UPDATE meals SET in_grocery_list = false');
        await db.query('UPDATE ingredients SET in_grocery_list = false');
        await db.query(`UPDATE meals SET in_grocery_list = true WHERE id = ANY($1)`, [flaggedMealIds]);
        await db.query(`UPDATE ingredients SET in_grocery_list = true WHERE id = ANY($1)`, [flaggedIngredientIds]);
        return res.json({
            success: true,
            message: 'Created grocery list'
        });
    } catch(error) {
        console.log(error.message);
        res.status(500).json({
            error: error.message
        });
    }
};

//get the user's grocery list
exports.getGroceryList = async (req, res) => {
    let id;
    if (req.user) {
        id = await getUserIdSSO(req);
    } else {
        id = getUserIdAuth(req);
    }
    try {
        const { rows } = await db.query(`SELECT ingredients.id, ingredients.name, ingredients.quantity, ingredients.category, ingredients.added_to_cart AS incart FROM meals INNER JOIN ingredients ON meals.id = ingredients.meal_id WHERE meals.user_id = $1 AND ingredients.in_grocery_list = true`, [id]);
        return res.status(200).json({
            success: true,
            message: 'got meals',
            list: rows
        });
    } catch(error) {
        console.log(error.message);
    }
};

//update the grocery cart
exports.updateCart = async (req, res) => {
    const groceryList = req.body.list;
    const flaggedIngredientIds = [];
    groceryList.forEach(category => {
        category.items.forEach(item => {
            if (item.incart) {
                flaggedIngredientIds.push(item.id);
                if (item.otherIds.length) {
                    item.otherIds.forEach(itemId => flaggedIngredientIds.push(itemId));
                }
            }
        })
    });
    try {
        await db.query('UPDATE ingredients SET added_to_cart = false'); //update all flags to false.
        await db.query(`UPDATE ingredients SET added_to_cart = true WHERE id = ANY($1)`, [flaggedIngredientIds]);
        return res.json({
            success: true,
            message: 'Updated grocery cart'
        });
    } catch(error) {
        console.log(error.message);
        res.status(500).json({
            error: error.message
        });
    }
};