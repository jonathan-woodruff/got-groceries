/* validate user inputs */

const db = require('../db');
const { check } = require('express-validator');

//check if the user already created a meal with the specified name
const checkMealNameDuplicate = check('mealName').custom(async (value) => {
    const { rows } = await db.query(`SELECT name FROM meals WHERE LOWER(name) = LOWER($1)`, [value])

    if (rows.length) {
        throw new Error(`You already created a meal named ${value}`);
    }
});

module.exports = {
    createMealValidation: [checkMealNameDuplicate]
};