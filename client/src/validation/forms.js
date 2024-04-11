/* forms validation */

export const createMealValidation = (mealName, values) => {
    if (!mealName) return 'Please enter a meal name';
    if (values.findIndex((row) => row.ingredient) === -1) return 'Please enter at least one ingredient';
    return 'valid';
}