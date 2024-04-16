/* This cleans the user input from the create meal page so the inputs are ready to be posted to the database */

exports.cleanCreateMeal = async (req, res, next) => {
    const { mealName, values } = req.body;
    const cleanedValues = values.filter(value => value.name); //remove values where the user didn't enter anything into the ingredient/name field
    req.body = {
        mealName: mealName,
        values: cleanedValues
    };
    next();
};