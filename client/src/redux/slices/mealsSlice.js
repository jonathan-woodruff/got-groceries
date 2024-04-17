/* meals state handling */

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    selectedMealsList: []
};

export const mealsSlice = createSlice({
    name: 'meals',
    initialState,
    reducers: {
        addMeal: (state, action) => {
            const meal = action.payload.meal;
            state.selectedMealsList.push(meal);
        },
        removeMeal: (state, action) => {
            const meal = action.payload.meal;
            const index = state.selectedMealsList.findIndex(mealObj => {
                return mealObj === meal;
            });
            if (index !== -1) state.selectedMealsList.splice(index, 1);
        }
    }
});

export const { addMeal, removeMeal } = mealsSlice.actions;

export default mealsSlice.reducer;