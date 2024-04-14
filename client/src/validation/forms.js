/* forms validation */

export const createMealValidation = (mealName, values) => {
    if (!mealName) return 'meal name';
    if (values.findIndex((row) => row.ingredient) === -1) return 'ingredient';
    return 'valid';
}