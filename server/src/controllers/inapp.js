/* in-app middlewares to run upon the server getting requests */

const db = require('../db');
const { getUserIdAuth, getUserIdSSO } = require('../utils/id');

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
        await db.query(`INSERT INTO meals (id, name, user_id, in_grocery_list, selected) VALUES ($1, $2, $3, false, false)`, [nextMealId, mealName, id]);
        values.forEach(async value => {
            await db.query(`INSERT INTO ingredients (name, quantity, category, meal_id, in_grocery_list, added_to_cart) VALUES ($1, $2, $3, $4, false, false)`, [value.name, value.quantity, value.category, nextMealId]);
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
    let q1;
    try {
        q1 = await db.query(`SELECT id, name FROM meals WHERE user_id = $1 AND meals.selected = false ORDER BY name`, [id]);
        q2 = await db.query(`SELECT id, name FROM meals WHERE user_id = $1 AND meals.selected = true ORDER BY name`, [id]);
        return res.status(200).json({
            success: true,
            message: 'got meals',
            mealOptions: q1.rows,
            selectedMeals: q2.rows
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
    let id;
    if (req.user) {
        id = await getUserIdSSO(req);
    } else {
        id = getUserIdAuth(req);
    }
    const mealId = req.params.id;
    try {
        const { rows } = await db.query(`SELECT ingredients.name, CAST(ingredients.quantity AS varchar), ingredients.category, ingredients.in_grocery_list AS inlist, ingredients.added_to_cart AS incart, meals.name AS mealname FROM meals INNER JOIN ingredients ON meals.id = ingredients.meal_id WHERE meals.id = $1 AND meals.user_id = $2`, [mealId, id]);
        if (!rows.length) {
            return res.status(401).json({
                success: false,
                message: 'not authorized'
            })
        }
        return res.status(200).json({
            success: true,
            message: 'got meal ingredients',
            ingredients: rows,
            mealName: rows[0].mealname
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
            await db.query(`INSERT INTO ingredients (name, quantity, category, meal_id, in_grocery_list, added_to_cart) VALUES ($1, $2, $3, $4, $5, $6)`, [value.name, value.quantity, value.category, mealId, value.inlist, value.incart]);
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
        const { rows } = await db.query(`SELECT ingredients.id AS ingredientId, ingredients.name AS ingredientName, ingredients.category, ingredients.in_grocery_list AS inlist, meals.id AS mealId, meals.name AS mealname FROM meals INNER JOIN ingredients ON meals.id = ingredients.meal_id WHERE meals.user_id = $1 AND meals.selected = true ORDER BY meals.name, ingredients.name`, [id]);
        return res.status(200).json({
            success: true,
            message: 'got ingredients',
            ingredients: rows
        });
    } catch(error) {
        console.log(error.message);
    }
};

//save the user's grocery list
exports.createGroceryList = async (req, res) => {
    let id;
    if (req.user) {
        id = await getUserIdSSO(req);
    } else {
        id = getUserIdAuth(req);
    }
    const ingredientsList = req.body.ingredientsList;
    const flaggedIngredientIds = [];
    const flaggedMealIds = [];
    ingredientsList.forEach(meal => {
        meal.ingredients.forEach(ingredient => {
            if (ingredient.inlist) {
                flaggedIngredientIds.push(ingredient.ingredientid);
                flaggedMealIds.push(ingredient.mealid);
            }
        })
    });
    try {
        //update all flags to false.
        await db.query(`UPDATE meals SET in_grocery_list = false`);
        await db.query(`UPDATE ingredients SET in_grocery_list = false`);
        //set flags to true
        await db.query(`UPDATE meals SET in_grocery_list = true WHERE id = ANY($1)`, [flaggedMealIds]);
        await db.query(`UPDATE ingredients SET in_grocery_list = true WHERE id = ANY($1)`, [flaggedIngredientIds]);
        //flag the the user has created a list
        await db.query(`UPDATE users SET created_list = true WHERE user_id = $1`, [id]);
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
        const q1 = await db.query(`SELECT ingredients.id, ingredients.name, ingredients.quantity, ingredients.category, ingredients.added_to_cart AS incart FROM meals INNER JOIN ingredients ON meals.id = ingredients.meal_id WHERE meals.user_id = $1 AND ingredients.in_grocery_list = true`, [id]);
        const q2 = await db.query(`SELECT started_list AS startedlist, created_list AS createdlist FROM users WHERE user_id = $1`, [id]);
        return res.status(200).json({
            success: true,
            message: 'got meals',
            list: q1.rows,
            userData: q2.rows
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

//update which meals are selected
exports.updateSelectedMeals = async (req, res) => {
    const mealData = req.body.meals;
    const flaggedMealIds = [];
    mealData.forEach(meal => {
        flaggedMealIds.push(meal.id);
    });
    try {
        await db.query(`UPDATE meals SET selected = false`);
        await db.query(`UPDATE meals SET selected = true WHERE id = ANY($1)`, [flaggedMealIds]);
        return res.json({
            success: true,
            message: 'Updated selected meals'
        });
    } catch(error) {
        console.log(error.message);
        res.status(500).json({
            error: error.message
        });
    }
};

//reset database flags to start a new grocery list
exports.refreshList = async (req, res) => {
    let id;
    if (req.user) {
        id = await getUserIdSSO(req);
    } else {
        id = getUserIdAuth(req);
    }
    try {
        //reset flags
        await db.query(`UPDATE meals SET in_grocery_list = false, selected = false WHERE user_id = $1`, [id]);
        await db.query(`UPDATE ingredients SET added_to_cart = false, in_grocery_list = false FROM meals WHERE meals.user_id = $1 AND meals.id = ingredients.meal_id`, [id]);
        //indicate the user started a list
        await db.query(`UPDATE users SET started_list = true, created_list = false WHERE user_id = $1`, [id]);
        return res.json({
            success: true,
            message: 'refreshed list'
        });
    } catch(error) {
        console.log(error.message);
        res.status(500).json({
            error: error.message
        });
    }
};
