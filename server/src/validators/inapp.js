/* validate user inputs */

const db = require('../db');
const { check } = require('express-validator');
const { getUserIdAuth, getUserIdSSO } = require('../utils/id');

let isSSO = false;
let userId;

const determineSSO = (req, res, next) => {
    if (req.user) isSSO = true;
    next();
};

const assignUserId = async (req, res, next) => {
    if (isSSO) {
        userId = await getUserIdSSO(req);
    } else {
        userId = getUserIdAuth(req);
    }
    next();
};

//check if the user already created a meal with the specified name
const checkMealNameDuplicate = check('mealName').custom(async (value) => {
    const { rows } = await db.query(`SELECT name FROM meals WHERE LOWER(name) = LOWER($1) AND user_id = $2`, [value, userId]);
    if (rows.length) {
        throw new Error(`You already created a meal named ${value}`);
    }
});

const checkEditedName = check('mealName').custom(async (value) => {
    const { rows } = await db.query(`SELECT name FROM meals WHERE LOWER(name) = LOWER($1) AND user_id = $2`, [value, userId]);
    if (rows.length) {
        throw new Error(`You already created a meal named ${value}`);
    }
});

module.exports = {
    createMealValidation: [determineSSO,assignUserId,checkMealNameDuplicate],
    editMealValidation: [checkEditedName]
};