/* forms validation */

export const createMealValidation = (mealName, values) => {
    if (!mealName) return ['meal name', null]; //empty meal name
    if (values.findIndex((row) => row.name) === -1) return ['ingredient', null]; //no ingredients filled out
    //check if any ingredient names are duplicate
    const duplicatesArray = [];
    let foundIndex = false;
    const valuesCopy = [...values];
    let nextValue, i, returnIndex;
    while (!foundIndex && valuesCopy.length) {
        nextValue = valuesCopy.pop();
        i = duplicatesArray.findIndex(ingredientName => ingredientName && ingredientName.toLowerCase() === nextValue.name.toLowerCase());
        if (i !== -1) {
            foundIndex = true;
            returnIndex = valuesCopy.length;
        }
        duplicatesArray.push(nextValue.name);
    }
    if (foundIndex) return ['ingredient index', returnIndex]
    return ['valid', null];
}